// Mission 2 — THE VENDING MACHINE CRISIS, the school hallway (see registry.js for the mission interface)
import BreakRoom from './BreakRoom.jsx';
import * as m2 from './logic.js';
import { FactChecker, CaffeineMeter, NapOverlay } from './ui.jsx';
import { SOURCES } from './factCheck.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

// HUD chips: [source id, character key that can unlock it, short label]
const HUD = [['textbook', 1, 'BOOK'], ['health', 1, 'WEBSITE'], ['cctv', 2, 'CAMERA'], ['teacher', 3, 'TEACHER'], ['label', 4, 'LABEL']];

export default {
  id: 'mission2', number: 2, title: 'The Vending Machine Crisis', status: 'available',
  tagline: 'The school vending machine makes 5 claims and is completely sure of them. Find the evidence and mark each one: true or hallucination.',
  announcement: 'ATTENTION, STUDENTS. THE SNACK MACHINE IS OUT OF CONTROL.',
  certificate: 'CERTIFICATE 66% UNLOCKED',
  attemptLabel: 'Fact-check attempts',
  ranks: ['MASTER FACT-CHECKER', 'SOURCE HUNTER', 'BEGINNER'],
  extraStats: (s) => `Fell asleep in class: ${s.ms.naps || 0} · Vacuum-Bot bumps: ${s.ms.bumps || 0}`,
  startYaw: Math.PI / 2,
  initialState: m2.initialState,
  PuzzleUI: FactChecker,
  HudExtra: CaffeineMeter,
  Overlay: NapOverlay,
  hudItems: (s) => HUD.map(([id, key, label]) => ({ id, label: `${key} ${label}`, color: SOURCES[id].color, got: s.inventory.includes(id) })),
  Level: BreakRoom,
  spawns: SPAWNS,
  stars: STARS,
  onStar: m2.onStar,
  colliders: buildColliders,
  openSpaces: OPEN_SPACES,
  interactables: m2.INTERACTABLES,
  intro: m2.intro, endIntro: m2.endIntro, update: m2.update, objective: m2.objective, reset: m2.reset,
  cinematics: {
    intro: [
      { d: 5, from: [9, 3.7, 6.5], to: [5.5, 3.3, 4], look: [-9, 2.0, 0], lookTo: [-9, 2.2, 0] },
      { d: 5, from: [-5.2, 2.3, 2.2], to: [-6.3, 2.4, 0.9], look: [-8.6, 2.3, 0], lookTo: [-8.6, 2.3, 0] },
      { d: 6, from: [-3.4, 1.6, 4.4], to: [-3.4, 1.7, 7.6], look: [-0.1, 1.4, 5.9], lookTo: [-0.1, 1.4, 6.5] },
      { d: 99, from: [-4.0, 2.4, 6.2], to: [-4.6, 2.8, 6.2], look: [-0.1, 1.4, 6.2], lookTo: [-0.1, 1.4, 6.2] },
    ],
    grounded: { pos: [-4.6, 2.3, 3.0], look: [-8.6, 1.9, 0] },
    nap: { pos: [3.5, 3.7, 7.4], look: [0, 0.6, 5.2], k: 1.5 },
    victory: { center: [0, 1.3, -14.8], radius: 5.2, height: 2.3 },
  },
  lesson: {
    title: 'Fact-checking AI: hallucinations and sources',
    points: [
      ['HALLUCINATIONS', 'AI can make something up and say it with total confidence ("light chips have no fat"). Sounding sure is not the same as being right.'],
      ['CHECK THE SOURCE', 'Ask who wrote it and what they gain. A leaflet the machine wrote about itself, a TikTok with no sources, or "a classmate heard" is not evidence.'],
      ['COMPARE', 'Compare the claim with independent, reliable sources: a textbook, a teacher, a nutrition label, an official website, footage.'],
      ['AI IS NOT ALWAYS WRONG', 'Two of the five claims were true. A true claim needs reliable evidence too. Check everything, not only what looks suspicious.'],
    ],
    example: {
      badLabel: 'Weak reasoning', goodLabel: 'Good reasoning',
      bad: '"The AI said light chips have no fat, so they don\'t."',
      good: '"The AI said light chips have no fat. The label says 22 g of fat per 100 g. So the claim is false."',
    },
    extra: 'Tip: when you use AI for studying or a school report, find at least one independent source for every important claim. Mark or drop anything you cannot verify.',
  },
};
