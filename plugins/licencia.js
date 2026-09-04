import { createCanvas, loadImage } from 'canvas'

export default {
    name: 'licencia',
    alias: ['lisensia'],
    category: 'Canvas',
    description: 'crea una licencia para robar stickers con la foto del usuario',
    async Main(sock, msg){
        const jid = msg.key.remoteJid

        const resolveLid = async (id) => {
            if(!id) return id
            if(!id.endsWith('@lid')) return id
            try{
                const pn = await sock.signalRepository?.lidMapping?.getPNForLID(id)
                if(pn) return pn
            }catch{}
            return id
        }

        let rawTarget = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                     || msg.message?.extendedTextMessage?.contextInfo?.participant
                     || msg.key.participantAlt
                     || msg.key.participant
                     || jid

        let target = await resolveLid(rawTarget)
        if(target.endsWith('@lid') && msg.key.participantAlt) target = msg.key.participantAlt

        try{
            await sock.sendMessage(jid, { react: { text: '🪪', key: msg.key } })

            let pfpUrl
            try{ pfpUrl = await sock.profilePictureUrl(target, 'image') }
            catch{
                try{ pfpUrl = await sock.profilePictureUrl(rawTarget, 'image') }
                catch{ pfpUrl = 'https://i.postimg.cc/5tR3F7yS/no-profile.jpg' }
            }
            const pfp = await loadImage(pfpUrl)

            const W = 800, H = 530
            const canvas = createCanvas(W, H)
            const ctx = canvas.getContext('2d')

            // fondo blanco
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0,0,W,H)

            // franjas moradas
            ctx.fillStyle = '#5e1086'
            ctx.fillRect(0,0,W,90)
            ctx.fillRect(0,H-30,W,30)

            // titulos
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.font = '900 42px Arial Black'
            ctx.fillText('LICENCIA PARA ROBAR', W/2, 40)
            ctx.font = '900 42px Arial Black'
            ctx.fillText('STICKERS', W/2, 80)

            // datos texto izquierda
            ctx.textAlign = 'left'
            ctx.fillStyle = '#000000'
            ctx.font = 'bold 28px Arial'
            const displayName = target.split('@')[0]
            ctx.fillText(`Sr/Sta: ${displayName.slice(0,15)}`, 25, 145)

            ctx.font = 'bold 26px Arial'
            ctx.fillText('Tipo de Meme: Todos', 25, 210)
            ctx.fillText('Vencimiento: Nunca', 25, 270)

            // N° random
            const numero = '985620174387'.slice(0,12) // deja tu numero o random
            // const numero = Math.floor(Math.random()*900000000000 + 100000000000).toString()
            ctx.font = 'bold 26px Arial'
            ctx.fillText(`N° ${numero}`, 25, 340)

            // chip amarillo (dibujado)
            const chipX = 340, chipY = 280, chipW = 95, chipH = 105
            ctx.fillStyle = '#d9d32b'
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            // esquinas redondeadas
            const r = 18
            ctx.beginPath()
            ctx.moveTo(chipX+r, chipY)
            ctx.lineTo(chipX+chipW-r, chipY)
            ctx.quadraticCurveTo(chipX+chipW, chipY, chipX+chipW, chipY+r)
            ctx.lineTo(chipX+chipW, chipY+chipH-r)
            ctx.quadraticCurveTo(chipX+chipW, chipY+chipH, chipX+chipW-r, chipY+chipH)
            ctx.lineTo(chipX+r, chipY+chipH)
            ctx.quadraticCurveTo(chipX, chipY+chipH, chipX, chipY+chipH-r)
            ctx.lineTo(chipX, chipY+r)
            ctx.quadraticCurveTo(chipX, chipY, chipX+r, chipY)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            // lineas del chip
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(chipX, chipY+25)
            ctx.lineTo(chipX+chipW, chipY+25)
            ctx.moveTo(chipX, chipY+50)
            ctx.lineTo(chipX+chipW, chipY+50)
            ctx.moveTo(chipX, chipY+75)
            ctx.lineTo(chipX+35, chipY+75)
            ctx.moveTo(chipX+60, chipY+75)
            ctx.lineTo(chipX+chipW, chipY+75)
            ctx.moveTo(chipX+35, chipY)
            ctx.lineTo(chipX+35, chipY+105)
            ctx.moveTo(chipX+60, chipY)
            ctx.lineTo(chipX+60, chipY+105)
            ctx.stroke()

            // cuadro blanco foto - lado derecho
            const rx = 560, ry = 115, rw = 195, rh = 260
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(rx, ry, rw, rh)
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 3
            ctx.strokeRect(rx, ry, rw, rh)

            // foto dentro del cuadro
            ctx.save()
            ctx.beginPath()
            ctx.rect(rx+3, ry+3, rw-6, rh-6)
            ctx.clip()
            // cover fit
            const scale = Math.max((rw-6)/pfp.width, (rh-6)/pfp.height)
            const nw = pfp.width * scale
            const nh = pfp.height * scale
            const nx = rx+3 + (rw-6 - nw)/2
            const ny = ry+3 + (rh-6 - nh)/2
            ctx.drawImage(pfp, nx, ny, nw, nh)
            ctx.restore()

            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 })

            await sock.sendMessage(jid, {
                image: buffer,
                caption: `🪪 Licencia de @${target.split('@')[0]}`,
                mentions: [target, rawTarget]
            }, { quoted: msg })

        }catch(e){
            console.log(e)
            await sock.sendMessage(jid, { text: `Error: ${e.message}` }, { quoted: msg })
        }
    }
}