const KEY = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'

export default {
  name: 'tiktok',
  alias: ['tt','ttdl','tiktokdl'],
  category: 'Descargas',
  async Main(sock, msg, { args }) {
    const jid = msg.key.remoteJid
    const url = args[0]?.trim()
    if(!url ||!url.includes('tiktok')) return sock.sendMessage(jid, { text:'❌ Usa:.tiktok https://vm.tiktok.com/...' }, { quoted: msg })
    await sock.sendMessage(jid, { react: { text:'⬇️', key: msg.key } })
    try {
      const apiUrl = `${BASE}/dl/tiktok?url=${encodeURIComponent(url)}&apikey=${KEY}`
      const data = await fetch(apiUrl).then(r=>r.json())

      // estructura tipica lempi: datos.url / video / hdplay
      const videoUrl = data.datos?.url || data.video || data.play || data.hdplay || data.result?.video || data.resultado?.video
      const title = data.titulo || data.title || data.desc || ''
      const author = data.autor?.usuario || data.author || ''
      const thumb = data.miniatura || data.cover || ''

      if(!videoUrl) throw new Error(JSON.stringify(data).slice(0,800))

      const buffer = Buffer.from(await (await fetch(videoUrl)).arrayBuffer())

      await sock.sendMessage(jid, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 ${title.slice(0,150)}\n👤 ${author}`.trim()
      }, { quoted: msg })

      await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })
    } catch(e){
      await sock.sendMessage(jid, { text:`❌ Error tiktok dl: ${e.message}` }, { quoted: msg })
    }
  }
}