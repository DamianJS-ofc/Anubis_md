import { readFileSync, writeFileSync, existsSync } from 'fs'
const DB = './database/sticker-cmd.json'
function isOwner(msg, settings){
  const p = (msg.key.participant || msg.key.remoteJid || "").toString()
  const num = p.replace(/[^0-9]/g,'')
  return settings.owner.some(o => p.includes(o) || num.includes(o.toString().replace(/[^0-9]/g,'')))
}
export default {
  name: 'delco',
  category: 'Owner',
    description: 'Comando delco',
  async Main(sock, msg, { settings }){
    const jid = msg.key.remoteJid
    if(!isOwner(msg, settings)) return sock.sendMessage(jid, {text:'❌ Solo owner'}, {quoted: msg})

    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    if(!quoted?.stickerMessage) return sock.sendMessage(jid, {text:'❌ Responde al sticker que quieres borrar'}, {quoted: msg})

    const hash = quoted.stickerMessage.fileSha256?.toString('base64')
    if(!existsSync(DB)) writeFileSync(DB,'{}')
    const db = JSON.parse(readFileSync(DB))

    if(!db[hash]) return sock.sendMessage(jid, {text:'❌ Ese sticker no tiene comando guardado'}, {quoted: msg})

    const cmd = db[hash]
    delete db[hash]
    writeFileSync(DB, JSON.stringify(db, null, 2))
    await sock.sendMessage(jid, {text:`✅ Borrado\nSticker que ejecutaba:.${cmd}`}, {quoted: msg})
  }
}
