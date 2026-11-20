// RivalSea – Connexion au serveur et état reçu
'use strict';
// ——— État reçu du serveur ———
let ws=null,conn='wait',world=null,WSZ=6800,mode='ffa',myId=0,state='menu',snap=null,me=null,nSnap=0,fullMsg='';
const ents=new Map(); // positions affichées, lissées entre deux messages du serveur
let invite=(new URLSearchParams(location.search).get('salle')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6),curRoom='',wantMode='ffa',roomErr='',statsOpen=false,STB={x:-99,y:-99,r:0},dayTop=[],best=null,tuI=0,tuT=0,tuX,tuY,SNB={x:-99,y:-99,r:0},aim=null,aimHeld=false,kbMode=false,keys=new Set(),lbB=180,shotsL=[],parts=[],rings=[],txts=[],hits=[],hitBy=null,banner=null,cam={x:1700,y:1700},T=0,last=0,mx=0,my=0,joy=null,touchMode=!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches),SKB={x:0,y:0,r:0},offerKey=null,curOffer=null;
try{tuI=+(localStorage.getItem('rs-tuto')||0);best=JSON.parse(localStorage.getItem('rs-best')||'null')}catch(e){}

function connect(){
const url=window.RS_SERVER||(location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws'; // sur un site de jeux, le serveur reste celui de RivalSea
try{ws=new WebSocket(url)}catch(e){conn='err';updStatus();setTimeout(connect,3000);return}
conn='wait';updStatus();
ws.onopen=()=>{conn='ok';updStatus()};
ws.onclose=()=>{conn='err';world=null;if(state!=='menu'){state='menu';menu(tr('lost'))}else updStatus();setTimeout(connect,2000)};
ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}onMsg(m)}}
const sendM=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
function onMsg(m){
if(m.t==='w'){curRoom=m.room||'';lootM.clear();world={rocks:m.rocks.map(([x,y,r,i,ph])=>({x,y,r,k:i?'ile':'recif',ph})),fogs:m.fogs.map(([x,y,r,z,ph])=>({x,y,r,z,ph})),zones:(m.zn||[]).map(([x,y,r,k])=>({x,y,r,k}))};WSZ=m.ws;mode=m.mode;updStatus()}
else if(m.t==='joined'){portal.start();myId=m.id;curRoom=m.room||'';if(curRoom){invite='';history.replaceState(null,'',location.pathname+'?salle='+curRoom)}state='play';kbMode=false;keys.clear();aimHeld=false;ov.hidden=true;offerKey=null;fullMsg='';run={l:1,sc:0,t:0,lead:0,krak:0,c:'',t0:T}}
else if(m.t==='top'){dayTop=m.l||[];weekTop=m.w||[];const t=document.getElementById('top');if(t)t.innerHTML=topHTML()}
else if(m.t==='full'){fullMsg='full';updStatus()}
else if(m.t==='noroom'){roomErr=tr('noRoom');invite='';if(state==='menu')menu(lastMenuMsg)}
else if(m.t==='dead'){portal.stop();SND.play('sink');m.rec=!best||m.lvl>best.l||(m.lvl===best.l&&m.sc>best.s);if(m.rec){best={l:m.lvl,c:m.c,s:m.sc};try{localStorage.setItem('rs-best',JSON.stringify(best))}catch(e){}}state='dead';offerEl.hidden=true;offerKey=null;showDead(m)}
else if(m.t==='st')applySnap(m)}
let lastIn=null;const LAT=.09;
const lootM=new Map(); // butin connu : le serveur n'envoie que ce qui change
// horloge du serveur : on repère les paquets arrivés en retard pour les avancer d'autant (moins de saccades)
let ofs=null,lastSync=0;function clockSync(tm){if(tm===undefined)return 0;const raw=T-tm/1000;if(ofs===null||raw<ofs||raw-ofs>2)ofs=raw;else ofs=Math.min(raw,ofs+(T-lastSync)*.02);lastSync=T;return Math.min(.25,raw-ofs)}
// noms des navires du jeu (amiral, fantômes, escortes) : traduits dans la langue du joueur
const npcN=n=>typeof n==='string'&&n[0]==='§'?tr('npc.'+n.slice(1)):n;
function applySnap(m){const late=clockSync(m.tm);for(const b of m.b)b.n=npcN(b.n);for(const f of m.fx||[]){if(f.n)f.n=npcN(f.n);if(f.p){if(f.p.n)f.p.n=npcN(f.p.n);if(f.p.v)f.p.v=npcN(f.p.v)}}m.mb=m.mb||(snap&&snap.mb)||[];m.mi=m.mi||(snap&&snap.mi)||[];m.bd=m.bd||(snap&&snap.bd)||[];snap=m;nSnap++;const ids=new Set();
const put=(o,isLoot)=>{ids.add(o.i);let d=ents.get(o.i);if(!d||Math.hypot(d.x-o.x,d.y-o.y)>500){d={x:o.x,y:o.y,a:o.a,pa:o.a,m:o.m||o.a,ox:0,oy:0,born:nSnap>2?T:-9};ents.set(o.i,d)}
// lissage : on garde l'écart entre ce qui est affiché et la nouvelle position, puis on le fait fondre en douceur
if(d.tx!==undefined&&o.i!==myId){const ag=Math.min(T-d.st,.45);d.ox=d.x-o.x;d.oy=d.y-o.y;if(Math.hypot(d.ox,d.oy)>300){d.ox=d.oy=0}}
d.tx=o.x;d.ty=o.y;d.vx=o.vx||0;d.vy=o.vy||0;d.st=T-late;d.ta=o.a;d.tm=o.m||o.a};
for(const b of m.b)put(b);for(const l of m.l){put(l,1);lootM.set(l.i,l)}for(const id of m.lr||[])lootM.delete(id);for(const id of lootM.keys())ids.add(id);m.l=[...lootM.values()];
for(const id of [...ents.keys()])if(!ids.has(id))ents.delete(id);
{const old=new Map();for(const s of shotsL)old.set(s.vx+'|'+s.vy+'|'+s.col,s);
shotsL=m.s.map(s=>{const o={x:s[0]+s[2]*late,y:s[1]+s[3]*late,vx:s[2],vy:s[3],sz:s[4],col:s[5],spl:s[6],l:s[7]-late,L:s[8],k:s[9]||'ball'};
// même projectile qu'avant : on corrige sa position en douceur au lieu de le faire sauter
const p=old.get(o.vx+'|'+o.vy+'|'+o.col);if(p&&Math.hypot(p.x-o.x,p.y-o.y)<60){o.x=p.x+(o.x-p.x)*.35;o.y=p.y+(o.y-p.y)*.35}return o})}
for(const s of shotsL)if(s.L-s.l<.06+late)SND.play(s.k,vol(s.x,s.y)*(s.k==='bullet'?.6:1),s.k==='bullet'?70:45);
if(me&&m.me&&state==='play'){if(m.me.c!==me.c)SND.play('evo');else if(m.me.l>me.l)SND.play('lvl')}
for(const f of m.fx){if(f.k==='ring'&&f.col==='#ff9f43')SND.play('boom',vol(f.x,f.y),60);else if(f.k==='txt'){const sk={xp:'coin',sunk:'sink',ram:'ram',skill:'skill'}[f.id];if(sk)SND.play(sk,1,sk==='coin'?90:45)}else if(f.k==='hit')SND.play('hit',1,120);
if(f.k==='burst')burst(f.x,f.y,f.col,f.n,f.sp);else if(f.k==='ring')rings.push({x:f.x,y:f.y,r:f.r,m:f.m,l:f.l,L:f.l,col:f.col});else if(f.k==='txt')txts.push({x:f.x,y:f.y,s:fxText(f),col:f.col,l:f.l,L:f.l});else if(f.k==='banner')banner={s:evText(f),l:4.5};else if(f.k==='hit'){hits.push({a:f.a,l:.9});hitBy={n:f.n||(f.lk&&f.lk!=='kraken'?I.loot(f.lk):tr('theKraken')),l:2.5}}else if(f.k==='ev'&&state==='play')runEv(f.id);if(f.k==='txt'&&state==='play'){if(f.id==='xp')prog('loot',1,1);else if(f.id==='skill')prog('skill',1,1)}}
if(m.me&&state==='play')runSnap(m.me);
me=m.me;if(state==='play')renderOffer(me&&me.of)}
function fxText(f){const p=Object.assign({},f.p);if(f.id==='evo')p.c=I.cls(p.c).n;if(f.id==='skill')p.s=I.sk(p.s).n;return tr('fx.'+f.id,p)}
function evText(f){const p=Object.assign({},f.p);if('n' in p&&!p.n)p.n=tr('someone');return tr('ev.'+f.id,p)}
function burst(x,y,col,n,sp){if(parts.length>(lowQ?200:500))return;for(let i=0;i<n;i++){const a=Math.random()*TAU,v=40+Math.random()*((sp||200)-40);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.4+Math.random()*.5,col,r:2+Math.random()*3})}}

