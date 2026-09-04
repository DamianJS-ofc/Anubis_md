const KEY_SEARCH = 'lem_304ce5dc0bf924aedbeb0cd0482b5e3565e8b5f0'
const KEY_DL = 'Anubis_bott_pro'
const BASE = 'https://api.lempi.lat'
import ytSearch from 'yt-search'

export default {
    name: 'play',
    alias: ['ytmp3', 'mp3'],
    category: 'Descargas',
    description: 'Descarga musica de YouTube',
    async Main(sock, msg, { args }) {
        const jid = msg.key.remoteJid
        const q = args.join(' ').trim()
        if(!q) return sock.sendMessage(jid, { text:'❌ Usa:.play dalex hola' }, { quoted: msg })
        await sock.sendMessage(jid, { react:{ text:'🎧', key: msg.key } })
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
            const dl = await fetch(`${BASE}/dl/yta?url=${encodeURIComponent(videoUrl)}&apikey=${KEY_DL}`).then(r=>r.json())
            const audioUrl = dl.datos?.url // ESTE ES EL CORRECTO
            const title = dl.titulo || titleSearch
            
            if(!audioUrl) throw new Error('Lempi vacio: ' + JSON.stringify(dl).slice(0,500))

            const res = await fetch(audioUrl)
            const buffer = Buffer.from(await res.arrayBuffer())

            if(dl.miniatura) await sock.sendMessage(jid, { image:{ url: dl.miniatura }, caption:`🎧 *${title}*\n${dl.duracion || ''} | ${dl.datos?.calidad || ''}` }, { quoted: msg })
            await sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', fileName: 'anubis.mp3' }, { quoted: msg })
            await sock.sendMessage(jid, { react:{ text:'✅', key: msg.key } })
        } catch(e){
            await sock.sendMessage(jid, { text:`❌ ${e.message}` }, { quoted: msg })
        }
    }
}