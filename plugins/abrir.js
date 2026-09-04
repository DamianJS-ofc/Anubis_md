export default {
  name: 'abrir',
  comando: 'abrir',
  alias: ['open', 'abrirgrupo'],
  category: 'GROUP',
    description: 'Abre el grupo',

  async Main(sock, msg, { args, prefix, loadPlugins }) {
    const chat = msg.key.remoteJid

    if (!chat.endsWith('@g.us')) {
      return sock.sendMessage(chat, {
        text: `❌ Este comando solo puede usarse en grupos.`
      }, { quoted: msg })
    }

    try {
      await sock.groupSettingUpdate(chat, 'not_announcement')

      await sock.sendMessage(chat, {
        text: `🔓 *GRUPO ABIERTO*\n\n✨ Vanny ha abierto nuevamente el grupo.\n\n💬 Todos los miembros pueden enviar mensajes.`
      }, { quoted: msg })

    } catch (e) {
      console.error('ANUBIS ABRIR ERROR:', e)

      await sock.sendMessage(chat, {
        text: `❌ *NO SE PUDO ABRIR EL GRUPO*\n\nAsegúrate de que ANUBIS tenga permisos de administrador.`
      }, { quoted: msg })
    }
  }
}