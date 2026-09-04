import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import pino from "pino"
import { Boom } from "@hapi/boom"
import chalk from "chalk"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const baileys = require("baileys")
const makeWASocket = baileys.default || baileys.makeWASocket || baileys
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = baileys
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const SUBBOT_DIR = path.join(ROOT, "database", "subbots")
const JADIBOTS_JSON = path.join(ROOT, "database", "jadibots.json")
if(!fs.existsSync(SUBBOT_DIR)) fs.mkdirSync(SUBBOT_DIR,{recursive:true})
export async function startSubBot(id, handler, plugins, settings){
  const clean=String(id).replace(/[^0-9]/g,"")
  const sessionPath=path.join(SUBBOT_DIR,clean)
  if(!fs.existsSync(sessionPath)) return
  const {state,saveCreds}=await useMultiFileAuthState(sessionPath)
  const {version}=await fetchLatestBaileysVersion()
  const sock=makeWASocket({version,auth:state,logger:pino({level:"silent"}),browser:Browsers.macOS("Chrome"),markOnlineOnConnect:false,syncFullHistory:false})
  sock.ev.on("creds.update",saveCreds)
  sock.ev.on("connection.update",async({connection,lastDisconnect})=>{
    if(connection==="open") console.log(chalk.green("SubBot "+clean+" conectado"))
    if(connection==="close"){
      const reason=new Boom(lastDisconnect?.error)?.output?.statusCode
      console.log(chalk.yellow("SubBot "+clean+" cerrado: "+reason))
      if(reason===401||reason===DisconnectReason.loggedOut){
        console.log(chalk.red("SubBot "+clean+" muerto, borrando"))
        try{fs.rmSync(sessionPath,{recursive:true,force:true})}catch{}
        try{
          if(fs.existsSync(JADIBOTS_JSON)){
            let db=JSON.parse(fs.readFileSync(JADIBOTS_JSON,"utf-8")||"[]")
            if(Array.isArray(db)) db=db.filter(x=>String(x).replace(/[^0-9]/g,"")!==clean)
            fs.writeFileSync(JADIBOTS_JSON,JSON.stringify(db))
          }
        }catch{}
      }else{
        setTimeout(()=>startSubBot(clean,handler,plugins,settings),4000)
      }
    }
  })
  sock.ev.on("messages.upsert",async({messages})=>{
    let m=messages[0]
    if(!m.message||m.key.fromMe) return
    await handler(sock,m,plugins,settings)
  })
  return sock
}
export async function loadAllSubBots(handler,plugins,settings){
  try{
    if(!fs.existsSync(SUBBOT_DIR)){console.log(chalk.green("> ✅ Sub-bots cargados desde db (0)"));return}
    const folders=fs.readdirSync(SUBBOT_DIR).filter(f=>/^\d+$/.test(f))
    console.log(chalk.green("> ✅ Sub-bots cargados desde db ("+folders.length+")"))
    for(const id of folders){await startSubBot(id,handler,plugins,settings);await new Promise(r=>setTimeout(r,1500))}
  }catch(e){console.log(chalk.green("> ✅ Sub-bots cargados desde db (0)"))}
}
