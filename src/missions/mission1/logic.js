// Mission 1 — THE IMPOSSIBLE PROMPT (the classroom): interactables, dialogue, objectives and win flow.
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
  role: { title: 'ROLE', color: '#f472b6', tip: 'Tell the AI WHO to be.' },
  task: { title: 'TASK', color: '#60a5fa', tip: 'Say exactly WHAT it should do.' },
  context: { title: 'CONTEXT', color: '#34d399', tip: 'Explain who you are and what your situation is.' },
  format: { title: 'FORMAT', color: '#fbbf24', tip: 'Say HOW the answer should look.' },
};

function collect(slot, who, text) {
  if (!G().collect(slot)) return;
  sfx.pickup();
  emote(G().active, 'cheer', 2);
  const info = COMPONENT_INFO[slot];
  const card = CARDS[slot].find((c) => c.good);
  G().showToast({ title: `FOUND: ${info.title}`, body: `"${card.text}"`, tip: info.tip, color: info.color });
  if (G().inventory.length === 4) {
    say({ who: 'ai', text: G().flags.terminalOn ? 'You have all 4 parts. Go to the front desk.' : 'You have all 4 parts. Claude (4) has to wake me up at the front desk.' }, { interrupt: true });
  } else {
    say({ who, text }, { interrupt: true });
  }
}

function wrongChar(charId) {
  sfx.deny();
  emote(G().active, 'shrug', 1.6);
  say({ who: activeId(), mood: 'sad', text: needs(charId) }, { interrupt: true });
}

const nothingHere = () => say({ who: 'narrator', text: 'Nothing more here.' }, { interrupt: true });

// ---------------------------------------------------------------- desks / computers
// One per desk in layout.js: the first four belong to the characters, the fifth is neutral.
const COMPUTERS = [
  'Sticky note: "The AI cannot read your mind. Be specific."',
  'Message: "Vague prompt = vague answer."',
  'Note: "Give the AI a ROLE."',
  'Note: "Say which FORMAT you want the answer in."',
  'The online gradebook is locked.',
];
const deskName = (i) => (ROSTER[i] ? ROSTER[i].name : 'class monitor');

// ---------------------------------------------------------------- the terminal / puzzle
function activateLectern() {
  const st = G();
  if (!st.flags.terminalOn) {
    if (activeId() !== 'commentator') return wrongChar('commentator');
    sfx.success();
    st.setFlag('terminalOn');
    emote(G().active, 'cheer', 2.5);
    say({ who: 'ai', text: 'PROMPTOTRON is awake. Build a prompt from the 4 parts.' }, { interrupt: true });
    return;
  }
  if (st.doorOpen) return say({ who: 'ai', text: 'The door is open. Go.' }, { interrupt: true });
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
  say({ who: 'ai', text: `Rejected (${result.score}%). ${HINTS[firstBad]}` }, { interrupt: true });
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
  say({ who: 'ai', text: 'Prompt accepted. The door is unlocked!',
    then: () => { world.cine = { mode: null, t: 0 }; G().setPhase('playing'); } }, { interrupt: true });
}

