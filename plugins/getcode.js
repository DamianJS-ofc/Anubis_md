import fs from 'fs'
import path from 'path'
export default {
  name: 'getcode',
  alias: ['getfile'],
  category: 'Owner',
    description: 'Comando getcode',
  async Main(sock, msg, { args }){
    const jid = msg.key.remoteJid
    if(!args[0]) return sock.sendMessage(jid,{text:'❌ Uso:.getcode <ruta>\nEj:.getcode plugins/menu.js'}, {quoted: msg})
    const filePath = args[0]
    try{
      if(!fs.existsSync(filePath)) return sock.sendMessage(jid,{text:`❌ No existe: ${filePath}`},{quoted:msg})
      const code = fs.readFileSync(filePath,'utf8')
      const name = path.basename(filePath)
      if(code.length < 3500){
        await sock.sendMessage(jid,{text:`📄 ${filePath}\n\n\`\`\`js\n${code}\n\`\`\``},{quoted:msg})
      }
      await sock.sendMessage(jid,{document: Buffer.from(code), mimetype:'text/javascript', fileName: name},{quoted:msg})
    }catch(e){
      sock.sendMessage(jid,{text:`Error: ${e.message}`},{quoted:msg})
    }
  }
}
