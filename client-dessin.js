// RivalSea – Dessin des projectiles, des navires, du décor et du butin
'use strict';
// ——— Projectiles : flèches, carreaux, balles, boulets, torpilles ———
function drawShot(s){const a=Math.atan2(s.vy,s.vx),k=s.k;g.save();g.translate(s.x,s.y);g.rotate(a);g.lineCap='round';
if(k==='arrow'){g.strokeStyle='#7a4a24';g.lineWidth=2;g.beginPath();g.moveTo(-11,0);g.lineTo(5,0);g.stroke();g.fillStyle=CREAM;g.beginPath();g.moveTo(9,0);g.lineTo(3,-3.5);g.lineTo(3,3.5);g.closePath();g.fill();g.strokeStyle=s.col;g.lineWidth=2;g.beginPath();g.moveTo(-11,0);g.lineTo(-14,-3);g.moveTo(-11,0);g.lineTo(-14,3);g.stroke()}
else if(k==='bolt'){const l=s.sz*3.2;g.strokeStyle='#5a3418';g.lineWidth=Math.max(2.5,s.sz*.8);g.beginPath();g.moveTo(-l,0);g.lineTo(l*.6,0);g.stroke();g.fillStyle=CREAM;g.strokeStyle=s.col;g.lineWidth=1.5;g.beginPath();g.moveTo(l,0);g.lineTo(l*.45,-s.sz*.9);g.lineTo(l*.45,s.sz*.9);g.closePath();g.fill();g.stroke()}
else if(k==='bullet'){g.strokeStyle='rgba(255,248,231,.55)';g.lineWidth=s.sz*.9;g.beginPath();g.moveTo(-s.sz*4,0);g.lineTo(0,0);g.stroke();g.fillStyle='#ffcf3f';g.strokeStyle=s.col;g.lineWidth=1.5;g.beginPath();g.arc(0,0,s.sz*.75,0,TAU);g.fill();g.stroke()}
else if(k==='fire'){g.fillStyle='rgba(255,159,67,.55)';for(let i=1;i<5;i++){g.beginPath();g.arc(-s.sz*1.2-i*5,Math.sin(T*25+i)*1.5,s.sz*(.9-i*.15),0,TAU);g.fill()}g.fillStyle='#8a5a2b';g.strokeStyle=s.col;g.lineWidth=1.5;g.beginPath();g.arc(0,0,s.sz,0,TAU);g.fill();g.stroke();g.fillStyle='#ffcf3f';g.beginPath();g.arc(s.sz*.2,-s.sz*.3,s.sz*.45,0,TAU);g.fill()}
else if(k==='torp'){g.fillStyle='rgba(255,255,255,.55)';for(let i=1;i<5;i++){g.beginPath();g.arc(-s.sz*1.6-i*7,Math.sin(T*20+i)*2,3.2-i*.5,0,TAU);g.fill()}g.fillStyle='#3a3f47';g.strokeStyle=s.col;g.lineWidth=2;g.beginPath();g.ellipse(0,0,s.sz*1.8,s.sz*.55,0,0,TAU);g.fill();g.stroke();g.fillStyle=s.col;g.fillRect(-s.sz*1.9,-s.sz*.7,s.sz*.4,s.sz*1.4)}
else{g.fillStyle=CREAM;g.strokeStyle=s.col;g.lineWidth=s.sz>4?3:2;g.beginPath();g.arc(0,0,s.sz,0,TAU);g.fill();g.stroke()}
g.restore()}

