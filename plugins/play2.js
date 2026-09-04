const KEY_SEARCH = 'lem_304ce5dc0bf924aedbeb0cd0482b5e3565e8b5f0'
const KEY_DL = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'
import ytSearch from 'yt-search'

export default {
    name: 'play2',
    alias: ['ytmp4', 'mp4', 'ytv', 'video'],
    category: 'Descargas',
    description: 'Descarga videos de YouTube',
    async Main(sock, msg, { args }) {
        const jid = msg.key.remoteJid
        const q = args.join(' ').trim()
        if(!q) return sock.sendMessage(jid, { text:'❌ Usa: .play2 bad bunny dtmf' }, { quoted: msg })
        await sock.sendMessage(jid, { react:{ text:'🎬', key: msg.key } })
        try {
            let videoUrl = q
            let titleSearch = q
            if(!q.startsWith('http')){
                try {
                    const s = await fetch(`${BASE}/s/youtube?query=${encodeURIComponent(q)}&apikey=${KEY_SEARCH}`).then(r=>r.json())
                    const first = (s.result || s.data || [])[0]
                    videoUrl = first?.url
                    titleSearch = first?.title || q
                    if(!videoUrl) throw new Error('no url')
                } catch {
                    const r = await ytSearch(q)
                    videoUrl = r.videos[0].url
                    titleSearch = r.videos[0].title
                }
            }

            // YTV = video
            const dl = await fetch(`${BASE}/dl/ytv?url=${encodeURIComponent(videoUrl)}&apikey=${KEY_DL}`).then(r=>r.json())
            const videoDlUrl = dl.datos?.url || dl.url || dl.result?.url
            const title = dl.titulo || dl.title || titleSearch
            
            if(!videoDlUrl) throw new Error('Lempi video vacio: ' + JSON.stringify(dl).slice(0,500))

            const res = await fetch(videoDlUrl)
            const buffer = Buffer.from(await res.arrayBuffer())

            const caption = `🎬 *${title}*\n⏱️ ${dl.duracion || dl.duration || ''} | 📺 ${dl.datos?.calidad || dl.calidad || '720p'}`

            await sock.sendMessage(jid, { 
                video: buffer, 
                mimetype: 'video/mp4', 
                fileName: `${title}.mp4`,
                caption 
            }, { quoted: msg })

            await sock.sendMessage(jid, { react:{ text:'✅', key: msg.key } })
        } catch(e){
            await sock.sendMessage(jid, { text:`❌ Error play2: ${e.message}` }, { quoted: msg })
        }
    }
}