// Simulation du monde de RivalSea. C'est le serveur qui fait foi : il calcule les déplacements,
// les tirs, les dégâts et l'XP, puis envoie à chaque joueur ce qu'il a le droit de voir.
'use strict';
const S = require('./shared.js');
const { DMG, CL, LT, SK, BON, EVO, WS, TAU, SEE, TEAMS, NAMES, COLS, SAILS, HULLS, TRIMS, PATS, PREM, FLAGS, FLAGS_ALL, rnd, ri, cl, pick, angD, need, hullPush } = S;

const MODE = process.env.MODE === 'team' ? 'team' : 'ffa';          // ffa = chacun pour soi, team = équipages
const BOTS = Math.max(0, parseInt(process.env.BOTS || '20', 10));   // nombre de navires visé (joueurs + bots)
const BOT_DMG = .72;  // les bots font 28 % de dégâts en moins que les joueurs
const BOT_HOLD = 4;   // un bot qui apparaît ne peut pas tirer pendant 4 s
const AREA = Math.round((WS / 3400) ** 2); // carte agrandie : on multiplie îles, brouillard et butin d'autant
const KILL_HEAL = .3; // couler un navire rend 30 % de la vie max
let QUIET = false;
let evs = [];        // statistiques anonymes (vidées par le serveur)    // pour les tests : pas de nouveaux bots ni d'événements
let plankT = 20, merchT = 45; // merchT : prochain navire marchand armé      // prochaine apparition de planches de réparation

let rocks = [], fogs = [], boats = [], loot = [], shots = [], fx = [], deaths = [];
let whirl = null, ghostT = 0, ev = { t: 30 }, storm = null, convoy = null, UID = 0, FZ = 0, T = 0, boardCache = null, boardT = -1, leaderId = 0;

// ——— Outils ———
const R = b => S.R(b.lvl, b.c) * (b.mc ? 1.3 : 1); // les navires marchands armés sont plus gros
const mass = b => CL[b.c].sz ** 2 * (1 + b.lvl * .02);
const mhp = b => 100 * CL[b.c].hp * (1 + .015 * (b.lvl - 1)) * (b.hpx || 1) + b.s.hp; // base du navire (un peu plus solide à chaque niveau) + bonus fixes
const lmhp = l => l.mhp || LT[l.k].hp;
const avail = s => BON.filter(x => !x.ok || x.ok(s));
const rb = b => pick(avail(b.s)).f(b.s);
const canHide = b => S.canHide(b.c);
const humans = () => boats.filter(b => b.p);
function zoneAt(x, y) { for (const f of fogs) if ((x - f.x) ** 2 + (y - f.y) ** 2 < f.r * f.r * .7 * (f.life !== undefined ? cl(f.life, 0, 1) : 1)) return f.z; return -1; }
// on voit un navire s'il n'est pas caché, si on est dans le même banc de brouillard, ou s'il est tout proche
const seen = (o, by) => o.dive > 0 ? Math.hypot(o.x - by.x, o.y - by.y) < 120 : !canHide(o) || o.fz < 0 || o.fz === by.fz || Math.hypot(o.x - by.x, o.y - by.y) < SEE;
const seenL = (l, by) => l.fz < 0 || l.fz === by.fz || Math.hypot(l.x - by.x, l.y - by.y) < SEE || l.k === 'kraken';
// grille des rochers : chaque case ne contient que les rochers proches, pour ne pas tous les tester à chaque fois
const RC = 400; let rgrid = new Map();
function buildRockGrid() { rgrid = new Map(); for (const k of rocks) { const r = k.r + 260; for (let cx = Math.floor((k.x - r) / RC); cx <= Math.floor((k.x + r) / RC); cx++) for (let cy = Math.floor((k.y - r) / RC); cy <= Math.floor((k.y + r) / RC); cy++) { const key = cx * 1000 + cy; if (!rgrid.has(key)) rgrid.set(key, []); rgrid.get(key).push(k); } } }
const EMPTY = [];
// grille du butin, refaite à chaque pas : on ne teste que le butin des cases voisines
const LC = 300; let lgrid = new Map(), TN = 0;
function buildLootGrid() { lgrid = new Map(); for (const l of loot) { if (l.dead) continue; const key = Math.floor(l.x / LC) * 1000 + Math.floor(l.y / LC); let a = lgrid.get(key); if (!a) lgrid.set(key, a = []); a.push(l); } }
function lootNear(x, y, r) { const out = [], c0 = Math.floor((x - r) / LC), c1 = Math.floor((x + r) / LC), d0 = Math.floor((y - r) / LC), d1 = Math.floor((y + r) / LC); for (let cx = c0; cx <= c1; cx++) for (let cy = d0; cy <= d1; cy++) { const a = lgrid.get(cx * 1000 + cy); if (a) for (const l of a) out.push(l); } return out; }
const rocksNear = (x, y) => rgrid.get(Math.floor(x / RC) * 1000 + Math.floor(y / RC)) || EMPTY;
const inRock = (x, y, m) => m > 250 ? rocks.some(k => Math.hypot(x - k.x, y - k.y) < k.r + m) : rocksNear(x, y).some(k => Math.hypot(x - k.x, y - k.y) < k.r + m);
function freeSpot(m, pad) { for (let i = 0; i < 40; i++) { const x = rnd(m, WS - m), y = rnd(m, WS - m); if (!inRock(x, y, pad || 60)) return { x, y }; } return { x: WS / 2, y: WS / 2 }; }
function pushOut(o, rad) { for (const k of rocksNear(o.x, o.y)) { const dx = o.x - k.x, dy = o.y - k.y, d = Math.hypot(dx, dy), m = k.r + rad; if (d < m && d > 0) { o.x = k.x + dx / d * m; o.y = k.y + dy / d * m; } } }
function avoid(o, a, rad) { const px = o.x + Math.cos(a) * (rad + 90), py = o.y + Math.sin(a) * (rad + 90); for (const k of rocksNear(px, py)) { if (Math.hypot(px - k.x, py - k.y) < k.r + rad * .7) { const s = Math.sign(Math.sin(Math.atan2(k.y - o.y, k.x - o.x) - a)) || 1; return a - s * 1.3; } } return a; }
// les textes sont envoyés sous forme de code (id) + paramètres (p) : chaque navigateur les affiche dans sa langue
const say = (b, x, y, id, p, col, l) => { if (b && b.p) fx.push({ k: 'txt', x: Math.round(x), y: Math.round(y), id, p, col, l: l || 1, to: b.id }); };
const banner = (id, p) => fx.push({ k: 'banner', id, p });
const burst = (x, y, col, n, sp) => fx.push({ k: 'burst', x: Math.round(x), y: Math.round(y), col, n, sp: sp || 200 });
const ring = (x, y, r, m, l, col) => fx.push({ k: 'ring', x: Math.round(x), y: Math.round(y), r, m, l, col });
const avgLvl = () => { const h = humans(); return h.length ? h.reduce((a, b) => a + b.lvl, 0) / h.length : ri(2, 6); };
// bots de tous niveaux : on remplit la tranche de niveaux la moins représentée
const BANDS = [[1, 4, .35], [5, 9, .3], [10, 14, .2], [15, 20, .15]], BOTMAX = 20; // les bots plafonnent au niveau 20 : les nouveaux venus ne voient pas que des géants
function botLevel(want) {
  const cnt = BANDS.map(() => 0); for (const b of boats) if (!b.p && !b.npc) { const i = BANDS.findIndex(([a, z]) => b.lvl >= a && b.lvl <= z); cnt[i < 0 ? BANDS.length - 1 : i]++; }
  let bi = 0, bd = -1e9; BANDS.forEach(([, , p], i) => { const d = p * want - cnt[i] + Math.random() * .5; if (d > bd) { bd = d; bi = i; } });
  return ri(BANDS[bi][0], BANDS[bi][1]);
}
function weakTeam() { const c = [0, 0, 0, 0]; for (const b of boats) if (!b.npc && b.team >= 0 && b.team < 4) c[b.team]++; return c.indexOf(Math.min(...c)); }

