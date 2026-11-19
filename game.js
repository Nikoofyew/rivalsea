// Simulation du monde de Flottille. C'est le serveur qui fait foi : il calcule les déplacements,
// les tirs, les dégâts et l'XP, puis envoie à chaque joueur ce qu'il a le droit de voir.
'use strict';
const S = require('./shared.js');
const { CL, LT, SK, BON, EVO, WS, TAU, SEE, TEAMS, NAMES, COLS, SAILS, HULLS, FLAGS, rnd, ri, cl, pick, angD, need } = S;

const MODE = process.env.MODE === 'team' ? 'team' : 'ffa';          // ffa = chacun pour soi, team = équipages
const BOTS = Math.max(0, parseInt(process.env.BOTS || '12', 10));   // nombre de navires visé (joueurs + bots)

let rocks = [], fogs = [], boats = [], loot = [], shots = [], fx = [], deaths = [];
let ev = { t: 30 }, storm = null, convoy = null, UID = 0, FZ = 0, T = 0, boardCache = null, boardT = -1;

// ——— Outils ———
const R = b => S.R(b.lvl, b.c);
const mass = b => CL[b.c].sz ** 2 * (1 + b.lvl * .02);
const mhp = b => (100 + b.s.hp) * CL[b.c].hp;
const lmhp = l => l.mhp || LT[l.k].hp;
const avail = s => BON.filter(x => !x.ok || x.ok(s));
const rb = b => pick(avail(b.s)).f(b.s);
const canHide = b => S.canHide(b.c);
const humans = () => boats.filter(b => b.p);
function zoneAt(x, y) { for (const f of fogs) if ((x - f.x) ** 2 + (y - f.y) ** 2 < f.r * f.r * .7 * (f.life !== undefined ? cl(f.life, 0, 1) : 1)) return f.z; return -1; }
// on voit un navire s'il n'est pas caché, si on est dans le même banc de brouillard, ou s'il est tout proche
const seen = (o, by) => !canHide(o) || o.fz < 0 || o.fz === by.fz || Math.hypot(o.x - by.x, o.y - by.y) < SEE;
const seenL = (l, by) => l.fz < 0 || l.fz === by.fz || Math.hypot(l.x - by.x, l.y - by.y) < SEE || l.k === 'kraken';
const inRock = (x, y, m) => rocks.some(k => Math.hypot(x - k.x, y - k.y) < k.r + m);
function freeSpot(m, pad) { for (let i = 0; i < 40; i++) { const x = rnd(m, WS - m), y = rnd(m, WS - m); if (!inRock(x, y, pad || 60)) return { x, y }; } return { x: WS / 2, y: WS / 2 }; }
function pushOut(o, rad) { for (const k of rocks) { const dx = o.x - k.x, dy = o.y - k.y, d = Math.hypot(dx, dy), m = k.r + rad; if (d < m && d > 0) { o.x = k.x + dx / d * m; o.y = k.y + dy / d * m; } } }
function avoid(o, a, rad) { const px = o.x + Math.cos(a) * (rad + 90), py = o.y + Math.sin(a) * (rad + 90); for (const k of rocks) { if (Math.hypot(px - k.x, py - k.y) < k.r + rad * .7) { const s = Math.sign(Math.sin(Math.atan2(k.y - o.y, k.x - o.x) - a)) || 1; return a - s * 1.3; } } return a; }
const say = (b, x, y, s, col, l) => { if (b && b.p) fx.push({ k: 'txt', x: Math.round(x), y: Math.round(y), s, col, l: l || 1, to: b.id }); };
const banner = s => fx.push({ k: 'banner', s });
const burst = (x, y, col, n, sp) => fx.push({ k: 'burst', x: Math.round(x), y: Math.round(y), col, n, sp: sp || 200 });
const ring = (x, y, r, m, l, col) => fx.push({ k: 'ring', x: Math.round(x), y: Math.round(y), r, m, l, col });
const avgLvl = () => { const h = humans(); return h.length ? h.reduce((a, b) => a + b.lvl, 0) / h.length : ri(2, 6); };
function weakTeam() { const c = [0, 0, 0, 0]; for (const b of boats) if (!b.npc && b.team >= 0 && b.team < 4) c[b.team]++; return c.indexOf(Math.min(...c)); }

