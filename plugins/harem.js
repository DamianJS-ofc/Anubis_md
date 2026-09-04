import fsSync from 'fs';

function loadJSON(p,def={}){ try{ if(!fsSync.existsSync(p)) return def; return JSON.parse(fsSync.readFileSync(p,'utf8')||JSON.stringify(def)); }catch{ return def } }

async function run(sock, msg, { args }){
  const chatId = msg.key.remoteJid;
  const CLAIMS_PATH = './core/claims.json';
  const claims = loadJSON(CLAIMS_PATH,{});

  // usuario target: mencionado, o el que escribe
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const targetId = mentioned || msg.key.participant || msg.key.remoteJid;
  const isSelf = targetId === (msg.key.participant || msg.key.remoteJid);

  // filtrar solo de este grupo
  const userClaims = Object.entries(claims)
   .filter(([k,v]) => k.startsWith(chatId+'__') && v.user === targetId)
   .map(([k,v]) => ({ key:k,...v }));

  if(!userClaims.length){
    return sock.sendMessage(chatId, { text: `${isSelf?'No tienes':'@'+targetId.split('@')[0]+' no tiene'} personajes reclamados.\nUsa.rw para empezar.`, mentions: isSelf?[]:[targetId] }, { quoted: msg });
  }

  // ordenar por valor
  userClaims.sort((a,b)=> (b.value||0)-(a.value||0));

  const totalValue = userClaims.reduce((s,c)=> s+(c.value||100),0);
  const page = parseInt(args[0])||1;
  const perPage = 15;
  const totalPages = Math.ceil(userClaims.length/perPage);
  const slice = userClaims.slice((page-1)*perPage, page*perPage);

  let text = `🎋 *HAREM DE @${targetId.split('@')[0]}* 🎋\n`;
  text += `👥 Personajes: *${userClaims.length}*\n`;
  text += `🪙 Valor total: *${totalValue.toLocaleString()}*\n\n`;

  slice.forEach((c,i)=>{
    const idx = (page-1)*perPage + i + 1;
    text += `*${idx}.* ${c.name} » ${c.value||100} ${c.gender?'('+c.gender+')':''}\n`;
  });

  if(totalPages>1){
    text += `\n📄 Página ${page}/${totalPages}\nUsa.harem ${page+1} para ver más`;
  }

  await sock.sendMessage(chatId, { text, mentions:[targetId] }, { quoted: msg });
}

export default {
  name: 'harem',
  comando: 'harem',
  alias: ['h','waifus','miswaifus'],
  category: 'Gacha',
  description: 'Ver tus waifus reclamadas',
  Main: run,
  execute: run
}