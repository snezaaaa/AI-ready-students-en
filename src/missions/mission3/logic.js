// Mission 3 — THE FINAL CERTIFICATE
// The school archive, guarded by THE ARCHIVIST and its 4,000-slide presentation.
//  1. Hall of Seals: four responsible-AI dilemmas for students, each opened by one character (3 strikes = lockdown).
//  2. Sensor corridor: blinking gates + low sweeping beams to jump over.
//  3. Archive core: Claude powers the console; write the FINAL PROMPT (RTCF + guardrails).
import { useGame } from '../../game/store.js';
import { world, emote, placeCharacters } from '../../game/world.js';
import { sfx } from '../../game/audio.js';
import { ROSTER } from '../../characters/roster.js';
import { SEALS, sealById, answerSeal, STRIKES_FOR_LOCKDOWN } from './dilemmas.js';
import { evaluateFinalPrompt, hasAllSeals, HINTS } from './finalPrompt.js';
import { LASERS, laserState, laserHits, checkpointFor, CORRIDOR, dangerZone } from './lasers.js';
import { needs } from '../shared.js';
import { SEAL_POS, PROPS, SPAWNS, CORE_SPOTS, VICTORY_SPOTS, CORE_ENTRY_Z } from './layout.js';

const G = () => useGame.getState();
const say = (lines, opts) => G().say(lines, opts);
const activeId = () => ROSTER[G().active].id;
const ms = () => G().ms;

export const initialState = () => ({
  modal: null, seal: null, wrongPicks: {}, lastAnswer: null,
  strikes: 0, lockdowns: 0, lockdown: false,
  zaps: 0, furthestZ: 1, lastZapAt: -99, corridorHint: false,
  teamInCore: false, consoleOn: false,
});

// ---------------------------------------------------------------- seals
// Dialogue rule for the student edition: one short, plain sentence per interaction.
const SEAL_WIN = {
  privacy: { who: 'boss', text: 'We do not share personal data. Ours or anyone else\'s.' },
  integrity: { who: 'mastermind', text: 'AI helps, but the work is yours.' },
  bias: { who: 'joker', text: 'We spot stereotypes and fix them.' },
  oversight: { who: 'commentator', text: 'Whoever hands it in is responsible. So check it.' },
};

function openModal(modal, extra = {}) {
  G().patchMs({ modal, lastAnswer: null, ...extra });
  G().clearDialogue();
  G().openBuilder();
  document.exitPointerLock?.();
}
export function closeModal() {
  G().closeBuilder();
  G().patchMs({ modal: null, lastAnswer: null });
}

function sealInteractable(seal) {
  const p = SEAL_POS[seal.id];
  return {
    id: `seal_${seal.id}`, x: p.x + (p.x < 0 ? 1.4 : -1.4), z: p.z, r: 1.8,
    label: (s) => (s.inventory.includes(seal.id) ? `${seal.label} seal secured` : `Unlock the ${seal.label} seal`),
    use: () => {
      if (G().inventory.includes(seal.id)) return say({ who: 'narrator', text: 'This seal is already secured.' }, { interrupt: true });
      if (activeId() !== seal.who) {
        sfx.deny();
        emote(G().active, 'shrug', 1.6);
        return say({ who: activeId(), mood: 'sad', text: needs(seal.who) }, { interrupt: true });
      }
      sfx.interact();
      openModal('seal', { seal: seal.id });
    },
  };
}

/** Called by the seal dilemma UI. Returns the answerSeal() result. */
export function chooseSealOption(sealId, optionId) {
  const r = answerSeal(sealId, optionId);
  const seal = sealById(sealId);
  G().patchMs({ lastAnswer: { optionId, ...r } });
  if (r.correct) {
    G().collect(sealId);
    sfx.pickup();
    emote(G().active, 'cheer', 2.5);
    G().showToast({ title: `SEAL SECURED: ${seal.label}`, body: `Rule unlocked: "${seal.clause}"`, tip: r.why, color: seal.color });
    const all = SEALS.every((s) => G().inventory.includes(s.id));
    say(all ? { who: 'admin', text: 'All 4 seals. The barrier is down: next is the sensor corridor.' } : SEAL_WIN[sealId], { interrupt: true });
    return r;
  }
  // wrong answer: strike
  sfx.fail();
  world.alarm = 1;
  emote(G().active, 'facepalm', 2);
  const strikes = ms().strikes + 1;
  G().patchMs((m) => ({ strikes, wrongPicks: { ...m.wrongPicks, [sealId]: [...(m.wrongPicks[sealId] || []), optionId] } }));
  say({ who: 'admin', text: `Strike ${strikes}/${STRIKES_FOR_LOCKDOWN}. Read the explanation.` }, { interrupt: true });
  if (strikes >= STRIKES_FOR_LOCKDOWN) setTimeout(startLockdown, 1800);
  return r;
}

