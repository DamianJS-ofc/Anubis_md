import fs from 'fs'
const p='./database/economy.json'
const load=()=>{try{return JSON.parse(fs.readFileSync(p))}catch{return{}}}
const save=(d)=>{fs.mkdirSync('./database',{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
export default{
name:'crimen',alias:['crime'],category:'RPG',
    description: 'Comete un crimen por dinero',
async Main(sock,msg){
const jid=msg.key.remoteJid; const uid=msg.key.participant||jid
const db=load(); if(!db[uid]) db[uid]={coins:0,lastCrime:0}
if(Date.now()-db[uid].lastCrime < 600000) return sock.sendMessage(jid,{text:`🚔 Espera 10min`},{quoted:msg})
const ok=Math.random()>0.4
if(ok){const r=Math.floor(Math.random()*1500)+500; db[uid].coins+=r; db[uid].lastCrime=Date.now(); save(db); sock.sendMessage(jid,{text:`🔪 Robaste ${r} coins\nSaldo: ${db[uid].coins}`},{quoted:msg})}
else{const m=Math.floor(Math.random()*600)+200; db[uid].coins=Math.max(0,db[uid].coins-m); db[uid].lastCrime=Date.now(); save(db); sock.sendMessage(jid,{text:`🚨 Te atraparon -${m} coins\nSaldo: ${db[uid].coins}`},{quoted:msg})}
}}
