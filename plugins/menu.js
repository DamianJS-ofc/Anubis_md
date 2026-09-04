import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent, prepareWAMessageMedia } from 'baileys'
async function fetchBuffer(url){ try{ const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}); return Buffer.from(await r.arrayBuffer()) }catch{ return null } }
function getAllJSFiles(dir){ let res=[]; for(const f of fs.readdirSync(dir)){ const fp=path.join(dir,f); const s=fs.statSync(fp); if(s.isDirectory()) res=res.concat(getAllJSFiles(fp)); else if(f.endsWith('.js')) res.push(fp) } return res }
function extractNameAndCat(fp){
 try{
  const c=fs.readFileSync(fp,'utf8');
  const n=c.match(/name\s*:\s*['"`]([^'"`]+)['"`]/);
  const cat=c.match(/category\s*:\s*['"`]([^'"`]+)['"`]/);
  const desc=c.match(/description\s*:\s*['"`]([^'"`]+)['"`]/);
  const al=c.match(/alias\s*:\s*\[([^\]]+)\]/);
  if(!n) return null;
  let alias=[]; if(al) alias=al[1].split(',').map(a=>a.replace(/['"`\s]/g,'')).filter(Boolean);
  let catV=cat?cat[1]:'OTROS'; let low=catV.toLowerCase();
  if(['admin','group','grupos','adm'].includes(low)) catV='GRUPO';
  else if(['fun','juego','games','diversion'].includes(low)) catV='JUEGOS';
  else catV=catV.toUpperCase();
  return { name: n[1].trim(), cat: catV, desc: desc?desc[1]:'Sin descripcion', alias };
 }catch{ return null }
}
export default {
 name:'menu', alias:['help','comandos'], category:'General',
 async Main(sock, msg, { settings }){
  const jid=msg.key.remoteJid
  const files=getAllJSFiles(path.join(process.cwd(),'plugins'))
  const cats={}; const vistos=new Set()
  for(const file of files){
   const data=extractNameAndCat(file); if(!data) continue;
   if(vistos.has(data.name.toLowerCase())) continue
   vistos.add(data.name.toLowerCase())
   const k=data.cat.toLowerCase(); if(!cats[k]) cats[k]=[]; cats[k].push(data)
  }
  const total=files.length
  let txt=`> ⊹•୭ ʜᴏʟᴀ @${msg.pushName} sᴏʏ ${settings.botName} ${settings.botType} ᴀǫᴜɪ ᴛɪᴇɴᴇ ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs ᴄᴏɴ ${total} ᴄᴏᴍᴀɴᴅᴏs ᴘᴀʀᴀ ᴇxᴘʟᴏʀᴀʀ ᴇɴ ᴇʟ ʙᴏᴛ /ᐠ-˕-マ\n`
  txt+=`┌───────────\n│ 🦑 ᵖᵒʷᵉʳᵉᵈ ᵇʸ ᴰᵃᵐⁱᵃⁿᴶˢ-ᵒᶠᶜ\n│ ☕︎ web ofc: anubissuport.netlify.app\n│ ✐ Channel: ${settings.channelLink}\n└──────────────┘\n\n⊹ •. ๋ ୭ ˚ ·\n\n`
  for(const k of Object.keys(cats).sort()){
   txt+=`*˗ˏˋ 『${k.toUpperCase()}』=^•ω•^= ˎˊ˗*\n> comandos de ${k}\n`
   for(const cmd of cats[k].sort((a,b)=>a.name.localeCompare(b.name))){
    const aliasText=cmd.alias.length?` (${cmd.alias.join(', ')})`:''; txt+=`✜ ${cmd.name}${aliasText}\n> ➧ ${cmd.desc}\n`
   }
   txt+=`\n`
  }
  let buffer=await fetchBuffer(settings.bannerUrl)
  const media=await prepareWAMessageMedia({ image: buffer }, { upload: sock.waUploadToServer })
  const payload={
    header:{ hasMediaAttachment:true, imageMessage: media.imageMessage },
    body:{ text: txt },
    footer:{ text:`😎 ${settings.botName} MD 😎` },
    nativeFlowMessage:{ buttons:[], messageParamsJson: JSON.stringify({ limited_time_offer:{ text:'×͜× Menu List', url: settings.channelLink, copy_Developer:'×͜× DamianJS ×͜×', expiration:999999 } }) },
    contextInfo:{
      mentionedJid: [msg.key.participant || jid],
      isForwarded:true, forwardingScore:999,
      forwardedNewsletterMessageInfo:{ newsletterJid: settings.channelId, newsletterName: settings.channelName, serverMessageId:1 }
    }
  }
  const genMsg=generateWAMessageFromContent(jid, { viewOnceMessage:{ message:{ interactiveMessage: payload } } }, { quoted: msg })
  await sock.relayMessage(jid, genMsg.message, { messageId: genMsg.key.id })
 }
}
