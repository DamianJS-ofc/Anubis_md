import { getPairingCode, getSub, getConnectionStatus } from '../lib/sub.js'

export default {
  name: 'code',
  alias: ['serbot'],
  category: 'SubBots',
  description: 'Genera código de vinculación para el subbot',
  async Main(sock, msg, { getRealJid, jidToNumber, replyWithContext, config }){
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || jid
    
    const realSender = getRealJid(sender)
    const realJid = getRealJid(jid)
    const senderNumber = jidToNumber(realSender)
    
    if(!senderNumber || senderNumber.length < 10) {
      await sock.sendMessage(realJid, { 
        text: '❌ No se pudo obtener tu número. Asegúrate de tener un número válido.' 
      }, { quoted: msg })
      return
    }
    
    await sock.sendMessage(realJid, { 
      text: `ㅤᩤᩣ    𝖲𝗎𝖻-𝖡𝗈𝗍 - 𝖢𝗈𝖽𝖾ㅤ ౿ ㅤ\n> 𓈃 𝖢𝗈𝗇𝖾𝗑𝗂𝗈́𝗇 𝖽𝖾 𝗌𝗎𝖻-𝖻𝗈𝗍 𝗉𝗈𝗋 𝖼𝗈́𝖽𝗂𝗀𝗈\n\n❀ WhatsApp > Dispositivos vinculados > Vincular > Vincular con número > Pega el código\n\n> El código expira en 60 segundos` 
    }, { quoted: msg })
    
    try {
      const result = await getPairingCode(senderNumber)
      
      if (result.status === 'pending') {
        await sock.sendMessage(realJid, { 
          text: `${result.code}` 
        }, { quoted: msg })
        
        let checkInterval
        const timeout = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval)
        }, 60000)
        
        checkInterval = setInterval(async () => {
          const sub = getSub(senderNumber)
          if (sub && sub.sock && sub.sock.user) {
            clearTimeout(timeout)
            clearInterval(checkInterval)
            await sock.sendMessage(realJid, { 
              text: `𖹭 @${senderNumber} Ha conectado un nuevo Sub-Bot`,
              mentions: [`${senderNumber}@s.whatsapp.net`]
            }, { quoted: msg })
          }
        }, 2000)
        
      } else if (result.status === 'connected') {
        await sock.sendMessage(realJid, { 
          text: `𖹭 @${senderNumber} Ya tiene un Sub-Bot conectado`,
          mentions: [`${senderNumber}@s.whatsapp.net`]
        }, { quoted: msg })
      } else if (result.status === 'expired') {
        await sock.sendMessage(realJid, { 
          text: `⌛ El código expiró. Usa *${config?.prefix || '.'}code* nuevamente.` 
        }, { quoted: msg })
      }
      
    } catch (err) {
      console.log(`Error: ${err.message}`)
      await sock.sendMessage(realJid, { 
        text: `💤 Error: ${err.message}` 
      }, { quoted: msg })
    }
  }
}