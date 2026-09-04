import { execSync } from 'child_process'

export default {
    name: 'npm',
    alias: ['npminstall'],
    category: 'Owner',
    description: 'Instala dependencias desde WhatsApp',
    async Main(sock, msg, { args, settings }){
        const jid = msg.key.remoteJid
        const sender = msg.key.participant || jid
        
        // SOLO OWNER
        const isOwner = msg.key.fromMe || settings.owner?.includes(sender) || settings.ownerNumber?.some(n => sender.includes(n))
        if(!isOwner) return sock.sendMessage(jid, { text: '❌ Solo el owner puede usar esto' }, { quoted: msg })

        const input = args.join(' ').trim()
        if(!input) {
          return sock.sendMessage(jid, { text: `📦 *Instalador NPM*\n\nUso:\n.npm i wa-sticker-formatter\n.npm i sharp\n.npm i ffmpeg-static\n.npm uninstall sharp\n.npm list` }, { quoted: msg })
        }

        try{
            await sock.sendMessage(jid, { react: { text:'📦', key: msg.key } })
            await sock.sendMessage(jid, { text: `⏳ Instalando: \`${input}\`...` }, { quoted: msg })

            let cmd = ''
            if(input.startsWith('i ') || input.startsWith('install ')){
                cmd = `npm ${input} --save`
            } else if(input.startsWith('uninstall ') || input.startsWith('un ')){
                cmd = `npm ${input}`
            } else if(input === 'list' || input === 'ls'){
                const list = execSync('npm list --depth=0', { encoding: 'utf-8' })
                return sock.sendMessage(jid, { text: `📋 Paquetes:\n\`\`\`${list.slice(0,3500)}\`\`\`` }, { quoted: msg })
            } else {
                // si pone solo el nombre -> npm i nombre
                cmd = `npm i ${input} --save`
            }

            const out = execSync(cmd, { encoding: 'utf-8', timeout: 120000 })
            
            await sock.sendMessage(jid, { text: `✅ *Instalado con éxito*\n\nComando: \`${cmd}\`\n\n\`\`\`${out.slice(-3000)}\`\`\`` }, { quoted: msg })
            await sock.sendMessage(jid, { react: { text:'✅', key: msg.key } })

        }catch(e){
            await sock.sendMessage(jid, { text: `❌ Error al instalar:\n\`\`\`${(e.message + '\n' + (e.stdout||'') + (e.stderr||'')).slice(0,3500)}\`\`\`` }, { quoted: msg })
        }
    }
}