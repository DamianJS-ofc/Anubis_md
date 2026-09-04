export default {
  name: 'voz',
  alias: ['tts','say'],
  category: 'Audio',
  async Main(sock, msg, { args, settings }) {
    const jid = msg.key.remoteJid
    let text = args.join(' ').trim()
    if(text.toLowerCase().startsWith('enrique')) text = text.slice(7).trim()
    if(text.toLowerCase().startsWith('jorge')) text = text.slice(5).trim()
    if(!text) return sock.sendMessage(jid, { text:'❌ Usa:.tts hola mundo' }, { quoted: msg })
    text = text.replace(/[<>&]/g, '').slice(0,300)

    try {
      const apiUrl = `https://api.lempi.lat/s/ttsmp3?text=${encodeURIComponent(text)}&speaker=Jorge%20(Castilian)&apikey=Anubis_bott_pro`
      const data = await fetch(apiUrl).then(r=>r.json())
      const audioUrl = data.datos?.audioUrl
      if(!audioUrl) throw new Error(JSON.stringify(data).slice(0,500))
      const buf = Buffer.from(await (await fetch(audioUrl)).arrayBuffer())

      // FIX: ptt false + audio/mpeg para que no falle
      await sock.sendMessage(jid, { 
        audio: buf, 
        mimetype: 'audio/mpeg',
        ptt: false,
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

    } catch(e){
      await sock.sendMessage(jid, { text:`❌ ${e.message}` }, { quoted: msg })
    }
  }
}