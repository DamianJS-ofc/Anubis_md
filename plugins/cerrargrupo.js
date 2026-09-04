import fs from 'fs'
import path from 'path'

export default {
  name: 'cerrar',
  comando: 'cerrar',
  alias: ['close', 'cerrargrupo'],
  category: 'GROUP',
    description: 'Cierra el grupo',
  async Main(sock, msg, { args, prefix, loadPlugins }){
    const chat = msg.key.remoteJid

    try {
      if (!chat.endsWith('@g.us')) {
        return sock.sendMessage(chat, {
          text: `❌ Este comando solo puede usarse en grupos.`
        }, { quoted: msg })
      }

      await sock.groupSettingUpdate(chat, 'announcement')

      await sock.sendMessage(chat, {
        text: `🔒 *GRUPO CERRADO*\n\nSolo los administradores pueden enviar mensajes.`
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(chat, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}