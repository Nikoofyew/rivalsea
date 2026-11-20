// Tests automatiques de RivalSea : lancer avec   npm test
// Ils vérifient que le jeu ne plante pas, que toutes les évolutions sont possibles
// et que les navires d'une même époque restent à peu près aussi forts les uns que les autres.
'use strict';
const assert = require('assert');
const S = require('./shared.js');
const g = require('./game.js');
const D = g._debug, { CL } = S;
let ok = 0; const test = (nom, f) => { const t0 = Date.now(); f(); ok++; console.log('✔', nom, '(' + (Date.now() - t0) + ' ms)'); };

test('arbre des navires : chaque navire a au moins 2 choix et reste dans sa famille', () => {
  for (const [k, c] of Object.entries(CL)) {
    if (c.t < 4) assert(c.next.length >= 2, k + ' doit proposer au moins 2 évolutions');
    for (const n of c.next) { assert(CL[n], k + ' → ' + n + ' inconnu'); assert.strictEqual(CL[n].t, c.t + 1); if (c.f) assert.strictEqual(CL[n].f, c.f, k + ' change de famille'); }
  }
});

test('les 24 chemins d’évolution sont jouables', () => {
  const paths = k => CL[k].next.length ? CL[k].next.flatMap(n => paths(n).map(p => [k, ...p])) : [[k]];
  const all = paths('barque'); assert.strictEqual(all.length, 24);
  for (const p of all) {
    const id = g.addPlayer({ name: 'Test' }), b = D.boats.find(x => x.id === id);
    for (let i = 1; i < p.length; i++) {
      while (b.lvl < 5 * i) { D.gain(b, D.need(b.lvl) - b.xp + 1); while (b.offer && b.offer.k === 'bonus') g.pickOffer(id, b.offer.id, 0); }
      assert(b.offer && b.offer.k === 'evo', 'pas de choix d’évolution au niveau ' + b.lvl);
      g.pickOffer(id, b.offer.id, b.offer.o.indexOf(p[i])); assert.strictEqual(b.c, p[i]);
    }
    g.removePlayer(id);
  }
});

test('les améliorations donnent toujours le même gain (+30 PV)', () => {
  const id = g.addPlayer({ name: 'Test' }), b = D.boats.find(x => x.id === id), hp = i => { const s = Object.assign({}, b.s); for (let k = 0; k < i; k++) S.BON[4].f(s); return 100 * CL[b.c].hp * (1 + .015 * (b.lvl - 1)) + s.hp; };
  assert.strictEqual(Math.round(hp(1) - hp(0)), 30); assert.strictEqual(Math.round(hp(3) - hp(2)), 30); g.removePlayer(id);
});

test('3 minutes de partie sans erreur ni valeur cassée, et peu de données envoyées', () => {
  const id = g.addPlayer({ name: 'Test' }), cache = {}; let bytes = 0, n = 0;
  for (let t = 0; t < 20 * 180; t++) {
    g.tick(1 / 20); g.drainDeaths();
    if (g.alive(id)) { const s = JSON.stringify(g.snapshotFor(id, 1366, 768, 0, 0, cache)); if (t > 100) { bytes += s.length; n++; } }
    g.clearFx();
    for (const b of D.boats) assert(Number.isFinite(b.x) && Number.isFinite(b.y) && Number.isFinite(b.hp) && CL[b.c], 'navire cassé : ' + b.c);
  }
  const avg = bytes / Math.max(1, n); console.log('   données moyennes par message :', Math.round(avg), 'octets');
  assert(avg < 3000, 'trop de données envoyées par message');
  g.removePlayer(id);
});

test('équilibre : les navires d’une même époque gagnent entre 35 % et 65 % de leurs duels', () => {
  D.quiet(true); const obs = g.addPlayer({ name: 'Obs' }), P = D.boats.find(b => b.id === obs), LV = { 1: 7, 2: 12, 3: 17, 4: 22 };
  const duel = (a, b, lv) => {
    D.boats.splice(0, D.boats.length, P); D.loot.splice(0, D.loot.length); const A = D.mk({ lvl: lv }), B = D.mk({ lvl: lv }); A.c = a; B.c = b;
    for (const x of [A, B]) { x.hp = D.mhp(x); x.inv = 0; x.hold = 0; } A.x = 3000; A.y = 3400; B.x = 3360; B.y = 3400; D.boats.push(A, B);
    for (let t = 0; t < 20 * 90; t++) { g.tick(.05); g.drainDeaths(); g.clearFx(); P.inv = 1e9; P.x = 60; P.y = 60; if (!D.boats.includes(A)) return 0; if (!D.boats.includes(B)) return 1; }
    return A.hp / D.mhp(A) > B.hp / D.mhp(B) ? 1 : 0;
  };
  for (const t of [1, 2, 3, 4]) {
    const ks = Object.keys(CL).filter(k => CL[k].t === t), w = Object.fromEntries(ks.map(k => [k, [0, 0]]));
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) for (let r = 0; r < 30; r++) { const x = r % 2 ? duel(ks[j], ks[i], LV[t]) : duel(ks[i], ks[j], LV[t]), aw = r % 2 ? 1 - x : x; w[ks[i]][0] += aw; w[ks[i]][1]++; w[ks[j]][0] += 1 - aw; w[ks[j]][1]++; }
    const pct = Object.fromEntries(ks.map(k => [k, Math.round(w[k][0] / w[k][1] * 100)])); console.log('   époque', t, JSON.stringify(pct));
    for (const [k, p] of Object.entries(pct)) assert(p >= 35 && p <= 65, k + ' : ' + p + ' %');
  }
  D.quiet(false);
});

console.log('\n' + ok + ' tests réussis');
