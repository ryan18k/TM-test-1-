// ── PORTRAITS ──
const PORTRAITS = {};
document.addEventListener('DOMContentLoaded', ()=>{
  const store = document.getElementById('portrait-store');
  if(!store) return;
  store.querySelectorAll('img').forEach(img => {
    PORTRAITS[img.id.replace('p_','')] = img.src;
  });
});

// ── BACKGROUND JPG avec transition fondu ──
let _currentBg = '';
async function setBgScene(name){
  const map = { hospital:'images/bg_hospital.jpg', apartment:'images/bg_apartment.jpg', or:'images/bg_corridor.jpg' };
  const url = map[name] || '';
  if(url === _currentBg) return;
  const layer = document.getElementById('bg-layer');
  // Fondu sortant
  layer.classList.add('fading');
  await sleep(600);
  layer.style.backgroundImage = url ? `url('${url}')` : 'none';
  _currentBg = url;
  layer.classList.remove('fading');
  await sleep(400);
}

// ── AUDIO — 2 MP3 + sons mini-jeux ──
let AC = null;
let _musicAmbiance = null;
let _musicTension  = null;
let _currentTrack  = null;
let _fadeTimer     = null;

function initMusic(){
  _musicAmbiance = new Audio('audio/musique_ambiance.mp3');
  _musicAmbiance.loop = true; _musicAmbiance.volume = 0;
  _musicTension  = new Audio('audio/musique_tension.mp3');
  // #13 : pas de blanc — on remet manuellement au début 1s avant la fin
  _musicTension.loop = false; _musicTension.volume = 0;
  _musicTension.addEventListener('timeupdate', ()=>{
    if(_musicTension.duration && _musicTension.currentTime >= _musicTension.duration - 1.2){
      _musicTension.currentTime = 0;
    }
  });
}

function _crossfade(inTrack, outTrack, ms=1400){
  clearInterval(_fadeTimer);
  if(inTrack){ try{ inTrack.play().catch(()=>{}); }catch(e){} }
  const steps=40, dt=ms/steps;
  let i=0;
  _fadeTimer=setInterval(()=>{
    i++;const t=i/steps;
    if(outTrack) outTrack.volume=Math.max(0,1-t);
    if(inTrack)  inTrack.volume =Math.min(1,t);
    if(i>=steps){
      clearInterval(_fadeTimer);
      if(outTrack){ outTrack.pause(); outTrack.volume=0; }
      if(inTrack) inTrack.volume=1;
    }
  },dt);
}

function playMusicAmbiance(){
  if(_currentTrack==='ambiance') return;
  _currentTrack='ambiance';
  _crossfade(_musicAmbiance, _musicTension, 1400);
}
function playMusicTension(){
  if(_currentTrack==='tension') return;
  _currentTrack='tension';
  if(_musicTension) _musicTension.currentTime=0;
  _crossfade(_musicTension, _musicAmbiance, 900);
}
function stopMusic(ms=800){
  _currentTrack=null;
  const a=_musicAmbiance, t=_musicTension;
  clearInterval(_fadeTimer);
  let i=0,steps=30,dt=ms/steps;
  _fadeTimer=setInterval(()=>{
    i++;const v=Math.max(0,1-i/steps);
    if(a) a.volume=v; if(t) t.volume=v;
    if(i>=steps){ clearInterval(_fadeTimer); if(a){a.pause();a.volume=0;} if(t){t.pause();t.volume=0;} }
  },dt);
}

// Alias pour story.js
function setAmbience(name){
  if(name==='hospital'||name==='apartment'||name==='ending') playMusicAmbiance();
  else if(name==='or'||name==='choice'||name==='choiceFast') playMusicTension();
}
function disposeAmbience(){ stopMusic(); }
function stopPulse(){}

document.addEventListener('touchstart',()=>{ if(AC&&AC.state==='suspended') AC.resume(); },{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    if(AC&&AC.state==='suspended') AC.resume();
    if(_currentTrack==='ambiance'&&_musicAmbiance&&_musicAmbiance.paused) _musicAmbiance.play().catch(()=>{});
    if(_currentTrack==='tension' &&_musicTension &&_musicTension.paused)  _musicTension.play().catch(()=>{});
  }
});

