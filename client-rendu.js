// RivalSea – Image principale, interface de jeu et boucle d’animation
'use strict';
// ——— Image principale ———
function draw(){
g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle=NAVY;g.fillRect(0,0,W,H);
if(!world||!snap){g.fillStyle=CREAM;g.font='800 22px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.fillText(tr('connectingShort'),W/2,H*.2);return}
const z=state==='play'?zoom():.8,mine=snap.b.find(b=>b.i===myId),md=mine&&ents.get(myId);
g.save();g.translate(W/2,H/2);g.scale(z,z);g.translate(-cam.x,-cam.y);
g.fillStyle='#1fb5c9';g.fillRect(0,0,WSZ,WSZ);
g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=3;g.lineCap='round';
const N=Math.ceil(WSZ/120),x0=Math.max(0,Math.floor((cam.x-W/2/z)/120)),x1=Math.min(N,Math.ceil((cam.x+W/2/z)/120)),y0=Math.max(0,Math.floor((cam.y-H/2/z)/120)),y1=Math.min(N,Math.ceil((cam.y+H/2/z)/120));
for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++){const x=i*120+(j%2)*60+Math.sin(T+j)*6,y=j*120;g.beginPath();g.arc(x,y,16,Math.PI*1.15,Math.PI*1.85);g.stroke()}
g.strokeStyle='#ff6b57';g.lineWidth=14;g.setLineDash([30,18]);g.strokeRect(0,0,WSZ,WSZ);g.setLineDash([]);
const vx0=cam.x-W/2/z-200,vx1=cam.x+W/2/z+200,vy0=cam.y-H/2/z-200,vy1=cam.y+H/2/z+200,vis=o=>o.x>vx0&&o.x<vx1&&o.y>vy0&&o.y<vy1;
// tourbillon
if(snap.wh){const [wx,wy,wr]=snap.wh;if(wx+wr>vx0&&wx-wr<vx1&&wy+wr>vy0&&wy-wr<vy1){const gr=g.createRadialGradient(wx,wy,0,wx,wy,wr);gr.addColorStop(0,'rgba(5,30,60,.75)');gr.addColorStop(.4,'rgba(10,60,100,.4)');gr.addColorStop(1,'rgba(20,100,140,0)');g.fillStyle=gr;g.beginPath();g.arc(wx,wy,wr,0,TAU);g.fill();
g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.lineCap='round';for(let k=0;k<5;k++){g.beginPath();for(let i=0;i<=40;i++){const q=i/40,a=k/5*TAU+q*5-T*2.2,rr=wr*(1-q)*.95+8;i?g.lineTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr):g.moveTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr)}g.stroke()}}}
// corps du serpent de mer : il suit le chemin de la tête
for(const l of snap.l){if(l.k!=='serpent')continue;const d=ents.get(l.i);if(!d)continue;d.tr=d.tr||[];const lp=d.tr[0];if(!lp||Math.hypot(lp[0]-d.x,lp[1]-d.y)>14){d.tr.unshift([d.x,d.y]);d.tr.length=Math.min(d.tr.length,18)}
for(let i=d.tr.length-1;i>=1;i--){const [px,py]=d.tr[i],q=1-i/18,rr=8+30*q;g.fillStyle=l.fl>0?'#fff':i%2?'#2f9e6a':'#3fbf7f';g.strokeStyle='#1d6b47';g.lineWidth=3;g.beginPath();g.arc(px,py,rr,0,TAU);g.fill();g.stroke();if(i%3===0){g.fillStyle='#ffcf3f';g.beginPath();g.arc(px,py,rr*.25,0,TAU);g.fill()}}}
for(const k of world.rocks)if(vis(k))drawRock(k);for(const k of world.rocks)if(vis(k))drawRockTop(k);
if(state==='play'&&me&&md){const w=CL[me.c].w,rr=me.rng;g.fillStyle='rgba(255,255,255,.1)';
// portée de tir : trait sombre en dessous + pointillés blancs par-dessus, visible sur l'eau claire comme sombre
const edge=()=>{g.setLineDash([]);g.strokeStyle='rgba(11,61,107,.4)';g.lineWidth=5;g.stroke();g.setLineDash([12,10]);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2.5;g.stroke();g.setLineDash([])};
if(w.bs){for(const s of [1,-1]){g.beginPath();g.moveTo(md.x,md.y);g.arc(md.x,md.y,rr,md.a+s*Math.PI/2-.93,md.a+s*Math.PI/2+.93);g.closePath();g.fill();edge()}}
else{g.beginPath();g.arc(md.x,md.y,rr,0,TAU);edge()}}
for(const l of snap.l){const d=ents.get(l.i);if(d&&vis(d))drawLoot(l,d)}
for(const s of shotsL){if(!s.spl)drawShot(s)}
for(const p of parts){g.globalAlpha=Math.min(1,p.l*2);g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.r,0,TAU);g.fill()}g.globalAlpha=1;
for(const r of rings){g.globalAlpha=Math.max(0,r.l/r.L);g.strokeStyle=r.col;g.lineWidth=5;g.beginPath();g.arc(r.x,r.y,r.r,0,TAU);g.stroke()}g.globalAlpha=1;
// brouillard : opaque vu de l'extérieur, presque transparent quand on est dedans
const myZ=state==='play'&&me?me.fz:-2,fogs=world.fogs.concat(snap.fg.map(([x,y,r,zz,life,L,ph])=>({x,y,r,z:zz,life,L,ph})));
for(const f of fogs){if(f.x+f.r*1.2<vx0||f.x-f.r*1.2>vx1||f.y+f.r*1.2<vy0||f.y-f.r*1.2>vy1)continue;
const k=(f.life!==undefined?cl(Math.min(f.life,(f.L-f.life)*3),0,1):1)*(f.z===myZ?.2:1),fx=f.x+Math.sin(T*.4+f.ph)*14,fy=f.y+Math.cos(T*.33+f.ph)*14,gr=g.createRadialGradient(fx,fy,f.r*.2,fx,fy,f.r*1.15);
gr.addColorStop(0,'rgba(236,244,247,'+(.97*k)+')');gr.addColorStop(.7,'rgba(232,242,246,'+(.93*k)+')');gr.addColorStop(1,'rgba(232,242,246,0)');g.fillStyle=gr;g.beginPath();g.arc(fx,fy,f.r*1.15,0,TAU);g.fill()}
// navires (le serveur n'envoie que ceux que vous avez le droit de voir)
for(const b of snap.b){const d=ents.get(b.i);if(!d||!vis(d))continue;const c=b.gh?ghostC(b.c):CL[b.c],r=S.R(b.l,b.c)*(b.mc?1.3:1),own=b.i===myId;
if(b.bs){g.fillStyle='rgba(255,207,63,'+(.18+.1*Math.sin(T*3))+')';g.beginPath();g.arc(d.x,d.y,r*c.L*1.25,0,TAU);g.fill()}
if(b.iv&&Math.floor(T*8)%2)g.globalAlpha=.5;if(b.dv)g.globalAlpha=own?.35:.25;
if(b.bu&&parts.length<(lowQ?200:500)&&Math.random()<(lowQ?.3:.7))parts.push({x:d.x+(Math.random()-.5)*r*c.L,y:d.y+(Math.random()-.5)*r*c.Wd*1.5,vx:(Math.random()-.5)*20,vy:-30-Math.random()*30,l:.6,col:Math.random()<.5?'rgba(255,107,40,.85)':'rgba(255,207,63,.85)',r:2+Math.random()*r*.15});
if(b.dv&&parts.length<(lowQ?200:500)&&Math.random()<.3)parts.push({x:d.x+(Math.random()-.5)*r*c.L,y:d.y+(Math.random()-.5)*r*.6,vx:0,vy:0,l:.7,col:'rgba(255,255,255,.7)',r:1.5+Math.random()*2.5});if(own&&me&&me.fz>=0&&S.canHide(b.c))g.globalAlpha=.6;
const wkc=k=>b.wk==='gold'?'rgba(255,207,63,.75)':b.wk==='fire'?(k&1?'rgba(255,107,40,.8)':'rgba(255,207,63,.75)'):b.wk==='rainbow'?'hsla('+((T*140+k*60)%360)+',95%,62%,.8)':'rgba(255,255,255,.35)';
if(b.wk&&parts.length<(lowQ?200:500)&&Math.hypot(b.vx,b.vy)>25&&Math.random()<(lowQ?.25:.6)){const sx=d.x-Math.cos(d.a)*r*c.L,sy=d.y-Math.sin(d.a)*r*c.L;parts.push({x:sx+(Math.random()-.5)*r*.5,y:sy+(Math.random()-.5)*r*.5,vx:-Math.cos(d.a)*20,vy:-Math.sin(d.a)*20,l:.9,col:wkc(Math.floor(Math.random()*6)),r:2+Math.random()*r*.18})}
for(let k=1;k<4;k++){g.fillStyle=wkc(k);g.beginPath();g.arc(d.x-Math.cos(d.a)*r*c.L*(.8+k*.6),d.y-Math.sin(d.a)*r*c.L*(.8+k*.6),r*.35/k,0,TAU);g.fill()}
if(b.bo&&Math.random()<.5)parts.push({x:d.x-Math.cos(d.a)*r*c.L,y:d.y-Math.sin(d.a)*r*c.L,vx:0,vy:0,l:.5,col:'rgba(255,255,255,.8)',r:3+Math.random()*3});
g.save();g.translate(d.x,d.y);g.rotate(d.a);ship(g,c,r,b.fl?'#fff':b.col,c.w.bs?0:d.m-d.a,T,{sail:b.sl,flag:b.fg,trim:b.tc,pat:b.pt});g.restore();g.globalAlpha=1;
g.textAlign='center';g.font='800 '+Math.max(13,Math.min(24,r*.6))+'px "Baloo 2",system-ui,sans-serif';const ty=d.y-r*Math.max(c.L,1.3)-14;
g.fillStyle=b.np?'#9ec9ff':own?'#ffcf3f':mode==='team'&&me&&b.tm===me.tm?'#ffe9a8':b.ia?'#d6e4ee':CREAM;const lbl=(b.np?tr('escort'):b.n)+' '+b.l;g.fillText(lbl,d.x,ty-8);
if(b.i===snap.ld){const cw=Math.max(16,r*.5),cx=d.x,cy=ty-8-Math.max(13,Math.min(24,r*.6))-cw*.45;g.fillStyle='#ffcf3f';g.strokeStyle='#a8741a';g.lineWidth=2;g.beginPath();g.moveTo(cx-cw/2,cy+cw*.35);g.lineTo(cx-cw/2,cy-cw*.15);g.lineTo(cx-cw/4,cy+cw*.08);g.lineTo(cx,cy-cw*.3);g.lineTo(cx+cw/4,cy+cw*.08);g.lineTo(cx+cw/2,cy-cw*.15);g.lineTo(cx+cw/2,cy+cw*.35);g.closePath();g.fill();g.stroke()}
if(b.ia){const fs2=Math.max(13,Math.min(24,r*.6)),tw2=g.measureText(lbl).width,px=d.x+tw2/2+6,ph=fs2*.8;g.fillStyle='rgba(11,61,107,.75)';g.beginPath();g.roundRect(px,ty-8-ph*.85,ph*1.7,ph,ph/2);g.fill();g.fillStyle='#9ec9ff';g.font='800 '+Math.round(fs2*.6)+'px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.fillText(tr('ai'),px+ph*.85,ty-8-ph*.12);g.textAlign='center'}
const hw=Math.max(24,r*1.2);g.fillStyle='rgba(11,61,107,.6)';g.fillRect(d.x-hw,ty,hw*2,6);g.fillStyle='#5be3a1';g.fillRect(d.x-hw,ty,hw*2*Math.max(0,b.h/b.H),6)}
// zone d'impact des obus de mortier : un cercle rouge montre où ils vont tomber
for(const s of shotsL){if(!s.spl||s.l<=0)continue;const lx=s.x+s.vx*s.l,ly=s.y+s.vy*s.l,rr=s.spl>1?s.spl:70,u=cl(1-s.l/s.L,0,1);if(s.k==='tentacle'){g.fillStyle='rgba(155,107,214,'+(.12+.15*u).toFixed(3)+')';g.beginPath();g.arc(lx,ly,rr,0,TAU);g.fill();g.setLineDash([10,8]);g.strokeStyle='rgba(122,79,179,'+(.5+.4*u).toFixed(3)+')';g.lineWidth=3;g.stroke();g.setLineDash([]);continue}
if(s.k==='rocket'){g.fillStyle='rgba(255,59,48,'+(.05+.08*u).toFixed(3)+')';g.beginPath();g.arc(lx,ly,rr,0,TAU);g.fill();g.strokeStyle='rgba(255,59,48,'+(.25+.35*u).toFixed(3)+')';g.lineWidth=1.5;g.stroke();continue}g.fillStyle='rgba(255,59,48,'+(.08+.17*u).toFixed(3)+')';g.beginPath();g.arc(lx,ly,rr,0,TAU);g.fill();g.strokeStyle='rgba(255,59,48,'+(.45+.45*u).toFixed(3)+')';g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();g.arc(lx,ly,rr,0,TAU);g.stroke();g.setLineDash([]);g.beginPath();g.arc(lx,ly,rr*(1-u),0,TAU);g.stroke()}
for(const s of shotsL){if(!s.spl)continue;const p=1-s.l/s.L;if(s.k==='tentacle'){const h=Math.sin(Math.PI*cl(p,0,1))*60,a=Math.atan2(s.vy,s.vx),bx=s.x-s.vx*(s.L-s.l),by=s.y-s.vy*(s.L-s.l);g.strokeStyle='#7a4fb3';g.lineCap='round';g.lineWidth=14;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo((bx+s.x)/2+Math.cos(a+Math.PI/2)*40,(by+s.y)/2-h*1.5,s.x,s.y-h);g.stroke();g.strokeStyle='#c9a6ff';g.lineWidth=4;g.stroke();g.fillStyle='#5b3a8c';g.beginPath();g.arc(s.x,s.y-h,10,0,TAU);g.fill();continue}if(s.k==='rocket'){const h=Math.sin(Math.PI*cl(p,0,1))*18,a=Math.atan2(s.vy,s.vx);g.fillStyle='rgba(11,61,107,.2)';g.beginPath();g.arc(s.x,s.y,s.sz*.7,0,TAU);g.fill();g.save();g.translate(s.x,s.y-h);g.rotate(a);g.fillStyle='rgba(200,200,200,.5)';for(let i=1;i<5;i++){g.beginPath();g.arc(-s.sz*2-i*6,0,s.sz*(.4+i*.18),0,TAU);g.fill()}g.fillStyle='#ffcf3f';g.beginPath();g.moveTo(-s.sz*1.6,0);g.lineTo(-s.sz*2.8-Math.random()*s.sz,-s.sz*.4);g.lineTo(-s.sz*2.8-Math.random()*s.sz,s.sz*.4);g.fill();g.fillStyle='#e8edf2';g.strokeStyle=s.col;g.lineWidth=1.5;g.beginPath();g.roundRect(-s.sz*1.7,-s.sz*.4,s.sz*2.6,s.sz*.8,s.sz*.3);g.fill();g.stroke();g.fillStyle=s.col;g.beginPath();g.moveTo(s.sz*1.4,0);g.lineTo(s.sz*.8,-s.sz*.4);g.lineTo(s.sz*.8,s.sz*.4);g.fill();g.restore();continue}const h=Math.sin(Math.PI*cl(p,0,1))*40;g.fillStyle='rgba(11,61,107,.25)';g.beginPath();g.arc(s.x,s.y,s.sz*.8,0,TAU);g.fill();g.fillStyle='#2b2b2b';g.strokeStyle=s.col;g.lineWidth=3;g.beginPath();g.arc(s.x,s.y-h,s.sz,0,TAU);g.fill();g.stroke()}
const st=snap.st;if(st&&st.x+st.r>vx0&&st.x-st.r<vx1&&st.y+st.r>vy0&&st.y-st.r<vy1){const gr=g.createRadialGradient(st.x,st.y,st.r*.2,st.x,st.y,st.r);gr.addColorStop(0,'rgba(20,30,60,.5)');gr.addColorStop(1,'rgba(20,30,60,0)');g.fillStyle=gr;g.beginPath();g.arc(st.x,st.y,st.r,0,TAU);g.fill();
g.strokeStyle='rgba(220,235,255,.55)';g.lineWidth=2;for(let i=0;i<90;i++){const a=Math.random()*TAU,q=Math.sqrt(Math.random())*st.r,x=st.x+Math.cos(a)*q,y=st.y+Math.sin(a)*q;g.beginPath();g.moveTo(x,y);g.lineTo(x-8,y+22);g.stroke()}}
g.textAlign='center';for(const tx of txts){g.globalAlpha=Math.min(1,tx.l/tx.L*2);g.font='800 20px "Baloo 2",system-ui,sans-serif';g.lineWidth=4;g.strokeStyle='rgba(11,61,107,.7)';const y=tx.y-(1-tx.l/tx.L)*40;g.strokeText(tx.s,tx.x,y);g.fillStyle=tx.col;g.fillText(tx.s,tx.x,y)}g.globalAlpha=1;
g.restore();
if(state==='menu'){prev();return}
g.setTransform(dpr,0,0,dpr,0,0);
if(st&&st.fl&&md&&Math.hypot(md.x-st.x,md.y-st.y)<st.r){g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,0,W,H)}
if(snap.wh)edgeArrow(snap.wh[0],snap.wh[1],'#9ee7ff',tr('whirlName'));for(const [x,y,bs] of snap.bz||[])edgeArrow(x,y,bs?'#ffcf3f':'#9ff7d8',bs?'⚓ '+tr('admiralName'):'👻 '+tr('ghostsName'));
for(const [x,y,k] of snap.mb){if(k==='kraken')edgeArrow(x,y,'#c9a6ff',I.loot('kraken'));else if(k==='serpent')edgeArrow(x,y,'#5be3a1',I.loot('serpent'));else if(k==='tresor')edgeArrow(x,y,'#ffcf3f',I.loot('tresor'));}
for(const [x,y,,own,lead] of snap.mi)if(lead&&!own&&state==='play')edgeArrow(x,y,'#ffcf3f','♛ '+tr('leader'));
if(snap.cv)edgeArrow(snap.cv[0],snap.cv[1],'#e8b04a',tr('convoy'));if(st)edgeArrow(st.x,st.y,'#c8d6ff',tr('storm'));flushArrows();
// classement
const lx=W-186,ly=14;let rows;
if(mode==='team')rows=snap.bd.map(r=>({n:I.team(r.t)+(me&&r.t===me.tm?' '+tr('you'):''),v:tr('lvl',{l:r.v}),c:TEAMS[r.t].col}));
else rows=snap.bd.map((r,i)=>({n:(r.i===snap.ld?'♛ ':(i+1)+'. ')+r.n.slice(0,r.p?14:10)+(r.p?'':' · '+tr('ai')),v:tr('lvl',{l:r.v}),c:r.i===myId?'#ffcf3f':r.p?CREAM:'#9ec9ff'}));
lbB=ly+28+rows.length*22;g.fillStyle='rgba(11,61,107,.55)';g.beginPath();g.roundRect(lx,ly,174,28+rows.length*22,12);g.fill();
g.textAlign='left';g.font='800 15px "Baloo 2",system-ui,sans-serif';g.fillStyle='#ffcf3f';g.fillText(tr(mode==='team'?'crew':'board'),lx+12,ly+20);
g.font='600 14px "Baloo 2",system-ui,sans-serif';rows.forEach((r,i)=>{g.fillStyle=r.c;g.textAlign='left';g.fillText(r.n.slice(0,18),lx+12,ly+42+i*22);g.textAlign='right';g.fillText(r.v,lx+162,ly+42+i*22)});
// mini-carte
const mm=Math.round(Math.min(220,Math.max(120,Math.min(W,H)*.3))),m0=12,sc=mm/WSZ;g.fillStyle='rgba(11,61,107,.6)';g.beginPath();g.roundRect(m0,m0,mm,mm,10);g.fill();
{const key=mm+'|'+dpr+'|'+WSZ+'|'+world.rocks.length+'|'+world.fogs.length;if(mmKey!==key){mmKey=key;mmCv=document.createElement('canvas');mmCv.width=mmCv.height=Math.ceil(mm*dpr);const c=mmCv.getContext('2d');c.scale(dpr,dpr);c.fillStyle='rgba(235,245,248,.35)';for(const f of world.fogs){c.beginPath();c.arc(f.x*sc,f.y*sc,f.r*sc*.9,0,TAU);c.fill()}c.fillStyle='#f4d58d';for(const k of world.rocks)if(k.k==='ile'){c.beginPath();c.arc(k.x*sc,k.y*sc,Math.max(2,k.r*sc),0,TAU);c.fill()}}g.drawImage(mmCv,m0,m0,mm,mm)}
g.fillStyle='rgba(235,245,248,.35)';for(const f of snap.fg){g.beginPath();g.arc(m0+f[0]*sc,m0+f[1]*sc,f[2]*sc*.9,0,TAU);g.fill()}
if(st){g.strokeStyle='#c8d6ff';g.lineWidth=1.5;g.beginPath();g.arc(m0+st.x*sc,m0+st.y*sc,st.r*sc,0,TAU);g.stroke()}
for(const [x,y,k,cvy] of snap.mb){g.fillStyle=k==='planche'?'#5be3a1':k==='kraken'?'#c9a6ff':k==='marchand'?(cvy?'#e8b04a':'#c98a4b'):'#ffcf3f';const s=k==='tresor'||k==='kraken'?5:3;g.fillRect(m0+x*sc-s/2,m0+y*sc-s/2,s,s)}
for(const [x,y,col,own,lead] of snap.mi){g.fillStyle=own?'#fff':col;g.beginPath();g.arc(m0+x*sc,m0+y*sc,own?3.5:2.2,0,TAU);g.fill();if(lead){g.strokeStyle='#ffcf3f';g.lineWidth=2;g.beginPath();g.arc(m0+x*sc,m0+y*sc,5.5,0,TAU);g.stroke()}}
if(!me)return;
// barre du bas
const c=CL[me.c],bw=Math.min(340,W-160),bx=Math.max(12,Math.min((W-bw)/2,W-bw-130)),by=H-64,ne=EVO[c.t];
g.fillStyle='rgba(11,61,107,.55)';g.beginPath();g.roundRect(bx-10,by-52,bw+20,106,14);g.fill();
g.font='600 13px "Baloo 2",system-ui,sans-serif';g.fillStyle='rgba(255,248,231,.8)';g.textAlign='left';const cx2=I.cls(me.c);g.fillText(cx2.w+(c.w.bs?' '+tr('flanks'):''),bx,by-34);g.textAlign='right';
g.fillText(c.next.length&&ne?tr('evoAt',{l:ne}):tr('evoMax'),bx+bw,by-34);
g.fillStyle=CREAM;g.font='800 16px "Baloo 2",system-ui,sans-serif';g.textAlign='left';{const sk2=tr('sunkCount',{n:me.sc}),sw=g.measureText(sk2).width;g.fillText(fitT(tr('lvlLong',{l:me.l})+' · '+cx2.n,bw-sw-12),bx,by-12);g.textAlign='right';g.fillText(sk2,bx+bw,by-12)}
const hpr=Math.max(0,me.h/me.H);g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.roundRect(bx,by,bw,18,6);g.fill();g.fillStyle=hpr<.3?'#ff6b57':'#5be3a1';g.beginPath();g.roundRect(bx,by,Math.max(6,bw*hpr),18,6);g.fill();
g.font='800 13px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(11,61,107,.8)';const hs=Math.max(0,me.h)+' / '+me.H+' '+tr('hp');g.strokeText(hs,bx+bw/2,by+14);g.fillStyle=CREAM;g.fillText(hs,bx+bw/2,by+14);
g.fillStyle='rgba(255,255,255,.25)';g.fillRect(bx,by+24,bw,8);g.fillStyle='#ffcf3f';g.fillRect(bx,by+24,bw*Math.min(1,me.xp/me.nd),8);
g.font='600 12px "Baloo 2",system-ui,sans-serif';g.textAlign='left';g.fillStyle='rgba(255,248,231,.8)';g.fillText(me.xp+' / '+me.nd+' XP',bx,by+46);
for(let i=0;i<4;i++){const px=bx+bw-8-(3-i)*16,py=by+42;g.beginPath();g.arc(px,py,5,0,TAU);g.fillStyle=c.t>i?'#ffcf3f':'rgba(255,255,255,.25)';g.fill()}
for(const h of hits){g.globalAlpha=Math.min(1,h.l*1.6);const rr=Math.min(W,H)*.4;g.strokeStyle='#ff3b30';g.lineWidth=12;g.lineCap='round';g.beginPath();g.arc(W/2,H/2,rr,h.a-.28,h.a+.28);g.stroke();g.lineCap='butt'}g.globalAlpha=1;
if(hitBy){g.globalAlpha=Math.min(1,hitBy.l);g.font='800 15px "Baloo 2",system-ui,sans-serif';const ms=tr('hitBy',{n:hitBy.n}),tw=g.measureText(ms).width;g.fillStyle='rgba(184,48,40,.9)';g.beginPath();g.roundRect(bx+bw/2-tw/2-14,by-124,tw+28,28,14);g.fill();g.fillStyle=CREAM;g.textAlign='center';g.fillText(ms,bx+bw/2,by-105);g.globalAlpha=1}
{const mb=snap.b.find(b=>b.i===myId);if(mb&&mb.iv){g.font='800 15px "Baloo 2",system-ui,sans-serif';const ms=tr('protected'),tw=g.measureText(ms).width;g.fillStyle='rgba(91,227,161,.9)';g.beginPath();g.roundRect(W/2-tw/2-14,Math.max(m0+mm+90,120),tw+28,28,14);g.fill();g.fillStyle=NAVY;g.textAlign='center';g.fillText(ms,W/2,Math.max(m0+mm+90,120)+19)}}

