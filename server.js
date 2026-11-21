// Serveur RivalSea : sert le jeu (index.html, shared.js) et fait le lien en temps réel avec les joueurs.
// Aucune dépendance à installer : uniquement Node.js (version 18 ou plus récente).
// Lancement : node server.js   puis ouvrir http://localhost:3000
// Fichiers du jeu : index.html et shared.js (navigateur), game.js et server.js (serveur).
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
// ——— Les mers (salles) ———
// Chaque mer est une partie indépendante : on recharge game.js pour obtenir un monde neuf, avec son propre mode.
const GAME_PATH = require.resolve('./game');
function newGame(mode) {
  const old = process.env.MODE; process.env.MODE = mode; delete require.cache[GAME_PATH];
  const g = require('./game'); if (old === undefined) delete process.env.MODE; else process.env.MODE = old; delete require.cache[GAME_PATH]; return g;
}
const rooms = new Map(); // id → { id, g, mode, priv, code, empty }
const MAX_ROOMS = parseInt(process.env.MAX_ROOMS || '8', 10);
function makeRoom(mode, priv) {
  let id; do { id = priv ? Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[O0I1]/g, 'X') : mode + '-' + (rooms.size + 1) + '-' + Date.now() % 1e4; } while (rooms.has(id));
  const r = { id, g: newGame(mode), mode, priv: !!priv, empty: 0 }; rooms.set(id, r); return r;
}
const humansIn = r => [...clients].filter(x => x.room === r && x.bid && r.g.alive(x.bid)).length;
const usersIn = r => [...clients].filter(x => x.room === r).length;
// mer publique avec de la place pour ce mode (on en ouvre une nouvelle quand toutes sont pleines)
function publicRoom(mode) {
  for (const r of rooms.values()) if (!r.priv && r.mode === mode && humansIn(r) < MAX_PLAYERS) return r;
  return rooms.size < MAX_ROOMS ? makeRoom(mode, false) : null;
}
const MAIN = makeRoom(process.env.MODE === 'team' ? 'team' : 'ffa', false);
const game = MAIN.g;
function enter(c, r) { if (c.room === r) return; if (c.room && c.bid) c.room.g.removePlayer(c.bid); c.room = r; c.bid = 0; c.cache = {}; send(c, Object.assign(r.g.welcome(), { room: r.priv ? r.id : '' })); }

const PORT = parseInt(process.env.PORT || '3000', 10);
const PUB = __dirname;
const PUBLIC_FILES = new Set(['/index.html', '/style.css', '/shared.js', '/i18n.js', '/client-base.js', '/client-reseau.js', '/client-sons.js', '/client-profil.js', '/client-commandes.js', '/client-menus.js', '/client-dessin.js', '/client-rendu.js', '/icon-180.png', '/icon-48.png', '/icon-32.png']); // seuls fichiers envoyés aux navigateurs
const TICK = 1 / 20;          // la simulation avance 20 fois par seconde (moins de calcul pour le petit serveur)
const SEND_EVERY = 1;         // on envoie l'état aux joueurs 20 fois par seconde
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS || '40', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' };
const clients = new Set();

