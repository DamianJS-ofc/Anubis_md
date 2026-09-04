import axios from 'axios';
import { promises as fs } from 'fs';
import fsSync from 'fs';

const FILE_PATH = './core/characters.json';
const ROLLS_PATH = './core/rolls.json';
const COOLDOWN_PATH = './core/cooldowns.json';
const CLAIMS_PATH = './core/claims.json';
const rollLocks = new Map();

function loadJSON(p, def={}){ try{ if(!fsSync.existsSync(p)) return def; return JSON.parse(fsSync.readFileSync(p,'utf8')||JSON.stringify(def)); }catch{ return def } }
function saveJSON(p, data){ fsSync.mkdirSync('./core',{recursive:true}); fsSync.writeFileSync(p, JSON.stringify(data, null, 2)); }
function cleanOldLocks(){ const now=Date.now(); for(const [k,v] of rollLocks.entries()) if(now-v>30000) rollLocks.delete(k); }
async function loadCharacters(){ try{ await fs.access(FILE_PATH); }catch{ await fs.writeFile(FILE_PATH,'{}'); } return JSON.parse(await fs.readFile(FILE_PATH,'utf-8')); }
function flattenCharacters(chars){ return Object.values(chars).flatMap(s=>Array.isArray(s.characters)?s.characters:[]); }
function getSeriesNameByCharacter(chars,id){ const f=Object.entries(chars).find(([,s])=>Array.isArray(s.characters)&&s.characters.some(c=>String(c.id)===String(id))); return f?.[1]?.name||'Desconocido'; }
function formatTag(t){ return String(t).trim().toLowerCase().replace(/\s+/g,'_'); }
function getRefererForUrl(u){ if(u.includes('safebooru.org')) return 'https://safebooru.org/'; if(u.includes('danbooru.donmai.us')) return 'https://danbooru.donmai.us/'; if(u.includes('gelbooru.com')) return 'https://gelbooru.com/'; return ''; }
async function buscarImagenDelirius(tag){
  const q=formatTag(tag);
  const urls=[`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${q}`,`https://danbooru.donmai.us/posts.json?tags=${q}`];
  for(const url of urls){ try{ const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) continue; const j=await r.json(); const d=Array.isArray(j)?j:j?.post||j?.data||[]; const v=d.map(i=>i?.file_url||i?.large_file_url).filter(u=>typeof u==='string'); if(v.length) return v; }catch{} } return [];
}
async function run(sock, msg, { prefix }){
  const chatId=msg.key.remoteJid; const userId=msg.key.participant||msg.key.remoteJid;
  cleanOldLocks();
  if(rollLocks.has(userId)&&Date.now()-rollLocks.get(userId)<15000) return;
  const cooldowns=loadJSON(COOLDOWN_PATH,{});
  const key=`${chatId}_${userId}_roll`; const now=Date.now();
  if(cooldowns[key]&&now<cooldowns[key]){ const r=Math.ceil((cooldowns[key]-now)/1000); return sock.sendMessage(chatId,{text:`⏳ Espera ${r}s`},{quoted:msg}); }
  rollLocks.set(userId,now);
  try{
    const chars=await loadCharacters(); const all=flattenCharacters(chars); if(!all.length) return sock.sendMessage(chatId,{text:'❌ No hay personajes'},{quoted:msg});
    const sel=all[Math.floor(Math.random()*all.length)]; const id=String(sel.id); const source=getSeriesNameByCharacter(chars,sel.id);
    const base=formatTag(sel.tags?.[0]||sel.name||''); const list=await buscarImagenDelirius(base); const media=list[Math.floor(Math.random()*list.length)];
    if(!media) return sock.sendMessage(chatId,{text:`❎ Sin imagen para ${sel.name}`},{quoted:msg});
    const rolls=loadJSON(ROLLS_PATH,{}); const claims=loadJSON(CLAIMS_PATH,{});
    const charKey=`${chatId}__${id}`;
    if(!claims[charKey]) claims[charKey]={name:sel.name, value:sel.value||100};
    claims[charKey].reservedBy=userId; claims[charKey].reservedUntil=now+20000; claims[charKey].expiresAt=now+60000;
    const caption=`🎋 Nombre » *${sel.name}*\n🧬 Género » *${sel.gender||'Desconocido'}*\n🪙 Valor » *${(claims[charKey].value||100).toLocaleString()}*\n💥 Estado » Libre\n🚀 Fuente » *${source}*`;
    const img=await axios.get(media,{responseType:'arraybuffer',timeout:15000});
    const sent=await sock.sendMessage(chatId,{image:Buffer.from(img.data),caption},{quoted:msg});
    if(!rolls[chatId]) rolls[chatId]={};
    rolls[chatId][sent.key.id]={id,charKey,name:sel.name,expiresAt:now+60000,reservedBy:userId,reservedUntil:now+20000};
    cooldowns[key]=now+15*60*1000;
    saveJSON(ROLLS_PATH,rolls); saveJSON(CLAIMS_PATH,claims); saveJSON(COOLDOWN_PATH,cooldowns);
  }catch(e){ console.log(e); await sock.sendMessage(chatId,{text:`Error: ${e.message}`},{quoted:msg}); }finally{ rollLocks.delete(userId); }
}
export default{ name:'rollwaifu', comando:'rollwaifu', alias:['rw','roll'], category:'Gacha', Main:run, execute:run }