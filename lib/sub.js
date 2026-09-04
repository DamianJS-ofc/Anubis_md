import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from 'baileys'
import fs from 'fs'
import pino from 'pino'
import NodeCache from 'node-cache'

if(!global.conns) global.conns = []
if(!global.codeCache) global.codeCache = new Set()

const cleanJid = (jid='') => jid.replace(/:\d+/,'').split('@')[0]
const logger = pino({ level:'silent' })

export async function iniciarSubbot({ numero, creadorJid, chatOrigen, sockPrincipal }) {
  const phone = numero.replace(/[^0-9]/g,'')

  if(global.codeCache.has(phone)) {
    return sockPrincipal.sendMessage(chatOrigen, { text: '⏳ Ya hay un código generándose, espera 30s' })
  }
  global.codeCache.add(phone)

  const folder = `./database/subbots/${phone}`
  if(!fs.existsSync('./database/subbots')) fs.mkdirSync('./database/subbots', { recursive:true })

  const { state, saveCreds } = await useMultiFileAuthState(folder)
  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()

  const sock = makeWASocket({
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    version,
    markOnlineOnConnect: true,
    msgRetryCounterCache: msgRetryCache,
    getMessage: async() => undefined
  })

  sock.ev.on('creds.update', saveCreds)

  // ESTO ES LO QUE HACE TU AMIGO Y VOS NO
  if(!state.creds.registered) {
    await new Promise(r => setTimeout(r, 2000))
    try {
      let code = await sock.requestPairingCode(phone)
      code = code.match(/.{1,4}/g)?.join('-') || code
      console.log(`CODE ${phone}: ${code}`)
      await sockPrincipal.sendMessage(chatOrigen, { text: `*${code}*` })
    } catch(e) {
      console.log('pair error', e.message)
      global.codeCache.delete(phone)
      await sockPrincipal.sendMessage(chatOrigen, { text: `❌ Error: ${e.message}\nProbá sin el 9:.code ${phone.replace('549','54')}` })
      try{ fs.rmSync(folder, { recursive:true, force:true }) }catch{}
      return
    }
  }

  sock.ev.on('connection.update', async({ connection, lastDisconnect }) => {
    if(connection === 'open') {
      const uid = cleanJid(sock.user?.id)
      sock.userId = uid
      if(!global.conns.find(c => c.userId === uid)) {
        global.conns.push(sock)
        sock.creador = creadorJid
      }
      console.log(`✨ SUBBOT CONECTADO ${uid}`)
      global.codeCache.delete(phone)
      await sockPrincipal.sendMessage(chatOrigen, { text: `✅ SubBot +${phone} conectado` })
    }
    if(connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(`SubBot ${phone} cerrado: ${reason}`)
      if(reason === 401 || reason === 405) {
        try{ fs.rmSync(folder, { recursive:true, force:true }) }catch{}
      }
      global.codeCache.delete(phone)
    }
  })

  setTimeout(() => global.codeCache.delete(phone), 60000)
  return sock
}

export async function startSubBot(m, sockP, a, b, phone, chatId) {
  return iniciarSubbot({ numero: phone, creadorJid: m?.sender, chatOrigen: chatId, sockPrincipal: sockP })
}