// ---------------------------------------------------------------- lockdown (failure state)
function startLockdown() {
  if (ms().lockdown) return;
  closeModal();
  G().patchMs((m) => ({ lockdown: true, lockdowns: m.lockdowns + 1 }));
  world.cine = { mode: 'lockdown', t: 0 };
  G().setPhase('cutscene');
  sfx.siren(3);
  ROSTER.forEach((_, i) => emote(i, 'facepalm', 9));
  say([
    { who: 'system', text: 'THREE STRIKES. HERE COME 4,000 SLIDES.', duration: 3.4 },
    { who: 'narrator', text: 'Done. The strikes are cleared. Read more carefully.', duration: 3.4,
      then: () => {
        G().patchMs({ lockdown: false, strikes: 0 });
        world.cine = { mode: null, t: 0 };
        G().setPhase('playing');
      } },
  ], { interrupt: true });
}

// ---------------------------------------------------------------- lasers
export const EXEMPTION_AFTER = 4;   // zaps before the skip option appears (nobody gets stuck)
export const laserStates = LASERS.map((l) => laserState(l, 0));
if (typeof window !== 'undefined') { // for automated tests / debugging
  window.__lasers = laserStates;
  window.__laserDefs = LASERS.map((l) => ({ ...l, zone: dangerZone(l) }));
}

function updateLasers(st) {
  LASERS.forEach((l, i) => { laserStates[i] = laserState(l, world.time); });
  if (st.phase !== 'playing' || st.builderOpen) return;
  const c = world.chars[st.active];
  const inCorridor = c.z < CORRIDOR.maxZ && c.z > CORRIDOR.minZ;
  if (!inCorridor) return;
  if (c.z < ms().furthestZ - 0.2) G().patchMs({ furthestZ: c.z });
  if (!ms().corridorHint) {
    G().patchMs({ corridorHint: true });
    say({ who: 'admin', text: 'WAIT: stop until the gate goes dark. JUMP: press SPACE.' }, { interrupt: true });
  }
  if (world.time - ms().lastZapAt < 0.8) return;
  const hitIdx = LASERS.findIndex((l, i) => laserHits(l, laserStates[i], c));
  if (hitIdx < 0) return;
  zap(c, st);
}

function zap(c, st) {
  const cp = checkpointFor(ms().furthestZ);
  Object.assign(c, { x: 0, z: cp, vx: 0, vz: 0, vy: 0, y: 0, grounded: true, stunUntil: world.time + 0.5 });
  world.cam.yaw = 0;
  world.alarm = 0.7;
  sfx.fail();
  emote(st.active, 'shrug', 1.2);
  const zaps = ms().zaps + 1;
  G().patchMs({ zaps, lastZapAt: world.time });
  if (zaps === EXEMPTION_AFTER) say({ who: 'admin', text: 'Four tries. Press E here if you want to skip the corridor.' }, { interrupt: true });
  else if (!G().dialogue.current) say({ who: 'admin', text: 'Sensor! Back to the checkpoint.', duration: 2.2 });
}

// ---------------------------------------------------------------- final prompt
export function testFinalPrompt() {
  const st = G();
  const result = evaluateFinalPrompt(st.selection, st.inventory);
  st.recordAttempt(result);
  if (result.success) { sfx.success(); return result; }
  sfx.fail();
  world.alarm = 1;
  emote(st.active, 'facepalm', 2);
  const first = result.wrong.includes('guardrails') ? 'guardrails' : result.wrong[0] || result.missing[0];
  say({ who: 'admin', text: `Rejected (${result.score}%). ${HINTS[first]}` }, { interrupt: true });
  return result;
}

export function startVaultSequence() {
  const st = G();
  closeModal();
  st.openDoor();
  sfx.door();
  world.cine = { mode: 'vault', t: 0 };
  st.setPhase('cutscene');
  ROSTER.forEach((_, i) => emote(i, 'cheer', 8));
  say({ who: 'admin', text: 'This is a good, responsible prompt. Opening the archive!', then: startVictory }, { interrupt: true });
}

export function startVictory() {
  const st = G();
  useGame.setState({ finishedAt: performance.now() });
  placeCharacters(VICTORY_SPOTS);
  ROSTER.forEach((_, i) => emote(i, 'dance', 90));
  world.cine = { mode: 'victory', t: 0 };
  st.setPhase('victory');
  sfx.success();
  setTimeout(() => sfx.success(), 1600);
  st.say({ who: 'system', text: 'CERTIFICATE: 100%. CONGRATULATIONS!', then: () => G().setPhase('complete') }, { interrupt: true });
}