// ——— Création ———
function mk(opt) {
  const sp = freeSpot(250, 90);
  const b = { p: !!opt.p, id: ++UID, name: opt.name || pick(NAMES), col: opt.hull || pick(COLS), sail: opt.sail || pick(SAILS)[0], flag: opt.flag || pick(Object.keys(FLAGS)),
    x: sp.x, y: sp.y, a: rnd(0, TAU), aim: 0, vx: 0, vy: 0, lvl: 1, xp: 0, tot: 0, sc: 0, c: 'chaloupe', cd: rnd(0, 1), skcd: 3, boost: 0, rc: 0, inv: 3,
    tx: 0, ty: 0, f: 1, t: 0, wx: WS / 2, wy: WS / 2, pend: [], offer: null, oid: 0, fl: 0, fz: -1, inp: { a: 0, f: 0 }, npc: !!opt.npc,
    s: { rate: 1, dmg: 1, spd: 1, rng: 1, hp: 0, multi: 0, reg: 0, loot: 1, ram: 1, skr: 1 }, hp: 1 };
  b.aim = b.a; b.inp.a = b.a;
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
  if (b.p) { b.pend.push(evo ? 'evo' : 'bonus'); offer(b); }
  else if (evo) evolve(b, pick(CL[b.c].next)); else rb(b);
  b.hp = Math.min(mhp(b), b.hp + mhp(b) * .3);
}
// Les choix (bonus ou évolution) ne mettent pas la partie en pause : le joueur choisit en naviguant.
function offer(b) {
  if (b.offer || !b.pend.length) return;
  const k = b.pend.shift();
  if (k === 'evo' && CL[b.c].next.length) b.offer = { id: ++b.oid, k: 'evo', o: CL[b.c].next.slice(), l: b.lvl };
  else b.offer = { id: ++b.oid, k: 'bonus', o: avail(b.s).map(x => BON.indexOf(x)).sort(() => Math.random() - .5).slice(0, 3), l: b.lvl };
}
function gain(b, x) { if (!b || !b.s || b.dead) return; b.xp += x; b.tot += x; let n; while (b.xp >= (n = need(b.lvl))) { b.xp -= n; lvup(b); } }
function evolve(b, k) { b.c = k; b.hp = mhp(b); if (boats.includes(b)) { ring(b.x, b.y, R(b), R(b) * 4, .7, '#ffcf3f'); say(b, b.x, b.y - R(b) - 30, CL[k].n + ' !', '#ffcf3f', 1.6); } }

// ——— Monde : îles, récifs, brouillard ———
function genWorld() {
  rocks = []; fogs = []; FZ = 0;
  const isl = [];
  for (let i = 0; i < 6; i++) {
    let cx, cy, t = 0; do { cx = rnd(400, WS - 400); cy = rnd(400, WS - 400); t++; } while (t < 50 && isl.some(o => Math.hypot(o.x - cx, o.y - cy) < 650)); isl.push({ x: cx, y: cy });
    const n = ri(2, 3); for (let j = 0; j < n; j++) { const a = rnd(0, TAU), q = j ? rnd(60, 100) : 0; rocks.push({ x: cx + Math.cos(a) * q, y: cy + Math.sin(a) * q, r: j ? rnd(55, 95) : rnd(90, 140), k: 'ile', ph: rnd(0, TAU) }); }
  }
  for (let i = 0; i < 7; i++) { const s = freeSpot(250, 120), n = ri(4, 6); for (let j = 0; j < n; j++) rocks.push({ x: s.x + rnd(-70, 70), y: s.y + rnd(-70, 70), r: rnd(12, 24), k: 'recif', ph: rnd(0, TAU) }); }
  for (let z = 0; z < 7; z++) {
    let cx, cy, ok, t = 0; do { cx = rnd(450, WS - 450); cy = rnd(450, WS - 450); ok = fogs.every(f => Math.hypot(f.x - cx, f.y - cy) > 560); t++; } while (!ok && t < 40);
    const n = ri(3, 4), id = FZ++; for (let i = 0; i < n; i++) fogs.push({ x: cx + rnd(-150, 150), y: cy + rnd(-150, 150), r: rnd(160, 230), z: id, ph: rnd(0, TAU) });
  }
}
function smoke(x, y) { const id = FZ++; for (let i = 0; i < 3; i++) fogs.push({ x: x + rnd(-60, 60), y: y + rnd(-60, 60), r: rnd(120, 160), z: id, ph: rnd(0, TAU), life: 8, L: 8 }); }

