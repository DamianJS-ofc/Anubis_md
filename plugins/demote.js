export default {
  name: 'demote',
  comando: 'demote',
  alias: ['quitaradmin', 'removeradmin', 'deladmin'],
  category: 'GROUP',
    description: 'Quita admin a usuario',

  async Main(sock, msg, { args, prefix, loadPlugins }) {
    const chat = msg.key.remoteJid

    if (!chat.endsWith('@g.us')) {
      return sock.sendMessage(chat, {
        text: `❌ Este comando solo puede usarse en grupos.`
      }, { quoted: msg })
    }

    try {
      const context = msg.message?.extendedTextMessage?.contextInfo
      const mentioned = context?.mentionedJid || []

      if (!mentioned.length) {
        return sock.sendMessage(chat, {
          text: `👤 *ANUBIS DEMOTE*\n\nUso:\n${prefix}demote @usuario\n\nEjemplo:\n${prefix}demote @Alex`
        }, { quoted: msg })
      }

      const target = mentioned[0]

      const metadata = await sock.groupMetadata(chat)

      const participante = metadata.participants.find(
        p => p.id === target || p.jid === target
      )

      if (!participante) {
        return sock.sendMessage(chat, {
          text: `❌ No pude encontrar a ese usuario dentro del grupo.`
        }, { quoted: msg })
      }

      if (!participante.admin) {
        return sock.sendMessage(chat, {
          text: `⚠️ Ese usuario no es administrador/a del grupo.`
        }, { quoted: msg })
      }

      if (participante.admin === 'superadmin') {
        return sock.sendMessage(chat, {
          text: `👑 No se puede quitar el administrador al creador del grupo.`
        }, { quoted: msg })
      }

      await sock.groupParticipantsUpdate(
        chat,
        [target],
        'demote'
      )

      const nombre =
        args.filter(x => !x.startsWith('@')).join(' ').trim() || 'el usuario'

      await sock.sendMessage(chat, {
        text: `⚠️ *ADMINISTRADOR/A REMOVIDO/A*\n\n🔻 Vanny ha quitado a ${nombre} como administrador/a del grupo.`
      }, { quoted: msg })

    } catch (e) {
      console.error('ANUBIS DEMOTE ERROR:', e)

      await sock.sendMessage(chat, {
        text: `❌ *NO SE PUDO REALIZAR LA ACCIÓN*\n\nWhatsApp rechazó la solicitud.\n\nAsegúrate de que ANUBIS tenga permisos de administrador y que el usuario mencionado siga siendo administrador.`
      }, { quoted: msg })
    }
  }
}