// Sons mini-jeux
function playTick(freq,vol){
  if(!AC) return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.frequency.value=freq; g.gain.setValueAtTime(vol,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.15);
  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+0.18);
}

// ── CORE ENGINE ──
const sceneEl    = document.getElementById('scene');
const speakerEl  = document.getElementById('speaker-name');
const textEl     = document.getElementById('dialogue-text');
const continueBtn= document.getElementById('continue-btn');
const progressBar= document.getElementById('progress-bar');
const dialogueBox= document.getElementById('dialogue-box');

let waitingForContinue=false, continueResolve=null, typewriterDone=false;
let _twTimer=null;

continueBtn.addEventListener('click', advanceScene);
document.addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter') advanceScene(); });
sceneEl.addEventListener('click', advanceScene);

function advanceScene(){
  if(!typewriterDone) return;
  if(waitingForContinue&&continueResolve){
    waitingForContinue=false;
    const r=continueResolve; continueResolve=null; r();
  }
}
function waitContinue(){ return new Promise(r=>{ waitingForContinue=true; continueResolve=r; }); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function setProgress(p){ progressBar.style.width=p+'%'; }

async function fadeOut(ms=600){ const fo=document.getElementById('fade-overlay'); fo.style.transition=`opacity ${ms/1000}s ease`; fo.style.opacity='1'; await sleep(ms); }
async function fadeIn(ms=600){  const fo=document.getElementById('fade-overlay'); fo.style.transition=`opacity ${ms/1000}s ease`; fo.style.opacity='0'; await sleep(ms); }

async function showActTitle(num){
  await fadeOut(500);
  const ov=document.getElementById('act-overlay'),tx=document.getElementById('act-title-text');
  tx.textContent='Acte '+['I','II','III','IV'][num-1];
  ov.style.opacity='1'; ov.classList.add('active');
  await sleep(1800);
  ov.style.opacity='0'; ov.classList.remove('active');
  await sleep(600);
}
// Alias utilisé dans story.js
async function showAct(n){ await showActTitle(n); }

async function showLocation(place,time){
  const b=document.getElementById('location-banner');
  document.getElementById('location-place').textContent=place;
  document.getElementById('location-time').textContent=time;
  b.className='center'; await sleep(2200);
  b.className='top';    await sleep(800);
}
function hideLocation(){ document.getElementById('location-banner').className=''; }

// ── STAGE — 1 seul personnage à la fois ──
let _currentCharKey = null;

function stageShow(key, dimmed=false){
  const slot=document.getElementById('slot-main');
  if(!slot) return;
  const src=PORTRAITS[key];
  if(!src){ stageHideAll(); return; }
  let img=slot.querySelector('img');
  if(!img){ img=document.createElement('img'); slot.appendChild(img); }
  img.src=src;
  slot.classList.remove('hidden','dimmed');
  if(dimmed) slot.classList.add('dimmed');
  _currentCharKey=key;
}
function stageHideAll(){
  const slot=document.getElementById('slot-main');
  if(slot){ slot.classList.add('hidden'); }
  _currentCharKey=null;
}
// Compatibilité legacy (story.js peut appeler ces fonctions)
function stageHide(){ stageHideAll(); }
function stageActivate(){}
let SCENE_CAST={};

// ── TYPEWRITER ──
function typewrite(text, el, onDone){
  clearTimeout(_twTimer);
  typewriterDone=false;
  continueBtn.classList.remove('ready');
  el.textContent='';
  let i=0;
  const speed=26;
  function tick(){
    if(i<=text.length){
      el.textContent=text.slice(0,i); i++;
      _twTimer=setTimeout(tick,speed);
    } else {
      typewriterDone=true;
      continueBtn.classList.add('ready');
      if(onDone) onDone();
    }
  }
  tick();
}

// ── DIALOGUE ──
// speaker=null + isThought=true → indication scénique, aucun personnage
// speaker=string + isThought=false → dialogue normal
// speaker=string + isThought=true → personnage grisé (pensée)
function showDialogue(speaker, text, isThought=false){
  const noSpeaker = !speaker;

  // Gestion du personnage affiché
  if(noSpeaker && isThought){
    // Indication scénique : aucun personnage
    stageHideAll();
    dialogueBox.classList.add('narration');
  } else if(speaker){
    const cast=SCENE_CAST[speaker];
    const key=cast?cast.key:null;
    dialogueBox.classList.remove('narration');
    if(key){
      stageShow(key, isThought); // grisé si pensée du personnage
    } else {
      stageHideAll();
    }
  } else {
    stageHideAll();
    dialogueBox.classList.add('narration');
  }

  // Speaker name
  if(speaker && !isThought){
    speakerEl.style.display='block';
    speakerEl.textContent=speaker;
  } else {
    speakerEl.style.display='none';
  }

  // Style texte
  textEl.className = isThought ? 'thought' : '';

  sceneEl.classList.add('visible');
  continueBtn.style.display='block';
  typewrite(text, textEl, null);
}

// ── CHOIX ──
async function showChoice(cfg){
  const sc=document.getElementById('choice-screen'),
        timerEl=document.getElementById('choice-timer'),
        pL=document.getElementById('pulse-left'),pR=document.getElementById('pulse-right');
  document.getElementById('choice-left-text').textContent=cfg.left.label;
  document.getElementById('choice-right-text').textContent=cfg.right.label;
  document.getElementById('choice-left-sub').textContent=cfg.left.sub||'';
  document.getElementById('choice-right-sub').textContent=cfg.right.sub||'';
  sceneEl.classList.remove('visible');
  sc.classList.add('active');
  if(cfg.fast){pL.classList.add('fast');pR.classList.add('fast');}
  let secs=cfg.duration; timerEl.textContent=secs; timerEl.classList.remove('urgent');
  return new Promise(res=>{
    const intv=setInterval(()=>{
      secs--;timerEl.textContent=secs;
      if(secs<=Math.ceil(cfg.duration*0.35)) timerEl.classList.add('urgent');
      if(secs<=3&&navigator.vibrate) navigator.vibrate([30,15,30]);
      if(secs<=0){
        clearInterval(intv);
        const chosen=cfg.allowRandom?(Math.random()<.5?'left':'right'):null;
        sc.classList.remove('active');timerEl.classList.remove('urgent');
        pL.classList.remove('fast');pR.classList.remove('fast');res(chosen);
      }
    },1000);
    window._activeChoiceResolve=(side)=>{
      clearInterval(intv);sc.classList.remove('active');timerEl.classList.remove('urgent');
      pL.classList.remove('fast');pR.classList.remove('fast');res(side);
    };
  });
}
function makeChoice(side){ if(window._activeChoiceResolve) window._activeChoiceResolve(side); }

// ── END / CREDITS ──
async function showEndScreen(lines){
  const sc=document.getElementById('end-screen'),ct=document.getElementById('end-content');
  ct.innerHTML='';sc.classList.add('active');
  document.getElementById('end-title-display').style.opacity='0';
  document.getElementById('restart-btn').classList.remove('shown');
  document.getElementById('credits-btn').classList.remove('shown');
  for(const ln of lines){
    const el=document.createElement('span');el.className='end-line';el.textContent=ln;
    ct.appendChild(el);await sleep(80);el.classList.add('shown');await sleep(1700);
  }
  await sleep(600);
  document.getElementById('end-title-display').style.opacity='1';await sleep(800);
  document.getElementById('restart-btn').classList.add('shown');
  document.getElementById('credits-btn').classList.add('shown');
}
function showCredits(){ document.getElementById('credits-screen').classList.add('active'); }
function hideCredits(){ document.getElementById('credits-screen').classList.remove('active'); }

// ── MINIGAMES HELPERS ──
async function showMGBanner(title,subtitle){
  const b=document.getElementById('mg-banner');
  document.getElementById('mg-banner-title').textContent=title;
  document.getElementById('mg-banner-sub').textContent=subtitle;
  b.className='center'; await sleep(3000); b.className='top'; await sleep(700);
}
function hideMGBanner(){
  document.getElementById('mg-banner').className='';
  document.getElementById('mg-counter-errors').style.display='none';
  document.getElementById('mg-counter-score').style.display='none';
}
function updateMGCounters(errors,maxE,score,total,flashErr=false,flashScore=false){
  document.getElementById('mg-counter-errors').style.display='flex';
  document.getElementById('mg-counter-score').style.display='flex';
  const ev=document.getElementById('mg-err-val'),sv=document.getElementById('mg-score-val');
  ev.textContent=errors+'/'+maxE; sv.textContent=score+'/'+total;
  ev.style.color=errors>=maxE-1?'#c04040':'#8a3232';
  if(flashErr){ev.classList.remove('flash');void ev.offsetWidth;ev.classList.add('flash');setTimeout(()=>ev.classList.remove('flash'),250);}
  if(flashScore){sv.classList.remove('flash');void sv.offsetWidth;sv.classList.add('flash');setTimeout(()=>sv.classList.remove('flash'),250);}
}

// Écran d'échec
function showMGFail(msg){
  return new Promise(res=>{
    const ov=document.getElementById('mg-fail-overlay');
    document.getElementById('mg-fail-msg').textContent=msg;
    ov.classList.add('visible');
    const btn=document.getElementById('mg-retry-btn');
    const handler=()=>{
      btn.removeEventListener('click',handler);
      ov.classList.remove('visible');
      setTimeout(res,400);
    };
    btn.addEventListener('click',handler);
  });
}

// ── MINI-JEU 1 : CERCLES ──
function runMG_circles(opts){
  return new Promise(async res=>{
    await showMGBanner(opts.title||'',opts.subtitle||'');
    const mg=document.getElementById('minigame-container'),
          cvs=document.getElementById('minigame-canvas'),
          ctx=cvs.getContext('2d');
    const W=window.innerWidth,H=window.innerHeight;
    cvs.width=W;cvs.height=H;
    mg.classList.add('active');
    const maxE=opts.maxErrors||3,total=opts.total||10,baseLife=opts.speed||2.5,maxActive=opts.maxActive||3;
    let errors=0,score=0,points=[],animId,done=false,lastSpawn=0;
    updateMGCounters(0,maxE,0,total);
    const M=60;

    function spawn(){
      const x=M+Math.random()*(W-M*2), y=M+50+Math.random()*(H-M*2-50);
      points.push({x,y,life:baseLife*(0.8+Math.random()*0.4),born:performance.now()/1000,hit:false,miss:false,flash:0});
    }
    function si(){ return Math.max(0.35,baseLife*0.65-(score/total)*baseLife*0.35); }

    function draw(ts){
      if(done) return;
      const now=ts/1000; ctx.clearRect(0,0,W,H);
      if(points.filter(p=>!p.hit&&!p.miss).length<maxActive && now-lastSpawn>si()){ spawn(); lastSpawn=now; }
      for(let i=points.length-1;i>=0;i--){
        const p=points[i],age=(now-p.born)/p.life;
        if(p.hit||p.miss){
          p.flash-=0.05; if(p.flash<=0){points.splice(i,1);continue;}
          ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);
          ctx.fillStyle=p.hit?`rgba(60,200,90,${p.flash})`:`rgba(200,55,55,${p.flash})`;ctx.fill();continue;
        }
        if(age>=1){
          p.miss=true;p.flash=1;errors++;
          updateMGCounters(errors,maxE,score,total,true,false);playTick(220,0.12);
          if(errors>=maxE){endMG(false);return;}continue;
        }
        const danger=age>0.6,R=28;
        const g2=ctx.createRadialGradient(p.x,p.y,R*.5,p.x,p.y,R*1.5);
        g2.addColorStop(0,danger?'rgba(180,40,40,0.2)':'rgba(40,120,180,0.14)');g2.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(p.x,p.y,R*1.5,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,R,0,Math.PI*2);ctx.strokeStyle='rgba(40,55,70,0.5)';ctx.lineWidth=3;ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,R,-Math.PI/2,-Math.PI/2+Math.PI*2*age);
        ctx.strokeStyle=danger?'rgba(200,65,45,0.95)':'rgba(70,155,200,0.9)';ctx.lineWidth=3.5;ctx.lineCap='round';ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.fillStyle=danger?'rgba(220,90,65,0.9)':'rgba(110,195,230,0.88)';ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fill();
      }
      if(score>=total){endMG(true);return;}
      animId=requestAnimationFrame(draw);
    }
    async function endMG(result){
      done=true;cancelAnimationFrame(animId);
      await sleep(300);mg.classList.remove('active');hideMGBanner();
      if(result===false) await showMGFail(opts.failMessage||'Concentrez-vous. Chaque geste compte.');
      res(result);
    }
    function tap(e){
      if(done) return;e.preventDefault();
      const rect=cvs.getBoundingClientRect(),src=e.touches?e.touches[0]:e;
      const cx=(src.clientX-rect.left)*(W/rect.width),cy=(src.clientY-rect.top)*(H/rect.height);
      for(const p of points){
        if(p.hit||p.miss) continue;
        if(Math.hypot(cx-p.x,cy-p.y)<34){p.hit=true;p.flash=1;score++;updateMGCounters(errors,maxE,score,total,false,true);playTick(880,0.15);break;}
      }
    }
    cvs.addEventListener('click',tap);cvs.addEventListener('touchstart',tap,{passive:false});
    animId=requestAnimationFrame(draw);
  });
}

