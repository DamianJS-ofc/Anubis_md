export default {
 name:'comprar',
 alias:['buy','tienda','shop','balls'],
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

  const db=getDB(); let g=getGroup(db,jid)
  if(!g.users[user]) g.users[user]={balls:15,coins:200,pokes:[],name:clean(msg.pushName)||'Entrenador'}
  let u=g.users[user]
  if(msg.pushName) u.name=clean(msg.pushName)

  if(!args[0]){
    let txt=`🛒 *TIENDA POKEMON*\n\n👤 ${u.name}\n🪙 Coins: ${u.coins}\n⚽ Balls: ${u.balls}\n\n| *Item* | *Precio* |\n| pokeball | 50 coins |\n| superball | 120 coins |\n| ultraball | 250 coins |\n\n> Usa:.comprar pokeball`
    return sock.sendMessage(jid,{text:txt,mentions:[user]},{quoted:msg})
  }

  let item=args[0].toLowerCase()
  let prices={pokeball:50,superball:120,ultraball:250,ball:50}

  if(!prices[item]) return sock.sendMessage(jid,{text:`❌ Item no existe`},{quoted:msg})
  if(u.coins < prices[item]) return sock.sendMessage(jid,{text:`❌ No te alcanza, necesitas ${prices[item]} coins y tienes ${u.coins}`},{quoted:msg})

  u.coins-=prices[item]
  u.balls+= (item==='superball'?2:item==='ultraball'?5:1)
  saveDB(db)

  await sock.sendMessage(jid,{text:`✅ Compraste 1 ${item}\n⚽ Balls: ${u.balls}\n🪙 Coins: ${u.coins}`,mentions:[user]},{quoted:msg})
 }
}