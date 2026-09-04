export default {
  name: 'id',
  alias: ['myid','lid'],
  category: 'Info',
    description: 'Comando id',
  async Main(sock, msg, { lidStore }){
    const jid = msg.key.remoteJid
    let p = msg.key.participant || msg.key.remoteJid
    let real = lidStore?.[p] || "no traducido aun"
    let phone = "no"
    try{
      phone = await sock.signalRepository?.lidMapping?.getJIDForLID?.(p) || "no mapping"
    }catch{}

    let text = `*DEBUG OWNER*\n\n`
    text += `participant: ${p}\n`
    text += `lidStore: ${real}\n`
    text += `getJIDForLID: ${phone}\n`
    text += `remoteJid: ${jid}\n`
    text += `numero limpio: ${p.replace(/[^0-9]/g,'')}\n`

    await sock.sendMessage(jid, {text}, {quoted: msg})
  }
}