// ── MINI-JEU 2 : SUTURES (tracés) — corrigé ──
// Corrections : traces bornées au canvas, pas plus de maxSim à la fois,
// spawn uniquement quand une place est libre, total respecté
function runMG_traces(opts){
  return new Promise(async res=>{
    await showMGBanner(opts.title||'',opts.subtitle||'');
    const mg=document.getElementById('minigame-container'),
          cvs=document.getElementById('minigame-canvas'),
          ctx=cvs.getContext('2d');
    const W=window.innerWidth,H=window.innerHeight;
    cvs.width=W;cvs.height=H;
    mg.classList.add('active');
    const total=opts.total||10, maxE=opts.maxErrors||3, maxSim=opts.maxSim||2;
    let errors=0,score=0,done=false,animId,traceId=0;
    let traces=[];
    updateMGCounters(0,maxE,0,total);

    // Grille 2×2 pour éviter les chevauchements
    const ZONES=[
      {x:W*.12,y:H*.12,w:W*.36,h:H*.34},
      {x:W*.52,y:H*.12,w:W*.36,h:H*.34},
      {x:W*.12,y:H*.50,w:W*.36,h:H*.34},
      {x:W*.52,y:H*.50,w:W*.36,h:H*.34},
    ];

    function freeZones(){
      const used=traces.filter(t=>!t.done).map(t=>t.zoneIdx);
      return ZONES.map((z,i)=>i).filter(i=>!used.includes(i));
    }

    function genTrace(id){
      const fz=freeZones();
      if(!fz.length) return null;
      const zi=fz[Math.floor(Math.random()*fz.length)];
      const z=ZONES[zi];
      const pad=30;
      const x1=z.x+pad+Math.random()*(z.w-pad*2-80);
      const y1=z.y+pad+Math.random()*(z.h-pad*2);
      const x2=x1+80+Math.random()*(z.w-pad*2-80);
      const y2=z.y+pad+Math.random()*(z.h-pad*2);
      // Courbe de bézier simple
      const cx=(x1+x2)/2+(Math.random()-.5)*60;
      const cy=(y1+y2)/2+(Math.random()-.5)*50;
      const pts=[];
      for(let t=0;t<=1;t+=0.02) pts.push({
        x:(1-t)*(1-t)*x1+2*(1-t)*t*cx+t*t*x2,
        y:(1-t)*(1-t)*y1+2*(1-t)*t*cy+t*t*y2
      });
      return {id,zoneIdx:zi,pts,x1,y1,x2,y2,
        born:performance.now()/1000,
        lifespan:Math.max(4,7-score*.08),
        tracing:false,userPath:[],
        success:false,fail:false,flash:0,done:false};
    }

    function trySpawn(){
      const active=traces.filter(t=>!t.done).length;
      const spawned=traces.length;
      if(active>=maxSim) return;
      if(spawned>=(score+errors+maxSim)) return; // ne pas spawner trop à l'avance
      if(score+errors+active>=total) return;
      const tr=genTrace(traceId++);
      if(tr) traces.push(tr);
    }

    // Spawn initial
    for(let i=0;i<maxSim;i++) trySpawn();
    let lastSpawnT=performance.now()/1000;

    function distToTrace(mx,my,tr){
      let min=9999;
      for(const p of tr.pts) min=Math.min(min,Math.hypot(mx-p.x,my-p.y));
      return min;
    }

    function draw(ts){
      if(done) return;
      const now=ts/1000;
      ctx.clearRect(0,0,W,H);

      // Spawn périodique
      if(now-lastSpawnT>0.9){ trySpawn(); lastSpawnT=now; }

      for(let i=traces.length-1;i>=0;i--){
        const tr=traces[i];
        if(tr.done){
          tr.flash-=0.04;
          if(tr.flash<=0){ traces.splice(i,1); trySpawn(); continue; }
          if(tr.pts.length>1){
            ctx.beginPath();ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
            for(let j=1;j<tr.pts.length;j++) ctx.lineTo(tr.pts[j].x,tr.pts[j].y);
            ctx.strokeStyle=tr.success?`rgba(60,210,90,${tr.flash})`:`rgba(210,55,55,${tr.flash})`;
            ctx.lineWidth=4;ctx.lineJoin='round';ctx.stroke();
          }
          continue;
        }
        const age=(now-tr.born)/tr.lifespan;
        if(age>=1&&!tr.tracing){
          tr.fail=true;tr.done=true;tr.flash=1;
          errors++;updateMGCounters(errors,maxE,score,total,true,false);playTick(220,0.1);
          if(errors>=maxE){endMG(false);return;}
          continue;
        }
        // Tracé guide
        const alpha=Math.max(0.12,0.55*(1-age));
        if(tr.pts.length>1){
          ctx.beginPath();ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
          for(let j=1;j<tr.pts.length;j++) ctx.lineTo(tr.pts[j].x,tr.pts[j].y);
          ctx.strokeStyle=`rgba(60,110,155,${alpha})`;ctx.lineWidth=20;ctx.lineJoin='round';ctx.stroke();
          ctx.strokeStyle=`rgba(40,85,130,${alpha*1.5})`;ctx.lineWidth=2;ctx.stroke();
        }
        // Timer arc + points début/fin
        ctx.beginPath();ctx.arc(tr.x1,tr.y1,16,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-age));
        ctx.strokeStyle=age>0.6?'rgba(190,65,40,0.85)':'rgba(80,165,210,0.75)';ctx.lineWidth=2.5;ctx.stroke();
        ctx.beginPath();ctx.arc(tr.x1,tr.y1,8,0,Math.PI*2);ctx.fillStyle='rgba(80,165,210,0.88)';ctx.fill();
        ctx.beginPath();ctx.arc(tr.x2,tr.y2,8,0,Math.PI*2);ctx.fillStyle='rgba(80,145,185,0.55)';ctx.fill();
        ctx.beginPath();ctx.arc(tr.x2,tr.y2,14,0,Math.PI*2);ctx.strokeStyle='rgba(80,145,185,0.35)';ctx.lineWidth=1.5;ctx.stroke();
        // Tracé utilisateur
        if(tr.userPath.length>1){
          ctx.beginPath();ctx.moveTo(tr.userPath[0].x,tr.userPath[0].y);
          for(let j=1;j<tr.userPath.length;j++) ctx.lineTo(tr.userPath[j].x,tr.userPath[j].y);
          ctx.strokeStyle='rgba(210,230,245,0.9)';ctx.lineWidth=2.8;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
        }
      }
      if(score>=total){endMG(true);return;}
      animId=requestAnimationFrame(draw);
    }

    async function endMG(result){
      done=true;cancelAnimationFrame(animId);
      await sleep(300);mg.classList.remove('active');hideMGBanner();
      if(result===false) await showMGFail(opts.failMessage||'Une précision chirurgicale est exigée. Recommencez.');
      res(result);
    }

    function getPos(e){ const r=cvs.getBoundingClientRect(),s=e.touches?e.touches[0]:e; return {x:(s.clientX-r.left)*(W/r.width),y:(s.clientY-r.top)*(H/r.height)}; }
    function onStart(e){
      e.preventDefault();const p=getPos(e);
      let best=null,bestD=9999;
      for(const tr of traces){
        if(tr.done||tr.tracing) continue;
        const d=Math.hypot(p.x-tr.x1,p.y-tr.y1);
        if(d<bestD){bestD=d;best=tr;}
      }
      if(best&&bestD<40){best.tracing=true;best.userPath=[p];}
    }
    function onMove(e){
      if(done) return;e.preventDefault();const p=getPos(e);
      for(const tr of traces){
        if(!tr.tracing||tr.done) continue;
        tr.userPath.push(p);
        if(distToTrace(p.x,p.y,tr)>28){
          tr.fail=true;tr.done=true;tr.flash=1;tr.tracing=false;
          errors++;updateMGCounters(errors,maxE,score,total,true,false);playTick(220,0.1);
          if(errors>=maxE){endMG(false);return;}
        }
      }
    }
    function onEnd(e){
      if(done) return;
      for(const tr of traces){
        if(!tr.tracing||tr.done) continue;
        tr.tracing=false;
        const last=tr.userPath[tr.userPath.length-1]||{x:0,y:0};
        if(Math.hypot(last.x-tr.x2,last.y-tr.y2)<30){
          tr.success=true;tr.done=true;tr.flash=1;
          score++;updateMGCounters(errors,maxE,score,total,false,true);playTick(1040,0.13);
        } else {
          tr.fail=true;tr.done=true;tr.flash=1;
          errors++;updateMGCounters(errors,maxE,score,total,true,false);playTick(220,0.1);
          if(errors>=maxE){endMG(false);return;}
        }
      }
    }
    cvs.addEventListener('mousedown',onStart);cvs.addEventListener('mousemove',onMove);cvs.addEventListener('mouseup',onEnd);
    cvs.addEventListener('touchstart',onStart,{passive:false});cvs.addEventListener('touchmove',onMove,{passive:false});cvs.addEventListener('touchend',onEnd,{passive:false});
    animId=requestAnimationFrame(draw);
  });
}