// ——— Création ———
// Apparition sûre : loin des bords et loin des navires plus forts
function spawnSpot(lvl) {
  let best = null, bs = -1;
  for (let i = 0; i < 50; i++) {
    const s = freeSpot(400, 90); let m = 1e9;
    for (const o of boats) { if (o.dead || (o.lvl <= lvl + 2 && !o.npc && !o.p)) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < m) m = d; }
    if (m >= 1000) return s; if (m > bs) { bs = m; best = s; }
  }
  return best || freeSpot(400, 90);
}
function mk(opt) {
  const sp = spawnSpot(opt.lvl || 1);
  const b = { p: !!opt.p, id: ++UID, name: opt.name || pick(NAMES), col: opt.hull || pick(COLS), sail: opt.sail || pick(SAILS)[0], flag: opt.flag || pick(Object.keys(FLAGS)), wake: opt.wake || 'none', trim: opt.trim || (Math.random() < .5 ? '#fff8e7' : pick(TRIMS)[0]), pat: opt.pat || (Math.random() < .4 ? 'plain' : pick(PATS)[0]),
    x: sp.x, y: sp.y, a: rnd(0, TAU), aim: 0, vx: 0, vy: 0, lvl: 1, xp: 0, tot: 0, sc: 0, c: 'barque', cd: rnd(0, 1), cd2: 0, skcd: 3, boost: 0, rc: 0, inv: opt.p ? 6 : 3, hold: opt.p ? 0 : BOT_HOLD,
    tx: 0, ty: 0, f: 1, t: 0, wx: WS / 2, wy: WS / 2, pend: [], offer: null, oid: 0, fl: 0, fz: -1, inp: { a: 0, f: 0 }, npc: !!opt.npc,
    s: { rate: 1, dmg: 1, spd: 1, rng: 1, hp: 0, multi: 0, reg: 0, loot: 1, ram: 1, skr: 1, brd: 0, mres: 1 }, hp: 1 };
  b.aim = b.a; b.inp.a = b.a;
  if (!b.p) b.sty = pick(['normal', 'normal', 'prudent', 'chasseur', 'pilleur']); // chaque bot a sa façon de jouer
  b.team = MODE === 'team' && !opt.npc ? (opt.team !== undefined ? opt.team : weakTeam()) : b.id;
  if (MODE === 'team' && !opt.npc) b.col = TEAMS[b.team].col;
  for (let i = 1; i < (opt.lvl || 1); i++) lvup(b);
  b.hp = mhp(b); return b;
}
function mkL(k, x, y) {
  const d = LT[k];
  if (x === undefined) {
    const s = freeSpot(80, 30); x = s.x; y = s.y;
    // 40 % du petit butin réapparaît dans le brouillard
    if (!d.mv && fogs.length && Math.random() < .4) { const f = pick(fogs.filter(f => f.life === undefined)); if (f) { const a = rnd(0, TAU), q = Math.sqrt(Math.random()) * f.r * .7, fx2 = f.x + Math.cos(a) * q, fy2 = f.y + Math.sin(a) * q; if (!inRock(fx2, fy2, 30)) { x = fx2; y = fy2; } } }
  }
  return { id: ++UID, k, x, y, hp: d.hp, a: rnd(0, TAU), ph: rnd(0, TAU), t: 0, wx: x, wy: y, fl: 0, fz: -1 };
}
function lvup(b) {
  b.lvl++;
  const evo = b.lvl % 5 === 0 && b.lvl / 5 <= EVO.length && CL[b.c].next.length > 0;
  if (b.p) { b.pend.push({ k: evo ? 'evo' : 'bonus', l: b.lvl }); offer(b); }
  else if (evo) evolve(b, pick(CL[b.c].next)); else rb(b);
  b.hp = Math.min(mhp(b), b.hp + mhp(b) * .3);
}
// Les choix (bonus ou évolution) ne mettent pas la partie en pause : le joueur choisit en naviguant.
function offer(b) {
  if (b.offer || !b.pend.length) return;
  const q = b.pend.shift(), k = q.k, l = q.l || b.lvl;
  if (k === 'evo' && CL[b.c].next.length) b.offer = { id: ++b.oid, k: 'evo', o: CL[b.c].next.slice(), l };
  else b.offer = { id: ++b.oid, k: 'bonus', o: avail(b.s).map(x => BON.indexOf(x)).sort(() => Math.random() - .5).slice(0, 3), l };
}
const XPR = .7; // l'XP gagnée est réduite de 30 % pour monter de niveau moins vite
function gain(b, x) { if (!b || !b.s || b.dead || b.mc || (!b.p && b.lvl >= (b.npc ? 30 : BOTMAX))) return; b.xp += x; b.tot += x; let n; while (b.xp >= (n = need(b.lvl))) { b.xp -= n; lvup(b); } }
function evolve(b, k) { b.c = k; b.hp = mhp(b); if (boats.includes(b)) { ring(b.x, b.y, R(b), R(b) * 4, .7, '#ffcf3f'); say(b, b.x, b.y - R(b) - 30, 'evo', { c: k }, '#ffcf3f', 1.6); } }

// ——— Monde : îles, récifs, brouillard ———
function genWorld() {
  rocks = []; fogs = []; FZ = 0;
  const isl = [];
  for (let i = 0; i < 6 * AREA; i++) {
    let cx, cy, t = 0; do { cx = rnd(400, WS - 400); cy = rnd(400, WS - 400); t++; } while (t < 50 && isl.some(o => Math.hypot(o.x - cx, o.y - cy) < 650)); isl.push({ x: cx, y: cy });
    const n = ri(2, 3); for (let j = 0; j < n; j++) { const a = rnd(0, TAU), q = j ? rnd(60, 100) : 0; rocks.push({ x: cx + Math.cos(a) * q, y: cy + Math.sin(a) * q, r: j ? rnd(55, 95) : rnd(90, 140), k: 'ile', ph: rnd(0, TAU) }); }
  }
  buildRockGrid();
  for (let i = 0; i < 7 * AREA; i++) { const s = freeSpot(250, 120), n = ri(4, 6); for (let j = 0; j < n; j++) rocks.push({ x: s.x + rnd(-70, 70), y: s.y + rnd(-70, 70), r: rnd(12, 24), k: 'recif', ph: rnd(0, TAU) }); }
  buildRockGrid();
  for (let z = 0; z < 7 * AREA; z++) {
    let cx, cy, ok, t = 0; do { cx = rnd(450, WS - 450); cy = rnd(450, WS - 450); ok = fogs.every(f => Math.hypot(f.x - cx, f.y - cy) > 560); t++; } while (!ok && t < 40);
    const n = ri(3, 4), id = FZ++; for (let i = 0; i < n; i++) fogs.push({ x: cx + rnd(-150, 150), y: cy + rnd(-150, 150), r: rnd(160, 230), z: id, ph: rnd(0, TAU) });
  }
  buildRockGrid();
}
function smoke(x, y) { const id = FZ++; for (let i = 0; i < 3; i++) fogs.push({ x: x + rnd(-60, 60), y: y + rnd(-60, 60), r: rnd(120, 160), z: id, ph: rnd(0, TAU), life: 8, L: 8 }); }