// ——— Combat ———
const sideOK = (b, o) => !CL[b.c].w.bs || Math.abs(Math.sin(Math.atan2(o.y - b.y, o.x - b.x) - b.a)) > .6;
function targets(b, rng, n) {
  const out = [], near = (arr, rad, f) => arr.filter(o => !o.dead && f(o)).map(o => [o, Math.hypot(o.x - b.x, o.y - b.y) - rad(o)]).filter(e => e[1] < rng && sideOK(b, e[0])).sort((a, c) => a[1] - c[1]);
  for (const e of near(boats, R, o => o !== b && o.team !== b.team && o.inv <= 0 && seen(o, b))) { if (out.length >= n) break; out.push(e[0]); }
  if (out.length < n) for (const e of near(loot, o => LT[o.k].r, o => seenL(o, b) && !(b.npc && o.cv))) { if (out.length >= n) break; out.push(e[0]); }
  return out;
}
function fire(b, salvo) {
  const c = CL[b.c], w = c.w, rng = w.rng * b.s.rng, ts = targets(b, rng, w.tg); if (!ts.length) return false;
  if (!salvo) b.cd = w.rate * b.s.rate; b.tgt = ts[0];
  const n = w.n + b.s.multi + (salvo ? 2 : 0), sp = w.sp || 0, par = w.par || (sp ? 0 : 12), dm = w.dmg * b.s.dmg * (salvo ? 1.6 : 1), r = R(b);
  for (const e of ts) {
    const an = Math.atan2(e.y - b.y, e.x - b.x), dd = Math.hypot(e.x - b.x, e.y - b.y), life = (w.spl ? Math.min(rng, dd) : rng) / w.v + .06;
    const side = Math.sin(an - b.a) > 0 ? 1 : -1, ax = Math.cos(b.a), ay = Math.sin(b.a), sx = Math.cos(b.a + side * Math.PI / 2), sy = Math.sin(b.a + side * Math.PI / 2), gap = Math.min(par * 1.5, r * c.L * 1.5 / n);
    for (let k = 0; k < n; k++) {
      const o = k - (n - 1) / 2; let x, y, a;
      if (w.bs) { x = b.x + ax * o * gap + sx * r * .6; y = b.y + ay * o * gap + sy * r * .6; a = Math.atan2(e.y - y, e.x - x) + rnd(-.03, .03); }
      else { const q = an + Math.PI / 2; x = b.x + Math.cos(q) * o * par; y = b.y + Math.sin(q) * o * par; a = an + o * sp; }
      shots.push({ x, y, vx: Math.cos(a) * w.v, vy: Math.sin(a) * w.v, l: life, L: life, d: dm, o: b, tm: b.team, sz: w.sz, spl: w.spl, col: b.col });
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
  else if (k === 'salvo') { if (!fire(b, true)) return false; }
  b.skcd = SK[k].cd * b.s.skr * (b.p ? 1 : 1.3); say(b, b.x, b.y - R(b) - 26, SK[k].n, '#fff', 1); return true;
}
function hurt(o, d, by) { if (o.dead || o.hp <= 0 || o.inv > 0) return; o.hp -= d; o.hit = by; o.fl = .12; if (o.s && by && by.s) gain(by, d * .2); }
function boom(s) {
  ring(s.x, s.y, 4, s.spl, .4, '#ff9f43'); burst(s.x, s.y, '#ff9f43', 14, 240);
  for (const o of boats) { if (o === s.o || o.team === s.tm || o.dead) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < s.spl + R(o)) hurt(o, s.d * (d < s.spl * .45 ? 1 : .6), s.o); }
  for (const o of loot) { if (o.dead || (o.cv && s.o.npc)) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < s.spl + LT[o.k].r) hurt(o, s.d * (d < s.spl * .45 ? 1 : .6), s.o); }
}
function sink(v) {
  if (v.gone) return; const k = v.hit; burst(v.x, v.y, v.col, 26, 260); burst(v.x, v.y, '#c98a4b', 14, 180);
  const kx = Math.round(40 + v.tot * .12);
  if (k && k.s && !k.dead) { k.sc++; gain(k, kx); say(k, v.x, v.y, 'Coulé ! +' + kx + ' XP', '#ffcf3f', 1.4); }
  // le navire coulé laisse des épaves à piller
  const n = cl(2 + Math.floor(v.lvl / 4), 2, 8), each = Math.round((15 + v.tot * .08) / n);
  for (let i = 0; i < n; i++) { const a = rnd(0, TAU), q = rnd(10, R(v) * 1.6), l = mkL('epave', v.x + Math.cos(a) * q, v.y + Math.sin(a) * q); l.xpo = each; l.life = 25; l.tint = v.col; loot.push(l); }
  if (v.p) deaths.push({ id: v.id, lvl: v.lvl, c: v.c, sc: v.sc, x: Math.round(v.x), y: Math.round(v.y), by: k && k.name ? k.name : (k && k.k === 'kraken' ? 'le kraken' : null) });
}
function crack(l) {
  const d = LT[l.k], k = l.hit; if (l.gone) return;
  burst(l.x, l.y, l.k === 'coffre' || l.k === 'tresor' ? '#ffcf3f' : l.k === 'kraken' ? '#7a4fb3' : '#b5713a', l.k === 'tonneau' || l.k === 'epave' ? 10 : l.k === 'kraken' ? 60 : 18, l.k === 'kraken' ? 400 : 200);
  if (k && k.s && !k.dead) { const x = Math.round((l.xpo || d.xp) * k.s.loot); gain(k, x); say(k, l.x, l.y, '+' + x + ' XP', l.k === 'coffre' || l.k === 'tresor' ? '#ffcf3f' : '#fff8e7', 1.2); }
  if (l.k === 'kraken') banner((k && k.s ? k.name : 'Quelqu’un') + ' a vaincu le kraken !');
  if (l.k === 'tresor') banner((k && k.s ? k.name : 'Quelqu’un') + ' a pillé le trésor !');
  if (d.n > 0 && !l.cv) loot.push(mkL(l.k));
}

