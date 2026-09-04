import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default {
    name: 'backup',
    alias: ['bk'],
    category: 'Owner',
    description: 'Comando backup',
    async Main(sock, msg, { settings }){
        const jid = msg.key.remoteJid
        
        const senderNumber = msg.senderNumber || (msg.key.participant || msg.key.remoteJid || '').replace(/[^0-9]/g,'')
        const senderJid = msg.realSender || msg.key.participant || msg.key.remoteJid || ''
        
        const isOwner = 
            msg.key.fromMe ||
            senderNumber.includes('5492645746772') ||
            senderJid.includes('5492645746772') ||
            (settings?.owner && settings.owner.some(o => senderNumber.includes(o.replace(/[^0-9]/g,'')) || senderJid.includes(o)))

        if(!isOwner) return

        await sock.sendMessage(jid, { text: '⏳ Creando backup COMPLETO...' }, { quoted: msg })

        const root = process.cwd()
        const zipName = `Anubis-full-${Date.now()}.zip`
        const zipPath = path.join(root, zipName)

        try {
            // SOLO EXCLUYE BASURA
            const excludes = [
                "node_modules/*",
                ".git/*",
                "session/*",
                "sessions/*",
                "auth/*",
                "auth_info/*",
                "baileys_store/*",
                ".cache/*",
                "tmp/*",
                "*.zip",
                "backup-*/*",
                ".npm/*"
            ]
            const excludeStr = excludes.map(e => `"${e}"`).join(' ')
            
            execSync(`zip -r "${zipPath}" . -x ${excludeStr}`, { cwd: root, stdio: 'pipe' })

            const stat = fs.statSync(zipPath)
            const size = stat.size > 1024*1024 ? (stat.size/1024/1024).toFixed(2)+' MB' : (stat.size/1024).toFixed(2)+' KB'

            // Ver que incluyo
            const list = execSync(`unzip -l "${zipPath}" | head -n 50`, { encoding: 'utf8' }).toString()

            await sock.sendMessage(jid, {
                document: fs.readFileSync(zipPath),
                fileName: zipName,
                mimetype: 'application/zip',
                caption: `✅ *BACKUP FULL ANUBIS*\n\n📦 ${zipName}\n📏 ${size}\n\n✔️ INCLUYE:\n- index.js\n- handler.js\n- settings.js\n- plugins/ (todos)\n- lib/ (activos, etc)\n- database/ (sticker-cmd.json)\n- package.json\n\n❌ EXCLUIDO:\n- node_modules\n- session / sessions / auth (670 archivos)\n- .git / .cache / tmp\n\nLista:\n${list.slice(0,800)}...`
            }, { quoted: msg })

            setTimeout(()=> { if(fs.existsSync(zipPath)) fs.unlinkSync(zipPath) }, 10000)

        } catch(e){
            console.log(e)
            await sock.sendMessage(jid, { text: `❌ Error backup: ${e.message}\n\nInstala zip: apt install zip` }, { quoted: msg })
        }
    }
}