// ——— Combat ———
// les IA épargnent les débutants (niveau 1 à 4), sauf s'ils viennent de les attaquer
const spare = (b, o) => !b.p && o.p && o.lvl < 5 && !(b.hit === o && T - b.lh < 8);
const sideOK = (b, o) => !CL[b.c].w.bs || Math.abs(Math.sin(Math.atan2(o.y - b.y, o.x - b.x) - b.a)) > .6;
function targets(b, rng, n) {
  const out = [], near = (arr, rad, f) => arr.filter(o => !o.dead && f(o)).map(o => [o, Math.hypot(o.x - b.x, o.y - b.y) - rad(o)]).filter(e => e[1] < rng && sideOK(b, e[0])).sort((a, c) => a[1] - c[1]);
  if (b.inv <= 0) for (const e of near(boats, R, o => o !== b && o.team !== b.team && o.inv <= 0 && !spare(b, o) && seen(o, b))) { if (out.length >= n) break; out.push(e[0]); } // protégé : on ne vise que le butin
  if (out.length < n) for (const e of near(lootNear(b.x, b.y, rng + 80), o => LT[o.k].r, o => seenL(o, b) && !(b.npc && o.cv))) { if (out.length >= n) break; out.push(e[0]); }
  return out;
}
const manual = b => b.p && b.inp.fi && Number.isFinite(b.inp.ma) && Number.isFinite(b.inp.md);
function fire(b, salvo, sec) {
  const c = CL[b.c], w = sec ? c.w2 : c.w, rng = w.rng * b.s.rng, man = manual(b) && !sec;
  // visée manuelle : le joueur tire là où est sa souris (dans la limite de la portée), avec +20 % de dégâts
  const ts = man ? [{ x: b.x + Math.cos(b.inp.ma) * Math.min(b.inp.md, rng * .97), y: b.y + Math.sin(b.inp.ma) * Math.min(b.inp.md, rng * .97), vx: 0, vy: 0 }] : targets(b, rng, w.tg); if (!ts.length) return false;
  if (sec) b.cd2 = w.rate * b.s.rate; else if (!salvo) b.cd = w.rate * b.s.rate; if (!sec) b.tgt = man ? null : ts[0];
  const n = w.n + b.s.multi + (salvo ? 2 : 0), sp = w.sp || 0, par = w.par || (sp ? 0 : 12), dm = w.dmg * b.s.dmg * (salvo ? 1.6 : 1) * (b.p ? 1 : BOT_DMG) * (man ? 1.2 : 1) * (b.dmx || 1), r = R(b);
  for (const e of ts) {
    let ex = e.x, ey = e.y;
    if (w.spl) { const vx = e.vx || 0, vy = e.vy || 0; for (let it = 0; it < 3; it++) { const tt = Math.hypot(ex - b.x, ey - b.y) / w.v; ex = e.x + vx * tt * .5; ey = e.y + vy * tt * .5; } } // l'obus vise à mi-chemin de là où sera la cible : on peut l'esquiver
    const an = Math.atan2(ey - b.y, ex - b.x), dd = Math.hypot(ex - b.x, ey - b.y), life = (w.spl ? Math.min(rng, dd) : rng) / w.v + .06;
    const side = Math.sin(an - b.a) > 0 ? 1 : -1, ax = Math.cos(b.a), ay = Math.sin(b.a), sx = Math.cos(b.a + side * Math.PI / 2), sy = Math.sin(b.a + side * Math.PI / 2), gap = Math.min(par * 1.5, r * c.L * 1.5 / n);
    for (let k = 0; k < n; k++) {
      const o = k - (n - 1) / 2; let x, y, a;
      if (w.bs) { x = b.x + ax * o * gap + sx * r * .6; y = b.y + ay * o * gap + sy * r * .6; a = Math.atan2(ey - y, ex - x) + rnd(-.03, .03); }
      else { const q = an + Math.PI / 2; x = b.x + Math.cos(q) * o * par; y = b.y + Math.sin(q) * o * par; a = an + o * sp; }
      shots.push({ x, y, vx: Math.cos(a) * w.v, vy: Math.sin(a) * w.v, l: life, L: life, d: dm, o: b, tm: b.team, sz: w.sz, spl: w.spl, k: w.k, col: b.col, burn: w.burn });
    }
    if (w.bs) burst(b.x + sx * r * .7, b.y + sy * r * .7, 'rgba(255,255,255,.8)', 4, 60);
  }
  return true;
}
function useSkill(b) {
  if (!b || b.dead || b.skcd > 0) return false; const k = CL[b.c].sk;
  if (k === 'boost') { b.boost = 2.5; burst(b.x, b.y, '#fff', 10, 160); }
  else if (k === 'smoke') { smoke(b.x, b.y); burst(b.x, b.y, '#e8eef2', 16, 120); }
  else if (k === 'repair') { b.hp = Math.min(mhp(b), b.hp + mhp(b) * .35); burst(b.x, b.y, '#5be3a1', 14, 140); }
  else if (k === 'dive') { b.dive = 4; b.tgt = null; burst(b.x, b.y, 'rgba(255,255,255,.9)', 14, 120); ring(b.x, b.y, R(b), R(b) * 2.5, .5, 'rgba(255,255,255,.8)'); }
  else if (k === 'salvo') { if (b.hold > 0) return false; b.inv = 0; if (!fire(b, true)) return false; }
  b.skcd = SK[k].cd * b.s.skr * (b.p ? 1 : 1.3); say(b, b.x, b.y - R(b) - 26, 'skill', { s: k }, '#fff', 1); return true;
}
function heal(b, n) {
  const m = mhp(b), x = Math.round(Math.min(n, m - b.hp)); if (x < 1) return;
  b.hp += x; burst(b.x, b.y, '#5be3a1', 12, 140); say(b, b.x, b.y - R(b) - 18, 'heal', { x }, '#5be3a1', 1.2);
}
// abordage : l'équipage d'un navire collé à un ennemi lui inflige des dégâts continus et lui vole un peu d'XP
function aboard(a, v, dt) {
  const p = (CL[a.c].brd || 0) + a.s.brd; if (p <= 0 || a.inv > 0 || v.inv > 0 || (a.hold || 0) > 0) return;
  const d = p * dt * v.s.mres * (a.p ? 1 : BOT_DMG); hurt(v, d, a);
  const x = Math.min(v.xp, d * .5); if (x > 0) { v.xp -= x; gain(a, x); }
  if ((a.brdT || 0) <= T) { a.brdT = T + .5; burst((a.x + v.x) / 2, (a.y + v.y) / 2, '#ffcf3f', 3, 80); }
}
function hurt(o, d, by) {
  if (o.dead || o.hp <= 0 || o.inv > 0) return;
  // prime d'audace : continuer à frapper la même cible augmente les dégâts (+3 %/s, jusqu'à +30 %)
  if (o.s && by && by.s) { if (by.mo !== o.id || T - (by.moL || 0) > 3) { by.mo = o.id; by.mo0 = T; } by.moL = T; d *= 1 + Math.min(.3, (T - by.mo0) * .03); }
  if (o.s && by && by.s && by.lvl - o.lvl > 3) d *= Math.max(.4, 1 - .08 * (by.lvl - o.lvl - 3)); // un gros navire écrase moins facilement un petit
  if (o.s) d *= DMG * (1 - (CL[o.c].arm || 0));
  o.hp -= d; o.lh = T; o.hit = by; o.fl = .12; if (o.s && by && by.s) gain(by, d * .2 * XPR);
  if (o.p && by && (by.s || by.k) && (o.hitT || 0) <= T) { o.hitT = T + .25; fx.push({ k: 'hit', a: Math.round(Math.atan2(by.y - o.y, by.x - o.x) * 100) / 100, n: by.s ? by.name : null, lk: by.k, to: o.id }); }
}
function boom(s) {
  const tc = s.k === 'tentacle' ? '#9b6bd6' : '#ff9f43'; ring(s.x, s.y, 4, s.spl, .4, tc); burst(s.x, s.y, tc, 14, 240);
  for (const o of boats) { if (o === s.o || o.team === s.tm || o.dead) continue; const d = Math.hypot(o.x - s.x, o.y - s.y), m = s.spl + R(o) * .5; if (d < m) hurt(o, s.d * (1 - .65 * d / m), s.o); } // moins de dégâts sur les bords de l'explosion
  if (!s.o.k) for (const o of loot) { if (o.dead || (o.cv && s.o.npc)) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < s.spl + LT[o.k].r) hurt(o, s.d * (d < s.spl * .45 ? 1 : .6), s.o); }
}
// ——— Meilleurs vrais joueurs du jour (remis à zéro à minuit, heure de Paris) ———
let dayTop = [], dayKey = '', weekTop = [], weekKey = '';
let wkV = '', wkT = 0;
const week = () => { const n = Date.now(); if (!wkV || n - wkT > 30000) { wkV = week0(); wkT = n; } return wkV; };
const week0 = () => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toDateString(); };
// la date n'est recalculée qu'une fois toutes les 30 s (ce calcul est lent)
let tdV = '', tdT = 0;
const today = () => { const n = Date.now(); if (!tdV || n - tdT > 30000) { tdV = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }); tdT = n; } return tdV; };
// meilleurs marins du jour / de la semaine : classés par navires coulés (joueurs + IA), les deux comptés à part
const entry = (b, live) => ({ n: b.name, l: b.lvl, c: b.c, s: b.sc, kp: b.kp || 0, ka: b.ka || 0, live: live ? 1 : undefined });
const byKills = (a, c) => (c.kp + c.ka) - (a.kp + a.ka) || c.kp - a.kp || c.l - a.l;
function recordRun(b) {
  if (!b || !b.p || !b.sc) return; const k = today(); if (k !== dayKey) { dayKey = k; dayTop = []; }
  dayTop.push(entry(b)); dayTop.sort(byKills); dayTop = dayTop.slice(0, 5);
  const w = week(); if (w !== weekKey) { weekKey = w; weekTop = []; } weekTop.push(entry(b)); weekTop.sort(byKills); weekTop = weekTop.slice(0, 5);
}
const liveTop = () => boats.filter(b => b.p && !b.dead && b.sc).map(b => entry(b, 1));
function topWeek() { if (week() !== weekKey) { weekKey = week(); weekTop = []; } return weekTop.concat(liveTop()).sort(byKills).slice(0, 5); }
function top() { if (today() !== dayKey) { dayKey = today(); dayTop = []; } return dayTop.concat(liveTop()).sort(byKills).slice(0, 5); }
function sink(v) {
  if (v.gone) return; const k = v.hit; burst(v.x, v.y, v.col, 26, 260); burst(v.x, v.y, '#c98a4b', 14, 180);
  if (k && k.s && !k.dead) {
    // l'XP d'un naufrage est plafonnée à un niveau et demi du vainqueur, pour éviter l'effet boule de neige
    let kx = Math.round(Math.min(40 + v.tot * .12, need(k.lvl) * 1.5) * (k.lvl - v.lvl > 6 ? .3 : 1) * XPR);
    if (v.gh) kx += Math.round(need(k.lvl) * .6 * XPR); if (v.mc) kx += Math.round(need(k.lvl) * .4 * XPR); if (v.boss) { kx += Math.round(need(k.lvl) * 2 * XPR); banner('admiralDead', { n: k.name }); }
    if (v.id === leaderId) { kx += Math.round(need(k.lvl) * XPR); banner('leaderSunk', { n: k.name, v: v.name }); if (k.p) fx.push({ k: 'ev', id: 'leader', to: k.id }); }
    if (k.p && v.lvl >= k.lvl + 5) fx.push({ k: 'ev', id: 'giant', to: k.id });
    k.sc++; if (v.p) k.kp = (k.kp || 0) + 1; else k.ka = (k.ka || 0) + 1; gain(k, kx); say(k, v.x, v.y, 'sunk', { x: kx }, '#ffcf3f', 1.4);
    heal(k, mhp(k) * (k.id === leaderId ? KILL_HEAL / 2 : KILL_HEAL)); // chaque navire coulé rend 30 % de vie (15 % pour le meneur)
  }
  // le navire coulé laisse des épaves à piller
  const n = cl(2 + Math.floor(v.lvl / 4), 2, 8), each = Math.round(Math.min(15 + v.tot * .08, 500) / n);
  for (let i = 0; i < n; i++) { const a = rnd(0, TAU), q = rnd(10, R(v) * 1.6), l = mkL('epave', v.x + Math.cos(a) * q, v.y + Math.sin(a) * q); l.xpo = each; l.life = 25; l.tint = v.col; loot.push(l); }
  if (v.p) { recordRun(v); evs.push({ k: 'death', l: v.lvl, c: v.c, t: Math.round(T - (v.born || T)), by: k && k.s ? (k.p ? 'joueur' : k.npc ? 'escorte' : 'bot') : k && k.k === 'kraken' ? 'kraken' : 'autre', bc: k && k.s ? k.c : null }); }
  if (v.p) deaths.push({ id: v.id, lvl: v.lvl, c: v.c, sc: v.sc, x: Math.round(v.x), y: Math.round(v.y), by: k && k.s ? k.name : null, bl: k && k.s ? k.lvl : 0, bc: k && k.s ? k.c : '', bi: k && k.s && !k.p ? 1 : 0, byk: k && k.k === 'kraken' ? 1 : 0 });
}
function crack(l) {
  const d = LT[l.k], k = l.hit; if (l.gone) return;
  burst(l.x, l.y, l.k === 'coffre' || l.k === 'tresor' ? '#ffcf3f' : l.k === 'kraken' ? '#7a4fb3' : '#b5713a', l.k === 'tonneau' || l.k === 'epave' ? 10 : l.k === 'kraken' ? 60 : 18, l.k === 'kraken' ? 400 : 200);
  if (k && k.s && !k.dead && (l.xpo || d.xp)) { const x = Math.round((l.xpo || d.xp) * k.s.loot * XPR); gain(k, x); say(k, l.x, l.y, 'xp', { x }, l.k === 'coffre' || l.k === 'tresor' ? '#ffcf3f' : '#fff8e7', 1.2); }
  if (d.heal && k && k.s && !k.dead) heal(k, mhp(k) * d.heal);
  if (l.k === 'serpent') { banner('serpentDead', { n: k && k.s ? k.name : null }); if (k && k.p) fx.push({ k: 'ev', id: 'kraken', to: k.id }); }
  if (l.k === 'kraken') { banner('krakenDead', { n: k && k.s ? k.name : null }); if (k && k.p) fx.push({ k: 'ev', id: 'kraken', to: k.id }); }
  if (k && k.p && l.k === 'planche') fx.push({ k: 'ev', id: 'plank', to: k.id });
  if (l.k === 'tresor') banner('treasureDead', { n: k && k.s ? k.name : null });
  if (d.n > 0 && !l.cv) loot.push(mkL(l.k));
}

