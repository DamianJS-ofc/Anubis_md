export default {
 name:'balls',
 alias:['ball'],
 category:'poke-gacha',
 description:'Ver tus balls y coins',
 async Main(sock,msg){
  const fs=await import('fs')
  const DB='./database/pokemons.json'
  function getDB(){ try{ let d=JSON.parse(fs.readFileSync(DB)); if(!d.groups) d={groups:{},lidMap:d.lidMap||{}}; return d }catch{return {groups:{},lidMap:{}}} }
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }
  const jid=String(msg.key.remoteJid)
  let raw=String(msg.key.participant||msg.key.remoteJid)
  let user=raw
  try{ if(raw.endsWith('@lid')){ let pn=await sock?.signalRepository?.lidMapping?.getPNForLID?.(raw); if(pn&&String(pn).includes('@')) user=String(pn) } }catch{}
  const db=getDB(); let g=getGroup(db,jid)
  if(!g.users[user]) g.users[user]={balls:15,coins:200,pokes:[],num:user.split('@')[0]}
  let u=g.users[user]
  let name=msg.pushName||user.split('@')[0]
  await sock.sendMessage(jid,{text:`🎒 *TUS BALLS*\n@${name}\nPokeballs: ${u.balls}\nCoins: ${u.coins}`,mentions:[raw]},{quoted:msg})
 }
}