if(me.fz>=0){const hid=S.canHide(me.c),ms=hid?tr('hidden'):tr('tooBig');g.font='800 15px "Baloo 2",system-ui,sans-serif';const tw=g.measureText(ms).width;g.fillStyle=hid?'rgba(11,61,107,.75)':'rgba(184,64,48,.85)';g.beginPath();g.roundRect(bx+bw/2-tw/2-14,by-90,tw+28,28,14);g.fill();g.fillStyle=CREAM;g.textAlign='center';g.fillText(ms,bx+bw/2,by-71)}
// panneau de droite : statistiques réelles de mes armes, avec mes améliorations
const bigS=W>=820&&H>=560;
if(me.st&&(bigS||statsOpen)){const [sd,sr,sg,sm,ss,sreg,sram,sbrd,smr]=me.st,pw=196,px=W-12-pw;let py=lbB+12;const lines=[];
const wl=(w,nm)=>{const dm=w.dmg*sd*S.DMG,n=w.n+sm,rt=1/(w.rate*sr);lines.push(['h',nm]);lines.push([tr('stDmg'),I.num(Math.round(dm*10)/10)+(n>1?' × '+n:'')]);lines.push([tr('stRate'),I.num(Math.round(rt*10)/10)+' /s']);lines.push([tr('stRng'),Math.round(w.rng*sg)+'']);if(w.tg>1)lines.push([tr('stTg'),w.tg+'']);if(w.spl)lines.push([tr('stSpl'),w.spl+'']);lines.push([tr('stDps'),I.num(Math.round(dm*n*rt))+(w.tg>1?' × '+w.tg:'')])};
wl(c.w,cx2.w);if(c.w2)wl(c.w2,I.cls(me.c).w2||tr('second'));
lines.push(['h',tr('stShip')]);lines.push([tr('stHp'),me.H+'']);lines.push([tr('speed'),'×'+I.num(Math.round(c.spd*ss*100)/100)]);
if(sreg)lines.push([tr('stReg'),sreg+' % /s']);const ram=(c.ram||1)*sram;if(ram>1.01)lines.push([tr('stRam'),'×'+I.num(Math.round(ram*10)/10)]);const brd=(c.brd||0)+sbrd;if(brd>0)lines.push([tr('stBrd'),I.num(Math.round(brd*S.DMG*10)/10)+' /s']);if(c.arm)lines.push([tr('stArm'),Math.round(c.arm*100)+' %']);if(smr<.99)lines.push([tr('stMres'),'−'+Math.round((1-smr)*100)+' %']);
const ph=lines.reduce((a,l)=>a+(l[0]==='h'?22:17),10);if(py+ph<H-140){g.fillStyle='rgba(11,61,107,.5)';g.beginPath();g.roundRect(px,py,pw,ph,12);g.fill();py+=6;
for(const [k,v] of lines){if(k==='h'){g.font='800 13px "Baloo 2",system-ui,sans-serif';g.fillStyle='#ffcf3f';g.textAlign='left';g.fillText(fitT(v,pw-20),px+10,py+15);py+=22}else{g.font='600 12px "Baloo 2",system-ui,sans-serif';g.fillStyle='rgba(255,248,231,.75)';g.textAlign='left';g.fillText(k,px+10,py+12);g.fillStyle=CREAM;g.textAlign='right';g.font='800 12px "Baloo 2",system-ui,sans-serif';g.fillText(v,px+pw-10,py+12);py+=17}}}}
// tutoriel : quelques conseils, une seule fois par joueur
if(tuI<6&&state==='play'){tuT+=1/60;const done=[tuT>5&&Math.hypot(me.x-(tuX??me.x),me.y-(tuY??me.y))>250,me.l>1||me.xp>40,tuT>9,me.sk>0||tuT>9,tuT>10,me.l>=5&&tuT>9||c.t>0][tuI];if(tuX===undefined){tuX=me.x;tuY=me.y}
if(done){tuI++;tuT=0;try{localStorage.setItem('rs-tuto',tuI)}catch(e){}}
else{const key='tut'+tuI+(touchMode&&[0,2,3].includes(tuI)?'m':''),txt=tr(key),fs=W<700?13:15;g.font='800 '+fs+'px "Baloo 2",system-ui,sans-serif';const maxw=Math.min(W-40,520),words=txt.split(' '),lines=[];let cur='';for(const w2 of words){const t2=cur?cur+' '+w2:w2;if(g.measureText(t2).width>maxw-28&&cur){lines.push(cur);cur=w2}else cur=t2}lines.push(cur);
const bw2=Math.min(maxw,Math.max(...lines.map(l=>g.measureText(l).width))+28),bh=lines.length*(fs+5)+16,ty=W<700?H-250-bh:22;g.fillStyle='rgba(255,248,231,.95)';g.beginPath();g.roundRect(W/2-bw2/2,ty,bw2,bh,12);g.fill();g.fillStyle=NAVY;g.textAlign='center';lines.forEach((l,i)=>g.fillText(l,W/2,ty+8+fs+i*(fs+5)));
g.fillStyle='#ff6b57';g.font='800 11px "Baloo 2",system-ui,sans-serif';g.textAlign='right';g.fillText((tuI+1)+' / 6',W/2+bw2/2-8,ty+12)}}
// viseur : clic maintenu = tir manuel vers la souris
if(!touchMode&&(aimHeld||kbMode)){g.strokeStyle=aimHeld?'#ff6b57':'rgba(255,248,231,.8)';g.lineWidth=2.5;g.beginPath();g.arc(mx,my,11,0,TAU);g.moveTo(mx-17,my);g.lineTo(mx-6,my);g.moveTo(mx+6,my);g.lineTo(mx+17,my);g.moveTo(mx,my-17);g.lineTo(mx,my-6);g.moveTo(mx,my+6);g.lineTo(mx,my+17);g.stroke()}
if(curRoom){g.font='800 12px "Baloo 2",system-ui,sans-serif';g.fillStyle='rgba(255,248,231,.85)';g.textAlign='left';g.fillText('🔒 '+curRoom+(mode==='team'?' · '+tr('teams'):''),m0+70,m0+mm+27)}
// bouton du son, sous la mini-carte
SNB={x:m0+16,y:m0+mm+22,r:14};STB=bigS?{x:-99,y:-99,r:0}:{x:m0+50,y:m0+mm+22,r:14};if(!bigS){g.fillStyle=statsOpen?'rgba(255,207,63,.85)':'rgba(11,61,107,.6)';g.beginPath();g.arc(STB.x,STB.y,STB.r,0,TAU);g.fill();g.fillStyle=CREAM;g.font='14px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('📊',STB.x,STB.y+1);g.textBaseline='alphabetic'}g.fillStyle='rgba(11,61,107,.6)';g.beginPath();g.arc(SNB.x,SNB.y,SNB.r,0,TAU);g.fill();g.fillStyle=CREAM;g.font='15px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SND.muted?'🔇':'🔊',SNB.x,SNB.y+1);g.textBaseline='alphabetic';
// bouton de compétence
const skd=SK[c.sk],sk=I.sk(c.sk),sr=38;SKB={x:W-62,y:H-74,r:sr};const rdy=me.sk<=0,fr2=rdy?0:cl(me.sk/me.skm,0,1);
g.fillStyle=rdy?'#ff6b57':'rgba(11,61,107,.75)';g.beginPath();g.arc(SKB.x,SKB.y,sr,0,TAU);g.fill();
if(!rdy){g.fillStyle='rgba(255,107,87,.55)';g.beginPath();g.moveTo(SKB.x,SKB.y);g.arc(SKB.x,SKB.y,sr,-Math.PI/2,-Math.PI/2+TAU*(1-fr2));g.closePath();g.fill()}
g.strokeStyle=CREAM;g.lineWidth=3;g.beginPath();g.arc(SKB.x,SKB.y,sr,0,TAU);g.stroke();
g.fillStyle=CREAM;g.textAlign='center';g.font='800 15px "Baloo 2",system-ui,sans-serif';g.fillText(rdy?sk.ab:Math.ceil(me.sk)+' s',SKB.x,SKB.y+5);
g.font='600 12px "Baloo 2",system-ui,sans-serif';{const lab=touchMode?sk.n:sk.n+' · '+tr('space'),mw=Math.max(60,W-8-(bx+bw+16));g.textAlign='right';g.fillText(fitT(lab,mw),W-8,SKB.y+sr+16)}
if(joy){g.fillStyle='rgba(255,255,255,.15)';g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=3;g.beginPath();g.arc(joy.x0,joy.y0,60,0,TAU);g.fill();g.stroke();
const dx=joy.x-joy.x0,dy=joy.y-joy.y0,l=Math.hypot(dx,dy),k=l>60?60/l:1;g.fillStyle='rgba(255,248,231,.85)';g.beginPath();g.arc(joy.x0+dx*k,joy.y0+dy*k,24,0,TAU);g.fill()}
if(toasts.length){const t0=toasts[0],a=Math.max(0,Math.min(1,t0.l,(4-t0.l)*3));g.globalAlpha=a;g.font='800 16px "Baloo 2",system-ui,sans-serif';const tw=Math.min(W-30,g.measureText(t0.s).width+34),ty=banner?118:74;g.fillStyle='rgba(16,42,67,.9)';g.beginPath();g.roundRect(W/2-tw/2,ty,tw,34,17);g.fill();g.strokeStyle='#ffcf3f';g.lineWidth=2;g.stroke();g.fillStyle='#ffcf3f';g.textAlign='center';g.textBaseline='middle';g.fillText(fitT(t0.s,tw-20),W/2,ty+17);g.textBaseline='alphabetic';g.globalAlpha=1}
if(banner){const a=Math.min(1,banner.l,(4.5-banner.l)*3);g.globalAlpha=Math.max(0,a);let bf=22;g.font='800 22px "Baloo 2",system-ui,sans-serif';while(bf>12&&g.measureText(banner.s).width>W-60){bf--;g.font='800 '+bf+'px "Baloo 2",system-ui,sans-serif'}const tw=g.measureText(banner.s).width,y=Math.max(m0+mm+40,70);
g.fillStyle='rgba(11,61,107,.8)';g.beginPath();g.roundRect(W/2-tw/2-22,y-30,tw+44,44,22);g.fill();g.fillStyle='#ffcf3f';g.textAlign='center';g.fillText(banner.s,W/2,y);g.globalAlpha=1}}

