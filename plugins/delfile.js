import fs from 'fs'
import path from 'path'

function isOwner(msg, settings){
  const p = (msg.key.participant || msg.key.remoteJid || "").toString()
  const num = p.replace(/[^0-9]/g,'')
  const owners = settings?.owner || global.owner || []
  return owners.some(o => p.includes(o) || num.includes(o.toString().replace(/[^0-9]/g,''))) || msg.key.fromMe
}

export default {
    name: 'delfile',
    alias: ['delplugin', 'borrarfile', 'deletefile'],
    category: 'Owner',
    description: 'Comando delfile',
    async Main(sock, msg, { args, settings }) {
        const jid = msg.key.remoteJid
        if(!isOwner(msg, settings)) return sock.sendMessage(jid, {text:'❌ Solo owner'}, {quoted: msg})

        if (!args[0]) {
            return sock.sendMessage(jid, {
                text: '❌ Usa:\n.delfile plugins/nombre.js\nEj:\n.delfile plugins/abrir grupo.js\n.delfile plugins/backup.js'
            }, { quoted: msg })
        }

        const ruta = args.join(' ').trim()
        const fullPath = path.resolve(ruta)

        // Seguridad: no dejar borrar carpetas importantes
        if (fullPath.includes('node_modules') || fullPath.includes('session') || fullPath.endsWith('settings.js')) {
            return sock.sendMessage(jid, { text: `❌ No puedes borrar eso: ${ruta}` }, { quoted: msg })
        }

        if (!fs.existsSync(fullPath)) {
            return sock.sendMessage(jid, { text: `❌ No existe: ${ruta}` }, { quoted: msg })
        }

        try {
            const stat = fs.statSync(fullPath)
            if (stat.isDirectory()) {
                return sock.sendMessage(jid, { text: `❌ Es una carpeta, usa ruta de archivo:\n${ruta}` }, { quoted: msg })
            }

            fs.unlinkSync(fullPath)
            await sock.sendMessage(jid, { text: `✅ Borrado: ${ruta}` }, { quoted: msg })
            await sock.sendMessage(jid, { react: { text: '🗑️', key: msg.key } })

        } catch (e) {
            await sock.sendMessage(jid, { text: `❌ Error: ${e.message}` }, { quoted: msg })
        }
    }
}