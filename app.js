/* ── 참조 ── */
const clawd      = document.getElementById('clawd');
const eyeL       = document.getElementById('eye-l');
const eyeR       = document.getElementById('eye-r');
const moodFill   = document.getElementById('mood-fill');
const moodEmoji  = document.getElementById('mood-emoji');
const moodLabel  = document.getElementById('mood-label');
const scoreEl    = document.getElementById('score-num');
const weatherBtn = document.getElementById('weather-btn');
const timeLabel  = document.getElementById('time-label');
const wOverlay   = document.getElementById('weather-overlay');
const canvas     = document.getElementById('trail-canvas');
const ctx        = canvas.getContext('2d');
const comboDis   = document.getElementById('combo-display');
const secretMsg  = document.getElementById('secret-msg');
const focusStop  = document.getElementById('focus-stop');
const gf         = document.getElementById('girlfriend');
const gfBubble   = document.getElementById('gf-bubble');
const loveLine   = document.getElementById('love-line');
const house      = document.getElementById('house');
const homeModal  = document.getElementById('home-modal');
const homeClose  = document.getElementById('home-close');
const btnAction  = document.getElementById('btn-action');
const btnLeave   = document.getElementById('btn-leave');
const clawdInRoom= document.getElementById('clawd-in-room');
const cookWrap   = document.getElementById('cook-progress-wrap');
const cookBar    = document.getElementById('cook-bar');
const cookLbl    = document.getElementById('cook-label');
const foodShelf  = document.getElementById('food-shelf');
const lpCircle   = document.querySelector('#longpress-ring circle');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; });

/* ── 상태 ── */
let mood=60, score=0, combo=0, comboTimer=null;
let isFocusMode=false, isWalking=false, isSleepy=false;
let walkTimeout=null, lastTap=0, tapCount=0, tapResetTimer=null;
let clawdX=window.innerWidth/2, clawdY=window.innerHeight/2;
let mouseX=window.innerWidth/2, mouseY=window.innerHeight/2;
let trailPoints=[], trailHue=220;
let weatherMode=0;
let clickCount=0, secretTimer=null;
let zzzInterval=null, legFrame=0;
let hasGF=false, gfX=0, gfY=0, gfWalkTimer=null, gfBubbleTimer=null;
let pressTimer=null, pressStart=0, pressRaf=null;
let isSleeping=false, sleepTimer=null, isCooking=false, cookRaf=null;
let focusAutoTimer=null;

const CIRCUM = 314;
const LONG_MS = 800;

const weatherModes = ['☀️','🌤️','🌧️','❄️','🌙'];
const timeModes    = ['낮','낮','비','눈','밤'];
const bodyModes    = ['day','day','day','day','night'];
const foodItems    = ['🦞','🦀','🐟','🍤','🥚'];
const gfMsgs = ['안녕~ 💕','오빠 보고 싶었어 🥺','같이 코딩해요!','커피 사줘요 ☕','집게발 잡아줘 🦀💕','좋아해 💖','나만 봐요 👀','오빠 코드 멋있어~'];
const bubbleMsgs = ['안녕! 👋','버그 수정 중...','코딩 최고!','커피 주세요 ☕','배고프다 🦀','파이팅! 💪','npm install love','에러다 😱','해결했다! 🎉','밥 줘요 🦞'];
const cookMenus = [
  {emoji:'🍚',name:'밥',time:4000},{emoji:'🍜',name:'라면',time:3000},
  {emoji:'🍳',name:'계란후라이',time:2500},{emoji:'🥘',name:'찌개',time:5000},
  {emoji:'🍱',name:'도시락',time:6000},{emoji:'🦞',name:'랍스터',time:7000},
  {emoji:'🍕',name:'피자',time:5500},{emoji:'🍰',name:'케이크',time:6500},
  {emoji:'🥗',name:'샐러드',time:2000},{emoji:'🍖',name:'갈비',time:4500},
];

/* ── 기분 ── */
function updateMood() {
  moodFill.style.width = mood+'%';
  moodFill.style.background = mood>70?'#68d391':mood>40?'#f6ad55':'#fc8181';
  if (mood<25){ moodEmoji.textContent='😢'; moodLabel.textContent='허기짐'; if(!isSleepy) setSleepy(true); }
  else if(mood<50){ moodEmoji.textContent='😐'; moodLabel.textContent='보통'; setSleepy(false); }
  else if(mood<75){ moodEmoji.textContent='😊'; moodLabel.textContent='기분 좋음'; setSleepy(false); }
  else{ moodEmoji.textContent='🥰'; moodLabel.textContent='매우 행복!'; setSleepy(false); }
}

function setSleepy(val) {
  isSleepy = val;
  if (val){ clawd.classList.add('sleepy'); if(!zzzInterval) zzzInterval=setInterval(spawnZzz,2000); }
  else{ clawd.classList.remove('sleepy'); clearInterval(zzzInterval); zzzInterval=null; }
}

function spawnZzz() {
  const z=document.createElement('div'); z.className='zzz'; z.textContent='z';
  const r=clawd.getBoundingClientRect();
  z.style.left=(r.left+r.width/2+8)+'px'; z.style.top=r.top+'px';
  document.body.appendChild(z); setTimeout(()=>z.remove(),2000);
}

/* ── 파티클 ── */
function spawnParticles(x,y,type) {
  const cfg={
    heart:{e:['❤️','💖','💕'],n:4,s:70},
    star:{e:['⭐','✨','🌟','💫'],n:5,s:80},
    food:{e:['🦞','✨','⭐'],n:6,s:90},
    sparkle:{e:['✨','💥','⚡'],n:6,s:60}
  }[type]||{e:['✨'],n:4,s:60};
  for(let i=0;i<cfg.n;i++){
    const el=document.createElement('div'); el.className='particle';
    el.textContent=cfg.e[Math.floor(Math.random()*cfg.e.length)];
    el.style.cssText=`font-size:${type==='heart'?24:18}px;left:${x}px;top:${y}px;position:fixed;pointer-events:none;z-index:15`;
    const ang=(Math.PI*2/cfg.n)*i+Math.random()*.5, d=cfg.s+Math.random()*40;
    el.style.setProperty('--dx',Math.cos(ang)*d+'px');
    el.style.setProperty('--dy',Math.sin(ang)*d-30+'px');
    el.style.animationDelay=(Math.random()*.1)+'s';
    document.body.appendChild(el); setTimeout(()=>el.remove(),1000);
  }
}

/* ── 콤보 ── */
function addCombo() {
  combo++; clearTimeout(comboTimer);
  comboDis.textContent='콤보 x'+combo+' 🔥';
  comboDis.style.transform='translateX(-50%) scale(1)';
  comboTimer=setTimeout(()=>{ comboDis.style.transform='translateX(-50%) scale(0)'; combo=0; },1500);
  if(combo>=10) showSecret('🔥 콤보 10! Clawd가 춤춰요!');
}

function showSecret(msg) {
  secretMsg.textContent=msg; secretMsg.style.transform='translateX(-50%) scale(1)';
  setTimeout(()=>secretMsg.style.transform='translateX(-50%) scale(0)',2500);
}

/* ── 먹이 ── */
function spawnFood() {
  if(document.querySelectorAll('.food-item').length>=3) return;
  const el=document.createElement('div'); el.className='food-item';
  el.textContent=foodItems[Math.floor(Math.random()*foodItems.length)];
  el.style.left=Math.random()*(window.innerWidth-120)+40+'px';
  el.style.top=Math.random()*(window.innerHeight-140)+40+'px';
  el.addEventListener('click',e=>{
    e.stopPropagation();
    const fx=parseFloat(el.style.left), fy=parseFloat(el.style.top);
    spawnParticles(fx,fy,'food'); el.remove();
    score+=10; scoreEl.textContent=score;
    mood=Math.min(100,mood+20); updateMood(); addCombo();
    showBubble('냠냠! 맛있다 😋'); moveTo(fx,fy);
    if(score>=50&&score%50===0) showSecret('🦞 미식가! 점수:'+score);
  });
  document.body.appendChild(el);
}

/* ── 이동 ── */
function moveTo(x,y) {
  let sx=clawdX,sy=clawdY,prog=0;
  const ti=setInterval(()=>{ prog+=.1; if(prog>=1){clearInterval(ti);return;} addTrail(sx+(x-sx)*prog,sy+(y-sy)*prog); },30);
  clawdX=x; clawdY=y;
  clawd.style.left=x+'px'; clawd.style.top=y+'px';
  isWalking=true; animLegs();
  clearTimeout(walkTimeout);
  walkTimeout=setTimeout(()=>{ isWalking=false; clawd.querySelectorAll('.leg').forEach(l=>l.style.height='12px'); },500);
}

function animLegs() {
  if(!isWalking) return; legFrame++;
  clawd.querySelectorAll('.leg').forEach((leg,i)=>{ const ph=(legFrame*.3+i*1.5)%(Math.PI*2); leg.style.height=(10+Math.sin(ph)*4)+'px'; });
  requestAnimationFrame(animLegs);
}

/* ── 눈 추적 ── */
function trackEyes() {
  if(!isFocusMode&&!isSleepy){
    const r=clawd.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    const dx=mouseX-cx, dy=mouseY-cy, dist=Math.sqrt(dx*dx+dy*dy);
    const mx=dist>0?(dx/dist)*Math.min(dist/80,1)*2:0, my=dist>0?(dy/dist)*Math.min(dist/80,1)*2:0;
    eyeL.style.transform=`translate(${mx}px,${my}px)`; eyeR.style.transform=`translate(${mx}px,${my}px)`;
  }
  requestAnimationFrame(trackEyes);
}
requestAnimationFrame(trackEyes);
document.addEventListener('mousemove',e=>{ mouseX=e.clientX; mouseY=e.clientY; });

/* ── 말풍선 ── */
function showBubble(msg) {
  const b=document.getElementById('speech-bubble');
  if(!isFocusMode){
    b.textContent=msg||bubbleMsgs[Math.floor(Math.random()*bubbleMsgs.length)];
    b.style.transform='translateX(-50%) scale(1)';
    clearTimeout(showBubble._t);
    showBubble._t=setTimeout(()=>{ if(!isFocusMode) b.style.transform='translateX(-50%) scale(0)'; },2200);
  }
}

