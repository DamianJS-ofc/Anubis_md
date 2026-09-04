import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export default {
    name: 'addtoken',
    alias: ['gentoken','creartoken'],
    category: 'Owner',
    description: 'Comando addtoken',
    async Main(sock, msg, { args, settings }){
        const jid = msg.key.remoteJid
        const isOwner = settings?.owner?.includes(msg.key.participant || jid) || msg.key.fromMe
        // Si no tienes owner en settings, solo el bot puede usarlo
        // if(!isOwner) return sock.sendMessage(jid, {text:'❌ Solo owner'}, {quoted: msg})

        const days = parseInt(args[0]) || 60 // por defecto 60 dias = 2 meses
        const token = 'ANUBIS-' + crypto.randomBytes(3).toString('hex').toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase()

        const TOKENS_PATH = './database/tokens.json'
        let db = {}
        if(fs.existsSync(TOKENS_PATH)) db = JSON.parse(fs.readFileSync(TOKENS_PATH))

        const expires = Date.now() + (days * 24 * 60 * 60 * 1000)

        db[token] = {
            created: Date.now(),
            expires: expires,
            used: false,
            usedBy: null,
            days: days
        }

        fs.writeFileSync(TOKENS_PATH, JSON.stringify(db, null, 2))

        let txt = `╭━━━ *TOKEN PREMIUM* ━━━╮\n`
        txt += `┃ 🔑 *Token:* \`${token}\`\n`
        txt += `┃ ⏰ *Duracion:* ${days} dias (2 meses)\n`
        txt += `┃ 📅 *Expira:* ${new Date(expires).toLocaleDateString()}\n`
        txt += `┃\n`
        txt += `┃ Canjear con:\n`
        txt += `┃.codepremium ${token}\n`
        txt += `╰━━━━━━━━━━━━━━━╯`

        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
    }
}
