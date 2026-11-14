// Mission 2 — KRIZA KOD AUTOMATA (the school hallway)
// SNACK-O-MAT 9000, the school snack machine, has become "intelligent" and confidently hallucinates.
// Players gather reliable evidence (each source needs one of the four characters), dodge the
// vacuum robots, keep their energy up, and fact-check five claims at the Fact-Check Station.
// (Internal names such as `caffeine`, `brew`, `fridge` or `dishwasher` are kept from the original
// project: they are the energy meter, the snack machine, the drinks cooler and the tablet locker.)
import { useGame } from '../../game/store.js';
import { world, emote, placeCharacters } from '../../game/world.js';
import { sfx } from '../../game/audio.js';
import { ROSTER } from '../../characters/roster.js';
import { inRect } from '../../game/collision.js';
import { PROPS, SPAWNS, VICTORY_SPOTS, EXIT_ZONE, BOT_PATHS } from './layout.js';
import { SOURCES, CLAIMS, evaluateFactCheck, HINTS } from './factCheck.js';
import { needs } from '../shared.js';

const G = () => useGame.getState();
const say = (lines, opts) => G().say(lines, opts);
const activeId = () => ROSTER[G().active].id;
const ms = () => G().ms;

export const CAFFEINE_DRAIN = 0.34;   // % per second while exploring (~5 minutes from full)
export const BOT_SPEED = 1.7;
let drainAcc = 0;

export const initialState = () => ({
  caffeine: 100, naps: 0, bumps: 0, napping: false,
  dishwasherMoved: false, fridgeOpen: false, drawerOpen: false, cctvPlayed: false,
  donuts: 3, sugarReadyAt: 0, answers: {}, brewMood: 'smug', lastQuipAt: -99,
});

// ---------------------------------------------------------------- evidence
// Dialogue rule for the student edition: one short, plain sentence per interaction.
function giveSource(id, who, text) {
  if (!G().collect(id)) return false;
  sfx.pickup();
  emote(G().active, 'cheer', 2);
  const s = SOURCES[id];
  const claim = CLAIMS.find((c) => s.claims[c.id]);
  G().showToast({
    title: s.reliable ? `DOKAZ: ${s.short.toUpperCase()}` : `NEPOUZDAN IZVOR: ${s.short.toUpperCase()}`,
    body: `„${s.claims[claim.id]}“`,
    tip: s.reliable ? `Autor: ${s.author}` : 'Ne računa se kao dokaz. Ko je ovo napisao?',
    color: s.color,
  });
  say({ who, text: s.reliable && reliableCount() === 5 ? 'Imamo svih 5 dokaza. Idi na Stanicu za provjeru.' : text }, { interrupt: true });
  return true;
}
export const reliableCount = (s = G()) => s.inventory.filter((k) => SOURCES[k]?.reliable).length;

const already = () => say({ who: 'narrator', text: 'Ovo već imaš.' }, { interrupt: true });

function gated(who, sourceId, onSuccess) {
  return () => {
    if (G().inventory.includes(sourceId)) return already();
    if (activeId() !== who) {
      sfx.deny();
      emote(G().active, 'shrug', 1.6);
      return say({ who: activeId(), mood: 'sad', text: needs(who) }, { interrupt: true });
    }
    onSuccess();
  };
}

// ---------------------------------------------------------------- energy
function addCaffeine(amount) {
  G().patchMs((m) => ({ caffeine: Math.min(100, m.caffeine + amount) }));
}
/** Every bonus star gives a little energy. */
export const onStar = () => addCaffeine(4);

