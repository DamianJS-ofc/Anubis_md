export default {
 name:'pokemon',
 alias:['poke','wild'],
 category:'poke-gacha',
 description:'Aparece un pokemon salvaje',
 async Main(sock,msg){
  const fs=await import('fs')
  const fetch=global.fetch|| (await import('node-fetch')).default
  const DB='./database/pokemons.json'
  function getDB(){ try{ return JSON.parse(fs.readFileSync(DB)) }catch{return {groups:{}}} }
  function saveDB(d){fs.writeFileSync(DB,JSON.stringify(d,null,2))}
  function getGroup(db,jid){ if(!db.groups) db.groups={}; if(!db.groups[jid]) db.groups[jid]={users:{},wild:null}; return db.groups[jid] }
  function clean(s){ return String(s).replace(/:\d+@/g,'@').replace(/:\d+/g,'') }

  const jid=String(msg.key.remoteJid)
  const db=getDB(); let g=getGroup(db,jid)

  // pokemon random
  let id=Math.floor(Math.random()*150)+1
  let res=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r=>r.json()).catch(()=>null)
  if(!res) return
  let name=res.name
  let types=res.types.map(t=>t.type.name).join(', ')
  let hp=res.stats[0].base_stat
  let power=res.stats[1].base_stat + res.stats[2].base_stat
  let valor=Math.floor(Math.random()*200)+50
  let img=res.sprites.other['official-artwork'].front_default || res.sprites.front_default

  g.wild={id,name,types,hp,power,valor,img,lvl:1}
  saveDB(db)

  let txt=`🌿 *¡SALVAJE!* ${name}\n\n| ⚡ *Tipo:* ${types}\n| ❤️ *Salut:* ${hp}%\n| 🎯 *Poder:* ${power}%\n| 🎒 *inventario:*\n| 🪙 *Valor:* ${valor}\n> 🚀 Usa.atrapar para intentar atraparlo`

  await sock.sendMessage(jid,{image:{url:img},caption:txt},{quoted:msg})
 }
}