const KEY = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'

export default {
  name: 'facebook',
  alias: ['fb','fbdl'],
  category: 'Descargas',
  async Main(sock, msg, { args }) {
    const jid = msg.key.remoteJid
    const url = args[0]?.trim()
    if(!url) return sock.sendMessage(jid, { text:'❌ Usa:.fb https://www.facebook.com/...' }, { quoted: msg })
    if(!url.includes('facebook.com') &&!url.includes('fb.watch'))
      return sock.sendMessage(jid, { text:'❌ Link de Facebook inválido' }, { quoted: msg })

    await sock.sendMessage(jid, { react: { text:'⬇️', key: msg.key } })
    try {
      const apiUrl = `${BASE}/dl/facebook?url=${encodeURIComponent(url)}&quality=hd&apikey=${KEY}`
      const data = await fetch(apiUrl).then(r=>r.json())
      if(!data.status) throw new Error(data.mensaje || JSON.stringify(data).slice(0,500))

      const videoUrl = data.datos?.url || data.datos?.hd || data.url
      if(!videoUrl) throw new Error(JSON.stringify(data).slice(0,800))

      const buffer = Buffer.from(await (await fetch(videoUrl)).arrayBuffer())

      await sock.sendMessage(jid, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `📘 ${data.titulo || 'Facebook Video'}`
      }, { quoted: msg })

      await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })
    } catch(e){
      await sock.sendMessage(jid, { text:`❌ ${e.message}` }, { quoted: msg })
    }
  }
}