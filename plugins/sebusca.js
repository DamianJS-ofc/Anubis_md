import { createCanvas, loadImage } from 'canvas'

export default {
    name: 'sebusca',
    alias: ['wanted', 'buscado'],
    category: 'Utiles',
    description: 'Crea un cartel de se busca con la foto de perfil',
    async Main(sock, msg){
        const jid = msg.key.remoteJid

        const resolveLid = async (lidOrJid) => {
            if(!lidOrJid) return lidOrJid
            if(!lidOrJid.endsWith('@lid')) return lidOrJid
            try{
                const mapped = await sock.signalRepository?.lidMapping?.getPNForLID(lidOrJid)
                if(mapped) return mapped
            }catch{}
            return lidOrJid
        }

        let rawTarget = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                     || msg.message?.extendedTextMessage?.contextInfo?.participant
                     || msg.key.participantAlt
                     || msg.key.participant
                     || jid

        let target = await resolveLid(rawTarget)
        if(target.endsWith('@lid') && msg.key.participantAlt){
            target = msg.key.participantAlt
        }

        try{
            await sock.sendMessage(jid, { react: { text: '🤠', key: msg.key } })

            let pfpUrl
            try{ pfpUrl = await sock.profilePictureUrl(target, 'image') }
            catch{
                try{ pfpUrl = await sock.profilePictureUrl(rawTarget, 'image') }
                catch{ pfpUrl = 'https://i.postimg.cc/5tR3F7yS/no-profile.jpg' }
            }

            const pfp = await loadImage(pfpUrl)
            const W = 600, H = 850
            const canvas = createCanvas(W, H)
            const ctx = canvas.getContext('2d')

            ctx.fillStyle = '#e6d2a3'
            ctx.fillRect(0,0,W,H)
            for(let i=0;i<800;i++){
                ctx.fillStyle = `rgba(120,80,30,${Math.random()*0.08})`
                ctx.fillRect(Math.random()*W, Math.random()*H, 2,2)
            }
            ctx.strokeStyle = '#6b4a2a'
            ctx.lineWidth = 12
            ctx.strokeRect(0,0,W,H)
            ctx.lineWidth = 2
            ctx.strokeRect(15,15,W-30,H-30)

            ctx.fillStyle = '#1a1a1a'
            ctx.textAlign = 'center'
            ctx.font = '900 78px Impact'
            ctx.fillText('SE BUSCA', W/2, 95)
            ctx.fillRect(40, 110, W-80, 6)
            ctx.font = '900 48px Impact'
            ctx.fillText('VIVO O MUERTO', W/2, 165)

            const rx = 135, ry = 195, rw = 330, rh = 360
            ctx.fillStyle = '#000'
            ctx.fillRect(rx-6, ry-6, rw+12, rh+12)
            ctx.fillStyle = '#fff'
            ctx.fillRect(rx, ry, rw, rh)

            ctx.save()
            ctx.beginPath()
            ctx.rect(rx+4, ry+4, rw-8, rh-8)
            ctx.clip()
            ctx.drawImage(pfp, rx+4, ry+4, rw-8, rh-8)
            ctx.globalCompositeOperation = 'multiply'
            ctx.fillStyle = 'rgba(180,130,70,0.3)'
            ctx.fillRect(rx, ry, rw, rh)
            ctx.restore()

            ctx.font = '60px serif'
            ctx.textAlign = 'left'
            ctx.fillText('🔫', 30, 380)
            ctx.textAlign = 'right'
            ctx.fillText('🔫', W-30, 380)

            ctx.textAlign = 'center'
            ctx.fillStyle = '#1a1a1a'
            ctx.font = '900 52px Impact'
            ctx.fillText('RECOMPENSA', W/2, 640)
            ctx.font = '900 64px Impact'
            ctx.fillText('$5,000.00', W/2, 710)
            ctx.fillRect(40, 730, W-80, 6)
            ctx.font = '700 32px Impact'
            ctx.fillText('POR ORDEN DE LOS GRINGOS', W/2, 780)

            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
            const tagNumber = target.split('@')[0]

            await sock.sendMessage(jid, {
                image: buffer,
                caption: `Se busca @${tagNumber}`,
                mentions: [target, rawTarget]
            }, { quoted: msg })

        }catch(e){
            console.log(e)
            await sock.sendMessage(jid, { text: `Error: ${e.message}` }, { quoted: msg })
        }
    }
}