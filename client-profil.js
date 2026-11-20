// RivalSea – Profil du joueur : étoiles, défis, style, badges
'use strict';
// ——— Profil du joueur : étoiles, défis du jour, style débloqué, badges (gardés dans ce navigateur) ———
let prof={stars:0,earned:0,own:[],badges:[],days:[],fams:[],ships:[],daily:{d:'',done:[],p:{}}};
try{Object.assign(prof,JSON.parse(localStorage.getItem('rs-prof')||'{}'))}catch(e){}
const saveProf=()=>{try{localStorage.setItem('rs-prof',JSON.stringify(prof))}catch(e){}};
// la date n'est recalculée qu'une fois toutes les 30 s (ce calcul est lent)
let dkV='',dkT=-99;const dayKey=()=>{const n=performance.now();if(!dkV||n-dkT>30000){dkV=new Date().toLocaleDateString('fr-CA',{timeZone:'Europe/Paris'});dkT=n}return dkV};
// [identifiant, type de progression, objectif, étoiles]
const CHAL=[['lvl10','lvl',10,1],['lvl15','lvl',15,2],['lvl20','lvl',20,3],['sink2','sink',2,1],['sink4','sink',4,2],['loot40','loot',40,1],['loot100','loot',100,2],['time5','time',300,1],['time12','time',720,2],['skill10','skill',10,1],['famr','famr',1,1],['fama','fama',1,1],['famc','famc',1,1],['plank3','plank',3,1],['giant1','giant',1,2]];
let tcK='',tcV=null;function todayChal(){const k=dayKey();if(k===tcK)return tcV;let h=0;for(const ch of k)h=(h*31+ch.charCodeAt(0))>>>0;const pool=CHAL.slice(),out=[];while(out.length<3){h=(h*1103515245+12345)>>>0;out.push(pool.splice(h%pool.length,1)[0])}tcK=k;tcV=out;return out}
// série de jours joués d'affilée : +5 étoiles tous les 7 jours
function checkDay(){const k=dayKey();if(prof.daily.d!==k){const y=new Date(Date.parse(k)-864e5).toISOString().slice(0,10);prof.streak=prof.days.includes(y)&&prof.days[prof.days.length-1]===y?(prof.streak||1)+1:1;prof.daily={d:k,done:[],p:{}};if(!prof.days.includes(k))prof.days.push(k);prof.days=prof.days.slice(-30);
if(prof.streak>1&&prof.streak%7===0){award(5);setTimeout(()=>toast(tr('streakBonus',{n:prof.streak})),500)}saveProf()}}
let toasts=[];const toast=s=>{toasts.push({s,l:4});SND.play('lvl')};
function award(n){prof.stars+=n;prof.earned+=n}
function prog(kind,v,add){checkDay();const p=prof.daily.p,old=p[kind]||0;p[kind]=add?old+v:Math.max(old,v);if(p[kind]===old)return;
for(const [id,k,goal,st] of todayChal())if(k===kind&&!prof.daily.done.includes(id)&&p[kind]>=goal){prof.daily.done.push(id);award(st);toast(tr('chalDone',{n:chalName(id),s:st}))}
badges();saveProf()}
const chalName=id=>{const c=CHAL.find(x=>x[0]===id);return tr('ch.'+c[1],{n:c[1]==='time'?c[2]/60:c[2]})};
// badges : [identifiant, condition]
const BADGES=[['first',()=>run.sc>=1],['cap',()=>run.l>=10],['adm',()=>run.l>=20],['leg',()=>run.l>=25],['terror',()=>run.sc>=5],['surv',()=>run.t>=900],['fam3',()=>prof.fams.length>=3],['coll',()=>prof.ships.length>=Object.keys(CL).length],['lead',()=>run.lead],['krak',()=>run.krak],['loyal',()=>prof.days.length>=7],['star50',()=>prof.earned>=50]];
let run={l:1,sc:0,t:0,lead:0,krak:0,c:'barque',t0:0};
function badges(){for(const [id,f] of BADGES)if(!prof.badges.includes(id)&&f()){prof.badges.push(id);award(1);toast(tr('badgeNew',{n:tr('bd.'+id)}))}}
let rsT=-9;function runSnap(m){if(!m||state!=='play')return;if(T-rsT<1&&m.l===run.l&&m.sc===run.sc&&m.c===run.c)return;rsT=T;run.l=m.l;run.sc=m.sc;run.t=T-run.t0;
if(m.c!==run.c){run.c=m.c;if(!prof.ships.includes(m.c))prof.ships.push(m.c);const f=CL[m.c].f;if(f){if(!prof.fams.includes(f))prof.fams.push(f);prog('fam'+f,1)}}
prog('lvl',m.l);prog('sink',m.sc);prog('time',Math.floor(run.t))}
function runEv(id){if(id==='leader')run.lead=1;else if(id==='kraken')run.krak=1;else if(id==='plank')prog('plank',1,1);else if(id==='giant')prog('giant',1,1);badges();saveProf()}
const owns=(cat,v)=>prof.own.includes(cat+':'+v);
const premName=(cat,i)=>{const x=I.prem?I.prem(cat,i):null;return x||PREM[cat][i][1]};
function profile(){lastBuild=null;state='menu';offerEl.hidden=true;ov.hidden=false;checkDay();
const sec=(t,b)=>'<h3>'+t+'</h3>'+b;
const chal=todayChal().map(([id,k,goal,st])=>{const done=prof.daily.done.includes(id),v=Math.min(goal,prof.daily.p[k]||0);return '<div class="chal'+(done?' ok':'')+'"><span>'+(done?'✅ ':'')+chalName(id)+'</span><b>+'+st+'⭐</b><i style="width:'+Math.round(v/goal*100)+'%"></i></div>'}).join('');
const items=[];for(const cat of ['hull','sail','pat','flag','wake'])PREM[cat].forEach(([v,nm,cost],i)=>{const own=owns(cat,v),on=cfg[cat]===v;
const sw=cat==='hull'||cat==='sail'?'<span class="pdot" style="background:'+v+'"></span>':cat==='flag'?'<span class="pflag">'+FLAGS_ALL[v]+'</span>':'<span class="ptag">'+(cat==='pat'?'⛵':'〰')+'</span>';
items.push('<div class="item">'+sw+'<span>'+tr(cat==='pat'?'pattern':cat==='sail'?'sails':cat)+' · '+premName(cat,i)+'</span>'+(own?(on?'<button class="ghost sm on" disabled>'+tr('equipped')+'</button>':'<button class="ghost sm" data-eq="'+cat+'|'+v+'">'+tr('equip')+'</button>'):'<button class="sm" data-buy="'+cat+'|'+v+'|'+cost+'"'+(prof.stars<cost?' disabled':'')+'>'+cost+'⭐</button>')+'</div>')});
if(cfg.wake&&cfg.wake!=='none')items.push('<div class="item"><span class="ptag">〰</span><span>'+tr('wake')+' · '+tr('none')+'</span><button class="ghost sm" data-eq="wake|none">'+tr('equip')+'</button></div>');
const bd=BADGES.map(([id])=>'<div class="badge'+(prof.badges.includes(id)?' got':'')+'" title="'+tr('bdd.'+id)+'"><b>'+(prof.badges.includes(id)?'🏅':'🔒')+'</b><span>'+tr('bd.'+id)+'</span><small>'+tr('bdd.'+id)+'</small></div>').join('');
ov.innerHTML='<div class="card wide prof">'+langBtns()+'<h1>🏆 '+tr('profile')+'</h1><p class="stars">⭐ '+prof.stars+' '+tr('stars')+(prof.streak>1?' · 🔥 '+tr('streak',{n:prof.streak}):'')+'</p><p class="small">'+tr('streakInfo',{n:7-((prof.streak||1)%7)})+'</p>'+sec(tr('daily'),chal+'<p class="small">'+tr('newDay')+'</p>')+sec(tr('shop'),'<div class="items">'+items.join('')+'</div>')+sec(tr('badges'),'<div class="badges">'+bd+'</div>')+'<button id="bk">'+tr('back')+'</button></div>';
wireLang(profile);document.getElementById('bk').onclick=()=>menu(lastMenuMsg);
ov.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const [cat,v,cost]=b.dataset.buy.split('|');if(prof.stars<+cost)return;prof.stars-=+cost;prof.own.push(cat+':'+v);cfg[cat]=v;saveProf();saveCfg();SND.play('coin');profile()});
ov.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const [cat,v]=b.dataset.eq.split('|');cfg[cat]=v;saveCfg();profile()})}