// ── MINI-JEU 3 : DOSAGE (nouveau) ──
// Maintenir un curseur dans une zone verte qui se déplace
function runMG_dosage(opts){
  return new Promise(async res=>{
    await showMGBanner(opts.title||'',opts.subtitle||'');
    const mg=document.getElementById('minigame-container'),
          cvs=document.getElementById('minigame-canvas'),
          ctx=cvs.getContext('2d');
    const W=window.innerWidth,H=window.innerHeight;
    cvs.width=W;cvs.height=H;
    mg.classList.add('active');
    const duration=opts.duration||18000; // ms à tenir
    let held=0,missed=0,done=false,animId,started=false;
    let pressing=false,pressX=0;

    // Zone verte qui oscille
    let zoneX=W*.5, zoneW=W*.18, zoneSpeed=(W*.003);
    let zoneDir=1, zoneDrift=0;
    const barY=H*.5, barH=44, barX=W*.1, barW=W*.8;
    let cursorX=W*.5;
    let lastTs=null, totalHeld=0, flashGreen=0, flashRed=0;

    updateMGCounters(0,3,0,Math.round(duration/1000));

    function draw(ts){
      if(done) return;
      const dt=lastTs?Math.min(ts-lastTs,50):16; lastTs=ts;

      ctx.clearRect(0,0,W,H);

      // Déplacement zone verte (oscillation + drift aléatoire)
      zoneDrift+=(Math.random()-.5)*0.4;
      zoneDrift=Math.max(-2,Math.min(2,zoneDrift));
      zoneX+=(zoneSpeed*zoneDir+zoneDrift);
      if(zoneX+zoneW/2>barX+barW){ zoneDir=-1; }
      if(zoneX-zoneW/2<barX){ zoneDir=1; }

      // Déplacement curseur si appui
      if(pressing){
        cursorX+=(pressX-cursorX)*0.18;
      }
      cursorX=Math.max(barX+2,Math.min(barX+barW-2,cursorX));

      const inZone=cursorX>=zoneX-zoneW/2 && cursorX<=zoneX+zoneW/2;
      if(pressing&&inZone){
        totalHeld+=dt;
        flashGreen=Math.min(1,flashGreen+0.1);
        flashRed=Math.max(0,flashRed-0.08);
      } else if(pressing){
        flashRed=Math.min(1,flashRed+0.12);
        flashGreen=Math.max(0,flashGreen-0.08);
      } else {
        flashGreen=Math.max(0,flashGreen-0.05);
        flashRed=Math.max(0,flashRed-0.05);
      }

      const progress=Math.min(1,totalHeld/duration);

      // Barre de fond
      ctx.fillStyle='rgba(20,25,35,0.85)';
      ctx.beginPath();ctx.roundRect(barX,barY-barH/2,barW,barH,barH/2);ctx.fill();

      // Barre progression
      ctx.fillStyle=`rgba(40,130,80,${0.5+flashGreen*0.4})`;
      ctx.beginPath();ctx.roundRect(barX,barY-barH/2,barW*progress,barH,barH/2);ctx.fill();

      // Zone verte
      ctx.fillStyle=`rgba(50,200,100,${0.22+flashGreen*0.12})`;
      ctx.beginPath();ctx.roundRect(zoneX-zoneW/2,barY-barH/2,zoneW,barH,6);ctx.fill();
      ctx.strokeStyle=`rgba(60,210,110,${0.55+flashGreen*0.3})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.roundRect(zoneX-zoneW/2,barY-barH/2,zoneW,barH,6);ctx.stroke();

      // Curseur
      const cCol=inZone?`rgba(60,220,110,0.95)`:`rgba(220,80,60,${0.7+flashRed*0.3})`;
      ctx.fillStyle=cCol;
      ctx.beginPath();ctx.arc(cursorX,barY,barH*.52,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cursorX,barY,barH*.52,0,Math.PI*2);ctx.stroke();

      // Flash rouge si hors zone
      if(flashRed>0.05){
        ctx.fillStyle=`rgba(200,40,40,${flashRed*0.06})`;ctx.fillRect(0,0,W,H);
      }

      // Texte instruction
      ctx.fillStyle='rgba(160,170,180,0.7)';ctx.font=`${clamp(12,1.8,16)}px Georgia`;ctx.textAlign='center';
      ctx.fillText(pressing?'Maintenez dans la zone verte':'Appuyez et guidez le curseur',W/2,barY-barH/2-20);

      // Timer
      const secLeft=Math.max(0,Math.ceil((duration-totalHeld)/1000));
      document.getElementById('mg-score-val').textContent=Math.round(totalHeld/1000)+'/'+Math.round(duration/1000);

      if(totalHeld>=duration){endMG(true);return;}
      animId=requestAnimationFrame(draw);
    }

    function clamp(min,vw,max){ return Math.min(max,Math.max(min,window.innerWidth*vw/100)); }

    async function endMG(result){
      done=true;cancelAnimationFrame(animId);
      await sleep(300);mg.classList.remove('active');hideMGBanner();
      if(result===false) await showMGFail(opts.failMessage||'La perfusion a été interrompue. Recommencez.');
      res(result);
    }

    function getX(e){ const r=cvs.getBoundingClientRect(),s=e.touches?e.touches[0]:e; return (s.clientX-r.left)*(W/r.width); }
    function onStart(e){ e.preventDefault();pressing=true;pressX=getX(e); }
    function onMove(e){ e.preventDefault();if(pressing) pressX=getX(e); }
    function onEnd(e){ pressing=false; }
    cvs.addEventListener('mousedown',onStart);cvs.addEventListener('mousemove',onMove);cvs.addEventListener('mouseup',onEnd);
    cvs.addEventListener('touchstart',onStart,{passive:false});cvs.addEventListener('touchmove',onMove,{passive:false});cvs.addEventListener('touchend',onEnd,{passive:false});

    // Afficher le compteur score
    document.getElementById('mg-counter-errors').style.display='none';
    document.getElementById('mg-counter-score').style.display='flex';
    document.getElementById('mg-score-val').textContent='0/'+Math.round(duration/1000);
    document.querySelector('#mg-counter-score .mg-count-label').textContent='secondes';

    animId=requestAnimationFrame(draw);
  });
}
