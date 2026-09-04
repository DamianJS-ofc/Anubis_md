import fs from 'fs'
import path from 'path'
export default {
    name: 'bots',
    alias: ['listbots','subbots'],
    category: 'SubBots',
    description: 'Comando bots',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
        const mainNumber = sock.user.id.split(':')[0]
        const subDir = './database/subbots'
        const premDir = './database/subbots-premium'

        let subbots = fs.existsSync(subDir)? fs.readdirSync(subDir).filter(f=>fs.statSync(path.join(subDir,f)).isDirectory()) : []
        let prembots = fs.existsSync(premDir)? fs.readdirSync(premDir).filter(f=>fs.statSync(path.join(premDir,f)).isDirectory()) : []

        let totalSub = subbots.length + prembots.length
        const MAX = 30
        const libres = MAX - totalSub

        // Para ocultar numero: +549*****93
        const hide = (n)=> `+${n.slice(0,3)}*****${n.slice(-2)}`

        let txt = `╭━〔 *ANUBIS • BOTS* 〕━⬣\n`
        txt += `│ 👑 Principales: *1* | 🟢 1 activos\n`
        txt += `│ 🤖 Subbots: *${totalSub}/${MAX}* | 🟢 ${totalSub} activos\n`
        txt += `│ 📊 Total bots: *${1+totalSub}*\n`
        txt += `│ 🔓 Slots libres: *${libres}*\n`
        txt += `╰━━━━━━━━━━━━⬣\n\n`
        txt += `— PRINCIPALES —\n\n`
        txt += `╭➤ *Principal 1* 🟢 Activo\n`
        txt += `│ Número: ${hide(mainNumber)}\n`
        txt += `│ Prefijo: *.*\n`
        txt += `│ Tipo: 👑 Principal\n`
        txt += `╰───────────────\n\n`
        txt += `— SUBBOTS —\n\n`

        let count = 1
        for(let id of [...subbots,...prembots]){
            let tipo = subbots.includes(id)? '🤖 Subbot' : '👑 Premium'
            let isPrem = prembots.includes(id)
            txt += `╭➤ *${isPrem?'Premium':'Subbot'} ${count}* 🟡 Guardado\n`
            txt += `│ Número: ${hide(id)}\n`
            txt += `│ Prefijo: *.*\n`
            txt += `│ Tipo: ${tipo}\n`
            txt += `╰───────────────\n\n`
            count++
        }
        if(totalSub===0) txt += `*No hay subbots aún, usa.sub*\n`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
    }
}
