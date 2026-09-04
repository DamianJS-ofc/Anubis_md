import { startPremBot, validateToken, useToken } from '../lib/prem.js'
export default {
    name: 'prem',
    alias: ['codepremium','codeprem','premiumcode'],
    category: 'SubBots',
    description: 'Comando prem',
    async Main(sock, msg, { args }){
        const jid = msg.key.remoteJid
        const senderNum = (msg.key.participant || jid).split('@')[0]
        const token = args[0]?.toUpperCase()
        let targetNum = args[1]?.replace(/[^0-9]/g,'') || senderNum
        if(!token) return sock.sendMessage(jid, { text: '❌ Usa:.prem ANUBIS-XXXX [numero]' }, { quoted: msg })
        const v = validateToken(token)
        if(!v.ok) return sock.sendMessage(jid, { text: `❌ ${v.msg}` }, { quoted: msg })
        const exp = useToken(token, senderNum)
        await sock.sendMessage(jid, { text: `🔥 TOKEN PREMIUM OK\nGenerando bot para ${targetNum}...` }, { quoted: msg })
        try{
            const premSock = await startPremBot(targetNum, sock)
            await new Promise(r=> setTimeout(r, 2000))
            let code = await premSock.requestPairingCode(targetNum)
            code = code.match(/.{1,4}/g)?.join('-') || code
            await sock.sendMessage(jid, { text: `*CODIGO PREMIUM: ${code}*\nVence: ${new Date(exp).toLocaleDateString()}\nCarpeta: subbots-premium/${targetNum}` }, { quoted: msg })
        }catch(e){ await sock.sendMessage(jid, { text: `❌ ${e.message}` }, { quoted: msg }) }
    }
}
