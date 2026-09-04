import { setActivo, isActivo } from '../lib/activos.js'
export default {
  name: 'welcome',
  alias: ['bienvenida'],
  category: 'Admin',
    description: 'Comando welcome',
  async Main(sock, msg, { args }){
    const jid = msg.key.remoteJid
    if(!jid.endsWith('@g.us')) return sock.sendMessage(jid, {text:'❌ Solo en grupos'}, {quoted: msg})
    if(args[0]==='on'){ setActivo('welcome', jid, true); return sock.sendMessage(jid, {text:'✅ Welcome prendido'}, {quoted: msg}) }
    if(args[0]==='off'){ setActivo('welcome', jid, false); return sock.sendMessage(jid, {text:'❌ Welcome apagado'}, {quoted: msg}) }
    const estado = isActivo('welcome', jid)? 'prendido 🟢' : 'apagado 🔴'
    return sock.sendMessage(jid, {text:`Welcome está ${estado}\nUsa:.welcome on / off`}, {quoted: msg})
  }
}
