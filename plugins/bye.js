import { setActivo, isActivo } from '../lib/activos.js'
export default {
  name: 'bye',
  alias: ['despedida'],
  category: 'Admin',
    description: 'Comando bye',
  async Main(sock, msg, { args }){
    const jid = msg.key.remoteJid
    if(!jid.endsWith('@g.us')) return sock.sendMessage(jid, {text:'❌ Solo en grupos'}, {quoted: msg})
    if(args[0]==='on'){ setActivo('bye', jid, true); return sock.sendMessage(jid, {text:'✅ Bye prendido'}, {quoted: msg}) }
    if(args[0]==='off'){ setActivo('bye', jid, false); return sock.sendMessage(jid, {text:'❌ Bye apagado'}, {quoted: msg}) }
    const estado = isActivo('bye', jid)? 'prendido 🟢' : 'apagado 🔴'
    return sock.sendMessage(jid, {text:`Bye está ${estado}\nUsa:.bye on / off`}, {quoted: msg})
  }
}
