const KEY = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'

export default {
  name: 'pinterest',
  alias: ['pin','pinteres'],
  category: 'Busquedas',
  async Main(sock, msg, { args }) {
    const jid = msg.key.remoteJid
    const q = args.join(' ').trim()
    if(!q) return sock.sendMessage(jid, { text:'❌ Usa: .pin gatos' }, { quoted: msg })
    await sock.sendMessage(jid, { react: { text:'📌', key: msg.key } })
    try {
      const apiUrl = `${BASE}/s/pin?q=${encodeURIComponent(q)}&limit=20&apikey=${KEY}`
      const data = await fetch(apiUrl).then(r=>r.json())
      const list = (data.results || data.resultados || []).slice(0,5)
      if(!list.length) throw new Error(JSON.stringify(data).slice(0,800))

      for(let i=0;i<list.length;i++){
        const v = list[i]
        const imgUrl = v.descarga || v.imagen
        if(!imgUrl) continue
        
        if(i===0){
          await sock.sendMessage(jid, { 
            image: { url: imgUrl }, 
            caption: `📌 *${data.query || q}* - 1/5\n🎨 ${v.titulo || ''}\n👤 ${v.autor || ''} • ❤️ ${v.likes || ''}`.trim()
          }, { quoted: msg })
        } else {
          await sock.sendMessage(jid, { image: { url: imgUrl } }, { quoted: msg })
        }
      }
      await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })
    } catch(e){
      await sock.sendMessage(jid, { text:`❌ ${e.message}` }, { quoted: msg })
    }
  }
}