// ——— Événements : kraken, tempête, convoi, trésor ———
const fpos = (cv, ox, oy) => [cv.x + Math.cos(cv.a) * ox - Math.sin(cv.a) * oy, cv.y + Math.sin(cv.a) * ox + Math.cos(cv.a) * oy];
// les objectifs se défendent : canons du trésor et des navires marchands
function lootGuns(l, dt, n, dmg, rng, rate, col) {
  l.gun -= dt; if (l.gun > 0) return; l.gun = rate;
  let e = null, ed = rng; for (const b of boats) { if (b.dead || b.inv > 0 || b.npc) continue; const d = Math.hypot(b.x - l.x, b.y - l.y); if (d < ed && seen(b, l)) { ed = d; e = b; } }
  if (!e) { l.gun = .5; return; }
  const v = 470, tt = ed / v, ex = e.x + (e.vx || 0) * tt * .6, ey = e.y + (e.vy || 0) * tt * .6, an = Math.atan2(ey - l.y, ex - l.x), life = rng / v + .06, r0 = LT[l.k].r;
  for (let k = 0; k < n; k++) { const a = an + (k - (n - 1) / 2) * .06; shots.push({ x: l.x + Math.cos(a) * r0, y: l.y + Math.sin(a) * r0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: life, L: life, d: dmg, o: l, tm: -2, sz: 5, k: 'ball', col }); }
}
function startEv(k) {
  if (k === 'kraken') { const p = freeSpot(450, 120), l = mkL('kraken', p.x, p.y); l.life = 200; l.slam = 2.5; loot.push(l); banner('kraken'); }
  else if (k === 'storm') {
    const h = Math.random() < .5, s = Math.random() < .5 ? 1 : -1;
    storm = { x: h ? (s > 0 ? -300 : WS + 300) : rnd(600, WS - 600), y: h ? rnd(600, WS - 600) : (s > 0 ? -300 : WS + 300), r: 500, flash: 0 };
    storm.vx = h ? s * 65 : rnd(-20, 20); storm.vy = h ? rnd(-20, 20) : s * 65; banner('storm');
  }
  else if (k === 'convoy') {
    const h = Math.random() < .5, s = Math.random() < .5 ? 1 : -1, y0 = rnd(700, WS - 700);
    convoy = { x: h ? (s > 0 ? 150 : WS - 150) : y0, y: h ? y0 : (s > 0 ? 150 : WS - 150), spd: 48 };
    convoy.tx = h ? (s > 0 ? WS - 150 : 150) : convoy.x; convoy.ty = h ? convoy.y : (s > 0 ? WS - 150 : 150); convoy.a = Math.atan2(convoy.ty - convoy.y, convoy.tx - convoy.x);
    for (const [ox, oy] of [[0, 0], [-110, -80], [-110, 80]]) { const l = mkL('marchand', convoy.x, convoy.y); l.cv = convoy; l.ox = ox; l.oy = oy; l.hp = l.mhp = 1600; l.xpo = 1000; l.gun = rnd(1, 2); loot.push(l); }
    const lv = Math.max(10, Math.round(avgLvl()) + 1);
    for (const [ox, oy] of [[90, -150], [90, 150]]) { const e = mk({ lvl: lv, npc: 1 }); e.name = '§escorte'; e.col = '#2d5f8a'; e.team = -1; e.c = lv >= 20 ? 'dreadnought' : lv >= 15 ? 'vaisseau' : 'fregate'; e.hpx = 4; e.dmx = 1.7; e.hp = mhp(e); e.cv = convoy; e.ox = ox; e.oy = oy; e.x = convoy.x; e.y = convoy.y + oy; e.inv = 0; boats.push(e); }
    banner('convoy');
  }
  else if (k === 'whirl') { const p = freeSpot(350, 200); whirl = { x: p.x, y: p.y, r: 280, life: 45 }; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = mkL('tonneau', p.x + Math.cos(a) * 200, p.y + Math.sin(a) * 200); l.life = 45; loot.push(l); } banner('whirl'); }
  else if (k === 'ghosts' || k === 'admiral') {
    const lv = k === 'admiral' ? Math.max(18, Math.round(avgLvl()) + 5) : Math.max(8, Math.round(avgLvl()) + 2), p = freeSpot(300, 150);
    for (let i = 0; i < (k === 'admiral' ? 1 : 3); i++) {
      const e = mk({ lvl: lv, npc: 1 }); e.team = -1; e.lvl = lv; e.x = cl(p.x + (i - 1) * 140, 60, WS - 60); e.y = p.y; e.inv = 0; e.hold = 0;
      if (k === 'admiral') { e.name = '§amiral'; e.col = '#1c2b4a'; e.trim = '#ffcf3f'; e.c = 'forteresse'; e.hpx = 6; e.dmx = 1.3; e.boss = 1; e.life = 180; e.sty = 'chasseur'; }
      else { e.name = '§fantome'; e.col = '#7fe0c0'; e.sail = '#dff7ef'; e.c = lv >= 20 ? 'dreadnought' : lv >= 15 ? 'vaisseau' : lv >= 10 ? 'fregate' : 'drakkar'; e.hpx = 2; e.dmx = 1.15; e.gh = 1; e.sty = 'chasseur'; }
      e.hp = mhp(e); boats.push(e);
    }
    if (k === 'ghosts') ghostT = 120; banner(k === 'admiral' ? 'admiral' : 'ghosts');
  }
  else if (k === 'serpent') { const p = freeSpot(450, 120), l = mkL('serpent', p.x, p.y); l.life = 180; l.bite = 2; loot.push(l); banner('serpent'); }
  else if (k === 'tresor') { let p = freeSpot(300, 60); if (Math.random() < .5) { const f = pick(fogs.filter(f => f.life === undefined)); if (f && !inRock(f.x, f.y, 50)) p = { x: f.x, y: f.y }; } loot.push(mkL('tresor', p.x, p.y)); banner('treasure'); }
}
function spawnMerchant() {
  const lv = cl(Math.round(avgLvl() + rnd(-3, 3)), 2, 30), e = mk({ lvl: lv, npc: 1 });
  e.name = '§marchand'; e.team = -1; e.mc = 1; e.lvl = lv; e.col = '#8b5a2b'; e.sail = '#f3e6c8'; e.trim = '#e8b93a'; e.flag = 'anchor'; e.pat = 'plain'; e.wake = 'none';
  e.c = lv >= 15 ? 'vaisseau' : lv >= 5 ? 'fregate' : 'nef'; e.hpx = 1.8; e.dmx = .9; e.hp = mhp(e); e.inv = 0; e.hold = 0; e.life = 240; e.t = 1e9;
  const s = freeSpot(200, 120); e.x = s.x; e.y = s.y; e.wx = WS - s.x; e.wy = WS - s.y; boats.push(e);
}
function events(dt) {
  plankT -= dt;
  if (plankT <= 0) { plankT = rnd(25, 40) / AREA / 2; if (loot.filter(l => l.k === 'planche' && !l.dead).length < 12 * AREA) { const l = mkL('planche'); l.life = 60; loot.push(l); } }
  // de temps en temps, un grand navire marchand armé traverse la mer (même allure pour tous, niveau proche de celui des joueurs)
  merchT -= dt;
  if (merchT <= 0) { merchT = rnd(50, 80) / AREA; if (humans().length && boats.filter(b => b.mc && !b.dead).length < AREA) spawnMerchant(); }
  for (const b of boats) if (b.mc && (b.life -= dt) <= 0) { b.gone = true; b.dead = true; }
  ev.t -= dt;
  // au plus 2 grands événements en même temps, pour ne pas surcharger l'écran
  const active = (loot.some(l => l.k === 'kraken' || l.k === 'serpent') ? 1 : 0) + (storm ? 1 : 0) + (convoy ? 1 : 0) + (whirl ? 1 : 0) + (boats.some(b => b.gh || b.boss) ? 1 : 0) + (loot.some(l => l.k === 'tresor') ? 1 : 0);
  if (ev.t <= 0 && active >= 2) ev.t = 10;
  if (ev.t <= 0) { ev.t = rnd(40, 65); const o = []; if (!loot.some(l => l.k === 'kraken')) o.push('kraken'); if (!storm) o.push('storm'); if (!convoy) o.push('convoy'); if (!loot.some(l => l.k === 'tresor')) o.push('tresor'); if (!whirl) o.push('whirl'); if (!boats.some(b => b.gh)) o.push('ghosts'); if (!loot.some(l => l.k === 'serpent' || l.k === 'kraken') && avgLvl() >= 8) o.push('serpent'); if (!boats.some(b => b.boss) && avgLvl() >= 12) o.push('admiral'); if (o.length) startEv(pick(o)); }
  if (whirl && (whirl.life -= dt) <= 0) whirl = null;
  if (ghostT > 0 && (ghostT -= dt) <= 0) for (const b of boats) if (b.gh) { b.gone = true; b.dead = true; }
  for (const b of boats) if (b.boss && (b.life -= dt) <= 0) { b.gone = true; b.dead = true; banner('admiralGone'); }
  if (storm) { storm.x += storm.vx * dt; storm.y += storm.vy * dt; storm.flash -= dt; if (Math.random() < dt * .5) storm.flash = .18; if (storm.x < -700 || storm.x > WS + 700 || storm.y < -700 || storm.y > WS + 700) storm = null; }
  if (convoy) {
    const d = Math.hypot(convoy.tx - convoy.x, convoy.ty - convoy.y), alive = loot.some(l => l.cv === convoy && !l.dead);
    if (d < 40 || !alive) { for (const l of loot) if (l.cv === convoy) { l.gone = true; l.dead = true; } for (const b of boats) if (b.cv === convoy) { b.gone = true; b.dead = true; } if (d < 40 && alive) banner('convoyGone'); convoy = null; }
    else { convoy.x += Math.cos(convoy.a) * convoy.spd * dt; convoy.y += Math.sin(convoy.a) * convoy.spd * dt; }
  }
}
const inStorm = (x, y) => storm && Math.hypot(x - storm.x, y - storm.y) < storm.r;
function wind(o) { const a = Math.atan2(o.y - storm.y, o.x - storm.x) + Math.PI / 2; return [Math.cos(a) * 75, Math.sin(a) * 75]; }