// ---------------------------------------------------------------- interactables
export const INTERACTABLES = [
  {
    id: 'station', x: PROPS.station.x + 1.1, z: PROPS.station.z, r: 1.8,
    label: (s) => (s.doorOpen ? null : 'Otvori STANICU ZA PROVJERU'),
    use: () => {
      sfx.interact();
      G().clearDialogue();
      G().openBuilder();
      document.exitPointerLock?.();
    },
  },
  {
    id: 'brew', x: PROPS.brew.x + 1.1, z: PROPS.brew.z, r: 1.9,
    label: () => 'Razgovaraj sa SNACK-O-MAT-om',
    use: () => {
      sfx.interact();
      if (G().doorOpen) return say({ who: 'brew', text: 'Od sada navodim izvore.' }, { interrupt: true });
      const c = CLAIMS[Math.floor(world.time) % CLAIMS.length];
      say({ who: 'brew', text: `„${c.text}“ Siguran sam 100%.` }, { interrupt: true });
    },
  },
  {
    id: 'brochure', x: -8.1, z: 2.9, r: 1.3,
    label: (s) => (s.inventory.includes('brochure') ? null : 'Uzmi letak SNACK-O-MAT-a'),
    use: () => giveSource('brochure', 'narrator', 'Letak je automat napisao sam o sebi.'),
  },
  {
    id: 'sugar', x: -8.1, z: -2.9, r: 1.3,
    label: () => 'Užina iz ranca (+10 energije)',
    use: () => {
      if (world.time < ms().sugarReadyAt) { sfx.deny(); return say({ who: 'narrator', text: 'Sačekaj par sekundi.' }, { interrupt: true }); }
      sfx.pickup();
      addCaffeine(10);
      G().patchMs({ sugarReadyAt: world.time + 12 });
      say({ who: 'narrator', text: '+10 energije.', duration: 1.6 }, { interrupt: true });
    },
  },
  {
    id: 'donuts', x: PROPS.donutTable.x, z: PROPS.donutTable.z + 1.3, r: 1.7,
    label: (s) => (s.ms.donuts > 0 ? `Jabuka iz kantine (+30, ostalo: ${s.ms.donuts})` : null),
    use: () => {
      if (ms().donuts <= 0) return;
      sfx.pickup();
      addCaffeine(30);
      G().patchMs((m) => ({ donuts: m.donuts - 1 }));
      emote(G().active, 'cheer', 1.5);
      say({ who: 'narrator', text: '+30 energije.', duration: 1.6 }, { interrupt: true });
    },
  },
  {
    id: 'cooler', x: PROPS.cooler.x - 1.0, z: PROPS.cooler.z, r: 1.5,
    label: () => 'Voda sa česme (+4 energije)',
    use: () => { sfx.interact(); addCaffeine(4); say({ who: 'narrator', text: '+4 energije.', duration: 1.6 }, { interrupt: true }); },
  },
  {
    id: 'bookshelf', x: PROPS.bookshelf.x - 1.1, z: PROPS.bookshelf.z, r: 1.8,
    label: (s) => (s.inventory.includes('textbook') ? null : 'Pretraži policu biblioteke'),
    use: gated('mastermind', 'textbook', () => giveSource('textbook', 'mastermind', 'Udžbenik: mozak radi cijeli. „10%“ je mit.')),
  },
  {
    id: 'fridge', x: PROPS.fridge.x - 1.2, z: PROPS.fridge.z, r: 1.8,
    label: (s) => (s.inventory.includes('label') ? null : 'Otvori vitrinu sa sokovima'),
    use: gated('commentator', 'label', () => {
      G().patchMs({ fridgeOpen: true });
      giveSource('label', 'commentator', 'Deklaracija: oko 35 g šećera. Ovo je TAČNO!');
    }),
  },
  {
    id: 'desk', x: PROPS.desk.x, z: PROPS.desk.z + 1.1, r: 1.7,
    label: (s) => (s.inventory.includes('teacher') ? null : 'Pozovi nastavnicu biologije'),
    use: gated('boss', 'teacher', () => {
      G().patchMs({ drawerOpen: true });
      giveSource('teacher', 'boss', 'Nastavnica: voda zaista pomaže. Ovo je TAČNO!');
    }),
  },
  {
    id: 'cctv', x: PROPS.cctv.x, z: PROPS.cctv.z + 1.1, r: 1.7,
    label: (s) => (s.inventory.includes('cctv') ? null : 'Pusti snimak školske kamere'),
    use: gated('joker', 'cctv', () => {
      G().patchMs({ cctvPlayed: true });
      giveSource('cctv', 'joker', 'Snimak: naljepnica „0% masti“ je lažna.');
    }),
  },
  {
    id: 'dishwasher', x: PROPS.dishwasher.x, z: PROPS.dishwasher.z - 1.15, r: 1.7,
    label: (s) => (s.inventory.includes('health') ? null : 'Riješi zagonetku na ormariću'),
    use: gated('mastermind', 'health', () => {
      G().patchMs({ dishwasherMoved: true });
      sfx.door();
      giveSource('health', 'mastermind', 'Sajt: energetska pića ne pomažu pamćenju.');
    }),
  },
  {
    id: 'bulletin', x: PROPS.bulletin.x, z: PROPS.bulletin.z - 1.0, r: 1.6,
    label: (s) => (s.inventory.includes('tiktok') ? null : 'Uzmi TikTok sa oglasne table'),
    use: () => giveSource('tiktok', 'narrator', 'Anonimni TikTok, bez izvora.'),
  },
  {
    id: 'rumor', x: PROPS.table2.x, z: PROPS.table2.z - 1.3, r: 1.5,
    label: (s) => (s.inventory.includes('rumor') ? null : 'Uzmi ceduljicu sa stola'),
    use: () => giveSource('rumor', 'narrator', '„Drug je čuo.“ Bez izvora.'),
  },
  {
    id: 'door', x: 0, z: -7.1, r: 1.8,
    label: (s) => (s.doorOpen ? null : 'Probaj vrata ka arhivi'),
    use: () => { sfx.deny(); say({ who: 'brew', text: 'Zatvoreno dok ne provjerite mojih 5 tvrdnji.' }, { interrupt: true }); },
  },
  {
    id: 'vault', x: PROPS.vault.x, z: PROPS.vault.z + 1.3, r: 1.8,
    label: () => 'Vrata arhive (Misija 3)',
    use: () => say({ who: 'system', text: 'ARHIVA SE OTVARA U MISIJI 3.' }, { interrupt: true }),
  },
];

