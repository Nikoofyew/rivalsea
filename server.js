// Serveur Flottille : sert le jeu (index.html, shared.js) et fait le lien en temps réel avec les joueurs.
// Aucune dépendance à installer : uniquement Node.js (version 18 ou plus récente).
// Lancement : node server.js   puis ouvrir http://localhost:3000
// Fichiers du jeu : index.html et shared.js (navigateur), game.js et server.js (serveur).
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const game = require('./game');

const PORT = parseInt(process.env.PORT || '3000', 10);
const PUB = __dirname;
const PUBLIC_FILES = new Set(['/index.html', '/shared.js', '/i18n.js', '/favicon.svg']); // seuls fichiers envoyés aux navigateurs
const TICK = 1 / 30;          // la simulation avance 30 fois par seconde
const SEND_EVERY = 2;         // on envoie l'état aux joueurs 15 fois par seconde
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS || '40', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' };
const clients = new Set();

// ——— 1. Serveur web classique : envoie les fichiers du jeu au navigateur ———
const server = http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
  if (url === '/sante') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify(Object.assign({ ok: true, connexions: clients.size }, game.stats()))); }
  // pour Google : fichiers qui expliquent quoi indexer
  const SITE = process.env.SITE_URL || 'https://flottille.onrender.com';
  if (url === '/robots.txt') { res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('User-agent: *\nAllow: /\nDisallow: /sante\nSitemap: ' + SITE + '/sitemap.xml\n'); }
  if (url === '/sitemap.xml') { res.writeHead(200, { 'content-type': 'application/xml; charset=utf-8' }); return res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + SITE + '/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>\n'); }
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
  const c = { sock, buf: Buffer.alloc(0), frag: [], bid: 0, vw: 1200, vh: 900, px: 1700, py: 1700, msgs: 0 };
  clients.add(c);
  send(c, game.welcome());
  sock.on('data', d => { c.buf = Buffer.concat([c.buf, d]); if (c.buf.length > 1e6) return sock.destroy(); readFrames(c); });
  const bye = () => { if (!clients.delete(c)) return; if (c.bid) game.removePlayer(c.bid); };
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
    case 'join':
      if (c.bid && game.alive(c.bid)) return;
      if ([...clients].filter(x => x.bid && game.alive(x.bid)).length >= MAX_PLAYERS) return send(c, { t: 'full' });
      c.bid = game.addPlayer(m); send(c, { t: 'joined', id: c.bid }); break;
    case 'in':
      if (c.bid) game.input(c.bid, m);
      if (Number.isFinite(+m.vw)) c.vw = Math.min(2600, Math.max(300, +m.vw));
      if (Number.isFinite(+m.vh)) c.vh = Math.min(2000, Math.max(300, +m.vh));
      break;
    case 'sk': if (c.bid) game.skill(c.bid); break;
    case 'pick': if (c.bid) game.pickOffer(c.bid, m.o, m.i); break;
  }
}

// ——— 4. La boucle de jeu ———
let n = 0;
setInterval(() => {
  for (const c of clients) c.msgs = 0;
  game.tick(TICK);
  for (const d of game.drainDeaths()) for (const c of clients) if (c.bid === d.id) { send(c, Object.assign({ t: 'dead' }, d)); c.px = d.x; c.py = d.y; }
  if (++n % SEND_EVERY) return;
  for (const c of clients) { const st = game.snapshotFor(c.bid, c.vw, c.vh, c.px, c.py); if (st.me) { c.px = st.me.x; c.py = st.me.y; } send(c, st); }
  game.clearFx();
}, TICK * 1000);

server.listen(PORT, () => console.log('Flottille est en ligne sur http://localhost:' + PORT + '  (mode ' + (game.MODE === 'team' ? 'équipages' : 'chacun pour soi') + ')'));
