// Mission 1 — NEMOGUĆI PROMPT (the classroom): interactables, dialogue, objectives and win flow.
// Dialogue rule for the student edition: one short, plain sentence per interaction. No filler.
import { useGame } from '../../game/store.js';
import { world, emote, placeCharacters } from '../../game/world.js';
import { sfx } from '../../game/audio.js';
import { ROSTER } from '../../characters/roster.js';
import { PROPS, DESKS, EXIT_ZONE, VICTORY_SPOTS, SPAWNS } from './layout.js';
import { inRect } from '../../game/collision.js';
import { evaluatePrompt, HINTS, CARDS } from './promptPuzzle.js';
import { needs } from '../shared.js';

const G = () => useGame.getState();
const say = (lines, opts) => G().say(lines, opts);
const activeId = () => ROSTER[G().active].id;

// ---------------------------------------------------------------- component pickups
const COMPONENT_INFO = {
  role: { title: 'ULOGA', color: '#f472b6', tip: 'Reci AI-ju KO treba da bude.' },
  task: { title: 'ZADATAK', color: '#60a5fa', tip: 'Reci tačno ŠTA da uradi.' },
  context: { title: 'KONTEKST', color: '#34d399', tip: 'Objasni ko si i kakva je situacija.' },
  format: { title: 'FORMAT', color: '#fbbf24', tip: 'Reci KAKO odgovor treba da izgleda.' },
};

function collect(slot, who, text) {
  if (!G().collect(slot)) return;
  sfx.pickup();
  emote(G().active, 'cheer', 2);
  const info = COMPONENT_INFO[slot];
  const card = CARDS[slot].find((c) => c.good);
  G().showToast({ title: `PRONAĐENO: ${info.title}`, body: `„${card.text}“`, tip: info.tip, color: info.color });
  if (G().inventory.length === 4) {
    say({ who: 'ai', text: G().flags.terminalOn ? 'Imaš sva 4 dijela. Idi na katedru.' : 'Imaš sva 4 dijela. Claude (4) treba da me probudi na katedri.' }, { interrupt: true });
  } else {
    say({ who, text }, { interrupt: true });
  }
}

function wrongChar(charId) {
  sfx.deny();
  emote(G().active, 'shrug', 1.6);
  say({ who: activeId(), mood: 'sad', text: needs(charId) }, { interrupt: true });
}

const nothingHere = () => say({ who: 'narrator', text: 'Ovdje više nema ničega.' }, { interrupt: true });

// ---------------------------------------------------------------- desks / computers
// One per desk in layout.js: the first four belong to the characters, the fifth is neutral.
const COMPUTERS = [
  'Papirić: „AI ne čita misli. Budi konkretan.“',
  'Poruka: „Nejasan prompt = nejasan odgovor.“',
  'Bilješka: „Daj AI-ju ULOGU.“',
  'Bilješka: „Reci u kom FORMATU želiš odgovor.“',
  'e-Dnevnik je zaključan.',
];
const deskName = (i) => (ROSTER[i] ? ROSTER[i].name : 'dežurni');

// ---------------------------------------------------------------- the terminal / puzzle
function activateLectern() {
  const st = G();
  if (!st.flags.terminalOn) {
    if (activeId() !== 'commentator') return wrongChar('commentator');
    sfx.success();
    st.setFlag('terminalOn');
    emote(G().active, 'cheer', 2.5);
    say({ who: 'ai', text: 'PROMPTOTRON je budan. Složi prompt od 4 dijela.' }, { interrupt: true });
    return;
  }
  if (st.doorOpen) return say({ who: 'ai', text: 'Vrata su otvorena. Izađi.' }, { interrupt: true });
  sfx.interact();
  st.clearDialogue();
  st.openBuilder();
  document.exitPointerLock?.();
}

export function testPrompt() {
  const st = G();
  const result = evaluatePrompt(st.selection, st.inventory);
  st.recordAttempt(result);
  if (result.success) {
    sfx.success();
    return result;
  }
  sfx.fail();
  world.alarm = 1;
  emote(st.active, 'facepalm', 2.5);
  const firstBad = result.wrong[0] || result.missing[0];
  say({ who: 'ai', text: `Odbijeno (${result.score}%). ${HINTS[firstBad]}` }, { interrupt: true });
  return result;
}

/** Called by the prompt builder after the success output has been shown. */
export function startDoorSequence() {
  const st = G();
  st.closeBuilder();
  st.openDoor();
  sfx.door();
  world.cine = { mode: 'door', t: 0 };
  st.setPhase('cutscene');
  ROSTER.forEach((_, i) => emote(i, 'cheer', 4));
  say({ who: 'ai', text: 'Prompt prihvaćen. Vrata su otključana!',
    then: () => { world.cine = { mode: null, t: 0 }; G().setPhase('playing'); } }, { interrupt: true });
}

