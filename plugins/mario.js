export default {
    name: 'mario',
    alias: ['supermario','mariobros'],
    category: 'Fun',
    description: 'Juega Mario Bros en el bot',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
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
                        submessages: [{ messageType: 2, messageText: "MARIO" }],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify({
                                response_id: "mario-fixed",
                                sections: [{
                                    view_model: {
                                        primitive: {
                                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                                            payload: `<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;touch-action:manipulation}
body{margin:0;background:#5ec4ff;font-family:Arial,sans-serif}
.phone{width:100%;max-width:380px;margin:auto;border-radius:26px;overflow:hidden;border:4px solid #4aa8e0;background:#87d4ff;box-shadow:0 0 0 3px #fff inset}
.header{display:flex;justify-content:space-between;padding:10px 12px;background:linear-gradient(180deg,#6ec6ff,#87d4ff)}
.title{font-weight:900;color:#fff;text-shadow:0 2px 0 #1a6faa;font-size:18px;line-height:1}
.title b{font-size:22px;display:block}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.badge{background:linear-gradient(180deg,#1a3a5a,#0d2236);border-radius:8px;padding:3px 10px;text-align:center;min-width:62px;box-shadow:0 2px 0 #000}
.badge .lbl{font-size:8px;color:#fff;font-weight:800}
.badge .val{font-size:14px;color:#ffde59;font-weight:900}
.game{position:relative;width:100%;height:400px;background:linear-gradient(180deg,#5ec4ff 0%,#a8e8ff 60%,#5ec4ff 60%)}
canvas{width:100%;height:100%;display:block}
.bottom{background:linear-gradient(180deg,#b07a3a,#8a5a2b);padding:8px;border-top:4px solid #5a3a1a}
.progress{height:10px;background:#222;border-radius:10px;border:2px solid #000;overflow:hidden;margin-bottom:8px}
.progress .fill{height:100%;background:linear-gradient(90deg,#3aff8a,#ffeb3b);width:10%;transition:width 0.3s}
.controls{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}
.btn{border:none;border-radius:12px;padding:12px;font-weight:900;font-size:12px;color:#fff;box-shadow:0 3px 0 #000;letter-spacing:0.5px}
.btn:active{transform:translateY(3px);box-shadow:none}
.walk{background:linear-gradient(180deg,#ff5a8a,#d12a5a)}
.pause{background:linear-gradient(180deg,#3ac86a,#1e8a3e)}
.move{background:linear-gradient(180deg,#4a9eff,#2166cc)}
.jump{background:linear-gradient(180deg,#ffce4a,#e69a00)}
.controls2{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:6px}
.msg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 16px;border-radius:12px;font-weight:900;font-size:14px;display:none;z-index:10;text-align:center}
</style>
<div class="phone">
<div class="header"><div class="title">MARIO<br><b>PLATFORM</b></div><div class="stats"><div class="badge"><div class="lbl">SCORE</div><div class="val" id="score">0</div></div><div class="badge"><div class="lbl">COINS</div><div class="val" id="coins">0</div></div><div class="badge"><div class="lbl">WORLD</div><div class="val" id="world">1-1</div></div><div class="badge"><div class="lbl">LIVES</div><div class="val" id="lives">3</div></div></div></div>
<div class="game"><canvas id="c" width="360" height="400"></canvas><div class="msg" id="msg"></div></div>
<div class="bottom"><div class="progress"><div class="fill" id="fill"></div></div><div class="controls"><button class="btn walk" id="walk">RUN: ON</button><button class="btn pause" id="pause">PAUSE</button></div><div class="controls2"><button class="btn move" id="left">LEFT</button><button class="btn jump" id="jump">JUMP</button><button class="btn move" id="right">RIGHT</button></div></div>
</div>
<script>
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
const W=360,H=400;
let score=0,coins=0,lives=3,level=1,paused=false,running=true;
let keys={left:false,right:false};
let audio=null; function sfx(f,t='square',v=0.15){ try{ if(!audio) audio=new (window.AudioContext||window.webkitAudioContext)(); if(audio.state==='suspended') audio.resume(); let o=audio.createOscillator(),g=audio.createGain(); o.connect(g); g.connect(audio.destination); o.type=t; o.frequency.value=f; g.gain.setValueAtTime(v,audio.currentTime); g.gain.exponentialRampToValueAtTime(0.01,audio.currentTime+0.25); o.start(); o.stop(audio.currentTime+0.25);}catch(e){} }
let mario={x:30,y:300,w:24,h:30,vy:0,onG:false,dir:1,big:false,bigT:0};
let cam=0;
let platforms,blocks,coinsArr,enemies,particles,flag;

function makeLevel(lv){
  platforms=[{x:0,y:350,w:500,h:50},{x:550,y:350,w:300,h:50},{x:900,y:300,w:200,h:20},{x:1150,y:250,w:200,h:20},{x:1400,y:350,w:600,h:50}];
  if(lv==1){
    blocks=[{x:180,y:240,w:32,h:32,type:'?',hit:false,bump:0,reward:'coin'},{x:214,y:240,w:32,h:32,type:'?',hit:false,bump:0,reward:'mush'},{x:248,y:240,w:32,h:32,type:'brick',hit:false,bump:0},{x:600,y:260,w:32,h:32,type:'?',hit:false,bump:0,reward:'star'},{x:950,y:210,w:32,h:32,type:'?',hit:false,bump:0,reward:'coin'}];
    coinsArr=[{x:185,y:180,taken:false},{x:610,y:200,taken:false},{x:980,y:150,taken:false},{x:1200,y:200,taken:false}];
    enemies=[{x:300,y:322,w:26,h:28,vx:-1,dead:false},{x:650,y:322,w:26,h:28,vx:-1.2,dead:false},{x:1000,y:272,w:26,h:28,vx:-1,dead:false}];
  } else {
    blocks=[{x:200,y:220,w:32,h:32,type:'?',hit:false,bump:0,reward:'coin'},{x:400,y:200,w:32,h:32,type:'?',hit:false,bump:0,reward:'mush'},{x:700,y:180,w:32,h:32,type:'?',hit:false,bump:0,reward:'star'},{x:1000,y:160,w:32,h:32,type:'brick',hit:false,bump:0},{x:1200,y:160,w:32,h:32,type:'?',hit:false,bump:0,reward:'coin'}];
    coinsArr=[{x:200,y:160,taken:false},{x:700,y:120,taken:false},{x:1450,y:280,taken:false}];
    enemies=[{x:350,y:322,w:26,h:28,vx:-1.5,dead:false},{x:750,y:322,w:26,h:28,vx:-1.5,dead:false},{x:1100,y:222,w:26,h:28,vx:-1,dead:false},{x:1500,y:322,w:26,h:28,vx:-2,dead:false}];
  }
  flag={x:1900,y:200,w:10,h:150,reached:false};
  particles=[];
}
makeLevel(1);

function showMsg(t){ let el=document.getElementById('msg'); el.textContent=t; el.style.display='block'; setTimeout(()=>el.style.display='none',1200); }

function update(){
 if(paused||lives<=0) return;
 let spd=0; if(keys.left) spd=-3; if(keys.right) spd=3; mario.x+=spd;
 if(spd!=0) mario.dir=Math.sign(spd);
 // gravedad
 mario.vy+=0.6; mario.y+=mario.vy; mario.onG=false;
 // plataformas
 platforms.forEach(p=>{
  if(mario.x+mario.w>p.x && mario.x<p.x+p.w && mario.y+mario.h>=p.y && mario.y+mario.h<=p.y+20 && mario.vy>=0){ mario.y=p.y-mario.h; mario.vy=0; mario.onG=true; }
 });
 // bloques
 blocks.forEach(b=>{
  if(b.hit && b.type=='brick') return;
  if(mario.x+mario.w>b.x && mario.x<b.x+b.w && mario.y+mario.h>b.y && mario.y<b.y+b.h){
   if(mario.vy<0 && mario.y > b.y){ // golpe por abajo
     mario.vy=2; b.bump=12;
     if(!b.hit && b.type=='?'){
       b.hit=true;
       if(b.reward=='coin'){ coins++; score+=200; particles.push({x:b.x+10,y:b.y-10,type:'coin',vy:-4,t:30}); sfx(900,'sine',0.2); showMsg('+COIN!'); }
       else if(b.reward=='mush'){ mario.big=true; mario.bigT=600; score+=500; particles.push({x:b.x,y:b.y-20,type:'mush',vy:-2,t:60}); sfx(400,'square'); showMsg('¡HONGO! GRANDE'); }
       else if(b.reward=='star'){ score+=1000; mario.big=true; mario.bigT=900; particles.push({x:b.x,y:b.y-20,type:'star',vy:-3,t:60}); sfx(600,'square'); showMsg('¡ESTRELLA!'); }
     } else if(b.type=='brick' && mario.big){ b.hit=true; score+=50; sfx(150,'sawtooth'); particles.push({x:b.x,y:b.y,type:'brick',t:20}); }
     else sfx(200);
   } else if(mario.vy>=0 && mario.y+mario.h < b.y+15){
     mario.y=b.y-mario.h; mario.vy=0; mario.onG=true;
   }
  }
  if(b.bump>0) b.bump--;
 });
 // monedas
 coinsArr.forEach(c=>{ if(!c.taken && mario.x+mario.w>c.x && mario.x<c.x+18 && mario.y+mario.h>c.y && mario.y<c.y+18){ c.taken=true; coins++; score+=100; sfx(1000,'sine'); } });
 // enemigos
 enemies.forEach(e=>{
  if(e.dead) return;
  e.x+=e.vx; if(e.x<0||e.x>2000) e.vx*=-1;
  if(mario.x+mario.w>e.x+2 && mario.x<e.x+e.w-2 && mario.y+mario.h>e.y && mario.y<e.y+e.h){
   if(mario.vy>0 && mario.y+mario.h < e.y+16){ e.dead=true; mario.vy=-6; score+=100; sfx(350,'square'); particles.push({x:e.x,y:e.y,type:'poof',t:20}); }
   else { if(mario.big){ mario.big=false; mario.bigT=0; mario.y-=10; showMsg('¡PEQUEÑO!'); sfx(100,'sawtooth'); mario.x-=10; } else { lives--; showMsg('¡OUCH! -1 VIDA'); sfx(80,'sawtooth'); mario.x=30+cam; mario.y=200; if(lives<=0){ showMsg('GAME OVER'); } } }
  }
 });
 // flag meta
 if(mario.x+mario.w>flag.x && !flag.reached){ flag.reached=true; score+=1000+coins*100; showMsg('NIVEL '+level+' COMPLETADO!'); setTimeout(()=>{ level++; if(level>2) level=1; document.getElementById('world').textContent='1-'+level; makeLevel(level); mario.x=30; mario.y=200; cam=0; flag.reached=false; },1500); }
 // limites
 if(mario.x<cam) mario.x=cam;
 if(mario.y>420){ lives--; if(lives>0){ mario.x=30+cam; mario.y=200; mario.vy=0; } sfx(70,'sawtooth'); }
 if(mario.bigT>0){ mario.bigT--; if(mario.bigT==0) mario.big=false; }
 cam = mario.x - 60; if(cam<0) cam=0; if(cam>1600) cam=1600;
 // UI
 document.getElementById('score').textContent=score;
 document.getElementById('coins').textContent=coins;
 document.getElementById('lives').textContent=lives;
 document.getElementById('fill').style.width=((mario.x/2000)*100)+'%';
 // particles
 particles.forEach((p,i)=>{ p.t--; p.y+=p.vy||0; if(p.t<=0) particles.splice(i,1); });
}

function draw(){
 ctx.clearRect(0,0,W,H);
 // fondo
 let g=ctx.createLinearGradient(0,0,0,350); g.addColorStop(0,'#5ec4ff'); g.addColorStop(1,'#a8e8ff'); ctx.fillStyle=g; ctx.fillRect(0,0,W,350);
 // nubes
 ctx.fillStyle='#fff'; [[30,50],[140,30],[250,60]].forEach(([nx,ny])=>{ let x=nx-cam*0.15%W; if(x<-50) x+=W+50; ctx.beginPath(); ctx.arc(x,ny,14,0,Math.PI*2); ctx.arc(x+16,ny-6,12,0,Math.PI*2); ctx.arc(x+28,ny,13,0,Math.PI*2); ctx.fill(); });
 // plataformas
 ctx.fillStyle='#2ecc71'; platforms.forEach(p=>{ ctx.fillRect(p.x-cam, p.y, p.w, 8); ctx.fillStyle='#8a5a2b'; ctx.fillRect(p.x-cam, p.y+8, p.w, p.h-8); ctx.fillStyle='#a06a3a'; for(let i=0;i<p.w;i+=26){ ctx.fillRect(p.x-cam+i,p.y+12,18,3);} ctx.fillStyle='#2ecc71'; });
 // bloques
 blocks.forEach(b=>{
  if(b.hit && b.type=='brick') return;
  let bx=b.x-cam, by=b.y-b.bump;
  if(b.type=='?'){ ctx.fillStyle=b.hit?'#8a5a2b':'#ffcc3a'; ctx.fillRect(bx,by,b.w,b.h); ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=2; ctx.strokeRect(bx,by,b.w,b.h); if(!b.hit){ ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.fillText('?',bx+9,by+21);} }
  else { ctx.fillStyle='#c45a2b'; ctx.fillRect(bx,by,b.w,b.h); ctx.fillStyle='#8a3a1a'; for(let i=0;i<4;i++) ctx.fillRect(bx+2,by+2+i*8,28,3); }
 });
 // monedas
 coinsArr.forEach(c=>{ if(!c.taken){ ctx.fillStyle='#ffde59'; ctx.beginPath(); ctx.ellipse(c.x-cam+7,c.y+8,7,9,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(c.x-cam+5,c.y+4,2,4);} });
 // flag
 ctx.fillStyle='#fff'; ctx.fillRect(flag.x-cam,flag.y,4,flag.h); ctx.fillStyle='#e52521'; ctx.fillRect(flag.x-cam+4,flag.y,20,14); ctx.fillStyle='#fff'; ctx.fillRect(flag.x-cam+4,flag.y+14,20,4);
 // enemigos
 enemies.forEach(e=>{ if(e.dead) return; let ex=e.x-cam; ctx.fillStyle='#8B4513'; ctx.fillRect(ex,e.y,e.w,e.h); ctx.fillStyle='#fff'; ctx.fillRect(ex+4,e.y+4,6,6); ctx.fillRect(ex+16,e.y+4,6,6); ctx.fillStyle='#000'; ctx.fillRect(ex+6,e.y+6,2,2); ctx.fillRect(ex+18,e.y+6,2,2); });
 // mario
 let mx=mario.x-cam, my=mario.y, mw=mario.big?28:24, mh=mario.big?38:30;
 if(mario.bigT>0 && Math.floor(mario.bigT/5)%2==0) ctx.globalAlpha=0.6;
 ctx.fillStyle='#e52521'; ctx.fillRect(mx+4,my,mw-8,6);
 ctx.fillStyle='#ffdbac'; ctx.fillRect(mx+2,my+6,mw-4,10);
 ctx.fillStyle='#e52521'; ctx.fillRect(mx,my+16,6,mh-16); ctx.fillRect(mx+mw-6,my+16,6,mh-16);
 ctx.fillStyle='#2154ff'; ctx.fillRect(mx+4,my+18,mw-8,mh-18);
 ctx.fillStyle='#8B4513'; ctx.fillRect(mx+2,my+mh-2,8,4); ctx.fillRect(mx+mw-10,my+mh-2,8,4);
 ctx.globalAlpha=1;
 // particles
 particles.forEach(p=>{ if(p.type=='coin'){ ctx.fillStyle='#ffde59'; ctx.beginPath(); ctx.arc(p.x-cam, p.y, 6, 6, 0, Math.PI*2); ctx.fill(); } if(p.type=='mush'){ ctx.fillStyle='#e52521'; ctx.fillRect(p.x-cam,p.y,16,14); ctx.fillStyle='#fff'; ctx.fillRect(p.x-cam+2,p.y+2,4,4); } if(p.type=='star'){ ctx.fillStyle='#ffeb3b'; ctx.font='14px Arial'; ctx.fillText('★',p.x-cam,p.y); } });
 if(lives<=0){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='900 22px Arial'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,180); ctx.font='12px Arial'; ctx.fillText('Toca PAUSE para reiniciar',W/2,200); ctx.textAlign='left'; }
}
function loop(){ update(); draw(); requestAnimationFrame(loop); }

function bind(id, down, up){
 let el=document.getElementById(id);
 el.addEventListener('touchstart',e=>{ e.preventDefault(); down(); });
 el.addEventListener('touchend',e=>{ e.preventDefault(); if(up) up(); });
 el.addEventListener('mousedown',down);
 el.addEventListener('mouseup',()=>{ if(up) up(); });
}
bind('left',()=>{ keys.left=true; },()=>{ keys.left=false; });
bind('right',()=>{ keys.right=true; },()=>{ keys.right=false; });
bind('jump',()=>{ if(mario.onG){ mario.vy=mario.big?-10:-8; sfx(500); } });
document.getElementById('pause').addEventListener('click',()=>{
 if(lives<=0){ lives=3; score=0; coins=0; level=1; makeLevel(1); mario.x=30; mario.y=200; cam=0; document.getElementById('world').textContent='1-1'; return; }
 paused=!paused; document.getElementById('pause').textContent=paused?'RESUME':'PAUSE';
});
document.getElementById('walk').addEventListener('click',()=>{ running=!running; document.getElementById('walk').textContent=running?'RUN: ON':'RUN: OFF'; });

window.addEventListener('keydown',e=>{ if(e.key=='ArrowLeft') keys.left=true; if(e.key=='ArrowRight') keys.right=true; if(e.key==' '&&mario.onG){ mario.vy=-8; sfx(500);} });
window.addEventListener('keyup',e=>{ if(e.key=='ArrowLeft') keys.left=false; if(e.key=='ArrowRight') keys.right=false; });

makeLevel(1); loop();
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