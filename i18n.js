// Traductions de Flottille : français (fr), anglais (en), espagnol (es).
// Pour corriger un texte, modifiez-le ici. Le français des navires, bonus et compétences est dans shared.js.
(function (root) {
'use strict';
const UI = {
fr: {
  intro: 'Cassez tonneaux et coffres, coulez les autres navires et faites évoluer votre bateau aux niveaux 5, 10, 15 et 20. Les petits navires disparaissent dans le brouillard ; les gros sont puissants mais lents.',
  name: 'Nom', namePh: 'Moussaillon', hull: 'Coque', sails: 'Voiles', flag: 'Pavillon', preview: 'Aperçu du navire',
  aiNote: 'Les navires marqués <b>IA</b> sont des bots qui complètent la partie quand il y a peu de joueurs.',
  controls: 'Souris ou joystick tactile pour diriger · <b>Espace</b> ou bouton rond pour la compétence · touches <b>1 2 3</b> pour les choix',
  join: 'Rejoindre la partie', language: 'Langue',
  full: 'Le serveur est complet pour le moment, réessayez dans un instant.',
  connected: 'Connecté au serveur · mode {m}', modeTeam: 'équipages (4 couleurs)', modeFfa: 'chacun pour soi',
  unreachable: 'Serveur injoignable, nouvelle tentative…', connecting: 'Connexion au serveur… (jusqu’à une minute s’il était en veille)', connectingShort: 'Connexion au serveur…',
  lost: 'La connexion au serveur a été perdue. Nouvelle tentative…',
  sunkTitle: 'Coulé !', sunkBy: 'Envoyé par le fond par <b>{n}</b>.', sunkStats: '{c} de niveau {l}, {s} navires coulés.', again: 'Reprendre la mer', edit: 'Modifier mon navire',
  hp: 'PV', speed: 'Vitesse', targets: '{n} cibles', explosion: 'explosion', side: 'tir latéral', regen: 'auto-réparation', hides: 'se cache',
  evoTitle: 'Niveau {l} : évolution ! Choisissez votre navire', bonusTitle: 'Niveau {l} : choisissez un bonus', key: 'touche {n}', legendary: 'Légendaire',
  convoy: 'Convoi', storm: 'Tempête', escort: 'Escorte', ai: 'IA',
  crew: 'Équipages', board: 'Classement', you: '(vous)', lvl: 'niv. {l}', lvlLong: 'Niv. {l}', sunkCount: 'Coulés : {n}', flanks: '(flancs)',
  evoAt: 'Évolution au niveau {l}', evoMax: 'Évolution maximale', hidden: 'Caché dans le brouillard', tooBig: 'Trop grand pour se cacher ici',
  space: 'Espace', hitBy: 'Touché par {n}', protected: 'Protégé (attaquer un navire met fin à la protection)', someone: 'Quelqu’un', theKraken: 'le kraken',
  'fx.sunk': 'Coulé ! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': 'Éperonnage !', 'fx.evo': '{c} !', 'fx.skill': '{s}',
  'ev.kraken': 'Un kraken a surgi des profondeurs !', 'ev.storm': 'Une tempête approche !', 'ev.convoy': 'Un convoi marchand escorté traverse la mer !', 'ev.treasure': 'Un trésor géant est apparu !',
  'ev.krakenDead': '{n} a vaincu le kraken !', 'ev.treasureDead': '{n} a pillé le trésor !', 'ev.krakenGone': 'Le kraken replonge dans les abysses…', 'ev.convoyGone': 'Le convoi s’est échappé.',
  'ev.leaderSunk': '{n} a coulé le chef de la flotte, {v} !'
},
en: {
  intro: 'Smash barrels and chests, sink other ships and upgrade your boat at levels 5, 10, 15 and 20. Small ships vanish in the fog; big ones are powerful but slow.',
  name: 'Name', namePh: 'Deckhand', hull: 'Hull', sails: 'Sails', flag: 'Flag', preview: 'Ship preview',
  aiNote: 'Ships marked <b>AI</b> are bots that fill the game when there are few players.',
  controls: 'Mouse or touch joystick to steer · <b>Space</b> or round button for your skill · keys <b>1 2 3</b> for choices',
  join: 'Join the game', language: 'Language',
  full: 'The server is full right now, try again in a moment.',
  connected: 'Connected to the server · {m} mode', modeTeam: 'crews (4 colours)', modeFfa: 'free-for-all',
  unreachable: 'Server unreachable, retrying…', connecting: 'Connecting to the server… (up to a minute if it was asleep)', connectingShort: 'Connecting to the server…',
  lost: 'The connection to the server was lost. Retrying…',
  sunkTitle: 'Sunk!', sunkBy: 'Sent to the bottom by <b>{n}</b>.', sunkStats: 'Level {l} {c}, {s} ships sunk.', again: 'Set sail again', edit: 'Customise my ship',
  hp: 'HP', speed: 'Speed', targets: '{n} targets', explosion: 'explosion', side: 'side fire', regen: 'self-repair', hides: 'can hide',
  evoTitle: 'Level {l}: upgrade! Choose your ship', bonusTitle: 'Level {l}: choose a bonus', key: 'key {n}', legendary: 'Legendary',
  convoy: 'Convoy', storm: 'Storm', escort: 'Escort', ai: 'AI',
  crew: 'Crews', board: 'Leaderboard', you: '(you)', lvl: 'lvl {l}', lvlLong: 'Lvl {l}', sunkCount: 'Sunk: {n}', flanks: '(sides)',
  evoAt: 'Upgrade at level {l}', evoMax: 'Fully upgraded', hidden: 'Hidden in the fog', tooBig: 'Too big to hide here',
  space: 'Space', hitBy: 'Hit by {n}', protected: 'Protected (attacking a ship ends the protection)', someone: 'Someone', theKraken: 'the kraken',
  'fx.sunk': 'Sunk! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': 'Rammed!', 'fx.evo': '{c}!', 'fx.skill': '{s}',
  'ev.kraken': 'A kraken has risen from the deep!', 'ev.storm': 'A storm is coming!', 'ev.convoy': 'An escorted merchant convoy is crossing the sea!', 'ev.treasure': 'A giant treasure has appeared!',
  'ev.krakenDead': '{n} has slain the kraken!', 'ev.treasureDead': '{n} has looted the treasure!', 'ev.krakenGone': 'The kraken sinks back into the abyss…', 'ev.convoyGone': 'The convoy got away.',
  'ev.leaderSunk': '{n} sank the fleet leader, {v}!'
},
es: {
  intro: 'Rompe barriles y cofres, hunde los demás barcos y mejora tu nave en los niveles 5, 10, 15 y 20. Los barcos pequeños desaparecen en la niebla; los grandes son potentes pero lentos.',
  name: 'Nombre', namePh: 'Grumete', hull: 'Casco', sails: 'Velas', flag: 'Bandera', preview: 'Vista previa del barco',
  aiNote: 'Los barcos marcados <b>IA</b> son bots que completan la partida cuando hay pocos jugadores.',
  controls: 'Ratón o joystick táctil para dirigir · <b>Espacio</b> o botón redondo para la habilidad · teclas <b>1 2 3</b> para elegir',
  join: 'Unirse a la partida', language: 'Idioma',
  full: 'El servidor está lleno ahora mismo, inténtalo de nuevo en un momento.',
  connected: 'Conectado al servidor · modo {m}', modeTeam: 'tripulaciones (4 colores)', modeFfa: 'todos contra todos',
  unreachable: 'Servidor inaccesible, reintentando…', connecting: 'Conectando al servidor… (hasta un minuto si estaba en reposo)', connectingShort: 'Conectando al servidor…',
  lost: 'Se perdió la conexión con el servidor. Reintentando…',
  sunkTitle: '¡Hundido!', sunkBy: 'Enviado al fondo por <b>{n}</b>.', sunkStats: '{c} de nivel {l}, {s} barcos hundidos.', again: 'Volver al mar', edit: 'Personalizar mi barco',
  hp: 'PV', speed: 'Velocidad', targets: '{n} objetivos', explosion: 'explosión', side: 'disparo lateral', regen: 'autorreparación', hides: 'se esconde',
  evoTitle: 'Nivel {l}: ¡evolución! Elige tu barco', bonusTitle: 'Nivel {l}: elige una mejora', key: 'tecla {n}', legendary: 'Legendario',
  convoy: 'Convoy', storm: 'Tormenta', escort: 'Escolta', ai: 'IA',
  crew: 'Tripulaciones', board: 'Clasificación', you: '(tú)', lvl: 'niv. {l}', lvlLong: 'Niv. {l}', sunkCount: 'Hundidos: {n}', flanks: '(flancos)',
  evoAt: 'Evolución en el nivel {l}', evoMax: 'Evolución máxima', hidden: 'Escondido en la niebla', tooBig: 'Demasiado grande para esconderse aquí',
  space: 'Espacio', hitBy: 'Alcanzado por {n}', protected: 'Protegido (atacar un barco termina la protección)', someone: 'Alguien', theKraken: 'el kraken',
  'fx.sunk': '¡Hundido! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': '¡Embestida!', 'fx.evo': '¡{c}!', 'fx.skill': '{s}',
  'ev.kraken': '¡Un kraken ha surgido de las profundidades!', 'ev.storm': '¡Se acerca una tormenta!', 'ev.convoy': '¡Un convoy mercante escoltado cruza el mar!', 'ev.treasure': '¡Ha aparecido un tesoro gigante!',
  'ev.krakenDead': '¡{n} ha vencido al kraken!', 'ev.treasureDead': '¡{n} ha saqueado el tesoro!', 'ev.krakenGone': 'El kraken vuelve a hundirse en el abismo…', 'ev.convoyGone': 'El convoy ha escapado.',
  'ev.leaderSunk': '¡{n} ha hundido al jefe de la flota, {v}!'
}};

// Navires : [nom, description, arme]
const CLX = {
en: { chaloupe: ['Rowboat', 'Small rowing boat.', 'Musket'], cotre: ['Cutter', 'Spray of shot at short range.', 'Blunderbuss'], sloop: ['Sloop', 'A heavy, accurate bow cannon.', 'Bow cannon'], pirogue: ['Racing canoe', 'Very fast, high rate of fire.', 'Twin muskets'],
  brick: ['Brig', 'Fan of grapeshot, deadly up close.', 'Grapeshot'], caravelle: ['Caravel', 'Two blunderbusses, two targets at once.', 'Double blunderbuss'], fregate: ['Frigate', 'Fires from the sides: turn your flank to the target.', 'Broadsides'], bombarde: ['Bomb ketch', 'Slow shell that explodes over an area.', 'Mortar'], goelette: ['Schooner', 'Three muskets, frantic fire rate.', 'Musket battery'], jonque: ['Junk', 'Rockets that target three enemies.', 'Rockets'],
  galion: ['Great galleon', 'Two side batteries of four cannons.', 'Batteries'], caraque: ['Carrack', 'Thick hull, grapeshot on two targets.', 'Double grapeshot'], vaisseau: ['Ship of the line', 'Broadsides of heavy cannons at long range.', 'Heavy cannons'], clipper: ['Clipper', 'The fastest of the tall ships, but fragile.', 'Repeating muskets'], cuirasse: ['Steam ironclad', 'Two turrets of heavy mortars.', 'Heavy mortars'],
  galionroyal: ['Royal galleon', 'Broadsides of four cannons on three targets.', 'Royal batteries'], fantome: ['Ghost ship', 'Repairs itself and can still hide in the fog.', 'Spectral cannons'], forteresse: ['Floating fortress', 'Mortar turrets, huge hull, very slow.', 'Triple mortar'], tempete: ['Storm clipper', 'Insane speed, three muskets on two targets.', 'Thunder muskets'], dreadnought: ['Dreadnought', 'Double explosive shells on three targets.', 'Heavy turrets'] },
es: { chaloupe: ['Bote de remos', 'Pequeño bote de remos.', 'Mosquete'], cotre: ['Cúter', 'Ráfaga de perdigones a corta distancia.', 'Trabuco'], sloop: ['Balandra', 'Un cañón de proa pesado y preciso.', 'Cañón de proa'], pirogue: ['Piragua de carreras', 'Muy rápida, alta cadencia de tiro.', 'Mosquetes gemelos'],
  brick: ['Bergantín', 'Abanico de metralla, letal de cerca.', 'Metralla'], caravelle: ['Carabela', 'Dos trabucos, dos objetivos a la vez.', 'Trabuco doble'], fregate: ['Fragata', 'Dispara por los costados: presenta el flanco al objetivo.', 'Andanadas'], bombarde: ['Bombarda', 'Proyectil lento que explota en área.', 'Mortero'], goelette: ['Goleta', 'Tres mosquetes, cadencia frenética.', 'Batería de mosquetes'], jonque: ['Junco', 'Cohetes que apuntan a tres objetivos.', 'Cohetes'],
  galion: ['Gran galeón', 'Dos baterías laterales de cuatro cañones.', 'Baterías'], caraque: ['Carraca', 'Casco grueso, metralla sobre dos objetivos.', 'Metralla doble'], vaisseau: ['Navío de línea', 'Andanadas de cañones pesados a larga distancia.', 'Cañones pesados'], clipper: ['Clíper', 'El más rápido de los grandes veleros, pero frágil.', 'Mosquetes de repetición'], cuirasse: ['Acorazado a vapor', 'Dos torretas de morteros pesados.', 'Morteros pesados'],
  galionroyal: ['Galeón real', 'Andanadas de cuatro cañones sobre tres objetivos.', 'Baterías reales'], fantome: ['Barco fantasma', 'Se repara solo y aún puede esconderse en la niebla.', 'Cañones espectrales'], forteresse: ['Fortaleza flotante', 'Torretas de morteros, casco enorme, muy lenta.', 'Triple mortero'], tempete: ['Clíper de tormenta', 'Velocidad loca, tres mosquetes sobre dos objetivos.', 'Mosquetes trueno'], dreadnought: ['Dreadnought', 'Dobles proyectiles explosivos sobre tres objetivos.', 'Torretas pesadas'] }
};
// Bonus (même ordre que BON dans shared.js) : [nom, description]
const BONX = {
en: [['Light cannons', 'Fire rate +20%'], ['Heavy calibre', 'Damage +25%'], ['New sails', 'Speed +10%'], ['Spyglass', 'Range +15%'], ['Reinforced hull', '+30 max hit points'], ['Multi-shot', 'One more projectile per shot'], ['Carpenter', 'Repairs 1.5 HP per second'], ['Salvage nets', 'XP from wrecks and barrels +30%'], ['Ram bow', 'Ramming damage +50%'], ['Boatswain', 'Special skill ready 25% faster']],
es: [['Cañones ligeros', 'Cadencia de tiro +20 %'], ['Gran calibre', 'Daño +25 %'], ['Velas nuevas', 'Velocidad +10 %'], ['Catalejo', 'Alcance +15 %'], ['Casco reforzado', '+30 puntos de vida máx.'], ['Salva múltiple', 'Un proyectil más por disparo'], ['Carpintero', 'Repara 1,5 puntos de vida por segundo'], ['Redes de rescate', 'XP de restos y barriles +30 %'], ['Espolón de proa', 'Daño de embestida +50 %'], ['Contramaestre', 'Habilidad especial lista un 25 % antes']]
};
// Compétences : [nom, abréviation du bouton]
const SKX = {
en: { boost: ['Speed boost', 'Fast'], smoke: ['Smoke screen', 'Smoke'], repair: ['Repair', 'Repair'], salvo: ['Concentrated broadside', 'Salvo'] },
es: { boost: ['Acelerón', 'Rápido'], smoke: ['Cortina de humo', 'Humo'], repair: ['Reparación', 'Reparar'], salvo: ['Andanada concentrada', 'Salva'] }
};
const LTX = { en: { peche: 'Fisherman', marchand: 'Merchant', tresor: 'Treasure', kraken: 'Kraken' }, es: { peche: 'Pescador', marchand: 'Mercante', tresor: 'Tesoro', kraken: 'Kraken' } };
const TEAMX = { en: ['Reds', 'Yellows', 'Purples', 'Greens'], es: ['Rojos', 'Amarillos', 'Morados', 'Verdes'] };
const HULLX = { en: ['Coral', 'Sun', 'Lavender', 'Mint', 'Pink', 'Orange', 'Azure', 'Slate'], es: ['Coral', 'Sol', 'Lavanda', 'Menta', 'Rosa', 'Naranja', 'Azul', 'Pizarra'] };
const SAILX = { en: ['Cream', 'Black', 'Red', 'Blue', 'Gold'], es: ['Crema', 'Negro', 'Rojo', 'Azul', 'Oro'] };

const LANGS = [['fr', 'FR', 'Français'], ['en', 'EN', 'English'], ['es', 'ES', 'Español']];
let lang = 'fr';
try { lang = localStorage.getItem('flottille-lang') || ''; } catch (e) {}
if (!UI[lang]) { const n = (navigator.language || 'fr').slice(0, 2).toLowerCase(); lang = UI[n] ? n : 'fr'; }
const fill = (s, p) => String(s).replace(/\{(\w+)\}/g, (m, k) => p && p[k] !== undefined ? p[k] : m);
const I = {
  LANGS,
  get lang() { return lang; },
  withLang(l, fn) { const o = lang; lang = l; try { return fn(); } finally { lang = o; } },
  setLang(l) { if (!UI[l]) return; lang = l; try { localStorage.setItem('flottille-lang', l); } catch (e) {} document.documentElement.lang = l; },
  t(k, p) { return fill(UI[lang][k] !== undefined ? UI[lang][k] : (UI.fr[k] !== undefined ? UI.fr[k] : k), p); },
  cls(k) { const S = root.S, c = S.CL[k], x = CLX[lang] && CLX[lang][k]; return x ? { n: x[0], d: x[1], w: x[2] } : { n: c.n, d: c.d, w: c.w.nm }; },
  bon(i) { const b = root.S.BON[i], x = BONX[lang] && BONX[lang][i]; return x ? { n: x[0], d: x[1] } : { n: b.n, d: b.d }; },
  sk(k) { const s = root.S.SK[k], x = SKX[lang] && SKX[lang][k]; return x ? { n: x[0], ab: x[1] } : { n: s.n, ab: s.ab }; },
  loot(k) { const x = LTX[lang] && LTX[lang][k]; return x || root.S.LT[k].nm; },
  team(i) { const x = TEAMX[lang]; return x ? x[i] : root.S.TEAMS[i].n; },
  hull(i) { const x = HULLX[lang]; return x ? x[i] : root.S.HULLS[i][1]; },
  sail(i) { const x = SAILX[lang]; return x ? x[i] : root.S.SAILS[i][1]; },
  num(v) { return Number(v).toLocaleString(lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'fr-FR', { maximumFractionDigits: 2 }); }
};
document.documentElement.lang = lang;
root.I18N = I;
})(window);
