import fs from 'fs'
const p='./database/economy.json'
const load=()=>{try{return JSON.parse(fs.readFileSync(p))}catch{return{}}}
const save=(d)=>{fs.mkdirSync('./database',{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
export default{
name:'daily',category:'RPG',
    description: 'Reclama tu recompensa diaria',
async Main(sock,msg){
const jid=msg.key.remoteJid; const uid=msg.key.participant||jid
const db=load(); if(!db[uid]) db[uid]={coins:0,lastDaily:0}
if(Date.now()-db[uid].lastDaily < 86400000) return sock.sendMessage(jid,{text:`🎁 Ya reclamaste daily`},{quoted:msg})
db[uid].coins+=1000; db[uid].lastDaily=Date.now(); save(db)
sock.sendMessage(jid,{text:`🎁 Daily +1000 coins\nSaldo: ${db[uid].coins}`},{quoted:msg})
}}
