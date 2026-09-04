import fs from 'fs'
import path from 'path'

async function run(sock, msg, { args, prefix }) {
  const chat = msg.key.remoteJid
  const ruta = args.join(' ').trim()
  if (!ruta) return sock.sendMessage(chat, { text: `Uso: ${prefix}savefile plugins/archivo.js` }, { quoted: msg })

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quoted) return sock.sendMessage(chat, { text: `❌ Responde a un codigo o archivo` }, { quoted: msg })

  try {
    const filePath = path.join(process.cwd(), ruta)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

    let codigo = ''
    if (quoted.documentMessage || quoted.documentWithCaptionMessage) {
      const { downloadMediaMessage } = await import('baileys/lib/Utils/messages.js')
      const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: { level: 'silent' }, reuploadRequest: sock.updateMediaMessage })
      codigo = buffer.toString('utf-8')
    } else {
      codigo = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || ''
      codigo = codigo.replace(/^```(js|javascript)?\n?/i,'').replace(/```$/,'').trim()
    }

    if (!codigo) return sock.sendMessage(chat, { text: `❌ Vacio` }, { quoted: msg })
    
    fs.writeFileSync(filePath, codigo, 'utf8')
    const check = fs.readFileSync(filePath, 'utf8')

    await sock.sendMessage(chat, { text: `✅ GUARDADO\n📁 ${ruta}\n📏 ${check.length} bytes\n\n${check.slice(0,300)}` }, { quoted: msg })
  } catch (e) {
    console.log(e)
    await sock.sendMessage(msg.key.remoteJid, { text: `❌ ${e.message}` }, { quoted: msg })
  }
}

export default {
  name: 'savefile',
  comando: 'savefile',
  alias: ['svfile', 'guardar', 'save'],
  category: 'Owner',
  description: 'Guarda archivo',
  Main: run,
  execute: run
}
