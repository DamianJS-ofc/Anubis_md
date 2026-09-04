import fs from 'fs'
export default {
    name: 'premium',
    alias: ['mipremium','isprem'],
    category: 'General',
    description: 'Comando premium',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
        const sender = msg.key.participant || jid
        let db = []
        try{ db = JSON.parse(fs.readFileSync('./database/premium.json')) }catch{}
        const user = db.find(x=>x.jid===sender || x.id===sender.split('@')[0])
        if(!user){
            return sock.sendMessage(jid, { text: '❌ No eres premium.\nConsigue un token y usa.codepremium TOKEN' }, { quoted: msg })
        }
        const dias = Math.ceil((user.expires - Date.now()) / (1000*60*60*24))
        await sock.sendMessage(jid, { text: `✅ *ERES PREMIUM*\n\n⏰ Te quedan ${dias} dias\n📅 Expira: ${new Date(user.expires).toLocaleDateString()}` }, { quoted: msg })
    }
}
