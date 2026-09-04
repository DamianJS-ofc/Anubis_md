export default {
 name:'pokedex',
 alias:['dex','mispokes'],
 category:'poke-gacha',
 description:'Ver tu pokedex',
 async Main(sock,msg){
  const fs=await import('fs')
  const DB='./database/pokemons.json'
  function getDB(){ try{ let d=JSON.parse(fs.readFileSync(DB)); if(!d.groups) d={groups:{},lidMap:d.lidMap||{}}; return d }catch{return {groups:{},lidMap:{}}} }
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }

  const jid=String(msg.key.remoteJid)
  let raw=String(msg.key.participant||msg.key.remoteJid)

  // FIX LID: si no resuelve, se queda con el LID, no con 0
  let user=raw
  try{
    if(raw.endsWith('@lid')){
      let pn=await sock?.signalRepository?.lidMapping?.getPNForLID?.(raw)
      if(pn && String(pn).includes('@')) user=String(pn)
    }
  }catch{}

  const db=getDB(); let g=getGroup(db,jid)
  if(!g.users[user]?.pokes?.length) return sock.sendMessage(jid,{text:`🔍 No tienes pokemons, usa.pokemon`},{quoted:msg})

  let name=msg.pushName||user.split('@')[0]
  let txt=`📔 *POKEDEX*\n@${name} tienes ${g.users[user].pokes.length} pokes:\n\n`
  g.users[user].pokes.forEach((p,i)=>{ txt+=`${i+1}. ${p.name} #${p.id} - Lvl ${p.lvl||1}\n` })
  await sock.sendMessage(jid,{text:txt,mentions:[raw]},{quoted:msg})
 }
}