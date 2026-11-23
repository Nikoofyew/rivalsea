// RivalSea – Mise en place : écran, zoom, variables communes
'use strict';
const {TAU,EVO,CREAM,NAVY,WOOD,HULLS,SAILS,TRIMS,PATS,PREM,FLAGS_ALL,FLAGS,TEAMS,SK,CL,LT,BON,cl,angD}=S;
const I=I18N,tr=(k,p)=>I.t(k,p);
// sites de jeux (CrazyGames…) : la page indique son site dans window.RS_PORTAL ; ailleurs, rien ne change
const portal={name:window.RS_PORTAL||'',start(){},stop(){},link:null};
if(portal.name==='crazygames'&&window.CrazyGames){const SDK=window.CrazyGames.SDK;let on=false,ready=SDK.init().catch(()=>{});
portal.start=()=>{if(!on){on=true;ready.then(()=>{try{SDK.game.gameplayStart()}catch(e){}})}};
portal.stop=()=>{if(on){on=false;ready.then(()=>{try{SDK.game.gameplayStop()}catch(e){}})}};
ready.then(()=>{try{SDK.game.loadingStop()}catch(e){}});// le jeu est prêt (CrazyGames mesure le temps de chargement)
portal.link=c=>{try{return SDK.game.inviteLink({salle:c})}catch(e){return ''}};
ready.then(()=>{try{const v=SDK.game.getInviteParam('salle');if(v&&!invite){invite=String(v).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(typeof menu==='function'&&state==='menu')menu(lastMenuMsg)}}catch(e){}})}
const cv=document.getElementById('c'),g=cv.getContext('2d'),ov=document.getElementById('ov'),offerEl=document.getElementById('offer');
let W,H,dpr,lowQ=false,ftE=16;
function rs(){dpr=lowQ?1:Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}
addEventListener('resize',rs);rs();
let weekTop=[];
let cfg={name:'',hull:'#ff6b57',sail:'#fff8e7',flag:'skull',trim:'#fff8e7',pat:'plain',wake:'none'};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('flottille-cfg')||'{}'))}catch(e){}
function topHTML(){const b=best?'<p class="small">🏆 '+tr('myBest',{l:best.l,c:I.cls(best.c).n,s:best.s})+'</p>':'';// meilleurs marins : nom, niveau, navires coulés (joueurs / IA) et monstres vaincus ; la liste reste visible même vide
const L=(t,a)=>'<div class="top"><b>'+t+'</b>'+(a.length?a.map((r,i)=>'<span>'+(i+1)+'. '+String(r.n).replace(/[&<>]/g,'')+(r.live?' ⛵':'')+' <small>('+tr('lvl',{l:r.l})+')</small> — '+(r.kp===undefined?'':tr('kills',{p:r.kp,a:r.ka})+(r.kk?' · 🐙 '+r.kk:'')+(r.ks?' · 🐍 '+r.ks:''))+'</span>').join(''):'<span class="small">'+tr('topEmpty')+'</span>')+'</div>';return b+'<div class="tops">'+L(tr('dayTop'),dayTop)+L(tr('weekTop'),weekTop)+'</div>'}
const saveCfg=()=>{try{localStorage.setItem('flottille-cfg',JSON.stringify(cfg))}catch(e){}};

