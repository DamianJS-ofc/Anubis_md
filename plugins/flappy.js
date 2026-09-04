export default {
    name: 'flappy',
    alias: ['game','flappycloud'],
    category: 'Fun',
    description: 'Flappy Cloud kawaii con sonido',
    async Main(sock, msg){
        const GAME_DATA = {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{ messageType: 2, messageText: "Yuta Flappy Cloud Kawaii" }],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify({
                                response_id: "flappy-kawaii-yuta",
                                sections: [{
                                    view_model: {
                                        primitive: {
                                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                                            payload: `<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}body{margin:0;background:#1a192b;font-family:'Quicksand',Nunito,sans-serif;color:#fff;touch-action:manipulation}.btn-jump{background:linear-gradient(135deg,#ff9a9e,#fecfef);border:none;color:#4a3f6b;border-radius:16px;font-weight:800;font-size:22px;box-shadow:0 8px 20px rgba(255,154,158,0.4);transition:transform.05s;padding:18px}.btn-jump:active{transform:scale(0.95)}</style><body style="margin:0"><div style="width:100%;max-width:520px;margin:auto;padding:16px;box-sizing:border-box"><div style="background:#242238;border:2px solid rgba(255,255,255,0.1);border-radius:28px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,0.5)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:0 4px"><div><div style="font-size:11px;color:#ff9a9e;letter-spacing:2px;font-weight:900">PASTEL STUDIO</div><div style="font-size:24px;font-weight:800;color:#fff">FLAPPY CLOUD ☁️</div></div><div style="background:rgba(255,255,255,0.08);padding:8px 20px;border-radius:20px"><span style="font-size:12px;color:#aaa">PUNTOS </span><b id="score" style="font-size:22px;color:#fecfef;font-weight:800">0</b></div></div><div style="position:relative;width:100%;aspect-ratio:4/3;background:#000;border-radius:18px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.3)"><canvas id="game" width="600" height="450" style="width:100%;height:100%;display:block"></canvas></div><div style="margin-top:16px"><button id="jump" class="btn-jump" style="width:100%;height:64px;font-size:22px">TOCAR PARA VOLAR ✨</button></div></div></div><script>const c=document.getElementById('game'),x=c.getContext('2d'),scoreEl=document.getElementById('score');let audioCtx=null;function playSound(type){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();let osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.connect(gain);gain.connect(audioCtx.destination);if(type==='jump'){osc.type='sine';osc.frequency.setValueAtTime(400,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(800,audioCtx.currentTime+0.1);gain.gain.setValueAtTime(0.1,audioCtx.currentTime);gain.gain.linearRampToValueAtTime(0.01,audioCtx.currentTime+0.1);osc.start();osc.stop(audioCtx.currentTime+0.1)}else if(type==='score'){osc.type='triangle';osc.frequency.setValueAtTime(600,audioCtx.currentTime);osc.frequency.setValueAtTime(900,audioCtx.currentTime+0.08);gain.gain.setValueAtTime(0.12,audioCtx.currentTime);gain.gain.linearRampToValueAtTime(0.01,audioCtx.currentTime+0.2);osc.start();osc.stop(audioCtx.currentTime+0.2)}}let bird,pipes,score,gameOver,bgClouds,frame=0;function reset(){bird={x:120,y:200,r:22,vy:0,g:0.28,jump:-6.2};pipes=[];score=0;gameOver=false;scoreEl.textContent='0';bgClouds=[{x:50,y:80,s:0.4},{x:300,y:140,s:0.6},{x:500,y:60,s:0.3}]}function addPipe(){let gap=170,minH=60,maxH=c.height-gap-minH,topH=Math.floor(Math.random()*(maxH-minH+1))+minH;pipes.push({x:c.width,top:topH,bottom:topH+gap,w:65,passed:false})}function jump(){if(gameOver){reset();return}playSound('jump');bird.vy=bird.jump}function update(){if(gameOver)return;frame++;bird.vy+=bird.g;bird.y+=bird.vy;if(frame%140===0)addPipe();bgClouds.forEach(cl=>{cl.x-=cl.s;if(cl.x<-100)cl.x=c.width+50});pipes.forEach((p,i)=>{p.x-=2;if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;scoreEl.textContent=score;playSound('score')}if(bird.x+bird.r>p.x&&bird.x-bird.r<p.x+p.w){if(bird.y-bird.r<p.top||bird.y+bird.r>p.bottom){gameOver=true}}});pipes=pipes.filter(p=>p.x>-p.w);if(bird.y+bird.r>=c.height-20||bird.y-bird.r<=0)gameOver=true}function drawCloud(cx,cy,scale,color){x.fillStyle=color;x.beginPath();x.arc(cx,cy,20*scale,0,Math.PI*2);x.arc(cx+15*scale,cy-10*scale,15*scale,0,Math.PI*2);x.arc(cx+30*scale,cy,18*scale,0,Math.PI*2);x.fill()}function draw(){let grad=x.createLinearGradient(0,0,0,c.height);grad.addColorStop(0,'#a1c4fd');grad.addColorStop(1,'#c2e9fb');x.fillStyle=grad;x.fillRect(0,0,c.width,c.height);bgClouds.forEach(cl=>drawCloud(cl.x,cl.y,1.5,'rgba(255,255,255,0.4)'));pipes.forEach(p=>{x.fillStyle='#a8eda6';x.beginPath();x.roundRect(p.x,0,p.w,p.top,[0,0,16,16]);x.fill();x.beginPath();x.roundRect(p.x,p.bottom,p.w,c.height-p.bottom,[16,16,0,0]);x.fill()});x.fillStyle='#ffecd2';x.fillRect(0,c.height-20,c.width,20);if(!gameOver){x.fillStyle='#ffffff';x.beginPath();x.arc(bird.x,bird.y,bird.r,0,Math.PI*2);x.arc(bird.x-10,bird.y+4,12,0,Math.PI*2);x.arc(bird.x+10,bird.y+4,12,0,Math.PI*2);x.fill();x.fillStyle='#4a3f6b';x.beginPath();x.arc(bird.x+6,bird.y-2,3,0,Math.PI*2);x.arc(bird.x-6,bird.y-2,3,0,Math.PI*2);x.fill();x.fillStyle='#ff9a9e';x.beginPath();x.arc(bird.x+12,bird.y+4,4,0,Math.PI*2);x.arc(bird.x-12,bird.y+4,4,0,Math.PI*2);x.fill()}if(gameOver){x.fillStyle='rgba(36,34,56,0.75)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='800 30px sans-serif';x.fillText('¡CASI LO LOGRAS! ✨',c.width/2,210);x.font='16px sans-serif';x.fillStyle='#fecfef';x.fillText('Toca abajo para reintentar',c.width/2,250);x.textAlign='left'}}function loop(){update();draw();requestAnimationFrame(loop)}document.getElementById('jump').onclick=jump;c.onclick=jump;reset();loop();<\/script></body>`,
                                            trusted_sources: ["yuta.dev"]
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
        const jid = msg.key.remoteJid
        await sock.relayMessage(jid, GAME_DATA, {})
    }
}