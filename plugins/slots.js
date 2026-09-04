import fs from 'fs'
const ecoPath='./database/economy.json'
const load=()=>{ try{return JSON.parse(fs.readFileSync(ecoPath))}catch{return{}} }
const save=(d)=>{ fs.mkdirSync('./database',{recursive:true}); fs.writeFileSync(ecoPath, JSON.stringify(d,null,2)) }

export default {
    name: 'slots',
    alias: ['slot','tragamonedas'],
    category: 'RPG',
    description: 'Maquina tragamonedas',
    async Main(sock, msg, { args }){
        const jid = msg.key.remoteJid
        const sender = msg.key.participant || jid
        const uid = jid.endsWith('@g.us')? sender : jid
        const db = load()
        if(!db[uid]) db[uid]={coins:1000}
        let bet=parseInt(args[0])||100
        if(bet<50) bet=50
        if(db[uid].coins<bet) return sock.sendMessage(jid,{text:`❌ Saldo: ${db[uid].coins}`},{quoted:msg})
        // descontamos la apuesta inicial al abrir el juego
        const saldoInicial = db[uid].coins
        save(db)

        const GAME_DATA = {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: "",
                    botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
                    verificationMetadata: {
                        proofs: [{
                            version: 1, useCase: 1,
                            signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
                            certificateChain: [
                                "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
                                "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
                            ]
                        }]
                    }
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{ messageType: 2, messageText: "ANUBIS SLOTS" }],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify({
                                response_id: "anubis-slots-playable",
                                sections: [{
                                    view_model: {
                                        primitive: {
                                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                                            payload: `<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
body{margin:0;background:#0f0f1a;font-family:'Segoe UI',Arial;color:#fff;touch-action:manipulation}
.card{background:linear-gradient(145deg,#151326,#231d40);border-radius:28px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,0.7);border:1px solid rgba(255,215,0,0.18);max-width:460px;margin:auto}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05)}
.title{font-size:24px;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{background:rgba(255,215,0,0.12);padding:6px 12px;border-radius:20px;font-size:12px;font-weight:800;color:#ffd700;border:1px solid rgba(255,215,0,0.2)}
.slots{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:14px 0}
.reel{background:radial-gradient(circle at top,#2a2a4a,#0a0a14);border-radius:18px;height:112px;display:flex;align-items:center;justify-content:center;font-size:56px;border:2px solid rgba(255,255,255,0.06);transition:transform.15s}
.reel.spin{animation:shake.15s infinite}
@keyframes shake{0%{transform:translateY(-6px)}50%{transform:translateY(6px)}100%{transform:translateY(-6px)}}
.result{background:rgba(0,0,0,0.35);border-radius:18px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,0.06)}
.win{font-size:22px;font-weight:900}
.sub{font-size:11px;color:#888;margin-top:4px;letter-spacing:1px}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
.stat{background:rgba(0,0,0,0.3);border-radius:14px;padding:10px;text-align:center}
.l{font-size:8px;color:#666;letter-spacing:1px;font-weight:700}
.v{font-size:14px;font-weight:900;margin-top:2px}
.gold{color:#ffd700}
.btn{width:100%;margin-top:12px;background:linear-gradient(135deg,#ffd700,#ff8c00);border:none;border-radius:16px;padding:16px;font-size:18px;font-weight:900;color:#000;box-shadow:0 8px 20px rgba(255,215,0,0.4)}
.btn:active{transform:scale(0.97)}
.betrow{display:flex;gap:8px;margin-top:10px}
.bet{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px;text-align:center;font-weight:800;font-size:13px;color:#aaa}
.bet.active{background:rgba(255,215,0,0.15);border-color:#ffd700;color:#ffd700}
.pay{margin-top:10px;background:rgba(255,255,255,0.02);border-radius:12px;padding:8px;font-size:9px;color:#555;text-align:center}
.footer{text-align:center;font-size:8px;color:#333;margin-top:8px;letter-spacing:2px}
</style>
<div class="card">
<div class="header"><div class="title">🎰 ANUBIS SLOTS</div><div class="badge" id="saldo">SALDO ${saldoInicial}</div></div>
<div class="slots"><div class="reel" id="r1">💎</div><div class="reel" id="r2">🍇</div><div class="reel" id="r3">🍒</div></div>
<div class="result"><div id="icons">💀 💎 🍇 🍒</div><div class="win" id="win">TOCA GIRAR</div><div class="sub" id="sub">BET ${bet} | BUENA SUERTE</div></div>
<div class="stats"><div class="stat"><div class="l">APUESTA</div><div class="v gold" id="betv">${bet}</div></div><div class="stat"><div class="l">GANANCIA</div><div class="v" id="ganv" style="color:#aaa">0</div></div><div class="stat"><div class="l">SALDO</div><div class="v gold" id="saldov">${saldoInicial}</div></div></div>
<div class="betrow"><div class="bet ${bet==50?'active':''}" onclick="setBet(50)">50</div><div class="bet ${bet==100?'active':''}" onclick="setBet(100)">100</div><div class="bet ${bet==250?'active':''}" onclick="setBet(250)">250</div><div class="bet ${bet==500?'active':''}" onclick="setBet(500)">500</div></div>
<button class="btn" id="spin" onclick="girar()">🎰 GIRAR</button>
<div class="pay">🍒🍋 x2 · 🍇🍉 x3 · ⭐🔔 x5 · 🍀 x10 · 💎 x25 · 2 iguales = 70%</div>
<div class="footer">ANUBIS MD · JUEGO INTERNO</div>
</div>
<script>
let saldo=${saldoInicial}, bet=${bet}, isSpinning=false;
const emojis=['🍒','🍋','🍇','🍉','⭐','💎','🔔','🍀'];
const pay={'🍒':2,'🍋':2,'🍇':3,'🍉':3,'⭐':5,'🔔':5,'🍀':10,'💎':25};
const r1=document.getElementById('r1'), r2=document.getElementById('r2'), r3=document.getElementById('r3');
const winEl=document.getElementById('win'), subEl=document.getElementById('sub'), ganv=document.getElementById('ganv'), saldov=document.getElementById('saldov'), saldoBadge=document.getElementById('saldo'), betv=document.getElementById('betv'), icons=document.getElementById('icons');
function setBet(v){ bet=v; betv.textContent=v; document.querySelectorAll('.bet').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); }
function girar(){
 if(isSpinning) return;
 if(saldo < bet){ winEl.textContent='SIN SALDO'; winEl.style.color='#ff7675'; subEl.textContent='RECARGA CON.daily'; return; }
 isSpinning=true;
 r1.classList.add('spin'); r2.classList.add('spin'); r3.classList.add('spin');
 winEl.textContent='GIRANDO...'; winEl.style.color='#ffd700';
 let c=0;
 let int=setInterval(()=>{
   r1.textContent=emojis[Math.floor(Math.random()*emojis.length)];
   r2.textContent=emojis[Math.floor(Math.random()*emojis.length)];
   r3.textContent=emojis[Math.floor(Math.random()*emojis.length)];
   c++; if(c>18){ clearInterval(int);
     r1.classList.remove('spin'); r2.classList.remove('spin'); r3.classList.remove('spin');
     const a=emojis[Math.floor(Math.random()*emojis.length)], b=emojis[Math.floor(Math.random()*emojis.length)], d=emojis[Math.floor(Math.random()*emojis.length)];
     r1.textContent=a; r2.textContent=b; r3.textContent=d;
     let win=0, txt='PERDISTE', col='#ff7675', ico='💀';
     if(a===b && b===d){ win=bet*pay[a]; txt='JACKPOT '+a+' x'+pay[a]; col='#55efc4'; ico='💰'; }
     else if(a===b||b===d||a===d){ win=Math.floor(bet*0.7); txt='PAR +70%'; col='#ffeaa7'; ico='✨'; }
     saldo = saldo - bet + win;
     const profit = win - bet;
     icons.textContent=ico+' '+a+' '+b+' '+d;
     winEl.textContent = win>0? '+'+win+' COINS' : 'PERDISTE';
     winEl.style.color=col;
     subEl.textContent=txt+' | '+(profit>0?'+'+profit:profit)+' | SALDO '+saldo;
     ganv.textContent=profit; ganv.style.color=profit>=0?'#55efc4':'#ff7675';
     saldov.textContent=saldo; saldoBadge.textContent='SALDO '+saldo;
     isSpinning=false;
   }
 },70);
}
<\/script>`,
                                            trusted_sources: ["anubis.bot"]
                                        },
                                        __typename: "GenAISingleLayoutViewModel"
                                    }
                                }]
                            })).toString('base64')
                        },
                        contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" }, forwardOrigin: 4 }
                    }
                }
            }
        };
        await sock.relayMessage(jid, GAME_DATA, {})
    }
}