// ---------------------------------------------------------------- interactables
export const INTERACTABLES = [
  {
    id: 'whiteboard', x: PROPS.whiteboard.x, z: 7.9, r: 2.0,
    label: (s) => (s.inventory.includes('role') ? 'Pogledaj tablu' : 'Riješi zagonetku na tabli'),
    use: () => {
      if (G().inventory.includes('role')) return nothingHere();
      if (activeId() !== 'mastermind') return wrongChar('mastermind');
      collect('role', 'mastermind', 'Riješeno. Odgovor je: ULOGA.');
    },
  },
  {
    id: 'printer', x: PROPS.printer.x - 1.2, z: PROPS.printer.z, r: 1.9,
    label: (s) => (s.inventory.includes('task') ? 'Pogledaj štampač' : 'Popravi zaglavljeni štampač'),
    use: () => {
      if (G().inventory.includes('task')) return nothingHere();
      if (activeId() !== 'joker') return wrongChar('joker');
      collect('task', 'joker', 'Štampač radi. Izašao je ZADATAK.');
    },
  },
  {
    id: 'vending', x: PROPS.vending.x - 1.3, z: PROPS.vending.z, r: 1.9,
    label: (s) => (s.inventory.includes('format') ? 'Pogledaj automat' : 'Pregovaraj sa automatom'),
    use: () => {
      if (G().inventory.includes('format')) return nothingHere();
      if (activeId() !== 'boss') return wrongChar('boss');
      collect('format', 'boss', 'Dogovoreno. Automat daje FORMAT.');
    },
  },
  {
    id: 'cabinet', x: PROPS.cabinet.x - 1.2, z: PROPS.cabinet.z, r: 1.8,
    label: (s) => (s.inventory.includes('context') ? 'Pogledaj ormar' : 'Otvori ormar (šifra je na slici)'),
    use: () => {
      if (G().inventory.includes('context')) return nothingHere();
      if (activeId() !== 'joker') return wrongChar('joker');
      collect('context', 'joker', 'Šifra sa slike: 204. Unutra je KONTEKST.');
    },
  },
  {
    id: 'lectern', x: PROPS.lectern.x + 1.1, z: PROPS.lectern.z, r: 1.9,
    label: (s) => (!s.flags.terminalOn ? 'Probudi PROMPTOTRONA (mikrofon)' : s.doorOpen ? 'PROMPTOTRON' : 'Otvori GRADITELJ PROMPTA'),
    use: activateLectern,
  },
  {
    id: 'door', x: 0, z: -8.1, r: 1.8,
    label: (s) => (s.doorOpen ? null : 'Probaj vrata'),
    use: () => { sfx.deny(); say({ who: 'ai', text: 'Zaključano. Vrata otvara samo dobar prompt.' }, { interrupt: true }); },
  },
  {
    id: 'screen', x: -10.4, z: 2.9, r: 1.4,
    label: () => 'Pročitaj pametnu tablu',
    use: () => { sfx.interact(); say({ who: 'narrator', text: 'Dobar prompt = ULOGA + ZADATAK + KONTEKST + FORMAT.' }, { interrupt: true }); },
  },
  ...DESKS.map((d, i) => ({
    id: `pc${i}`, x: d.x + 1.05, z: d.z, r: 1.3,
    label: () => `Pogledaj računar (${deskName(i)})`,
    use: () => { sfx.interact(); say({ who: 'narrator', text: COMPUTERS[i] }, { interrupt: true }); },
  })),
  {
    id: 'exitDoor', x: PROPS.exitDoor.x, z: PROPS.exitDoor.z + 1.2, r: 1.8,
    label: () => 'Vrata Misije 2 (zaključano)',
    use: () => say({ who: 'ai', text: 'Misija 2. Otključava se kad završiš ovu.' }, { interrupt: true }),
  },
];

// ---------------------------------------------------------------- flow
export function intro() {
  const st = G();
  world.alarm = 1;
  sfx.siren(4);
  st.say([
    { who: 'system', mood: 'shock', text: 'PAŽNJA, UČENICI. VAŠ AI SERTIFIKAT JE ZAKLJUČAN.', duration: 4.2 },
    { who: 'ai', text: 'Vrata otvara samo dobar prompt. Nađi 4 dijela: Uloga, Zadatak, Kontekst, Format.', duration: 5.5, then: () => endIntro() },
  ], { interrupt: true });
}

export function endIntro() {
  const st = G();
  if (st.phase !== 'intro') return;
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
  st.setPhase('playing');
  if (!st.startedAt) useGame.setState({ startedAt: performance.now() });
  setTimeout(() => G().phase === 'playing' && !G().dialogue.current && say({ who: 'ai', text: 'Likovi: tasteri 1–4. Akcija: E. Skok: Space (dvaput za dupli skok).' }), 600);
}

export function objective(s) {
  if (s.doorOpen) return 'Izađi kroz otvorena vrata!';
  const n = s.inventory.length;
  if (n < 4) return `Pronađi 4 dijela prompta (${n}/4) — za svaki treba pravi lik`;
  if (!s.flags.terminalOn) return 'Probudi PROMPTOTRONA na katedri (treba Claude)';
  return 'Složi i TESTIRAJ prompt na katedri';
}

/** Per-frame mission update (zone triggers). */
export function update() {
  const s = G();
  if (s.phase !== 'playing' || !s.doorOpen) return;
  const c = world.chars[s.active];
  if (inRect(c.x, c.z, EXIT_ZONE)) startVictory();
}

export function startVictory() {
  const st = G();
  useGame.setState({ finishedAt: performance.now() });
  placeCharacters(VICTORY_SPOTS);
  ROSTER.forEach((_, i) => emote(i, 'dance', 60));
  world.cine = { mode: 'victory', t: 0 };
  st.setPhase('victory');
  sfx.success();
  st.say({ who: 'system', text: 'SERTIFIKAT: 33%. SLJEDEĆE: AUTOMAT ZA UŽINU.', then: () => G().setPhase('complete') }, { interrupt: true });
}

export function reset() {
  placeCharacters(SPAWNS);
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
}
