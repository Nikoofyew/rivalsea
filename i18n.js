// Traductions de RivalSea : français (fr), anglais (en), espagnol (es).
// Pour corriger un texte, modifiez-le ici. Le français des navires, bonus et compétences est dans shared.js.
(function (root) {
'use strict';
const UI = {
fr: {
  intro: 'Cassez tonneaux et coffres, coulez les autres navires et faites évoluer votre bateau, des rames jusqu’au moteur. Au niveau 5, choisissez votre famille : rapide, abordage ou artillerie. Les petits navires disparaissent dans le brouillard.',
  name: 'Nom', namePh: 'Moussaillon', hull: 'Coque', sails: 'Voiles', flag: 'Pavillon', preview: 'Aperçu du navire',
  aiNote: 'Les navires marqués <b>IA</b> sont des bots qui complètent la partie quand il y a peu de joueurs.',
  controls: 'Souris ou joystick tactile pour diriger · <b>Espace</b> ou bouton rond pour la compétence · touches <b>1 2 3</b> pour les choix',
  join: 'Rejoindre la partie', language: 'Langue',
  guide: 'Guide', guideTitle: 'Arbre des navires', guideHint: 'Passez la souris sur un navire (ou touchez-le) pour voir ses détails.', back: 'Retour', start: 'Départ', tierLvl: 'Niveau {l}', upgradesTitle: 'Bonus proposés aux autres niveaux', weapon: 'Arme', skill: 'Compétence', evolvesTo: 'Évolue en', finalShip: 'Navire final', colon: ' : ', cd: 'recharge {s} s',
  'skd.boost': 'Vitesse ×1,7 pendant 2,5 s', 'skd.smoke': 'Crée un banc de brouillard pendant 8 s', 'skd.repair': 'Rend 35 % des points de vie', 'skd.salvo': 'Salve immédiate : +2 projectiles, dégâts ×1,6',
  full: 'Le serveur est complet pour le moment, réessayez dans un instant.',
  connected: 'Connecté au serveur · mode {m}', modeTeam: 'équipages (4 couleurs)', modeFfa: 'chacun pour soi',
  unreachable: 'Serveur injoignable, nouvelle tentative…', connecting: 'Connexion au serveur… (jusqu’à une minute s’il était en veille)', connectingShort: 'Connexion au serveur…',
  lost: 'La connexion au serveur a été perdue. Nouvelle tentative…',
  sunkTitle: 'Coulé !', sunkBy: 'Envoyé par le fond par <b>{n}</b>.', sunkStats: '{c} de niveau {l}, {s} navires coulés.', again: 'Reprendre la mer', edit: 'Modifier mon navire',
  hp: 'PV', speed: 'Vitesse', targets: '{n} cibles', explosion: 'explosion', side: 'tir latéral', regen: 'auto-réparation', hides: 'se cache', ramS: 'éperon ×{n}', board: 'abordage', armor: 'blindage {n} %', second: 'Arme secondaire', 'fam.r': 'Famille rapide', 'fam.a': 'Famille abordage', 'fam.c': 'Famille artillerie',
  evoTitle: 'Niveau {l} : évolution ! Choisissez votre navire', bonusTitle: 'Niveau {l} : choisissez un bonus', key: 'touche {n}', legendary: 'Légendaire',
  convoy: 'Convoi', storm: 'Tempête', escort: 'Escorte', ai: 'IA',
  crew: 'Équipages', board: 'Classement', you: '(vous)', lvl: 'niv. {l}', lvlLong: 'Niv. {l}', sunkCount: 'Coulés : {n}', flanks: '(flancs)',
  evoAt: 'Évolution au niveau {l}', evoMax: 'Évolution maximale', hidden: 'Caché dans le brouillard', tooBig: 'Trop grand pour se cacher ici',
  space: 'Espace', hitBy: 'Touché par {n}', protected: 'Protégé (attaquer un navire met fin à la protection)', someone: 'Quelqu’un', theKraken: 'le kraken',
  'fx.sunk': 'Coulé ! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': 'Éperonnage !', 'fx.heal': '+{x} PV', 'fx.evo': '{c} !', 'fx.skill': '{s}',
  'ev.kraken': 'Un kraken a surgi des profondeurs !', 'ev.storm': 'Une tempête approche !', 'ev.convoy': 'Un convoi marchand escorté traverse la mer !', 'ev.treasure': 'Un trésor géant est apparu !',
  'ev.krakenDead': '{n} a vaincu le kraken !', 'ev.treasureDead': '{n} a pillé le trésor !', 'ev.krakenGone': 'Le kraken replonge dans les abysses…', 'ev.convoyGone': 'Le convoi s’est échappé.',
  'ev.leaderSunk': '{n} a coulé le chef de la flotte, {v} !'
},
en: {
  intro: 'Smash barrels and chests, sink other ships and upgrade your boat from oars to engines. At level 5, pick your family: speed, boarding or artillery. Small ships vanish in the fog.',
  name: 'Name', namePh: 'Deckhand', hull: 'Hull', sails: 'Sails', flag: 'Flag', preview: 'Ship preview',
  aiNote: 'Ships marked <b>AI</b> are bots that fill the game when there are few players.',
  controls: 'Mouse or touch joystick to steer · <b>Space</b> or round button for your skill · keys <b>1 2 3</b> for choices',
  join: 'Join the game', language: 'Language',
  guide: 'Guide', guideTitle: 'Ship tree', guideHint: 'Hover over a ship (or tap it) to see its details.', back: 'Back', start: 'Start', tierLvl: 'Level {l}', upgradesTitle: 'Bonuses offered at the other levels', weapon: 'Weapon', skill: 'Skill', evolvesTo: 'Upgrades to', finalShip: 'Final ship', colon: ': ', cd: '{s} s cooldown',
  'skd.boost': 'Speed ×1.7 for 2.5 s', 'skd.smoke': 'Creates a fog bank for 8 s', 'skd.repair': 'Restores 35% of hit points', 'skd.salvo': 'Instant salvo: +2 projectiles, damage ×1.6',
  full: 'The server is full right now, try again in a moment.',
  connected: 'Connected to the server · {m} mode', modeTeam: 'crews (4 colours)', modeFfa: 'free-for-all',
  unreachable: 'Server unreachable, retrying…', connecting: 'Connecting to the server… (up to a minute if it was asleep)', connectingShort: 'Connecting to the server…',
  lost: 'The connection to the server was lost. Retrying…',
  sunkTitle: 'Sunk!', sunkBy: 'Sent to the bottom by <b>{n}</b>.', sunkStats: 'Level {l} {c}, {s} ships sunk.', again: 'Set sail again', edit: 'Customise my ship',
  hp: 'HP', speed: 'Speed', targets: '{n} targets', explosion: 'explosion', side: 'side fire', regen: 'self-repair', hides: 'can hide', ramS: 'ram ×{n}', board: 'boarding', armor: 'armour {n}%', second: 'Secondary weapon', 'fam.r': 'Speed family', 'fam.a': 'Boarding family', 'fam.c': 'Artillery family',
  evoTitle: 'Level {l}: upgrade! Choose your ship', bonusTitle: 'Level {l}: choose a bonus', key: 'key {n}', legendary: 'Legendary',
  convoy: 'Convoy', storm: 'Storm', escort: 'Escort', ai: 'AI',
  crew: 'Crews', board: 'Leaderboard', you: '(you)', lvl: 'lvl {l}', lvlLong: 'Lvl {l}', sunkCount: 'Sunk: {n}', flanks: '(sides)',
  evoAt: 'Upgrade at level {l}', evoMax: 'Fully upgraded', hidden: 'Hidden in the fog', tooBig: 'Too big to hide here',
  space: 'Space', hitBy: 'Hit by {n}', protected: 'Protected (attacking a ship ends the protection)', someone: 'Someone', theKraken: 'the kraken',
  'fx.sunk': 'Sunk! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': 'Rammed!', 'fx.heal': '+{x} HP', 'fx.evo': '{c}!', 'fx.skill': '{s}',
  'ev.kraken': 'A kraken has risen from the deep!', 'ev.storm': 'A storm is coming!', 'ev.convoy': 'An escorted merchant convoy is crossing the sea!', 'ev.treasure': 'A giant treasure has appeared!',
  'ev.krakenDead': '{n} has slain the kraken!', 'ev.treasureDead': '{n} has looted the treasure!', 'ev.krakenGone': 'The kraken sinks back into the abyss…', 'ev.convoyGone': 'The convoy got away.',
  'ev.leaderSunk': '{n} sank the fleet leader, {v}!'
},
es: {
  intro: 'Rompe barriles y cofres, hunde los demás barcos y mejora tu nave, de los remos al motor. En el nivel 5, elige tu familia: rápida, abordaje o artillería. Los barcos pequeños desaparecen en la niebla.',
  name: 'Nombre', namePh: 'Grumete', hull: 'Casco', sails: 'Velas', flag: 'Bandera', preview: 'Vista previa del barco',
  aiNote: 'Los barcos marcados <b>IA</b> son bots que completan la partida cuando hay pocos jugadores.',
  controls: 'Ratón o joystick táctil para dirigir · <b>Espacio</b> o botón redondo para la habilidad · teclas <b>1 2 3</b> para elegir',
  join: 'Unirse a la partida', language: 'Idioma',
  guide: 'Guía', guideTitle: 'Árbol de barcos', guideHint: 'Pasa el ratón sobre un barco (o tócalo) para ver sus detalles.', back: 'Volver', start: 'Inicio', tierLvl: 'Nivel {l}', upgradesTitle: 'Mejoras ofrecidas en los demás niveles', weapon: 'Arma', skill: 'Habilidad', evolvesTo: 'Evoluciona a', finalShip: 'Barco final', colon: ': ', cd: 'recarga {s} s',
  'skd.boost': 'Velocidad ×1,7 durante 2,5 s', 'skd.smoke': 'Crea un banco de niebla durante 8 s', 'skd.repair': 'Recupera el 35 % de la vida', 'skd.salvo': 'Salva inmediata: +2 proyectiles, daño ×1,6',
  full: 'El servidor está lleno ahora mismo, inténtalo de nuevo en un momento.',
  connected: 'Conectado al servidor · modo {m}', modeTeam: 'tripulaciones (4 colores)', modeFfa: 'todos contra todos',
  unreachable: 'Servidor inaccesible, reintentando…', connecting: 'Conectando al servidor… (hasta un minuto si estaba en reposo)', connectingShort: 'Conectando al servidor…',
  lost: 'Se perdió la conexión con el servidor. Reintentando…',
  sunkTitle: '¡Hundido!', sunkBy: 'Enviado al fondo por <b>{n}</b>.', sunkStats: '{c} de nivel {l}, {s} barcos hundidos.', again: 'Volver al mar', edit: 'Personalizar mi barco',
  hp: 'PV', speed: 'Velocidad', targets: '{n} objetivos', explosion: 'explosión', side: 'disparo lateral', regen: 'autorreparación', hides: 'se esconde', ramS: 'espolón ×{n}', board: 'abordaje', armor: 'blindaje {n} %', second: 'Arma secundaria', 'fam.r': 'Familia rápida', 'fam.a': 'Familia abordaje', 'fam.c': 'Familia artillería',
  evoTitle: 'Nivel {l}: ¡evolución! Elige tu barco', bonusTitle: 'Nivel {l}: elige una mejora', key: 'tecla {n}', legendary: 'Legendario',
  convoy: 'Convoy', storm: 'Tormenta', escort: 'Escolta', ai: 'IA',
  crew: 'Tripulaciones', board: 'Clasificación', you: '(tú)', lvl: 'niv. {l}', lvlLong: 'Niv. {l}', sunkCount: 'Hundidos: {n}', flanks: '(flancos)',
  evoAt: 'Evolución en el nivel {l}', evoMax: 'Evolución máxima', hidden: 'Escondido en la niebla', tooBig: 'Demasiado grande para esconderse aquí',
  space: 'Espacio', hitBy: 'Alcanzado por {n}', protected: 'Protegido (atacar un barco termina la protección)', someone: 'Alguien', theKraken: 'el kraken',
  'fx.sunk': '¡Hundido! +{x} XP', 'fx.xp': '+{x} XP', 'fx.ram': '¡Embestida!', 'fx.heal': '+{x} PV', 'fx.evo': '¡{c}!', 'fx.skill': '{s}',
  'ev.kraken': '¡Un kraken ha surgido de las profundidades!', 'ev.storm': '¡Se acerca una tormenta!', 'ev.convoy': '¡Un convoy mercante escoltado cruza el mar!', 'ev.treasure': '¡Ha aparecido un tesoro gigante!',
  'ev.krakenDead': '¡{n} ha vencido al kraken!', 'ev.treasureDead': '¡{n} ha saqueado el tesoro!', 'ev.krakenGone': 'El kraken vuelve a hundirse en el abismo…', 'ev.convoyGone': 'El convoy ha escapado.',
  'ev.leaderSunk': '¡{n} ha hundido al jefe de la flota, {v}!'
}};

// Navires : [nom, description, arme]
const CLX = {
en: { barque: ['Rowboat', 'Small rowing boat. Your archers shoot arrows.', 'Bows'],
  drakkar: ['Longship', 'Long and swift, oars and a square sail. A rain of arrows.', 'Arrow volleys'], galere: ['Ram galley', 'Charge the enemy: bronze ram and crossbows.', 'Crossbows'], nef: ['Ballista nef', 'A ballista hurls a heavy bolt very far.', 'Ballista'],
  goelette: ['Schooner', 'A crew of musketeers, frantic fire rate.', 'Musketeers'], chebec: ['Corsair xebec', 'Fast, muskets and a light ram to finish the job.', 'Muskets'], brickab: ['Boarding brig', 'Grappling hooks and blunderbusses: stick to the enemy.', 'Blunderbusses'], caravelle: ['Armed caravel', 'Sturdy ram and muskets to harass.', 'Muskets'], fregate: ['Frigate', 'First cannons: turn your flank to the target.', 'Broadsides'], bombarde: ['Bomb ketch', 'Mortar that explodes over an area, swivel guns for close defence.', 'Mortar', 'Swivel guns'],
  clipper: ['Clipper', 'The fastest of the tall ships. Repeating rifles.', 'Repeating rifles'], aviso: ['Steam aviso', 'Small fast steamer: machine gun and ram.', 'Machine gun'], vapeurb: ['Armoured steamer', 'Paddle wheels, armoured hull and a Gatling gun.', 'Gatling'], galionab: ['Boarding galleon', 'Huge ram and small cannons to close in.', 'Small cannons'], vaisseau: ['Ship of the line', 'Broadsides of heavy cannons at long range.', 'Heavy cannons'], cuirasse: ['Steam ironclad', 'Heavy mortars, grapeshot for anyone who gets too close.', 'Heavy mortars', 'Grapeshot'],
  torpilleur: ['Torpedo boat', 'Engine and propeller: insane speed, devastating torpedoes.', 'Torpedoes'], destroyer: ['Destroyer', 'Fast and agile: twin machine guns and a steel bow.', 'Machine guns'], cuirasseep: ['Ram battleship', 'Thick armour, steel ram and close-range turrets.', 'Short turrets'], croiseur: ['Armoured cruiser', 'Ram and medium guns: charge, then finish at range.', 'Medium guns'], dreadnought: ['Dreadnought', 'Explosive shells at very long range on three targets.', 'Heavy turrets'], forteresse: ['Floating fortress', 'Three mortar turrets and machine guns against boarders.', 'Triple mortar', 'Machine guns'] },
es: { barque: ['Bote de remos', 'Pequeño bote de remos. Tus arqueros disparan flechas.', 'Arcos'],
  drakkar: ['Drakkar', 'Largo y ágil, remos y vela cuadrada. Lluvia de flechas.', 'Ráfagas de flechas'], galere: ['Galera de espolón', 'Embiste al enemigo: espolón de bronce y ballestas.', 'Ballestas'], nef: ['Nave balista', 'Una balista lanza un gran virote muy lejos.', 'Balista'],
  goelette: ['Goleta', 'Una tripulación de mosqueteros, cadencia frenética.', 'Mosqueteros'], chebec: ['Jabeque corsario', 'Rápido, mosquetes y un espolón ligero para rematar.', 'Mosquetes'], brickab: ['Bergantín de abordaje', 'Garfios y trabucos: pégate al enemigo.', 'Trabucos'], caravelle: ['Carabela armada', 'Espolón sólido y mosquetes para hostigar.', 'Mosquetes'], fregate: ['Fragata', 'Primeros cañones: presenta el flanco al objetivo.', 'Andanadas'], bombarde: ['Bombarda', 'Mortero que explota en área, pedreros para defenderse de cerca.', 'Mortero', 'Pedreros'],
  clipper: ['Clíper', 'El más rápido de los grandes veleros. Fusiles de repetición.', 'Fusiles de repetición'], aviso: ['Aviso de vapor', 'Pequeño vapor rápido: ametralladora y espolón.', 'Ametralladora'], vapeurb: ['Vapor blindado', 'Ruedas de paletas, casco blindado y ametralladora Gatling.', 'Gatling'], galionab: ['Galeón de abordaje', 'Enorme espolón y pequeños cañones para acercarse.', 'Cañones pequeños'], vaisseau: ['Navío de línea', 'Andanadas de cañones pesados a larga distancia.', 'Cañones pesados'], cuirasse: ['Acorazado a vapor', 'Morteros pesados, metralla para quien se acerque demasiado.', 'Morteros pesados', 'Metralla'],
  torpilleur: ['Lancha torpedera', 'Motor y hélice: velocidad loca, torpedos devastadores.', 'Torpedos'], destroyer: ['Destructor', 'Rápido y nervioso: ametralladoras gemelas y proa de acero.', 'Ametralladoras'], cuirasseep: ['Acorazado de espolón', 'Blindaje grueso, espolón de acero y torretas de corto alcance.', 'Torretas cortas'], croiseur: ['Crucero acorazado', 'Espolón y cañones medios: embiste y remata a distancia.', 'Cañones medios'], dreadnought: ['Dreadnought', 'Proyectiles explosivos a muy larga distancia sobre tres objetivos.', 'Torretas pesadas'], forteresse: ['Fortaleza flotante', 'Tres torretas de morteros y ametralladoras contra el abordaje.', 'Triple mortero', 'Ametralladoras'] }
};
// Bonus (même ordre que BON dans shared.js) : [nom, description]
const BONX = {
en: [['Light cannons', 'Fire rate +20%'], ['Heavy calibre', 'Damage +25%'], ['New sails', 'Speed +10%'], ['Spyglass', 'Range +15%'], ['Reinforced hull', '+30 max hit points'], ['Multi-shot', 'One more projectile per shot'], ['Carpenter', 'Repairs 2% of max HP per second'], ['Salvage nets', 'XP from wrecks and barrels +30%'], ['Ram bow', 'Ramming damage +50%'], ['Boatswain', 'Special skill ready 25% faster'], ['Grappling hooks', 'In contact with an enemy: +8 damage per second and steal XP'], ['Studded hull', 'Ramming and boarding damage taken −40%']],
es: [['Cañones ligeros', 'Cadencia de tiro +20 %'], ['Gran calibre', 'Daño +25 %'], ['Velas nuevas', 'Velocidad +10 %'], ['Catalejo', 'Alcance +15 %'], ['Casco reforzado', '+30 puntos de vida máx.'], ['Salva múltiple', 'Un proyectil más por disparo'], ['Carpintero', 'Repara un 2 % de la vida máx. por segundo'], ['Redes de rescate', 'XP de restos y barriles +30 %'], ['Espolón de proa', 'Daño de embestida +50 %'], ['Contramaestre', 'Habilidad especial lista un 25 % antes'], ['Garfios de abordaje', 'En contacto con un enemigo: +8 de daño por segundo y robo de XP'], ['Casco claveteado', 'Daño de embestida y abordaje recibido −40 %']]
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
  cls(k) { const S = root.S, c = S.CL[k], x = CLX[lang] && CLX[lang][k]; return x ? { n: x[0], d: x[1], w: x[2], w2: x[3] } : { n: c.n, d: c.d, w: c.w.nm, w2: c.w2 && c.w2.nm }; },
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
