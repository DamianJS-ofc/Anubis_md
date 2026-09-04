import fsSync from 'fs';
function loadJSON(p,def={}){ try{ if(!fsSync.existsSync(p)) return def; return JSON.parse(fsSync.readFileSync(p,'utf8')||JSON.stringify(def)); }catch{ return def } }
function saveJSON(p,d){ fsSync.mkdirSync('./core',{recursive:true}); fsSync.writeFileSync(p,JSON.stringify(d,null,2)); }
async function run(sock,msg){
  const chatId=msg.key.remoteJid; const userId=msg.key.participant||msg.key.remoteJid;
  const qId=msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
  if(!qId) return sock.sendMessage(chatId,{text:'✳️ Cita un personaje con reply'},{quoted:msg});
  const ROLLS_PATH='./core/rolls.json'; const COOLDOWN_PATH='./core/cooldowns.json'; const CLAIMS_PATH='./core/claims.json';
  const rolls=loadJSON(ROLLS_PATH,{}); const cooldowns=loadJSON(COOLDOWN_PATH,{}); const claims=loadJSON(CLAIMS_PATH,{});
  const chatRolls=rolls[chatId]||{}; const roll=chatRolls[qId];
  if(!roll) return sock.sendMessage(chatId,{text:'✳️ Roll no encontrado'},{quoted:msg});
  const key=`${chatId}_${userId}_claim`; const now=Date.now();
  if(cooldowns[key]&&now<cooldowns[key]){ const r=Math.ceil((cooldowns[key]-now)/1000); return sock.sendMessage(chatId,{text:`⏳ Espera ${r}s`},{quoted:msg}); }
  const ch=claims[roll.charKey];
  if(!ch) return sock.sendMessage(chatId,{text:'⛔ No encontrado'},{quoted:msg});
  if(ch.user) return sock.sendMessage(chatId,{text:`⛔ Ya reclamado por @${ch.user.split('@')[0]}`,mentions:[ch.user]},{quoted:msg});
  ch.user=userId; ch.claimedAt=now; delete ch.reservedBy; delete ch.reservedUntil;
  claims[roll.charKey]=ch; cooldowns[key]=now+30*60*1000; chatRolls[qId].claimed=true; rolls[chatId]=chatRolls;
  saveJSON(CLAIMS_PATH,claims); saveJSON(COOLDOWN_PATH,cooldowns); saveJSON(ROLLS_PATH,rolls);
  await sock.sendMessage(chatId,{text:`🎋 *${ch.name}* reclamado por @${userId.split('@')[0]}`,mentions:[userId]},{quoted:msg});
}
export default{ name:'claim', comando:'claim', alias:['c','reclamar'], category:'Gacha', Main:run, execute:run }