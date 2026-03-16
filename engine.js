const PORTRAITS = {};
function loadPortraits(){
  const store = document.getElementById('portrait-store');
  if(!store) return;
  store.querySelectorAll('img').forEach(img => {
    const key = img.id.replace('p_', '');
    PORTRAITS[key] = img.src;
  });
}

// ── BACKGROUNDS ──
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let bgW, bgH;
let currentBgScene = 'hospital';

const bgImages = {};
function loadBgImages(){
  const srcs = {
    hospital:  'images/bg_hospital.jpg',
    apartment: 'images/bg_apartment.jpg',
    corridor:  'images/bg_corridor.jpg',
  };
  Object.entries(srcs).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    bgImages[key] = img;
  });
}
loadBgImages();

function resizeBg(){ bgW = bgCanvas.width = window.innerWidth; bgH = bgCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeBg);
resizeBg();

function drawBg(){
  const img = bgImages[currentBgScene] || bgImages['hospital'];
  if(!img || !img.complete || !img.naturalWidth){
    bgCtx.fillStyle='#040508';
    bgCtx.fillRect(0,0,bgW,bgH);
    return;
  }
  const scale = Math.max(bgW/img.naturalWidth, bgH/img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (bgW - w) / 2;
  const y = (bgH - h) / 2;
  bgCtx.drawImage(img, x, y, w, h);
  bgCtx.fillStyle = 'rgba(4,5,8,0.45)';
  bgCtx.fillRect(0,0,bgW,bgH);
}

function setBgScene(scene){ currentBgScene = scene; }

function bgLoop(){
  bgCtx.clearRect(0,0,bgW,bgH);
  drawBg();
  requestAnimationFrame(bgLoop);
}
bgLoop();

// ── MUSIQUE ──
let musicAmbiance = null;
let musicTension  = null;
let musicReady    = false;

function loadMusic(){
  musicAmbiance = new Audio('audio/musique_ambiance.mp3');
  musicAmbiance.loop = true;
  musicAmbiance.volume = 0;

  musicTension = new Audio('audio/musique_tension.mp3');
  musicTension.loop = true;
  musicTension.volume = 0;
}

function startMusic(){
  if(!musicReady) return;
  musicAmbiance.play().catch(()=>{});
  fadeMusic(musicAmbiance, 0, 0.7, 2000);
}

function fadeMusic(audio, from, to, durationMs){
  audio.volume = from;
  const steps = 40;
  const stepTime = durationMs / steps;
  const delta = (to - from) / steps;
  let i = 0;
  const t = setInterval(()=>{
    i++;
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
    if(i >= steps){ clearInterval(t); audio.volume = to; }
  }, stepTime);
}

function switchToTension(){
  if(!musicReady) return;
  musicTension.currentTime = 0;
  musicTension.play().catch(()=>{});
  fadeMusic(musicAmbiance, musicAmbiance.volume, 0,   1500);
  fadeMusic(musicTension,  musicTension.volume,  0.8, 1500);
}

function switchToAmbiance(){
  if(!musicReady) return;
  fadeMusic(musicTension,  musicTension.volume,  0,   1500);
  fadeMusic(musicAmbiance, musicAmbiance.volume, 0.7, 1500);
}

function stopAllMusic(fadems=1500){
  if(!musicReady) return;
  fadeMusic(musicAmbiance, musicAmbiance.volume, 0, fadems);
  fadeMusic(musicTension,  musicTension.volume,  0, fadems);
}

// ── AUDIO AMBIANCE (Web Audio API) ──
let AC=null, ambiGain=null, ambiNodes=[];
function makeNoise(type='white'){
  const bufLen=AC.sampleRate*3, buf=AC.createBuffer(1,bufLen,AC.sampleRate), data=buf.getChannelData(0);
  if(type==='white'){ for(let i=0;i<bufLen;i++) data[i]=Math.random()*2-1; }
  else if(type==='pink'){ let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0; for(let i=0;i<bufLen;i++){ const w=Math.random()*2-1; b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980; data[i]=(b0+b1+b2+b3+b4+b5+w*0.5362)*0.11; } }
  else { let last=0; for(let i=0;i<bufLen;i++){ const w=Math.random()*2-1; data[i]=(last+0.02*w)/1.02; last=data[i]; data[i]*=3.5; } }
  const src=AC.createBufferSource(); src.buffer=buf; src.loop=true; return src;
}
function makeBiquad(type,freq,Q=1){ const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=Q; return f; }
function makeGain(val,dest=null){ const g=AC.createGain(); g.gain.value=val; if(dest) g.connect(dest); return g; }
function makeOsc(type,freq,dest=null){ const o=AC.createOscillator(); o.type=type; o.frequency.value=freq; if(dest) o.connect(dest); return o; }
function makeDelay(t){ const d=AC.createDelay(2); d.delayTime.value=t; return d; }
function playSingleTone(freq,vol,attack,decay){
  if(!AC) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.frequency.value=freq; o.type='sine';
  g.gain.setValueAtTime(0,AC.currentTime);
  g.gain.linearRampToValueAtTime(vol,AC.currentTime+attack);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+attack+decay);
  o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+attack+decay+0.05);
}
function startAmbience(builder,fadeSec=1.5){
  if(!AC) return;
  const doStart=()=>{
    if(ambiGain){ const now=AC.currentTime; ambiGain.gain.cancelScheduledValues(now); ambiGain.gain.setValueAtTime(ambiGain.gain.value,now); ambiGain.gain.linearRampToValueAtTime(0,now+fadeSec*0.5); const old=[...ambiNodes]; setTimeout(()=>{ old.forEach(n=>{ try{n.stop&&n.stop()}catch(e){} try{n.disconnect&&n.disconnect()}catch(e){} }); },fadeSec*500+100); }
    ambiNodes=[]; const newGain=AC.createGain(); newGain.gain.value=0; newGain.connect(AC.destination); ambiGain=newGain; builder(newGain);
    const now=AC.currentTime; newGain.gain.setValueAtTime(0,now); newGain.gain.linearRampToValueAtTime(1,now+fadeSec);
  };
  AC.state==='suspended' ? AC.resume().then(doStart).catch(doStart) : doStart();
}
function stopAmbience(fadeSec=1){
  if(!AC||!ambiGain) return;
  const now=AC.currentTime; ambiGain.gain.cancelScheduledValues(now); ambiGain.gain.setValueAtTime(ambiGain.gain.value,now); ambiGain.gain.linearRampToValueAtTime(0,now+fadeSec);
  const old=ambiNodes; setTimeout(()=>{ old.forEach(n=>{ try{n.stop&&n.stop()}catch(e){} }); },fadeSec*1000+200); ambiGain=null; ambiNodes=[];
}
function buildHospital(out){
  const ventN=makeNoise('pink'),ventBP=makeBiquad('bandpass',420,1.8),ventLP=makeBiquad('lowpass',800),ventG=makeGain(0.08,out);
  ventN.connect(ventBP); ventBP.connect(ventLP); ventLP.connect(ventG);
  const ventLFO=makeOsc('sine',0.15),ventLG=makeGain(0.03); ventLFO.connect(ventLG); ventLG.connect(ventG.gain);
  ventN.start(); ventLFO.start(); ambiNodes.push(ventN,ventBP,ventLP,ventG,ventLFO,ventLG);
  const neon1=makeOsc('sawtooth',120),neon2=makeOsc('sawtooth',120.6),neonLP=makeBiquad('lowpass',300),neonG=makeGain(0.012,out);
  neon1.connect(neonLP); neon2.connect(neonLP); neonLP.connect(neonG); neon1.start(); neon2.start(); ambiNodes.push(neon1,neon2,neonLP,neonG);
  const rainN=makeNoise('white'),rainHP=makeBiquad('highpass',2800),rainLP=makeBiquad('lowpass',8000),rainG=makeGain(0.06,out);
  rainN.connect(rainHP); rainHP.connect(rainLP); rainLP.connect(rainG);
  const rainLFO=makeOsc('sine',0.08),rainLG=makeGain(0.025); rainLFO.connect(rainLG); rainLG.connect(rainG.gain);
  rainN.start(); rainLFO.start(); ambiNodes.push(rainN,rainHP,rainLP,rainG,rainLFO,rainLG);
  let bipH=null; function schedBip(){ bipH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(1050,0.04,0.003,0.12); schedBip(); },900+Math.random()*40); } schedBip();
  ambiNodes.push({stop:()=>clearTimeout(bipH),disconnect:()=>{}});
  const hum=makeOsc('sine',55),humG=makeGain(0.04,out); hum.connect(humG); hum.start(); ambiNodes.push(hum,humG);
  let dropH=null; function schedDrop(){ dropH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(330+Math.random()*80,0.025,0.002,0.3); schedDrop(); },3000+Math.random()*5000); } schedDrop();
  ambiNodes.push({stop:()=>clearTimeout(dropH),disconnect:()=>{}});
}
function buildApartment(out){
  const fireN=makeNoise('brown'),fireHP=makeBiquad('highpass',600),fireBP=makeBiquad('bandpass',1800,0.8),fireG=makeGain(0.14,out);
  fireN.connect(fireHP); fireHP.connect(fireBP); fireBP.connect(fireG);
  const fireLFO=makeOsc('sine',0.3),fireLG=makeGain(0.04),fireLFO2=makeOsc('sine',0.07),fireLG2=makeGain(0.06);
  fireLFO.connect(fireLG); fireLG.connect(fireG.gain); fireLFO2.connect(fireLG2); fireLG2.connect(fireG.gain);
  fireN.start(); fireLFO.start(); fireLFO2.start(); ambiNodes.push(fireN,fireHP,fireBP,fireG,fireLFO,fireLG,fireLFO2,fireLG2);
  let crackH=null; function schedCrack(){ crackH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(800+Math.random()*1200,0.035,0.001,0.06+Math.random()*0.08); schedCrack(); },400+Math.random()*1200); } schedCrack();
  ambiNodes.push({stop:()=>clearTimeout(crackH),disconnect:()=>{}});
  const rainN=makeNoise('white'),rainHP=makeBiquad('highpass',3500),rainLP=makeBiquad('lowpass',9000),rainG=makeGain(0.04,out);
  rainN.connect(rainHP); rainHP.connect(rainLP); rainLP.connect(rainG); rainN.start(); ambiNodes.push(rainN,rainHP,rainLP,rainG);
  const pianoNotes=[294,349,440,523,440,349,294,262]; let pIdx=0,pianoH=null;
  function schedPiano(){ pianoH=setTimeout(()=>{ if(!ambiGain) return; const freq=pianoNotes[pIdx++%pianoNotes.length]; const o=AC.createOscillator(),g=AC.createGain(),rev=makeDelay(0.04); o.type='triangle'; o.frequency.value=freq; const t=AC.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.06,t+0.015); g.gain.exponentialRampToValueAtTime(0.001,t+1.8); o.connect(g); g.connect(out); g.connect(rev); rev.connect(out); o.start(); o.stop(t+2); schedPiano(); },700+Math.random()*400); } schedPiano();
  ambiNodes.push({stop:()=>clearTimeout(pianoH),disconnect:()=>{}});
  let clockH=null; function schedClock(){ clockH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(1800,0.022,0.001,0.04); clockH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(1400,0.015,0.001,0.04); schedClock(); },480); },480); } schedClock();
  ambiNodes.push({stop:()=>clearTimeout(clockH),disconnect:()=>{}});
  const night=makeOsc('sine',110),nightG=makeGain(0.02,out); night.connect(nightG); night.start(); ambiNodes.push(night,nightG);
}
let bipRate=820,bipHandle=null;
function buildOR(out){
  bipRate=820;
  const ventN=makeNoise('pink'),ventBP=makeBiquad('bandpass',350,1.2),ventG=makeGain(0.10,out),ventLFO=makeOsc('sine',0.2),ventLG=makeGain(0.06);
  ventN.connect(ventBP); ventBP.connect(ventG); ventLFO.connect(ventLG); ventLG.connect(ventG.gain); ventN.start(); ventLFO.start(); ambiNodes.push(ventN,ventBP,ventG,ventLFO,ventLG);
  const roomN=makeNoise('white'),roomLP=makeBiquad('lowpass',200),roomG=makeGain(0.018,out); roomN.connect(roomLP); roomLP.connect(roomG); roomN.start(); ambiNodes.push(roomN,roomLP,roomG);
  const cold1=makeOsc('sine',55),cold2=makeOsc('sine',110),coldG=makeGain(0.025,out); cold1.connect(coldG); cold2.connect(coldG); cold1.start(); cold2.start(); ambiNodes.push(cold1,cold2,coldG);
  function schedBip(){ bipHandle=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(880,0.10,0.003,0.09); schedBip(); },bipRate+(Math.random()*16-8)); } schedBip();
  ambiNodes.push({stop:()=>clearTimeout(bipHandle),disconnect:()=>{}});
  let cauterH=null; function schedCauter(){ cauterH=setTimeout(()=>{ if(!ambiGain) return; const n=makeNoise('white'),hp=makeBiquad('highpass',2000),g=makeGain(0,out); n.connect(hp); hp.connect(g); n.start(); const t=AC.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.08,t+0.02); g.gain.linearRampToValueAtTime(0,t+0.12); setTimeout(()=>{ try{n.stop();n.disconnect()}catch(e){} },300); schedCauter(); },8000+Math.random()*12000); } schedCauter();
  ambiNodes.push({stop:()=>clearTimeout(cauterH),disconnect:()=>{}});
  window._accelerateBip=(target,durationMs)=>{ const steps=30,stepTime=durationMs/steps,delta=(bipRate-target)/steps; let i=0; const t=setInterval(()=>{ bipRate=Math.max(target,bipRate-delta); i++; if(i>=steps)clearInterval(t); },stepTime); };
  window._normalizeBip=()=>{ bipRate=820; };
}
let heartHandle=null,heartRate=1100;
function buildChoice(out,fast=false){
  heartRate=fast?680:1100;
  function schedHeart(){ heartHandle=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(48,0.40,0.006,0.22); setTimeout(()=>playSingleTone(42,0.26,0.006,0.16),135); schedHeart(); },heartRate); } schedHeart();
  ambiNodes.push({stop:()=>clearTimeout(heartHandle),disconnect:()=>{}});
  const rumble=makeNoise('brown'),lp=makeBiquad('lowpass',100),rg=makeGain(0.18,out); rumble.connect(lp); lp.connect(rg); rumble.start(); ambiNodes.push(rumble,lp,rg);
  const d1=makeOsc('sawtooth',55),d2=makeOsc('sawtooth',77.8),dlp=makeBiquad('lowpass',600),dg=makeGain(0.032,out); d1.connect(dlp); d2.connect(dlp); dlp.connect(dg); d1.start(); d2.start(); ambiNodes.push(d1,d2,dlp,dg);
  const anxN=makeNoise('pink'),anxBP=makeBiquad('bandpass',800,1.2),anxG=makeGain(0.05,out); anxN.connect(anxBP); anxBP.connect(anxG);
  const anxLFO=makeOsc('sine',fast?2.2:1.1),anxLG=makeGain(0.03); anxLFO.connect(anxLG); anxLG.connect(anxG.gain); anxN.start(); anxLFO.start(); ambiNodes.push(anxN,anxBP,anxG,anxLFO,anxLG);
  if(fast){ let rH=setInterval(()=>{ heartRate=Math.max(380,heartRate-32); if(heartRate<=380)clearInterval(rH); },400); ambiNodes.push({stop:()=>clearInterval(rH),disconnect:()=>{}}); }
}
function buildEnding(out){
  const roomN=makeNoise('pink'),lp=makeBiquad('lowpass',180),rg=makeGain(0.022,out); roomN.connect(lp); lp.connect(rg); roomN.start(); ambiNodes.push(roomN,lp,rg);
  const drone=makeOsc('sine',52),droneG=makeGain(0.018,out); drone.connect(droneG); drone.start(); ambiNodes.push(drone,droneG);
  function bell(freq,vol,decay,delay=0){ setTimeout(()=>{ if(!AC) return; const o=AC.createOscillator(),g=AC.createGain(); o.type='sine'; o.frequency.value=freq; const t=AC.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+decay); o.connect(g); g.connect(out); o.start(); o.stop(t+decay+0.1); },delay); }
  setTimeout(()=>{ bell(246,0.20,9); bell(369,0.10,6); bell(493,0.06,4); bell(123,0.14,11); },600);
  setTimeout(()=>{ bell(220,0.16,8); bell(329,0.08,5); },6000);
  let stepsH=null; function schedSteps(){ stepsH=setTimeout(()=>{ if(!ambiGain) return; playSingleTone(180+Math.random()*40,0.03,0.01,0.08); setTimeout(()=>{ if(ambiGain) playSingleTone(160+Math.random()*40,0.025,0.01,0.08); },500); schedSteps(); },3000+Math.random()*4000); } schedSteps();
  ambiNodes.push({stop:()=>clearTimeout(stepsH),disconnect:()=>{}});
}
function setAmbience(name,fadems=2000){
  if(!AC) return;
  const fadeSec=fadems/1000;
  const builders={hospital:out=>buildHospital(out),apartment:out=>buildApartment(out),or:out=>buildOR(out),corridor:out=>buildOR(out),choice:out=>buildChoice(out,false),choiceFast:out=>buildChoice(out,true),ending:out=>buildEnding(out)};
  if(builders[name]) startAmbience(builders[name],fadeSec);
}
function disposeAmbience(){ stopAmbience(0.3); }
function stopPulse(){}
function startTension(){}
document.addEventListener('touchstart',()=>{ if(AC&&AC.state==='suspended') AC.resume(); if(musicReady){ musicAmbiance.play().catch(()=>{}); } },{passive:true});
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&AC&&AC.state==='suspended') AC.resume(); });

