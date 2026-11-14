// Mission 1 — THE IMPOSSIBLE PROMPT (see registry.js for the mission interface)
import TrainingCenter from './TrainingCenter.jsx';
import PromptBuilder from './PromptBuilder.jsx';
import * as m1 from './logic.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

const COMPONENTS = [['role', 'ULOGA', '#f472b6'], ['task', 'ZADATAK', '#60a5fa'], ['context', 'KONTEKST', '#34d399'], ['format', 'FORMAT', '#fbbf24']];

export default {
  id: 'mission1', number: 1, title: 'Nemogući prompt', status: 'available',
  tagline: 'Učionica je zaključana. Skupi Ulogu, Zadatak, Kontekst i Format. Složi savršen prompt. Izađi.',
  announcement: 'PAŽNJA, UČENICI. VAŠ AI SERTIFIKAT JE ZAKLJUČAN.',
  certificate: 'SERTIFIKAT OTKLJUČAN 33%',
  attemptLabel: 'Pokušaja sa promptom',
  ranks: ['MAJSTOR PROMPTA', 'DOBAR PROMPTER', 'POČETNIK'],
  startYaw: Math.PI / 2,
  PuzzleUI: PromptBuilder,
  hudItems: (s) => COMPONENTS.map(([id, label, color]) => ({ id, label, color, got: s.inventory.includes(id) })),
  Level: TrainingCenter,
  spawns: SPAWNS,
  stars: STARS,
  colliders: buildColliders,
  openSpaces: OPEN_SPACES,
  interactables: m1.INTERACTABLES,
  intro: m1.intro, endIntro: m1.endIntro, update: m1.update, objective: m1.objective, reset: m1.reset,
  cinematics: {
    // camera shots for the opening: from -> to positions & look targets, duration in seconds
    intro: [
      { d: 5, from: [10, 4.2, 8], to: [4, 3.4, 5], look: [-11, 2.4, 0], lookTo: [-11, 2.6, 0] },
      { d: 5, from: [-7.5, 2.2, 3], to: [-8.2, 2.6, 1.2], look: [-11.7, 2.5, 0], lookTo: [-11.7, 2.6, 0] },
      { d: 6, from: [-9.3, 1.5, -4.5], to: [-9.3, 1.6, 4.5], look: [-6.5, 1.5, -2], lookTo: [-6.5, 1.5, 2] },
      { d: 99, from: [-8.4, 2.4, 0.1], to: [-9.6, 3.0, 0.0], look: [-6.5, 1.4, 0], lookTo: [-6.5, 1.4, 0] },
    ],
    door: { pos: [3.2, 2.4, -4.2], look: [0, 1.5, -9.2] },
    victory: { center: [0, 1.3, -15.0], radius: 5.2, height: 2.3 },
  },
  lesson: {
    title: 'Dobar prompt u 4 sastojka',
    points: [
      ['ULOGA', 'Reci AI-ju ko treba da bude. „Ti si strpljiv tutor iz biologije“ daje bolji odgovor nego ništa.'],
      ['ZADATAK', 'Jedna jasna stvar. „Napravi plan učenja za kontrolni iz fotosinteze“ pobjeđuje „uradi nešto sa biljkama“.'],
      ['KONTEKST', 'Ko si ti i kakva je situacija: razred, koliko imaš vremena, šta ti ne ide. Bez toga AI nagađa.'],
      ['FORMAT', 'Reci kako odgovor treba da izgleda: tabela, lista, broj riječi. Tako ga možeš odmah koristiti.'],
    ],
    example: {
      badLabel: 'Slab prompt', goodLabel: 'Jak prompt',
      bad: '„Objasni mi biljke.“',
      good: '„Ti si strpljiv tutor iz biologije koji objašnjava srednjoškolcima. Napravi mi plan učenja za kontrolni iz fotosinteze. Ja sam učenik 1. razreda gimnazije, kontrolni je za 3 dana, imam 30 min dnevno i slabije razumijem hemijski dio. Daj tabelu: Dan, Šta učim, Kako se provjerim.“',
    },
    extra: 'Savjet: prvi odgovor je samo nacrt. Traži doradu („objasni 2. dan jednostavnije“) i uvijek provjeri činjenice prije nego što nešto naučiš napamet ili predaš.',
  },
};
