import { execSync } from 'child_process'
import settings from '../settings.js'

function getNumber(jid=''){return jid.split('@')[0].replace(/[^0-9]/g,'')}
function isOwnerCheck(msg,flag){
  if(flag) return true
  const sender=msg.key.participant||msg.key.remoteJid||''
  const senderNum=getNumber(sender)
  const owners=(settings.owner||[]).map(o=>getNumber(o))
  return owners.includes(senderNum)
}

export default{
  name:'update',
  alias:['up','pushgit','save'],
  category:'Owner',
  description:'Sube a GitHub',
  async Main(sock,msg,{args,isOwner}){
    const jid=msg.key.remoteJid
    if(!isOwnerCheck(msg,isOwner)){
      return sock.sendMessage(jid,{text:`❌ No sos owner`},{quoted:msg})
    }
    let commitMsg=args.join(' ')||'update bot'
    try{
      execSync('git config user.email "anubis@bot.com"')
      execSync('git config user.name "Anubis"')

      // chequear si hay cambios
      let status = execSync('git status --porcelain').toString().trim()
      if(!status){
        return sock.sendMessage(jid,{text:`🔍 Estado todo actualizado`},{quoted:msg})
      }

      execSync('git add.')
      try{execSync(`git commit -m "${commitMsg.replace(/"/g,"'")}"`)}catch{}

      let token=process.env.TOURL_TOKEN||process.env.GITHUB_TOKEN
      if(token){execSync(`git remote set-url origin https://${token}@github.com/DamianJS-ofc/Anubis_md.git`)}

      execSync('git push origin main')
      await sock.sendMessage(jid,{text:`🚀 Actualizado`},{quoted:msg})

    }catch(e){
      // si ya está actualizado git tira ese error
      if(e.message.includes('up-to-date') || e.message.includes('Everything')){
        return sock.sendMessage(jid,{text:`🔍 Estado todo actualizado`},{quoted:msg})
      }
      sock.sendMessage(jid,{text:`❌ ${e.message.slice(0,300)}`},{quoted:msg})
    }
  }
}