export default {
 name:'atrapar',
 alias:['catch','atraparpoke'],
 category:'poke-gacha',
 description:'Atrapa al salvaje',
 async Main(sock,msg){
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

  const db=getDB(); let g=getGroup(db,jid)
  if(!g.wild) return sock.sendMessage(jid,{text:`🔍 No hay pokemon salvaje, usa.pokemon`},{quoted:msg})
  if(!g.users[user]) g.users[user]={balls:15,coins:200,pokes:[],name:clean(msg.pushName)||'Entrenador'}
  if(msg.pushName) g.users[user].name=clean(msg.pushName)

  let wild=g.wild
  g.users[user].pokes.push({id:wild.id,name:wild.name,lvl:1,power:wild.power})
  g.wild=null
  saveDB(db)

  await sock.sendMessage(jid,{text:`🚀 Pokemon reclamado\n${wild.name}`,mentions:[user]},{quoted:msg})
 }
}