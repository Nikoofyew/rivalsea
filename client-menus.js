// RivalSea – Menu, écran de naufrage et guide des navires
'use strict';
// ——— Menu et écran de naufrage ———
function statusHTML(){if(fullMsg)return '<span class="status err">'+tr('full')+'</span>';
if(conn==='ok'&&world)return '<span class="status ok">'+tr('connected',{m:tr(mode==='team'?'modeTeam':'modeFfa')})+'</span>';
if(conn==='err')return '<span class="status err">'+tr('unreachable')+'</span>';
return '<span class="status wait">'+tr('connecting')+'</span>'}
function updStatus(){const s=document.getElementById('stat');if(s){s.innerHTML=statusHTML();if(lastBuild&&!ov.hidden)sameH(lastBuild)}const go=document.getElementById('go');if(go)go.disabled=!(conn==='ok'&&world)}
let avisDone=false;
function avisHTML(){if(avisDone)return '<p class="small">💬 '+tr('avisThanks')+'</p>';return '<div class="avis"><span>'+tr('avisQ')+'</span><button class="ghost sm" data-av="1">👍</button><button class="ghost sm" data-av="-1">👎</button><input id="avt" maxlength="300" placeholder="'+tr('avisPh')+'"><button class="ghost sm" id="avs">'+tr('avisSend')+'</button></div>'}
function wireAvis(){let v=0;ov.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{v=+b.dataset.av;ov.querySelectorAll('[data-av]').forEach(o=>o.classList.toggle('on',o===b))});const s=document.getElementById('avs');if(s)s.onclick=()=>{const t=(document.getElementById('avt').value||'').trim();if(!v&&!t)return;sendM({t:'avis',v,txt:t});avisDone=true;const a=ov.querySelector('.avis');if(a)a.outerHTML='<p class="small">💬 '+tr('avisThanks')+'</p>'}}
function roomLink(c){return location.origin+location.pathname+'?salle='+c}
function roomHTML(){const c=curRoom||invite;let s='<div class="rooms">';
if(roomErr)s+='<p class="status err">'+roomErr+'</p>';
if(c)s+='<p class="small">🔒 '+tr(curRoom?'inRoom':'invited',{c})+'</p><div class="rrow"><button class="ghost sm" id="cpy">🔗 '+tr('copyLink')+'</button><button class="ghost sm" id="pub">🌊 '+tr('publicSea')+'</button></div>';
else s+='<div class="rrow"><button class="ghost sm'+(wantMode==='team'?' on':'')+'" id="tm">⚔️ '+tr(wantMode==='team'?'teamsOn':'teams')+'</button><button class="ghost sm" id="cr">🔒 '+tr('createPriv')+'</button></div><div class="rrow"><input id="cd" maxlength="6" placeholder="'+tr('codePh')+'" autocomplete="off"><button class="ghost sm" id="jc">'+tr('joinCode')+'</button></div>';
return s+'</div>'}
function wireRooms(){const $=i=>document.getElementById(i);
if($('cpy'))$('cpy').onclick=()=>{const l=roomLink(curRoom||invite);(navigator.clipboard?navigator.clipboard.writeText(l):Promise.reject()).then(()=>{$('cpy').textContent='✅ '+tr('copied')}).catch(()=>prompt(tr('copyLink'),l))};
if($('pub'))$('pub').onclick=()=>{invite='';curRoom='';history.replaceState(null,'',location.pathname);sendM({t:'leave'});menu(lastMenuMsg)};
if($('tm'))$('tm').onclick=()=>{wantMode=wantMode==='team'?'ffa':'team';menu(lastMenuMsg)};
if($('cr'))$('cr').onclick=()=>join('new');
if($('jc'))$('jc').onclick=()=>{const v=($('cd').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(v)join(v)}}
function join(room){roomErr='';sendM({t:'join',room:room||curRoom||invite||wantMode,mode:wantMode,name:cfg.name||tr('namePh'),hull:cfg.hull,sail:cfg.sail,flag:cfg.flag,trim:cfg.trim,pat:cfg.pat,wake:cfg.wake})}
let pvI=1;function prev(){const c=document.getElementById('pv');if(!c)return;const k=Object.keys(CL)[pvI],sc=CL[k],t=document.getElementById('pvt');if(t)t.textContent=I.cls(k).n;const x=c.getContext('2d');x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,170,106);x.translate(85,55);x.rotate(-.3);ship(x,sc,Math.min(24,58/sc.L),mode==='team'?'#8a9bb0':cfg.hull,0,T,{sail:cfg.sail,flag:cfg.flag,trim:cfg.trim,pat:cfg.pat})}
let lastMenuMsg='';
const FLAGSVG={fr:'<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>',
en:'<svg viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>',
es:'<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/></svg>'};
let lastBuild=null,mmCv=null,mmKey='';
function sameH(build){lastBuild=build;const card=ov.firstElementChild;if(!card)return;card.classList.add('eq');card.style.minHeight='';const m=document.createElement('div');m.className='ovm';m.setAttribute('aria-hidden','true');ov.appendChild(m);let h=0;for(const [l] of I.LANGS){m.innerHTML=I.withLang(l,build);const c=m.firstElementChild;if(c)h=Math.max(h,c.offsetHeight)}m.remove();card.style.minHeight=h+'px'}
function langBtns(){return '<div class="langs" role="group" aria-label="'+tr('language')+'">'+I.LANGS.map(([c,ab,nm])=>'<button data-lang="'+c+'" class="'+(I.lang===c?'on':'')+'" title="'+nm+'" aria-label="'+nm+'"><span>'+ab+'</span>'+(FLAGSVG[c]||'')+'</button>').join('')+'</div>'}
function wireLang(re){ov.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{I.setLang(b.dataset.lang);offerKey=null;if(curOffer&&state==='play')renderOffer(curOffer);re()})}
function menu(msg){lastMenuMsg=msg||'';state='menu';offerEl.hidden=true;offerKey=null;ov.hidden=false;
const sw=(arr,key,nf)=>arr.map(([c],i)=>{const n=nf(i);return '<button class="dot'+(cfg[key]===c?' on':'')+'" data-k="'+key+'" data-v="'+c+'" style="background:'+c+'" aria-label="'+n+'" title="'+n+'"></button>'}).join('')+(PREM[key]?PREM[key].map(([c],i)=>owns(key,c)?'<button class="dot prem'+(cfg[key]===c?' on':'')+'" data-k="'+key+'" data-v="'+c+'" style="background:'+c+'" title="'+premName(key,i)+'"></button>':'').join(''):'');
const ownW=PREM.wake.filter(([v])=>owns('wake',v));
const profBtn='<button id="prf" class="ghost prfb">🏆 '+tr('profile')+' · ⭐ '+prof.stars+(prof.streak>1?' · 🔥 '+prof.streak:'')+(todayChal().some(([id])=>!prof.daily.done.includes(id))?' <span class="new">'+tr('daily')+'</span>':'')+'</button>';
const build=()=>'<div class="card wide">'+bookBtn()+langBtns()+'<h1 class="brand"><img src="/icon-180.png?v=2" alt="" width="52" height="52">RivalSea</h1>'+(msg?'<p><b>'+msg+'</b></p>':'')+
'<p>'+tr('intro')+'</p>'+
'<div class="cust"><div class="pvb"><canvas id="pv" width="340" height="212" aria-label="'+tr('preview')+'"></canvas><div class="pvn"><button id="pvl" aria-label="◀">◀</button><span id="pvt"></span><button id="pvr" aria-label="▶">▶</button></div><button id="rnd" class="rnd">'+tr('random')+'</button></div><div class="fields">'+
'<label class="nm">'+tr('name')+' <input id="nmi" maxlength="14" placeholder="'+tr('namePh')+'" value="'+(cfg.name||'').replace(/[&"<>]/g,'')+'"></label>'+
'<div class="row"><span>'+tr('hull')+'</span><div class="sw">'+sw(HULLS,'hull',I.hull)+'</div></div>'+
'<div class="row"><span>'+tr('sails')+'</span><div class="sw">'+sw(SAILS,'sail',I.sail)+'</div></div>'+
'<div class="row"><span>'+tr('trim')+'</span><div class="sw">'+sw(TRIMS,'trim',I.trim)+'</div></div>'+
'<div class="row"><span>'+tr('pattern')+'</span><div class="sw">'+PATS.map(([k],i)=>'<button class="fl pt'+(cfg.pat===k?' on':'')+'" data-k="pat" data-v="'+k+'">'+I.pat(i)+'</button>').join('')+PREM.pat.map(([k],i)=>owns('pat',k)?'<button class="fl pt prem'+(cfg.pat===k?' on':'')+'" data-k="pat" data-v="'+k+'">'+premName('pat',i)+'</button>':'').join('')+'</div></div>'+
'<div class="row"><span>'+tr('flag')+'</span><div class="sw">'+Object.keys(FLAGS).concat(PREM.flag.map(f=>f[0]).filter(k=>owns('flag',k))).map(k=>'<button class="fl'+(cfg.flag===k?' on':'')+'" data-k="flag" data-v="'+k+'" aria-label="'+k+'">'+(FLAGS_ALL[k]||'—')+'</button>').join('')+'</div></div>'+(ownW.length?'<div class="row"><span>'+tr('wake')+'</span><div class="sw"><button class="fl pt'+(cfg.wake==='none'?' on':'')+'" data-k="wake" data-v="none">—</button>'+ownW.map(([k])=>'<button class="fl pt prem'+(cfg.wake===k?' on':'')+'" data-k="wake" data-v="'+k+'">'+premName('wake',PREM.wake.findIndex(w=>w[0]===k))+'</button>').join('')+'</div></div>':'')+
'</div></div>'+profBtn+'<div id="stat">'+statusHTML()+'</div>'+
'<div id="top">'+topHTML()+'</div>'+
'<p class="small">'+tr('aiNote')+'</p>'+
'<p class="small">'+tr('controls')+'</p>'+
'<button id="go">'+(curRoom||invite?tr('joinPriv',{c:curRoom||invite}):tr('join'))+'</button>'+roomHTML()+'</div>';
ov.innerHTML=build();sameH(build);
wireLang(()=>menu(lastMenuMsg&&tr('lost')));document.getElementById('prf').onclick=profile;
ov.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{cfg[b.dataset.k]=b.dataset.v;saveCfg();ov.querySelectorAll('[data-k="'+b.dataset.k+'"]').forEach(o=>o.classList.toggle('on',o===b));prev()});
const PVK=Object.keys(CL),pvStep=d=>{pvI=(pvI+d+PVK.length)%PVK.length;prev()};document.getElementById('pvl').onclick=()=>pvStep(-1);document.getElementById('pvr').onclick=()=>pvStep(1);
document.getElementById('rnd').onclick=()=>{const pk=a=>a[Math.floor(Math.random()*a.length)];cfg.hull=pk(HULLS)[0];cfg.sail=pk(SAILS)[0];cfg.trim=pk(TRIMS)[0];cfg.pat=pk(PATS)[0];cfg.flag=pk(Object.keys(FLAGS));saveCfg();menu(lastMenuMsg)};
const ni=document.getElementById('nmi');ni.oninput=()=>{cfg.name=ni.value.trim().slice(0,14);saveCfg()};
document.getElementById('go').onclick=()=>join();wireRooms();document.getElementById('gd').onclick=guide;updStatus();prev()}
// ——— Guide : arbre des navires ———
const BOOKSVG='<svg viewBox="0 0 26 20" aria-hidden="true"><path d="M13 4C10 1.6 5.5 1.3 1.5 2.2V18c4-.9 8.5-.6 11.5 1.8C16 17.4 20.5 17.1 24.5 18V2.2C20.5 1.3 16 1.6 13 4z" fill="currentColor" opacity=".18"/><path d="M13 4C10 1.6 5.5 1.3 1.5 2.2V18c4-.9 8.5-.6 11.5 1.8C16 17.4 20.5 17.1 24.5 18V2.2C20.5 1.3 16 1.6 13 4zM13 4v15.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
function bookBtn(){return '<button class="book" id="gd" title="'+tr('guideTitle')+'" aria-label="'+tr('guideTitle')+'">'+BOOKSVG+'<span>'+tr('guide')+'</span></button>'}
function treeCols(){const cols=[];for(const k in CL)(cols[CL[k].t]=cols[CL[k].t]||[]).push(k);
for(let t=1;t<cols.length;t++){const prev=cols[t-1],bc=k=>{const ps=prev.map((p,i)=>CL[p].next.includes(k)?i:-1).filter(i=>i>=0);return ps.length?ps.reduce((a,b)=>a+b,0)/ps.length:99};cols[t].sort((a,b)=>bc(a)-bc(b))}return cols}
function tipHTML(k){const c=CL[k],x=I.cls(k),nx=c.next.map(n=>I.cls(n).n);
return '<b>'+x.n+'</b>'+(c.leg?' <span class="lg">'+tr('legendary')+'</span>':'')+(c.f?'<br><i>'+tr('fam.'+c.f)+'</i>':'')+'<br>'+x.d+'<br><br>'+tr('weapon')+tr('colon')+'<b style="font-size:13px">'+x.w+'</b><br>'+(x.w2?tr('second')+tr('colon')+'<b style="font-size:13px">'+x.w2+'</b><br>':'')+stat(c)+'<br>'+tr('skill')+tr('colon')+I.sk(c.sk).n+' — '+tr('skd.'+c.sk)+' ('+tr('cd',{s:SK[c.sk].cd})+')<br><br>'+(nx.length?tr('evolvesTo')+tr('colon')+nx.join(', '):tr('finalShip'))}
function guide(){lastBuild=null;state='menu';offerEl.hidden=true;ov.hidden=false;const cols=treeCols();
ov.innerHTML='<div class="card wide">'+langBtns()+'<h2>'+BOOKSVG.replace('<svg','<svg style="width:30px;height:23px;vertical-align:-4px;margin-right:8px"')+tr('guideTitle')+'</h2><p class="small">'+tr('guideHint')+'</p>'+'<div class="gleg"><span style="background:rgba(91,227,161,.25)">'+tr('fam.r')+'</span><span style="background:rgba(255,143,87,.25)">'+tr('fam.a')+'</span><span style="background:rgba(139,92,246,.22)">'+tr('fam.c')+'</span></div>'+
'<div class="gt"><svg class="gl" aria-hidden="true"></svg>'+cols.map((col,t)=>'<div class="gcol"><h4>'+(t?tr('tierLvl',{l:EVO[t-1]}):tr('start'))+'</h4><div>'+col.map(k=>'<button class="gn'+(CL[k].leg?' leg':'')+(CL[k].f?' f'+CL[k].f:'')+'" data-s="'+k+'"><canvas width="200" height="112"></canvas>'+I.cls(k).n+'</button>').join('')+'</div></div>').join('')+'</div>'+
'<h3 style="margin:6px 0">'+tr('upgradesTitle')+'</h3><div class="gb">'+BON.map((b,i)=>'<div><b>'+I.bon(i).n+'</b><br>'+I.bon(i).d+'</div>').join('')+'</div>'+
'<button id="gbk">'+tr('back')+'</button><div class="gtip" hidden></div></div>';
const card=ov.firstElementChild,gt=card.querySelector('.gt'),svg=card.querySelector('.gl'),tip=card.querySelector('.gtip'),nodes={};
card.querySelectorAll('.gn').forEach(b=>{const k=b.dataset.s,c=CL[k];nodes[k]=b;const x=b.querySelector('canvas').getContext('2d');x.scale(2,2);x.translate(50,29);x.rotate(-.35);ship(x,c,Math.min(13,34/c.L),cfg.hull,.35,0,{sail:cfg.sail,flag:cfg.flag,trim:cfg.trim,pat:cfg.pat})});
let paths=[];const draw=()=>{const W=gt.scrollWidth,H=gt.scrollHeight,g=gt.getBoundingClientRect();svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('viewBox','0 0 '+W+' '+H);
const pos=(el,side)=>{const r=el.getBoundingClientRect();return [r.left-g.left+gt.scrollLeft+(side?r.width:0),r.top-g.top+gt.scrollTop+r.height/2]};
let h='';paths=[];for(const k in CL)for(const n of CL[k].next){const [x1,y1]=pos(nodes[k],1),[x2,y2]=pos(nodes[n],0),m=(x1+x2)/2;h+='<path d="M'+x1+' '+y1+'C'+m+' '+y1+' '+m+' '+y2+' '+x2+' '+y2+'"/>';paths.push([k,n])}svg.innerHTML=h};
draw();
const show=b=>{const k=b.dataset.s;card.querySelectorAll('.gn').forEach(o=>o.classList.toggle('on',o===b));svg.querySelectorAll('path').forEach((p,i)=>p.classList.toggle('hi',paths[i][0]===k||paths[i][1]===k));
tip.innerHTML=tipHTML(k);tip.hidden=false;const cr=card.getBoundingClientRect(),r=b.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
let x=r.right-cr.left+8;if(x+tw>cr.width-6)x=r.left-cr.left-tw-8;if(x<6)x=Math.max(6,Math.min(cr.width-tw-6,r.left-cr.left+r.width/2-tw/2));
let y=r.top-cr.top+r.height/2-th/2;if(x===r.right-cr.left+8||x===r.left-cr.left-tw-8){}else y=r.bottom-cr.top+6;y=Math.max(6,Math.min(y,cr.height-th-6));tip.style.left=x+'px';tip.style.top=y+'px'};
const hide=()=>{tip.hidden=true;card.querySelectorAll('.gn.on').forEach(o=>o.classList.remove('on'));svg.querySelectorAll('.hi').forEach(p=>p.classList.remove('hi'))};
card.querySelectorAll('.gn').forEach(b=>{b.onmouseenter=()=>show(b);b.onfocus=()=>show(b);b.onmouseleave=hide;b.onblur=hide;b.onclick=e=>{e.stopPropagation();show(b)}});
card.addEventListener('click',hide);gt.addEventListener('scroll',hide);window.addEventListener('resize',function rs(){if(!document.body.contains(gt)){window.removeEventListener('resize',rs);return}draw()});
wireLang(guide);document.getElementById('gbk').onclick=()=>menu(lastMenuMsg)}
function showDead(d){ov.hidden=false;
const by=d.by?String(npcN(d.by)).replace(/[&<>]/g,''):d.byk?tr('theKraken'):'';
const build=()=>'<div class="card">'+langBtns()+'<h2>'+tr('sunkTitle')+'</h2><p>'+(by?tr('sunkBy',{n:by})+'<br>':'')+tr('sunkStats',{c:I.cls(d.c).n,l:d.lvl,s:d.sc})+'</p>'+(d.rec?'<p><b>🏆 '+tr('newBest')+'</b></p>':'')+'<div id="top">'+topHTML()+'</div>'+avisHTML()+(curRoom?'<p class="small">🔒 '+tr('inRoom',{c:curRoom})+'</p>':'')+'<div id="stat">'+statusHTML()+'</div><div class="btns"><button id="go">'+tr('again')+'</button><button class="ghost" id="mn">'+tr('edit')+'</button></div><button class="ghost sm shr" id="shr">📣 '+tr('share')+'</button></div>';
ov.innerHTML=build();sameH(build);
wireLang(()=>showDead(d));
// partager son score : partage du téléphone, sinon copie du texte
document.getElementById('shr').onclick=async()=>{const t=tr('shareTxt',{l:d.lvl,c:I.cls(d.c).n,s:d.sc}),u='https://rivalsea.onrender.com';try{if(navigator.share){await navigator.share({title:'RivalSea',text:t,url:u});return}}catch(e){return}try{await navigator.clipboard.writeText(t+' '+u);document.getElementById('shr').textContent='✅ '+tr('copied')}catch(e){}};
document.getElementById('go').onclick=()=>join();document.getElementById('mn').onclick=()=>menu();wireAvis();updStatus()}