function loop(t){const raw=(t-last)||16,dt=Math.min(.05,raw/1000);last=t;T+=dt;
// qualité automatique : si l'ordinateur n'arrive pas à suivre, on dessine en résolution normale et avec moins d'effets
ftE=ftE*.97+Math.min(raw,100)*.03;if(!lowQ&&ftE>24&&T>4&&state==='play'){lowQ=true;rs()}
const k=1-Math.exp(-dt*14),kd=Math.exp(-dt*9);for(const [id,d] of ents){if(d.tx===undefined)continue;const ag=Math.min(T-d.st,.45);
if(id===myId&&state==='play'&&me&&lastIn){// mon navire : il tourne tout de suite vers la souris, sans attendre le serveur
const c=CL[me.c],tr=3.4/Math.pow(c.sz,1.3);d.pa+=cl(angD(lastIn.a,d.pa),-tr*dt,tr*dt);const sp=Math.hypot(d.vx,d.vy);
d.x+=Math.cos(d.pa)*sp*dt;d.y+=Math.sin(d.pa)*sp*dt;const gx=d.tx+d.vx*(ag+LAT),gy=d.ty+d.vy*(ag+LAT),ex=gx-d.x,ey=gy-d.y;
if(Math.hypot(ex,ey)>250){d.x=gx;d.y=gy}else{const kc=Math.min(1,dt*3.5);d.x+=ex*kc;d.y+=ey*kc}
const ea=angD(d.ta,d.pa);if(Math.abs(ea)>1.2)d.pa=d.ta;d.a=d.pa;if(world){const p=S.hullPush(d.x,d.y,d.pa,S.R(me.l,me.c),c.L,world.rocks);d.x=p[0];d.y=p[1]}}
else{d.ox*=kd;d.oy*=kd;d.x=d.tx+d.vx*ag+d.ox;d.y=d.ty+d.vy*ag+d.oy;d.a+=angD(d.ta,d.a)*k;d.pa=d.a}
d.m+=angD(d.tm,d.m)*k}
for(const l of lootM.values())if(l.lf!==undefined)l.lf-=dt;
for(const s of shotsL){s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt}shotsL=shotsL.filter(s=>s.l>-.05);
for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;p.l-=dt}parts=parts.filter(p=>p.l>0);
for(const r of rings){r.l-=dt;r.r+=(r.m-r.r)*Math.min(1,dt*10)}rings=rings.filter(r=>r.l>0);
for(const tx of txts)tx.l-=dt;txts=txts.filter(tx=>tx.l>0);for(const h of hits)h.l-=dt;hits=hits.filter(h=>h.l>0);if(hitBy){hitBy.l-=dt;if(hitBy.l<=0)hitBy=null}if(banner){banner.l-=dt;if(banner.l<=0)banner=null}if(toasts.length){toasts[0].l-=dt;if(toasts[0].l<=0)toasts.shift()}
const md=ents.get(myId),tgt=state==='play'&&md?md:snap?{x:snap.cx,y:snap.cy}:null;if(tgt){const kc=Math.min(1,dt*9);cam.x+=(tgt.x-cam.x)*kc;cam.y+=(tgt.y-cam.y)*kc}
draw();requestAnimationFrame(loop)}
menu();connect();requestAnimationFrame(loop);
