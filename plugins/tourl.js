import { downloadContentFromMessage } from 'baileys'

export default {
  name: 'tourl',
  alias: ['togithub', 'img2url'],
  category: 'Herramientas',
  description: 'Sube imagen a GitHub - Fix V3 Damián.js-ofc',

  async Main(sock, msg, { settings }) {
    const jid = msg.key.remoteJid
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const imgMsg = msg.message?.imageMessage || quoted?.imageMessage

      if (!imgMsg) {
        return sock.sendMessage(jid, { text: '❌ *Responde a una imagen con.tourl*' }, { quoted: msg })
      }

      await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } })

      // DESCARGA COMPATIBLE CON ANUBIS
      const stream = await downloadContentFromMessage(imgMsg, 'image')
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      const mime = imgMsg.mimetype || 'image/jpeg'
      const ext = mime.split('/')[1] || 'jpg'
      const fileName = `${Date.now()}-${Math.floor(Math.random()*1000)}.${ext}`
      const folder = settings.githubFolder || 'tourl'
      const pathInRepo = `${folder}/${fileName}`

      if (!settings.githubToken ||!settings.githubRepo) {
        throw new Error('Falta githubToken o githubRepo en settings.js')
      }

      const [owner, repo] = settings.githubRepo.split('/')
      const branch = settings.githubBranch || 'main'
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathInRepo}`

      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${settings.githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Anubis-Bot'
        },
        body: JSON.stringify({
          message: `add ${fileName}`,
          content: buffer.toString('base64'),
          branch
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || JSON.stringify(data))

      const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathInRepo}`
      const cdn = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${pathInRepo}`

      // DISEÑO NUEVO QUE PEDISTE
      let txt = `╭─── 📂 TOUR 📂 ───╮\n`
      txt += `│ ✅ *Tourl subida con exito*\n`
      txt += `│ 🔗 *tour:*\n`
      txt += `│ ${raw}\n`
      txt += `│ 🍟 *CDN:*\n`
      txt += `│ ${cdn}\n`
      txt += `╰───────────────╯`

      await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } })

    } catch (e) {
      await sock.sendMessage(jid, { text: `❌ Error: ${e.message}` }, { quoted: msg })
    }
  }
}