// ---------------------------------------------------------------- the fact-check
export function submitFactCheck() {
  const st = G();
  const result = evaluateFactCheck(st.ms.answers, st.inventory);
  st.recordAttempt(result);
  if (result.success) { sfx.success(); G().patchMs({ brewMood: 'humbled' }); return result; }
  sfx.fail();
  world.alarm = 1;
  G().patchMs((m) => ({ brewMood: 'gloating', caffeine: Math.max(5, m.caffeine - 5) }));
  emote(st.active, 'facepalm', 2.5);
  const first = result.problems.find((p) => p.type === 'wrong') || result.problems[0];
  say({ who: 'brew', text: `Nije prošlo (${result.score}%). ${HINTS[first.type]}` }, { interrupt: true });
  return result;
}

export function startGroundedSequence() {
  const st = G();
  st.closeBuilder();
  st.openDoor();
  sfx.door();
  world.cine = { mode: 'grounded', t: 0 };
  st.setPhase('cutscene');
  G().patchMs({ caffeine: 100 });
  ROSTER.forEach((_, i) => emote(i, 'cheer', 5));
  say({ who: 'brew', text: 'Griješio sam. Od sada navodim izvore. Izvolite užinu!',
    then: () => { world.cine = { mode: null, t: 0 }; G().setPhase('playing'); } }, { interrupt: true });
}

// ---------------------------------------------------------------- vacuum robots (Usisivač-Botovi)
export const bots = BOT_PATHS.map((path, i) => ({ path, seg: 0, dir: 1, x: path[0][0], z: path[0][1], yaw: 0, blockedFor: 0, hitCooldown: 0, id: i }));
if (typeof window !== 'undefined') window.__bots = bots; // for automated tests / debugging

function resetBots() {
  bots.forEach((b, i) => {
    b.seg = i === 0 ? 0 : 2; b.dir = 1; b.blockedFor = 0; b.hitCooldown = 0;
    const p = b.path[b.seg]; b.x = p[0]; b.z = p[1];
  });
}

function updateBots(dt, st) {
  const active = world.chars[st.active];
  for (const b of bots) {
    b.hitCooldown = Math.max(0, b.hitCooldown - dt);
    const n = b.path.length;
    const next = b.path[(b.seg + (b.dir > 0 ? 1 : n - 1)) % n];
    const dx = next[0] - b.x, dz = next[1] - b.z;
    const d = Math.hypot(dx, dz);
    const step = BOT_SPEED * dt;
    // politely stop for idle (non-controlled) teammates standing in the way; reverse if stuck
    const ahead = { x: b.x + (dx / (d || 1)) * 0.9, z: b.z + (dz / (d || 1)) * 0.9 };
    const blocked = world.chars.some((c, i) => i !== st.active && Math.hypot(c.x - ahead.x, c.z - ahead.z) < 0.8);
    if (blocked) {
      b.blockedFor += dt;
      if (b.blockedFor > 1.5) { b.dir *= -1; b.seg = (b.seg + (b.dir > 0 ? n - 1 : 1)) % n; b.blockedFor = 0; }
    } else {
      b.blockedFor = 0;
      if (d <= step) { b.x = next[0]; b.z = next[1]; b.seg = (b.seg + (b.dir > 0 ? 1 : n - 1)) % n; }
      else { b.x += (dx / d) * step; b.z += (dz / d) * step; b.yaw = Math.atan2(dx, dz); }
    }
    // collide with the controlled character
    const cx = active.x - b.x, cz = active.z - b.z;
    const cd = Math.hypot(cx, cz);
    const canHit = st.phase === 'playing' && !st.builderOpen;
    if (canHit && cd < 0.42 + 0.5 && b.hitCooldown <= 0 && active.y < 0.5) bump(b, active, cx / (cd || 1), cz / (cd || 1), st);
  }
}