// ── CORE ENGINE ──
const sceneEl=document.getElementById('scene');
const speakerEl=document.getElementById('speaker-name');
const textEl=document.getElementById('dialogue-text');
const continueBtn=document.getElementById('continue-btn');
const progressBar=document.getElementById('progress-bar');
let waitingForContinue=false,continueResolve=null;
continueBtn.addEventListener('click',advanceScene);
document.addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter') advanceScene(); });
function advanceScene(){ if(waitingForContinue&&continueResolve){ waitingForContinue=false; const r=continueResolve; continueResolve=null; r(); } }
function waitContinue(){ return new Promise(r=>{ waitingForContinue=true; continueResolve=r; }); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function setProgress(p){ progressBar.style.width=p+'%'; }
async function fadeOut(ms=600){ const fo=document.getElementById('fade-overlay'); fo.style.transition=`opacity ${ms/1000}s ease`; fo.style.opacity='1'; await sleep(ms); }
async function fadeIn(ms=600){ const fo=document.getElementById('fade-overlay'); fo.style.transition=`opacity ${ms/1000}s ease`; fo.style.opacity='0'; await sleep(ms); }
async function showActTitle(num){ await fadeOut(500); const ov=document.getElementById('act-overlay'),tx=document.getElementById('act-title-text'); tx.textContent='Acte '+['I','II','III','IV'][num-1]; ov.style.opacity='1'; ov.classList.add('active'); await sleep(1800); ov.style.opacity='0'; ov.classList.remove('active'); await sleep(600); }
async function showLocation(place,time){ const banner=document.getElementById('location-banner'); document.getElementById('location-place').textContent=place; document.getElementById('location-time').textContent=time; banner.className='center'; await sleep(2200); banner.className='top'; await sleep(800); }
function hideLocation(){ document.getElementById('location-banner').className=''; }
const stageState={left:null,right:null,center:null};
function stageShow(slot,characterKey){
  const el=document.getElementById('slot-'+slot);
  if(!el) return;
  const src=PORTRAITS[characterKey];
  if(!src){ el.classList.add('hidden'); return; }
  el.innerHTML='<img src="'+src+'" style="height:100%;width:auto;max-width:100%;object-fit:contain;">';
  el.classList.remove('hidden','dimmed');
  stageState[slot]=characterKey;
}
function stageHide(slot){ const el=document.getElementById('slot-'+slot); if(el){ el.classList.add('hidden'); el.innerHTML=''; } stageState[slot]=null; }
function stageHideAll(){ ['left','right','center'].forEach(stageHide); }
function stageActivate(activeSlot){ ['left','right','center'].forEach(slot=>{ const el=document.getElementById('slot-'+slot); if(!el||el.classList.contains('hidden')) return; slot===activeSlot ? el.classList.remove('dimmed') : el.classList.add('dimmed'); }); }
let SCENE_CAST={};
function showDialogue(speaker,text,isThought=false){
  if(speaker){ speakerEl.style.display='block'; speakerEl.textContent=speaker; const cast=SCENE_CAST[speaker]; if(cast) stageActivate(cast.slot); else stageActivate(null); }
  else { speakerEl.style.display='none'; if(isThought) ['left','right','center'].forEach(slot=>{ const el=document.getElementById('slot-'+slot); if(el&&!el.classList.contains('hidden')) el.classList.add('dimmed'); }); }
  textEl.className=isThought?'thought':''; textEl.textContent=text; sceneEl.classList.add('visible'); continueBtn.style.display='block';
}
async function showChoice(cfg){
  const sc=document.getElementById('choice-screen'),timerEl=document.getElementById('choice-timer'),pL=document.getElementById('pulse-left'),pR=document.getElementById('pulse-right');
  document.getElementById('choice-left-text').textContent=cfg.left.label; document.getElementById('choice-right-text').textContent=cfg.right.label;
  document.getElementById('choice-left-sub').textContent=cfg.left.sub||''; document.getElementById('choice-right-sub').textContent=cfg.right.sub||'';
  sceneEl.classList.remove('visible'); sc.classList.add('active');
  if(cfg.fast){ pL.classList.add('fast'); pR.classList.add('fast'); }
  let secs=cfg.duration; timerEl.textContent=secs; timerEl.classList.remove('urgent');
  return new Promise(res=>{
    const intv=setInterval(()=>{ secs--; timerEl.textContent=secs; if(secs<=Math.ceil(cfg.duration*0.35)) timerEl.classList.add('urgent'); if(secs<=3&&navigator.vibrate) navigator.vibrate([30,15,30]); if(secs<=0){ clearInterval(intv); const chosen=cfg.allowRandom?(Math.random()<.5?'left':'right'):null; stopPulse(); sc.classList.remove('active'); timerEl.classList.remove('urgent'); pL.classList.remove('fast'); pR.classList.remove('fast'); res(chosen); } },1000);
    window._activeChoiceResolve=(side)=>{ clearInterval(intv); stopPulse(); sc.classList.remove('active'); timerEl.classList.remove('urgent'); pL.classList.remove('fast'); pR.classList.remove('fast'); res(side); };
  });
}
function makeChoice(side){ if(window._activeChoiceResolve) window._activeChoiceResolve(side); }
async function showEndScreen(lines){
  const sc=document.getElementById('end-screen'),ct=document.getElementById('end-content');
  ct.innerHTML=''; sc.classList.add('active'); document.getElementById('end-title-display').style.opacity='0';
  document.getElementById('restart-btn').classList.remove('shown'); document.getElementById('credits-btn').classList.remove('shown');
  for(const ln of lines){ const el=document.createElement('span'); el.className='end-line'; el.textContent=ln; ct.appendChild(el); await sleep(80); el.classList.add('shown'); await sleep(1700); }
  await sleep(600); document.getElementById('end-title-display').style.opacity='1'; await sleep(800);
  document.getElementById('restart-btn').classList.add('shown'); document.getElementById('credits-btn').classList.add('shown');
}
function showCredits(){ document.getElementById('credits-screen').classList.add('active'); }
function hideCredits(){ document.getElementById('credits-screen').classList.remove('active'); }

// ── MINIGAMES ──
async function showMGBanner(title,subtitle){ const b=document.getElementById('mg-banner'); document.getElementById('mg-banner-title').textContent=title; document.getElementById('mg-banner-sub').textContent=subtitle; b.className='center'; await new Promise(r=>setTimeout(r,3200)); b.className='top'; await new Promise(r=>setTimeout(r,800)); }
function hideMGBanner(){ document.getElementById('mg-banner').className=''; document.getElementById('mg-counter-errors').style.display='none'; document.getElementById('mg-counter-score').style.display='none'; }
function updateMGCounters(errors,maxE,score,total,flashErr=false,flashScore=false){
  document.getElementById('mg-counter-errors').style.display='flex'; document.getElementById('mg-counter-score').style.display='flex';
  const ev=document.getElementById('mg-err-val'),sv=document.getElementById('mg-score-val');
  ev.textContent=errors+' / '+maxE; sv.textContent=score+' / '+total; ev.style.color=errors>=maxE-1?'#c04040':'#8a3232';
  if(flashErr){ ev.classList.remove('flash'); void ev.offsetWidth; ev.classList.add('flash'); setTimeout(()=>ev.classList.remove('flash'),250); }
  if(flashScore){ sv.classList.remove('flash'); void sv.offsetWidth; sv.classList.add('flash'); setTimeout(()=>sv.classList.remove('flash'),250); }
}
function playTick(freq,vol){ if(!AC) return; const o=AC.createOscillator(),g=AC.createGain(); o.frequency.value=freq; g.gain.setValueAtTime(vol,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.15); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+0.18); }
function runMG_circles(opts){
  return new Promise(async res=>{
    switchToTension();
    await showMGBanner(opts.title||'',opts.subtitle||'');
    const mg=document.getElementById('minigame-container'),cvs=document.getElementById('minigame-canvas'),ctx=cvs.getContext('2d');
    mg.classList.add('active');
    const W=window.innerWidth,H=window.innerHeight; cvs.width=W; cvs.height=H;
    const maxE=opts.maxErrors||3,total=opts.total||10,baseLife=opts.speed||2.5,maxActive=opts.maxActive||4;
    let errors=0,score=0,points=[],animId,done=false; updateMGCounters(0,maxE,0,total);
    const MARGIN=56;
    function spawnPoint(){ const x=MARGIN+Math.random()*(W-MARGIN*2),y=MARGIN+40+Math.random()*(H-MARGIN*2-40),life=baseLife*(0.8+Math.random()*0.4); points.push({x,y,life,born:performance.now()/1000,hit:false,miss:false,flash:0}); }
    let lastSpawn=0;
    function spawnInterval(){ return Math.max(0.3,baseLife*0.7-(score/total)*baseLife*0.4); }
    function drawFrame(ts){
      if(done) return; const now=ts/1000; ctx.clearRect(0,0,W,H);
      const active=points.filter(p=>!p.hit&&!p.miss).length;
      if(active<maxActive&&now-lastSpawn>spawnInterval()){ spawnPoint(); lastSpawn=now; }
      for(let i=points.length-1;i>=0;i--){
        const p=points[i],age=(now-p.born)/p.life;
        if(p.hit||p.miss){ p.flash-=0.045; if(p.flash<=0){ points.splice(i,1); continue; } ctx.beginPath(); ctx.arc(p.x,p.y,14,0,Math.PI*2); ctx.fillStyle=p.hit?`rgba(60,200,90,${p.flash})`:`rgba(200,55,55,${p.flash})`; ctx.fill(); continue; }
        if(age>=1){ p.miss=true; p.flash=1; errors++; updateMGCounters(errors,maxE,score,total,true,false); playTick(220,0.12); if(!(opts.interruptAt&&score>=opts.interruptAt)&&errors>=maxE){ endMG(false); return; } continue; }
        const danger=age>0.60,R=28;
        const grad=ctx.createRadialGradient(p.x,p.y,R*0.5,p.x,p.y,R*1.5); grad.addColorStop(0,danger?'rgba(180,40,40,0.18)':'rgba(40,120,180,0.12)'); grad.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(p.x,p.y,R*1.5,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2); ctx.strokeStyle='rgba(40,55,70,0.45)'; ctx.lineWidth=3; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x,p.y,R,-Math.PI/2,-Math.PI/2+Math.PI*2*age); ctx.strokeStyle=danger?'rgba(200,65,45,0.95)':'rgba(70,155,200,0.9)'; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fillStyle=danger?'rgba(220,90,65,0.9)':'rgba(110,195,230,0.88)'; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.fill();
      }
      if(opts.interruptAt&&score>=opts.interruptAt&&!done){ endMG('interrupt'); return; }
      if(score>=total&&!done){ endMG(true); return; }
      animId=requestAnimationFrame(drawFrame);
    }
    function endMG(result){ done=true; cancelAnimationFrame(animId); switchToAmbiance(); setTimeout(()=>{ mg.classList.remove('active'); hideMGBanner(); res(result); },350); }
    function onTap(e){ if(done) return; e.preventDefault(); const rect=cvs.getBoundingClientRect(),src=e.touches?e.touches[0]:e,cx=(src.clientX-rect.left)*(W/rect.width),cy=(src.clientY-rect.top)*(H/rect.height); for(const p of points){ if(p.hit||p.miss) continue; if(Math.hypot(cx-p.x,cy-p.y)<32){ p.hit=true; p.flash=1; score++; updateMGCounters(errors,maxE,score,total,false,true); playTick(880,0.15); break; } } }
    cvs.addEventListener('click',onTap); cvs.addEventListener('touchstart',onTap,{passive:false}); cvs.addEventListener('pointerdown',onTap);
    animId=requestAnimationFrame(drawFrame);
  });
}
function runMG_traces(opts){
  return new Promise(async res=>{
    switchToTension();
    await showMGBanner(opts.title||'',opts.subtitle||'');
    const mg=document.getElementById('minigame-container'),cvs=document.getElementById('minigame-canvas'),ctx=cvs.getContext('2d');
    mg.classList.add('active');
    const W=window.innerWidth,H=window.innerHeight; cvs.width=W; cvs.height=H;
    const total=opts.total||15,maxE=opts.maxErrors||3,fast=opts.fast||false,maxSim=opts.maxSim||(fast?4:2);
    let errors=0,score=0,done=false,animId; updateMGCounters(0,maxE,0,total);
    let traces=[],traceId=0; const MARGIN=60;
    const ZONES=[]; for(let r=0;r<2;r++) for(let c=0;c<2;c++) ZONES.push({row:r,col:c});
    function getFreezone(){ const occ=traces.filter(t=>!t.success&&!t.fail).map(t=>t.zone); const free=ZONES.filter(z=>!occ.find(o=>o&&o.row===z.row&&o.col===z.col)); return free.length?free[Math.floor(Math.random()*free.length)]:ZONES[Math.floor(Math.random()*ZONES.length)]; }
    function genBezierPts(x1,y1,cx,cy,x2,y2){ const pts=[]; for(let t=0;t<=1;t+=0.025) pts.push({x:(1-t)*(1-t)*x1+2*(1-t)*t*cx+t*t*x2,y:(1-t)*(1-t)*y1+2*(1-t)*t*cy+t*t*y2}); return pts; }
    function genZigzagPts(x1,y1,x2,y2,steps){ const pts=[{x:x1,y:y1}]; for(let i=1;i<steps;i++){ const t=i/steps; pts.push({x:x1+(x2-x1)*t,y:y1+(y2-y1)*t+(i%2===0?-80:80)}); } pts.push({x:x2,y:y2}); const result=[]; for(let i=0;i<pts.length-1;i++) for(let t=0;t<=1;t+=0.05) result.push({x:pts[i].x+(pts[i+1].x-pts[i].x)*t,y:pts[i].y+(pts[i+1].y-pts[i].y)*t}); return result; }
    function genArcPts(x1,y1,x2,y2){ const mx=(x1+x2)/2,my=(y1+y2)/2,r=Math.hypot(x2-x1,y2-y1)/2,a0=Math.atan2(y1-my,x1-mx),a1=Math.atan2(y2-my,x2-mx),pts=[]; for(let i=0;i<=40;i++) pts.push({x:mx+r*Math.cos(a0+(a1-a0)*i/40),y:my+r*Math.sin(a0+(a1-a0)*i/40)}); return pts; }
    function genSCurvePts(x1,y1,x2,y2){ const mx=(x1+x2)/2,my=(y1+y2)/2,off=120; return [...genBezierPts(x1,y1,mx-off,my-off,mx,my),...genBezierPts(mx,my,mx+off,my+off,x2,y2)]; }
    function genTrace(id){ const type=Math.floor(Math.random()*4),zone=getFreezone(),zW=(W-MARGIN*2)/2,zH=(H-MARGIN*2-60)/2,zX=MARGIN+zone.col*zW,zY=MARGIN+50+zone.row*zH,pad=30; const x1=zX+pad+Math.random()*(zW*0.3),y1=zY+pad+Math.random()*(zH-pad*2),x2=zX+zW-pad-Math.random()*(zW*0.3),y2=zY+pad+Math.random()*(zH-pad*2); let pts; if(type===0){const cx=(x1+x2)/2+(Math.random()-0.5)*80,cy=(y1+y2)/2+(Math.random()-0.5)*60;pts=genBezierPts(x1,y1,cx,cy,x2,y2);}else if(type===1){pts=genZigzagPts(x1,y1,x2,y2,2+Math.floor(Math.random()*2));}else if(type===2){pts=genArcPts(x1,y1,x2,y2);}else{pts=genSCurvePts(x1,y1,x2,y2);} const lifespan=fast?Math.max(2.5,5.0-score*0.06):Math.max(4.0,7.0-score*0.05); return {id,type,zone,pts,x1,y1,x2,y2,born:performance.now()/1000,lifespan,tracing:false,userPath:[],success:false,fail:false,flash:0}; }
    function distToTrace(mx,my,tr){ let minD=9999; for(const p of tr.pts) minD=Math.min(minD,Math.hypot(mx-p.x,my-p.y)); return minD; }
    function trySpawn(){ if(score+errors>=total) return; const spawned=traces.filter(t=>!t.success&&!t.fail).length; if(spawned<maxSim&&traces.length<total) traces.push(genTrace(traceId++)); }
    for(let i=0;i<maxSim;i++) trySpawn();
    let lastSpawnTime=performance.now()/1000;
    function drawFrame(ts){
      if(done) return; const now=ts/1000; ctx.clearRect(0,0,W,H);
      if(now-lastSpawnTime>0.8){ trySpawn(); lastSpawnTime=now; }
      for(let i=traces.length-1;i>=0;i--){
        const tr=traces[i],age=(now-tr.born)/tr.lifespan;
        if(tr.success||tr.fail){ tr.flash-=0.04; if(tr.flash<=0){ traces.splice(i,1); trySpawn(); continue; } if(tr.pts.length>1){ ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y); for(let j=1;j<tr.pts.length;j++) ctx.lineTo(tr.pts[j].x,tr.pts[j].y); ctx.strokeStyle=tr.success?`rgba(60,210,90,${tr.flash})`:`rgba(210,55,55,${tr.flash})`; ctx.lineWidth=4; ctx.lineJoin='round'; ctx.stroke(); } continue; }
        if(age>=1&&!tr.tracing){ tr.fail=true; tr.flash=1; errors++; updateMGCounters(errors,maxE,score,total); playTick(220,0.1); if(errors>=maxE){ endMG(false); return; } continue; }
        const alpha=Math.max(0.12,0.55*(1-age));
        if(tr.pts.length>1){ ctx.beginPath(); ctx.moveTo(tr.pts[0].x,tr.pts[0].y); for(let j=1;j<tr.pts.length;j++) ctx.lineTo(tr.pts[j].x,tr.pts[j].y); ctx.strokeStyle=`rgba(60,110,155,${alpha})`; ctx.lineWidth=22; ctx.lineJoin='round'; ctx.stroke(); ctx.strokeStyle=`rgba(40,85,130,${alpha*1.6})`; ctx.lineWidth=2; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(tr.x1,tr.y1,18,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-age)); ctx.strokeStyle=age>0.6?'rgba(190,65,40,0.85)':'rgba(80,165,210,0.75)'; ctx.lineWidth=2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(tr.x1,tr.y1,9,0,Math.PI*2); ctx.fillStyle='rgba(80,165,210,0.85)'; ctx.fill();
        ctx.beginPath(); ctx.arc(tr.x2,tr.y2,9,0,Math.PI*2); ctx.fillStyle='rgba(80,145,185,0.5)'; ctx.fill();
        ctx.beginPath(); ctx.arc(tr.x2,tr.y2,16,0,Math.PI*2); ctx.strokeStyle='rgba(80,145,185,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
        if(tr.userPath.length>1){ ctx.beginPath(); ctx.moveTo(tr.userPath[0].x,tr.userPath[0].y); for(let j=1;j<tr.userPath.length;j++) ctx.lineTo(tr.userPath[j].x,tr.userPath[j].y); ctx.strokeStyle='rgba(210,230,245,0.88)'; ctx.lineWidth=2.8; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.stroke(); }
      }
      if(score>=total&&!done){ endMG(true); return; }
      animId=requestAnimationFrame(drawFrame);
    }
    function endMG(result){ done=true; cancelAnimationFrame(animId); switchToAmbiance(); setTimeout(()=>{ mg.classList.remove('active'); hideMGBanner(); res(result); },350); }
    function getPos(e){ const rect=cvs.getBoundingClientRect(),src=e.touches?e.touches[0]:e; return {x:(src.clientX-rect.left)*(W/rect.width),y:(src.clientY-rect.top)*(H/rect.height)}; }
    function onStart(e){ e.preventDefault(); const p=getPos(e); let best=null,bestD=9999; for(const tr of traces){ if(tr.success||tr.fail||tr.tracing) continue; const d=Math.hypot(p.x-tr.x1,p.y-tr.y1); if(d<bestD){ bestD=d; best=tr; } } if(best&&bestD<38){ best.tracing=true; best.userPath=[p]; } }
    function onMove(e){ if(done) return; e.preventDefault(); const p=getPos(e); for(const tr of traces){ if(!tr.tracing||tr.success||tr.fail) continue; tr.userPath.push(p); if(distToTrace(p.x,p.y,tr)>26){ tr.fail=true; tr.flash=1; tr.tracing=false; errors++; updateMGCounters(errors,maxE,score,total); playTick(220,0.1); if(errors>=maxE){ endMG(false); return; } } } }
    function onEnd(e){ if(done) return; for(const tr of traces){ if(!tr.tracing||tr.success||tr.fail) continue; tr.tracing=false; const last=tr.userPath[tr.userPath.length-1]||{x:0,y:0}; if(Math.hypot(last.x-tr.x2,last.y-tr.y2)<28){ tr.success=true; tr.flash=1; score++; updateMGCounters(errors,maxE,score,total); playTick(1040,0.13); } else { tr.fail=true; tr.flash=1; errors++; updateMGCounters(errors,maxE,score,total); playTick(220,0.1); if(errors>=maxE){ endMG(false); return; } } } }
    cvs.addEventListener('mousedown',onStart); cvs.addEventListener('mousemove',onMove); cvs.addEventListener('mouseup',onEnd);
    cvs.addEventListener('touchstart',onStart,{passive:false}); cvs.addEventListener('touchmove',onMove,{passive:false}); cvs.addEventListener('touchend',onEnd,{passive:false});
    animId=requestAnimationFrame(drawFrame);
  });
}
