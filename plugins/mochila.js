export default {
 name:'mochila',
 alias:['inv','inventario'],
 category:'poke-gacha',
 async Main(sock,msg){
  const fs=await import('fs')
  const DB='./database/pokemons.json'
  function getDB(){ try{ return JSON.parse(fs.readFileSync(DB)) }catch{return {groups:{}}} }
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }
  function clean(s){ return String(s).replace(/:\d+@/g,'@').replace(/:\d+/g,'') }

  const jid=String(msg.key.remoteJid)
  let raw=clean(String(msg.key.participant||msg.key.remoteJid))
  let user=raw
  try{ if(raw.endsWith('@lid')){ let pn=await sock?.signalRepository?.lidMapping?.getPNForLID?.(raw); if(pn) user=clean(String(pn)) } }catch{}

  const db=getDB(); let g=getGroup(db,jid)
  let u=g.users[user]
  if(!u) return sock.sendMessage(jid,{text:`🎒 No tienes nada, usa.pokemon`},{quoted:msg})

  let list=u.pokes.map(p=>`• ${p.name} [Lvl ${p.lvl||1}]`).join('\n') || 'Vacía'
  let txt=`🎒 *MOCHILA DE ${clean(u.name)}*\n\n🪙 ${u.coins} coins\n⚽ ${u.balls} balls\n\n👾 *Pokes (${u.pokes.length}):*\n${list}`

  await sock.sendMessage(jid,{text:txt,mentions:[user]},{quoted:msg})
 }
}