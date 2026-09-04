export default {
    name: 's',
    alias: ['sticker','stiker'],
    category: 'Sticker',
    description: 'Crea sticker de imagen/video',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const mediaMsg = msg.message?.imageMessage || msg.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage

        if(!mediaMsg){
            return sock.sendMessage(jid, { text: `⚠️ *Responde a una imagen o video para crear un sticker.*\n\n✳️ Ejemplo:\n.s (respondiendo a una imagen)` }, { quoted: msg })
        }

        try{
            // Descargar media
            const buffer = await sock.downloadMediaMessage(
                msg.message?.imageMessage || msg.message?.videoMessage? msg : { message: quoted }
            )
            await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg })
        }catch(e){
            await sock.sendMessage(jid, { text: `❌ Error al crear sticker: ${e.message}` }, { quoted: msg })
        }
    }
}
