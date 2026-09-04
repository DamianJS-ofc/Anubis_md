import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore, 
  Browsers,
  DisconnectReason 
} from 'baileys'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import NodeCache from 'node-cache'

const logger = pino({ level: 'silent' })
const subs = new Map()
const firstConnection = new Set()
const reconectando = new Map()
const reconnectTimer = new Map()
const PAIRING_CODE = 'DANONINO'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function cleanNumber(number = "") {
  return String(number).replace(/\D/g, "")
}

function safeEndSocket(sock) {
  try {
    if (sock?.end) sock.end()
  } catch (e) {}
}

function safeRemoveDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true })
    }
  } catch (e) {}
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function patchGroupSendMessage(sock) {
  try {
    const originalSendMessage = sock.sendMessage
    sock.sendMessage = async function(jid, content, options = {}) {
      if (content?.contextInfo) {
        content.contextInfo = {
          ...content.contextInfo,
          forwardingScore: 9999999,
          isForwarded: true
        }
      }
      return originalSendMessage.call(this, jid, content, options)
    }
  } catch (e) {}
}

async function createSubBot(number, ownerNumber, userConfig = {}) {
  const subNumber = cleanNumber(number)
  const sessionPath = path.join(process.cwd(), 'database', 'subbots', subNumber)

  const existingSub = subs.get(subNumber)
  if (existingSub?.sock?.user && !reconectando.get(subNumber)) {
    console.log(`[ SUB-BOT ${subNumber} ] Ya está conectado, omitiendo...`)
    return existingSub.sock
  }

  ensureDirectoryExists(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    connectTimeoutMs: 60000,
    msgRetryCounterCache: msgRetryCache,
    getMessage: async() => undefined
  })

  patchGroupSendMessage(sock)

  reconectando.delete(subNumber)

  if (reconnectTimer.get(subNumber)) {
    clearTimeout(reconnectTimer.get(subNumber))
    reconnectTimer.delete(subNumber)
  }

  subs.set(subNumber, {
    sock,
    ownerNumber,
    config: userConfig
  })

  sock.ev.on('creds.update', async () => {
    try {
      await saveCreds()
    } catch (e) {}

    if (!firstConnection.has(subNumber)) {
      firstConnection.add(subNumber)
      console.log(`[ SUB-BOT ${subNumber} ] Credenciales guardadas`)
    }
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    const statusCode = lastDisconnect?.error?.output?.statusCode || 0

    if (connection === 'open') {
      reconectando.delete(subNumber)

      if (reconnectTimer.get(subNumber)) {
        clearTimeout(reconnectTimer.get(subNumber))
        reconnectTimer.delete(subNumber)
      }

      const uid = cleanNumber(sock.user?.id || '')
      sock.userId = uid
      
      if (!global.conns) global.conns = []
      if (!global.conns.find(c => c.userId === uid)) {
        global.conns.push(sock)
        sock.creador = ownerNumber
      }

      console.log(`✨ SUBBOT CONECTADO ${uid}`)
      return
    }

    if (connection === 'close') {
      if (reconectando.get(subNumber) || reconnectTimer.get(subNumber)) {
        return
      }

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
        console.log(`[ SUB-BOT ${subNumber} ] Sesión inválida o cerrada, eliminando...`)

        const currentSub = subs.get(subNumber)
        safeEndSocket(currentSub?.sock)

        subs.delete(subNumber)
        firstConnection.delete(subNumber)
        reconectando.delete(subNumber)

        if (reconnectTimer.get(subNumber)) {
          clearTimeout(reconnectTimer.get(subNumber))
          reconnectTimer.delete(subNumber)
        }

        safeRemoveDir(sessionPath)

        return
      }

      if (statusCode === DisconnectReason.connectionReplaced || statusCode === 440) {
        console.log(`[ SUB-BOT ${subNumber} ] Conexión reemplazada por otra sesión (${statusCode})`)

        const currentSub = subs.get(subNumber)
        safeEndSocket(currentSub?.sock)

        subs.delete(subNumber)
        reconectando.delete(subNumber)

        return
      }

      reconectando.set(subNumber, true)

      const isRestartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515
      const delay = isRestartRequired ? 1000 : 5000

      if (isRestartRequired) {
        console.log(`[ SUB-BOT ${subNumber} ] Reinicio requerido por WhatsApp (${statusCode})`)
      } else {
        console.log(`[ SUB-BOT ${subNumber} ] Reconectando... (${statusCode})`)
      }

      const timer = setTimeout(async () => {
        try {
          const currentSub = subs.get(subNumber)

          if (currentSub?.sock) {
            safeEndSocket(currentSub.sock)
          }

          subs.delete(subNumber)

          console.log(`[ SUB-BOT ${subNumber} ] Creando nuevo socket...`)
          await createSubBot(subNumber, ownerNumber, userConfig)
        } catch (err) {
          console.log(`[ SUB-BOT ${subNumber} ] Error reconectando: ${err.message}`)
        } finally {
          reconectando.delete(subNumber)
          reconnectTimer.delete(subNumber)
        }
      }, delay)

      reconnectTimer.set(subNumber, timer)
    }
  })

  return sock
}

