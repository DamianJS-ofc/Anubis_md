import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import path from 'path'
const DB = './database/sticker-cmd.json'

function isOwner(msg, settings){
  const p = (msg.key.participant || msg.key.remoteJid || "").toString()
  const num = p.replace(/[^0-9]/g,'')
  const owners = settings.owner || settings.owners || []
  return owners.some(o => p.includes(o) || num.includes(o.toString().replace(/[^0-9]/g,'')))
}

function getAllCommands(dir){
  let cmds = new Set()
  if(!existsSync(dir)) return cmds
  for(const file of readdirSync(dir)){
    const fp = path.join(dir, file)
    const stat = statSync(fp)
    if(stat.isDirectory()){
      for(const c of getAllCommands(fp)) cmds.add(c)
    } else if(file.endsWith('.js')){
      try{
        const content = readFileSync(fp,'utf8')
        const nameMatch = content.match(/name\s*:\s*['"`]([^'"`]+)['"`]/)
        if(nameMatch) cmds.add(nameMatch[1].toLowerCase())
        const aliasMatch = content.match(/alias\s*:\s*\[([^\]]+)\]/)
        if(aliasMatch){
          const aliases = aliasMatch[1].match(/['"`]([^'"`]+)['"`]/g)
          if(aliases) aliases.forEach(a => cmds.add(a.replace(/['"`]/g,'').toLowerCase()))
        }
      }catch{}
    }
  }
  return cmds
}

export default {
  name: 'addco',
  category: 'Owner',
    description: 'Comando addco',
  async Main(sock, msg, { args, settings }){
    const jid = msg.key.remoteJid
    if(!isOwner(msg, settings)) return sock.sendMessage(jid, {text:'❌ Solo owner'}, {quoted: msg})

    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    if(!quoted?.stickerMessage) return sock.sendMessage(jid, {text:'❌ Responde a un sticker'}, {quoted: msg})

    const cmd = args[0]?.toLowerCase().replace(/^[!.\-#]/,'')
    if(!cmd) return sock.sendMessage(jid, {text:'❌ Pon comando:.addco menu'}, {quoted: msg})

    // VERIFICA LEYENDO ARCHIVOS DIRECTO
    const allCmds = getAllCommands(path.join(process.cwd(), 'plugins'))
    if(!allCmds.has(cmd)){
      return sock.sendMessage(jid, {text:`❌ No existe.${cmd} | Encontrados: ${allCmds.size} cmds`}, {quoted: msg})
    }

    try{
      const dir = path.dirname(DB)
      if(!existsSync(dir)) mkdirSync(dir, { recursive: true })
      if(!existsSync(DB)) writeFileSync(DB,'{}')
      const db = JSON.parse(readFileSync(DB, 'utf8') || '{}')
      let hash = quoted.stickerMessage.fileSha256
      if(Buffer.isBuffer(hash)) hash = hash.toString('base64')
      
      db[hash] = cmd
      writeFileSync(DB, JSON.stringify(db, null, 2))
      await sock.sendMessage(jid, {text:`✅ Guardado sticker ->.${cmd}\nTotal: ${allCmds.size} comandos detectados`}, {quoted: msg})
    }catch(e){
      console.log(e)
      await sock.sendMessage(jid, {text:`❌ Error: ${e.message}`}, {quoted: msg})
    }
  }
}