// ---------------------------------------------------------------- interactables
export const INTERACTABLES = [
  ...SEALS.map(sealInteractable),
  {
    id: 'exemption', x: 0, z: -0.9, r: 1.3,
    label: (s) => (s.ms.zaps >= EXEMPTION_AFTER && !s.ms.teamInCore ? 'Skip the sensor corridor' : null),
    use: () => {
      sfx.success();
      const c = world.chars[G().active];
      Object.assign(c, { x: 0, z: CORE_ENTRY_Z - 0.6, vx: 0, vz: 0, y: 0, vy: 0, grounded: true });
      say({ who: 'admin', text: 'Corridor skipped.' }, { interrupt: true });
    },
  },
  {
    id: 'barrier', x: 0, z: 1.3, r: 1.8,
    label: (s) => (hasAllSeals(s.inventory) ? null : 'Touch the barrier'),
    use: () => {
      sfx.deny();
      const n = SEALS.filter((s) => G().inventory.includes(s.id)).length;
      say({ who: 'admin', text: `Barrier. Secure the seals first: ${n}/4.` }, { interrupt: true });
    },
  },
  {
    id: 'console', x: PROPS.console.x, z: PROPS.console.z + 1.2, r: 1.8,
    label: (s) => (s.doorOpen ? null : !s.ms.consoleOn ? 'Power up the FINAL PROMPT console' : 'Write the FINAL PROMPT'),
    use: () => {
      if (!ms().consoleOn) {
        if (activeId() !== 'commentator') {
          sfx.deny();
          return say({ who: activeId(), mood: 'sad', text: needs('commentator') }, { interrupt: true });
        }
        sfx.success();
        emote(G().active, 'cheer', 2.5);
        G().patchMs({ consoleOn: true });
        return say({ who: 'admin', text: 'The console is on. Make a poster with AI rules for the class.' }, { interrupt: true });
      }
      sfx.interact();
      openModal('final');
    },
  },
  {
    id: 'vault', x: PROPS.vault.x, z: PROPS.vault.z + 1.6, r: 1.8,
    label: (s) => (s.doorOpen ? null : 'Look at the archive door'),
    use: () => { sfx.deny(); say({ who: 'admin', text: 'Only a good final prompt opens the archive.' }, { interrupt: true }); },
  },
];

// ---------------------------------------------------------------- flow
export function intro() {
  const st = G();
  world.alarm = 1;
  sfx.siren(3);
  st.say([
    { who: 'system', mood: 'shock', text: 'ATTENTION, STUDENTS. THE FINAL CERTIFICATE NEEDS... ONE LAST PROMPT.', duration: 4.2 },
    { who: 'admin', text: 'The certificate is behind 4 seals, a sensor corridor and one prompt. Three strikes = 4,000 slides.', duration: 6, then: () => endIntro() },
  ], { interrupt: true });
}

export function endIntro() {
  const st = G();
  if (st.phase !== 'intro') return;
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
  st.setPhase('playing');
  if (!st.startedAt) useGame.setState({ startedAt: performance.now() });
  setTimeout(() => G().phase === 'playing' && !G().dialogue.current && say({
    who: 'admin', text: 'Each seal needs a different character (1–4). The numbers are at the top left.',
  }), 600);
}

export function objective(s) {
  if (s.doorOpen) return 'Collect your certificate!';
  const n = SEALS.filter((x) => s.inventory.includes(x.id)).length;
  if (n < SEALS.length) return `Secure the 4 seals of responsible AI use (${n}/4)`;
  if (!s.ms.teamInCore) return 'Cross the sensor corridor: stop at the WAIT line until the gate goes dark, press SPACE just before the red JUMP zone';
  if (!s.ms.consoleOn) return 'Power up the Final Prompt console (needs Claude)';
  return 'Write the FINAL PROMPT at the console';
}

export function update(dt, st) {
  if (st.paused) return;
  for (const col of world.colliders) if (col.id === 'sealgate') col.enabled = !hasAllSeals(st.inventory);
  updateLasers(st);
  if (st.phase !== 'playing') return;
  const c = world.chars[st.active];
  if (!st.ms.teamInCore && c.z < CORE_ENTRY_Z) {
    // the rest of the team sprints through the corridor behind you
    let k = 0;
    world.chars.forEach((o, i) => {
      if (i === st.active) return;
      const [x, z] = CORE_SPOTS[k++];
      Object.assign(o, { x, z, vx: 0, vz: 0 });
    });
    G().patchMs({ teamInCore: true });
    sfx.pickup();
    say({ who: 'admin', text: 'You made it. Claude (4) powers up the console.' }, { interrupt: true });
  }
}

export function reset() {
  placeCharacters(SPAWNS);
  world.cine = { mode: null, t: 0 };
  world.alarm = 0;
}
