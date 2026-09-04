export default {
    name: 'ping',
    alias: ['p','speed'],
    category: 'Info',
    description: 'Velocidad del bot',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
        const start = Date.now()
        let m = await sock.sendMessage(jid, { text: '🏓 Pong' }, { quoted: msg })
        const ping = Date.now() - start
        await sock.sendMessage(jid, { text: `🏓 Pong\n\n✅ Ping: ${ping} ms`, edit: m.key })
    }
}