// ——— Statistiques anonymes (aucun nom, aucune adresse : seulement des compteurs) ———
// Visibles sur /stats. Elles repartent de zéro à chaque redémarrage du serveur ; un résumé est écrit dans les journaux de Render toutes les heures.
const STATS = { start: Date.now(), visits: 0, joins: 0, deaths: 0, quits: 0, peak: 0, lvls: {}, ships: {}, evo: {}, by: {}, life: [], avis: [] };
const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
function note(e) {
  if (e.k === 'join') STATS.joins++;
  else if (e.k === 'evo') inc(STATS.evo, e.c);
  else if (e.k === 'death' || e.k === 'quit') {
    STATS[e.k === 'death' ? 'deaths' : 'quits']++; inc(STATS.lvls, Math.min(30, Math.floor(e.l / 5) * 5)); inc(STATS.ships, e.c);
    STATS.life.push(e.t); if (STATS.life.length > 2000) STATS.life.shift(); if (e.k === 'death') inc(STATS.by, e.by);
  }
}
function statsPage() {
  const esc = v => String(v).replace(/[&<>]/g, ''), tbl = (t, o, f) => '<h2>' + t + '</h2><table>' + Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => '<tr><td>' + esc(f ? f(k) : k) + '</td><td>' + v + '</td></tr>').join('') + '</table>';
  const L = STATS.life.slice().sort((a, b) => a - b), med = L.length ? L[L.length >> 1] : 0, h = Math.round((Date.now() - STATS.start) / 36e5 * 10) / 10;
  const S = require('./shared.js');
  return '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>RivalSea – statistiques</title><style>body{font:15px system-ui;margin:24px;max-width:760px;color:#0b3d6b}table{border-collapse:collapse;margin-bottom:8px}td{border-bottom:1px solid #ddd;padding:3px 12px}h2{margin:18px 0 6px;font-size:17px}</style>' +
    '<h1>RivalSea – statistiques anonymes</h1><p>Depuis le dernier redémarrage du serveur (il y a ' + h + ' h). Joueurs en mer maintenant : ' + [...clients].filter(c => c.bid && c.room && c.room.g.alive(c.bid)).length + ' · record simultané : ' + STATS.peak + ' · mers ouvertes : ' + rooms.size + '</p>' +
    '<table><tr><td>Visites</td><td>' + STATS.visits + '</td></tr><tr><td>Parties lancées</td><td>' + STATS.joins + '</td></tr><tr><td>Naufrages</td><td>' + STATS.deaths + '</td></tr><tr><td>Départs en cours de partie</td><td>' + STATS.quits + '</td></tr><tr><td>Durée médiane d’une partie</td><td>' + Math.round(med / 6) / 10 + ' min</td></tr></table>' +
    tbl('Niveau atteint à la fin de la partie', STATS.lvls, k => 'niveau ' + k + ' à ' + (+k + 4)) + tbl('Navire en fin de partie', STATS.ships, k => (S.CL[k] || {}).n || k) + tbl('Évolutions choisies', STATS.evo, k => (S.CL[k] || {}).n || k) + tbl('Coulé par', STATS.by) +
    '<h2>Avis des joueurs</h2>' + (STATS.avis.length ? '<table>' + STATS.avis.map(a => '<tr><td>' + a.d.replace('T', ' ') + '</td><td>' + (a.v > 0 ? '👍' : a.v < 0 ? '👎' : '') + '</td><td>' + esc(a.txt) + '</td></tr>').join('') + '</table>' : '<p>Aucun avis pour l’instant.</p>');
}
setInterval(() => { const n = [...clients].filter(c => c.bid && c.room && c.room.g.alive(c.bid)).length; if (n > STATS.peak) STATS.peak = n; }, 5000);
setInterval(() => console.log('STATS', JSON.stringify({ visites: STATS.visits, parties: STATS.joins, naufrages: STATS.deaths, departs: STATS.quits, record: STATS.peak, niveaux: STATS.lvls, evolutions: STATS.evo })), 3600e3);

// ——— 1. Serveur web classique : envoie les fichiers du jeu au navigateur ———
const server = http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
  if (url === '/sante') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify(Object.assign({ ok: true, connexions: clients.size, mers: rooms.size }, game.stats()))); }
  if (url === '/stats') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); return res.end(statsPage()); }
  // pour Google : fichiers qui expliquent quoi indexer
  const SITE = process.env.SITE_URL || 'https://rivalsea.onrender.com';
  if (url === '/robots.txt') { res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('User-agent: *\nAllow: /\nDisallow: /sante\nDisallow: /stats\nSitemap: ' + SITE + '/sitemap.xml\n'); }
  if (url === '/sitemap.xml') { res.writeHead(200, { 'content-type': 'application/xml; charset=utf-8' }); return res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + SITE + '/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>\n'); }
  // validation Google Search Console (ne pas supprimer)
  if (url === '/googleba4933d594ddb893.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end('google-site-verification: googleba4933d594ddb893.html'); }
  if (url === '/favicon.ico') url = '/icon-32.png';
  if (url === '/') url = '/index.html';
  if (!PUBLIC_FILES.has(url)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Introuvable'); }
  const file = path.join(PUB, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Introuvable'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(data);
  });
});