// ---------------------------------------------------------------- interactables
export const INTERACTABLES = [
  {
    id: 'whiteboard', x: PROPS.whiteboard.x, z: 7.9, r: 2.0,
    label: (s) => (s.inventory.includes('role') ? 'Look at the whiteboard' : 'Solve the riddle on the whiteboard'),
    use: () => {
      if (G().inventory.includes('role')) return nothingHere();
      if (activeId() !== 'mastermind') return wrongChar('mastermind');
      collect('role', 'mastermind', 'Solved. The answer is: ROLE.');
    },
  },
  {
    id: 'printer', x: PROPS.printer.x - 1.2, z: PROPS.printer.z, r: 1.9,
    label: (s) => (s.inventory.includes('task') ? 'Look at the printer' : 'Fix the jammed printer'),
    use: () => {
      if (G().inventory.includes('task')) return nothingHere();
      if (activeId() !== 'joker') return wrongChar('joker');
      collect('task', 'joker', 'The printer works. It printed the TASK.');
    },
  },
  {
    id: 'vending', x: PROPS.vending.x - 1.3, z: PROPS.vending.z, r: 1.9,
    label: (s) => (s.inventory.includes('format') ? 'Look at the vending machine' : 'Negotiate with the vending machine'),
    use: () => {
      if (G().inventory.includes('format')) return nothingHere();
      if (activeId() !== 'boss') return wrongChar('boss');
      collect('format', 'boss', 'Deal. The machine hands over the FORMAT.');
    },
  },
  {
    id: 'cabinet', x: PROPS.cabinet.x - 1.2, z: PROPS.cabinet.z, r: 1.8,
    label: (s) => (s.inventory.includes('context') ? 'Look at the cabinet' : 'Open the cabinet (the code is in the photo)'),
    use: () => {
      if (G().inventory.includes('context')) return nothingHere();
      if (activeId() !== 'joker') return wrongChar('joker');
      collect('context', 'joker', 'The code from the photo: 204. The CONTEXT is inside.');
    },
  },
  {
    id: 'lectern', x: PROPS.lectern.x + 1.1, z: PROPS.lectern.z, r: 1.9,
    label: (s) => (!s.flags.terminalOn ? 'Wake PROMPTOTRON (microphone)' : s.doorOpen ? 'PROMPTOTRON' : 'Open the PROMPT BUILDER'),
    use: activateLectern,
  },
  {
    id: 'door', x: 0, z: -8.1, r: 1.8,
    label: (s) => (s.doorOpen ? null : 'Try the door'),
    use: () => { sfx.deny(); say({ who: 'ai', text: 'Locked. Only a good prompt opens this door.' }, { interrupt: true }); },
  },
  {
    id: 'screen', x: -10.4, z: 2.9, r: 1.4,
    label: () => 'Read the smart board',
    use: () => { sfx.interact(); say({ who: 'narrator', text: 'A good prompt = ROLE + TASK + CONTEXT + FORMAT.' }, { interrupt: true }); },
  },
  ...DESKS.map((d, i) => ({
    id: `pc${i}`, x: d.x + 1.05, z: d.z, r: 1.3,
    label: () => `Look at the computer (${deskName(i)})`,
    use: () => { sfx.interact(); say({ who: 'narrator', text: COMPUTERS[i] }, { interrupt: true }); },
  })),
  {
    id: 'exitDoor', x: PROPS.exitDoor.x, z: PROPS.exitDoor.z + 1.2, r: 1.8,
    label: () => 'Mission 2 door (locked)',
    use: () => say({ who: 'ai', text: 'Mission 2. It unlocks when you finish this one.' }, { interrupt: true }),
  },
];

// ---------------------------------------------------------------- flow
export function intro() {
  const st = G();
  world.alarm = 1;
  sfx.siren(4);
  st.say([
    { who: 'system', mood: 'shock', text: 'ATTENTION, STUDENTS. YOUR AI CERTIFICATE HAS BEEN LOCKED.', duration: 4.2 },
    { who: 'ai', text: 'Only a good prompt opens the door. Find the 4 parts: Role, Task, Context, Format.', duration: 5.5, then: () => endIntro() },
  ], { interrupt: true });
}

export function endIntro() {
  const st = G();
  if (st.phase !== 'intro') return;
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
  st.setPhase('playing');
  if (!st.startedAt) useGame.setState({ startedAt: performance.now() });
  setTimeout(() => G().phase === 'playing' && !G().dialogue.current && say({ who: 'ai', text: 'Characters: keys 1–4. Interact: E. Jump: Space (twice for a double jump).' }), 600);
}

export function objective(s) {
  if (s.doorOpen) return 'Leave through the open door!';
  const n = s.inventory.length;
  if (n < 4) return `Find the 4 prompt parts (${n}/4) — each needs the right character`;
  if (!s.flags.terminalOn) return 'Wake PROMPTOTRON at the front desk (needs Claude)';
  return 'Build and TEST your prompt at the front desk';
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
  st.say({ who: 'system', text: 'CERTIFICATE: 33%. NEXT: THE SNACK MACHINE.', then: () => G().setPhase('complete') }, { interrupt: true });
}

export function reset() {
  placeCharacters(SPAWNS);
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
}
