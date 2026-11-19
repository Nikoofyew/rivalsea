// Données communes au serveur (Node.js) et au navigateur : navires, butin, bonus, compétences.
// Modifier une valeur ici change le jeu des deux côtés.
(function (root) {
'use strict';
const WS = 3400, TAU = Math.PI * 2, EVO = [5, 10, 15, 20], SEE = 130;
const CREAM = '#fff8e7', NAVY = '#0b3d6b', WOOD = '#7a4a24';
const COLS = ['#ff6b57', '#ffcf3f', '#8b5cf6', '#5be3a1', '#ff8fc7', '#ff9f43', '#4dabf7'];
const HULLS = [['#ff6b57', 'Corail'], ['#ffcf3f', 'Soleil'], ['#8b5cf6', 'Lavande'], ['#5be3a1', 'Menthe'], ['#ff8fc7', 'Rose'], ['#ff9f43', 'Orange'], ['#4dabf7', 'Azur'], ['#5c6b80', 'Ardoise']];
const SAILS = [['#fff8e7', 'Crème'], ['#2b2b2b', 'Noir'], ['#ff6b57', 'Rouge'], ['#4dabf7', 'Bleu'], ['#ffcf3f', 'Or']];
const FLAGS = { skull: '☠', star: '★', anchor: '⚓', heart: '♥', none: '' };
const TEAMS = [{ n: 'Rouges', col: '#ff6b57' }, { n: 'Jaunes', col: '#ffcf3f' }, { n: 'Violets', col: '#8b5cf6' }, { n: 'Verts', col: '#5be3a1' }];
const NAMES = ['Mouette', 'Corsaire', 'Cabotin', 'Marée', 'Tempête', 'Sardine', 'Albatros', 'Boussole', 'Écume', 'Pinson', 'Tribord', 'Hublot', 'Goéland', 'Typhon', 'Crabe', 'Bigorneau'];

// Compétences spéciales (cd = recharge en secondes)
const SK = {
  boost: { n: 'Accélération', ab: 'Vite', cd: 10, d: 'Vitesse ×1,7 pendant 2,5 s' },
  smoke: { n: 'Fumigène', ab: 'Fumée', cd: 16, d: 'Crée un banc de brouillard pendant 8 s' },
  repair: { n: 'Réparation', ab: 'Répare', cd: 18, d: 'Rend 35 % des points de vie' },
  salvo: { n: 'Bordée concentrée', ab: 'Salve', cd: 12, d: 'Salve immédiate : +2 projectiles, dégâts ×1,6' }
};

// Arbre des navires. t = palier (0 à 4), évolutions aux niveaux 5, 10, 15 et 20.
// w = arme : n projectiles, sp écart angulaire, par écart parallèle, v vitesse, sz taille, dmg dégâts,
// rate secondes entre deux tirs, rng portée, tg nombre de cibles, spl rayon d'explosion, bs tir sur les flancs.
const CL = {
chaloupe:{n:'Chaloupe',t:0,d:'Petite barque à rames.',w:{nm:'Fusil',n:1,v:620,sz:3,dmg:8,rate:.45,rng:240,tg:1},hp:1,spd:1.05,sz:.85,L:1.2,Wd:.7,masts:[],oars:1,sk:'boost',next:['cotre','sloop','pirogue']},
cotre:{n:'Cotre',t:1,d:'Gerbe de plombs à courte portée.',w:{nm:'Tromblon',n:5,sp:.13,v:480,sz:3,dmg:5,rate:.85,rng:200,tg:1},hp:1.2,spd:1.05,sz:1,L:1.4,Wd:.78,masts:[{x:.05,k:'tri'}],sk:'smoke',next:['brick','caravelle']},
sloop:{n:'Sloop',t:1,d:'Un canon de proue lourd et précis.',w:{nm:'Canon de proue',n:1,v:470,sz:6,dmg:30,rate:1,rng:310,tg:1},hp:1.3,spd:.95,sz:1.05,L:1.5,Wd:.78,masts:[{x:-.1,k:'tri'}],bow:1,sk:'repair',next:['fregate','bombarde']},
pirogue:{n:'Pirogue de course',t:1,d:'Très rapide, cadence de tir élevée.',w:{nm:'Fusils jumeaux',n:2,par:10,v:680,sz:3,dmg:6,rate:.28,rng:260,tg:1},hp:.95,spd:1.25,sz:.9,L:1.8,Wd:.5,masts:[{x:0,k:'tri'}],outrig:1,sk:'boost',next:['goelette','jonque']},
brick:{n:'Brick',t:2,d:'Mitraille en éventail, terrible de près.',w:{nm:'Mitraille',n:8,sp:.1,v:500,sz:3.5,dmg:6,rate:.8,rng:230,tg:1},hp:1.55,spd:.88,sz:1.2,L:1.55,Wd:.8,masts:[{x:.3,k:'sq'},{x:-.3,k:'sq'}],ports:3,sk:'smoke',next:['galion','caraque']},
caravelle:{n:'Caravelle',t:2,d:'Deux tromblons, deux cibles à la fois.',w:{nm:'Double tromblon',n:4,sp:.14,v:490,sz:3,dmg:8.5,rate:.8,rng:220,tg:2},hp:1.45,spd:.95,sz:1.15,L:1.5,Wd:.78,masts:[{x:.35,k:'tri'},{x:-.15,k:'tri'}],ports:1,sk:'smoke',next:['caraque','clipper']},
fregate:{n:'Frégate',t:2,d:'Tire sur les côtés : présentez le flanc à la cible.',w:{nm:'Bordées',n:3,par:12,v:500,sz:6,dmg:19,rate:.95,rng:340,tg:2,bs:1},hp:1.6,spd:.85,sz:1.25,L:1.65,Wd:.72,masts:[{x:.4,k:'sq'},{x:-.05,k:'sq'},{x:-.45,k:'sq'}],ports:3,sk:'salvo',next:['galion','vaisseau']},
bombarde:{n:'Bombarde',t:2,d:'Obus lent qui explose en zone.',w:{nm:'Mortier',n:1,v:360,sz:9,dmg:46,rate:1.6,rng:380,tg:1,spl:70},hp:1.6,spd:.78,sz:1.2,L:1.35,Wd:.88,masts:[{x:-.4,k:'tri'}],tur:1,sk:'repair',next:['vaisseau','cuirasse']},
goelette:{n:'Goélette',t:2,d:'Trois fusils, cadence infernale.',w:{nm:'Fusils en batterie',n:3,par:9,v:700,sz:3,dmg:6,rate:.2,rng:280,tg:1},hp:1.2,spd:1.15,sz:1.05,L:1.85,Wd:.55,masts:[{x:.25,k:'tri'},{x:-.25,k:'tri'}],sk:'boost',next:['clipper','caraque']},
jonque:{n:'Jonque',t:2,d:'Fusées qui visent trois cibles.',w:{nm:'Fusées',n:1,v:560,sz:4,dmg:17,rate:.55,rng:300,tg:3},hp:1.35,spd:1,sz:1.15,L:1.5,Wd:.82,masts:[{x:.3,k:'jq'},{x:-.2,k:'jq'}],sk:'smoke',next:['clipper','cuirasse']},
galion:{n:'Grand galion',t:3,d:'Deux batteries latérales de quatre canons.',w:{nm:'Batteries',n:4,par:11,v:500,sz:6.5,dmg:16,rate:.9,rng:360,tg:2,bs:1},hp:2.1,spd:.66,sz:1.5,L:1.75,Wd:.85,masts:[{x:.45,k:'sq'},{x:.05,k:'sq'},{x:-.4,k:'sq'}],ports:5,sk:'salvo',next:['galionroyal','fantome']},
caraque:{n:'Caraque',t:3,d:'Coque épaisse, mitraille sur deux cibles.',w:{nm:'Mitraille double',n:6,sp:.1,v:540,sz:3.5,dmg:9.5,rate:.7,rng:285,tg:2},hp:2.5,spd:.7,sz:1.45,L:1.55,Wd:.92,masts:[{x:.35,k:'sq'},{x:-.1,k:'sq'},{x:-.5,k:'tri'}],ports:3,sk:'repair',next:['galionroyal','forteresse']},
vaisseau:{n:'Vaisseau de ligne',t:3,d:'Bordées de gros canons à très longue portée.',w:{nm:'Canons lourds',n:3,par:14,v:520,sz:7.5,dmg:25,rate:1.1,rng:360,tg:2,bs:1},hp:2.1,spd:.62,sz:1.55,L:1.8,Wd:.8,masts:[{x:.45,k:'sq'},{x:0,k:'sq'},{x:-.45,k:'sq'}],ports:6,sk:'salvo',next:['galionroyal','dreadnought']},
clipper:{n:'Clipper',t:3,d:'Le plus rapide des grands voiliers, mais fragile.',w:{nm:'Fusils à répétition',n:2,par:9,v:760,sz:3.5,dmg:8.5,rate:.14,rng:300,tg:2},hp:1.75,spd:1.15,sz:1.25,L:2,Wd:.52,masts:[{x:.4,k:'sq'},{x:0,k:'sq'},{x:-.4,k:'sq'}],sk:'boost',next:['tempete','fantome']},
cuirasse:{n:'Cuirassé à vapeur',t:3,d:'Deux tourelles de mortiers lourds.',w:{nm:'Mortiers lourds',n:2,par:14,v:390,sz:10,dmg:58,rate:1.5,rng:420,tg:2,spl:95},hp:2.3,spd:.66,sz:1.45,L:1.7,Wd:.78,masts:[],tur:2,stack:1,sk:'repair',next:['dreadnought','forteresse']},
galionroyal:{n:'Galion royal',t:4,leg:1,d:'Bordées de quatre canons sur trois cibles.',w:{nm:'Batteries royales',n:4,par:11,v:520,sz:7,dmg:14,rate:.85,rng:380,tg:3,bs:1},hp:2.5,spd:.56,sz:1.75,L:1.85,Wd:.88,masts:[{x:.55,k:'sq'},{x:.2,k:'sq'},{x:-.15,k:'sq'},{x:-.5,k:'sq'}],ports:6,crown:1,sk:'salvo',next:[]},
fantome:{n:'Vaisseau fantôme',t:4,leg:1,d:'Se répare tout seul et peut encore se cacher dans le brouillard.',w:{nm:'Canons spectraux',n:3,sp:.12,v:560,sz:5,dmg:18,rate:.7,rng:340,tg:2},hp:2.2,spd:.85,sz:1.55,L:1.75,Wd:.78,masts:[{x:.4,k:'rag'},{x:0,k:'rag'},{x:-.4,k:'rag'}],ports:4,ghost:1,reg:12,sk:'smoke',next:[]},
forteresse:{n:'Forteresse flottante',t:4,leg:1,d:'Trois tourelles de mortiers, énorme coque, très lente.',w:{nm:'Triple mortier',n:2,par:14,v:390,sz:10,dmg:62,rate:1.5,rng:440,tg:3,spl:90},hp:3.1,spd:.48,sz:1.8,L:1.45,Wd:1.05,masts:[],tur:3,ports:4,sk:'repair',next:[]},
tempete:{n:'Clipper des tempêtes',t:4,leg:1,d:'Vitesse folle, trois fusils sur deux cibles.',w:{nm:'Fusils-tonnerre',n:3,par:9,v:820,sz:3.8,dmg:6,rate:.13,rng:310,tg:2},hp:1.7,spd:1.2,sz:1.4,L:2.1,Wd:.5,masts:[{x:.45,k:'sq'},{x:.1,k:'sq'},{x:-.25,k:'sq'},{x:-.55,k:'tri'}],sk:'boost',next:[]},
dreadnought:{n:'Dreadnought',t:4,leg:1,d:'Doubles obus explosifs sur trois cibles.',w:{nm:'Tourelles lourdes',n:2,par:16,v:390,sz:10,dmg:48,rate:1.5,rng:450,tg:3,spl:80},hp:2.9,spd:.6,sz:1.7,L:1.85,Wd:.72,masts:[],tur:2,stack:1,sk:'salvo',next:[]}
};

// Butin et créatures. n = nombre présent en permanence sur la carte.
const LT = {
  tonneau: { hp: 12, xp: 18, r: 12, n: 60 },
  caisse: { hp: 30, xp: 40, r: 15, n: 20 },
  coffre: { hp: 70, xp: 120, r: 16, n: 4 },
  peche: { hp: 30, xp: 55, r: 14, n: 9, mv: 120, nm: 'Pêcheur', col: '#4dabf7', sh: { L: 1.3, Wd: .6, masts: [{ x: .05, k: 'tri' }] } },
  marchand: { hp: 120, xp: 180, r: 22, n: 3, mv: 85, nm: 'Marchand', col: '#c98a4b', sh: { L: 1.5, Wd: .85, masts: [{ x: .3, k: 'sq' }, { x: -.25, k: 'sq' }], ports: 2 } },
  epave: { hp: 8, xp: 0, r: 11, n: 0 },
  planche: { hp: 10, xp: 0, r: 15, n: 0, heal: .2 },   // planches de réparation : rares, soignent 20 % de la vie
  tresor: { hp: 450, xp: 1000, r: 28, n: 0, nm: 'Trésor' },
  kraken: { hp: 1400, xp: 1500, r: 52, n: 0, nm: 'Kraken' }
};

const BON = [
  { n: 'Canons légers', d: 'Cadence de tir +20 %', f: s => s.rate *= .83 },
  { n: 'Gros calibre', d: 'Dégâts +25 %', f: s => s.dmg *= 1.25 },
  { n: 'Voiles neuves', d: 'Vitesse +10 %', f: s => s.spd *= 1.1, ok: s => s.spd < 1.3 },
  { n: 'Longue-vue', d: 'Portée +15 %', f: s => s.rng *= 1.15, ok: s => s.rng < 1.6 },
  { n: 'Coque renforcée', d: '+30 points de vie max', f: s => s.hp += 30 },
  { n: 'Salve multiple', d: 'Un projectile de plus par tir', f: s => s.multi++, ok: s => s.multi < 2 },
  { n: 'Charpentier', d: 'Répare 2 % de la vie max par seconde', f: s => s.reg += 2, ok: s => s.reg < 4 },
  { n: 'Filets de récupération', d: 'XP des épaves et tonneaux +30 %', f: s => s.loot *= 1.3 },
  { n: 'Éperon de proue', d: 'Dégâts d’éperonnage +50 %', f: s => s.ram *= 1.5 },
  { n: 'Maître d’équipage', d: 'Compétence spéciale prête 25 % plus vite', f: s => s.skr *= .75, ok: s => s.skr > .45 }
];

const rnd = (a, b) => a + Math.random() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1)), cl = (v, a, b) => Math.max(a, Math.min(b, v)), pick = a => a[ri(0, a.length - 1)];
const angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const R = (lvl, c) => (13 + Math.min(lvl, 30) * .7) * CL[c].sz;       // rayon d'un navire
const need = lvl => Math.round(55 * Math.pow(1.185, lvl - 1) + lvl * 12); // XP pour passer au niveau suivant
const canHide = c => CL[c].t < 3 || !!CL[c].ghost;                      // peut se cacher dans le brouillard

const S = { WS, TAU, EVO, SEE, CREAM, NAVY, WOOD, COLS, HULLS, SAILS, FLAGS, TEAMS, NAMES, SK, CL, LT, BON, rnd, ri, cl, pick, angD, R, need, canHide };
if (typeof module !== 'undefined' && module.exports) module.exports = S; else root.S = S;
})(typeof window !== 'undefined' ? window : globalThis);
