// RivalSea – Commandes (souris, clavier, tactile) et choix de bonus
'use strict';
// ——— Commandes ———
const onSkillBtn=e=>Math.hypot(e.clientX-SKB.x,e.clientY-SKB.y)<SKB.r+8;
cv.addEventListener('pointerdown',e=>{if(state!=='play')return;
if(Math.hypot(e.clientX-SNB.x,e.clientY-SNB.y)<SNB.r+6){SND.init();SND.toggle();return}
if(Math.hypot(e.clientX-STB.x,e.clientY-STB.y)<STB.r+6){statsOpen=!statsOpen;return}
if(onSkillBtn(e)){sendM({t:'sk'});return}
if(e.pointerType==='touch'){touchMode=true;joy={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY}}else{mx=e.clientX;my=e.clientY;if(e.button===0)aimHeld=true}});
addEventListener('pointerup',e=>{if(e.pointerType!=='touch')aimHeld=false});addEventListener('blur',()=>{aimHeld=false;keys.clear()});
// clavier : ZQSD / WASD / flèches pour diriger ; la souris sert alors seulement à viser
const KD={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
addEventListener('keydown',e=>{if(KD[e.code]&&state==='play'&&e.target.tagName!=='INPUT'){keys.add(e.code);kbMode=true;if(e.code.startsWith('Arrow'))e.preventDefault()}});addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){joy.x=e.clientX;joy.y=e.clientY}else if(e.pointerType!=='touch'){touchMode=false;mx=e.clientX;my=e.clientY}});
const endJoy=e=>{if(joy&&e.pointerId===joy.id)joy=null};
addEventListener('pointerup',endJoy);addEventListener('pointercancel',endJoy);
addEventListener('keydown',e=>{if(state!=='play'||e.target.tagName==='INPUT')return;
if(e.code==='Space'){e.preventDefault();sendM({t:'sk'})}
let n=['Digit1','Digit2','Digit3'].indexOf(e.code);if(n<0)n=['Numpad1','Numpad2','Numpad3'].indexOf(e.code);if(n<0)n=['1','2','3'].indexOf(e.key);if(n>=0&&curOffer&&!offerEl.hidden&&n<curOffer.o.length)pickOffer(n)});
const zoom=()=>me?cl(1.12/(.7+.3*CL[me.c].sz)-me.l*.006,.45,1.1):.8;
// envoi de la direction au serveur 20 fois par seconde
setInterval(()=>{const z=zoom(),view={vw:Math.round(W/2/z),vh:Math.round(H/2/z)};
if(state!=='play'||!me){sendM(Object.assign({t:'in'},view));return}
const d=ents.get(myId);if(!d)return;let a=d.a,f=.12;
if(joy){const dx=joy.x-joy.x0,dy=joy.y-joy.y0,l=Math.hypot(dx,dy);if(l>8){a=Math.atan2(dy,dx);f=cl(l/60,.25,1)}}
else if(!touchMode){const sx=W/2+(d.x-cam.x)*z,sy=H/2+(d.y-cam.y)*z,dx=mx-sx,dy=my-sy;
if(kbMode){let kx=0,ky=0;for(const k of keys){kx+=KD[k][0];ky+=KD[k][1]}if(kx||ky){a=Math.atan2(ky,kx);f=1}else f=0}else{a=Math.atan2(dy,dx);f=cl(Math.hypot(dx,dy)/(100*z),.2,1)}
aim={a:Math.atan2(dy,dx),d:Math.hypot(dx,dy)/z}}
lastIn={a,f};const fi=!touchMode&&aimHeld&&aim;sendM(Object.assign({t:'in',a:Math.round(a*1000)/1000,f:Math.round(f*100)/100},fi?{fi:1,ma:Math.round(aim.a*1000)/1000,md:Math.round(aim.d)}:{},view))},33);

// ——— Choix de bonus et d'évolution (sans pause : on choisit en naviguant) ———
function stat(c){const w=c.w;let s=tr('hp')+' ×'+I.num(c.hp)+' · '+tr('speed')+' ×'+I.num(c.spd);if(w.tg>1)s+=' · '+tr('targets',{n:w.tg});if(w.spl)s+=' · '+tr('explosion');if(w.bs)s+=' · '+tr('side');if(w.burn)s+=' · '+tr('burnS');if(c.reg)s+=' · '+tr('regen');if(c.ram)s+=' · '+tr('ramS',{n:I.num(c.ram)});if(c.brd)s+=' · '+tr('brdS');if(c.arm)s+=' · '+tr('armor',{n:Math.round(c.arm*100)});if(c.t<3)s+=' · '+tr('hides');return s+' · '+I.sk(c.sk).n}
function fitT(s,w){if(g.measureText(s).width<=w)return s;while(s.length>1&&g.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…'}
function pickOffer(i){if(!curOffer)return;sendM({t:'pick',o:curOffer.id,i});offerEl.hidden=true}
function renderOffer(of){const key=of?of.id:null;if(key===offerKey)return;offerKey=key;curOffer=of;if(!of){offerEl.hidden=true;return}
if(of.k==='evo'){offerEl.innerHTML='<h3>'+tr('evoTitle',{l:of.l})+'</h3><div class="opts">'+of.o.map((k,i)=>{const c=CL[k],x=I.cls(k);return '<button data-i="'+i+'" aria-keyshortcuts="'+(i+1)+'">'+(touchMode?'':'<kbd class="kc" aria-hidden="true">'+(i+1)+'</kbd>')+'<canvas width="240" height="152"></canvas>'+x.n+(c.leg?' <span class="leg">'+tr('legendary')+'</span>':'')+'<small class="ds">'+x.w+' · '+x.d+'</small><small class="k st">'+stat(c)+'</small></button>'}).join('')+'</div>';
offerEl.querySelectorAll('button').forEach(bt=>{const c=CL[of.o[+bt.dataset.i]],x=bt.querySelector('canvas').getContext('2d');x.scale(2,2);x.translate(60,38);x.rotate(-.35);const b=snap&&snap.b.find(o=>o.i===myId);ship(x,c,Math.min(19,42/c.L),b?b.col:cfg.hull,.35,0,{sail:cfg.sail,flag:cfg.flag,trim:cfg.trim,pat:cfg.pat})})}
else offerEl.innerHTML='<h3>'+tr('bonusTitle',{l:of.l})+'</h3><div class="opts">'+of.o.map((k,i)=>'<button data-i="'+i+'" aria-keyshortcuts="'+(i+1)+'">'+(touchMode?'':'<kbd class="kc" aria-hidden="true">'+(i+1)+'</kbd>')+''+I.bon(k).n+'<small>'+I.bon(k).d+'</small></button>').join('')+'</div>';
offerEl.querySelectorAll('button').forEach(bt=>bt.onclick=()=>pickOffer(+bt.dataset.i));offerEl.hidden=false}

