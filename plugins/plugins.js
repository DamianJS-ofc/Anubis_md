import fs from 'fs'
import path from 'path'

function getAll(dir){
  let res=[]
  if(!fs.existsSync(dir)) return res
  for(const f of fs.readdirSync(dir)){
    const fp=path.join(dir,f)
    const s=fs.statSync(fp)
    if(s.isDirectory()) res=res.concat(getAll(fp))
    else if(f.endsWith('.js')) res.push(fp)
  }
  return res
}

function isOwner(msg, settings){
  const p=(msg.key.participant||msg.key.remoteJid||"").toString()
  const num=p.replace(/[^0-9]/g,'')
  const owners=settings.owner||settings.owners||[]
  return owners.some(o=>p.includes(o)||num.includes(o.toString().replace(/[^0-9]/g,'')))
}

export default {
  name: 'plugins',
  alias: ['plugs'],
  category: 'Owner',
    description: 'Lista plugins con archivo',
  async Main(sock, msg, { settings }){
    const jid=msg.key.remoteJid
    if(!isOwner(msg, settings)) return

    const files=getAll(path.join(process.cwd(),'plugins'))
    let list=[]

    for(const file of files){
      try{
        const code=fs.readFileSync(file,'utf8')
        const name=code.match(/name\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] || path.basename(file,'.js')
        const aliasRaw=code.match(/alias\s*:\s*\[([^\]]+)\]/)?.[1] || ''
        const aliases=(aliasRaw.match(/['"`]([^'"`]+)['"`]/g)||[]).map(x=>x.replace(/['"`]/g,''))
        const fileName=path.basename(file)
        list.push({ name, aliases, fileName })
      }catch{}
    }

    list=list.sort((a,b)=>a.name.localeCompare(b.name))

    let txt=`*📦 PLUGINS ANUBIS - ${list.length}*\n\n`

    for(const p of list){
      const aliasTxt = p.aliases.length? p.aliases.join(', ') : 'sin alias'
      txt+=`╭─────────────\n`
      txt+=`│ 📂 ${p.fileName} ⟩\n`
      txt+=`│ ⚡ ${p.name} ⟩\n`
      txt+=`│ 🍟 ${aliasTxt} ⟩\n`
      txt+=`╰─────────────\n\n`
    }

    await sock.sendMessage(jid, { text: txt }, { quoted: msg })
  }
}