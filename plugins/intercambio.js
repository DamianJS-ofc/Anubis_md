export default {
 name:'pokeintercambio',
 alias:['intercambio','trade','intercambiar'],
 category:'poke-gacha',
 async Main(sock,msg,args){
  const fs=await import('fs')
  const DB='./database/pokemons.json'
  function getDB(){ try{ return JSON.parse(fs.readFileSync(DB)) }catch{return {groups:{}}} }
  function saveDB(d){fs.writeFileSync(DB,JSON.stringify(d,null,2))}
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }
  function clean(s){ return String(s).replace(/:\d+@/g,'@').replace(/:\d+/g,'') }

  const jid=String(msg.key.remoteJid)
  let raw=clean(String(msg.key.participant||msg.key.remoteJid))
  let user=raw
  try{ if(raw.endsWith('@lid')){ let pn=await sock?.signalRepository?.lidMapping?.getPNForLID?.(raw); if(pn) user=clean(String(pn)) } }catch{}

  let mentioned=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
  if(!mentioned ||!args[1]) return sock.sendMessage(jid,{text:`🔄 Uso:.pokeintercambio @usuario nombre_pokemon\nEj:.pokeintercambio @Damian pikachu`},{quoted:msg})
  mentioned=clean(mentioned)
  let pokeName=args.slice(1).join(' ').toLowerCase()

  const db=getDB(); let g=getGroup(db,jid)
  let u1=g.users[user]
  if(!u1) return sock.sendMessage(jid,{text:`❌ No tienes pokemons`},{quoted:msg})

  let idx=u1.pokes.findIndex(p=>p.name.toLowerCase()===pokeName)
  if(idx===-1) return sock.sendMessage(jid,{text:`❌ No tienes a ${pokeName}\nTu mochila: ${u1.pokes.map(p=>p.name).join(', ')}`},{quoted:msg})

  if(!g.users[mentioned]) g.users[mentioned]={balls:15,coins:200,pokes:[],name:mentioned.split('@')[0]}
  let poke=u1.pokes.splice(idx,1)[0]
  g.users[mentioned].pokes.push(poke)
  saveDB(db)

  await sock.sendMessage(jid,{text:`🔄 Intercambio exitoso\n${clean(u1.name)} le dio ${poke.name} a @${mentioned.split('@')[0]}`,mentions:[user,mentioned]},{quoted:msg})
 }
}