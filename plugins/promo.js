export default {
  name: 'promo',
  comando: 'promo',
  alias: ['promote1', 'promocion', 'canal'],
  category: 'GENERAL',
    description: 'Comando promo',
  async Main(sock, msg, { args, prefix, loadPlugins }){
    const chat = msg.key.remoteJid

    const texto = `
╭━━━〔 🔥 ANUBIS 〕━━━╮
┃
┃  ✦ ¡ÚNETE A NUESTRA
┃    COMUNIDAD OFICIAL! ✦
┃
┃  🤖 Bot: ANUBIS
┃  💬 Comunidad: WhatsApp
 |
┃
┃  ✨ Encuentra:
┃  › Actualizaciones del bot
┃  › Nuevos comandos
┃  › Dinámicas y eventos
┃  › Soporte y novedades
┃  › Comunidad activa
┃
┃  🔗 *WhatsApp:*
┃  https://whatsapp.com/channel/0029Vb7vqNDCsU9MnOn8UN0U
┃
┃ 
┃ 
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`

    try {
      await sock.sendMessage(chat, {
        text: texto
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(chat, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}