import { exec } from 'child_process'
import util from 'util'
const execAsync = util.promisify(exec)

function isOwner(msg, settings){
  const p=(msg.key.participant||msg.key.remoteJid||"").toString()
  const num=p.replace(/[^0-9]/g,'')
  const owners=settings.owner||settings.owners||[]
  return owners.some(o=>p.includes(o)||num.includes(o.toString().replace(/[^0-9]/g,'')))
}

function getText(msg){
  return msg.message?.extendedTextMessage?.text 
      || msg.message?.conversation 
      || msg.message?.imageMessage?.caption
      || ""
}

export default {
  name: 'r',
  alias: ['$','exec','>'],
  category: 'Owner',
  description: 'Ejecuta comandos en la consola',
  async Main(sock, msg, { settings, args }){
    const jid = msg.key.remoteJid
    if(!isOwner(msg, settings)) return

    let text = getText(msg)
    // quita .r , $ , > , .exec del inicio
    let cmd = text.replace(/^\s*[.$>!#]?\s*(r|exec)\s*/i, '').trim()
    if(!cmd) cmd = (args||[]).join(' ').trim()

    if(!cmd){
      return await sock.sendMessage(jid, { text: `*Uso:* .r <comando>\n\nEjemplo:\n.r ls plugins\n.r cat plugins/menu.js` }, { quoted: msg })
    }

    try{
      const { stdout, stderr } = await execAsync(cmd, { timeout: 20000, maxBuffer: 1024*1024*5 })
      let out = (stdout + '\n' + stderr).trim().slice(0, 3800)
      if(!out) out = '✅ Sin salida'
      await sock.sendMessage(jid, { text: `\`\`\`bash\n${out}\n\`\`\`` }, { quoted: msg })
    }catch(e){
      const out = (e.stdout || '') + '\n' + (e.stderr || e.message)
      await sock.sendMessage(jid, { text: `❌ Error:\n\`\`\`bash\n${out.slice(0,3800)}\n\`\`\`` }, { quoted: msg })
    }
  }
}