// ——— IA des bots ———
function engage(b, e, ed, rng) {
  if ((CL[b.c].ram || 1) >= 1.9) { b.tx = e.x + (e.vx || 0) * .3; b.ty = e.y + (e.vy || 0) * .3; b.f = 1; return; }
  if (CL[b.c].w.bs && ed < rng * .95) { const h = Math.atan2(e.y - b.y, e.x - b.x), h1 = h + Math.PI / 2, h2 = h - Math.PI / 2, hh = Math.abs(angD(h1, b.a)) < Math.abs(angD(h2, b.a)) ? h1 : h2, h3 = hh + (ed < rng * .5 ? (hh === h1 ? .4 : -.4) : 0); b.tx = b.x + Math.cos(h3) * 200; b.ty = b.y + Math.sin(h3) * 200; b.f = .75; }
  else { b.tx = e.x; b.ty = e.y; b.f = ed < rng * .65 ? .25 : .85; }
}
function ai(b, dt) {
  const c = CL[b.c], rng = c.w.rng * b.s.rng, hpR = b.hp / mhp(b);
  b.t -= dt; if (b.t <= 0) { b.t = rnd(3, 6); const s = freeSpot(150, 80); b.wx = s.x; b.wy = s.y; }
  if (b.mc) { // le marchand suit sa route sans poursuivre personne ; ses canons tirent tout seuls sur qui s'approche
    if (Math.hypot(b.wx - b.x, b.wy - b.y) < 200) { const s = freeSpot(150, 80); b.wx = s.x; b.wy = s.y; }
    b.tx = b.wx; b.ty = b.wy; b.f = .6; return;
  }
  if (b.cv) {
    const [fx2, fy2] = fpos(b.cv, b.ox, b.oy); let e = null, ed = 460;
    for (const o of boats) if (!o.npc && !o.dead && o.inv <= 0 && !spare(b, o) && seen(o, b)) { const d = Math.hypot(o.x - b.cv.x, o.y - b.cv.y); if (d < ed) { ed = d; e = o; } }
    if (e) engage(b, e, Math.hypot(e.x - b.x, e.y - b.y), rng); else { b.tx = fx2; b.ty = fy2; b.f = cl(Math.hypot(fx2 - b.x, fy2 - b.y) / 80, .3, 1); }
    if (b.skcd <= 0 && e) useSkill(b); return;
  }
  // prudent : fuit tôt ; chasseur : poursuit de plus loin, surtout les joueurs ; pilleur : préfère le butin
  const sty = b.sty || 'normal', far = sty === 'chasseur' ? 2.2 : sty === 'pilleur' ? (T - (b.lh || -9) < 4 ? 1.3 : .6) : 1.3, gap = sty === 'prudent' ? 1 : 3;
  let e = null, ed = rng * far, th = null, td = 720;
  for (const o of boats) if (o !== b && !o.dead && o.team !== b.team && seen(o, b)) { const d0 = Math.hypot(o.x - b.x, o.y - b.y), d = sty === 'chasseur' && o.p ? d0 * .7 : d0; if (d < ed && o.inv <= 0 && o.lvl >= b.lvl - 6 && !spare(b, o)) { ed = d; e = o; } if (d0 < td && (o.lvl > b.lvl + gap || CL[o.c].t >= c.t + 2)) { td = d0; th = o; } }
  if (e) ed = Math.hypot(e.x - b.x, e.y - b.y);
  b.tx = b.wx; b.ty = b.wy; b.f = .7;
  if (th && (hpR < (sty === 'prudent' ? .8 : .6) || th.lvl > b.lvl + 5 || CL[th.c].t >= c.t + 2 || !e || e === th)) {
    // fuite en zigzag pour esquiver les tirs du gros navire
    const fa = Math.atan2(b.y - th.y, b.x - th.x) + Math.sin(T * 2.5 + b.id) * .7;
    b.tx = cl(b.x + Math.cos(fa) * 300, 100, WS - 100); b.ty = cl(b.y + Math.sin(fa) * 300, 100, WS - 100); b.f = 1;
    if (canHide(b)) { let f0 = null, fd = 900; for (const f of fogs) { const d = Math.hypot(f.x - b.x, f.y - b.y); if (d < fd) { fd = d; f0 = f; } } if (f0) { b.tx = f0.x; b.ty = f0.y; } }
    if (b.skcd <= 0 && (c.sk === 'boost' || c.sk === 'smoke' || c.sk === 'dive')) useSkill(b);
  }
  else if (e) { engage(b, e, ed, rng); if (b.skcd <= 0 && c.sk === 'salvo') useSkill(b); }
  else {
    let l = b.lt && !b.lt.dead && (b.ltT || 0) > T ? b.lt : null, ld = 750;
    if (!l) for (const o of lootNear(b.x, b.y, 750)) { if (o.dead || !seenL(o, b)) continue; const d = Math.hypot(o.x - b.x, o.y - b.y) * (o.k === 'tresor' || o.k === 'kraken' ? (b.lvl > 8 ? .5 : 3) : 1); if (d < ld) { ld = d; l = o; } }
    if (l && l !== b.lt) { b.lt = l; b.ltT = T + .5; }
    if (l) { b.tx = l.x; b.ty = l.y; b.f = Math.hypot(l.x - b.x, l.y - b.y) < rng * .6 ? .2 : .8; }
  }
  if (b.skcd <= 0 && c.sk === 'repair' && hpR < .45) useSkill(b);
}

