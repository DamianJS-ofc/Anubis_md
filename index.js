import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'

const require = createRequire(import.meta.url)
const baileys = require('baileys')
const makeWASocket = baileys.default || baileys.makeWASocket || baileys
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = baileys
import settingsFile from './settings.js'
import { handler, handleEvents } from './handler.js'
import { loadAllSubBots } from './lib/subbots.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const settings = settingsFile
const getPrefixes = () => Array.isArray(settings.prefixes)? settings.prefixes : Array.isArray(settings.prefix)? settings.prefix : ['!','.','#','-']

console.log(chalk.yellow.bold(' █████╗ ███╗ ██╗██╗ ██╗██████╗ ██╗███████╗'))
console.log(chalk.yellow.bold('██╔══██╗████╗ ██║██║ ██║ ██╔══██╗██║██╔════╝'))
console.log(chalk.yellow.bold('███████║██╔██╗ ██║██║ ██║██████╔╝██║███████╗'))
console.log(chalk.yellow.bold('██╔══██║██║╚██╗██║██║ ██║██╔══██╗██║╚════██║'))
console.log(chalk.yellow.bold('██║ ██║██║ ╚████║╚██████╔╝██████╔╝██║███████║'))
console.log(chalk.yellow.bold('╚═╝ ╚═╝╚═╝ ╚═══╝ ╚═════╝ ╚═════╝ ╚═╝╚══════╝'))
console.log('')
console.log(chalk.gray('Version: 3.0.0 WaSocket | Developer: DamianJS-ofc'))
console.log(chalk.gray('Modo: SILENT + AUTO RELOAD | ANUBIS FINAL + LID FIX'))
console.log('')

const plugins = new Map()
let sock
let isConnected = false

function getAllJSFiles(dir) {
    let results = []
    if(!fs.existsSync(dir)) return results
    const list = fs.readdirSync(dir)
    for(const file of list){
        const filePath = join(dir, file)
        const stat = fs.statSync(filePath)
        if(stat && stat.isDirectory()){
            results = results.concat(getAllJSFiles(filePath))
        } else if(file.endsWith('.js')){
            results.push(filePath)
        }
    }
    return results
}

async function loadPlugins(){
    plugins.clear()
    const files = getAllJSFiles(join(__dirname,'plugins'))
    let ok=0
    for(const file of files){
        try{
            const url = pathToFileURL(file).href + `?t=${Date.now()}`
            const mod = await import(url)
            const p = mod.default
            if(!p) continue
            const name = p.name || p.comando
            if(!name) continue
            // FIX ANUBIS: acepta Main, execute, run
            if(!p.Main &&!p.execute &&!p.run) continue
            if(!p.Main && p.execute) p.Main = p.execute
            if(!p.Main && p.run) p.Main = p.run

            plugins.set(name, p)
            if(p.alias) for(const a of p.alias) plugins.set(a, p)
            if(p.comando) plugins.set(p.comando, p)
            console.log(chalk.green(`⭐ ${path.relative(__dirname,file)}`))
            ok++
        }catch(e){
            console.log(chalk.red(`❌ ${path.basename(file)}: ${e.message}`))
        }
    }
    console.log(chalk.green.bold(`✅ ${ok} comandos cargados | ANUBIS BOT`))
    return ok
}