// ——— 2. WebSocket : la « ligne téléphonique » ouverte en permanence entre chaque joueur et le serveur ———
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
server.on('upgrade', (req, sock) => {
  if (!(req.url || '').startsWith('/ws') || String(req.headers.upgrade).toLowerCase() !== 'websocket' || !req.headers['sec-websocket-key']) { sock.destroy(); return; }
  const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + GUID).digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  sock.setNoDelay(true);
  const c = { sock, buf: Buffer.alloc(0), frag: [], bid: 0, vw: 1200, vh: 900, px: 1700, py: 1700, msgs: 0, room: null };
  clients.add(c); STATS.visits++;
  enter(c, MAIN); send(c, { t: 'top', l: dayTop(), w: dayTop(1) });
  sock.on('data', d => { c.buf = Buffer.concat([c.buf, d]); if (c.buf.length > 1e6) return sock.destroy(); readFrames(c); });
  const bye = () => { if (!clients.delete(c)) return; if (c.bid && c.room) c.room.g.removePlayer(c.bid); };
  sock.on('close', bye); sock.on('error', bye); sock.on('end', bye);
});

// Décodage des messages WebSocket (format défini par la norme RFC 6455)
function readFrames(c) {
  for (;;) {
    const b = c.buf; if (b.length < 2) return;
    const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80; let len = b[1] & 0x7f, o = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); o = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); o = 10; }
    if (len > 65536) { c.sock.destroy(); return; }
    const mo = masked ? 4 : 0; if (b.length < o + mo + len) return;
    let p = Buffer.from(b.subarray(o + mo, o + mo + len));
    if (masked) { const m = b.subarray(o, o + 4); for (let i = 0; i < p.length; i++) p[i] ^= m[i & 3]; }
    c.buf = b.subarray(o + mo + len);
    if (op === 8) { try { c.sock.end(frame(Buffer.alloc(0), 8)); } catch (e) {} return; } // fermeture
    if (op === 9) { c.sock.write(frame(p, 10)); continue; }                               // ping → pong
    if (op === 10) continue;
    if (op === 1 || op === 0) { c.frag.push(p); if (fin) { const txt = Buffer.concat(c.frag).toString('utf8'); c.frag = []; onMessage(c, txt); } }
  }
}
function frame(p, op) {
  const n = p.length; let h;
  if (n < 126) h = Buffer.from([0x80 | op, n]);
  else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([h, p]);
}
function send(c, obj) {
  if (c.sock.destroyed || c.sock.writableLength > 512e3) return; // connexion trop lente : on saute une image plutôt que d'accumuler
  try { c.sock.write(frame(Buffer.from(JSON.stringify(obj)), 1)); } catch (e) {}
}

// ——— 3. Ce que les joueurs envoient : rejoindre, diriger, compétence, choix de bonus ———
function onMessage(c, txt) {
  if (++c.msgs > 120) return; // protection contre l'envoi massif de messages
  let m; try { m = JSON.parse(txt); } catch (e) { return; }
  if (!m || typeof m !== 'object') return;
  switch (m.t) {
    case 'join': {
      if (c.bid && c.room.g.alive(c.bid)) return;
      // choix de la mer : publique (chacun pour soi ou équipes), nouvelle partie privée, ou code d'une partie privée
      let r = c.room; const want = String(m.room || '');
      if (want === 'new') { if (rooms.size >= MAX_ROOMS) return send(c, { t: 'full' }); r = makeRoom(m.mode === 'team' ? 'team' : 'ffa', true); }
      else if (want && want !== 'ffa' && want !== 'team') { r = rooms.get(want.toUpperCase()); if (!r || !r.priv) return send(c, { t: 'noroom' }); }
      else if (want === 'ffa' || want === 'team') { if (c.room.priv || c.room.mode !== want || humansIn(c.room) >= MAX_PLAYERS) r = publicRoom(want); }
      if (!r || humansIn(r) >= MAX_PLAYERS) return send(c, { t: 'full' });
      enter(c, r);
      c.bid = r.g.addPlayer(m); send(c, { t: 'joined', id: c.bid, room: r.priv ? r.id : '', mode: r.mode }); send(c, { t: 'top', l: dayTop(), w: dayTop(1) }); break; }
    case 'leave': if (c.room !== MAIN) enter(c, MAIN); break;
    case 'avis': {
      const v = m.v === 1 ? 1 : m.v === -1 ? -1 : 0, txt = MAIN.g.cleanText(String(m.txt || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 300));
      if (!v && !txt) break; if (c.avis && Date.now() - c.avis < 20000) break; c.avis = Date.now();
      STATS.avis.unshift({ v, txt, d: new Date().toISOString().slice(0, 16) }); STATS.avis.length = Math.min(STATS.avis.length, 200);
      console.log('AVIS', v > 0 ? '👍' : v < 0 ? '👎' : '·', txt); break; }
    case 'in':
      if (c.bid) c.room.g.input(c.bid, m);
      if (Number.isFinite(+m.vw)) c.vw = Math.min(2600, Math.max(300, +m.vw));
      if (Number.isFinite(+m.vh)) c.vh = Math.min(2000, Math.max(300, +m.vh));
      break;
    case 'ping': if (Number.isFinite(+m.c)) send(c, { t: 'pong', c: +m.c }); break; // mesure du ping affichée en jeu
    case 'sk': if (c.bid) c.room.g.skill(c.bid); break;
    case 'pick': if (c.bid) c.room.g.pickOffer(c.bid, m.o, m.i); break;
  }
}

