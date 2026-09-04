import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment';
import gradient from 'gradient-string';

const PRIMARIOS_FILE = path.join(process.cwd(), 'database', 'primarios.json');

if (!fs.existsSync(path.join(process.cwd(), 'database'))) {
    fs.mkdirSync(path.join(process.cwd(), 'database'), { recursive: true });
}

let lidStore = {};

function getPrimaryBot(groupId) {
    try {
        if (fs.existsSync(PRIMARIOS_FILE)) {
            const data = JSON.parse(fs.readFileSync(PRIMARIOS_FILE, 'utf8'));
            return data[groupId] || null;
        }
    } catch (e) {}
    return null;
}

function savePrimaryBot(groupId, botNumber, botName) {
    try {
        let data = {};
        if (fs.existsSync(PRIMARIOS_FILE)) {
            data = JSON.parse(fs.readFileSync(PRIMARIOS_FILE, 'utf8'));
        }
        data[groupId] = {
            botNumber: botNumber,
            botName: botName || 'Bot',
            updated: Date.now()
        };
        fs.writeFileSync(PRIMARIOS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

function deletePrimaryBot(groupId) {
    try {
        if (fs.existsSync(PRIMARIOS_FILE)) {
            const data = JSON.parse(fs.readFileSync(PRIMARIOS_FILE, 'utf8'));
            if (data[groupId]) {
                delete data[groupId];
                fs.writeFileSync(PRIMARIOS_FILE, JSON.stringify(data, null, 2));
                return true;
            }
        }
    } catch (e) {}
    return false;
}

function getBotsFromFolder() {
    const basePath = path.join(process.cwd(), 'database', 'subbots');
    if (!fs.existsSync(basePath)) return [];
    try {
        const folders = fs.readdirSync(basePath);
        const bots = [];
        for (const folder of folders) {
            const credsPath = path.join(basePath, folder, 'creds.json');
            if (fs.existsSync(credsPath) && /^\d+$/.test(folder)) {
                bots.push(folder.replace(/\D/g, ''));
            }
        }
        return bots;
    } catch (e) {
        return [];
    }
}

function getAllAvailableBots(sock) {
    const subs = getBotsFromFolder();
    const main = sock?.user?.id ? cleanNumber(sock.user.id) : null;
    const allBots = [...new Set([...subs, main].filter(b => b && b !== ''))];
    return allBots;
}

function findBotsInGroup(groupMetadata, availableBots) {
    const botsInGroup = [];
    if (!groupMetadata?.participants) return botsInGroup;
    for (const p of groupMetadata.participants) {
        let pNumber = cleanNumber(p.id);
        if (p.phoneNumber) {
            pNumber = cleanNumber(p.phoneNumber);
        }
        if (availableBots.includes(pNumber)) {
            botsInGroup.push(pNumber);
        }
    }
    return botsInGroup;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function verificarYActualizarPrimario(sock, groupId) {
    try {
        const currentPrimary = getPrimaryBot(groupId);
        const groupMetadata = await sock.groupMetadata(groupId).catch(() => null);
        
        if (!groupMetadata) return null;
        
        const availableBots = getAllAvailableBots(sock);
        const botsInGroup = findBotsInGroup(groupMetadata, availableBots);
        
        if (botsInGroup.length === 0) {
            if (currentPrimary) {
                deletePrimaryBot(groupId);
                console.log(`[PRIMARY] ${groupId} - No hay bots disponibles, primario eliminado`);
            }
            return null;
        }
        
        if (currentPrimary) {
            const primaryNumber = currentPrimary.botNumber || currentPrimary;
            
            if (botsInGroup.includes(primaryNumber)) {
                return currentPrimary;
            } else {
                console.log(`[PRIMARY] ${groupId} - El bot primario ${primaryNumber} ya no está en el grupo, buscando nuevo...`);
                deletePrimaryBot(groupId);
            }
        }
        
        const shuffledBots = shuffleArray(botsInGroup);
        const newPrimary = shuffledBots[0];
        savePrimaryBot(groupId, newPrimary, newPrimary);
        console.log(`[PRIMARY] ${groupId} - Nuevo primario asignado: ${newPrimary}`);
        return getPrimaryBot(groupId);
        
    } catch (error) {
        console.log(`[PRIMARY] Error verificando ${groupId}: ${error.message}`);
        return null;
    }
}

export function getRealJid(jid) {
  if(!jid) return jid
  const s = String(jid)
  if(!s.endsWith('@lid')) return jid
  return lidStore[s] || jid
}

export function jidToNumber(jid) {
  const real = getRealJid(jid)
  let num = String(real).split('@')[0].split(':')[0].replace(/[^0-9]/g,'')
  if(num.length > 13) num = num.slice(0,13)
  return num
}

export function updateLidStore(meta) {
  if(!meta?.participants) return
  for(const p of meta.participants) {
    if(p.lid && p.id) lidStore[p.lid] = p.id
    if(p.id?.endsWith('@lid') && p.phoneNumber) lidStore[p.id] = p.phoneNumber
  }
}

export async function handleEvents(sock, anu) {
  try {
    const { isActivo } = await import('./lib/activos.js')
    const groupId = anu.id
    if(!isActivo('welcome', groupId) &&!isActivo('bye', groupId)) return
    const metadata = await sock.groupMetadata(groupId).catch(()=>null)
    if(!metadata) return
    updateLidStore(metadata)
    for(let p of anu.participants){
      const pJid = typeof p === 'string'? p : (p.id || p.jid || '')
      if(!pJid) continue
      const realJid = getRealJid(pJid)
      let pp = await sock.profilePictureUrl(realJid, 'image').catch(()=> 'https://raw.githubusercontent.com/JTxs00/uploads/main/1788325272382.jpeg')
      let name = jidToNumber(realJid)
      if(anu.action == 'add' && isActivo('welcome', groupId)){
        await sock.sendMessage(groupId, { image: { url: pp }, caption: `WELCOME @${name}`, mentions: [realJid] })
      }
      if(anu.action == 'remove' && isActivo('bye', groupId)){
        await sock.sendMessage(groupId, { text: `BYE @${name}`, mentions: [realJid] })
      }
    }
  } catch(e){ console.log('eventos error', e.message) }
}

function getBody(msg) {
  return msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || ''
}

function getPlugin(plugins, cmd){
  let plug = plugins instanceof Map? plugins.get(cmd) : plugins[cmd]
  if(!plug) return null
  if(!plug.Main){
    if(plug.execute) plug.Main = plug.execute
    else if(plug.run) plug.Main = plug.run
  }
  return plug
}

function cleanNumber(number) {
  if (!number) return '';
  let cleaned = String(number);
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@')[0];
  }
  if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[0];
  }
  cleaned = cleaned.replace(/\D/g, '');
  return cleaned;
}

function getBotName(config) {
  return config?.nombre || config?.name || 'Bot';
}

export async function handler(sock, msg, plugins, settings, extra={}) {
  try {
    const isSubBot = sock.isSubBot === true;
    const isPremiumBot = sock.isPremiumBot === true;
    const isModBot = sock.isModBot === true;
    const subNumber = sock.subNumber || '';
    const botType = isPremiumBot ? `[PREMIUM ${subNumber}]` : isSubBot ? `[SUB-BOT ${subNumber}]` : isModBot ? `[MOD ${subNumber}]` : '[MAIN-BOT]';

    const config = settings || {};
    const prefix = config.prefix || '.';
    const botName = getBotName(config);

    if(msg.key.remoteJid?.endsWith('@g.us')) {
      const meta = await sock.groupMetadata(msg.key.remoteJid).catch(()=>null)
      if(meta) updateLidStore(meta)
    }

    const rawSender = msg.key.participant || msg.key.remoteJid
    const realSender = getRealJid(rawSender)
    const senderNum = jidToNumber(realSender)
    const senderClean = cleanNumber(rawSender)
    const pushName = msg.pushName || 'Usuario'
    
    msg.realSender = realSender
    msg.senderNumber = senderNum
    msg.realJid = realSender

    const isGroup = msg.key.remoteJid?.endsWith('@g.us') || false
    const chatId = msg.key.remoteJid

    const sticker = msg.message?.stickerMessage
    if(sticker){
      try{
        const DB_PATH = './database/sticker-cmd.json'
        if(fs.existsSync(DB_PATH)){
          const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '{}')
          let hash = sticker.fileSha256
          if(Buffer.isBuffer(hash)) hash = hash.toString('base64')
          const cmd = db[hash]
          if(cmd){
            const plug = getPlugin(plugins, cmd)
            if(plug?.Main){
              console.log(`🎯 Sticker -> ${cmd}`)
              console.log(chalk.green(`${botType} [STICKER] Comando: ${cmd} | Usuario: ${pushName} (${senderNum})`))
              await plug.Main(sock, msg, { args: [], prefix: '.', command: cmd, settings, lidStore,...extra, getRealJid, jidToNumber, plugins })
              return
            }
          }
        }
      }catch(e){ console.log('sticker error', e.message) }
    }

    const body = getBody(msg)
    if(!body) return

    if(!body.startsWith(prefix)) {
      return
    }

    const args = body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()
    if(!command) return

    // Sistema de bots primarios con verificación automática
    if (isGroup) {
        const currentBot = cleanNumber(sock.user?.id || sock.user?.jid || '');
        
        const primary = await verificarYActualizarPrimario(sock, chatId);
        
        if (primary) {
            const primaryNumber = primary.botNumber || primary;
            if (currentBot !== primaryNumber) {
                console.log(`[PRIMARY] ${chatId} current=${currentBot} primary=${primaryNumber} - IGNORANDO`);
                return;
            }
            console.log(`[PRIMARY] ${chatId} current=${currentBot} primary=${primaryNumber} - PROCESANDO`);
        } else {
            console.log(`[PRIMARY] ${chatId} - No hay primario asignado, procesando cualquier bot`);
        }
    }

    const plugin = getPlugin(plugins, command)

    const h = chalk.bold.blue('╭────────────────────────────···')
    const t = chalk.bold.blue('╰────────────────────────────···')
    const v = chalk.bold.blue('│')

    console.log(`\n${h}`)
    console.log(chalk.bold.yellow(`${v} Fecha: ${chalk.whiteBright(moment().format('DD/MM/YY HH:mm:ss'))}`))
    console.log(chalk.bold.blueBright(`${v} Usuario: ${chalk.whiteBright(pushName)}`))
    console.log(chalk.bold.magentaBright(`${v} Remitente: ${gradient('deepskyblue', 'darkorchid')(senderNum)}`))
    
    if(isGroup) {
      try {
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid).catch(()=>null)
        if(groupMetadata) {
          console.log(chalk.bold.cyanBright(`${v} Grupo: ${chalk.greenBright(groupMetadata.subject || 'Sin nombre')}`))
        }
        console.log(chalk.bold.cyanBright(`${v} ID: ${gradient('violet', 'midnightblue')(msg.key.remoteJid)}`))
      } catch (e) {
        console.log(chalk.bold.cyanBright(`${v} Grupo: ${chalk.greenBright('Desconocido')}`))
      }
    } else {
      console.log(chalk.bold.greenBright(`${v} Chat privado`))
    }
    
    console.log(chalk.bold.white(`${v} Comando: ${gradient('orange', 'red')(`${prefix}${command}`)}`))
    console.log(chalk.bold.white(`${v} Mensaje: ${gradient('orange', 'red')(body.substring(0, 100))}${body.length > 100 ? '...' : ''}`))
    console.log(`${t}\n`)

    if(!plugin?.Main) {
      console.log(chalk.yellow(`${botType} Comando no encontrado: ${prefix}${command} | Usuario: ${pushName} (${senderNum})`))
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🐢 El comando \`${command}\` no existe`,
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true
        }
      }, { quoted: msg })
      return
    }

    console.log(chalk.green(`${botType} Comando: ${prefix}${command} | Usuario: ${pushName} (${senderNum})`))

    await plugin.Main(sock, msg, { 
      args, 
      prefix, 
      command, 
      settings, 
      lidStore,
      ...extra, 
      getRealJid, 
      jidToNumber, 
      plugins,
      isGroup,
      pushName,
      senderNumber: senderNum,
      senderClean,
      chatId,
      botType,
      botName,
      config,
      body,
      replyWithContext: async (text, mentions = []) => {
        try {
          await sock.sendMessage(msg.key.remoteJid, {
            text: text,
            mentions: mentions,
            contextInfo: {
              mentionedJid: mentions,
              forwardingScore: 9999999,
              isForwarded: true
            }
          }, { quoted: msg })
          return true
        } catch (error) {
          return false
        }
      }
    })

  } catch(e){ 
    console.log(chalk.red('handler error'), e)
  }
}

export {
    getPrimaryBot,
    savePrimaryBot,
    deletePrimaryBot,
    getAllAvailableBots,
    findBotsInGroup,
    verificarYActualizarPrimario
}