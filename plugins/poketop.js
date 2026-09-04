export default {
 name:'poketop',
 alias:['top','rankpoke'],
 category:'poke-gacha',
 description:'Top de entrenadores del grupo',
 async Main(sock,msg){
  const fs=await import('fs')
  const DB='./database/pokemons.json'
  function getDB(){ try{ let d=JSON.parse(fs.readFileSync(DB)); if(!d.groups) d={groups:{},lidMap:d.lidMap||{}}; return d }catch{return {groups:{},lidMap:{}}} }
  function saveDB(d){fs.writeFileSync(DB,JSON.stringify(d,null,2))}
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }

  const jid=String(msg.key.remoteJid)
  const db=getDB(); let g=getGroup(db,jid)

  // Limpieza total del bug :0
  for(let k of Object.keys(g.users||{})){
    if(k==='0' || k==='0@s.whatsapp.net' || k.length<5 ||!k.includes('@')){
      delete g.users[k]
    }
  }
  saveDB(db)

  let users=Object.entries(g.users||{}).sort((a,b)=>(b[1].pokes?.length||0)-(a[1].pokes?.length||0))
  if(!users.length) return sock.sendMessage(jid,{text:`🔍 Nadie tiene pokemons, usa.pokemon`},{quoted:msg})

  let emojis=['🥇 Primer lugar','🥈 Segundo lugar','🥉 Tercer lugar','🏅 Cuarto lugar','🎖️ Quinto lugar']
  let txt=`🏆 *POKETOP - GRUPO* 🏆\n\n`
  let mentions=[]

  for(let i=0;i<Math.min(users.length,5);i++){
    let [uid,data]=users[i]
    uid=String(uid)
    mentions.push(uid)
    let displayName=data.name || data.pushName || uid.split('@')[0]
    if(displayName==='0') displayName='Desconocido'
    txt+=`*${emojis[i]}*\n😎. (*User:* ) ${displayName} @${uid.split('@')[0]}\n⚡. *pokemons:* ${data.pokes?.length||0}\n💳. *coins:* ${data.coins||0}\n\n`
  }

  await sock.sendMessage(jid,{text:txt.trim(),mentions},{quoted:msg})
 }
}