// ——— 4. La boucle de jeu ———
let n = 0, acc = 0, last = Date.now();
setInterval(() => {
  // si le serveur a pris du retard, on rattrape (3 pas au plus) pour que le jeu garde la même vitesse
  const now = Date.now(); acc = Math.min(acc + (now - last) / 1000, TICK * 3); last = now;
  if (acc < TICK * .5) return;
  const steps = Math.max(1, Math.floor(acc / TICK + .01)); acc = Math.max(0, acc - steps * TICK);
  for (const c of clients) c.msgs = 0;
  const send1 = ++n % SEND_EVERY === 0;
  for (const r of rooms.values()) {
    for (let k = 0; k < steps; k++) r.g.tick(TICK);
    for (const e of r.g.drainEvents()) note(e, r);
    for (const d of r.g.drainDeaths()) for (const c of clients) if (c.room === r && c.bid === d.id) { send(c, { t: 'top', l: dayTop(), w: dayTop(1) }); send(c, Object.assign({ t: 'dead' }, d)); c.px = d.x; c.py = d.y; }
    if (send1) { for (const c of clients) if (c.room === r) { const st = r.g.snapshotFor(c.bid, c.vw, c.vh, c.px, c.py, c.cache || (c.cache = {})); if (st.me) { c.px = st.me.x; c.py = st.me.y; } send(c, st); } r.g.clearFx(); }
    // une mer vide depuis 3 minutes est fermée (sauf la mer principale)
    if (r !== MAIN) { if (usersIn(r) === 0) { r.empty += TICK * steps; if (r.empty > 180) rooms.delete(r.id); } else r.empty = 0; }
  }
}, TICK * 1000);

server.listen(PORT, () => console.log('RivalSea est en ligne sur http://localhost:' + PORT + '  (mode ' + (game.MODE === 'team' ? 'équipages' : 'chacun pour soi') + ')'));

// les meilleurs vrais joueurs du jour, envoyés à tous toutes les 15 secondes
function dayTop(w) { const all = []; for (const r of rooms.values()) if (!r.priv) all.push(...(w ? r.g.topWeek() : r.g.top())); const seen = new Set(); return all.sort((a, b) => b.l - a.l || b.s - a.s).filter(x => { const k = x.n + '|' + x.l + '|' + x.c; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5); }
setInterval(() => { const m = { t: 'top', l: dayTop(), w: dayTop(1) }; for (const c of clients) send(c, m); }, 15000);

// ——— 5. Rester éveillé ———
// Sur l'offre gratuite de Render, le serveur s'endort après 15 minutes sans visite et met ensuite ~50 s à se réveiller.
// Il se rend donc visite à lui-même toutes les 10 minutes (Render fournit son adresse publique dans RENDER_EXTERNAL_URL).
const SELF_URL = process.env.RENDER_EXTERNAL_URL || (process.env.RENDER ? 'https://rivalsea.onrender.com' : '');
if (SELF_URL) setInterval(() => { require('https').get(SELF_URL + '/sante', r => r.resume()).on('error', () => {}); }, 10 * 60 * 1000);
