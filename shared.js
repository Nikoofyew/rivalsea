// Données communes au serveur (Node.js) et au navigateur : navires, butin, bonus, compétences.
// Modifier une valeur ici change le jeu des deux côtés.
(function (root) {
'use strict';
const DMG = .42, WS = 6800, TAU = Math.PI * 2, EVO = [5, 10, 15, 20], SEE = 130;
const CREAM = '#fff8e7', NAVY = '#0b3d6b', WOOD = '#7a4a24';
const COLS = ['#ff6b57', '#ffcf3f', '#8b5cf6', '#5be3a1', '#ff8fc7', '#ff9f43', '#4dabf7'];
const HULLS = [['#ff6b57', 'Corail'], ['#ffcf3f', 'Soleil'], ['#8b5cf6', 'Lavande'], ['#5be3a1', 'Menthe'], ['#ff8fc7', 'Rose'], ['#ff9f43', 'Orange'], ['#4dabf7', 'Azur'], ['#5c6b80', 'Ardoise'], ['#2f3640', 'Charbon'], ['#a8323e', 'Bordeaux'], ['#f4f1e8', 'Ivoire'], ['#16a085', 'Émeraude']];
const SAILS = [['#fff8e7', 'Crème'], ['#2b2b2b', 'Noir'], ['#ff6b57', 'Rouge'], ['#4dabf7', 'Bleu'], ['#ffcf3f', 'Or'], ['#8b5cf6', 'Violet'], ['#5be3a1', 'Vert'], ['#ff8fc7', 'Rose']];
const TRIMS = [['#fff8e7', 'Crème'], ['#ffcf3f', 'Or'], ['#2b2b2b', 'Noir'], ['#ff6b57', 'Corail'], ['#4dabf7', 'Azur'], ['#c0c7d0', 'Argent']];
// Style à débloquer avec les étoiles des défis du jour : [valeur, nom, prix en étoiles]
const PREM = {
  hull: [['#d4af37', 'Or', 6], ['#00e5ff', 'Néon', 6], ['#141a33', 'Nuit', 4], ['#b8f2e6', 'Écume', 4]],
  sail: [['#d4af37', 'Or vrai', 5], ['#00e5ff', 'Néon', 5], ['#6b3fa0', 'Pourpre royal', 4]],
  pat: [['check', 'Damier', 5], ['rainbow', 'Arc-en-ciel', 10]],
  flag: [['bolt', '⚡', 3], ['sun', '☀', 3], ['spark', '✦', 3]],
  wake: [['gold', 'Doré', 8], ['fire', 'Feu', 10], ['rainbow', 'Arc-en-ciel', 15]]
};
const PATS = [['plain', 'Unie'], ['stripes', 'Rayée'], ['center', 'Bande'], ['half', 'Moitié'], ['tips', 'Bouts']];
const FLAGS = { skull: '☠', star: '★', anchor: '⚓', heart: '♥', crown: '♛', swords: '⚔', moon: '☾', flower: '✿', none: '' };
const FLAGS_ALL = Object.assign({ bolt: '⚡', sun: '☀', spark: '✦' }, FLAGS); // avec les pavillons à débloquer
const TEAMS = [{ n: 'Rouges', col: '#ff6b57' }, { n: 'Jaunes', col: '#ffcf3f' }, { n: 'Violets', col: '#8b5cf6' }, { n: 'Verts', col: '#5be3a1' }];
const NAMES = ['Mouette', 'Corsaire', 'Cabotin', 'Marée', 'Tempête', 'Sardine', 'Albatros', 'Boussole', 'Écume', 'Pinson', 'Tribord', 'Hublot', 'Goéland', 'Typhon', 'Crabe', 'Bigorneau'];

// Compétences spéciales (cd = recharge en secondes)
const SK = {
  boost: { n: 'Accélération', ab: 'Vite', cd: 10, d: 'Vitesse ×1,7 pendant 2,5 s' },
  smoke: { n: 'Fumigène', ab: 'Fumée', cd: 16, d: 'Crée un banc de brouillard pendant 8 s' },
  repair: { n: 'Réparation', ab: 'Répare', cd: 18, d: 'Rend 35 % des points de vie' },
  salvo: { n: 'Bordée concentrée', ab: 'Salve', cd: 12, d: 'Salve immédiate : +2 projectiles, dégâts ×1,6' },
  dive: { n: 'Plongée', ab: 'Plonge', cd: 14, d: 'Invisible 4 s (sauf tout près), sans pouvoir tirer' }
};

// Arbre des navires en trois familles fermées : r = rapide, a = abordage, c = artillerie.
// t = époque (0 à 4), évolutions aux niveaux 5, 10, 15 et 20. Chaque famille propose un navire « pur » et un « hybride ».
// w = arme : k sorte de projectile (arrow, bolt, bullet, ball, torp, shell), n projectiles, sp écart angulaire, par écart parallèle,
// v vitesse, sz taille, dmg dégâts, rate secondes entre deux tirs, rng portée, tg nombre de cibles, spl rayon d'explosion, bs tir sur les flancs.
// w2 = arme secondaire de près. ram = force d'éperonnage, brd = dégâts d'abordage par seconde au contact, arm = blindage (part des dégâts évitée).
// Propulsion dessinée : oars rames, masts voiles, stack cheminée, paddle roues à aubes, screw hélice.
const CL = {
barque:{n:'Barque',t:0,d:'Petite barque à rames. Vos archers tirent des flèches.',w:{nm:'Arcs',k:'arrow',n:1,v:560,sz:2.5,dmg:10.9,rate:0.68,rng:230,tg:1},hp:1,spd:1.05,sz:.85,L:1.2,Wd:.7,masts:[],oars:1,hs:'classic',sk:'boost',next:['drakkar','galere','nef']},

drakkar:{n:'Drakkar',t:1,f:'r',d:'Long et vif, rames et voile carrée. Pluie de flèches.',w:{nm:'Flèches en rafale',k:'arrow',n:2,par:8,v:620,sz:2.5,dmg:13.46,rate:0.6,rng:255,tg:1},hp:1.15,spd:1.25,sz:.9,L:2,Wd:.5,masts:[{x:0,k:'stripe'}],oars:1,oarsN:5,shields:1,dragon:1,hs:'long',sk:'boost',next:['goelette','chebec']},
galere:{n:'Galère à éperon',t:1,f:'a',d:'Foncez dans l’ennemi : éperon de bronze et arbalètes.',w:{nm:'Arbalètes',k:'bolt',n:1,v:560,sz:3,dmg:10.9,rate:0.9,rng:175,tg:1},ram:2,brd:5,hp:1.3,spd:1.02,sz:1.05,L:1.65,Wd:.6,masts:[{x:.05,k:'lat'}],oars:1,oarsN:6,beak:1,castle:{a:.18},hs:'long',sk:'boost',next:['brickab','caravelle','brulot']},
nef:{n:'Nef à baliste',t:1,f:'c',d:'Une baliste lance un gros carreau très loin.',w:{nm:'Baliste',k:'bolt',n:1,v:540,sz:5,dmg:33.79,rate:1.65,rng:330,tg:1},hp:1.25,spd:.92,sz:1.05,L:1.45,Wd:.8,masts:[{x:0,k:'sq'}],bow:1,castle:{f:.22,a:.26},hs:'round',sk:'repair',next:['fregate','bombarde','galeasse']},

goelette:{n:'Goélette',t:2,f:'r',d:'Un équipage de mousquetaires, cadence infernale.',w:{nm:'Mousquetaires',k:'bullet',n:3,par:9,v:700,sz:3,dmg:6.85,rate:0.3,rng:280,tg:1},hp:1.5,spd:1.15,sz:1.05,L:1.85,Wd:.55,masts:[{x:.3,k:'gaff'},{x:-.15,k:'gaff'}],bowsprit:1,hs:'sleek',sk:'boost',next:['clipper','aviso']},
chebec:{n:'Chébec corsaire',t:2,f:'r',d:'Rapide, mousquets et éperon léger pour finir le travail.',w:{nm:'Mousquets',k:'bullet',n:2,par:9,v:680,sz:3,dmg:7.42,rate:0.33,rng:250,tg:1},ram:2,brd:3,hp:1.45,spd:1.2,sz:1.05,L:1.75,Wd:.55,masts:[{x:.32,k:'lat'},{x:-.18,k:'lat'}],beak:1,hs:'sleek',sk:'boost',next:['clipper','aviso']},
brickab:{n:'Brick d’abordage',t:2,f:'a',d:'Grappins et tromblons : collez-vous à l’ennemi.',w:{nm:'Tromblons',k:'ball',n:6,sp:.14,v:480,sz:3,dmg:5.39,rate:1.2,rng:190,tg:1},ram:2.4,brd:17,hp:1.9,spd:.97,sz:1.2,L:1.55,Wd:.8,masts:[{x:.28,k:'sq'},{x:-.22,k:'sq'}],ports:2,beak:1,hs:'classic',sk:'boost',next:['vapeurb','galionab']},
caravelle:{n:'Caravelle armée',t:2,f:'a',d:'Éperon solide et mousquets pour harceler.',w:{nm:'Mousquets',k:'bullet',n:2,par:10,v:650,sz:3,dmg:8.23,rate:0.68,rng:250,tg:1},ram:1.9,brd:7,hp:1.6,spd:1,sz:1.15,L:1.5,Wd:.78,masts:[{x:.35,k:'lat'},{x:-.1,k:'lat'}],castle:{a:.3},beak:1,hs:'round',sk:'repair',next:['vapeurb','galionab']},
fregate:{n:'Frégate',t:2,f:'c',d:'Premiers canons : présentez le flanc à la cible.',w:{nm:'Bordées',k:'ball',n:3,par:12,v:500,sz:6,dmg:15.1,rate:1.42,rng:340,tg:2,bs:1},hp:1.45,spd:.85,sz:1.25,L:1.65,Wd:.72,masts:[{x:.3,k:'sq'},{x:-.25,k:'sq'}],bowsprit:1,ports:3,hs:'classic',sk:'salvo',next:['vaisseau','cuirasse']},
bombarde:{n:'Bombarde',t:2,f:'c',d:'Mortier qui explose en zone, pierriers pour se défendre de près.',w:{nm:'Mortier',k:'shell',n:1,v:360,sz:9,dmg:51.9,rate:2.4,rng:380,tg:1,spl:70},w2:{nm:'Pierriers',k:'ball',n:4,sp:.15,v:480,sz:2.5,dmg:3.43,rate:1.35,rng:170,tg:1},hp:1.65,spd:.8,sz:1.2,L:1.35,Wd:.88,masts:[{x:-.3,k:'gaff'}],mortar:1,castle:{a:.2},hs:'round',sk:'repair',next:['vaisseau','cuirasse']},
brulot:{n:'Brûlot',t:2,f:'a',d:'Petit voilier incendiaire : ses pots à feu enflamment l’ennemi pendant 3 s.',w:{nm:'Pots à feu',k:'fire',n:2,sp:.12,v:430,sz:4,dmg:19.49,rate:1.1,rng:210,tg:1,burn:3},ram:1.9,brd:6,hp:1.55,spd:1.06,sz:1.1,L:1.5,Wd:.66,masts:[{x:.12,k:'lat'}],pots:1,beak:1,hs:'classic',sk:'boost',next:['vapeurb','galionab']},
galeasse:{n:'Galéasse',t:2,f:'c',d:'Grosse galère à rames : canons de proue et pierriers sur les flancs.',w:{nm:'Canons de proue',k:'ball',n:2,par:10,v:520,sz:6,dmg:18.67,rate:1.4,rng:320,tg:1},w2:{nm:'Pierriers',k:'ball',n:3,sp:.15,v:480,sz:2.5,dmg:4.14,rate:1.35,rng:170,tg:1},hp:1.6,spd:.88,sz:1.25,L:1.95,Wd:.66,masts:[{x:.02,k:'lat'},{x:-.42,k:'lat'}],oars:1,oarsN:7,castle:{a:.18,f:.16},bowguns:1,hs:'long',sk:'salvo',next:['vaisseau','cuirasse']},

clipper:{n:'Clipper',t:3,f:'r',d:'Le plus rapide des grands voiliers. Fusils à répétition.',w:{nm:'Fusils à répétition',k:'bullet',n:2,par:9,v:760,sz:3.5,dmg:14.7,rate:0.21,rng:300,tg:2},hp:1.9,spd:1.15,sz:1.25,L:2,Wd:.52,masts:[{x:.42,k:'sq3'},{x:.02,k:'sq3'},{x:-.38,k:'sq3'}],bowsprit:1,hs:'sleek',sk:'boost',next:['torpilleur','destroyer','sousmarin']},
aviso:{n:'Aviso à vapeur',t:3,f:'r',d:'Petit vapeur rapide : mitrailleuse et éperon.',w:{nm:'Mitrailleuse',k:'bullet',n:1,v:820,sz:3,dmg:12.56,rate:0.18,rng:260,tg:1},ram:1.8,brd:4,hp:2.4,spd:1.2,sz:1.2,L:1.85,Wd:.55,masts:[{x:.4,k:'gaff'}],stack:1,beak:1,hs:'steel',sk:'boost',next:['torpilleur','destroyer','sousmarin']},
vapeurb:{n:'Vapeur blindé',t:3,f:'a',d:'Roues à aubes, coque blindée et mitrailleuse Gatling.',w:{nm:'Gatling',k:'bullet',n:1,v:800,sz:3,dmg:8.0,rate:0.18,rng:210,tg:1},ram:2.6,brd:10,arm:0.15,hp:1.95,spd:.88,sz:1.4,L:1.6,Wd:.8,masts:[],stack:1,paddle:1,beak:1,hs:'steel',deck:'steel',sk:'repair',next:['cuirasseep','croiseur']},
galionab:{n:'Galion d’abordage',t:3,f:'a',d:'Énorme éperon et petits canons pour approcher.',w:{nm:'Petits canons',k:'ball',n:2,par:12,v:520,sz:5,dmg:26.46,rate:1.2,rng:290,tg:1},ram:2,brd:15,hp:2.9,spd:.82,sz:1.45,L:1.7,Wd:.85,masts:[{x:.46,k:'sq3',s:.8},{x:.04,k:'sq3',s:1.35},{x:-.3,k:'sq3',s:.8}],ports:3,castle:{a:.3,f:.14},beak:1,hs:'round',sk:'salvo',next:['cuirasseep','croiseur']},
vaisseau:{n:'Vaisseau de ligne',t:3,f:'c',d:'Bordées de gros canons à très longue portée.',w:{nm:'Canons lourds',k:'ball',n:3,par:14,v:520,sz:7.5,dmg:36.51,rate:1.65,rng:360,tg:2,bs:1},hp:1.95,spd:.62,sz:1.55,L:1.8,Wd:.8,masts:[{x:.42,k:'sq3'},{x:.02,k:'sq3'},{x:-.35,k:'sq3'}],ports:5,ports2:1,bowsprit:1,castle:{a:.24},hs:'round',sk:'salvo',next:['dreadnought','forteresse','lanceroq']},
cuirasse:{n:'Cuirassé à vapeur',t:3,f:'c',d:'Mortiers lourds, mitraille pour qui s’approche trop.',w:{nm:'Mortiers lourds',k:'shell',n:2,par:14,v:390,sz:10,dmg:54.63,rate:2.25,rng:410,tg:2,spl:85},w2:{nm:'Mitraille',k:'ball',n:5,sp:.12,v:520,sz:3,dmg:5.81,rate:1.2,rng:200,tg:1},arm:.12,hp:2.1,spd:.66,sz:1.45,L:1.7,Wd:.78,masts:[],turs:[{x:.42,n:2,s:1,m:1},{x:-.45,n:2,s:1,m:1}],stack:1,hs:'steel',deck:'steel',sk:'repair',next:['dreadnought','forteresse','lanceroq']},

torpilleur:{n:'Vedette torpilleuse',t:4,f:'r',leg:1,d:'Moteur et hélice : vitesse folle, torpilles dévastatrices.',w:{nm:'Torpilles',k:'torp',n:2,par:14,v:430,sz:6,dmg:64.35,rate:1.65,rng:460,tg:2},hp:2.5,spd:1.32,sz:1.3,L:2.25,Wd:.42,masts:[],screw:2,cabin:1,tubes:1,wave:1,stripes:1,hs:'steel',deck:'steel',sk:'boost',next:[]},
destroyer:{n:'Destroyer',t:4,f:'r',leg:1,d:'Rapide et nerveux : mitrailleuses jumelles et étrave d’acier.',w:{nm:'Mitrailleuses',k:'bullet',n:2,par:9,v:840,sz:3.5,dmg:9.04,rate:0.18,rng:300,tg:2},ram:2,brd:5,hp:2.35,spd:1.22,sz:1.4,L:2.3,Wd:.5,masts:[],screw:2,stack:2,slant:1,cabin:1,radar:1,wave:1,beak:1,turs:[{x:.6,n:1,s:.75},{x:.38,n:1,s:.75},{x:-.5,n:1,s:.75},{x:-.68,n:1,s:.75}],hs:'steel',deck:'steel',sk:'boost',next:[]},
cuirasseep:{n:'Cuirassé éperonneur',t:4,f:'a',leg:1,d:'Blindage épais, éperon d’acier et tourelles de près.',w:{nm:'Tourelles courtes',k:'ball',n:2,par:14,v:600,sz:6,dmg:14.23,rate:1.35,rng:230,tg:2},ram:3,brd:22,arm:.3,hp:3,spd:.84,sz:1.65,L:1.55,Wd:.92,masts:[],citadel:1,turs:[{x:.04,n:2,s:1.45}],stackX:[-.5],stack:1,screw:1,bigbeak:1,belt:1,hs:'ironram',deck:'steel',sk:'boost',next:[]},
croiseur:{n:'Croiseur cuirassé',t:4,f:'a',leg:1,d:'Éperon et canons moyens : charge puis achève à distance.',w:{nm:'Canons moyens',k:'ball',n:2,par:14,v:560,sz:6,dmg:19.19,rate:1.27,rng:320,tg:2},ram:2.2,brd:12,arm:.2,hp:2.9,spd:.92,sz:1.6,L:2.15,Wd:.55,masts:[],turs:[{x:.64,n:1,s:.95},{x:-.66,n:1,s:.95},{x:.3,y:-.62,n:1,s:.6},{x:.3,y:.62,n:1,s:.6},{x:-.34,y:-.62,n:1,s:.6},{x:-.34,y:.62,n:1,s:.6}],stack:3,stackX:[.16,0,-.16],slant:1,tripod:1,tripodX:.38,pennant:1,screw:1,beak:1,hs:'cruiser',sk:'salvo',next:[]},
dreadnought:{n:'Dreadnought',t:4,f:'c',leg:1,d:'Obus explosifs à très longue portée sur trois cibles.',w:{nm:'Tourelles lourdes',k:'shell',n:2,par:16,v:390,sz:10,dmg:48.87,rate:2.25,rng:450,tg:3,spl:80},hp:2.9,spd:.6,sz:1.7,L:2.2,Wd:.8,masts:[],turs:[{x:.66,n:3,s:1.05},{x:.36,n:3,s:1.25,hi:1},{x:-.28,n:3,s:1.15}],stack:2,stackX:[.08,-.08],tripod:1,tripodX:.2,belt:1,aa:1,plane:1,screw:2,hs:'steel',deck:'dark',sk:'salvo',next:[]},
sousmarin:{n:'Sous-marin',t:4,f:'r',leg:1,d:'Plonge pour disparaître quelques secondes, puis frappe à la torpille.',w:{nm:'Torpilles',k:'torp',n:2,par:12,v:420,sz:6,dmg:71.07,rate:1.8,rng:440,tg:1},hp:2.4,spd:1.2,sz:1.3,L:2.3,Wd:.42,masts:[],screw:1,sub:1,hs:'sub',deck:'dark',sk:'dive',next:[]},
lanceroq:{n:'Lance-roquettes',t:4,f:'c',leg:1,d:'Des salves de roquettes qui pleuvent en zone sur deux cibles.',w:{nm:'Roquettes',k:'rocket',n:6,sp:0.035,v:470,sz:4,dmg:28.12,rate:2.2,rng:420,tg:2,spl:45},hp:2.5,spd:.66,sz:1.6,L:1.95,Wd:.72,masts:[],racks:[.5,-.42],stack:1,stackX:[.06],tripod:1,tripodX:-.12,screw:2,belt:1,hs:'steel',deck:'steel',sk:'salvo',next:[]},
forteresse:{n:'Forteresse flottante',t:4,f:'c',leg:1,d:'Trois tourelles de mortiers et des mitrailleuses contre l’abordage.',w:{nm:'Triple mortier',k:'shell',n:2,par:14,v:390,sz:10,dmg:48.12,rate:2.4,rng:420,tg:3,spl:90},w2:{nm:'Mitrailleuses',k:'bullet',n:2,par:10,v:800,sz:3,dmg:2.5,rate:0.18,rng:240,tg:2},arm:0.15,hp:2.0,spd:.5,sz:1.8,L:1.45,Wd:1.05,masts:[],turs:[{x:.55,y:0,n:3,s:.95,m:1},{x:-.32,y:-.6,n:3,s:.95,m:1},{x:-.32,y:.6,n:3,s:.95,m:1}],nests:1,tower:1,screw:1,hs:'fort',deck:'steel',sk:'repair',next:[]}
};

// Butin et créatures. n = nombre présent en permanence sur la carte.
const LT = {
  tonneau: { hp: 12, xp: 18, r: 12, n: 42 },
  caisse: { hp: 30, xp: 40, r: 15, n: 14 },
  coffre: { hp: 70, xp: 120, r: 16, n: 4 },
  peche: { hp: 30, xp: 55, r: 14, n: 9, mv: 120, nm: 'Pêcheur', col: '#4dabf7', sh: { L: 1.3, Wd: .6, masts: [{ x: .05, k: 'tri' }] } },
  marchand: { hp: 120, xp: 180, r: 22, n: 3, mv: 85, nm: 'Marchand', col: '#c98a4b', sh: { L: 1.5, Wd: .85, masts: [{ x: .3, k: 'sq' }, { x: -.25, k: 'sq' }], ports: 2 } },
  epave: { hp: 8, xp: 0, r: 11, n: 0 },
  planche: { hp: 10, xp: 0, r: 15, n: 0, heal: .2 },   // planches de réparation : rares, soignent 20 % de la vie
  tresor: { hp: 1300, xp: 1400, r: 28, n: 0, nm: 'Trésor' },
  kraken: { hp: 5000, xp: 2600, r: 52, n: 0, nm: 'Kraken' }
};

const BON = [
  { n: 'Canons légers', d: 'Cadence de tir +20 %', f: s => { s.rk = (s.rk || 0) + 1; s.rate = 1 / (1 + .2 * s.rk); } },
  { n: 'Gros calibre', d: 'Dégâts +25 %', f: s => s.dmg += .25 },
  { n: 'Voiles neuves', d: 'Vitesse +10 %', f: s => s.spd += .1, ok: s => s.spd < 1.25 },
  { n: 'Longue-vue', d: 'Portée +15 %', f: s => s.rng += .15, ok: s => s.rng < 1.55 },
  { n: 'Coque renforcée', d: '+30 points de vie max', f: s => s.hp += 30 },
  { n: 'Salve multiple', d: 'Un projectile de plus par tir', f: s => s.multi++, ok: s => s.multi < 2 },
  { n: 'Charpentier', d: 'Répare 2 % de la vie max par seconde', f: s => s.reg += 2, ok: s => s.reg < 4 },
  { n: 'Filets de récupération', d: 'XP des épaves et tonneaux +30 %', f: s => s.loot += .3 },
  { n: 'Éperon de proue', d: 'Dégâts d’éperonnage +50 %', f: s => s.ram += .5 },
  { n: 'Maître d’équipage', d: 'Compétence spéciale prête 25 % plus vite', f: s => { s.sk = (s.sk || 0) + 1; s.skr = 1 / (1 + .25 * s.sk); }, ok: s => (s.sk || 0) < 3 },
  { n: 'Grappins d’abordage', d: 'Au contact d’un ennemi : +8 dégâts par seconde et vol d’XP', f: s => s.brd += 8, ok: s => s.brd < 16 },
  { n: 'Coque cloutée', d: 'Dégâts d’éperonnage et d’abordage subis −40 %', f: s => s.mres -= .4, ok: s => s.mres > .7 }
];

const rnd = (a, b) => a + Math.random() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1)), cl = (v, a, b) => Math.max(a, Math.min(b, v)), pick = a => a[ri(0, a.length - 1)];
const angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const R = (lvl, c) => (13 + Math.min(lvl, 30) * .7) * CL[c].sz;       // rayon d'un navire
const need = lvl => Math.round(100 + 26 * (lvl - 1) + 1.6 * (lvl - 1) ** 2); // XP pour passer au niveau suivant
const canHide = c => CL[c].t < 3;                      // peut se cacher dans le brouillard
// Collision coque / îles et rochers : on teste le centre, la proue et la poupe du navire (la coque est allongée)
function hullPush(x, y, a, r, Lf, rocks) {
  const ca = Math.cos(a), sa = Math.sin(a), pts = [[0, r * .8], [r * Lf * .82, r * .22], [-r * Lf * .7, r * .3]];
  for (let it = 0; it < 2; it++) for (const k of rocks) {
    const pad = k.k === 'ile' ? 10 : 3; if (Math.abs(k.x - x) > k.r + r * Lf + 40 || Math.abs(k.y - y) > k.r + r * Lf + 40) continue;
    for (const [off, rad] of pts) { const px = x + ca * off, py = y + sa * off, dx = px - k.x, dy = py - k.y, d = Math.hypot(dx, dy), m = k.r + pad + rad;
      if (d < m && d > 0) { x += dx / d * (m - d); y += dy / d * (m - d); } }
  }
  return [x, y];
}

const S = { DMG, WS, TAU, EVO, SEE, CREAM, NAVY, WOOD, COLS, HULLS, SAILS, TRIMS, PATS, PREM, FLAGS, FLAGS_ALL, TEAMS, NAMES, SK, CL, LT, BON, rnd, ri, cl, pick, angD, R, need, canHide, hullPush };
if (typeof module !== 'undefined' && module.exports) module.exports = S; else root.S = S;
})(typeof window !== 'undefined' ? window : globalThis);
