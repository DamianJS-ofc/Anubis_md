import { iniciarSubbot } from '../lib/sub.js'
export default {
  name: 'code',
  alias: ['serbot'],
  category: 'SubBots',
    description: 'Comando code',
  async Main(sock, msg, { args }){
    const jid = msg.key.remoteJid
    let sender = msg.key.participant || jid
    let num = args[0] // si pones.code 542645746772 usa ese
    if(!num){
      if(msg.key.participantPn) num = msg.key.participantPn.split('@')[0]
      else if(msg.key.participantAlt) num = msg.key.participantAlt.split('@')[0]
      else if(msg.key.remoteJidAlt) num = msg.key.remoteJidAlt.split('@')[0]
      else if(!jid.endsWith('@g.us')) num = jid.split('@')[0]
    }
    // FIX ARGENTINA: si empieza con 549, probá con 54
    if(num.startsWith('549')) {
      await sock.sendMessage(jid, { text: `⚠️ Detecté AR con 9 (+${num})\nProbando sin el 9: +${num.replace('549','54')}\nSi no anda, probá.code ${num} manual` }, { quoted: msg })
    }
    await iniciarSubbot({ numero: num, creadorJid: sender, chatOrigen: jid, sockPrincipal: sock })
  }
}
