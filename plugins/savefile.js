import fs from 'fs'
import path from 'path'

export default {
  name: 'savefile',
  comando: 'savefile',
  alias: ['svfile', 'guardar', 'save'],
  category: 'OWNER',
    description: 'Comando savefile',
  async Main(sock, msg, { args, prefix, loadPlugins }){
    const chat = msg.key.remoteJid
    const texto = args.join(' ').trim()
    
    if (!texto) {
      return sock.sendMessage(chat, { 
        text: `📝 *ANUBIS SAVEFILE*\n\nUso: ${prefix}savefile <ruta>\n\nEjemplo:\n${prefix}savefile plugins/ping.js\n\nResponde al mensaje con el código`
      }, { quoted: msg })
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) {
      return sock.sendMessage(chat, { 
        text: `❌ ANUBIS: Responde al mensaje que contiene el código.`
      }, { quoted: msg })
    }

    let codigo = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || ''
    // Limpia los ```js ``` si viene con bloque
    codigo = codigo.replace(/^```(js|javascript)?\n?/i,'').replace(/```$/,'').trim()

    if (!codigo) {
      return sock.sendMessage(chat, { 
        text: `❌ No hay código en el mensaje citado.`
      }, { quoted: msg })
    }

    const filePath = path.join(process.cwd(), texto)

    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, codigo)
      
      // recarga automatica en tu index
      try{ await loadPlugins() }catch{}

      await sock.sendMessage(chat, { 
        text: `✅ *ANUBIS GUARDADO*\n\n📁 ${texto}\n♻️ Auto-recargado`
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(chat, { text: `❌ Error: ${e.message}` }, { quoted: msg })
    }
  }
}