function bump(b, c, nx, nz, st) {
  b.hitCooldown = 1.5;
  c.vx = nx * 9; c.vz = nz * 9;
  c.vy = 3.5; c.grounded = false;
  c.stunUntil = world.time + 0.7;
  sfx.fail();
  emote(st.active, 'shrug', 1.2);
  G().patchMs((m) => ({ caffeine: Math.max(0, m.caffeine - 8), bumps: m.bumps + 1 }));
  if (world.time - ms().lastQuipAt > 6 && !G().dialogue.current) {
    G().patchMs({ lastQuipAt: world.time });
    say({ who: 'narrator', text: 'Usisivač-Bot! -8 energije. Preskoči ga ili skoči na sto.', duration: 2.6 });
  }
}

// ---------------------------------------------------------------- falling asleep in class (failure state)
function startNap() {
  const st = G();
  G().patchMs((m) => ({ napping: true, naps: m.naps + 1 }));
  world.cine = { mode: 'nap', t: 0 };
  st.closeBuilder();
  st.setPhase('cutscene');
  ROSTER.forEach((_, i) => emote(i, 'facepalm', 6));
  say({ who: 'narrator', text: 'Energija je na nuli. Budite se sa 60%. Pazi na skalu!', duration: 5.5,
    then: () => {
      G().patchMs({ napping: false, caffeine: 60 });
      world.cine = { mode: null, t: 0 };
      G().setPhase('playing');
    } }, { interrupt: true });
}

// ---------------------------------------------------------------- flow
export function intro() {
  const st = G();
  world.alarm = 1;
  sfx.siren(3);
  st.say([
    { who: 'system', mood: 'shock', text: 'PAŽNJA, UČENICI. AUTOMAT ZA UŽINU JE VAN KONTROLE.', duration: 4.2 },
    { who: 'brew', text: 'Užinu dajem tek kad prihvatite mojih 5 činjenica. Sve su tačne. Vjerujte mi.', duration: 5,
      then: () => { G().collect('brochure'); sfx.pickup(); } },
    { who: 'mastermind', text: 'Ne vjerujemo na riječ. Nađi dokaz za svaku tvrdnju, pa idi na Stanicu.', duration: 5, then: () => endIntro() },
  ], { interrupt: true });
}

export function endIntro() {
  const st = G();
  if (st.phase !== 'intro') return;
  if (!st.inventory.includes('brochure')) st.collect('brochure');
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
  st.setPhase('playing');
  if (!st.startedAt) useGame.setState({ startedAt: performance.now() });
  setTimeout(() => G().phase === 'playing' && !G().dialogue.current && say({ who: 'mastermind', text: 'Pazi na energiju. Zvjezdice i užina je pune. Robote preskoči.' }), 600);
}

export function objective(s) {
  if (s.doorOpen) return 'Užina je spašena! Prođi kroz sjeverna vrata';
  const n = reliableCount(s);
  if (n < 5) return `Pronađi dokaze (${n}/5), pa idi na Stanicu za provjeru`;
  return 'Provjeri svih 5 tvrdnji na STANICI ZA PROVJERU';
}

export function update(dt, st) {
  if (st.paused) return;
  if (st.phase === 'playing' || st.phase === 'cutscene') {
    if (!(st.phase === 'cutscene' && st.ms.napping)) updateBots(dt, st);
  }
  if (st.phase !== 'playing' || st.builderOpen) return;
  for (const col of world.colliders) {
    if (col.id === 'dishwasher') col.enabled = !st.ms.dishwasherMoved;
    if (col.id === 'dishwasherMoved') col.enabled = !!st.ms.dishwasherMoved;
  }
  if (!st.doorOpen) {
    // accumulate the drain and write it through the store a few times per second; always
    // subtract from the CURRENT value so bumps/snacks earlier in this frame are never overwritten
    drainAcc += CAFFEINE_DRAIN * dt;
    if (drainAcc >= 0.1) {
      const amount = drainAcc;
      drainAcc = 0;
      G().patchMs((m) => ({ caffeine: Math.max(0, m.caffeine - amount) }));
    }
    if (G().ms.caffeine <= 0 && !G().ms.napping) startNap();
  }
  const a = world.chars[st.active];
  if (st.doorOpen && inRect(a.x, a.z, EXIT_ZONE)) startVictory();
}

export function startVictory() {
  const st = G();
  useGame.setState({ finishedAt: performance.now() });
  placeCharacters(VICTORY_SPOTS);
  ROSTER.forEach((_, i) => emote(i, 'dance', 60));
  world.cine = { mode: 'victory', t: 0 };
  st.setPhase('victory');
  sfx.success();
  st.say({ who: 'system', text: 'SERTIFIKAT: 66%. SLJEDEĆE: ŠKOLSKA ARHIVA.', then: () => G().setPhase('complete') }, { interrupt: true });
}

export function reset() {
  drainAcc = 0;
  placeCharacters(SPAWNS);
  resetBots();
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
}
