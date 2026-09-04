import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIMARIOS_FILE = path.join(process.cwd(), 'database', 'primarios.json');

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

export default {
    name: 'setprimary',
    alias: ['primary', 'botprimario'],
    description: 'Establece un bot primario en el grupo',
    category: 'group',
    adminOnly: true,

    async Main(sock, msg, { args, getRealJid, jidToNumber, replyWithContext, isGroup, config, senderNumber, pushName }) {
        try {
            const from = msg.key.remoteJid;
            
            if (!isGroup) {
                return await replyWithContext('「✰」Este comando solo funciona en grupos');
            }
            
            const groupMetadata = await sock.groupMetadata(from);
            
            const argsLower = args[0]?.toLowerCase();
            if (argsLower === 'off' || argsLower === 'remove' || argsLower === 'eliminar') {
                const currentPrimary = getPrimaryBot(from);
                if (!currentPrimary) {
                    return await replyWithContext('「✰」No hay un bot primario configurado en este grupo');
                }
                
                deletePrimaryBot(from);
                return await replyWithContext('《✧》 Bot primario eliminado\n> Ahora todos los bots pueden responder en el grupo');
            }
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            let who = null;
            
            if (mentioned && mentioned.length > 0) {
                who = getRealJid(mentioned[0]);
            } else if (quoted) {
                const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;
                if (quotedSender) {
                    who = getRealJid(quotedSender);
                }
            }
            
            if (!who) {
                return await replyWithContext(
                    `*ᰔᩚ* Por favor menciona un bot para convertirlo en primario.\n` +
                    `> Ejemplo: ${config.prefix}setprimary @bot\n` +
                    `> O responde a un mensaje del bot con ${config.prefix}setprimary`
                );
            }
            
            const cleanWho = cleanNumber(who);
            const availableBots = getAllAvailableBots(sock);
            const botsInGroup = findBotsInGroup(groupMetadata, availableBots);
            
            if (!botsInGroup.includes(cleanWho)) {
                return await replyWithContext(
                    `✿ @${cleanWho} no tiene un sub-bot activo en este grupo`,
                    [who]
                );
            }
            
            const currentPrimary = getPrimaryBot(from);
            if (currentPrimary && currentPrimary.botNumber === cleanWho) {
                return await replyWithContext(`✎ @${cleanWho} ya es el Bot principal del Grupo.`, [who]);
            }
            
            savePrimaryBot(from, cleanWho, cleanWho);
            
            await replyWithContext(
                `✐ Se ha establecido a @${cleanWho} como bot primario de este grupo.\n` +
                `> Ahora todos los comandos de este grupo serán ejecutados por @${cleanWho}.`,
                [who]
            );
            
            console.log(`✅ Bot primario ${cleanWho} establecido en grupo ${from} por ${pushName || senderNumber}`);
            
        } catch (error) {
            console.error('❌ Error en setprimary:', error);
            await replyWithContext(`❌ Error: ${error.message}`);
        }
    }
};