let reloadTimeout = null
function watchHotReload(){
    const watchDirs = ['./plugins', './lib']
    for(const dir of watchDirs){
        if(!fs.existsSync(dir)) continue
        fs.watch(dir, { recursive: true }, (event, filename) => {
            if(!filename ||!filename.endsWith('.js')) return
            if(filename.includes('session')) return
            clearTimeout(reloadTimeout)
            reloadTimeout = setTimeout(async () => {
                console.log(chalk.yellow(`\n📝 Cambio detectado: ${filename} -> recargando...`))
                await loadPlugins()
            }, 800)
        })
    }
    console.log(chalk.gray('👀 Auto-reload activo: plugins/ + lib/'))
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(r => rl.question(q, r))

const sessionPath = './session'
const hasSession = fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0

if(hasSession) {
    console.log(chalk.green.bold('✅ Sesion existente encontrada'))
    console.log(chalk.yellow('Conectando automaticamente...'))
    console.log('')
} else {
    console.log(chalk.yellow.bold(' ======== ANUBIS VINCULACION ========'))
    console.log(chalk.yellow.bold(' [1] CODIGO DE 8 DIGITOS (ANUBIS)'))
    console.log(chalk.green.bold(' [2] CODIGO QR'))
    console.log(chalk.red.bold(' [3] SALIR'))
    console.log(chalk.yellow.bold(' ====================================='))
    console.log('')
}

let method = '2'
if(!hasSession) {
    method = await ask(chalk.cyan.bold('ELIGE OPCION ANUBIS: '))
    if(method === '3') {
        console.log(chalk.red('Saliendo...'))
        process.exit(0)
    }
    if(!['1','2'].includes(method)) {
        console.log(chalk.yellow('Opcion invalida, usando QR por defecto'))
        method = '2'
    }
}

if(method === '2' &&!hasSession) {
    if(fs.existsSync(sessionPath)) {
        console.log(chalk.yellow('📁 Eliminando sesion anterior para QR...'))
        fs.rmSync(sessionPath, { recursive: true, force: true })
    }
}

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({level:'silent'}),
        browser: Browsers.macOS('Chrome'),
        printQRInTerminal: false,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        defaultQueryTimeoutMs: 60000
    })

    if(method === '1' &&!state.creds.registered &&!hasSession){
        setTimeout(async() => {
            console.log(chalk.yellow.bold('\n📱 INGRESA TU NUMERO:'))
            const num = await ask(chalk.yellow('Numero sin + : '))
            const cleanNum = num.replace(/[^0-9]/g,'')
            if(cleanNum.length < 6){
                console.log(chalk.red('Numero invalido'))
                process.exit(0)
            }
            try{
                const code = await sock.requestPairingCode(cleanNum)
                console.log('')
                console.log(chalk.green.bold(' ======== CODIGO ANUBIS ========'))
                console.log(chalk.white.bold(' ' + code))
                console.log(chalk.green.bold(' ==============================='))
                console.log('')
                console.log(chalk.yellow('Ingresa este codigo en WhatsApp > Dispositivos vinculados'))
            }catch(e){
                console.log(chalk.red('Error: ' + e.message))
                process.exit(0)
            }
        }, 2000)
    }

    if(method === '2' &&!state.creds.registered &&!hasSession){
        console.log('')
        console.log(chalk.green.bold('📷 Escanea el QR con WhatsApp'))
        console.log(chalk.yellow('Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo'))
        console.log(chalk.yellow('El QR aparecera en la terminal en unos segundos...'))
        console.log('')
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({connection, lastDisconnect, qr}) => {
        if(qr && method === '2' &&!state.creds.registered &&!hasSession) {
            console.log(chalk.green.bold('\n📷 QR GENERADO:'))
            qrcode.generate(qr, { small: true })
            console.log('')
        }

        if(connection === 'open' &&!isConnected){
            isConnected = true
            console.log('')
            console.log(chalk.yellow.bold('🔥 ANUBIS CONECTADO! 🔥'))
            console.log(chalk.cyan(`Prefijos: ${getPrefixes().join(' ')}`))
            await loadPlugins()
            watchHotReload()
            await loadAllSubBots(handler, plugins, settings)
            try{ rl.close() }catch{}
        }

        if(connection === 'close'){
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            isConnected = false
            console.log(chalk.red(`Desconectado: ${reason}`))
            if(reason === DisconnectReason.loggedOut || reason === 401 || reason === 403){
                fs.rmSync(sessionPath, {recursive:true, force:true})
                console.log(chalk.red('Sesion cerrada. Reinicia el bot'))
                process.exit(1)
            } else {
                console.log(chalk.yellow('Reconectando en 3s...'))
                setTimeout(start, 3000)
            }
        }
    })

    sock.ev.on('group-participants.update', (anu) => handleEvents(sock, anu))

    sock.ev.on('messages.upsert', async ({messages}) => {
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return
        await handler(sock, msg, plugins, settings)
    })
}

start().catch(err => {
    console.log(chalk.red('Error fatal:'), err)
    setTimeout(start, 5000)
})

process.on('uncaughtException', (err) => {
    if(err.message?.includes('Connection Closed') || err.message?.includes('rate-overlimit')) return
    console.log(chalk.red('Uncaught Exception:'), err.message)
})

process.on('unhandledRejection', (err) => {
    if(err?.message?.includes('Connection Closed') || err?.message?.includes('rate-overlimit')) return
    console.log(chalk.red('Unhandled Rejection:'), err?.message || err)
})

process.on('SIGINT', () => {
    console.log(chalk.yellow('\nApagando bot...'))
    if(sock) {
        try { sock.end() } catch(e) {}
    }
    process.exit(0)
})