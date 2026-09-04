import fs from 'fs'
import path from 'path'

let lidStore = {}

export function getRealJid(jid) {
  if(!jid) return jid
  const s = String(jid)
  if(!s.endsWith('@lid')) return jid
  return lidStore[s] || jid
}
export function jidToNumber(jid) {
  const real = getRealJid(jid)
  let num = String(real).split('@')[0].split(':')[0].replace(/[^0-9]/g,'')
  if(num.length > 13) num = num.slice(0,13)
  return num
}
export function updateLidStore(meta) {
  if(!meta?.participants) return
  for(const p of meta.participants) {
    if(p.lid && p.id) lidStore[p.lid] = p.id
    if(p.id?.endsWith('@lid') && p.phoneNumber) lidStore[p.id] = p.phoneNumber
  }
}

export async function handleEvents(sock, anu) {
  try {
    const { isActivo } = await import('./lib/activos.js')
    const groupId = anu.id
    if(!isActivo('welcome', groupId) &&!isActivo('bye', groupId)) return
    const metadata = await sock.groupMetadata(groupId).catch(()=>null)
    if(!metadata) return
    updateLidStore(metadata)
    for(let p of anu.participants){
      const pJid = typeof p === 'string'? p : (p.id || p.jid || '')
      if(!pJid) continue
      const realJid = getRealJid(pJid)
      let pp = await sock.profilePictureUrl(realJid, 'image').catch(()=> 'https://raw.githubusercontent.com/JTxs00/uploads/main/1788325272382.jpeg')
      let name = jidToNumber(realJid)
      if(anu.action == 'add' && isActivo('welcome', groupId)){
        await sock.sendMessage(groupId, { image: { url: pp }, caption: `WELCOME @${name}`, mentions: [realJid] })
      }
      if(anu.action == 'remove' && isActivo('bye', groupId)){
        await sock.sendMessage(groupId, { text: `BYE @${name}`, mentions: [realJid] })
      }
    }
  } catch(e){ console.log('eventos error', e.message) }
}

function getBody(msg) {
  return msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || ''
}

function getPlugin(plugins, cmd){
  let plug = plugins instanceof Map? plugins.get(cmd) : plugins[cmd]
  if(!plug) return null
  if(!plug.Main){
    if(plug.execute) plug.Main = plug.execute
    else if(plug.run) plug.Main = plug.run
  }
  return plug
}

export async function handler(sock, msg, plugins, settings, extra={}) {
  try {
    if(msg.key.remoteJid?.endsWith('@g.us')) {
      const meta = await sock.groupMetadata(msg.key.remoteJid).catch(()=>null)
      if(meta) updateLidStore(meta)
    }
    const rawSender = msg.key.participant || msg.key.remoteJid
    const realSender = getRealJid(rawSender)
    const senderNum = jidToNumber(realSender)
    msg.realSender = realSender
    msg.senderNumber = senderNum
    msg.realJid = realSender

    const sticker = msg.message?.stickerMessage
    if(sticker){
      try{
        const DB_PATH = './database/sticker-cmd.json'
        if(fs.existsSync(DB_PATH)){
          const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '{}')
          let hash = sticker.fileSha256
          if(Buffer.isBuffer(hash)) hash = hash.toString('base64')
          const cmd = db[hash]
          if(cmd){
            const plug = getPlugin(plugins, cmd)
            if(plug?.Main){
              console.log(`🎯 Sticker -> ${cmd}`)
              await plug.Main(sock, msg, { args: [], prefix: '.', command: cmd, settings, lidStore,...extra, getRealJid, jidToNumber, plugins })
              return
            }
          }
        }
      }catch(e){ console.log('sticker error', e.message) }
    }

    const body = getBody(msg)
    if(!body) return
    const prefixes = settings.prefixes || settings.prefix || ['!','.','#','-']
    const prefix = prefixes.find(p => body.startsWith(p))
    if(!prefix) return
    const args = body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()
    if(!command) return

    const plugin = getPlugin(plugins, command)
    if(!plugin?.Main) return
    await plugin.Main(sock, msg, { args, prefix, command, settings, lidStore,...extra, getRealJid, jidToNumber, plugins })
  } catch(e){ console.log('handler error', e) }
}