async function getPairingCode(number, userConfig = {}) {
  const subNumber = cleanNumber(number)

  return new Promise(async (resolve, reject) => {
    let resolved = false
    let codeRequested = false
    let sock = null

    function finish(data, isError = false) {
      if (resolved) return

      resolved = true
      clearTimeout(timeout)

      if (isError) {
        reject(data)
      } else {
        resolve(data)
      }
    }

    const timeout = setTimeout(() => {
      finish({
        status: "expired",
        code: null,
        number: subNumber
      })
    }, 60000)

    async function requestCode() {
      if (resolved || codeRequested || !sock) return

      if (sock.user || sock.authState?.creds?.registered) {
        finish({
          status: "connected",
          code: null,
          number: subNumber
        })
        return
      }

      codeRequested = true

      try {
        await sleep(1500)

        if (resolved) return

        if (sock.user || sock.authState?.creds?.registered) {
          finish({
            status: "connected",
            code: null,
            number: subNumber
          })
          return
        }

        const code = await sock.requestPairingCode(subNumber, PAIRING_CODE)
        const formattedCode = code.match(/.{1,4}/g)?.join("-") || code

        console.log(`[ SUB-BOT ${subNumber} ] Código: ${formattedCode}`)

        finish({
          status: "pending",
          code: formattedCode,
          number: subNumber
        })
      } catch (err) {
        console.log(`[ SUB-BOT ${subNumber} ] Error generando código: ${err.message}`)
        finish(err, true)
      }
    }

    try {
      sock = await createSubBot(subNumber, subNumber, userConfig)

      if (sock.user || sock.authState?.creds?.registered) {
        finish({
          status: "connected",
          code: null,
          number: subNumber
        })
        return
      }

      sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update

        if (resolved) return

        if (connection === "open") {
          finish({
            status: "connected",
            code: null,
            number: subNumber
          })
          return
        }

        if (connection === "connecting" || qr) {
          await requestCode()
        }
      })

      await requestCode()
    } catch (err) {
      console.log(`[ SUB-BOT ${subNumber} ] Error: ${err.message}`)
      finish(err, true)
    }
  })
}

function getSubs() {
  return subs
}

function getSub(number) {
  return subs.get(cleanNumber(number))
}

function getConnectionStatus() {
  const subsArray = Array.from(subs.values())
  const active = subsArray.filter(sub => sub.sock?.user).length

  return {
    total: subs.size,
    active
  }
}

async function removeSub(number) {
  const subNumber = cleanNumber(number)
  const subData = subs.get(subNumber)

  if (subData?.sock) {
    safeEndSocket(subData.sock)
  }

  subs.delete(subNumber)
  firstConnection.delete(subNumber)
  reconectando.delete(subNumber)

  if (reconnectTimer.get(subNumber)) {
    clearTimeout(reconnectTimer.get(subNumber))
    reconnectTimer.delete(subNumber)
  }

  const sessionPath = path.join(process.cwd(), "database", "subbots", subNumber)
  safeRemoveDir(sessionPath)

  console.log(`[ SUB-BOT ${subNumber} ] Eliminado`)
}

export {
  createSubBot,
  getPairingCode,
  getSubs,
  getSub,
  removeSub,
  getConnectionStatus
}