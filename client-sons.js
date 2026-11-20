// RivalSea – Sons fabriqués par le navigateur
'use strict';
// ——— Sons : tout est fabriqué par le navigateur (aucun fichier à télécharger) ———
const SND=(()=>{let ac=null,out=null,muted=false,nb=null;const last={};try{muted=localStorage.getItem('rs-mute')==='1'}catch(e){}
function init(){if(ac){if(ac.state==='suspended')ac.resume();return}try{ac=new(window.AudioContext||window.webkitAudioContext)();out=ac.createGain();out.gain.value=muted?0:.55;out.connect(ac.destination);
nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;sea()}catch(e){ac=null}}
function env(g,t,a,d,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function noise(dur,freq,v,type,q,sweep){const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nb;s.loop=true;f.type=type||'lowpass';f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);f.Q.value=q||1;env(g,t,.005,dur,v);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random());s.stop(t+dur+.05)}
function tone(f0,f1,dur,v,type,delay){const t=ac.currentTime+(delay||0),o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);env(g,t,.008,dur,v);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05)}
function sea(){const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();s.buffer=nb;s.loop=true;f.type='lowpass';f.frequency.value=420;g.gain.value=.035;l.frequency.value=.13;lg.gain.value=.025;l.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(out);s.start();l.start()}
const P={arrow:v=>{tone(700,380,.09,.12*v,'triangle');noise(.05,3000,.05*v,'highpass')},bolt:v=>{tone(260,120,.12,.16*v,'triangle');noise(.08,1500,.08*v,'bandpass',2)},
bullet:v=>noise(.05,2600,.13*v,'bandpass',1.5),ball:v=>{noise(.32,700,.32*v,'lowpass',1,120);tone(95,45,.22,.25*v)},shell:v=>{noise(.4,500,.28*v,'lowpass',1,90);tone(70,35,.3,.22*v)},
torp:v=>noise(.45,300,.18*v,'bandpass',3,1400),fire:v=>{noise(.3,700,.16*v,'bandpass',1.2,250);tone(220,110,.1,.06*v,'triangle')},rocket:v=>noise(.35,3000,.09*v,'bandpass',1,700),boom:v=>{noise(.8,900,.5*v,'lowpass',1,60);tone(60,28,.6,.35*v)},hit:v=>{tone(180,90,.09,.22*v,'square');noise(.06,1200,.12*v)},
coin:v=>{tone(1320,0,.07,.07*v,'triangle');tone(1760,0,.09,.06*v,'triangle',.06)},ram:v=>{noise(.25,300,.4*v,'lowpass',1,80);tone(110,55,.2,.3*v,'square')},
lvl:v=>[523,659,784].forEach((f,i)=>tone(f,0,.18,.13*v,'triangle',i*.09)),evo:v=>[392,523,659,784,1047].forEach((f,i)=>tone(f,0,.3,.14*v,'triangle',i*.1)),
skill:v=>tone(300,900,.25,.12*v,'sawtooth'),sink:v=>{P.boom(v);tone(220,55,1,.12*v,'sawtooth')}};
return{init,play(k,v,gap){if(!ac||muted||!P[k])return;v=v===undefined?1:v;if(v<=.03)return;const n=performance.now();if(n-(last[k]||0)<(gap||45))return;last[k]=n;try{P[k](Math.min(1,v))}catch(e){}},
toggle(){muted=!muted;try{localStorage.setItem('rs-mute',muted?'1':'0')}catch(e){}if(out)out.gain.value=muted?0:.55},get muted(){return muted}}})();
addEventListener('pointerdown',()=>SND.init(),true);addEventListener('keydown',e=>{SND.init();if(e.code==='KeyM'&&e.target.tagName!=='INPUT')SND.toggle()},true);
const vol=(x,y)=>Math.max(0,1-Math.hypot(x-cam.x,y-cam.y)/1100);

