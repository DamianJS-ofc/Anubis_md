import { downloadMediaMessage } from 'baileys'
import { execSync } from 'child_process'

async function ensureDep(pkg) {
  try { await import(pkg); return true } catch {
    try { execSync(`npm i ${pkg} --save`, { stdio: 'ignore' }); return true } 
    catch { return false }
  }
}

export default {
    name: 's',
    alias: ['sticker','stiker'],
    category: 'Sticker',
    description: 'Crea sticker de imagen/video/sticker',
    async Main(sock, msg, { settings }){
        const jid = msg.key.remoteJid
        const pushName = msg.pushName || 'Usuario'

        await ensureDep('wa-sticker-formatter')
        await ensureDep('sharp')
        try { execSync('ffmpeg -version', { stdio: 'ignore' }) } 
        catch { await ensureDep('ffmpeg-static') }

        const { Sticker, StickerTypes } = await import('wa-sticker-formatter')

        const quotedInfo = msg.message?.extendedTextMessage?.contextInfo
        const quotedMsg = quotedInfo?.quotedMessage
        
        // AHORA SOPORTA IMAGEN, VIDEO Y STICKER
        const directMedia = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.stickerMessage
        const quotedMedia = quotedMsg?.imageMessage || quotedMsg?.videoMessage || quotedMsg?.stickerMessage

        if(!directMedia && !quotedMedia){
            return sock.sendMessage(jid, { text: `⚠️ *Responde a una imagen, video o sticker*\n\nEj: .s respondiendo a un sticker` }, { quoted: msg })
        }

        const quotedKey = quotedMedia ? {
          key: {
            remoteJid: jid,
            fromMe: false,
            id: quotedInfo?.stanzaId,
            participant: quotedInfo?.participant
          },
          message: quotedMsg
        } : null

        try{
            await sock.sendMessage(jid, { react: { text:'🎨', key: msg.key } })

            const targetMsg = directMedia ? msg : quotedKey
            const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: sock.logger, reuploadRequest: sock.updateMediaMessage })

            const pack = `🎋 Bot: ${settings.botName}\n🍟 Propiedad de: ${pushName}\n🧑‍💻 Desarrollado por DamianJS-ofc des de 0`
            
            const sticker = new Sticker(buffer, {
              pack: pack,
              author: settings.botName,
              type: StickerTypes.FULL,
              quality: 80
            })

            const stickerBuffer = await sticker.toBuffer()

            await sock.sendMessage(jid, { 
              sticker: stickerBuffer,
              contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: settings.channelId,
                  newsletterName: settings.channelName,
                  serverMessageId: 1
                }
              }
            }, { quoted: msg })

            await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })

        }catch(e){
            console.log(e)
            await sock.sendMessage(jid, { text: `❌ Error: ${e.message}` }, { quoted: msg })
        }
    }
}