export default {
    name: 'promote',
    alias: ['promover','daradmin'],
    category: 'Group',
    description: 'Da admin a usuario',
    async Main(sock, msg, { args }){
        const jid = msg.key.remoteJid
        if(!jid.endsWith('@g.us')) return

        const metadata = await sock.groupMetadata(jid)
        const senderId = msg.key.participant || msg.participant
        const senderNum = senderId.split('@')[0].split(':')[0]
        const cleanSender = senderNum.replace(/[^0-9]/g,'').slice(-10)

        const botId = sock.user.id
        const botNum = botId.split(':')[0].split('@')[0]

        console.log('=== PROMOTE DEBUG ===')
        console.log('SenderId:', senderId)
        console.log('SenderNum:', senderNum)
        console.log('BotId:', botId)
        console.log('Participants:', metadata.participants.map(p=> ({id:p.id, phone:p.phoneNumber, admin:p.admin})))

        // BUSQUEDA ULTRA COMPATIBLE CON LID
        const isAdminCheck = (targetNum, targetId) => {
            return metadata.participants.find(p => {
                const pIdNum = p.id.split('@')[0].split(':')[0].replace(/[^0-9]/g,'').slice(-10)
                const pPhoneNum = (p.phoneNumber || '').split('@')[0].replace(/[^0-9]/g,'').slice(-10)
                const isSame = p.id === targetId || pIdNum === targetNum.slice(-10) || pPhoneNum === targetNum.slice(-10) || p.id.includes(targetNum)
                return isSame && p.admin
            })
        }

        const isAdmin = isAdminCheck(cleanSender, senderId)
        const isBotAdmin = isAdminCheck(botNum.slice(-10), botId) || metadata.participants.find(p=>p.id===botId && p.admin) || metadata.participants.find(p=>p.id.split(':')[0]===botNum && p.admin)

        if(!isAdmin){
            // Si falla, mostramos admins reales para debug
            let admins = metadata.participants.filter(p=>p.admin).map(p=>`• ${p.id} | phone: ${p.phoneNumber || 'no'} | ${p.admin}`).join('\n')
            return sock.sendMessage(jid,{
                text: `❌ No te detecto pero lo arreglamos\n\nTu ID: ${senderId}\nNum limpio: ${cleanSender}\n\n*ADMINS QUE VEO:*\n${admins}\n\nManda captura de esto al creador`
            },{quoted:msg})
        }
        if(!isBotAdmin) return sock.sendMessage(jid,{text:'❌ Yo no soy admin'},{quoted:msg})

        let users = []
        if(msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length){
            users = msg.message.extendedTextMessage.contextInfo.mentionedJid
        } else if(msg.message?.extendedTextMessage?.contextInfo?.participant){
            users = [msg.message.extendedTextMessage.contextInfo.participant]
        } else if(args[0]){
            users = [args[0].replace(/[^0-9]/g,'')+'@s.whatsapp.net']
        }

        if(!users.length) return sock.sendMessage(jid,{text:'Uso:.promote @user (menciona)'},{quoted:msg})

        await sock.groupParticipantsUpdate(jid, users, 'promote')
        await sock.sendMessage(jid,{
            text: `👑 *ADMIN DADO*\n\n@${users[0].split('@')[0]} ahora es admin\nBy ANUBIS MD 🔥`,
            mentions: users
        },{quoted:msg})
    }
}