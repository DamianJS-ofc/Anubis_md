import { readFileSync, existsSync, writeFileSync } from 'fs'
const DB = './database/sticker-cmd.json'
function isOwner(msg, settings){
  const p = (msg.key.participant || msg.key.remoteJid || "").toString()
  const num = p.replace(/[^0-9]/g,'')
  return settings.owner.some(o => p.includes(o) || num.includes(o.toString().replace(/[^0-9]/g,'')))
}
export default {
  name: 'listco',
  category: 'Owner',
    description: 'Comando listco',
  async Main(sock, msg, { settings }){
    const jid = msg.key.remoteJid
    if(!isOwner(msg, settings)) return
    if(!existsSync(DB)) writeFileSync(DB,'{}')
    const db = JSON.parse(readFileSync(DB))
    const total = Object.keys(db).length
    if(!total) return sock.sendMessage(jid, {text:'📭 No hay sticker commands'}, {quoted: msg})
    let txt = `*🔥 LISTA STICKER CMD: ${total}*\n\n`
    for(const cmd of Object.values(db)){
      txt += `🎮.${cmd}\n`
    }
    await sock.sendMessage(jid, {text: txt}, {quoted: msg})
  }
}
