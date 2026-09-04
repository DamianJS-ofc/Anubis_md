export default {
  name: 'finddl',
  comando: 'finddl',
  category: 'OWNER',
  async Main(sock, msg) {
    let out = ''
    try {
      const m = await import('baileys')
      out += `baileys keys: ${Object.keys(m).slice(0,30).join(', ')}\n`
      out += `has dl: ${!!m.downloadContentFromMessage}\n`
    } catch(e){ out += `baileys error: ${e.message}\n` }
    try {
      const m2 = await import('baileys/lib/Utils/messages.js')
      out += `messages.js keys: ${Object.keys(m2).slice(0,30).join(', ')}\n`
    } catch(e){ out += `messages error: ${e.message}\n` }
    try {
      const m3 = await import('baileys/lib/Utils/index.js')
      out += `Utils/index keys: ${Object.keys(m3).slice(0,30).join(', ')}\n`
    } catch(e){ out += `Utils/index error: ${e.message}\n` }
    await sock.sendMessage(msg.key.remoteJid, { text: out.slice(0,3000) }, { quoted: msg })
  }
}
