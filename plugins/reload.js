import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

function getNum(jid) {
  if(!jid) return ''
  return String(jid).replace(/[^0-9]/g,'')
}
function isOwner(msg, settings){
  const realJid = msg.realSender || msg.key.participantPn || msg.key.participant || msg.key.remoteJid || ""
  const numReal = msg.senderNumber || getNum(realJid)
  const jidReal = String(realJid)
  const owners = settings?.owner || settings?.ownerNumber || global.owner || []
  if(!owners.length) return true
  return owners.some(o => {
    const oClean = String(o).replace(/[^0-9]/g,'')
    return jidReal.includes(o) || numReal.includes(oClean) || oClean.includes(numReal)
  }) || msg.key.fromMe
}
function isValidPlugin(content){
  return /name\s*:\s*['"`]/.test(content) && /export\s+default/.test(content)
}

export default {
    name: 'reload',
    alias: ['recargar', 'restart', 're'],
    category: 'Owner',
    description: 'Recarga todos los plugins',
    async Main(sock, msg, { settings }) {
        const jid = msg.key.remoteJid
        if(!isOwner(msg, settings)){
            return sock.sendMessage(jid, { text: '❌ Este comando solo es para owner.' }, { quoted: msg })
        }
        try{
            const pluginsFolder = path.join(process.cwd(), 'plugins')
            const allFiles = fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))
            let ok = 0, fail = 0, skipped = 0
            let validFiles = []

            for(const file of allFiles){
                const full = path.join(pluginsFolder, file)
                const content = fs.readFileSync(full, 'utf8')
                if(!isValidPlugin(content)){
                    skipped++
                    continue
                }
                validFiles.push(file)
                try{
                    const fileUrl = pathToFileURL(full).href + '?t=' + Date.now()
                    await import(fileUrl)
                    ok++
                }catch(e){
                    console.log(`[RELOAD FAIL] ${file}:`, e.message)
                    fail++
                }
            }

            await sock.sendMessage(jid, { 
                text: `✅ Reload completado\n✔️ OK: ${ok}\n❌ Fail: ${fail}\n⏭️ Skip (no plugin): ${skipped}\n📦 Total plugins: ${validFiles.length}\n📁 Total archivos: ${allFiles.length}` 
            }, { quoted: msg })

        }catch(e){
            await sock.sendMessage(jid, { text: `❌ Error en reload: ${e.message}` }, { quoted: msg })
        }
    }
}