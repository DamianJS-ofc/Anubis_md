import fs from 'fs'
export default{
name:'balance',alias:['bal','coins','banco'],category:'RPG',
    description: 'Ver tu dinero y banco',
async Main(sock,msg){
const jid=msg.key.remoteJid; const uid=msg.key.participant||jid
let db={}; try{db=JSON.parse(fs.readFileSync('./database/economy.json'))}catch{}
const c=db[uid]?.coins||0
sock.sendMessage(jid,{text:`💳 Saldo de @${uid.split('@')[0]}\n💰 ${c} coins`, mentions:[uid]},{quoted:msg})
}}
