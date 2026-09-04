export default {
 name:'pokebatalla',
 alias:['batalla','battle','pvp'],
 category:'poke-gacha',
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

  let mentioned=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
  if(!mentioned) return sock.sendMessage(jid,{text:`⚔️ Menciona a alguien para batallar\nEj:.pokebatalla @usuario`},{quoted:msg})
  mentioned=clean(mentioned)

  const db=getDB(); let g=getGroup(db,jid)
  let u1=g.users[user], u2=g.users[mentioned]
  if(!u1?.pokes?.length) return sock.sendMessage(jid,{text:`❌ No tienes pokemons`},{quoted:msg})
  if(!u2?.pokes?.length) return sock.sendMessage(jid,{text:`❌ El otro no tiene pokemons`},{quoted:msg})

  let p1=u1.pokes[Math.floor(Math.random()*u1.pokes.length)]
  let p2=u2.pokes[Math.floor(Math.random()*u2.pokes.length)]

  let power1=p1.power||Math.floor(Math.random()*200)+50
  let power2=p2.power||Math.floor(Math.random()*200)+50

  let winner=power1>=power2?user:mentioned
  let loser=winner===user?mentioned:user
  let winPoke=winner===user?p1:p2
  let losePoke=winner===user?p2:p1

  let img=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${winPoke.id||25}.png`

  let txt=`⚔️ *POKEBATALLA*\n\n👤 ${clean(u1.name)} [${p1.name}] Poder ${power1}%\n🆚\n👤 ${clean(u2.name)} [${p2.name}] Poder ${power2}%\n\n🏆 Ganador: @${winner.split('@')[0]} con ${winPoke.name}\n💀 Perdedor: ${losePoke.name}`

  await sock.sendMessage(jid,{image:{url:img},caption:txt,mentions:[user,mentioned]},{quoted:msg})
 }
}