// ——— Un pas de simulation ———
function tick(dt) {
  if (!boats.some(b => b.p)) return; // personne en mer : le monde attend
  T += dt;
  // garder assez de navires sur la carte : les bots comblent les places libres
  const nb = boats.filter(b => !b.p && !b.npc).length, want = Math.max(4, BOTS - humans().length);
  if (!QUIET && nb < want) boats.push(mk({ lvl: botLevel(want) }));
  else if (nb > want + 1) { const v = boats.find(b => !b.p && !b.npc && b.lvl < 6); if (v) { v.gone = true; v.dead = true; } }
  // chef de la flotte : le navire le plus avancé (niveau 8 minimum)
  { let top = null; for (const b of boats) if (!b.npc && !b.dead && (!top || b.lvl > top.lvl || (b.lvl === top.lvl && b.sc > top.sc))) top = b; leaderId = top && top.lvl >= 8 ? top.id : 0; }
  for (const f of fogs) if (f.life !== undefined) f.life -= dt; fogs = fogs.filter(f => f.life === undefined || f.life > 0);
  for (const b of boats) b.fz = zoneAt(b.x, b.y); TN++; for (const l of loot) if (LT[l.k].mv || l.cv || l.k === 'kraken' || (l.id + TN) % 10 === 0 || l.fz === undefined) l.fz = zoneAt(l.x, l.y);
  if (!QUIET) events(dt);
  for (const b of boats) {
    if (b.dead) continue; const c = CL[b.c];
    if (b.p) { b.f = b.inp.f; b.tx = b.x + Math.cos(b.inp.a) * 100; b.ty = b.y + Math.sin(b.inp.a) * 100; } else if ((b.id + TN) % 2 === 0) ai(b, dt * 2); // l'IA réfléchit une fois sur deux (moins de calcul pour le serveur)
    let want = Math.atan2(b.ty - b.y, b.tx - b.x); if (!b.p) want = avoid(b, want, R(b));
    const tr = 3.4 / Math.pow(c.sz, 1.3); b.a += cl(angD(want, b.a), -tr * dt, tr * dt);
    const sp = 170 * c.spd * b.s.spd * b.f * (1 - Math.min(b.lvl, 30) * .006) * (b.boost > 0 ? 1.7 : 1) * (b.dive > 0 ? 1.15 : 1);
    b.vx = Math.cos(b.a) * sp; b.vy = Math.sin(b.a) * sp; let wx = 0, wy = 0; if (inStorm(b.x, b.y)) [wx, wy] = wind(b);
    if (whirl) { const dx = whirl.x - b.x, dy = whirl.y - b.y, d = Math.hypot(dx, dy); if (d < whirl.r) { const p = 1 - d / whirl.r, pull = 40 + 110 * p, a = Math.atan2(dy, dx); wx += Math.cos(a) * pull + Math.cos(a + Math.PI / 2) * 120 * p; wy += Math.sin(a) * pull + Math.sin(a + Math.PI / 2) * 120 * p; if (d < 70 && b.inv <= 0) { b.hp = Math.max(mhp(b) * .1, b.hp - mhp(b) * .05 * dt); b.lh = T; } } }
    b.svx = b.vx + wx; b.svy = b.vy + wy; b.x = cl(b.x + (b.vx + wx) * dt, 20, WS - 20); b.y = cl(b.y + (b.vy + wy) * dt, 20, WS - 20); { const p = hullPush(b.x, b.y, b.a, R(b), CL[b.c].L, rocksNear(b.x, b.y)); b.x = p[0]; b.y = p[1]; }
    // hors combat depuis 5 s : +3 % de vie par seconde
    b.hp = Math.min(mhp(b), b.hp + (b.s.reg * mhp(b) / 100 + (c.reg || 0) + (T - (b.lh || 0) > 5 ? mhp(b) * .03 : 0)) * dt); b.cd -= dt; b.fl -= dt; b.skcd -= dt; b.boost -= dt; b.rc -= dt; b.inv -= dt; b.hold -= dt; if (b.dive > 0) b.dive -= dt;
    // en feu : le navire perd des points de vie pendant quelques secondes
    if (b.burnT > T) hurt(b, b.burnD * dt, b.burnBy);
    const sub = b.dive > 0; // en plongée : impossible de tirer
    if (b.cd <= 0 && b.hold <= 0 && !sub) fire(b);
    if (c.w2) { b.cd2 -= dt; if (b.cd2 <= 0 && b.hold <= 0 && !sub) fire(b, false, true); }
    const ta = manual(b) ? b.inp.ma : b.tgt && !b.tgt.dead ? Math.atan2(b.tgt.y - b.y, b.tgt.x - b.x) : b.a; b.aim += angD(ta, b.aim) * Math.min(1, dt * 8);
  }
  // collisions entre navires et éperonnage
  for (let i = 0; i < boats.length; i++) for (let j = i + 1; j < boats.length; j++) {
    const a = boats[i], b = boats[j]; if (a.dead || b.dead) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = (R(a) + R(b)) * .75;
    if (a.team !== b.team && d < (R(a) + R(b)) * .95) { aboard(a, b, dt); aboard(b, a, dt); }
    if (d >= m || d === 0) continue;
    const nx = dx / d, ny = dy / d, ma = mass(a), mb = mass(b), ov = m - d;
    a.x -= nx * ov * mb / (ma + mb); a.y -= ny * ov * mb / (ma + mb); b.x += nx * ov * ma / (ma + mb); b.y += ny * ov * ma / (ma + mb);
    const cs = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (cs > 35 && a.team !== b.team && a.rc <= 0 && b.rc <= 0) {
      const ra = (CL[a.c].ram || 1) * a.s.ram, rb2 = (CL[b.c].ram || 1) * b.s.ram;
      const da = Math.min(30 * rb2, .07 * cs * Math.sqrt(mb / ma) * rb2) * a.s.mres * (b.p ? 1 : BOT_DMG), db = Math.min(30 * ra, .07 * cs * Math.sqrt(ma / mb) * ra) * b.s.mres * (a.p ? 1 : BOT_DMG);
      hurt(a, da, b); hurt(b, db, a); a.rc = b.rc = .6; burst((a.x + b.x) / 2, (a.y + b.y) / 2, '#c98a4b', 8, 160);
      if (db > 8) say(a, b.x, b.y - R(b), 'ram', null, '#ff9f43', 1); if (da > 8) say(b, a.x, a.y - R(a), 'ram', null, '#ff9f43', 1);
    }
  }
  for (const l of loot) {
    if (l.dead) continue; const d = LT[l.k]; l.fl -= dt;
    if (l.life !== undefined) { l.life -= dt; if (l.life <= 0) { l.gone = true; l.dead = true; if (l.k === 'kraken') banner('krakenGone'); continue; } }
    if (l.k === 'serpent') {
      let n = null, nd = 900; for (const b of boats) { if (b.inv > 0 || b.npc) continue; const dd = Math.hypot(b.x - l.x, b.y - l.y); if (dd < nd) { nd = dd; n = b; } }
      const tx = n ? n.x : (l.wx || WS / 2), ty = n ? n.y : (l.wy || WS / 2); if (!n && (!l.wx || Math.hypot(tx - l.x, ty - l.y) < 80)) { const s = freeSpot(200, 60); l.wx = s.x; l.wy = s.y; }
      const a = Math.atan2(ty - l.y, tx - l.x), sp = n && nd < 250 ? 105 : 75; l.a += angD(a, l.a) * Math.min(1, dt * 1.6); l.x = cl(l.x + Math.cos(l.a) * sp * dt, 40, WS - 40); l.y = cl(l.y + Math.sin(l.a) * sp * dt, 40, WS - 40); l.vx = Math.cos(l.a) * sp; l.vy = Math.sin(l.a) * sp;
      // morsure : grosse attaque devant sa tête
      l.bite -= dt; if (l.bite <= 0) { l.bite = 1.4; const hx = l.x + Math.cos(l.a) * d.r, hy = l.y + Math.sin(l.a) * d.r; let bit = false; for (const b of boats) if (Math.hypot(b.x - hx, b.y - hy) < 70 + R(b) * .6) { hurt(b, 38, l); bit = true; } if (bit) ring(hx, hy, 20, 90, .4, '#5be3a1'); }
      pushOut(l, d.r * .5); continue;
    }
    if (l.k === 'kraken') {
      let n = null, nd = 700; for (const b of boats) { const dd = Math.hypot(b.x - l.x, b.y - l.y); if (dd < nd) { nd = dd; n = b; } }
      if (n) { const a = Math.atan2(n.y - l.y, n.x - l.x); l.a += angD(a, l.a) * Math.min(1, dt * 2); l.x += Math.cos(l.a) * 40 * dt; l.y += Math.sin(l.a) * 40 * dt; l.vx = Math.cos(l.a) * 40; l.vy = Math.sin(l.a) * 40; }
      l.slam -= dt; if (l.slam <= 0) { l.slam = 1.8; ring(l.x, l.y, d.r, d.r + 130, .5, '#c9a6ff'); for (const b of boats) if (Math.hypot(b.x - l.x, b.y - l.y) < d.r + 130 + R(b) * .5) hurt(b, 34, l); }
      // tentacules lancées vers les navires proches : la zone d'impact est marquée, on peut l'esquiver
      l.tent = (l.tent === undefined ? 2 : l.tent) - dt;
      if (l.tent <= 0) { l.tent = 2.4; const vic = boats.filter(b => !b.dead && !b.npc && b.inv <= 0 && Math.hypot(b.x - l.x, b.y - l.y) < 650).sort((a, b) => Math.hypot(a.x - l.x, a.y - l.y) - Math.hypot(b.x - l.x, b.y - l.y)).slice(0, 2);
        for (const b of vic) { const ex = b.x + (b.vx || 0) * .5, ey = b.y + (b.vy || 0) * .5, a = Math.atan2(ey - l.y, ex - l.x), x0 = l.x + Math.cos(a) * d.r, y0 = l.y + Math.sin(a) * d.r, dist = Math.hypot(ex - x0, ey - y0), ft = 1.2;
          shots.push({ x: x0, y: y0, vx: Math.cos(a) * dist / ft, vy: Math.sin(a) * dist / ft, l: ft, L: ft, d: 45, o: l, tm: -2, sz: 8, spl: 60, k: 'tentacle', col: '#7a4fb3' }); } }
      pushOut(l, d.r * .6); continue;
    }
    if (l.cv) { lootGuns(l, dt, 2, 16, 300, 2.2, '#e8b04a'); const [fx2, fy2] = fpos(l.cv, l.ox, l.oy), dd = Math.hypot(fx2 - l.x, fy2 - l.y); l.a += angD(dd > 8 ? Math.atan2(fy2 - l.y, fx2 - l.x) : l.cv.a, l.a) * Math.min(1, dt * 3); const v = Math.min(110, dd * 2); l.x += Math.cos(l.a) * v * dt; l.y += Math.sin(l.a) * v * dt; l.vx = Math.cos(l.a) * v; l.vy = Math.sin(l.a) * v; continue; }
    if (d.mv) {
      l.t -= dt; if (l.t <= 0) { l.t = rnd(3, 7); const s = freeSpot(100, 60); l.wx = s.x; l.wy = s.y; }
      let tx = l.wx, ty = l.wy, f = .45, n = null, nd = 280 * 280; for (const b of boats) { const dx = b.x - l.x, dy = b.y - l.y; if (dx > 280 || dx < -280 || dy > 280 || dy < -280) continue; const dd = dx * dx + dy * dy; if (dd < nd) { nd = dd; n = b; } }
      if (n) { tx = l.x * 2 - n.x; ty = l.y * 2 - n.y; f = 1; }
      const want = avoid(l, Math.atan2(ty - l.y, tx - l.x), d.r); l.a += cl(angD(want, l.a), -2.5 * dt, 2.5 * dt);
      const mv = d.mv * (l.slow > T ? .4 : 1); l.x = cl(l.x + Math.cos(l.a) * mv * f * dt, 30, WS - 30); l.y = cl(l.y + Math.sin(l.a) * mv * f * dt, 30, WS - 30); l.vx = Math.cos(l.a) * mv * f; l.vy = Math.sin(l.a) * mv * f;
    } else { if ((l.id + TN) % 4) continue; const d4 = dt * 4; // le petit butin immobile n'est recalculé qu'une fois sur quatre
      l.x = cl(l.x + Math.cos(l.ph) * 6 * d4, 30, WS - 30); l.y = cl(l.y + Math.sin(l.ph) * 6 * d4, 30, WS - 30); l.a += d4 * .15;
      if (inStorm(l.x, l.y)) { const [wx, wy] = wind(l); l.x = cl(l.x + wx * .6 * d4, 30, WS - 30); l.y = cl(l.y + wy * .6 * d4, 30, WS - 30); }
      pushOut(l, d.r); continue; }
    if (inStorm(l.x, l.y)) { const [wx, wy] = wind(l); l.x = cl(l.x + wx * .6 * dt, 30, WS - 30); l.y = cl(l.y + wy * .6 * dt, 30, WS - 30); }
    pushOut(l, d.r);
  }
  buildLootGrid();
  // les projectiles avancent en deux demi-pas : rien ne passe à travers une cible même à 20 calculs par seconde
  const hd = dt / 2;
  for (const s of shots) for (let sub = 0; sub < 2 && s.l > 0; sub++) {
    if (inStorm(s.x, s.y)) { const r = rnd(-2.2, 2.2) * hd, c = Math.cos(r), sn = Math.sin(r), vx = s.vx; s.vx = vx * c - s.vy * sn; s.vy = vx * sn + s.vy * c; }
    s.x += s.vx * hd; s.y += s.vy * hd; s.l -= hd; if (s.l <= 0) { if (s.spl) boom(s); break; }
    if (s.spl && s.l > s.L * .25) continue; // l'obus de mortier vole au-dessus de tout jusqu'à la fin de sa course
    if (inRock(s.x, s.y, 0)) { s.l = 0; burst(s.x, s.y, '#f4d58d', 4, 90); break; }
    let hit = null; for (const o of boats) { const dx = o.x - s.x, dy = o.y - s.y; if (dx > 200 || dx < -200 || dy > 200 || dy < -200) continue; if (o !== s.o && o.team !== s.tm && !o.dead && Math.hypot(dx, dy) < R(o) + s.sz) { hit = o; break; } }
    if (!hit) for (const o of lootNear(s.x, s.y, 80)) if (!o.dead && !s.o.k && !(o.cv && s.o.npc) && Math.hypot(o.x - s.x, o.y - s.y) < LT[o.k].r + s.sz) { hit = o; break; }
    if (hit) { s.l = 0; if (s.spl) boom(s); else { hurt(hit, s.d, s.o); if (s.burn && hit.s && !hit.dead) { hit.burnT = T + s.burn; hit.burnD = s.d * .3; hit.burnBy = s.o; } burst(s.x, s.y, s.burn ? '#ff9f43' : '#fff8e7', s.burn ? 6 : 3, 90); } }
  }
  shots = shots.filter(s => s.l > 0);
  for (const b of boats) if (!b.dead && b.hp <= 0) { b.dead = true; sink(b); }
  for (const l of loot) if (!l.dead && l.hp <= 0) { l.dead = true; crack(l); }
  boats = boats.filter(b => !b.dead); loot = loot.filter(l => !l.dead);
}

