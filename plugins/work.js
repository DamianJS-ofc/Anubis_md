import fs from 'fs'
const p='./database/economy.json'
const load=()=>{try{return JSON.parse(fs.readFileSync(p))}catch{return{}}}
const save=(d)=>{fs.mkdirSync('./database',{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
export default{
name:'work',alias:['trabajar'],category:'RPG',
    description: 'Trabaja y gana dinero',
async Main(sock,msg){
const jid=msg.key.remoteJid; const uid=msg.key.participant||jid
const db=load(); if(!db[uid]) db[uid]={coins:0,lastWork:0}
if(Date.now()-db[uid].lastWork < 300000) return sock.sendMessage(jid,{text:`⏳ Espera 5min`},{quoted:msg})
const g=Math.floor(Math.random()*800)+200
db[uid].coins+=g; db[uid].lastWork=Date.now(); save(db)
sock.sendMessage(jid,{text:`💼 Trabajaste y ganaste ${g} coins\nSaldo: ${db[uid].coins}`},{quoted:msg})
}}
