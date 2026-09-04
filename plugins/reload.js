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

export default {
    name: 'reload',
    alias: ['recargar', 'restart', 're'],
    category: 'Owner',
    description: 'Recarga todos los plugins y detecta errores',
    async Main(sock, msg, { settings }) {
        const jid = msg.key.remoteJid
        if(!isOwner(msg, settings)){
            return sock.sendMessage(jid, { text: '❌ Solo owner.' }, { quoted: msg })
        }
        try{
            const pluginsFolder = path.join(process.cwd(), 'plugins')
            if(!fs.existsSync(pluginsFolder)){
                return sock.sendMessage(jid, { text: `❌ Ruta mal: pluginsFolder no existe\n📁 Buscado en: ${pluginsFolder}` }, { quoted: msg })
            }

            const allFiles = fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))
            let ok = 0, fail = 0, skipped = 0
            let failsDetail = []
            let skippedDetail = []

            for(const file of allFiles){
                const full = path.join(pluginsFolder, file)
                if(!fs.existsSync(full)){
                    failsDetail.push(`📁 ${file}\n └─ ❌ Ruta mal: archivo no encontrado en ${full}`)
                    fail++
                    continue
                }
                let content = ''
                try{
                    content = fs.readFileSync(full, 'utf8')
                }catch(e){
                    failsDetail.push(`📄 ${file}\n └─ ❌ No se pudo leer: ${e.message}`)
                    fail++
                    continue
                }

                // valida que sea plugin
                const hasName = /name\s*:\s*['"`]/.test(content)
                const hasExport = /export\s+default/.test(content)
                if(!hasName ||!hasExport){
                    skipped++
                    if(!hasName) skippedDetail.push(`${file} -> falta name: 'xxx'`)
                    else skippedDetail.push(`${file} -> falta export default`)
                    continue
                }

                // intenta importar y detecta error real
                try{
                    const fileUrl = pathToFileURL(full).href + '?t=' + Date.now() + Math.random()
                    const mod = await import(fileUrl)

                    // valida estructura del plugin
                    if(!mod.default?.name) throw new Error(`Plugin sin name`)
                    if(typeof mod.default?.Main!== 'function') throw new Error(`Plugin ${mod.default.name} sin funcion Main()`)

                    ok++
                }catch(e){
                    fail++
                    // limpia el mensaje para que se entienda
                    let errMsg = e.message || String(e)
                    let stackLine = ''
                    if(e.stack){
                        // busca la linea del error en el stack
                        let lines = e.stack.split('\n')
                        let relevant = lines.find(l => l.includes(file) || l.includes('SyntaxError'))
                        if(relevant) stackLine = relevant.trim()
                    }
                    // detecta tipo de error
                    let tipo = '❌ ERROR'
                    if(errMsg.includes('Unexpected token') || errMsg.includes('SyntaxError')) tipo = '💥 SINTAXIS'
                    if(errMsg.includes('Cannot find module') || errMsg.includes('Failed to load')) tipo = '📁 RUTA MAL'
                    if(errMsg.includes('not defined')) tipo = '🔍 VARIABLE'

                    failsDetail.push(`${tipo} ${file}\n ├─ ${errMsg.slice(0,250)}\n └─ ${stackLine || full}`)
                    console.log(`[RELOAD FAIL] ${file}:`, e)
                }
            }

            let txt = `*🔄 RELOAD COMPLETADO*\n\n`
            txt += `✔️ OK: ${ok}\n❌ FAIL: ${fail}\n⏭️ SKIP: ${skipped}\n📦 Total: ${allFiles.length}\n\n`

            if(failsDetail.length){
                txt += `*❌ ARCHIVOS CON ERROR:*\n`
                txt += failsDetail.join('\n\n') + '\n\n'
            }
            if(skippedDetail.length){
                txt += `*⏭️ IGNORADOS (no son plugin):*\n`
                txt += skippedDetail.slice(0,15).join('\n')
                if(skippedDetail.length>15) txt+= `\n... y ${skippedDetail.length-15} mas`
            }
            if(fail==0) txt+= `\n✅ Todo cargado sin errores`

            await sock.sendMessage(jid, { text: txt.slice(0, 4000) }, { quoted: msg })

        }catch(e){
            await sock.sendMessage(jid, { text: `❌ Error fatal en reload:\n${e.message}\n\n📁 Ruta: ${e.stack?.split('\n')[1]||''}` }, { quoted: msg })
        }
    }
}