// ——— Joueurs ———
const clean = (v, list, def) => list.includes(v) ? v : def;
function addPlayer(m) {
  let name = String(m.name || '').replace(/[\u0000-\u001f<>§]/g, '').trim().slice(0, 14) || 'Moussaillon';
  if (rude(name)) name = 'Moussaillon'; // pseudo grossier : remplacé
  const v = a => a.map(h => h[0]); // le style débloqué est choisi par le joueur : on vérifie seulement qu'il existe
  const b = mk({ p: 1, name, hull: clean(m.hull, v(HULLS).concat(v(PREM.hull)), '#ff6b57'), sail: clean(m.sail, v(SAILS).concat(v(PREM.sail)), '#fff8e7'), flag: clean(m.flag, Object.keys(FLAGS_ALL), 'skull'), trim: clean(m.trim, v(TRIMS), '#fff8e7'), pat: clean(m.pat, v(PATS).concat(v(PREM.pat)), 'plain'), wake: clean(m.wake, ['none'].concat(v(PREM.wake)), 'none') });
  boats.push(b); b.fz = zoneAt(b.x, b.y); b.born = T; evs.push({ k: 'join' });
  // deux pêcheurs lents tout près : le nouveau joueur peut couler quelque chose dès la première minute
  if (loot.filter(l => l.k === 'peche').length < 12) for (let i = 0, n = 0; i < 12 && n < 1; i++) { const a = rnd(0, TAU), x = b.x + Math.cos(a) * rnd(200, 300), y = b.y + Math.sin(a) * rnd(200, 300); if (x < 60 || y < 60 || x > WS - 60 || y > WS - 60 || inRock(x, y, 40)) continue; const l = mkL('peche', x, y); l.slow = T + 25; l.life = 60; loot.push(l); n++; }
  return b.id;
}
// filtre de mots grossiers (pseudos et avis) : on compare sans accents, chiffres déguisés ni séparateurs
const RUDE = ['merde', 'connard', 'connasse', 'salope', 'pute', 'putain', 'encule', 'enculer', 'nique', 'niquer', 'batard', 'bite', 'couille', 'pd', 'pede', 'tapette', 'negro', 'negre', 'bougnoul', 'youpin', 'nazi', 'hitler', 'fuck', 'fucker', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'fag', 'retard', 'rape', 'puta', 'puto', 'mierda', 'cabron', 'gilipollas', 'maricon', 'polla', 'cono', 'zorra', 'joder', 'scheisse', 'hure', 'fotze', 'cazzo', 'stronzo', 'vaffanculo', 'caralho', 'porra', 'viado', 'buceta'];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/0/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't');
function rude(s) { const n = norm(s), words = n.split(/[^a-z]+/), joined = n.replace(/[^a-z]/g, ''); return RUDE.some(w => words.includes(w) || (w.length >= 5 && joined.includes(w))); }
function cleanText(s) { return String(s).split(/(\s+)/).map(w => rude(w) ? '*'.repeat(Math.min(6, w.length)) : w).join(''); }
const byId = id => boats.find(b => b.id === id && !b.dead);
function removePlayer(id) { const b = byId(id); if (b) { recordRun(b); evs.push({ k: 'quit', l: b.lvl, c: b.c, t: Math.round(T - (b.born || T)) }); b.gone = true; b.dead = true; boats = boats.filter(x => x !== b); } }
function input(id, m) { const b = byId(id); if (!b) return; const a = +m.a, f = +m.f, ma = +m.ma, md = +m.md; if (Number.isFinite(a)) b.inp.a = a; if (Number.isFinite(f)) b.inp.f = cl(f, 0, 1);
  b.inp.fi = m.fi ? 1 : 0; if (Number.isFinite(ma)) b.inp.ma = ma; if (Number.isFinite(md)) b.inp.md = cl(md, 0, 2000); }
