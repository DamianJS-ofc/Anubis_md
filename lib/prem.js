import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from 'baileys'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
const DIR = './database/subbots-premium'
if(!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
export function isPremium(jid){
  try{
    let d = JSON.parse(fs.readFileSync('./database/premium.json'))
    let num = jid.split('@')[0]
    return d.some(p=> p.id===num && Date.now() < p.expires)
  }catch{ return false }
}
export function validateToken(token){
  let tokens = JSON.parse(fs.readFileSync('./database/tokens.json'))
  if(!tokens[token]) return { ok:false, msg:'Token inválido' }
  if(tokens[token].used) return { ok:false, msg:'Ya usado' }
  return { ok:true, data: tokens[token] }
}
export function useToken(token, userNum){
  let tokens = JSON.parse(fs.readFileSync('./database/tokens.json'))
  let premium = JSON.parse(fs.readFileSync('./database/premium.json'))
  tokens[token].used = true; tokens[token].usedBy = userNum
  fs.writeFileSync('./database/tokens.json', JSON.stringify(tokens, null, 2))
  const exp = Date.now() + (tokens[token].days*24*60*60*1000)
  premium = premium.filter(p=> p.id!==userNum)
  premium.push({ id: userNum, expires: exp })
  fs.writeFileSync('./database/premium.json', JSON.stringify(premium, null, 2))
  return exp
}
export async function startPremBot(targetNum, mainSock){
  const id = targetNum.replace(/[^0-9]/g,'')
  const sessionPath = path.join(DIR, id)
  if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) },
    logger: pino({level:'silent'}),
    browser: ['Anubis Premium', 'Chrome', '2.0'],
    markOnlineOnConnect: false
  })
  sock.ev.on('creds.update', saveCreds)
  await new Promise(r=> setTimeout(r, 1500))
  return sock
}