// ——— Événements : kraken, tempête, convoi, trésor ———
const fpos = (cv, ox, oy) => [cv.x + Math.cos(cv.a) * ox - Math.sin(cv.a) * oy, cv.y + Math.sin(cv.a) * ox + Math.cos(cv.a) * oy];
function startEv(k) {
  if (k === 'kraken') { const p = freeSpot(450, 120), l = mkL('kraken', p.x, p.y); l.life = 80; l.slam = 2.5; loot.push(l); banner('Un kraken a surgi des profondeurs !'); }
  else if (k === 'storm') {
    const h = Math.random() < .5, s = Math.random() < .5 ? 1 : -1;
    storm = { x: h ? (s > 0 ? -300 : WS + 300) : rnd(600, WS - 600), y: h ? rnd(600, WS - 600) : (s > 0 ? -300 : WS + 300), r: 500, flash: 0 };
    storm.vx = h ? s * 65 : rnd(-20, 20); storm.vy = h ? rnd(-20, 20) : s * 65; banner('Une tempête approche !');
  }
  else if (k === 'convoy') {
    const h = Math.random() < .5, s = Math.random() < .5 ? 1 : -1, y0 = rnd(700, WS - 700);
    convoy = { x: h ? (s > 0 ? 150 : WS - 150) : y0, y: h ? y0 : (s > 0 ? 150 : WS - 150), spd: 48 };
    convoy.tx = h ? (s > 0 ? WS - 150 : 150) : convoy.x; convoy.ty = h ? convoy.y : (s > 0 ? WS - 150 : 150); convoy.a = Math.atan2(convoy.ty - convoy.y, convoy.tx - convoy.x);
    for (const [ox, oy] of [[0, 0], [-110, -80], [-110, 80]]) { const l = mkL('marchand', convoy.x, convoy.y); l.cv = convoy; l.ox = ox; l.oy = oy; l.hp = l.mhp = 240; l.xpo = 420; loot.push(l); }
    const lv = Math.max(10, Math.round(avgLvl()) + 1);
    for (const [ox, oy] of [[90, -150], [90, 150]]) { const e = mk({ lvl: lv, npc: 1 }); e.name = 'Escorte'; e.col = '#2d5f8a'; e.team = -1; e.c = lv >= 20 ? 'galionroyal' : lv >= 15 ? 'galion' : 'fregate'; e.hp = mhp(e); e.cv = convoy; e.ox = ox; e.oy = oy; e.x = convoy.x; e.y = convoy.y + oy; e.inv = 0; boats.push(e); }
    banner('Un convoi marchand escorté traverse la mer !');
  }
  else if (k === 'tresor') { let p = freeSpot(300, 60); if (Math.random() < .5) { const f = pick(fogs.filter(f => f.life === undefined)); if (f && !inRock(f.x, f.y, 50)) p = { x: f.x, y: f.y }; } loot.push(mkL('tresor', p.x, p.y)); banner('Un trésor géant est apparu !'); }
}
function events(dt) {
  ev.t -= dt;
  if (ev.t <= 0) { ev.t = rnd(40, 65); const o = []; if (!loot.some(l => l.k === 'kraken')) o.push('kraken'); if (!storm) o.push('storm'); if (!convoy) o.push('convoy'); if (!loot.some(l => l.k === 'tresor')) o.push('tresor'); if (o.length) startEv(pick(o)); }
  if (storm) { storm.x += storm.vx * dt; storm.y += storm.vy * dt; storm.flash -= dt; if (Math.random() < dt * .5) storm.flash = .18; if (storm.x < -700 || storm.x > WS + 700 || storm.y < -700 || storm.y > WS + 700) storm = null; }
  if (convoy) {
    const d = Math.hypot(convoy.tx - convoy.x, convoy.ty - convoy.y), alive = loot.some(l => l.cv === convoy && !l.dead);
    if (d < 40 || !alive) { for (const l of loot) if (l.cv === convoy) { l.gone = true; l.dead = true; } for (const b of boats) if (b.cv === convoy) { b.gone = true; b.dead = true; } if (d < 40 && alive) banner('Le convoi s’est échappé.'); convoy = null; }
    else { convoy.x += Math.cos(convoy.a) * convoy.spd * dt; convoy.y += Math.sin(convoy.a) * convoy.spd * dt; }
  }
}
const inStorm = (x, y) => storm && Math.hypot(x - storm.x, y - storm.y) < storm.r;
function wind(o) { const a = Math.atan2(o.y - storm.y, o.x - storm.x) + Math.PI / 2; return [Math.cos(a) * 75, Math.sin(a) * 75]; }

