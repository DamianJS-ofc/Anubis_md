const KEY = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'

export default {
  name: 'tiktoksearch',
  alias: ['ttsearch','tts'],
  category: 'Busquedas',
  async Main(sock, msg, { args }) {
    const jid = msg.key.remoteJid
    const q = args.join(' ').trim()
    if(!q) return sock.sendMessage(jid, { text:'❌ Usa: .ttsearch gatos' }, { quoted: msg })
    await sock.sendMessage(jid, { react: { text:'🔍', key: msg.key } })
    try {
      const apiUrl = `${BASE}/s/tiktok?q=${encodeURIComponent(q)}&count=5&cursor=0&apikey=${KEY}`
      const data = await fetch(apiUrl).then(r=>r.json())
      const list = data.resultados || data.result || data.data || []
      if(!list.length) throw new Error(JSON.stringify(data).slice(0,800))
      
      for(let i=0;i<Math.min(5,list.length);i++){
        const v = list[i]
        const dlUrl = v.video || v.play || v.hdplay
        if(!dlUrl) continue
        const buf = Buffer.from(await (await fetch(dlUrl)).arrayBuffer())
        
        if(i===0){
          await sock.sendMessage(jid, {
            video: buf,
            mimetype: 'video/mp4',
            caption: `🔍 *${data.consulta || q}* - 1/5\n🎬 ${v.titulo?.slice(0,120)}\n👤 @${v.autor?.usuario || 'tiktok'}\n⏱️ ${v.duracion}s`
          }, { quoted: msg })
        } else {
          await sock.sendMessage(jid, { video: buf, mimetype: 'video/mp4' }, { quoted: msg })
        }
        await new Promise(r=>setTimeout(r, 500))
      }
      await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })
    } catch(e){
      await sock.sendMessage(jid, { text:`❌ ${e.message}` }, { quoted: msg })
    }
  }
}