// ——— Dessin des navires ———
// Formes de coque vues du dessus (proue vers la droite)
function hullPath(x,L,Wd,hs){x.beginPath();
if(hs==='long'){x.moveTo(L,0);x.quadraticCurveTo(L*.3,-Wd*1.15,-L*.3,-Wd);x.quadraticCurveTo(-L*.85,-Wd*.7,-L,0);x.quadraticCurveTo(-L*.85,Wd*.7,-L*.3,Wd);x.quadraticCurveTo(L*.3,Wd*1.15,L,0)}
else if(hs==='round'){x.moveTo(L*.95,0);x.bezierCurveTo(L*.8,-Wd*1.15,-L*.5,-Wd*1.2,-L*.72,-Wd*.75);x.lineTo(-L*.72,Wd*.75);x.bezierCurveTo(-L*.5,Wd*1.2,L*.8,Wd*1.15,L*.95,0)}
else if(hs==='sleek'){x.moveTo(L*1.05,0);x.quadraticCurveTo(L*.4,-Wd*1.15,-L*.5,-Wd*.9);x.lineTo(-L*.7,-Wd*.6);x.lineTo(-L*.7,Wd*.6);x.lineTo(-L*.5,Wd*.9);x.quadraticCurveTo(L*.4,Wd*1.15,L*1.05,0)}
else if(hs==='fort'){const rx=L*.9,ry=Wd*1.1;x.moveTo(rx,0);x.lineTo(rx*.5,-ry);x.lineTo(-rx*.5,-ry);x.lineTo(-rx,0);x.lineTo(-rx*.5,ry);x.lineTo(rx*.5,ry)}
else if(hs==='ironram'){x.moveTo(L*.82,0);x.quadraticCurveTo(L*.72,-Wd,L*.2,-Wd);x.lineTo(-L*.5,-Wd);x.quadraticCurveTo(-L*.82,-Wd*.95,-L*.82,-Wd*.4);x.lineTo(-L*.82,Wd*.4);x.quadraticCurveTo(-L*.82,Wd*.95,-L*.5,Wd);x.lineTo(L*.2,Wd);x.quadraticCurveTo(L*.72,Wd,L*.82,0)}
else if(hs==='cruiser'){x.moveTo(L*1.05,0);x.quadraticCurveTo(L*.6,-Wd,L*.1,-Wd);x.lineTo(-L*.55,-Wd);x.bezierCurveTo(-L*.8,-Wd,-L*.95,-Wd*.5,-L*.95,0);x.bezierCurveTo(-L*.95,Wd*.5,-L*.8,Wd,-L*.55,Wd);x.lineTo(L*.1,Wd);x.quadraticCurveTo(L*.6,Wd,L*1.05,0)}
else if(hs==='sub'){x.moveTo(L,0);x.bezierCurveTo(L*.85,-Wd*1.15,-L*.65,-Wd*1.1,-L*.95,0);x.bezierCurveTo(-L*.65,Wd*1.1,L*.85,Wd*1.15,L,0)}
else if(hs==='steel'){x.moveTo(L,0);x.quadraticCurveTo(L*.55,-Wd*1.05,L*.1,-Wd);x.lineTo(-L*.66,-Wd*.95);x.quadraticCurveTo(-L*.78,-Wd*.9,-L*.78,-Wd*.5);x.lineTo(-L*.78,Wd*.5);x.quadraticCurveTo(-L*.78,Wd*.9,-L*.66,Wd*.95);x.lineTo(L*.1,Wd);x.quadraticCurveTo(L*.55,Wd*1.05,L,0)}
else{x.moveTo(L,0);x.quadraticCurveTo(L*.45,-Wd*1.2,-L*.6,-Wd);x.lineTo(-L*.72,-Wd*.7);x.lineTo(-L*.72,Wd*.7);x.lineTo(-L*.6,Wd);x.quadraticCurveTo(L*.45,Wd*1.2,L,0)}
x.closePath()}
function gun(x,px,ar,r,len,w){x.save();x.translate(px,0);x.rotate(ar);x.fillStyle=NAVY;x.fillRect(0,-r*w,r*len,r*w*2);x.beginPath();x.arc(0,0,r*(w+.14),0,TAU);x.fill();x.strokeStyle=CREAM;x.lineWidth=Math.max(1.5,r*.06);x.stroke();x.restore()}
function turret(x,px,ar,r){x.save();x.translate(px,0);x.rotate(ar);x.fillStyle='#4b5563';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.3,r*.05);x.fillRect(r*.1,-r*.13,r*.75,r*.09);x.fillRect(r*.1,r*.04,r*.75,r*.09);x.beginPath();x.roundRect(-r*.28,-r*.26,r*.5,r*.52,r*.14);x.fill();x.stroke();x.restore()}
function turretN(x,px,py,ar,r,n,sc,m){x.save();x.translate(px,py);x.rotate(ar);const q=r*sc;x.fillStyle='#3f4854';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.3,q*.05);const bl=m?q*.45:q*.85,bw=m?q*.14:q*.07;for(let i=0;i<n;i++){const oy=(i-(n-1)/2)*q*(m?.2:.14);x.fillRect(q*.15,oy-bw/2,bl,bw)}x.beginPath();x.roundRect(-q*.32,-q*.3,q*.6,q*.6,q*.16);x.fill();x.stroke();x.fillStyle='#ffcf3f';x.beginPath();x.arc(-q*.06,0,q*.06,0,TAU);x.fill();x.restore()}
// armes visibles sur le pont, assorties au projectile
for(const q in CL)CL[q].key=q;
const ARMS={brulot:['pot',2],galeasse:['swivel'],barque:['bow',1],drakkar:['bow',3],galere:['xbow',3],nef:['ballista'],goelette:['musket',3],chebec:['musket',2],caravelle:['musket',2],brickab:['blunder',3],clipper:['musket',3],aviso:['mg'],vapeurb:['gatling'],bombarde:['swivel'],cuirasse:['swivel']};
function crew(x,px,py,ar,r,k){x.save();x.translate(px,py);x.rotate(ar);const s=r*.13,lw=Math.max(1.2,r*.055);x.lineCap='round';
if(k==='bow'){x.strokeStyle='#7a4a24';x.lineWidth=Math.max(1.3,r*.07);x.beginPath();x.arc(r*.05,0,r*.3,-1.15,1.15);x.stroke();x.strokeStyle='rgba(255,248,231,.9)';x.lineWidth=1;x.beginPath();x.moveTo(r*.05+Math.cos(1.15)*r*.3,-Math.sin(1.15)*r*.3);x.lineTo(r*.05+Math.cos(1.15)*r*.3,Math.sin(1.15)*r*.3);x.stroke();x.strokeStyle='#5a3418';x.lineWidth=1;x.beginPath();x.moveTo(-r*.05,0);x.lineTo(r*.42,0);x.stroke()}
else if(k==='xbow'){x.strokeStyle='#5a3418';x.lineWidth=lw;x.beginPath();x.moveTo(0,0);x.lineTo(r*.45,0);x.stroke();x.strokeStyle='#7a4a24';x.lineWidth=Math.max(1.3,r*.06);x.beginPath();x.moveTo(r*.3,-r*.2);x.quadraticCurveTo(r*.42,0,r*.3,r*.2);x.stroke()}
else if(k==='musket'){x.strokeStyle='#2f2f2f';x.lineWidth=lw;x.beginPath();x.moveTo(-r*.05,s*.4);x.lineTo(r*.55,s*.4);x.stroke();x.strokeStyle='#7a4a24';x.lineWidth=lw*1.6;x.beginPath();x.moveTo(-r*.05,s*.4);x.lineTo(r*.12,s*.4);x.stroke()}
else if(k==='pot'){x.fillStyle='#8a5a2b';x.strokeStyle='#5a3418';x.lineWidth=1;x.beginPath();x.arc(r*.3,0,r*.1,0,TAU);x.fill();x.stroke();const fl=1+Math.sin(T*18+px)*.25;x.fillStyle='#ff9f43';x.beginPath();x.moveTo(r*.24,-r*.06);x.quadraticCurveTo(r*.3,-r*.28*fl,r*.36,-r*.06);x.fill();x.fillStyle='#ffcf3f';x.beginPath();x.arc(r*.3,-r*.1,r*.04,0,TAU);x.fill()}
else if(k==='blunder'){x.strokeStyle='#2f2f2f';x.lineWidth=lw*1.2;x.beginPath();x.moveTo(0,0);x.lineTo(r*.36,0);x.stroke();x.fillStyle='#2f2f2f';x.beginPath();x.moveTo(r*.32,-r*.04);x.lineTo(r*.46,-r*.1);x.lineTo(r*.46,r*.1);x.lineTo(r*.32,r*.04);x.fill()}
x.fillStyle='#f1c27d';x.strokeStyle=NAVY;x.lineWidth=1;x.beginPath();x.arc(0,0,s,0,TAU);x.fill();x.stroke();x.fillStyle='#8a3b2b';x.beginPath();x.arc(-s*.2,0,s*.62,0,TAU);x.fill();x.restore()}
function mount(x,px,ar,r,k){x.save();x.translate(px,0);x.fillStyle='#5c6672';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.2,r*.05);x.beginPath();x.arc(0,0,r*.2,0,TAU);x.fill();x.stroke();x.rotate(ar);x.fillStyle='#2f3640';
if(k==='ballista'){x.fillStyle='#8a5a2b';x.fillRect(-r*.2,-r*.07,r*.85,r*.14);x.strokeStyle='#5a3418';x.lineWidth=Math.max(2,r*.1);x.beginPath();x.moveTo(r*.4,-r*.5);x.quadraticCurveTo(r*.62,0,r*.4,r*.5);x.stroke();x.strokeStyle=CREAM;x.lineWidth=1;x.beginPath();x.moveTo(r*.4,-r*.5);x.lineTo(r*.02,0);x.lineTo(r*.4,r*.5);x.stroke();x.fillStyle='#d9dde3';x.beginPath();x.moveTo(r*.85,0);x.lineTo(r*.66,-r*.06);x.lineTo(r*.66,r*.06);x.fill()}
else if(k==='mg'){x.fillRect(0,-r*.04,r*.6,r*.08);x.fillStyle='#8a96a3';x.beginPath();x.roundRect(r*.08,-r*.2,r*.07,r*.4,r*.03);x.fill()}
else if(k==='gatling'){for(const oy of [-.07,0,.07])x.fillRect(0,oy*r-r*.025,r*.62,r*.05);x.fillStyle='#8a96a3';x.beginPath();x.roundRect(-r*.05,-r*.13,r*.2,r*.26,r*.05);x.fill();x.strokeStyle='#ffcf3f';x.lineWidth=1;x.beginPath();x.arc(r*.62,0,r*.08,0,TAU);x.stroke()}
else if(k==='swivel'){x.fillRect(0,-r*.05,r*.4,r*.1);x.beginPath();x.arc(r*.4,0,r*.07,0,TAU);x.fill()}
x.restore()}
function drawArms(x,c,k,L,Wd,r,ar){const a=ARMS[k];if(!a)return;const [kind,n]=a;
if(kind==='ballista'||kind==='mg'||kind==='gatling'){mount(x,L*(kind==='ballista'?.5:.5),ar,kind==='ballista'?r*1.3:r,kind);return}
if(kind==='swivel'){for(const s of [-1,1])x.save(),x.translate(0,s*Wd*.55),mount(x,-L*.35,ar,r*.8,'swivel'),x.restore();return}
const ms=(c.masts||[]).map(m=>m.x*L);const xs=[];for(let i=0;i<n;i++)xs.push(n===1?-L*.1:L*.42-i*(L*.84/(n-1)));
xs.forEach((px,i)=>{let q=px;for(const mx of ms)if(Math.abs(q-mx)<r*.3)q=mx+(q>=mx?r*.32:-r*.32);crew(x,q,n===1?0:(i%2?1:-1)*Wd*.32,ar,r,kind)})}
// motif des voiles (dessiné avec des rectangles découpés à la forme de la voile)
function patt(x,xm,r,Wd,o){const p=o.pat;if(!p||p==='plain')return;const col=o.trim&&o.trim!==(o.sail||CREAM)?o.trim:NAVY,X0=xm-r*2,W2=r*4,Y=Wd*1.8;x.save();x.clip();x.fillStyle=col;
if(p==='stripes')for(let i=-4;i<4;i+=2)x.fillRect(X0,i*Y/4,W2,Y/4);else if(p==='center')x.fillRect(X0,-Y*.16,W2,Y*.32);else if(p==='half')x.fillRect(X0,0,W2,Y);else if(p==='tips'){x.fillRect(X0,-Y,W2,Y*.5);x.fillRect(X0,Y*.5,W2,Y*.5)}else if(p==='check'){const q=Math.max(2,Wd*.35);for(let i=-6;i<6;i++)for(let j=-6;j<6;j++)if((i+j)&1)x.fillRect(xm+i*q,j*q,q,q)}else if(p==='rainbow'){const cs=['#ff6b57','#ff9f43','#ffcf3f','#5be3a1','#4dabf7','#8b5cf6'];for(let i=0;i<6;i++){x.fillStyle=cs[i];x.fillRect(X0,-Y+i*Y/3,W2,Y/3)}}x.restore()}
function sailShape(x,xm,Wd,r,w,bg){bg=bg||.75;x.beginPath();x.moveTo(xm,-Wd*w);x.quadraticCurveTo(xm+r*bg,0,xm,Wd*w);x.quadraticCurveTo(xm+r*bg/3,0,xm,-Wd*w)}
function ship(x,c,r,col,ar,t,o){o=o||{};const L=r*c.L,Wd=r*c.Wd,sail=o.sail||CREAM,hs=c.hs||'classic',steel=c.deck==='steel'||c.deck==='dark',lw=Math.max(2,r*.12);x.lineCap='round';x.lineJoin='round';
// sous la coque : sillage, rames, roues, éperon, beaupré
if(c.screw){x.fillStyle='rgba(255,255,255,.6)';const ys=c.screw===2?[-Wd*.35,Wd*.35]:[0];for(const yo of ys)for(let i=0;i<4;i++){const q=((t*3+i/4)%1),k=1-q;x.globalAlpha*=k;x.beginPath();x.arc(-L*.78-q*r*1.6,yo+Math.sin(t*9+i*2)*r*.15,r*(.12+q*.15),0,TAU);x.fill();x.globalAlpha/=Math.max(.01,k)}}
if(c.wave){x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(1.5,r*.08);const ph=(t*2)%1;for(let k=0;k<2;k++){const q=(ph+k*.5)%1;x.globalAlpha*=1-q;x.beginPath();x.moveTo(L*.95-q*r*.4,-Wd*(.3+q*1.2));x.lineTo(L+r*.2,0);x.lineTo(L*.95-q*r*.4,Wd*(.3+q*1.2));x.stroke();x.globalAlpha/=Math.max(.01,1-q)}}
if(c.oars){const n=c.oarsN||2,x0=L*(n>2?.5:.15),x1=-L*(n>2?.55:.35);x.strokeStyle=WOOD;x.lineWidth=Math.max(1.3,r*(n>2?.07:.11));for(let s=-1;s<=1;s+=2)for(let i=0;i<n;i++){const ox=n>1?x0+(x1-x0)*i/(n-1):0,sw=Math.sin(t*6+i*.35)*.5;x.beginPath();x.moveTo(ox,s*Wd*.6);x.lineTo(ox-Math.sin(sw)*r*.7,s*(Wd+r*.7));x.stroke()}}
if(c.paddle){for(let s=-1;s<=1;s+=2){const py=s*(Wd+r*.18);x.fillStyle='#5a3418';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.5,r*.06);x.beginPath();x.roundRect(-L*.26,py-r*.3,L*.52,r*.6,r*.18);x.fill();x.stroke();x.strokeStyle='#ffcf3f';const ph=(t*4)%1;for(let i=0;i<5;i++){const px=-L*.24+((i+ph)/5)*L*.48;x.beginPath();x.moveTo(px,py-r*.25);x.lineTo(px,py+r*.25);x.stroke()}}}
if(c.beak){x.fillStyle=c.t>=3?'#8a96a3':'#c98a4b';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.5,r*.07);x.beginPath();x.moveTo(L*.8,-Wd*.32);x.lineTo(L+r*.62,0);x.lineTo(L*.8,Wd*.32);x.closePath();x.fill();x.stroke()}
if(c.bigbeak){x.fillStyle='#6b7785';x.strokeStyle='#e8edf2';x.lineWidth=Math.max(2,r*.09);x.beginPath();x.moveTo(L*.6,-Wd*.85);x.lineTo(L+r*1.05,0);x.lineTo(L*.6,Wd*.85);x.closePath();x.fill();x.stroke();x.fillStyle='#ffcf3f';for(const f of [.35,.6,.82]){x.beginPath();x.arc(L*.6+(L*.4+r*1.05)*f,0,r*.06,0,TAU);x.fill()}}
if(c.bowsprit){x.strokeStyle=WOOD;x.lineWidth=Math.max(1.5,r*.08);x.beginPath();x.moveTo(L*.8,0);x.lineTo(L+r*.85,0);x.stroke()}
if(c.ghost){x.save();x.globalAlpha*=.72;x.shadowColor='#9ff7d8';x.shadowBlur=r*.8}
// coque peinte à la couleur du joueur, pont en bois ou en acier
hullPath(x,L,Wd,hs);x.fillStyle=col;x.fill();x.strokeStyle=c.ghost?'#9ff7d8':o.trim&&o.trim!==CREAM?o.trim:steel?'#e8edf2':CREAM;x.lineWidth=lw;x.stroke();
x.save();if(steel)x.scale(.86,.74);else x.scale(.8,.64);hullPath(x,L,Wd,hs);x.fillStyle=c.deck==='dark'?'#68737f':steel?'#97a3b0':'#d6a466';x.fill();x.restore();
if(c.belt){x.save();x.scale(.93,.86);hullPath(x,L,Wd,hs);x.strokeStyle='#2f3640';x.lineWidth=Math.max(2,r*.14);x.stroke();x.restore();x.fillStyle='#c8ced6';for(let i=0;i<9;i++){const px=-L*.6+i*L*.17;for(let s2=-1;s2<=1;s2+=2){x.beginPath();x.arc(px,s2*Wd*.83,r*.035,0,TAU);x.fill()}}}
if(hs==='fort'){x.fillStyle='#5c6672';x.strokeStyle='#e8edf2';x.lineWidth=1;const rx=L*.9,ry=Wd*1.1,pts=[[rx,0],[rx*.5,-ry],[-rx*.5,-ry],[-rx,0],[-rx*.5,ry],[rx*.5,ry]];for(let i=0;i<6;i++){const [ax,ay]=pts[i],[bx,by]=pts[(i+1)%6];for(let k=1;k<6;k+=2){const f=k/6,mx=ax+(bx-ax)*f,my=ay+(by-ay)*f;x.beginPath();x.rect(mx-r*.09,my-r*.09,r*.18,r*.18);x.fill();x.stroke()}}}
if(c.leg){x.save();x.scale(.95,.9);hullPath(x,L,Wd,hs);x.strokeStyle='#ffcf3f';x.lineWidth=Math.max(1.5,r*.06);x.stroke();x.restore()}
if(c.stripes){x.strokeStyle='#ffcf3f';x.lineWidth=Math.max(1.5,r*.07);for(const yo of [-Wd*.42,Wd*.42]){x.beginPath();x.moveTo(-L*.6,yo);x.lineTo(L*.55,yo*.6);x.stroke()}}
if(!steel){x.strokeStyle='rgba(122,74,36,.35)';x.lineWidth=1;for(let j=-1;j<=1;j++){x.beginPath();x.moveTo(-L*.42,j*Wd*.2);x.lineTo(L*.38,j*Wd*.2);x.stroke()}}
else{x.strokeStyle='rgba(60,70,80,.35)';x.lineWidth=1;x.beginPath();x.moveTo(-L*.55,0);x.lineTo(L*.6,0);x.stroke()}
// châteaux avant et arrière
if(c.castle){const cs=(x0,len)=>{x.fillStyle='#b07a45';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.3,r*.06);x.beginPath();x.roundRect(x0,-Wd*.62,len,Wd*1.24,r*.08);x.fill();x.stroke();x.fillStyle='#8a5a2b';const n=Math.max(2,Math.round(len/(r*.28)));for(let i=0;i<n;i++){const px=x0+len*(i+.5)/n;x.fillRect(px-r*.06,-Wd*.62,r*.12,r*.12);x.fillRect(px-r*.06,Wd*.62-r*.12,r*.12,r*.12)}};
if(c.castle.a)cs(-L*.72,L*c.castle.a);if(c.castle.f)cs(L*.78-L*c.castle.f,L*c.castle.f)}
// sabords (une ou deux rangées)
const n=c.ports||0;x.fillStyle=NAVY;for(let row=0;row<(c.ports2?2:1);row++)for(let i=0;i<n;i++){const px=n===1?0:L*.35-i*(L*.85/(n-1)),py=Wd*(row?.58:.82);for(let s=-1;s<=1;s+=2){x.beginPath();x.roundRect(px-r*.09,s*py-r*.08,r*.18,r*.16,r*.04);x.fill();if(c.w&&c.w.k==='ball'&&!row){x.fillStyle='#2f2f2f';x.fillRect(px-r*.05,s>0?s*py:s*py-r*.3,r*.1,r*.3);x.fillStyle=NAVY}}}
// boucliers ronds du drakkar
if(c.shields){const cs=['#ffcf3f','#ff6b57','#4dabf7','#fff8e7'];for(let i=0;i<7;i++){const px=L*.5-i*L*.17;for(let s=-1;s<=1;s+=2){x.fillStyle=cs[(i+(s>0?1:0))%4];x.strokeStyle=NAVY;x.lineWidth=1;x.beginPath();x.arc(px,s*Wd*.8,r*.12,0,TAU);x.fill();x.stroke()}}}
// tête et queue de dragon
if(c.dragon){x.strokeStyle='#c9a227';x.lineWidth=Math.max(2,r*.13);x.beginPath();x.moveTo(L*.85,0);x.quadraticCurveTo(L+r*.35,-r*.05,L+r*.45,-r*.3);x.stroke();x.fillStyle='#c9a227';x.beginPath();x.ellipse(L+r*.55,-r*.36,r*.24,r*.15,-.4,0,TAU);x.fill();x.fillStyle=NAVY;x.beginPath();x.arc(L+r*.6,-r*.42,r*.04,0,TAU);x.fill();
x.strokeStyle='#c9a227';x.beginPath();x.moveTo(-L*.85,0);x.quadraticCurveTo(-L-r*.4,0,-L-r*.35,r*.3);x.quadraticCurveTo(-L-r*.2,r*.45,-L-r*.12,r*.25);x.stroke()}
// mortier
if(c.mortar){x.fillStyle='#3a3a3a';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.5,r*.06);x.beginPath();x.arc(L*.18,0,r*.38,0,TAU);x.fill();x.stroke();x.fillStyle='#111';x.beginPath();x.arc(L*.18,0,r*.2,0,TAU);x.fill()}
if(c.tubes){x.fillStyle='#3a3f47';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.2,r*.05);for(let s=-1;s<=1;s+=2)for(const px of [L*.5,-L*.45]){x.save();x.translate(px,s*Wd*.45);x.rotate(s*.35);x.beginPath();x.roundRect(-r*.35,-r*.08,r*.7,r*.16,r*.08);x.fill();x.stroke();x.restore()}}
// pots à feu du brûlot, canons de proue de la galéasse
if(c.pots){for(const [px,py] of [[-L*.4,-Wd*.35],[-L*.4,Wd*.35],[-L*.55,0]]){x.fillStyle='#8a5a2b';x.strokeStyle='#5a3418';x.lineWidth=1;x.beginPath();x.arc(px,py,r*.13,0,TAU);x.fill();x.stroke();x.fillStyle='rgba(255,159,67,'+(.6+.3*Math.sin(t*14+px)).toFixed(2)+')';x.beginPath();x.arc(px,py,r*.07,0,TAU);x.fill()}}
if(c.bowguns){for(const s of [-1,1])gun(x,L*.62,s*.12,r,.55,.09);x.save();x.translate(0,Wd*.28);gun(x,L*.55,.1,r,.5,.08);x.restore();x.save();x.translate(0,-Wd*.28);gun(x,L*.55,-.1,r,.5,.08);x.restore()}
// kiosque du sous-marin et gouvernails de plongée
if(c.sub){x.fillStyle='#4b5563';x.strokeStyle='#e8edf2';x.lineWidth=Math.max(1.3,r*.05);for(const s of [-1,1]){x.beginPath();x.moveTo(L*.6,s*Wd*.7);x.lineTo(L*.54,s*(Wd+r*.16));x.lineTo(L*.46,s*Wd*.75);x.fill();x.stroke();x.beginPath();x.moveTo(-L*.74,s*Wd*.45);x.lineTo(-L*.84,s*(Wd+r*.2));x.lineTo(-L*.92,s*Wd*.25);x.fill();x.stroke()}
x.fillStyle='#3a414b';x.beginPath();x.roundRect(L*.02,-Wd*.5,L*.3,Wd,r*.18);x.fill();x.stroke();x.strokeStyle='#e8edf2';x.lineWidth=Math.max(1.5,r*.06);x.beginPath();x.moveTo(L*.2,0);x.lineTo(L*.2+r*.25,0);x.stroke();x.fillStyle='#ffcf3f';x.beginPath();x.arc(L*.12,0,r*.07,0,TAU);x.fill();
x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<6;i++){x.beginPath();x.arc(-L*.5+i*L*.22,Wd*.2*(i%2?1:-1),r*.05,0,TAU);x.fill()}}
// rampes de roquettes, orientées vers la cible
if(c.racks){for(const rx of c.racks){x.save();x.translate(rx*L,0);x.fillStyle='#5c6672';x.strokeStyle=CREAM;x.lineWidth=Math.max(1.2,r*.05);x.beginPath();x.arc(0,0,r*.3,0,TAU);x.fill();x.stroke();x.rotate(ar);x.scale(.8,.8);x.fillStyle='#3f4854';x.beginPath();x.roundRect(-r*.25,-r*.32,r*.85,r*.64,r*.08);x.fill();x.stroke();x.fillStyle='#1d232b';for(let i=0;i<3;i++)for(let j=0;j<2;j++){x.beginPath();x.arc(r*.5,-r*.2+i*r*.2+(j?r*.0:0),r*.07,0,TAU);x.fill()}x.fillStyle='#ff6b57';for(let i=0;i<3;i++){x.beginPath();x.moveTo(r*.62,-r*.2+i*r*.2);x.lineTo(r*.52,-r*.25+i*r*.2);x.lineTo(r*.52,-r*.15+i*r*.2);x.fill()}x.restore()}}
// passerelle et cheminées
if(c.citadel){const x0=-L*.32,x1=L*.36,hw=Wd*.66;x.fillStyle='#4b5563';x.strokeStyle='#e8edf2';x.lineWidth=Math.max(1.5,r*.07);for(let i=0;i<3;i++){const px=-L*.2+i*L*.2;for(let s=-1;s<=1;s+=2){x.fillStyle='#2f3640';x.fillRect(px-r*.05,s*hw,r*.1,s*(Wd*.42));x.fillStyle='#4b5563';x.beginPath();x.roundRect(px-r*.16,s*hw-r*.13,r*.32,r*.26,r*.06);x.fill();x.stroke()}}
x.fillStyle='#4b5563';x.beginPath();x.roundRect(x0,-hw,x1-x0,hw*2,r*.25);x.fill();x.stroke();x.fillStyle='#c8ced6';for(let i=0;i<6;i++){const px=x0+(x1-x0)*(i+.5)/6;for(let s=-1;s<=1;s+=2){x.beginPath();x.arc(px,s*hw*.8,r*.04,0,TAU);x.fill()}}}
if(c.aa){for(let i=0;i<6;i++){const px=L*.5-i*L*.2;for(let s=-1;s<=1;s+=2){x.fillStyle='#3f4854';x.strokeStyle='#e8edf2';x.lineWidth=1;x.beginPath();x.arc(px,s*Wd*.66,r*.09,0,TAU);x.fill();x.stroke();x.strokeStyle='#3f4854';x.lineWidth=Math.max(1,r*.04);x.beginPath();x.moveTo(px,s*Wd*.66);x.lineTo(px+r*.12,s*Wd*.66+s*r*.1);x.stroke()}}}
if(c.cabin){x.fillStyle='#d9dde3';x.strokeStyle=NAVY;x.lineWidth=Math.max(1.2,r*.05);x.beginPath();x.roundRect(-L*.05,-Wd*.42,L*.42,Wd*.84,r*.1);x.fill();x.stroke();x.fillStyle=NAVY;for(let i=0;i<3;i++)x.fillRect(L*.02+i*L*.11,-Wd*.2,L*.06,Wd*.4)}
if(c.stack){const pos=c.stackX?c.stackX.map(v=>v*L):c.stack===3?[L*.18,-L*.02,-L*.22]:c.stack===2?[L*.05,-L*.2]:[-L*.04];for(const px of pos){for(let i=0;i<3;i++){const q=((t*.7+i/3)%1);x.fillStyle='rgba(90,90,90,'+(.35*(1-q)).toFixed(3)+')';x.beginPath();x.arc(px-q*r*1.6,q*r*.35,r*(.16+q*.28),0,TAU);x.fill()}
x.fillStyle='#2f2f2f';x.beginPath();if(c.slant)x.ellipse(px-r*.08,0,r*.34,r*.18,0,0,TAU);else x.ellipse(px,0,r*.26,r*.22,0,0,TAU);x.fill();x.strokeStyle=o.sail||col;x.lineWidth=Math.max(1.5,r*.07);x.stroke()}}
if(c.tripod){const tx=(c.tripodX||0)*L;if(c.pennant){x.strokeStyle='rgba(255,248,231,.7)';x.lineWidth=1;x.beginPath();x.moveTo(L*.9,0);x.lineTo(tx,0);x.lineTo(-L*.8,0);x.stroke();const fc=['#ff6b57','#ffcf3f','#4dabf7','#5be3a1'];for(let i=0;i<8;i++){const fx=i<4?tx+(L*.9-tx)*(i+1)/5:tx+(-L*.8-tx)*(i-3)/5,w=Math.sin(t*6+i)*r*.05;x.fillStyle=fc[i%4];x.beginPath();x.moveTo(fx,0);x.lineTo(fx-r*.1,r*.22+w);x.lineTo(fx+r*.1,r*.22+w);x.closePath();x.fill()}}
x.strokeStyle='#2f3640';x.lineWidth=Math.max(1.5,r*.07);x.beginPath();x.moveTo(tx-r*.3,-Wd*.35);x.lineTo(tx,0);x.lineTo(tx-r*.3,Wd*.35);x.moveTo(tx+r*.3,0);x.lineTo(tx,0);x.stroke();x.fillStyle='#d9dde3';x.strokeStyle=NAVY;x.lineWidth=1.2;x.beginPath();x.arc(tx,0,r*.2,0,TAU);x.fill();x.stroke()}
if(c.radar){const rx=L*.12;x.fillStyle=NAVY;x.beginPath();x.arc(rx,0,r*.1,0,TAU);x.fill();x.save();x.translate(rx,0);x.rotate(t*3);x.strokeStyle='#e8edf2';x.lineWidth=Math.max(2,r*.09);x.beginPath();x.moveTo(-r*.35,0);x.lineTo(r*.35,0);x.stroke();x.restore()}
if(c.tower){x.fillStyle='#6b7785';x.strokeStyle='#e8edf2';x.lineWidth=Math.max(1.5,r*.06);x.beginPath();x.arc(L*.02,0,r*.55,0,TAU);x.fill();x.stroke();x.fillStyle='#4b5563';for(let i=0;i<8;i++){const a=i/8*TAU;x.fillRect(L*.02+Math.cos(a)*r*.48-r*.07,Math.sin(a)*r*.48-r*.07,r*.14,r*.14)}x.fillStyle='#ffcf3f';x.beginPath();x.arc(L*.02,0,r*.16,0,TAU);x.fill()}
if(c.nests){const rx=L*.9,ry=Wd*1.1;for(const [nx,ny] of [[rx*.5,-ry],[rx*.5,ry],[-rx*.5,-ry],[-rx*.5,ry]]){x.fillStyle='#2f3640';x.strokeStyle='#e8edf2';x.lineWidth=1.2;x.beginPath();x.arc(nx,ny,r*.2,0,TAU);x.fill();x.stroke();x.save();x.translate(nx,ny);x.rotate(ar);x.fillStyle='#e8edf2';x.fillRect(0,-r*.03,r*.35,r*.06);x.restore()}}
if(c.ghost)x.shadowBlur=0;
// pavillon à la poupe
if(o.flag&&o.flag!=='none'){const fx=hs==='long'?-L*.9:-L*.7,wv=Math.sin(t*7)*r*.08;x.fillStyle=NAVY;x.beginPath();x.moveTo(fx,-r*.26);x.quadraticCurveTo(fx-r*.45,-r*.26+wv,fx-r*.85,-r*.26);x.lineTo(fx-r*.85,r*.26);x.quadraticCurveTo(fx-r*.45,r*.26+wv,fx,r*.26);x.closePath();x.fill();
x.fillStyle=CREAM;x.font='800 '+Math.max(5,r*.42)+'px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(FLAGS_ALL[o.flag]||'',fx-r*.43,r*.02);x.textBaseline='alphabetic'}
// voiles
for(const m of c.masts||[]){const xm=m.x*L;
if(m.k==='rag'){x.fillStyle='rgba(200,240,225,.75)';x.beginPath();x.moveTo(xm,-Wd*1.25);x.quadraticCurveTo(xm+r*.7,-Wd*.3,xm+r*.3,-Wd*.1);x.lineTo(xm+r*.55,Wd*.2);x.quadraticCurveTo(xm+r*.5,Wd*.9,xm,Wd*1.25);x.closePath();x.fill()}
else if(m.k==='tri'){x.fillStyle=sail;x.globalAlpha*=.93;x.beginPath();x.moveTo(xm+r*.7,0);x.lineTo(xm-r*.45,-Wd*.68);x.lineTo(xm-r*.45,Wd*.68);x.closePath();x.fill();patt(x,xm,r,Wd,o);x.globalAlpha/=.93;x.fillStyle=NAVY;x.beginPath();x.arc(xm,0,r*.12,0,TAU);x.fill();continue}
else if(m.k==='gaff'){x.fillStyle=sail;x.beginPath();x.moveTo(xm,0);x.quadraticCurveTo(xm-r*.5,Wd*1.25,xm-r*1.3,Wd*.55);x.lineTo(xm-r*1.3,Wd*.05);x.quadraticCurveTo(xm-r*.6,Wd*.2,xm,0);x.fill();patt(x,xm-r*.6,r,Wd,o);x.strokeStyle='rgba(122,74,36,.5)';x.lineWidth=1;x.stroke();x.strokeStyle=WOOD;x.lineWidth=Math.max(1.5,r*.07);x.beginPath();x.moveTo(xm,0);x.lineTo(xm-r*1.25,Wd*.1);x.stroke();x.fillStyle=NAVY;x.beginPath();x.arc(xm,0,r*.12,0,TAU);x.fill();continue}
else if(m.k==='lat'){x.fillStyle=sail;x.beginPath();x.moveTo(xm+r*.9,-Wd*.6);x.quadraticCurveTo(xm+r*.75,Wd*.9,xm-r*.9,Wd*1.1);x.quadraticCurveTo(xm-r*.4,Wd*.2,xm-r*.55,-Wd*.25);x.closePath();x.fill();patt(x,xm,r,Wd,o);x.strokeStyle='rgba(122,74,36,.5)';x.lineWidth=1;x.stroke();x.strokeStyle=WOOD;x.lineWidth=Math.max(2,r*.08);x.beginPath();x.moveTo(xm+r*.95,-Wd*.62);x.lineTo(xm-r*.95,Wd*1.12);x.stroke();x.fillStyle=NAVY;x.beginPath();x.arc(xm,0,r*.12,0,TAU);x.fill();continue}
else if(m.k==='sq3'){const ms=m.s||1;for(let k=2;k>=0;k--){sailShape(x,xm+k*r*.13*ms,Wd*ms,r*ms,1.3-k*.22);x.fillStyle=k?'rgba(0,0,0,.08)':sail;x.fill();if(!k)patt(x,xm,r*ms,Wd*ms,o);if(k){x.fillStyle=sail;x.globalAlpha*=.9;x.fill();x.globalAlpha/=.9}x.strokeStyle='rgba(122,74,36,.55)';x.lineWidth=1;x.stroke()}}
else if(m.k==='stripe'){sailShape(x,xm,Wd,r,1.6,1.3);x.fillStyle=sail;x.fill();x.save();x.clip();x.fillStyle='#c0392b';for(let j=-3;j<=3;j+=2)x.fillRect(xm-r,j*Wd*.4-Wd*.2,r*2,Wd*.4);x.restore();sailShape(x,xm,Wd,r,1.6,1.3);x.strokeStyle='rgba(122,74,36,.6)';x.lineWidth=1;x.stroke()}
else{sailShape(x,xm,Wd,r,1.3);x.fillStyle=m.k==='jq'?'#ff9f43':sail;x.fill();if(m.k!=='jq')patt(x,xm,r,Wd,o);
if(m.k==='jq'){x.strokeStyle='#b84030';x.lineWidth=1.5;for(let j=-2;j<=2;j++){x.beginPath();x.moveTo(xm+r*.05,j*Wd*.45);x.lineTo(xm+r*.4,j*Wd*.4);x.stroke()}}}
const yw=(m.k==='stripe'?1.6:1.3)*(m.s||1);x.strokeStyle=WOOD;x.lineWidth=Math.max(2,r*.08);x.beginPath();x.moveTo(xm,-Wd*yw);x.lineTo(xm,Wd*yw);x.stroke();
x.fillStyle=NAVY;x.beginPath();x.arc(xm,0,r*.12,0,TAU);x.fill()}
drawArms(x,c,c.key,L,Wd,r,ar);
if(c.ghost)x.restore();
if(c.turs)for(const tu of c.turs){if(tu.hi){x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=r*.35;x.shadowOffsetX=r*.12;x.shadowOffsetY=r*.12;turretN(x,tu.x*L,(tu.y||0)*Wd,ar,r,tu.n,tu.s||1,tu.m);x.restore()}else turretN(x,tu.x*L,(tu.y||0)*Wd,ar,r,tu.n,tu.s||1,tu.m)}
if(c.plane){const px=-L*.56;x.save();x.translate(px,0);x.scale(.72,.72);x.translate(-px,0);x.strokeStyle='#2f3640';x.lineWidth=Math.max(1.5,r*.06);x.beginPath();x.moveTo(px-r*.4,0);x.lineTo(px+r*.5,0);x.stroke();x.fillStyle='#e8edf2';x.strokeStyle=NAVY;x.lineWidth=1.2;x.beginPath();x.ellipse(px,0,r*.42,r*.09,0,0,TAU);x.fill();x.stroke();x.beginPath();x.roundRect(px+r*.02,-r*.5,r*.18,r*1,r*.06);x.fill();x.stroke();x.beginPath();x.roundRect(px-r*.38,-r*.18,r*.1,r*.36,r*.04);x.fill();x.stroke();x.fillStyle='#ff6b57';for(const s of [-1,1]){x.beginPath();x.arc(px+r*.11,s*r*.32,r*.06,0,TAU);x.fill()}x.restore()}
if(c.tur){const ps=({1:[L*.25],2:[L*.42,-L*.42],3:[L*.5,0,-L*.5]})[c.tur];ps.forEach(px=>c.t>=3?turret(x,px,ar,r):gun(x,px,ar,r,.85,.14))}
if(c.crown){x.fillStyle='#ffcf3f';x.strokeStyle='#a8741a';x.lineWidth=2;const cx=-L*.45;x.beginPath();x.moveTo(cx-r*.15,-r*.3);x.lineTo(cx+r*.25,-r*.3);x.lineTo(cx+r*.1,-r*.1);x.lineTo(cx+r*.3,0);x.lineTo(cx+r*.1,r*.1);x.lineTo(cx+r*.25,r*.3);x.lineTo(cx-r*.15,r*.3);x.closePath();x.fill();x.stroke()}}

