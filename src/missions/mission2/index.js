// Mission 2 — KRIZA KOD AUTOMATA, the school hallway (see registry.js for the mission interface)
import BreakRoom from './BreakRoom.jsx';
import * as m2 from './logic.js';
import { FactChecker, CaffeineMeter, NapOverlay } from './ui.jsx';
import { SOURCES } from './factCheck.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

// HUD chips: [source id, character key that can unlock it, short label]
const HUD = [['textbook', 1, 'KNJIGA'], ['health', 1, 'SAJT'], ['cctv', 2, 'KAMERA'], ['teacher', 3, 'PROF'], ['label', 4, 'ETIKETA']];

export default {
  id: 'mission2', number: 2, title: 'Kriza kod automata', status: 'available',
  tagline: 'Školski automat tvrdi 5 stvari i potpuno je siguran. Nađi dokaze i označi: tačno ili halucinacija.',
  announcement: 'PAŽNJA, UČENICI. AUTOMAT ZA UŽINU JE VAN KONTROLE.',
  certificate: 'SERTIFIKAT OTKLJUČAN 66%',
  attemptLabel: 'Pokušaja provjere',
  ranks: ['MAJSTOR PROVJERE', 'LOVAC NA IZVORE', 'POČETNIK'],
  extraStats: (s) => `Zaspali na času: ${s.ms.naps || 0} · Sudari sa Usisivač-Botom: ${s.ms.bumps || 0}`,
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
    title: 'Provjera činjenica: halucinacije i izvori',
    points: [
      ['HALUCINACIJE', 'AI može da izmisli nešto i kaže to potpuno sigurno („čips light nema masti“). Zvučati sigurno nije isto što i biti u pravu.'],
      ['PROVJERI IZVOR', 'Pitaj ko je to napisao i šta time dobija. Letak automata o sebi, TikTok bez izvora ili „drug je čuo“ nisu dokaz.'],
      ['UPOREDI', 'Uporedi tvrdnju sa nezavisnim, pouzdanim izvorima: udžbenik, nastavnik, deklaracija, zvanični sajt, snimak.'],
      ['AI NIJE UVIJEK U KRIVU', 'Dvije od pet tvrdnji bile su tačne. I tačna tvrdnja traži pouzdan dokaz. Provjeravaj sve, ne samo ono što ti je sumnjivo.'],
    ],
    example: {
      badLabel: 'Slabo zaključivanje', goodLabel: 'Dobro zaključivanje',
      bad: '„AI je rekao da čips light nema masti, znači nema.“',
      good: '„AI je rekao da čips light nema masti. Na deklaraciji piše 22 g masti na 100 g. Znači, tvrdnja je netačna.“',
    },
    extra: 'Savjet: kad koristiš AI za učenje ili referat, za svaku važnu tvrdnju nađi bar jedan nezavisan izvor. Ono što ne možeš da provjeriš, označi ili izbaci.',
  },
};