// ——— IA des bots ———
function engage(b, e, ed, rng) {
  if (CL[b.c].w.bs && ed < rng * .95) { const h = Math.atan2(e.y - b.y, e.x - b.x), h1 = h + Math.PI / 2, h2 = h - Math.PI / 2, hh = Math.abs(angD(h1, b.a)) < Math.abs(angD(h2, b.a)) ? h1 : h2, h3 = hh + (ed < rng * .5 ? (hh === h1 ? .4 : -.4) : 0); b.tx = b.x + Math.cos(h3) * 200; b.ty = b.y + Math.sin(h3) * 200; b.f = .75; }
  else { b.tx = e.x; b.ty = e.y; b.f = ed < rng * .65 ? .25 : .85; }
}
function ai(b, dt) {
  const c = CL[b.c], rng = c.w.rng * b.s.rng, hpR = b.hp / mhp(b);
  b.t -= dt; if (b.t <= 0) { b.t = rnd(3, 6); const s = freeSpot(150, 80); b.wx = s.x; b.wy = s.y; }
  if (b.cv) {
    const [fx2, fy2] = fpos(b.cv, b.ox, b.oy); let e = null, ed = 460;
    for (const o of boats) if (!o.npc && !o.dead && o.inv <= 0 && seen(o, b)) { const d = Math.hypot(o.x - b.cv.x, o.y - b.cv.y); if (d < ed) { ed = d; e = o; } }
    if (e) engage(b, e, Math.hypot(e.x - b.x, e.y - b.y), rng); else { b.tx = fx2; b.ty = fy2; b.f = cl(Math.hypot(fx2 - b.x, fy2 - b.y) / 80, .3, 1); }
    if (b.skcd <= 0 && e) useSkill(b); return;
  }
  let e = null, ed = rng * 1.3, th = null, td = 520;
  for (const o of boats) if (o !== b && !o.dead && o.team !== b.team && seen(o, b)) { const d = Math.hypot(o.x - b.x, o.y - b.y); if (d < ed && o.inv <= 0) { ed = d; e = o; } if (d < td && o.lvl > b.lvl + 3) { td = d; th = o; } }
  b.tx = b.wx; b.ty = b.wy; b.f = .7;
  if (th && (hpR < .6 || th.lvl > b.lvl + 5 || !e || e === th)) {
    b.tx = cl(b.x * 2 - th.x, 100, WS - 100); b.ty = cl(b.y * 2 - th.y, 100, WS - 100); b.f = 1;
    if (canHide(b)) { let f0 = null, fd = 900; for (const f of fogs) { const d = Math.hypot(f.x - b.x, f.y - b.y); if (d < fd) { fd = d; f0 = f; } } if (f0) { b.tx = f0.x; b.ty = f0.y; } }
    if (b.skcd <= 0 && (c.sk === 'boost' || c.sk === 'smoke')) useSkill(b);
  }
  else if (e) { engage(b, e, ed, rng); if (b.skcd <= 0 && c.sk === 'salvo') useSkill(b); }
  else {
    let l = null, ld = 750;
    for (const o of loot) { if (!seenL(o, b)) continue; const d = Math.hypot(o.x - b.x, o.y - b.y) * (o.k === 'tresor' || o.k === 'kraken' ? (b.lvl > 8 ? .5 : 3) : 1); if (d < ld) { ld = d; l = o; } }
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
  if (nb < want) boats.push(mk({ lvl: Math.max(1, Math.round(avgLvl()) + ri(-3, 1)) }));
  else if (nb > want + 1) { const v = boats.find(b => !b.p && !b.npc && b.lvl < 6); if (v) { v.gone = true; v.dead = true; } }
  for (const f of fogs) if (f.life !== undefined) f.life -= dt; fogs = fogs.filter(f => f.life === undefined || f.life > 0);
  for (const b of boats) b.fz = zoneAt(b.x, b.y); for (const l of loot) l.fz = zoneAt(l.x, l.y);
  events(dt);
  for (const b of boats) {
    if (b.dead) continue; const c = CL[b.c];
    if (b.p) { b.f = b.inp.f; b.tx = b.x + Math.cos(b.inp.a) * 100; b.ty = b.y + Math.sin(b.inp.a) * 100; } else ai(b, dt);
    let want = Math.atan2(b.ty - b.y, b.tx - b.x); if (!b.p) want = avoid(b, want, R(b));
    const tr = 3.4 / Math.pow(c.sz, 1.3); b.a += cl(angD(want, b.a), -tr * dt, tr * dt);
    const sp = 170 * c.spd * b.s.spd * b.f * (1 - Math.min(b.lvl, 30) * .006) * (b.boost > 0 ? 1.7 : 1);
    b.vx = Math.cos(b.a) * sp; b.vy = Math.sin(b.a) * sp; let wx = 0, wy = 0; if (inStorm(b.x, b.y)) [wx, wy] = wind(b);
    b.x = cl(b.x + (b.vx + wx) * dt, 20, WS - 20); b.y = cl(b.y + (b.vy + wy) * dt, 20, WS - 20); pushOut(b, R(b) * .7);
    b.hp = Math.min(mhp(b), b.hp + (b.s.reg + (c.reg || 0)) * dt); b.cd -= dt; b.fl -= dt; b.skcd -= dt; b.boost -= dt; b.rc -= dt; b.inv -= dt;
    if (b.cd <= 0) fire(b);
    const ta = b.tgt && !b.tgt.dead ? Math.atan2(b.tgt.y - b.y, b.tgt.x - b.x) : b.a; b.aim += angD(ta, b.aim) * Math.min(1, dt * 8);
  }
  // collisions entre navires et éperonnage
  for (let i = 0; i < boats.length; i++) for (let j = i + 1; j < boats.length; j++) {
    const a = boats[i], b = boats[j]; if (a.dead || b.dead) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = (R(a) + R(b)) * .75; if (d >= m || d === 0) continue;
    const nx = dx / d, ny = dy / d, ma = mass(a), mb = mass(b), ov = m - d;
    a.x -= nx * ov * mb / (ma + mb); a.y -= ny * ov * mb / (ma + mb); b.x += nx * ov * ma / (ma + mb); b.y += ny * ov * ma / (ma + mb);
    const cs = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (cs > 35 && a.team !== b.team && a.rc <= 0 && b.rc <= 0) {
      const da = Math.min(30, .07 * cs * Math.sqrt(mb / ma) * b.s.ram), db = Math.min(30, .07 * cs * Math.sqrt(ma / mb) * a.s.ram);
      hurt(a, da, b); hurt(b, db, a); a.rc = b.rc = .6; burst((a.x + b.x) / 2, (a.y + b.y) / 2, '#c98a4b', 8, 160);
      if (db > 8) say(a, b.x, b.y - R(b), 'Éperonnage !', '#ff9f43', 1); if (da > 8) say(b, a.x, a.y - R(a), 'Éperonnage !', '#ff9f43', 1);
    }
  }
  for (const l of loot) {
    if (l.dead) continue; const d = LT[l.k]; l.fl -= dt;
    if (l.life !== undefined) { l.life -= dt; if (l.life <= 0) { l.gone = true; l.dead = true; if (l.k === 'kraken') banner('Le kraken replonge dans les abysses…'); continue; } }
    if (l.k === 'kraken') {
      let n = null, nd = 700; for (const b of boats) { const dd = Math.hypot(b.x - l.x, b.y - l.y); if (dd < nd) { nd = dd; n = b; } }
      if (n) { const a = Math.atan2(n.y - l.y, n.x - l.x); l.a += angD(a, l.a) * Math.min(1, dt * 2); l.x += Math.cos(l.a) * 40 * dt; l.y += Math.sin(l.a) * 40 * dt; }
      l.slam -= dt; if (l.slam <= 0) { l.slam = 1.8; ring(l.x, l.y, d.r, d.r + 130, .5, '#c9a6ff'); for (const b of boats) if (Math.hypot(b.x - l.x, b.y - l.y) < d.r + 130 + R(b) * .5) hurt(b, 16, l); }
      pushOut(l, d.r * .6); continue;
    }
    if (l.cv) { const [fx2, fy2] = fpos(l.cv, l.ox, l.oy), dd = Math.hypot(fx2 - l.x, fy2 - l.y); l.a += angD(dd > 8 ? Math.atan2(fy2 - l.y, fx2 - l.x) : l.cv.a, l.a) * Math.min(1, dt * 3); const v = Math.min(110, dd * 2); l.x += Math.cos(l.a) * v * dt; l.y += Math.sin(l.a) * v * dt; continue; }
    if (d.mv) {
      l.t -= dt; if (l.t <= 0) { l.t = rnd(3, 7); const s = freeSpot(100, 60); l.wx = s.x; l.wy = s.y; }
      let tx = l.wx, ty = l.wy, f = .45, n = null, nd = 280; for (const b of boats) { const dd = Math.hypot(b.x - l.x, b.y - l.y); if (dd < nd) { nd = dd; n = b; } }
      if (n) { tx = l.x * 2 - n.x; ty = l.y * 2 - n.y; f = 1; }
      const want = avoid(l, Math.atan2(ty - l.y, tx - l.x), d.r); l.a += cl(angD(want, l.a), -2.5 * dt, 2.5 * dt);
      l.x = cl(l.x + Math.cos(l.a) * d.mv * f * dt, 30, WS - 30); l.y = cl(l.y + Math.sin(l.a) * d.mv * f * dt, 30, WS - 30);
    } else { l.x = cl(l.x + Math.cos(l.ph) * 6 * dt, 30, WS - 30); l.y = cl(l.y + Math.sin(l.ph) * 6 * dt, 30, WS - 30); l.a += dt * .15; }
    if (inStorm(l.x, l.y)) { const [wx, wy] = wind(l); l.x = cl(l.x + wx * .6 * dt, 30, WS - 30); l.y = cl(l.y + wy * .6 * dt, 30, WS - 30); }
    pushOut(l, d.r);
  }
  for (const s of shots) {
    if (inStorm(s.x, s.y)) { const r = rnd(-2.2, 2.2) * dt, c = Math.cos(r), sn = Math.sin(r), vx = s.vx; s.vx = vx * c - s.vy * sn; s.vy = vx * sn + s.vy * c; }
    s.x += s.vx * dt; s.y += s.vy * dt; s.l -= dt; if (s.l <= 0) { if (s.spl) boom(s); continue; }
    if (s.spl && s.l > s.L * .25) continue; // l'obus de mortier vole au-dessus de tout jusqu'à la fin de sa course
    if (inRock(s.x, s.y, 0)) { s.l = 0; burst(s.x, s.y, '#f4d58d', 4, 90); continue; }
    let hit = null; for (const o of boats) if (o !== s.o && o.team !== s.tm && !o.dead && Math.hypot(o.x - s.x, o.y - s.y) < R(o) + s.sz) { hit = o; break; }
    if (!hit) for (const o of loot) if (!o.dead && !(o.cv && s.o.npc) && Math.hypot(o.x - s.x, o.y - s.y) < LT[o.k].r + s.sz) { hit = o; break; }
    if (hit) { s.l = 0; if (s.spl) boom(s); else { hurt(hit, s.d, s.o); burst(s.x, s.y, '#fff8e7', 3, 90); } }
  }
  shots = shots.filter(s => s.l > 0);
  for (const b of boats) if (!b.dead && b.hp <= 0) { b.dead = true; sink(b); }
  for (const l of loot) if (!l.dead && l.hp <= 0) { l.dead = true; crack(l); }
  boats = boats.filter(b => !b.dead); loot = loot.filter(l => !l.dead);
}

// ——— Joueurs ———
const clean = (v, list, def) => list.includes(v) ? v : def;
function addPlayer(m) {
  const name = String(m.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 14) || 'Moussaillon';
  const b = mk({ p: 1, name, hull: clean(m.hull, HULLS.map(h => h[0]), '#ff6b57'), sail: clean(m.sail, SAILS.map(h => h[0]), '#fff8e7'), flag: clean(m.flag, Object.keys(FLAGS), 'skull') });
  boats.push(b); b.fz = zoneAt(b.x, b.y);
  return b.id;
}
const byId = id => boats.find(b => b.id === id && !b.dead);
function removePlayer(id) { const b = byId(id); if (b) { b.gone = true; b.dead = true; boats = boats.filter(x => x !== b); } }
function input(id, m) { const b = byId(id); if (!b) return; const a = +m.a, f = +m.f; if (Number.isFinite(a)) b.inp.a = a; if (Number.isFinite(f)) b.inp.f = cl(f, 0, 1); }
function skill(id) { useSkill(byId(id)); }
function pickOffer(id, oid, i) {
  const b = byId(id); if (!b || !b.offer || b.offer.id !== oid) return;
  const o = b.offer, v = o.o[i | 0]; if (v === undefined) return; b.offer = null;
  if (o.k === 'evo') evolve(b, v); else { BON[v].f(b.s); b.hp = Math.min(b.hp, mhp(b)); }
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
function snapshotFor(id, vw, vh, px, py) {
  const me = byId(id), viewer = me || { x: px, y: py, fz: -1, team: null };
  const hw = Math.min(vw || 1200, 2600) + 200, hh = Math.min(vh || 900, 2000) + 200, inV = o => Math.abs(o.x - viewer.x) < hw && Math.abs(o.y - viewer.y) < hh;
  const big = loot.filter(l => l.k === 'tresor' || l.k === 'kraken' || l.k === 'coffre' || l.k === 'marchand');
  return {
    t: 'st', cx: r0(viewer.x), cy: r0(viewer.y),
    me: me ? { i: me.id, x: r0(me.x), y: r0(me.y), l: me.lvl, xp: r0(me.xp), nd: need(me.lvl), sc: me.sc, c: me.c, h: r0(me.hp), H: r0(mhp(me)), sk: r2(Math.max(0, me.skcd)), skm: r2(SK[CL[me.c].sk].cd * me.s.skr), fz: me.fz, tm: me.team, rng: r0(CL[me.c].w.rng * me.s.rng), of: me.offer } : null,
    b: boats.filter(b => inV(b) && (b === me || seen(b, viewer))).map(b => ({ i: b.id, x: r0(b.x), y: r0(b.y), a: r2(b.a), m: r2(b.aim), c: b.c, l: b.lvl, h: r0(b.hp), H: r0(mhp(b)), col: b.col, sl: b.sail, fg: b.flag, n: b.name, np: b.npc ? 1 : 0, tm: b.team, iv: b.inv > 0 ? 1 : 0, fl: b.fl > 0 ? 1 : 0, bo: b.boost > 0 ? 1 : 0 })),
    l: loot.filter(l => inV(l) && seenL(l, viewer)).map(l => ({ i: l.id, k: l.k, x: r0(l.x), y: r0(l.y), a: r2(l.a), h: r0(l.hp), H: lmhp(l), cv: l.cv ? 1 : 0, tn: l.tint, lf: l.life !== undefined ? r2(l.life) : undefined, fl: l.fl > 0 ? 1 : 0 })),
    s: shots.filter(inV).map(s => [r0(s.x), r0(s.y), r0(s.vx), r0(s.vy), s.sz, s.col, s.spl ? 1 : 0, r2(s.l), r2(s.L)]),
    fg: fogs.filter(f => f.life !== undefined).map(f => [r0(f.x), r0(f.y), r0(f.r), f.z, r2(f.life), f.L, r2(f.ph)]),
    st: storm ? { x: r0(storm.x), y: r0(storm.y), r: storm.r, fl: storm.flash > 0 ? 1 : 0 } : null,
    cv: convoy ? [r0(convoy.x), r0(convoy.y)] : null,
    mi: boats.filter(b => b === me || seen(b, viewer)).map(b => [r0(b.x), r0(b.y), b.col, b === me ? 1 : 0]),
    mb: big.map(l => [r0(l.x), r0(l.y), l.k, l.cv ? 1 : 0]),
    bd: board(),
    fx: fx.filter(f => f.to ? f.to === id : (f.k === 'banner' || inV(f))).map(f => { const o = Object.assign({}, f); delete o.to; return o; })
  };
}
function drainDeaths() { const d = deaths; deaths = []; return d; }
function clearFx() { fx = []; }
function alive(id) { return !!byId(id); }
function stats() { return { humains: humans().length, navires: boats.length, butin: loot.length, mode: MODE }; }

// Démarrage du monde
genWorld();
for (let i = 0; i < BOTS; i++) boats.push(mk({ lvl: ri(1, 5) }));
for (const k in LT) for (let i = 0; i < LT[k].n; i++) loot.push(mkL(k));

module.exports = { tick, addPlayer, removePlayer, input, skill, pickOffer, welcome, snapshotFor, drainDeaths, clearFx, alive, stats, MODE, _debug: { startEv, get boats() { return boats; }, get loot() { return loot; } } };