// ——— Dessin du décor et du butin ———
function drawRock(k){if(k.k==='ile'){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.arc(k.x,k.y,k.r+30,0,TAU);g.fill();g.fillStyle='#f4d58d';g.beginPath();g.arc(k.x,k.y,k.r+8,0,TAU);g.fill()}
else{g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(k.x,k.y,k.r+6+Math.sin(T*2+k.ph)*2,0,TAU);g.fill()}}
function drawRockTop(k){if(k.k==='ile'){g.fillStyle='#4fc28a';g.beginPath();g.arc(k.x,k.y,k.r*.82,0,TAU);g.fill();g.fillStyle='#3aa874';g.beginPath();g.arc(k.x-k.r*.15,k.y-k.r*.1,k.r*.5,0,TAU);g.fill();
for(let i=0;i<3;i++){const a=k.ph+i*2.1,px=k.x+Math.cos(a)*k.r*.45,py=k.y+Math.sin(a)*k.r*.45;g.fillStyle='#2f8f5f';for(let j=0;j<5;j++){const b=j/5*TAU+T*.2;g.beginPath();g.ellipse(px+Math.cos(b)*9,py+Math.sin(b)*9,10,4,b,0,TAU);g.fill()}g.fillStyle=WOOD;g.beginPath();g.arc(px,py,3.5,0,TAU);g.fill()}}
else{g.fillStyle='#8d7b68';g.strokeStyle='#5f5245';g.lineWidth=2;g.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,q=k.r*(.8+.2*Math.sin(k.ph*3+i*1.7));i?g.lineTo(k.x+Math.cos(a)*q,k.y+Math.sin(a)*q):g.moveTo(k.x+Math.cos(a)*q,k.y+Math.sin(a)*q)}g.closePath();g.fill();g.stroke()}}
const GHC={};const ghostC=k=>GHC[k]||(GHC[k]=Object.assign({},CL[k],{ghost:1}));
// coffre de pirate vu de face : planches de bois, couvercle bombé cerclé d'or, coins renforcés et serrure
function drawChest(r,open,hitc){const w=r*1.25,bt=r*.8,mid=-r*.05,top=-r*.95,dark='#3b220f';
const wood=(y0,y1,a,b)=>{if(hitc)return '#fff';const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr};
g.fillStyle='rgba(11,61,107,.28)';g.beginPath();g.ellipse(0,bt+r*.05,w*1.15,r*.22,0,0,TAU);g.fill();
g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.5;g.beginPath();g.ellipse(0,bt+r*.05,w*1.2,r*.24,0,.15,Math.PI-.15);g.stroke();
g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle=dark;
// caisse
g.fillStyle=wood(mid,bt,'#a0673a','#6a3f1d');g.beginPath();g.roundRect(-w,mid,w*2,bt-mid,r*.08);g.fill();g.stroke();
g.strokeStyle='rgba(59,34,15,.6)';g.lineWidth=1.3;for(const q of [.34,.67]){const y=mid+(bt-mid)*q;g.beginPath();g.moveTo(-w+2,y);g.lineTo(w-2,y);g.stroke()}
// couvercle (entrouvert pour le trésor, avec l'or qui déborde)
const lift=open?r*.35:0,ly=mid-lift,dome=(x)=>ly-(ly-top+lift*.2)*Math.sqrt(Math.max(0,1-(x/w)**2));
if(open){g.fillStyle=hitc?'#fff':'#2a1608';g.fillRect(-w*.95,ly,w*1.9,mid-ly+2);g.fillStyle='#ffd84a';g.beginPath();g.moveTo(-w*.9,mid+1);g.quadraticCurveTo(0,mid-r*.55,w*.9,mid+1);g.fill();
g.fillStyle='#fff3b0';for(const [cx,cy] of [[-w*.45,mid-r*.12],[w*.05,mid-r*.28],[w*.5,mid-r*.1]]){g.beginPath();g.arc(cx,cy,r*.09,0,TAU);g.fill()}}
g.fillStyle=wood(top,ly,'#b8794a','#7a4a24');g.strokeStyle=dark;g.lineWidth=2.5;g.beginPath();g.moveTo(-w,ly);for(let k=0;k<=12;k++){const x=-w+k/6*w;g.lineTo(x,dome(x))}g.lineTo(w,ly);g.closePath();g.fill();g.stroke();
g.strokeStyle='rgba(59,34,15,.55)';g.lineWidth=1.2;for(const f of [.45,.75]){g.beginPath();for(let k=0;k<=12;k++){const x=-w+k/6*w,y=ly-(ly-dome(x))*f;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
g.strokeStyle='rgba(255,236,200,.45)';g.lineWidth=2;g.beginPath();for(let k=2;k<=6;k++){const x=-w+k/6*w,y=dome(x)+r*.12;k>2?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
// ferrures dorées
const gold=hitc?'#fff':'#f0c24a',gs='#8a5d12';g.fillStyle=gold;g.strokeStyle=gs;g.lineWidth=1.4;
for(const bx of [-w*.58,w*.58]){const hw=r*.12;g.beginPath();g.rect(bx-hw,mid,hw*2,bt-mid);g.fill();g.stroke();g.beginPath();g.moveTo(bx-hw,ly);g.lineTo(bx-hw,dome(bx-hw));g.lineTo(bx+hw,dome(bx+hw));g.lineTo(bx+hw,ly);g.closePath();g.fill();g.stroke()}
g.beginPath();g.rect(-w,mid-r*.06,w*2,r*.13);g.fill();g.stroke();g.beginPath();g.rect(-w,ly-r*.06,w*2,r*.12);g.fill();g.stroke();
for(const sx of [-1,1]){g.beginPath();g.moveTo(sx*w,bt);g.lineTo(sx*(w-r*.38),bt);g.lineTo(sx*(w-r*.38),bt-r*.12);g.lineTo(sx*(w-r*.12),bt-r*.12);g.lineTo(sx*(w-r*.12),bt-r*.38);g.lineTo(sx*w,bt-r*.38);g.closePath();g.fill();g.stroke()}
// serrure
g.beginPath();g.moveTo(-r*.22,mid-r*.1);g.lineTo(r*.22,mid-r*.1);g.lineTo(r*.22,mid+r*.22);g.lineTo(0,mid+r*.38);g.lineTo(-r*.22,mid+r*.22);g.closePath();g.fill();g.stroke();
g.fillStyle=dark;g.beginPath();g.arc(0,mid+r*.06,r*.065,0,TAU);g.fill();g.beginPath();g.moveTo(-r*.04,mid+r*.08);g.lineTo(r*.04,mid+r*.08);g.lineTo(r*.025,mid+r*.24);g.lineTo(-r*.025,mid+r*.24);g.closePath();g.fill();
g.fillStyle='#fff6d0';for(const [cx,cy] of [[-w*.58,bt-r*.12],[w*.58,bt-r*.12],[-w*.58,mid+r*.15],[w*.58,mid+r*.15]]){g.beginPath();g.arc(cx,cy,r*.04,0,TAU);g.fill()}}
function drawLoot(l,d){const D=LT[l.k],ph=(l.i*2.399)%TAU,sp=cl((T-d.born)*2,0,1),hitc=l.fl,fade=l.lf!==undefined&&(l.k==='epave'||l.k==='planche')?cl(l.lf/3,0,1):1,r=D.r*(.4+.6*sp)*(1+Math.sin(T*2+ph)*.04),X=d.x,Y=d.y;
g.save();g.globalAlpha=fade;g.translate(X,Y);
// petits objets : ils flottent (léger roulis et vague autour) ; désactivé en qualité réduite
const fl=!lowQ&&(l.k==='tonneau'||l.k==='caisse'||l.k==='coffre'||l.k==='epave'||l.k==='planche'),wv=Math.sin(T*1.8+ph);
if(l.k!=='kraken'&&l.k!=='serpent'&&l.k!=='coffre'&&l.k!=='tresor'){g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(0,0,r*(1.35+(fl?wv*.07:0)),0,TAU);g.fill()}
if(fl)g.translate(0,wv*1.6);
g.rotate(d.a+(fl?Math.sin(T*1.3+ph*1.7)*.09:0));
if(l.k==='tonneau'||l.k==='epave'){g.fillStyle=hitc?'#fff':l.k==='epave'?'#8f5a2e':'#b5713a';g.strokeStyle='#6b3d1c';g.lineWidth=3;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.stroke();g.strokeStyle=l.tn||'#6b3d1c';g.beginPath();g.arc(0,0,r*.55,0,TAU);g.stroke();g.fillStyle='#6b3d1c';g.beginPath();g.arc(0,0,r*.15,0,TAU);g.fill()}
else if(l.k==='planche'){g.rotate(-d.a);g.fillStyle='rgba(91,227,161,'+(.22+.12*Math.sin(T*3+ph))+')';g.beginPath();g.arc(0,0,r*1.7,0,TAU);g.fill();g.rotate(d.a);for(const [oy,rot] of [[-r*.45,-.12],[0,.08],[r*.45,-.05]]){g.save();g.translate(0,oy);g.rotate(rot);g.fillStyle=hitc?'#fff':'#c98a4b';g.strokeStyle='#6b3d1c';g.lineWidth=2;g.beginPath();g.roundRect(-r*1.1,-r*.2,r*2.2,r*.4,2);g.fill();g.stroke();g.fillStyle='#6b3d1c';g.beginPath();g.arc(-r*.8,0,r*.06,0,TAU);g.arc(r*.8,0,r*.06,0,TAU);g.fill();g.restore()}g.rotate(-d.a);g.fillStyle='#5be3a1';g.strokeStyle='#fff';g.lineWidth=2;const cw=r*.22,cs=r*.6;g.beginPath();g.rect(-cw,-cs,cw*2,cs*2);g.rect(-cs,-cw,cs*2,cw*2);g.fill();g.fillRect(-cw,-cs,cw*2,cs*2)}
else if(l.k==='caisse'){g.fillStyle=hitc?'#fff':'#e0a458';g.strokeStyle='#8a5a2b';g.lineWidth=3;g.beginPath();g.roundRect(-r,-r,r*2,r*2,3);g.fill();g.stroke();g.beginPath();g.moveTo(-r,-r);g.lineTo(r,r);g.moveTo(r,-r);g.lineTo(-r,r);g.stroke()}
else if(l.k==='coffre'||l.k==='tresor'){if(l.k==='tresor'){g.fillStyle='rgba(255,207,63,'+(.25+.15*Math.sin(T*3))+')';g.beginPath();g.arc(0,0,r*2.1,0,TAU);g.fill()}
g.rotate(-d.a);drawChest(r,l.k==='tresor',hitc);
const tw=(Math.sin(T*4+ph)+1)/2;g.fillStyle='rgba(255,255,255,'+tw+')';const sx=r*.9,sy=-r*.9,ss=r*.45*tw;g.beginPath();g.moveTo(sx,sy-ss);g.lineTo(sx+ss*.25,sy);g.lineTo(sx,sy+ss);g.lineTo(sx-ss*.25,sy);g.closePath();g.fill();g.beginPath();g.moveTo(sx-ss,sy);g.lineTo(sx,sy+ss*.25);g.lineTo(sx+ss,sy);g.lineTo(sx,sy-ss*.25);g.fill()}
else if(l.k==='serpent'){g.fillStyle=hitc?'#fff':'#3fbf7f';g.strokeStyle='#1d6b47';g.lineWidth=4;g.beginPath();g.ellipse(0,0,r*1.15,r*.8,0,0,TAU);g.fill();g.stroke();const jw=.25+.2*Math.max(0,Math.sin(T*6));g.fillStyle='#8a1f2b';g.beginPath();g.moveTo(r*.6,0);g.lineTo(r*1.5,-r*jw*2);g.lineTo(r*1.5,r*jw*2);g.closePath();g.fill();g.fillStyle='#fff8e7';for(const s of [-1,1]){g.beginPath();g.arc(r*.35,s*r*.42,r*.2,0,TAU);g.fill()}g.fillStyle='#111';for(const s of [-1,1]){g.beginPath();g.arc(r*.42,s*r*.42,r*.1,0,TAU);g.fill()}g.strokeStyle='#ffcf3f';g.lineWidth=3;for(const s of [-1,1]){g.beginPath();g.moveTo(-r*.3,s*r*.6);g.lineTo(-r*1,s*r*1.1);g.stroke()}}
else if(l.k==='kraken'){g.lineCap='round';for(let i=0;i<8;i++){const a=i/8*TAU+Math.sin(T+i)*.2,L2=r*(1.7+.35*Math.sin(T*2+i)),c1=a+Math.sin(T*1.5+i)*.6,e=a+.35*Math.sin(T+i);
g.strokeStyle=hitc?'#fff':'#7a4fb3';g.lineWidth=r*.3;g.beginPath();g.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.6);g.quadraticCurveTo(Math.cos(c1)*L2*.7,Math.sin(c1)*L2*.7,Math.cos(e)*L2,Math.sin(e)*L2);g.stroke();
g.fillStyle='#c9a6ff';for(let j=1;j<4;j++){const q=j/4;g.beginPath();g.arc(Math.cos(c1*(1-q)+e*q)*L2*(.4+q*.55),Math.sin(c1*(1-q)+e*q)*L2*(.4+q*.55),r*.06,0,TAU);g.fill()}}
g.fillStyle=hitc?'#fff':'#5b3a8c';g.strokeStyle='#c9a6ff';g.lineWidth=4;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.stroke();
for(const s of [-1,1]){g.fillStyle=CREAM;g.beginPath();g.arc(r*.35,s*r*.32,r*.2,0,TAU);g.fill();g.fillStyle=NAVY;g.beginPath();g.arc(r*.42,s*r*.32,r*.1,0,TAU);g.fill()}}
else{for(let k=1;k<3;k++){g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.arc(-r*(1.2+k*.8),0,r*.3/k,0,TAU);g.fill()}ship(g,D.sh,r,hitc?'#fff':l.cv?'#e8b04a':D.col,0,T,l.cv?{flag:'anchor'}:null)}
g.restore();
const nm=l.cv?tr('convoy'):D.nm&&l.k!=='coffre'?I.loot(l.k):'';if(nm){g.textAlign='center';g.fillStyle='rgba(255,248,231,.9)';g.font='600 '+(l.k==='kraken'?18:13)+'px "Baloo 2",system-ui,sans-serif';g.fillText(nm,X,Y-r*(l.k==='kraken'?2:1)-14)}
if(l.h<l.H&&l.k!=='epave'&&l.k!=='planche'){const hw=l.k==='kraken'?70:r,y=Y-r*(l.k==='kraken'?2:1)-10;g.fillStyle='rgba(11,61,107,.6)';g.fillRect(X-hw,y,hw*2,5);g.fillStyle=l.k==='kraken'?'#c9a6ff':'#ffcf3f';g.fillRect(X-hw,y,hw*2*Math.max(0,l.h/l.H),5)}}
// flèches vers les objectifs hors de l'écran : seules les 3 plus proches sont dessinées
let arrQ=[];function edgeArrow(x,y,col,label){arrQ.push([Math.hypot(x-cam.x,y-cam.y),x,y,col,label])}
function flushArrows(){const z=zoom();arrQ=arrQ.filter(([,x,y])=>{const sx=W/2+(x-cam.x)*z,sy=H/2+(y-cam.y)*z;return !(sx>20&&sx<W-20&&sy>20&&sy<H-20)}).sort((a,b)=>a[0]-b[0]).slice(0,3);for(const [,x,y,col,label] of arrQ)drawArrow(x,y,col,label);arrQ=[]}
function drawArrow(x,y,col,label){const z=zoom(),sx=W/2+(x-cam.x)*z,sy=H/2+(y-cam.y)*z;if(sx>20&&sx<W-20&&sy>20&&sy<H-20)return;
const a=Math.atan2(sy-H/2,sx-W/2),m=50,ex=cl(W/2+Math.cos(a)*W,m,W-m),mmS=Math.min(220,Math.max(120,Math.min(W,H)*.3)),top=ex<mmS+60?mmS+60:ex>W-230&&!touchMode?380:m+120,ey=cl(H/2+Math.sin(a)*H,Math.min(top,H/2),H-m-110),pu=1+Math.sin(T*5)*.12,dist=Math.round(Math.hypot(x-cam.x,y-cam.y)/10)*10;
// flèche plus grande qui pulse, avec le nom de l'objectif et sa distance
g.save();g.translate(ex,ey);g.fillStyle='rgba(11,61,107,.55)';g.beginPath();g.arc(0,0,21,0,TAU);g.fill();g.rotate(a);g.scale(pu,pu);g.fillStyle=col;g.strokeStyle=NAVY;g.lineWidth=3;g.beginPath();g.moveTo(19,0);g.lineTo(-11,-13);g.lineTo(-5,0);g.lineTo(-11,13);g.closePath();g.fill();g.stroke();g.restore();
g.font='800 13px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(11,61,107,.85)';const ly=ey+(ey>H/2?-34:36);g.strokeText(label,ex,ly);g.fillStyle=col;g.fillText(label,ex,ly);g.font='700 11px system-ui,sans-serif';g.strokeText(dist+' m',ex,ly+14);g.fillStyle=CREAM;g.fillText(dist+' m',ex,ly+14)}

