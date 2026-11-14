// Mission 3 — THE FINAL CERTIFICATE, the school archive (see registry.js for the mission interface)
import VaultHall from './VaultHall.jsx';
import * as m3 from './logic.js';
import { VaultPuzzle, StrikesHud, LockdownOverlay, Finale } from './ui.jsx';
import { SEALS } from './dilemmas.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

export default {
  id: 'mission3', number: 3, title: 'The Final Certificate', status: 'available',
  tagline: 'The school archive: 4 dilemmas about responsible AI use, a sensor corridor and the final prompt.',
  announcement: 'ATTENTION, STUDENTS. THE FINAL CERTIFICATE NEEDS... ONE LAST PROMPT.',
  certificate: 'CERTIFICATE 100% UNLOCKED',
  attemptLabel: 'Final prompt attempts',
  ranks: ['AI EXPLORER: EXCELLENT', 'AI EXPLORER', 'AI EXPLORER: BEGINNER'],
  extraStats: (s) => `Seal strikes: ${s.ms.strikes || 0} · Lockdowns: ${s.ms.lockdowns || 0} · Sensors triggered: ${s.ms.zaps || 0}`,
  startYaw: 0,
  initialState: m3.initialState,
  PuzzleUI: VaultPuzzle,
  HudExtra: StrikesHud,
  Overlay: LockdownOverlay,
  Finale,
  hudItems: (s) => [
    ...SEALS.slice().sort((a, b) => a.key - b.key).map((x) => ({ id: x.id, label: `${x.key} ${x.label}`, color: x.color, got: s.inventory.includes(x.id) })),
    { id: 'final', label: '4 FINAL PROMPT', color: '#e879f9', got: s.doorOpen },
  ],
  Level: VaultHall,
  spawns: SPAWNS,
  stars: STARS,
  colliders: buildColliders,
  openSpaces: OPEN_SPACES,
  interactables: m3.INTERACTABLES,
  intro: m3.intro, endIntro: m3.endIntro, update: m3.update, objective: m3.objective, reset: m3.reset,
  cinematics: {
    intro: [
      { d: 5, from: [7, 2.4, 13.4], to: [4, 3.0, 11], look: [0, 4.4, 0], lookTo: [0, 4.6, 0] },
      { d: 5, from: [0, 4.0, 5.5], to: [0, 4.4, 3.6], look: [0, 4.8, 0], lookTo: [0, 4.8, 0] },
      { d: 6, from: [-4.5, 1.8, 6.2], to: [4.5, 1.8, 6.2], look: [0, 1.4, 8.8], lookTo: [0, 1.4, 8.8] },
      { d: 99, from: [0, 2.3, 5.6], to: [0, 2.6, 4.8], look: [0, 1.4, 8.8], lookTo: [0, 1.4, 8.8] },
    ],
    lockdown: { pos: [0, 3.0, 5.5], look: [0, 4.6, 0], k: 2 },
    vault: { pos: [2.6, 2.6, -21.2], look: [0, 2.6, -27.9], k: 2 },
    victory: { center: [0, 1.3, -24.2], radius: 5.2, height: 2.3 },
  },
  lesson: {
    title: 'Using AI responsibly',
    points: [
      ['PRIVACY', 'Do not put photos, your address, grades or messages into a public chatbot. Not yours, not anyone else\'s. A deepfake made without consent is not a joke.'],
      ['INTEGRITY', 'AI can help with ideas, a plan and feedback. The work has to be yours. Say when you used AI, and how.'],
      ['BIAS', 'AI repeats stereotypes from the data it learned from. Ask for varied examples and review what you get.'],
      ['RESPONSIBILITY', 'AI makes a draft, you decide. Check the answers, because you are responsible for what you hand in.'],
    ],
    example: {
      badLabel: 'Weak prompt', goodLabel: 'Strong prompt',
      bad: '"Make a poster about AI. Here are the names and grades of everyone in my class."',
      good: '"You are a school poster designer who writes short, clear text for teenagers. Make a poster with rules for using AI in our class. For second-year high-school students; the poster hangs on the classroom wall and can be read in one minute. A title and 5 short rules, one sentence each. Safety rules: we do not share personal data, the work is ours and we say when we used AI, we watch out for stereotypes, we check the answers."',
    },
    extra: 'Before you use AI for school, ask your teacher what the rules are for that subject. Responsible use is a habit, not a single button.',
  },
};