/* ── 트레일 ── */
function addTrail(x,y){ trailPoints.push({x,y,t:Date.now(),hue:trailHue}); trailHue=(trailHue+15)%360; }
function drawTrail() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const now=Date.now(); trailPoints=trailPoints.filter(p=>now-p.t<600);
  trailPoints.forEach(p=>{ const age=(now-p.t)/600; ctx.beginPath(); ctx.arc(p.x,p.y,5*(1-age*.5),0,Math.PI*2); ctx.fillStyle=`rgba(215,127,102,${.3*(1-age)})`; ctx.fill(); });
  requestAnimationFrame(drawTrail);
}
drawTrail();

/* ── 날씨 ── */
function setWeather(mode) {
  wOverlay.innerHTML=''; document.body.className=bodyModes[mode];
  weatherBtn.textContent=weatherModes[mode]; timeLabel.textContent=timeModes[mode];
  if(mode===2){ for(let i=0;i<40;i++){ const d=document.createElement('div'); d.className='rain-drop'; d.style.cssText=`left:${Math.random()*100}%;height:${10+Math.random()*15}px;animation-duration:${.5+Math.random()*.5}s;animation-delay:${Math.random()}s`; wOverlay.appendChild(d); } }
  else if(mode===3){ for(let i=0;i<30;i++){ const s=document.createElement('div'); s.className='snow-flake'; s.textContent='❄'; s.style.cssText=`left:${Math.random()*100}%;font-size:${12+Math.random()*8}px;animation-duration:${2+Math.random()*3}s;animation-delay:${Math.random()*3}s`; wOverlay.appendChild(s); } }
  else if(mode===1){ for(let i=0;i<4;i++){ const c=document.createElement('div'); c.className='cloud-el'; c.style.cssText=`top:${10+i*8}%;width:${80+Math.random()*60}px;height:30px;animation-duration:${20+Math.random()*15}s;animation-delay:-${Math.random()*10}s`; wOverlay.appendChild(c); } }
  else if(mode===4){ for(let i=0;i<50;i++){ const st=document.createElement('div'); st.className='star-bg'; st.textContent='★'; st.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${1+Math.random()*2}s`; wOverlay.appendChild(st); } }
}
weatherBtn.addEventListener('click',e=>{ e.stopPropagation(); weatherMode=(weatherMode+1)%weatherModes.length; setWeather(weatherMode); });

/* ── 코드 비 ── */
const codeSnippets={
  html:['<!DOCTYPE html>','<div class="app">','<p>Hello World</p>','<script src="app.js">','<button onClick={fn}>'],
  py:['def hello():','import numpy as np','for i in range(10):','async def fetch(url):','@decorator'],
  cpp:['#include <iostream>','int main() {','vector<int> v;','template<typename T>','auto ptr = make_shared<T>();'],
  java:['public class Main {','@Override','List<String> list = new','System.out.println();','try { connect(); }'],
  js:["const fn = () => {};",'async function load() {',"await fetch('/api');",'useState(null);','export default App;'],
  css:['.container {','display: flex;','@keyframes spin {','border-radius: 8px;',':root { --primary: #D77F66; }'],
};
const langKeys=['html','py','cpp','java','js','css'];
const langColors={html:'lang-html',py:'lang-py',cpp:'lang-cpp',java:'lang-java',js:'lang-js',css:'lang-css'};

function buildCodeRain() {
  const rain=document.getElementById('code-rain');
  rain.querySelectorAll('.code-col').forEach(c=>c.remove());
  const count=Math.floor(window.innerWidth/120)+2;
  for(let i=0;i<count;i++){
    const lang=langKeys[Math.floor(Math.random()*langKeys.length)];
    const snips=codeSnippets[lang];
    const col=document.createElement('div'); col.className=`code-col ${langColors[lang]}`;
    col.style.left=(i*120+Math.random()*30-15)+'px'; col.style.width='120px';
    const lines=15+Math.floor(Math.random()*10);
    for(let j=0;j<lines;j++){
      const sp=document.createElement('span'); sp.textContent=snips[Math.floor(Math.random()*snips.length)];
      if(j===Math.floor(lines*.3)) sp.classList.add('bright'); col.appendChild(sp);
    }
    const dur=3+Math.random()*4; col.style.animationDuration=dur+'s'; col.style.animationDelay=(-Math.random()*dur)+'s';
    rain.appendChild(col);
  }
}

function stopFocusMode() {
  document.getElementById('code-rain').classList.remove('active');
  clawd.classList.remove('focus'); isFocusMode=false;
  eyeL.style.transform=''; eyeR.style.transform='';
  focusStop.classList.remove('visible');
  clearTimeout(focusAutoTimer);
}

function triggerFocusMode() {
  if(isFocusMode) return;
  isFocusMode=true; clawd.classList.add('focus');
  const msgs=['노트북 켜고 집중!','Deep work 시작!','방해 금지 🚫','코딩 모드 ON'];
  document.getElementById('speech-bubble').textContent=msgs[Math.floor(Math.random()*msgs.length)];
  spawnParticles(clawdX,clawdY-40,'sparkle');
  buildCodeRain(); document.getElementById('code-rain').classList.add('active');
  focusStop.classList.add('visible');
}
focusStop.addEventListener('click',e=>{ e.stopPropagation(); stopFocusMode(); });

/* ── 놀람 ── */
function triggerSurprise() {
  const msgs=['앗! 깜짝이야! 😱','으악!! 🫨','놀랐잖아요!! 💦','심장 떨어질 뻔! 😨'];
  const eyes=clawd.querySelectorAll('.eye');
  eyes.forEach(eye=>{ eye.style.height='18px'; eye.style.top='8px'; eye.style.background='#fff'; eye.style.outline='2px solid #1A1A1A'; });
  let sc=0; const shake=setInterval(()=>{
    clawd.style.marginLeft=(Math.random()-.5)*16+'px'; clawd.style.marginTop=(Math.random()-.5)*10+'px';
    if(++sc>=10){ clearInterval(shake); clawd.style.marginLeft='0'; clawd.style.marginTop='0'; }
  },50);
  spawnParticles(clawdX,clawdY,'sparkle'); spawnParticles(clawdX,clawdY,'star');
  showBubble(msgs[Math.floor(Math.random()*msgs.length)]);
  setTimeout(()=>{ eyes.forEach(eye=>{ eye.style.height='12px'; eye.style.top='12px'; eye.style.background='#1A1A1A'; eye.style.outline='none'; }); },800);
}

/* ── 여자친구 ── */
function showGfBubble(msg) {
  gfBubble.textContent=msg; gfBubble.style.transform='translateX(-50%) scale(1)';
  clearTimeout(gfBubbleTimer); gfBubbleTimer=setTimeout(()=>gfBubble.style.transform='translateX(-50%) scale(0)',2200);
}

function drawLoveLine() {
  if(!hasGF){ loveLine.setAttribute('opacity','0'); return; }
  const cr=clawd.getBoundingClientRect(), gr=gf.getBoundingClientRect();
  loveLine.setAttribute('x1',cr.left+cr.width/2); loveLine.setAttribute('y1',cr.top+cr.height/2);
  loveLine.setAttribute('x2',gr.left+gr.width/2); loveLine.setAttribute('y2',gr.top+gr.height/2);
  loveLine.setAttribute('opacity','.5');
}

function summonGF() {
  hasGF=true;
  gfX=Math.min(clawdX+100,window.innerWidth-60); gfY=clawdY;
  gf.style.left=gfX+'px'; gf.style.top=gfY+'px';
  gf.classList.add('visible');
  spawnParticles(gfX,gfY,'heart'); spawnParticles(clawdX,clawdY-30,'heart');
  showGfBubble(gfMsgs[Math.floor(Math.random()*gfMsgs.length)]);
  showBubble('여자친구 생겼다!! 💕'); drawLoveLine();
  gfWalkTimer=setInterval(()=>{
    if(!hasGF) return;
    if(Math.random()<.3){ gfX=Math.min(Math.max(clawdX+80,60),window.innerWidth-60); gfY=clawdY+(Math.random()-.5)*30; gf.style.left=gfX+'px'; gf.style.top=gfY+'px'; }
    if(Math.random()<.5) showGfBubble(gfMsgs[Math.floor(Math.random()*gfMsgs.length)]);
    drawLoveLine();
  },4000);
}

function dismissGF() {
  hasGF=false; gf.classList.remove('visible'); loveLine.setAttribute('opacity','0'); clearInterval(gfWalkTimer);
  for(let i=0;i<3;i++) setTimeout(()=>{ const bh=document.createElement('div'); bh.className='break-heart'; bh.textContent='💔'; bh.style.left=clawdX+'px'; bh.style.top=clawdY+'px'; document.body.appendChild(bh); setTimeout(()=>bh.remove(),800); },i*120);
  showBubble('혼자다... 💔');
}
setInterval(()=>{ if(hasGF) drawLoveLine(); },200);

/* ── 롱프레스 ── */
function startLongPress() {
  pressStart=Date.now(); pressTimer=setTimeout(()=>{ resetLpRing(); hasGF?dismissGF():summonGF(); },LONG_MS);
  function animRing(){ const p=Math.min((Date.now()-pressStart)/LONG_MS,1); lpCircle.style.strokeDashoffset=CIRCUM*(1-p); if(p<1&&pressTimer) pressRaf=requestAnimationFrame(animRing); }
  pressRaf=requestAnimationFrame(animRing);
}
function cancelLongPress(){ clearTimeout(pressTimer); pressTimer=null; cancelAnimationFrame(pressRaf); resetLpRing(); }
function resetLpRing(){ lpCircle.style.strokeDashoffset=CIRCUM; }

/* ── 집 ── */
function walkIntoHouse() {
  const r=house.getBoundingClientRect();
  const doorX=r.left+88+22, doorY=r.top+140;
  const dist=Math.hypot(doorX-clawdX, doorY-clawdY);
  const delay=Math.max(300,Math.min(dist/0.4,1200));
  moveTo(doorX, doorY);
  setTimeout(()=>{
    // 문으로 쏙 들어가기
    clawd.style.transition='transform .35s ease-in, opacity .35s ease-in';
    clawd.style.transform='translate(-50%,-50%) scale(0.1)';
    clawd.style.opacity='0';
    if(hasGF){ gf.style.transition='transform .35s ease-in, opacity .35s ease-in'; gf.style.transform='translate(-50%,-50%) scale(0.1)'; gf.style.opacity='0'; }
    setTimeout(()=>{
      clawd.style.transition=''; clawd.style.transform='translate(-50%,-50%)'; clawd.style.opacity='1';
      if(hasGF){ gf.style.transition=''; gf.style.transform='translate(-50%,-50%) scale(1)'; gf.style.opacity='1'; }
      openHome();
    },380);
  },delay);
}

function openHome() {
  homeModal.style.display='flex';
  requestAnimationFrame(()=>homeModal.classList.add('open'));
  showBubble('집에 들어왔다! 🏠');
}

function closeHome() {
  homeModal.classList.remove('open');
  setTimeout(()=>homeModal.style.display='none',400);
  if(isSleeping) stopSleep();
  if(isCooking) cancelCooking();
  if(isCoding) stopCoding();
  // 문에서 나오기
  const r=house.getBoundingClientRect();
  const doorX=r.left+88+22, doorY=r.top+140;
  clawdX=doorX; clawdY=doorY;
  clawd.style.transition='none'; clawd.style.left=doorX+'px'; clawd.style.top=doorY+'px';
  clawd.style.transform='translate(-50%,-50%) scale(0.1)'; clawd.style.opacity='0';
  requestAnimationFrame(()=>{
    clawd.style.transition='transform .4s cubic-bezier(.175,.885,.32,1.275), opacity .35s';
    clawd.style.transform='translate(-50%,-50%) scale(1)'; clawd.style.opacity='1';
  });
  setTimeout(()=>{ clawd.style.transition='left .4s cubic-bezier(.25,1,.5,1),top .4s cubic-bezier(.25,1,.5,1)'; showBubble('다녀왔어요! 🏠'); },420);
}

house.addEventListener('click',e=>{ e.stopPropagation(); walkIntoHouse(); });
homeClose.addEventListener('click', closeHome);
homeModal.addEventListener('click',e=>{ if(e.target===homeModal) closeHome(); });

/* 탭 전환 */
document.querySelectorAll('.room-tab').forEach(tab=>{
  tab.addEventListener('click',e=>{
    e.stopPropagation();
    document.querySelectorAll('.room-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.room-scene').forEach(s=>s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('scene-'+tab.dataset.tab).classList.add('active');
    const a={bedroom:'💤 자러 가기',kitchen:'🍳 요리하기',bathroom:'🚿 씻기',computer:'💻 코딩 시작',game:'🎮 게임 시작'};
    btnAction.textContent=a[tab.dataset.tab]||'실행';
    if(isSleeping) stopSleep();
    if(isCooking&&tab.dataset.tab!=='kitchen') cancelCooking();
    if(isCoding&&tab.dataset.tab!=='computer') stopCoding();
    if(isGameRunning&&tab.dataset.tab!=='game') stopGame();
  });
});

/* 침실 수면 */
function startSleep() {
  if(isSleeping) return; isSleeping=true;
  clawd.classList.add('in-house'); if(hasGF) gf.classList.add('in-house');
  clawdInRoom.textContent='💤 자는 중...'; clawdInRoom.style.opacity='1';
  btnAction.style.opacity='.5'; btnAction.textContent='💤 자는 중...';
  sleepTimer=setInterval(()=>{ mood=Math.min(100,mood+5); updateMood(); },1000);
  spawnParticles(window.innerWidth/2,window.innerHeight/2,'sparkle');
}
function stopSleep() {
  isSleeping=false; clearInterval(sleepTimer);
  clawd.classList.remove('in-house'); if(hasGF) gf.classList.remove('in-house');
  clawdInRoom.style.opacity='0'; btnAction.style.opacity='1';
  btnAction.textContent='💤 자러 가기'; showBubble('잘 잤다! 😊');
}

/* 화장실 */
function startBath() {
  if(isSleeping) return; isSleeping=true;
  clawd.classList.add('in-house'); if(hasGF) gf.classList.add('in-house');
  btnAction.style.opacity='.5'; btnAction.textContent='🚿 씻는 중...';
  sleepTimer=setInterval(()=>{ mood=Math.min(100,mood+3); updateMood(); },1000);
}
function stopBath() {
  isSleeping=false; clearInterval(sleepTimer);
  clawd.classList.remove('in-house'); if(hasGF) gf.classList.remove('in-house');
  btnAction.style.opacity='1'; btnAction.textContent='🚿 씻기'; showBubble('개운해! 🚿');
}

/* 요리 */
function startCooking() {
  const menu=cookMenus[Math.floor(Math.random()*cookMenus.length)];
  isCooking=true;
  clawd.classList.add('in-house'); if(hasGF) gf.classList.add('in-house');
  cookWrap.style.display='block'; cookLbl.textContent=`${menu.emoji} ${menu.name} 요리 중...`;
  cookBar.style.width='0%'; btnAction.style.opacity='.5'; btnAction.textContent='🍳 요리 중...';
  const start=Date.now();
  function animCook(){
    const p=Math.min((Date.now()-start)/menu.time,1); cookBar.style.width=(p*100)+'%';
    if(p<1) cookRaf=requestAnimationFrame(animCook); else finishCooking(menu);
  }
  cookRaf=requestAnimationFrame(animCook);
}
function finishCooking(menu) {
  isCooking=false; cookWrap.style.display='none'; cookBar.style.width='0%';
  clawd.classList.remove('in-house'); if(hasGF) gf.classList.remove('in-house');
  btnAction.style.opacity='1'; btnAction.textContent='🍳 요리하기';
  const el=document.createElement('div');
  el.style.cssText='font-size:22px;cursor:pointer;animation:foodBob 1.2s ease-in-out infinite alternate;z-index:3';
  el.textContent=menu.emoji; el.title=menu.name+' — 클릭해서 먹기!';
  el.addEventListener('click',e=>{
    e.stopPropagation(); el.remove();
    mood=Math.min(100,mood+25); updateMood(); addCombo();
    showBubble(`${menu.emoji} ${menu.name} 맛있다!!`);
    spawnParticles(window.innerWidth/2,window.innerHeight/2,'food');
    score+=15; scoreEl.textContent=score;
  });
  foodShelf.appendChild(el);
  showBubble(`${menu.emoji} ${menu.name} 완성!!`);
  spawnParticles(clawdX,clawdY-30,'sparkle');
}
function cancelCooking() {
  cancelAnimationFrame(cookRaf); isCooking=false;
  cookWrap.style.display='none'; cookBar.style.width='0%';
  clawd.classList.remove('in-house'); if(hasGF) gf.classList.remove('in-house');
  btnAction.style.opacity='1'; btnAction.textContent='🍳 요리하기';
}

/* 컴퓨터방 코딩 */
let isCoding=false, codingInterval=null, typeIdx=0;
const codeLines=[
  'const clawd = new AI();','clawd.learn(everything);','if (tired) drink(coffee);',
  'while(true) { code(); }','git commit -m "귀여움"','npm run dev','// TODO: 밥 먹기',
  'console.log("hello! 🦀");','export default Clawd;','async function sleep(){}',
  'pip install happiness','#include <crab.h>','System.out.println("🦞");',
  'SELECT * FROM food;','def cook(): pass','<div class="claw">',
];
function startCoding() {
  if(isCoding) return; isCoding=true;
  clawd.classList.add('in-house'); if(hasGF) gf.classList.add('in-house');
  btnAction.style.opacity='.5'; btnAction.textContent='💻 코딩 중...';
  const overlay=document.getElementById('pc-coding-overlay');
  const typingEl=document.getElementById('pc-typing-text');
  overlay.classList.add('active');
  typingEl.textContent='';
  typeIdx=0;
  // 타이핑 효과
  function typeNext(){
    if(!isCoding) return;
    const line=codeLines[Math.floor(Math.random()*codeLines.length)];
    let display=typingEl.textContent.split('\n');
    if(display.length>6) display=display.slice(1);
    display.push('> '+line);
    typingEl.textContent=display.join('\n');
    // 점수 + 기분
    score+=2; scoreEl.textContent=score;
    mood=Math.min(100,mood+1); updateMood();
    if(score%30===0) spawnParticles(clawdX,clawdY-30,'sparkle');
  }
  codingInterval=setInterval(typeNext,700);
  showBubble('코딩 시작! 💻');
}
function stopCoding() {
  isCoding=false; clearInterval(codingInterval);
  clawd.classList.remove('in-house'); if(hasGF) gf.classList.remove('in-house');
  btnAction.style.opacity='1'; btnAction.textContent='💻 코딩 시작';
  document.getElementById('pc-coding-overlay').classList.remove('active');
  showBubble('커밋 완료! 🎉');
  spawnParticles(clawdX,clawdY-30,'star');
}

btnAction.addEventListener('click',e=>{
  e.stopPropagation();
  const tab=document.querySelector('.room-tab.active')?.dataset.tab||'bedroom';
  if(tab==='bedroom'){ isSleeping?stopSleep():startSleep(); }
  else if(tab==='kitchen'){ isCooking?cancelCooking():startCooking(); }
  else if(tab==='bathroom'){ isSleeping?stopBath():startBath(); }
  else if(tab==='computer'){ isCoding?stopCoding():startCoding(); }
  else if(tab==='game'){ isGameRunning?stopGame():startGame(); }
  else if(tab==='gameroom'){ startMarioGame(); }
});
btnLeave.addEventListener('click',e=>{ e.stopPropagation(); closeHome(); });

/* ── 화면 클릭 이동 ── */
document.addEventListener('click',e=>{
  if(e.target.closest('#clawd')||e.target.closest('.food-item')||e.target.closest('#hud')||e.target.closest('#house')||e.target.closest('#home-modal')) return;
  if(isFocusMode) return;
  spawnParticles(e.clientX,e.clientY,'star');
  moveTo(e.clientX,e.clientY);
  if(Math.random()<.4) showBubble();
  clickCount++; clearTimeout(secretTimer);
  secretTimer=setTimeout(()=>clickCount=0,1000);
  if(clickCount>=7) showSecret('🤖 클릭왕! 손가락 쉬어요~');
});

/* ── Clawd 클릭 & 터치 ── */
clawd.addEventListener('click',e=>{
  e.stopPropagation();
  spawnParticles(e.clientX,e.clientY,'heart');
  mood=Math.min(100,mood+10); updateMood(); addCombo(); showBubble();
});
clawd.addEventListener('dblclick',e=>{ e.stopPropagation(); triggerFocusMode(); });

clawd.addEventListener('touchstart',e=>{ e.stopPropagation(); startLongPress(); },{passive:true});
clawd.addEventListener('touchend',e=>{
  e.stopPropagation(); cancelLongPress();
  const now=Date.now(), gap=now-lastTap;
  const t=e.changedTouches[0];
  tapCount++; clearTimeout(tapResetTimer);
  if(tapCount===3){ tapCount=0; triggerSurprise(); return; }
  tapResetTimer=setTimeout(()=>{
    if(tapCount===2) triggerFocusMode();
    else{ spawnParticles(t.clientX,t.clientY,'heart'); mood=Math.min(100,mood+10); updateMood(); addCombo(); showBubble(); }
    tapCount=0;
  },300);
  lastTap=now;
});
clawd.addEventListener('mousedown',e=>{ if(e.button!==0) return; e.stopPropagation(); startLongPress(); });
clawd.addEventListener('mouseup',e=>{ e.stopPropagation(); cancelLongPress(); });
clawd.addEventListener('mouseleave',()=>cancelLongPress());

/* ── 점프 ── */
const shadow = document.getElementById('clawd-shadow');
let isJumping = false;

function doJump() {
  if (isJumping || isFocusMode) return;
  isJumping = true;
  clawd.classList.add('jumping');
  spawnParticles(clawdX, clawdY - 20, 'sparkle');

  // 그림자: 올라갈수록 작고 흐려짐
  let t = 0;
  const shadowAnim = setInterval(() => {
    t += 0.08;
    const progress = Math.sin(t * Math.PI);          // 0→1→0
    const sz = 50 - progress * 32;                   // 50→18→50
    const op = 0.18 - progress * 0.12;               // 0.18→0.06→0.18
    shadow.style.width   = sz + 'px';
    shadow.style.opacity = op;
    shadow.style.left    = clawdX + 'px';
    shadow.style.top     = (clawdY + 24) + 'px';
    if (t >= 1) clearInterval(shadowAnim);
  }, 30);

  // 착지 후 상태 초기화
  setTimeout(() => {
    clawd.classList.remove('jumping');
    isJumping = false;
    // 착지 충격파
    spawnParticles(clawdX, clawdY + 10, 'star');
    // 가끔 말풍선
    if (Math.random() < 0.4) {
      const msgs = ['위이잉! 🚀','점프!','높이높이 ✨','야호~!','뿅!'];
      showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, 500);
}

// 스페이스바
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat) { e.preventDefault(); doJump(); }
});

// 두 손가락 탭 (모바일) — touchstart에서 감지
document.addEventListener('touchstart', e => {
  if (e.touches.length === 2) { e.preventDefault(); doJump(); }
}, { passive: false });

// 그림자 초기 위치 세팅
shadow.style.left    = clawdX + 'px';
shadow.style.top     = (clawdY + 24) + 'px';
shadow.style.opacity = '0.18';
const mealWindows=[{start:7,end:9,label:'아침'},{start:12,end:14,label:'점심'},{start:18,end:20,label:'저녁'}];
const mealMsgs={아침:['아침 밥 줘요 🦞','굿모닝! 배고파요 ☀️'],점심:['점심시간이에요 🦀','배고파요~ 밥 주세요!'],저녁:['저녁 밥 줘요 🦞','저녁 안 주면 졸아요!']};
let lastMealHour=-1;
function checkMealTime(){
  const h=new Date().getHours(), meal=mealWindows.find(m=>h>=m.start&&h<m.end);
  if(meal&&lastMealHour!==meal.start){
    lastMealHour=meal.start;
    const msgs=mealMsgs[meal.label];
    showBubble(msgs[Math.floor(Math.random()*msgs.length)]);
    spawnParticles(clawdX,clawdY-40,'sparkle');
    spawnFood(); spawnFood();
    const nag=setInterval(()=>{
      const nowH=new Date().getHours(), still=mealWindows.find(m=>nowH>=m.start&&nowH<m.end);
      if(!still){clearInterval(nag);return;}
      if(!isFocusMode) showBubble(msgs[Math.floor(Math.random()*msgs.length)]);
      spawnFood();
    },30000);
  } else if(!meal){ lastMealHour=-1; }
}
setInterval(checkMealTime,60000); checkMealTime();



setInterval(()=>{ mood=Math.max(0,mood-1.5); updateMood(); },4000);
setInterval(()=>{ if(!isFocusMode&&Math.random()<.3) showBubble(); },7000);

/* ── 초기화 ── */
setWeather(0); updateMood(); spawnFood(); spawnFood();

/* ════════════════════════════════════════
   🎮 게임 엔진 (5종)
════════════════════════════════════════ */
const GW=340, GH=160;
let isGameRunning=false, currentGame=null, gameRaf=null;
let gScore=0, gLives=3, gFrame=0;
const gKeys={left:false,right:false,up:false};

/* ── 공통 유틸 ── */
function _gEl(id){return document.getElementById(id)}
function _gScore(n){gScore+=n; _gEl('g-score').textContent=gScore;}
function _gLife(n){
  gLives+=n; _gEl('g-life').textContent=Math.max(0,gLives);
  if(gLives<=0) setTimeout(_gameOver,100);
}
function _showHud(title){
  _gEl('game-hud').style.display='flex';
  _gEl('g-title').textContent=title;
  _gEl('g-score').textContent='0';
  _gEl('g-life').textContent=gLives;
}
function _gameOver(){
  isGameRunning=false; cancelAnimationFrame(gameRaf);
  _gEl('game-hud').style.display='none';
  _gEl('game-ctrl').style.display='none';
  _gEl('mem-board').style.display='none';
  const ov=_gEl('game-over');
  ov.style.display='flex';
  _gEl('g-final').textContent=gScore;
  score+=Math.floor(gScore/2); scoreEl.textContent=score;
  mood=Math.min(100,mood+Math.min(gScore,25)); updateMood();
  showBubble(gScore>=30?`🎮 ${gScore}점! 대단해!`:'다음엔 더 잘할 수 있어! 💪');
}
function stopGame(){
  isGameRunning=false; cancelAnimationFrame(gameRaf);
  _gEl('game-hud').style.display='none';
  _gEl('game-over').style.display='none';
  _gEl('game-ctrl').style.display='none';
  _gEl('mem-board').style.display='none';
  _gEl('game-menu').style.display='flex';
  btnAction.textContent='🎮 게임 시작';
  if(gameCanvas) gameCtx.clearRect(0,0,GW,GH);
}
function startGame(){
  _gEl('game-menu').style.display='flex'; // 메뉴 보이게
  btnAction.textContent='🛑 게임 중지';
}

/* ── 캔버스 초기화 ── */
let gameCanvas, gameCtx;
function _initCanvas(){
  gameCanvas=_gEl('game-canvas');
  gameCtx=gameCanvas.getContext('2d');
  gameCanvas.width=GW; gameCanvas.height=GH;
}

/* ── 키 입력 ── */
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='a') gKeys.left=true;
  if(e.key==='ArrowRight'||e.key==='d') gKeys.right=true;
  if(e.key==='ArrowUp'||e.key===' ') gKeys.up=true;
});
document.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a') gKeys.left=false;
  if(e.key==='ArrowRight'||e.key==='d') gKeys.right=false;
  if(e.key==='ArrowUp'||e.key===' ') gKeys.up=false;
});

/* ── 게임 선택 버튼 ── */
document.querySelectorAll('.g-sel-btn').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    _gEl('game-menu').style.display='none';
    _gEl('game-over').style.display='none';
    if(!gameCanvas) _initCanvas();
    gScore=0; gLives=3; gFrame=0;
    const g=btn.dataset.game;
    currentGame=g;
    isGameRunning=true;
    if(g==='catch')   _startCatch();
    if(g==='snake')   _startSnake();
    if(g==='breakout')_startBreakout();
    if(g==='memory')  _startMemory();
    if(g==='dodge')   _startDodge();
  });
});

/* 모바일 버튼 공통 */
function _bindCtrl(){
  const l=_gEl('g-left'),r=_gEl('g-right'),u=_gEl('g-up');
  _gEl('game-ctrl').style.display='flex';
  const on=(k,v)=>e=>{e.preventDefault();gKeys[k]=v;};
  l.ontouchstart=on('left',true); l.ontouchend=on('left',false);
  r.ontouchstart=on('right',true);r.ontouchend=on('right',false);
  u.ontouchstart=on('up',true);   u.ontouchend=on('up',false);
  l.onmousedown=()=>gKeys.left=true; l.onmouseup=()=>gKeys.left=false;
  r.onmousedown=()=>gKeys.right=true;r.onmouseup=()=>gKeys.right=false;
  u.onmousedown=()=>gKeys.up=true;   u.onmouseup=()=>gKeys.up=false;
}

/* ══════════════════════════════
   1. 음식 캐치
══════════════════════════════ */
function _startCatch(){
  _showHud('🍱 CATCH'); _bindCtrl();
  const FOODS=['🍚','🍜','🦞','🍳','🍱','🦀','🍕','🥗','🍰','🍖'];
  const BOMBS=['💣','☠️'];
  let player={x:GW/2-18,y:GH-22,w:36,h:16,spd:3.5};
  let items=[], spawnT=0;
  function loop(){
    if(!isGameRunning||currentGame!=='catch') return;
    gFrame++; spawnT++;
    const lvl=1+Math.floor(gScore/15);
    if(spawnT>Math.max(30-lvl*2,10)){
      spawnT=0;
      const bomb=Math.random()<.14+lvl*.02;
      items.push({x:Math.random()*(GW-20),y:-22,e:bomb?BOMBS[Math.floor(Math.random()*2)]:FOODS[Math.floor(Math.random()*FOODS.length)],bomb,spd:1.4+lvl*.2+Math.random()*.5});
    }
    if(gKeys.left) player.x=Math.max(0,player.x-player.spd);
    if(gKeys.right)player.x=Math.min(GW-player.w,player.x+player.spd);
    items=items.filter(it=>{
      it.y+=it.spd;
      const hit=it.x+18>player.x+2&&it.x<player.x+player.w-2&&it.y+18>player.y&&it.y<player.y+player.h;
      if(hit){it.bomb?_gLife(-1):_gScore(1);return false;}
      return it.y<GH+20;
    });
    const c=gameCtx;
    c.fillStyle='#1a1a2e'; c.fillRect(0,0,GW,GH);
    c.fillStyle='#2d2b4e'; c.fillRect(0,GH-6,GW,6);
    // 플레이어 (Clawd)
    c.fillStyle='#D77F66';
    c.fillRect(player.x+4,player.y,player.w-8,player.h);
    c.fillRect(player.x,player.y+4,5,8);
    c.fillRect(player.x+player.w-5,player.y+4,5,8);
    c.fillStyle='#1a1a1a';
    c.fillRect(player.x+7,player.y+3,4,6);
    c.fillRect(player.x+player.w-11,player.y+3,4,6);
    c.font='18px serif'; c.textAlign='center';
    items.forEach(it=>c.fillText(it.e,it.x+11,it.y+16));
    gameRaf=requestAnimationFrame(loop);
  }
  gameRaf=requestAnimationFrame(loop);
}

/* ══════════════════════════════
   2. 스네이크
══════════════════════════════ */
function _startSnake(){
  _showHud('🐍 SNAKE'); _bindCtrl();
  const SZ=10; // 셀 크기
  const CW=Math.floor(GW/SZ), CH=Math.floor(GH/SZ);
  let snake=[{x:Math.floor(CW/2),y:Math.floor(CH/2)}];
  let dir={x:1,y:0}, nextDir={x:1,y:0};
  let food=_randFood(), moveT=0;
  const FOODS=['🦞','🦀','🍤','🥚','🐟'];
  function _randFood(){
    return {x:Math.floor(Math.random()*CW),y:Math.floor(Math.random()*CH),e:FOODS[Math.floor(Math.random()*FOODS.length)]};
  }
  // 방향 변경
  const dirMap={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1}};
  function _dirUpdate(){
    if(gKeys.left&&dir.x===0)  nextDir={x:-1,y:0};
    if(gKeys.right&&dir.x===0) nextDir={x:1,y:0};
    if(gKeys.up&&dir.y===0)    nextDir={x:0,y:-1};
  }
  function loop(){
    if(!isGameRunning||currentGame!=='snake') return;
    gFrame++; moveT++;
    _dirUpdate();
    const spd=Math.max(12-Math.floor(gScore/5),5);
    if(moveT>=spd){
      moveT=0; dir=nextDir;
      const head={x:(snake[0].x+dir.x+CW)%CW,y:(snake[0].y+dir.y+CH)%CH};
      if(snake.some(s=>s.x===head.x&&s.y===head.y)){isGameRunning=false;_gameOver();return;}
      snake.unshift(head);
      if(head.x===food.x&&head.y===food.y){_gScore(2);food=_randFood();}
      else snake.pop();
    }
    const c=gameCtx;
    c.fillStyle='#1a1a2e'; c.fillRect(0,0,GW,GH);
    // 격자
    c.strokeStyle='rgba(255,255,255,.03)'; c.lineWidth=.5;
    for(let i=0;i<CW;i++){c.beginPath();c.moveTo(i*SZ,0);c.lineTo(i*SZ,GH);c.stroke();}
    for(let j=0;j<CH;j++){c.beginPath();c.moveTo(0,j*SZ);c.lineTo(GW,j*SZ);c.stroke();}
    // 스네이크
    snake.forEach((s,i)=>{
      c.fillStyle=i===0?'#D77F66':'#c06a52';
      c.fillRect(s.x*SZ+1,s.y*SZ+1,SZ-2,SZ-2);
      if(i===0){c.fillStyle='#1a1a1a';c.fillRect(s.x*SZ+2,s.y*SZ+2,2,2);c.fillRect(s.x*SZ+SZ-4,s.y*SZ+2,2,2);}
    });
    // 먹이
    c.font='10px serif'; c.textAlign='center';
    c.fillText(food.e,food.x*SZ+SZ/2,food.y*SZ+SZ-1);
    gameRaf=requestAnimationFrame(loop);
  }
  gameRaf=requestAnimationFrame(loop);
}

/* ══════════════════════════════
   3. 벽돌 깨기
══════════════════════════════ */
function _startBreakout(){
  _showHud('🧱 BREAKOUT'); _bindCtrl();
  const PAD_W=50,PAD_H=8;
  let pad={x:GW/2-PAD_W/2,y:GH-14,w:PAD_W,h:PAD_H};
  let ball={x:GW/2,y:GH-30,vx:2.2,vy:-2.8,r:5};
  let bricks=[];
  const COLS=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'];
  const BR_W=30,BR_H=12,BR_COLS=10,BR_ROWS=4;
  for(let r=0;r<BR_ROWS;r++) for(let c=0;c<BR_COLS;c++)
    bricks.push({x:c*(BR_W+2)+2,y:r*(BR_H+3)+20,w:BR_W,h:BR_H,alive:true,col:COLS[r%COLS.length]});
  function loop(){
    if(!isGameRunning||currentGame!=='breakout') return;
    if(gKeys.left) pad.x=Math.max(0,pad.x-4.5);
    if(gKeys.right)pad.x=Math.min(GW-pad.w,pad.x+4.5);
    ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.x-ball.r<0||ball.x+ball.r>GW) ball.vx*=-1;
    if(ball.y-ball.r<0) ball.vy*=-1;
    if(ball.y+ball.r>GH){_gLife(-1);ball.x=pad.x+pad.w/2;ball.y=pad.y-ball.r-2;ball.vy=-2.8;}
    if(ball.y+ball.r>pad.y&&ball.y-ball.r<pad.y+pad.h&&ball.x>pad.x&&ball.x<pad.x+pad.w){
      ball.vy=-Math.abs(ball.vy);
      ball.vx+=(ball.x-(pad.x+pad.w/2))/14;
    }
    bricks.forEach(b=>{
      if(!b.alive) return;
      if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
        b.alive=false; ball.vy*=-1; _gScore(1);
      }
    });
    if(bricks.every(b=>!b.alive)){
      bricks.forEach((b,i)=>b.alive=true);
      ball.vx*=1.1; ball.vy*=1.1; _gScore(5);
    }
    const c=gameCtx;
    c.fillStyle='#0d0d1a'; c.fillRect(0,0,GW,GH);
    bricks.forEach(b=>{if(!b.alive)return;c.fillStyle=b.col;c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(b.x,b.y,b.w,3);});
    // 패들
    c.fillStyle='#D77F66'; c.beginPath(); c.roundRect(pad.x,pad.y,pad.w,pad.h,4); c.fill();
    // 공
    c.fillStyle='#fff'; c.beginPath(); c.arc(ball.x,ball.y,ball.r,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,.3)'; c.beginPath(); c.arc(ball.x-1,ball.y-1,ball.r*.4,0,Math.PI*2); c.fill();
    gameRaf=requestAnimationFrame(loop);
  }
  gameRaf=requestAnimationFrame(loop);
}

/* ══════════════════════════════
   4. 기억력 카드
══════════════════════════════ */
function _startMemory(){
  _showHud('🃏 MEMORY');
  _gEl('game-ctrl').style.display='none';
  gameCtx.clearRect(0,0,GW,GH);
  const board=_gEl('mem-board');
  board.style.display='flex';
  board.innerHTML='';
  const EMOJIS=['🦀','🦞','🐟','🍤','🥚','🍳','🍚','🍜'];
  const pairs=[...EMOJIS,...EMOJIS].sort(()=>Math.random()-.5);
  let flipped=[], matched=0, canFlip=true;
  pairs.forEach((e,i)=>{
    const card=document.createElement('div');
    card.className='mem-card'; card.dataset.i=i; card.dataset.e=e;
    card.textContent='❓';
    card.addEventListener('click',()=>{
      if(!canFlip||card.classList.contains('matched')||flipped.includes(card)) return;
      card.textContent=e; card.classList.add('flipped');
      flipped.push(card);
      if(flipped.length===2){
        canFlip=false;
        if(flipped[0].dataset.e===flipped[1].dataset.e){
          flipped.forEach(c=>{c.classList.add('matched');c.classList.remove('flipped');});
          matched+=2; _gScore(3);
          if(matched===pairs.length){
            setTimeout(()=>{_gEl('mem-board').style.display='none';_gameOver();},600);
          }
          flipped=[]; canFlip=true;
        } else {
          setTimeout(()=>{flipped.forEach(c=>{c.textContent='❓';c.classList.remove('flipped');});flipped=[];canFlip=true;},900);
        }
      }
    });
    board.appendChild(card);
  });
  isGameRunning=true;
}

/* ══════════════════════════════
   5. 피하기 게임
══════════════════════════════ */
function _startDodge(){
  _showHud('⚡ DODGE'); _bindCtrl();
  let player={x:GW/2-14,y:GH-28,w:28,h:20,vx:0,vy:0,onGround:false};
  let obstacles=[], particles2=[], oSpawnT=0, survived=0;
  function loop(){
    if(!isGameRunning||currentGame!=='dodge') return;
    gFrame++; survived++;
    if(survived%60===0) _gScore(1);
    const spd=1.6+Math.floor(gScore/8)*.3;
    oSpawnT++;
    if(oSpawnT>Math.max(50-Math.floor(gScore/5)*3,18)){
      oSpawnT=0;
      const tall=Math.random()<.3;
      obstacles.push({x:GW,y:tall?GH-52:GH-28,w:18,h:tall?46:22,spd,col:Math.random()<.3?'#e74c3c':'#e67e22'});
    }
    // 플레이어
    if(gKeys.left)  player.vx=Math.max(player.vx-.4,-3.5);
    if(gKeys.right) player.vx=Math.min(player.vx+.4,3.5);
    if(!gKeys.left&&!gKeys.right) player.vx*=.8;
    if(gKeys.up&&player.onGround){player.vy=-5;player.onGround=false;}
    player.vy+=.35;
    player.x+=player.vx; player.y+=player.vy;
    player.x=Math.max(0,Math.min(GW-player.w,player.x));
    if(player.y+player.h>=GH-6){player.y=GH-6-player.h;player.vy=0;player.onGround=true;}
    else player.onGround=false;
    // 장애물
    obstacles=obstacles.filter(o=>{
      o.x-=o.spd;
      const hit=player.x+2<o.x+o.w&&player.x+player.w-2>o.x&&player.y+2<o.y+o.h&&player.y+player.h-2>o.y;
      if(hit){_gLife(-1);for(let i=0;i<6;i++)particles2.push({x:player.x+player.w/2,y:player.y,vx:(Math.random()-.5)*4,vy:-Math.random()*3-1,life:20});}
      return o.x>-o.w&&!hit;
    });
    // 파티클
    particles2=particles2.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.life--;return p.life>0;});
    const c=gameCtx;
    c.fillStyle='#0d1117'; c.fillRect(0,0,GW,GH);
    // 바닥
    c.fillStyle='#1e2a3a'; c.fillRect(0,GH-6,GW,6);
    // 장애물
    obstacles.forEach(o=>{c.fillStyle=o.col;c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle='rgba(255,255,255,.15)';c.fillRect(o.x,o.y,o.w,3);});
    // 플레이어
    c.fillStyle='#D77F66';
    c.fillRect(player.x+4,player.y,player.w-8,player.h-6);
    c.fillRect(player.x,player.y+5,5,8);
    c.fillRect(player.x+player.w-5,player.y+5,5,8);
    c.fillRect(player.x+5,player.y+player.h-6,4,6);
    c.fillRect(player.x+player.w-9,player.y+player.h-6,4,6);
    c.fillStyle='#1a1a1a';
    c.fillRect(player.x+8,player.y+4,4,5);
    c.fillRect(player.x+player.w-12,player.y+4,4,5);
    // 파티클
    particles2.forEach(p=>{c.fillStyle=`rgba(215,127,102,${p.life/20})`;c.fillRect(p.x-2,p.y-2,4,4);});
    gameRaf=requestAnimationFrame(loop);
  }
  gameRaf=requestAnimationFrame(loop);
}

/* ── 게임 오버 버튼 ── */
_gEl('g-retry').addEventListener('click',e=>{e.stopPropagation();_gEl('game-over').style.display='none';if(!gameCanvas)_initCanvas();gScore=0;gLives=3;gFrame=0;if(currentGame==='catch')_startCatch();else if(currentGame==='snake')_startSnake();else if(currentGame==='breakout')_startBreakout();else if(currentGame==='memory')_startMemory();else if(currentGame==='dodge')_startDodge();});
_gEl('g-menu-btn').addEventListener('click',e=>{e.stopPropagation();stopGame();});

/* ════════════════════════════
   PWA: Service Worker + 설치 배너
════════════════════════════ *//* ════════════════════════════
   PWA: Service Worker + 설치 배너
════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Clawd SW ✓');
        _initNotifications(reg);
      })
      .catch(e => console.warn('SW 실패:', e));
  });
}

async function _initNotifications(reg) {
  if (!('Notification' in window)) return;

  async function activate() {
    const sw = reg.active || (await navigator.serviceWorker.ready).active;
    if (sw) sw.postMessage({ type: 'START_NOTIFICATIONS' });
    // Periodic Background Sync 등록 (Chrome Android)
    if ('periodicSync' in reg) {
      reg.periodicSync.register('clawd-notify', { minInterval: 5 * 60 * 1000 })
        .catch(() => {});
    }
  }

  if (Notification.permission === 'granted') { await activate(); return; }
  if (Notification.permission === 'denied') return;

  // 첫 방문: 2초 후 권한 요청
  setTimeout(async () => {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await activate();
      showBubble('알림 허용됐어요! 🔔');
    }
  }, 2000);
}


let _deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
  _showPwaBanner();
});
window.addEventListener('appinstalled', () => {
  showBubble('홈 화면에 추가됐어요! 🦀');
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 'sparkle');
});

function _showPwaBanner() {
  if (document.getElementById('pwa-banner')) return;
  const style = document.createElement('style');
  style.textContent = `
    #pwa-banner { position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      background:rgba(30,30,46,.96);color:#e8d5c0;border:1.5px solid #D77F66;
      border-radius:14px;padding:10px 16px;font-size:12px;font-weight:bold;
      font-family:'Courier New',monospace;display:flex;align-items:center;gap:10px;
      z-index:9999;backdrop-filter:blur(8px);white-space:nowrap;
      box-shadow:0 4px 20px rgba(0,0,0,.4);
      animation:pwaUp .4s cubic-bezier(.175,.885,.32,1.275); }
    @keyframes pwaUp { from{transform:translateX(-50%) translateY(16px);opacity:0}
                       to{transform:translateX(-50%) translateY(0);opacity:1} }
    #pwa-install { background:#D77F66;color:#fff;border:none;border-radius:8px;
      padding:5px 10px;cursor:pointer;font-size:11px;font-weight:bold;
      font-family:'Courier New',monospace; }
    #pwa-dismiss { background:none;border:none;color:#888;cursor:pointer;font-size:15px;line-height:1; }
  `;
  document.head.appendChild(style);
  const b = document.createElement('div');
  b.id = 'pwa-banner';
  b.innerHTML = '<span>🦀 홈 화면에 추가할까요?</span>'
              + '<button id="pwa-install">설치</button>'
              + '<button id="pwa-dismiss">✕</button>';
  document.body.appendChild(b);
  document.getElementById('pwa-install').onclick = async () => {
    if (!_deferredPrompt) return;
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === 'accepted') showBubble('앱 설치 완료! 🎉');
    _deferredPrompt = null; b.remove();
  };
  document.getElementById('pwa-dismiss').onclick = () => b.remove();
  setTimeout(() => b.parentNode && b.remove(), 8000);
}

/* ══════════════════════════════════════════
   CLAWD BROS — Super Mario 스타일 플랫포머
══════════════════════════════════════════ */
(function(){

const GAME_W = 400, GAME_H = 240;
const TILE   = 16;
const overlay       = document.getElementById('game-overlay');
const gameCanvas    = document.getElementById('game-canvas');
const ctx2          = gameCanvas.getContext('2d');
const closeBtn      = document.getElementById('game-close-btn');
const scoreDisplay  = document.getElementById('game-score-display');
const livesDisplay  = document.getElementById('game-lives-display');

// TV 화면 대기 클릭
const gameIdle  = document.getElementById('game-idle');
const tvScreen  = document.getElementById('game-screen');
if(tvScreen) tvScreen.addEventListener('click', ()=>{ if(!gState.running) startMarioGame(); });

// 캔버스 크기 — 화면에 맞게
function resizeCanvas(){
  const maxW = Math.min(window.innerWidth, 600);
  const maxH = window.innerHeight - 160;
  const scale= Math.min(maxW/GAME_W, maxH/GAME_H, 2.5);
  gameCanvas.width  = GAME_W;
  gameCanvas.height = GAME_H;
  gameCanvas.style.width  = Math.floor(GAME_W*scale)+'px';
  gameCanvas.style.height = Math.floor(GAME_H*scale)+'px';
}

/* ── 팔레트 ── */
const C = {
  sky:    '#5c94fc', skyBot: '#a0c8f8',
  ground: '#c84c0c', groundTop:'#58a000',
  brick:  '#c84c0c', brickLine:'#a83000',
  qBlock: '#e8a000', qShine:'#f8d840',
  pipe:   '#00a800', pipeDark:'#007000',
  clawd:  '#D77F66', clawdDark:'#b05a44',
  eye:    '#1a1a1a', white:'#fff',
  goomba: '#a85000', goombaDark:'#783800',
  coin:   '#f8d840', coinShine:'#fff8a0',
  flagPole:'#888', flag:'#00cc00',
  cloud:  '#fff', cloudShadow:'#e0e8f8',
  mountain:'#6ab04c', mountainDark:'#4a8032',
};

/* ── 레벨 맵 ── */
// G=ground, B=brick, Q=? block, P=pipe, E=goomba, C=coin, F=flagpole, _=air
const LEVELS = [
  {
    name:'1-1', bgColor:C.sky, music:'🎵',
    width: 30,
    map: [
      '______________________________',
      '______________________________',
      '______________________________',
      '______________________________',
      '______________________________',
      '__________B_BQB_______________',
      '______________________________',
      '_______E__________E___________',
      '___________BBBBB______________',
      '______Q_______________Q_______',
      '______________________________',
      '____E_____________E_______E___',
      'GGGGGGGGGGGGG__GGGGGGGGGGG_GGF',
      'GGGGGGGGGGGGG__GGGGGGGGGGG_GGG',
    ],
    enemyData:[
      {type:'goomba', tx:7,  ty:11},
      {type:'goomba', tx:18, ty:11},
      {type:'goomba', tx:26, ty:11},
    ],
    pipeData:[
      {tx:13, ty:11, h:2},
      {tx:20, ty:10, h:3},
    ]
  },
  {
    name:'1-2', bgColor:'#1a0a2e', music:'🎵🎵',
    width: 32,
    map: [
      '________________________________',
      '________________________________',
      '___B_BBQ_B______________________',
      '________________________________',
      '______________________________F_',
      '___________BBBQBBB______________',
      '________________________________',
      '__E_______________________E_____',
      '__________BB________BB__________',
      '___Q____________Q_______________',
      '________________________________',
      '_E_____________E__________E_____',
      'GGGGGGGG___GGGGGGGGGG___GGGGGGGF',
      'GGGGGGGG___GGGGGGGGGG___GGGGGGG_',
    ],
    enemyData:[
      {type:'goomba', tx:2,  ty:11},
      {type:'goomba', tx:14, ty:11},
      {type:'goomba', tx:26, ty:11},
    ],
    pipeData:[
      {tx:16, ty:11, h:2},
    ]
  }
];

/* ── 게임 상태 ── */
const gState = {
  running: false, level: 0, score: 0, coins: 0, lives: 3,
  camera: 0,
  player: null, enemies: [], tiles: [], coinAnim: [],
  particles: [], floatTexts: [],
  keys: { left:false, right:false, jump:false },
  jumpPressed: false,
  raf: null,
  lastTime: 0,
  goalReached: false,
  gameOver: false,
  levelClearing: false,
};

/* ── 타일 파싱 ── */
function buildLevel(lvl){
  const tiles = [];
  const map = lvl.map;
  for(let row=0; row<map.length; row++){
    for(let col=0; col<map[row].length; col++){
      const ch = map[row][col];
      if(ch === '_' || ch === ' ') continue;
      tiles.push({ type: charToTile(ch), tx:col, ty:row, alive:true, animT:0, hit:false, hitAnim:0 });
    }
  }
  return tiles;
}
function charToTile(ch){
  return {G:'ground',B:'brick',Q:'qblock',F:'flag',C:'coin'}[ch]||'ground';
}

/* ── 플레이어(Clawd) ── */
function makePlayer(){
  return {
    x:2*TILE, y:8*TILE,
    vx:0, vy:0,
    w:14, h:16,
    onGround:false,
    big:false,
    invincible:0,
    dead:false, deadTimer:0,
    facing:1,
    walkFrame:0, walkTimer:0,
  };
}

/* ── 적 ── */
function makeEnemy(tx,ty){
  return { x:tx*TILE, y:ty*TILE, vx:-1.2, vy:0, w:14, h:14, alive:true, stomped:false, stompTimer:0 };
}

/* ── 코인 파티클 ── */
function addCoin(x,y){
  gState.particles.push({x,y,vy:-5,vx:(Math.random()-.5)*2,life:40,type:'coin'});
  gState.floatTexts.push({x,y,text:'+100',life:50,vy:-0.8});
  gState.score+=100; gState.coins++;
}
function addScore(x,y,val){
  gState.floatTexts.push({x,y,text:'+'+val,life:50,vy:-0.8});
  gState.score+=val;
}

/* ── 충돌 ── */
function rectOverlap(ax,ay,aw,ah, bx,by,bw,bh){
  return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
}

function tileAt(tx,ty){
  return gState.tiles.find(t=>t.alive&&t.tx===tx&&t.ty===ty);
}

function solidAt(px,py,pw,ph){
  const x1=Math.floor(px/TILE), x2=Math.floor((px+pw-1)/TILE);
  const y1=Math.floor(py/TILE), y2=Math.floor((py+ph-1)/TILE);
  for(let tx=x1;tx<=x2;tx++)for(let ty=y1;ty<=y2;ty++){
    const t=tileAt(tx,ty);
    if(t&&(t.type==='ground'||t.type==='brick'||t.type==='qblock')) return t;
  }
  return null;
}

/* ── 업데이트 ── */
const GRAVITY = 0.45, JUMP_V = -9.5, MOVE_SPD = 2.8;

function updateGame(dt){
  if(gState.gameOver||gState.goalReached) return;
  const p = gState.player;
  const lvl = LEVELS[gState.level];

  // 입력
  p.vx = 0;
  if(gState.keys.left)  { p.vx=-MOVE_SPD; p.facing=-1; }
  if(gState.keys.right) { p.vx= MOVE_SPD; p.facing= 1; }

  // 점프
  if(gState.keys.jump && !gState.jumpPressed && p.onGround){
    p.vy = JUMP_V; p.onGround=false; gState.jumpPressed=true;
  }
  if(!gState.keys.jump) gState.jumpPressed=false;

  // 중력
  p.vy += GRAVITY;
  if(p.vy>12) p.vy=12;

  // X 이동
  p.x += p.vx;
  p.x = Math.max(0, p.x);
  if(solidAt(p.x,p.y,p.w,p.h)){
    p.x -= p.vx;
    if(p.vx>0) p.x=Math.floor((p.x+p.w)/TILE)*TILE-p.w-0.1;
    else        p.x=Math.ceil(p.x/TILE)*TILE+0.1;
    p.vx=0;
  }

  // Y 이동
  p.onGround=false;
  p.y += p.vy;
  const hit=solidAt(p.x,p.y,p.w,p.h);
  if(hit){
    if(p.vy>0){ // 착지
      p.y=hit.ty*TILE-p.h; p.vy=0; p.onGround=true;
    } else {    // 머리 충돌
      p.y=(hit.ty+1)*TILE+0.1; p.vy=1;
      // ? 블록 또는 벽돌 히트
      if(hit.type==='qblock'&&!hit.hit){
        hit.hit=true; hit.animT=8;
        addCoin(hit.tx*TILE,hit.ty*TILE);
        hit.type='empty';
      } else if(hit.type==='brick'){
        hit.alive=false;
        addScore(hit.tx*TILE,hit.ty*TILE,50);
        for(let i=0;i<4;i++) gState.particles.push({x:hit.tx*TILE+8,y:hit.ty*TILE,vx:(Math.random()-.5)*5,vy:-4-Math.random()*3,life:30,type:'brick'});
      }
    }
  }

  // 낙사
  if(p.y>GAME_H+50){ playerDie(); return; }

  // 워크 애니메이션
  if(Math.abs(p.vx)>0.1&&p.onGround){
    p.walkTimer+=dt;
    if(p.walkTimer>120){ p.walkFrame=(p.walkFrame+1)%4; p.walkTimer=0; }
  } else if(p.onGround){ p.walkFrame=0; }

  // 무적 감소
  if(p.invincible>0) p.invincible--;

  // 카메라
  gState.camera = Math.max(0, Math.min(p.x - GAME_W/2+20, lvl.width*TILE-GAME_W));

  // 적 업데이트
  gState.enemies.forEach(e=>{
    if(!e.alive) return;
    if(e.stomped){ e.stompTimer--; if(e.stompTimer<=0) e.alive=false; return; }
    e.vy+=GRAVITY*0.6;
    e.x+=e.vx;
    e.y+=e.vy;
    // 지면 충돌
    const eh=solidAt(e.x,e.y,e.w,e.h);
    if(eh&&e.vy>=0){ e.y=eh.ty*TILE-e.h; e.vy=0; }
    // 벽 반사
    if(solidAt(e.x,e.y,e.w,e.h)){ e.x-=e.vx; e.vx*=-1; }
    if(e.x<0||e.x>lvl.width*TILE) e.alive=false;

    // 플레이어와 충돌
    if(p.invincible>0) return;
    if(rectOverlap(p.x,p.y,p.w,p.h, e.x,e.y,e.w,e.h)){
      if(p.vy>0&&p.y+p.h<e.y+e.h*0.6){ // 밟기
        e.stomped=true; e.stompTimer=30;
        p.vy=-6;
        addScore(e.x,e.y,200);
      } else { // 피격
        playerDie();
      }
    }
  });

  // 파티클
  gState.particles.forEach(pt=>{ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.2; pt.life--; });
  gState.particles=gState.particles.filter(p=>p.life>0);
  gState.floatTexts.forEach(ft=>{ ft.y+=ft.vy; ft.life--; });
  gState.floatTexts=gState.floatTexts.filter(f=>f.life>0);

  // 골(깃발) 충돌
  const flag=gState.tiles.find(t=>t.type==='flag'&&t.alive);
  if(flag&&rectOverlap(p.x,p.y,p.w,p.h, flag.tx*TILE,flag.ty*TILE,TILE,TILE*2)){
    gState.goalReached=true;
    gState.levelClearing=true;
    addScore(flag.tx*TILE,flag.ty*TILE,500);
    setTimeout(()=>nextLevel(),2000);
  }

  // HUD
  scoreDisplay.textContent='SCORE:'+gState.score;
  livesDisplay.textContent='❤️'.repeat(gState.lives);
}

function playerDie(){
  const p=gState.player;
  if(p.invincible>0) return;
  gState.lives--;
  if(gState.lives<=0){
    gState.gameOver=true;
    setTimeout(()=>showGameOver(),1000);
  } else {
    p.x=2*TILE; p.y=8*TILE; p.vx=0; p.vy=0;
    p.invincible=120;
  }
}

function nextLevel(){
  gState.level=(gState.level+1)%LEVELS.length;
  initLevel();
}

function showGameOver(){
  // 잠깐 GAME OVER 표시 후 재시작
  gState.gameOver=false;
  gState.score=0; gState.lives=3;
  gState.level=0;
  initLevel();
}

/* ── 그리기 ── */
function drawGame(){
  const p=gState.player;
  const lvl=LEVELS[gState.level];
  const cam=gState.camera;
  ctx2.clearRect(0,0,GAME_W,GAME_H);

  // 하늘
  const skyGrad=ctx2.createLinearGradient(0,0,0,GAME_H);
  skyGrad.addColorStop(0,lvl.bgColor);
  skyGrad.addColorStop(1, lvl.bgColor==='#1a0a2e'?'#2a1a4e':C.skyBot);
  ctx2.fillStyle=skyGrad; ctx2.fillRect(0,0,GAME_W,GAME_H);

  // 구름
  drawClouds(cam);

  // 타일
  gState.tiles.forEach(t=>{
    if(!t.alive) return;
    const sx=t.tx*TILE-cam, sy=t.ty*TILE;
    const bumpY = t.animT>0?-3:0; t.animT=Math.max(0,t.animT-1);
    if(sx>-TILE&&sx<GAME_W+TILE) drawTile(ctx2,t,sx,sy+bumpY);
  });

  // 파이프 (레벨 데이터)
  (lvl.pipeData||[]).forEach(pipe=>{
    const sx=pipe.tx*TILE-cam;
    if(sx>-32&&sx<GAME_W+32) drawPipe(ctx2,sx,pipe.ty*TILE,pipe.h);
  });

  // 적
  gState.enemies.forEach(e=>{
    if(!e.alive) return;
    const sx=e.x-cam;
    if(sx>-TILE&&sx<GAME_W+TILE) drawGoomba(ctx2,sx,e.y,e.stomped);
  });

  // 파티클
  gState.particles.forEach(pt=>{
    ctx2.globalAlpha=pt.life/30;
    ctx2.fillStyle=pt.type==='coin'?C.coin:'#c84c0c';
    ctx2.fillRect(pt.x-cam-3,pt.y-3,6,6);
    ctx2.globalAlpha=1;
  });

  // 플로팅 텍스트
  gState.floatTexts.forEach(ft=>{
    ctx2.globalAlpha=Math.min(1,ft.life/20);
    ctx2.fillStyle='#fff'; ctx2.font='bold 9px monospace';
    ctx2.textAlign='center';
    ctx2.fillText(ft.text,ft.x-cam,ft.y);
    ctx2.globalAlpha=1;
  });

  // 플레이어(Clawd)
  if(!p.dead||(p.dead&&Math.floor(p.deadTimer/4)%2===0)){
    const alpha=p.invincible>0&&Math.floor(p.invincible/4)%2===0?0.3:1;
    ctx2.globalAlpha=alpha;
    drawClawd(ctx2,p.x-cam,p.y,p.facing,p.walkFrame,p.onGround,p.vy);
    ctx2.globalAlpha=1;
  }

  // GOAL / GAME OVER
  if(gState.goalReached){
    ctx2.fillStyle='rgba(0,0,0,.4)'; ctx2.fillRect(0,0,GAME_W,GAME_H);
    ctx2.fillStyle='#f8d840'; ctx2.font='bold 20px monospace'; ctx2.textAlign='center';
    ctx2.fillText('GOAL! 🎉',GAME_W/2,GAME_H/2);
    ctx2.font='12px monospace'; ctx2.fillStyle='#fff';
    ctx2.fillText('SCORE: '+gState.score,GAME_W/2,GAME_H/2+20);
  }
  if(gState.gameOver){
    ctx2.fillStyle='rgba(0,0,0,.6)'; ctx2.fillRect(0,0,GAME_W,GAME_H);
    ctx2.fillStyle='#e74c3c'; ctx2.font='bold 22px monospace'; ctx2.textAlign='center';
    ctx2.fillText('GAME OVER',GAME_W/2,GAME_H/2);
  }
}

/* ── 구름 ── */
function drawClouds(cam){
  const clouds=[{x:60,y:30},{x:200,y:20},{x:340,y:35},{x:460,y:25}];
  clouds.forEach(cl=>{
    const sx=(cl.x - cam*0.3)%( GAME_W+80)-40;
    ctx2.fillStyle=C.cloudShadow; drawCloud(ctx2,sx+2,cl.y+3);
    ctx2.fillStyle=C.cloud; drawCloud(ctx2,sx,cl.y);
  });
}
function drawCloud(ctx,x,y){
  ctx.beginPath();
  ctx.arc(x+16,y+8,8,0,Math.PI*2); ctx.arc(x+26,y+5,10,0,Math.PI*2);
  ctx.arc(x+38,y+8,7,0,Math.PI*2); ctx.fill();
  ctx.fillRect(x+8,y+8,32,8);
}

/* ── 타일 그리기 ── */
function drawTile(ctx,t,x,y){
  switch(t.type){
    case 'ground':
      ctx.fillStyle=C.ground; ctx.fillRect(x,y,TILE,TILE);
      ctx.fillStyle=C.groundTop; ctx.fillRect(x,y,TILE,4);
      ctx.fillStyle='rgba(0,0,0,.15)';
      ctx.fillRect(x,y+TILE-2,TILE,2); ctx.fillRect(x+TILE-2,y,2,TILE);
      break;
    case 'brick':
      ctx.fillStyle=C.brick; ctx.fillRect(x,y,TILE,TILE);
      ctx.fillStyle=C.brickLine;
      ctx.fillRect(x,y+4,TILE,1); ctx.fillRect(x,y+10,TILE,1);
      ctx.fillRect(x+4,y,1,4); ctx.fillRect(x+12,y,1,4);
      ctx.fillRect(x+8,y+5,1,5); ctx.fillRect(x,y+5,1,5);
      break;
    case 'qblock': case 'empty':
      ctx.fillStyle=t.type==='qblock'?C.qBlock:'#888';
      ctx.fillRect(x,y,TILE,TILE);
      if(t.type==='qblock'){
        ctx.fillStyle=C.qShine; ctx.fillRect(x+2,y+2,4,4);
        ctx.fillStyle='#a86000'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('?',x+8,y+12);
      }
      ctx.fillStyle='rgba(0,0,0,.2)';
      ctx.fillRect(x,y+TILE-2,TILE,2); ctx.fillRect(x+TILE-2,y,2,TILE);
      break;
    case 'coin':
      const anim=Math.sin(Date.now()/200)*2;
      ctx.fillStyle=C.coin;
      ctx.beginPath(); ctx.ellipse(x+8,y+8+anim,4,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=C.coinShine;
      ctx.beginPath(); ctx.ellipse(x+6,y+8+anim,2,4,0,0,Math.PI*2); ctx.fill();
      break;
  }
}

/* ── 파이프 ── */
function drawPipe(ctx,x,y,h){
  const ph=h*TILE;
  // 몸통
  ctx.fillStyle=C.pipe; ctx.fillRect(x+2,y+TILE,TILE-4,ph-TILE);
  ctx.fillStyle=C.pipeDark; ctx.fillRect(x+TILE-6,y+TILE,4,ph-TILE);
  // 머리
  ctx.fillStyle=C.pipe; ctx.fillRect(x-1,y,TILE+2,TILE);
  ctx.fillStyle=C.pipeDark; ctx.fillRect(x+TILE-5,y,5,TILE);
  // 테두리
  ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(x+2,y+TILE,1,ph-TILE);
}

/* ── 굼바 ── */
function drawGoomba(ctx,x,y,stomped){
  if(stomped){ ctx.fillStyle=C.goomba; ctx.fillRect(x+1,y+10,12,4); return; }
  ctx.fillStyle=C.goomba;
  ctx.beginPath(); ctx.arc(x+7,y+7,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=C.goombaDark;
  ctx.fillRect(x+1,y+11,4,4); ctx.fillRect(x+9,y+11,4,4); // 발
  ctx.fillStyle=C.eye;
  ctx.fillRect(x+2,y+5,3,3); ctx.fillRect(x+9,y+5,3,3);
  ctx.fillStyle=C.white;
  ctx.fillRect(x+3,y+6,1,1); ctx.fillRect(x+10,y+6,1,1);
  // 눈썹
  ctx.fillStyle='#000';
  ctx.save(); ctx.translate(x+3,y+4); ctx.rotate(0.3); ctx.fillRect(0,0,5,2); ctx.restore();
  ctx.save(); ctx.translate(x+11,y+4); ctx.rotate(-0.3); ctx.fillRect(-5,0,5,2); ctx.restore();
}

/* ── Clawd 픽셀 ── */
function drawClawd(ctx,x,y,dir,frame,onGround,vy){
  ctx.save();
  if(dir===-1){ ctx.translate(x+7,0); ctx.scale(-1,1); x=-7; }

  // 몸통
  ctx.fillStyle=C.clawd; ctx.fillRect(x+2,y+6,10,8);
  // 집게 — 걷는 애니메이션
  const clawOff = onGround?[0,1,-1,0][frame]:0;
  ctx.fillStyle=C.clawdDark;
  ctx.fillRect(x-1,  y+7+clawOff, 3,4);  // 왼쪽
  ctx.fillRect(x+12, y+7-clawOff, 3,4);  // 오른쪽

  // 다리
  const legAnim=onGround?[0,2,0,-2][frame]:0;
  ctx.fillStyle=C.clawd;
  ctx.fillRect(x+2, y+14,         3, 3+Math.max(0,legAnim));
  ctx.fillRect(x+9, y+14,         3, 3+Math.max(0,-legAnim));

  // 눈
  ctx.fillStyle=C.eye;
  ctx.fillRect(x+8,y+7,3,4);
  ctx.fillStyle=C.white;
  ctx.fillRect(x+9,y+8,1,1);

  // 점프 중 표정
  if(vy<-2){
    ctx.fillStyle=C.eye; ctx.fillRect(x+6,y+8,2,1); // 입
  }

  ctx.restore();
}

/* ── 레벨 초기화 ── */
function initLevel(){
  const lvl=LEVELS[gState.level];
  gState.tiles   = buildLevel(lvl);
  gState.enemies = (lvl.enemyData||[]).map(e=>makeEnemy(e.tx,e.ty));
  gState.player  = makePlayer();
  gState.particles=[];
  gState.floatTexts=[];
  gState.camera  = 0;
  gState.goalReached=false;
  gState.levelClearing=false;
  gState.gameOver=false;
}

/* ── 게임 루프 ── */
function gameLoop(ts){
  if(!gState.running) return;
  const dt = ts - gState.lastTime;
  gState.lastTime = ts;
  updateGame(dt);
  drawGame();
  gState.raf = requestAnimationFrame(gameLoop);
}

/* ── 키 입력 ── */
function onKeyDown(e){
  if(!gState.running) return;
  if(e.code==='ArrowLeft'||e.code==='KeyA')  gState.keys.left=true;
  if(e.code==='ArrowRight'||e.code==='KeyD') gState.keys.right=true;
  if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){ gState.keys.jump=true; e.preventDefault(); }
}
function onKeyUp(e){
  if(e.code==='ArrowLeft'||e.code==='KeyA')  gState.keys.left=false;
  if(e.code==='ArrowRight'||e.code==='KeyD') gState.keys.right=false;
  if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW') gState.keys.jump=false;
}

/* ── 모바일 버튼 ── */
function bindMobileButtons(){
  const bl=document.getElementById('gbtn-left');
  const br=document.getElementById('gbtn-right');
  const bj=document.getElementById('gbtn-jump');
  const on =(k)=>()=>gState.keys[k]=true;
  const off=(k)=>()=>gState.keys[k]=false;
  bl.addEventListener('touchstart',on('left'),{passive:true});
  bl.addEventListener('touchend',  off('left'),{passive:true});
  br.addEventListener('touchstart',on('right'),{passive:true});
  br.addEventListener('touchend',  off('right'),{passive:true});
  bj.addEventListener('touchstart',on('jump'),{passive:true});
  bj.addEventListener('touchend',  off('jump'),{passive:true});
  // 마우스도
  bl.addEventListener('mousedown',on('left'));   bl.addEventListener('mouseup',off('left'));
  br.addEventListener('mousedown',on('right'));  br.addEventListener('mouseup',off('right'));
  bj.addEventListener('mousedown',on('jump'));   bj.addEventListener('mouseup',off('jump'));
}

/* ── 게임 시작/종료 (전역 노출) ── */
window.startMarioGame = function(){
  resizeCanvas();
  initLevel();
  gState.running=true;
  gState.score=0; gState.lives=3; gState.level=0;
  initLevel();

  overlay.classList.add('active');
  if(gameIdle) gameIdle.style.display='none';
  document.getElementById('game-keys').style.display='block';

  document.addEventListener('keydown',onKeyDown);
  document.addEventListener('keyup',  onKeyUp);
  bindMobileButtons();

  gState.lastTime=performance.now();
  gState.raf=requestAnimationFrame(gameLoop);

  // 홈 탭에서 Clawd 숨기기
  const clawdEl=document.getElementById('clawd');
  if(clawdEl) clawdEl.style.opacity='0';
};

function stopMarioGame(){
  gState.running=false;
  cancelAnimationFrame(gState.raf);
  overlay.classList.remove('active');
  document.removeEventListener('keydown',onKeyDown);
  document.removeEventListener('keyup',  onKeyUp);
  // keys 초기화
  gState.keys.left=gState.keys.right=gState.keys.jump=false;
  if(gameIdle) gameIdle.style.display='flex';
  document.getElementById('game-keys').style.display='none';
  const clawdEl=document.getElementById('clawd');
  if(clawdEl) clawdEl.style.opacity='1';
}

closeBtn.addEventListener('click',stopMarioGame);
const gameroomBtn = document.getElementById('gameroom-btn');
if(gameroomBtn) gameroomBtn.addEventListener('click', e => { e.stopPropagation(); startMarioGame(); });

})();
