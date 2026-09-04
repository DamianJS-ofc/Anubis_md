import fs from 'fs'
const ecoPath='./database/economy.json'
const load=()=>{ try{return JSON.parse(fs.readFileSync(ecoPath))}catch{return{}} }
const save=(d)=>{ fs.mkdirSync('./database',{recursive:true}); fs.writeFileSync(ecoPath, JSON.stringify(d,null,2)) }

const GAME_DATA = {
  messageContextInfo: {
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    botMetadata: {
      messageDisclaimerText: "",
      botResponseId: "anubis-ruleta",
      verificationMetadata: {
        proofs: [{
          version: 1, useCase: 1,
          signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
          certificateChain: [
            "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"
          ]
        }]
      }
    }
  }
}

export default {
  name:'ruleta',
  alias:['roulette'],
  category:'RPG',
    description: 'Juega a la ruleta',
  async Main(sock, msg, { args, prefix }){
    const jid = msg.key.remoteJid
    const sender = msg.key.participant || jid
    const uid = jid.endsWith('@g.us')? sender : jid
    const db = load()
    if(!db[uid]) db[uid]={coins:1000}
    let bet = parseInt(args[0])||100
    if(bet<50) bet=50
    if(db[uid].coins < bet){
      return sock.sendMessage(jid,{text:`❌ No tienes saldo\n💰 Tienes: ${db[uid].coins}\n💵 Apuesta: ${bet}`},{quoted:msg})
    }
    const sectors=[{m:0,c:'#1a1a1a',l:'0x'},{m:0,c:'#ff0000',l:'0x'},{m:1,c:'#00b894',l:'1x'},{m:2,c:'#fdcb6e',l:'2x'},{m:3,c:'#6c5ce7',l:'3x'},{m:5,c:'#ffd700',l:'5x'}]
    const winSector = sectors[Math.floor(Math.random()*sectors.length)]
    const win = bet * winSector.m
    const profit = win - bet
    db[uid].coins = db[uid].coins - bet + win
    save(db)

    const isWin = winSector.m>0
    const html = `<style>
*{ -webkit-tap-highlight-color:transparent; box-sizing:border-box }
body{margin:0;background:linear-gradient(135deg,#0a0a0a,#1a1a3e);font-family:'Segoe UI',Arial;color:#fff;min-height:100vh}
.container{width:100%;max-width:460px;margin:auto;padding:12px}
.card{background:linear-gradient(145deg,#12121a,#1e1e32);border-radius:28px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,0.7);border:1px solid rgba(255,215,0,0.1)}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.title{font-size:26px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{background:rgba(255,215,0,0.1);padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid rgba(255,215,0,0.2)}
.wheel-wrap{display:flex;justify-content:center;margin:12px 0;position:relative}
.wheel{width:220px;height:220px;border-radius:50%;border:6px solid #ffd700;position:relative;overflow:hidden;box-shadow:0 0 40px rgba(255,215,0,0.3),inset 0 0 20px rgba(0,0,0,0.8);transform:rotate(${Math.floor(Math.random()*360)}deg);transition:transform 3s cubic-bezier(0.2,0.8,0.2,1)}
.sector{position:absolute;width:50%;height:50%;top:50%;left:50%;transform-origin:0 0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px}
.pointer{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:28px solid #ff4757;z-index:10;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))}
.result{background:rgba(0,0,0,0.4);border-radius:18px;padding:14px;text-align:center;margin:12px 0;border:1px solid ${isWin?'rgba(0,184,148,0.4)':'rgba(255,71,87,0.4)'}}
.result-title{font-size:11px;letter-spacing:2px;color:#888;text-transform:uppercase}
.result-mult{font-size:42px;font-weight:900;color:${winSector.c};text-shadow:0 0 20px ${winSector.c}80;margin:4px 0}
.result-text{font-size:18px;font-weight:700;color:${isWin?'#55efc4':'#ff7675'}}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
.stat{background:rgba(255,255,255,0.03);border-radius:14px;padding:10px;text-align:center;border:1px solid rgba(255,255,255,0.05)}
.stat-label{font-size:9px;color:#666;letter-spacing:1px;text-transform:uppercase}
.stat-value{font-size:16px;font-weight:800;margin-top:2px}
.stat-value.gold{color:#ffd700}.stat-value.green{color:#55efc4}.stat-value.red{color:#ff7675}
.footer{text-align:center;font-size:10px;color:#333;margin-top:12px;letter-spacing:2px}
@keyframes pop{0%{transform:scale(0.8)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
.pop{animation:pop 0.5s ease}
</style>
<div class="container">
<div class="card">
<div class="header"><div class="title">🎰 ANUBIS</div><div class="badge">BET ${bet}</div></div>
<div class="wheel-wrap"><div class="pointer"></div><div class="wheel" style="background:conic-gradient(#1a1a1a 0deg 60deg,#ff0000 60deg 120deg,#00b894 120deg 180deg,#fdcb6e 180deg 240deg,#6c5ce7 240deg 300deg,#ffd700 300deg 360deg)"></div></div>
<div class="result pop">
<div class="result-title">Resultado</div>
<div class="result-mult">${winSector.l}</div>
<div class="result-text">${isWin? '¡GANASTE '+win+'!' : 'PERDISTE'}</div>
</div>
<div class="stats">
<div class="stat"><div class="stat-label">Apuesta</div><div class="stat-value gold">${bet}</div></div>
<div class="stat"><div class="stat-label">Ganancia</div><div class="stat-value ${profit>=0?'green':'red'}">${profit>0?'+'+profit:profit}</div></div>
<div class="stat"><div class="stat-label">Saldo</div><div class="stat-value gold">${db[uid].coins}</div></div>
</div>
<div class="footer">ANUBIS BOT MD · CASINO</div>
</div>
</div>
<script>
setTimeout(()=>{ document.querySelector('.wheel').style.transform='rotate(${1440+Math.floor(Math.random()*360)}deg)' },100)
</script>`

    const payload = {
      response_id: "anubis-ruleta-"+Date.now(),
      sections: [{
        view_model: {
          primitive: {
            __typename: "GenAIaeacdsnwHtmlPrimitive",
            payload: html
          }
        }
      }]
    }

    const msgContent = {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [{ messageType: 2, messageText: "ANUBIS RULETA" }],
            unifiedResponse: { data: Buffer.from(JSON.stringify(payload)) }
          }
        }
      },
     ...GAME_DATA
    }

    await sock.relayMessage(jid, {
      extendedTextMessage: {
        text: `🎰 ANUBIS RULETA\n💵 ${bet} -> ${winSector.l} = ${win} | Saldo: ${db[uid].coins}`,
       ...msgContent,
        contextInfo: {...(msgContent.messageContextInfo||{}) }
      }
    }, { messageId: msg.key.id })

    // fallback texto por si no renderiza html
    await sock.sendMessage(jid, { text: `🎰 *ANUBIS RULETA*\n\n🎯 Salio: *${winSector.l}*\n💵 Apuesta: ${bet}\n${isWin?'✅ Ganaste: '+win:'❌ Perdiste'}\n💳 Saldo: ${db[uid].coins}\n\nUsa ${prefix}ruleta <cantidad>` }, { quoted: msg })
  }
}