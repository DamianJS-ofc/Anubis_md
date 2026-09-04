export default {
    name: 'pacman',
    alias: ['pac-man'],
    category: 'Fun',
    description: 'Juega Pacman retro',
    async Main(sock, msg){
        const jid = msg.key.remoteJid
        const GAME_DATA = {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: "", botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860", verificationMetadata: { proofs: [{ version: 1, useCase: 1, signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==", certificateChain: ["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"] }] } } },
            botForwardedMessage: { message: { richResponseMessage: { messageType: 1, submessages: [{ messageType: 2, messageText: "PACMAN V6" }], unifiedResponse: { data: Buffer.from(JSON.stringify({ response_id: "pacman-v6", sections: [{ view_model: { primitive: { __typename: "GenAIaeacdsnwHtmlPrimitive", payload: `<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none;touch-action:none}
body{margin:0;background:#000;font-family:Arial}
.phone{width:100%;max-width:380px;margin:auto;background:#000;border-radius:20px;overflow:hidden;border:3px solid #1919ff}
.header{display:flex;justify-content:space-between;padding:8px 10px;background:#000}
.title{font-weight:900;color:#ff0;font-size:16px} .title b{color:#fff;display:block}
.stats{display:flex;gap:4px}
.badge{background:#111;border:1px solid #1919ff;border-radius:6px;padding:2px 8px;text-align:center}
.badge .lbl{font-size:7px;color:#00aaff;font-weight:800} .badge .val{font-size:13px;color:#fff;font-weight:900}
.game{position:relative;width:100%;height:462px;background:#000;overflow:hidden;border:2px solid #000;box-sizing:border-box}
canvas{width:100%;height:100%;display:block}
.bottom{background:#000;padding:8px;border-top:2px solid #1919ff}
.controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.btn{border:none;border-radius:14px;padding:18px 5px;font-weight:900;font-size:16px}
.move{background:linear-gradient(180deg,#2a2aff,#0000aa);color:#fff;border:2px solid #00aaff}
.up{background:linear-gradient(180deg,#ffeb3b,#ff9800);color:#000;border:2px solid #ff0}
.msg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#ff0;color:#000;padding:8px 14px;border-radius:10px;font-weight:900;display:none;z-index:10}
</style>
<div class="phone">
<div class="header"><div class="title">PACMAN<b>V6 NO-FUGA</b></div><div class="stats"><div class="badge"><div class="lbl">SCORE</div><div class="val" id="score">0</div></div><div class="badge"><div class="lbl">LIVES</div><div class="val" id="lives">3</div></div></div></div>
<div class="game"><canvas id="c" width="380" height="462"></canvas><div class="msg" id="msg"></div></div>
<div class="bottom"><div class="controls"><button class="btn move" id="left">◀</button><button class="btn up" id="up">▲</button><button class="btn move" id="right">▶</button></div><div class="controls" style="margin-top:8px"><button class="btn move" id="down" style="grid-column:span 3">▼</button></div></div>
</div>
<script>
const canvas=document.getElementById('c'), ctx=canvas.getContext('2d');
let score=0,lives=3,power=0,immunity=60;
const TILE=22, COLS=19, ROWS=21;
const WALL=1, DOT=0, POWER=2, EMPTY=3;
let base=[
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
[1,2,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,2,1],
[1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,1,3,3,3,1,0,0,0,0,0,0,1],
[1,1,1,1,0,1,0,1,3,3,3,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,3,3,3,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
[0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0],
[1,1,1,1,0,1,0,1,1,3,1,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,3,3,3,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,0,1,3,3,3,1,0,1,0,1,1,1,1],
[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
[1,2,0,1,0,0,0,0,0,3,0,0,0,0,0,1,0,2,1],
[1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
[1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
[1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
let map, pac, ghosts;
const R=8; // radio hitbox pacman
function clone(){ return base.map(r=>r.slice()); }
function init(){
 map=clone();
 pac={x:9,y:15,px:9*TILE+11,py:15*TILE+11,dir:{x:0,y:0},next:{x:0,y:0},speed:2.0};
 ghosts=[
  {x:9,y:7,px:9*TILE+11,py:7*TILE+11,c:'#ff0000',dir:{x:1,y:0},home:{x:9,y:7},scared:false,dead:0,speed:0.5,spawn:0},
  {x:8,y:9,px:8*TILE+11,py:9*TILE+11,c:'#ffb8de',dir:{x:-1,y:0},home:{x:8,y:9},scared:false,dead:0,speed:0.45,spawn:90},
  {x:10,y:9,px:10*TILE+11,py:9*TILE+11,c:'#00ffff',dir:{x:1,y:0},home:{x:10,y:9},scared:false,dead:0,speed:0.45,spawn:180},
  {x:9,y:9,px:9*TILE+11,py:9*TILE+11,c:'#ffb852',dir:{x:0,y:1},home:{x:9,y:9},scared:false,dead:0,speed:0.45,spawn:270},
 ];
 power=0; immunity=60;
}
function isWallPixel(px,py){
 // check hitbox 4 esquinas + centro
 let points=[[px-R,py-R],[px+R,py-R],[px-R,py+R],[px+R,py+R],[px,py]];
 for(let p of points){
  let x=Math.floor(p[0]/TILE), y=Math.floor(p[1]/TILE);
  if(y===9 && (x<0||x>=COLS)) continue; // tunel permitido
  if(x<0||x>=COLS||y<0||y>=ROWS) return true;
  if(map[y][x]===WALL) return true;
 }
 return false;
}
function show(t){ let e=document.getElementById('msg'); e.textContent=t; e.style.display='block'; setTimeout(()=>e.style.display='none',600); }
function update(){
 if(lives<=0) return;
 if(immunity>0) immunity--;
 // intentar girar
 let tryPx=pac.px+pac.next.x*8, tryPy=pac.py+pac.next.y*8;
 if((pac.next.x!==0||pac.next.y!==0) && !isWallPixel(tryPx,tryPy)) pac.dir={...pac.next};
 let newPx=pac.px+pac.dir.x*pac.speed, newPy=pac.py+pac.dir.y*pac.speed;
 if(!isWallPixel(newPx,newPy)){
  pac.px=newPx; pac.py=newPy;
  let gy=Math.floor(pac.py/TILE);
  if(gy===9){ // wrap solo fila 9
   if(pac.px<-8) pac.px=COLS*TILE+8;
   if(pac.px>COLS*TILE+8) pac.px=-8;
  } else {
   // CLAMP FUERTE PARA QUE NO SE SALGA DEL CUADRO
   pac.px=Math.max(TILE/2+2, Math.min(COLS*TILE - TILE/2 -2, pac.px));
   pac.py=Math.max(TILE/2+2, Math.min(ROWS*TILE - TILE/2 -2, pac.py));
  }
 }
 let gx=Math.floor(pac.px/TILE), gy=Math.floor(pac.py/TILE);
 if(gy>=0&&gy<ROWS&&gx>=0&&gx<COLS){
  if(map[gy][gx]===DOT){ map[gy][gx]=EMPTY; score+=10; }
  if(map[gy][gx]===POWER){ map[gy][gx]=EMPTY; score+=50; power=450; ghosts.forEach(g=>{ if(g.dead===0&&g.spawn===0) g.scared=true; }); show('POWER!'); }
 }
 ghosts.forEach(g=>{
  if(g.spawn>0){ g.spawn--; return; }
  if(g.dead>0){
   g.dead--; g.px+=(g.home.x*TILE+11-g.px)*0.08; g.py+=(g.home.y*TILE+11-g.py)*0.08;
   if(g.dead===0){ g.scared=false; g.spawn=120; }
   return;
  }
  g.speed=g.scared?0.3:0.45;
  if(Math.random()<0.07 || isWallPixel(g.px+g.dir.x*8,g.py+g.dir.y*8)){
   let opts=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=> !isWallPixel(g.px+d.x*8,g.py+d.y*8) && !(d.x===-g.dir.x && d.y===-g.dir.y));
   if(opts.length) g.dir=opts[Math.floor(Math.random()*opts.length)];
  }
  let ngPx=g.px+g.dir.x*g.speed, ngPy=g.py+g.dir.y*g.speed;
  if(!isWallPixel(ngPx,ngPy)){
   g.px=ngPx; g.py=ngPy;
   let ggy=Math.floor(g.py/TILE);
   if(ggy===9){
    if(g.px<-8) g.px=COLS*TILE+8;
    if(g.px>COLS*TILE+8) g.px=-8;
   } else {
    g.px=Math.max(TILE/2+2, Math.min(COLS*TILE - TILE/2 -2, g.px));
    g.py=Math.max(TILE/2+2, Math.min(ROWS*TILE - TILE/2 -2, g.py));
   }
  }
  if(immunity===0 && Math.hypot(g.px-pac.px,g.py-pac.py)<14){
   if(g.scared){ g.dead=180; g.scared=false; score+=200; show('+200'); }
   else { lives--; immunity=90; show('OUCH!'); pac.px=9*TILE+11; pac.py=15*TILE+11; pac.dir={x:0,y:0}; pac.next={x:0,y:0}; if(lives<=0) show('GAME OVER'); }
  }
 });
 if(power>0){ power--; if(power===0) ghosts.forEach(g=>g.scared=false); }
 let left=0; map.forEach(r=>r.forEach(c=>{ if(c===DOT||c===POWER) left++; }));
 if(left===0){ show('NIVEL '+ (1)); init(); }
 document.getElementById('score').textContent=score;
 document.getElementById('lives').textContent=lives;
}
function draw(){
 ctx.fillStyle='#000'; ctx.fillRect(0,0,380,462);
 // dibujar paredes con borde
 for(let y=0;y<ROWS;y++){
  for(let x=0;x<COLS;x++){
   let px=x*TILE, py=y*TILE;
   if(map[y][x]===WALL){ ctx.fillStyle='#1919ff'; ctx.fillRect(px,py,TILE,TILE); ctx.fillStyle='#0000aa'; ctx.fillRect(px+2,py+2,TILE-4,TILE-4); }
   if(map[y][x]===DOT){ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,2,0,Math.PI*2); ctx.fill(); }
   if(map[y][x]===POWER){ ctx.fillStyle='#ffff00'; ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,6,0,Math.PI*2); ctx.fill(); }
  }
 }
 // pacman
 if(immunity===0 || Math.floor(immunity/8)%2===0){
  ctx.fillStyle='#ffff00'; ctx.beginPath();
  let mouth=0.2+Math.abs(Math.sin(Date.now()/110))*0.3;
  let ang=pac.dir.x===1?0:pac.dir.x===-1?Math.PI:pac.dir.y===-1?-Math.PI/2:Math.PI/2;
  ctx.moveTo(pac.px,pac.py); ctx.arc(pac.px,pac.py,8, ang+mouth*Math.PI, ang+(2-mouth)*Math.PI); ctx.closePath(); ctx.fill();
 }
 ghosts.forEach(g=>{
  if(g.spawn>0) return;
  if(g.dead>0){ ctx.fillStyle='#fff'; ctx.font='10px Arial'; ctx.fillText('👀',g.px-6,g.py+3); return; }
  ctx.fillStyle=g.scared?(power%20<10?'#fff':'#0000ff'):g.c;
  ctx.beginPath(); ctx.arc(g.px,g.py-2,7,Math.PI,0); ctx.lineTo(g.px+7,g.py+5); ctx.lineTo(g.px+3,g.py+2); ctx.lineTo(g.px-3,g.py+2); ctx.lineTo(g.px-7,g.py+5); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(g.px-2.5,g.py-3,2,0,Math.PI*2); ctx.arc(g.px+2.5,g.py-3,2,0,Math.PI*2); ctx.fill();
 });
 if(lives<=0){ ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fillRect(0,0,380,462); ctx.fillStyle='#ff0'; ctx.font='900 20px Arial'; ctx.textAlign='center'; ctx.fillText('GAME OVER',190,220); ctx.textAlign='left'; }
}
function loop(){ update(); draw(); requestAnimationFrame(loop); }
function bind(id,d){ let el=document.getElementById(id); let h=null; let s=()=>{ pac.next=d; h=setInterval(()=>pac.next=d,100); }; let e=()=>clearInterval(h); el.addEventListener('touchstart',ev=>{ev.preventDefault(); s();}); el.addEventListener('touchend',e); el.addEventListener('mousedown',s); el.addEventListener('mouseup',e); }
bind('up',{x:0,y:-1}); bind('down',{x:0,y:1}); bind('left',{x:-1,y:0}); bind('right',{x:1,y:0});
let sx=0,sy=0;
canvas.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; });
canvas.addEventListener('touchend',e=>{ let dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; if(Math.abs(dx)>Math.abs(dy)){ if(dx>20) pac.next={x:1,y:0}; else if(dx<-20) pac.next={x:-1,y:0}; } else { if(dy>20) pac.next={x:0,y:1}; else if(dy<-20) pac.next={x:0,y:-1}; } });
init(); loop();
<\/script>`, trusted_sources: ["anubis.bot"] }, __typename: "GenAISingleLayoutViewModel" } }] })).toString('base64') }, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" }, forwardOrigin: 4 } } } } }; await sock.relayMessage(jid, GAME_DATA, {}) } }