function skill(id) { useSkill(byId(id)); }
function pickOffer(id, oid, i) {
  const b = byId(id); if (!b || !b.offer || b.offer.id !== oid) return;
  const o = b.offer, v = o.o[i | 0]; if (v === undefined) return; b.offer = null;
  if (o.k === 'evo') { evolve(b, v); evs.push({ k: 'evo', c: v }); } else { BON[v].f(b.s); b.hp = Math.min(b.hp, mhp(b)); }
  offer(b);
}

// ——— Ce qu'on envoie aux joueurs ———
const r0 = v => Math.round(v), r2 = v => Math.round(v * 100) / 100;
function board() {
  if (boardT === T && boardCache) return boardCache;
  if (MODE === 'team') { const sc = [0, 0, 0, 0]; for (const b of boats) if (!b.npc && b.team >= 0 && b.team < 4) sc[b.team] += b.lvl; boardCache = TEAMS.map((t, i) => ({ t: i, v: sc[i] })).sort((a, b) => b.v - a.v); }
  else boardCache = boats.filter(b => !b.npc).sort((a, b) => b.lvl - a.lvl || b.sc - a.sc).slice(0, 6).map(b => ({ i: b.id, n: b.name, v: b.lvl, p: b.p ? 1 : 0 }));
  boardT = T; return boardCache;
}
function welcome() {
  return { t: 'w', mode: MODE, ws: WS, rocks: rocks.map(k => [r0(k.x), r0(k.y), r0(k.r), k.k === 'ile' ? 1 : 0, r2(k.ph)]), fogs: fogs.filter(f => f.life === undefined).map(f => [r0(f.x), r0(f.y), r0(f.r), f.z, r2(f.ph)]) };
}
// cache = mémoire par connexion : on n'envoie le butin immobile que s'il change, et la mini-carte 2 fois par seconde
function snapshotFor(id, vw, vh, px, py, cache) {
  cache = cache || {}; const LS = cache.ls || (cache.ls = new Map()); cache.n = (cache.n || 0) + 1; const full = cache.n % 10 === 1;
  const me = byId(id), viewer = me || { x: px, y: py, fz: -1, team: null };
  const hw = Math.min(vw || 1200, 2600) + 200, hh = Math.min(vh || 900, 2000) + 200, inV = o => Math.abs(o.x - viewer.x) < hw && Math.abs(o.y - viewer.y) < hh;
  const big = loot.filter(l => l.k === 'tresor' || l.k === 'kraken' || l.k === 'serpent' || l.k === 'coffre' || l.k === 'marchand' || l.k === 'planche');
  const outL = [], vis = new Set();
  for (const l of loot) {
    if (!inV(l) || !seenL(l, viewer)) continue; vis.add(l.id);
    const mv = LT[l.k].mv || l.cv || l.k === 'kraken', sig = r0(l.hp) + '|' + (l.fl > 0 ? 1 : 0) + '|' + (mv ? '' : Math.round(l.x / 12) + ',' + Math.round(l.y / 12));
    if (!mv && LS.get(l.id) === sig) continue; LS.set(l.id, sig);
    outL.push({ i: l.id, k: l.k, x: r0(l.x), y: r0(l.y), vx: l.vx ? r0(l.vx) : undefined, vy: l.vy ? r0(l.vy) : undefined, a: r2(l.a), h: r0(l.hp), H: lmhp(l), cv: l.cv ? 1 : 0, tn: l.tint, lf: l.life !== undefined ? r2(l.life) : undefined, fl: l.fl > 0 ? 1 : 0 });
  }
  const lr = []; for (const k of LS.keys()) if (!vis.has(k)) { lr.push(k); LS.delete(k); }
  return {
    t: 'st', tm: Math.round(T * 1000), cx: r0(viewer.x), cy: r0(viewer.y), ld: leaderId,
    me: me ? { i: me.id, x: r0(me.x), y: r0(me.y), l: me.lvl, xp: r0(me.xp), nd: need(me.lvl), sc: me.sc, c: me.c, h: r0(me.hp), H: r0(mhp(me)), sk: r2(Math.max(0, me.skcd)), skm: r2(SK[CL[me.c].sk].cd * me.s.skr), fz: me.fz, tm: me.team, rng: r0(CL[me.c].w.rng * me.s.rng), of: me.offer, st: [me.s.dmg, me.s.rate, me.s.rng, me.s.multi, me.s.spd, me.s.reg, me.s.ram, me.s.brd, me.s.mres, me.s.hp].map(r2) } : null,
    b: boats.filter(b => inV(b) && (b === me || seen(b, viewer))).map(b => ({ i: b.id, x: r0(b.x), y: r0(b.y), vx: r0(b.svx || 0), vy: r0(b.svy || 0), a: r2(b.a), m: r2(b.aim), c: b.c, l: b.lvl, h: r0(b.hp), H: r0(mhp(b)), col: b.col, sl: b.sail, fg: b.flag, tc: b.trim, pt: b.pat, wk: b.wake !== 'none' ? b.wake : undefined, n: b.name, np: b.npc ? 1 : 0, ia: !b.p && !b.npc ? 1 : 0, tm: b.team, iv: b.inv > 0 ? 1 : 0, fl: b.fl > 0 ? 1 : 0, bo: b.boost > 0 ? 1 : 0, gh: b.gh || undefined, bs: b.boss || undefined, mc: b.mc || undefined, bu: b.burnT > T ? 1 : undefined, dv: b.dive > 0 ? 1 : undefined })),
    l: outL, lr,
    s: shots.filter(inV).map(s => [r0(s.x), r0(s.y), r0(s.vx), r0(s.vy), s.sz, s.col, s.spl ? r0(s.spl) : 0, r2(s.l), r2(s.L), s.k || 'ball']),
    fg: fogs.filter(f => f.life !== undefined).map(f => [r0(f.x), r0(f.y), r0(f.r), f.z, r2(f.life), f.L, r2(f.ph)]),
    st: storm ? { x: r0(storm.x), y: r0(storm.y), r: storm.r, fl: storm.flash > 0 ? 1 : 0 } : null,
    cv: convoy ? [r0(convoy.x), r0(convoy.y)] : null, wh: whirl ? [r0(whirl.x), r0(whirl.y), whirl.r] : null, bz: boats.filter(b => b.boss || b.gh).slice(0, 4).map(b => [r0(b.x), r0(b.y), b.boss ? 1 : 0]),
    mi: !full ? undefined : boats.filter(b => b === me || b.id === leaderId || (seen(b, viewer) && !b.mc)).map(b => [r0(b.x), r0(b.y), b.col, b === me ? 1 : 0, b.id === leaderId ? 1 : 0]),
    mb: !full ? undefined : big.map(l => [r0(l.x), r0(l.y), l.k, l.cv ? 1 : 0]),
    bd: full ? board() : undefined,
    fx: fx.filter(f => f.to ? f.to === id : (f.k === 'banner' || inV(f))).map(f => { const o = Object.assign({}, f); delete o.to; return o; })
  };
}
function drainDeaths() { const d = deaths; deaths = []; return d; }
function clearFx() { fx = []; }
function alive(id) { return !!byId(id); }
function stats() { return { humains: humans().length, navires: boats.length, butin: loot.length, mode: MODE }; }

// Démarrage du monde
genWorld();
for (let i = 0; i < BOTS; i++) boats.push(mk({ lvl: botLevel(BOTS) }));
for (const k in LT) for (let i = 0; i < LT[k].n * AREA; i++) loot.push(mkL(k));

module.exports = { rude, cleanText, topWeek, drainEvents() { const e = evs; evs = []; return e; }, top, tick, addPlayer, removePlayer, input, skill, pickOffer, welcome, snapshotFor, drainDeaths, clearFx, alive, stats, MODE, _debug: { startEv, gain, need, mk, mhp, quiet(v) { QUIET = !!v; }, get boats() { return boats; }, get loot() { return loot; } } };
