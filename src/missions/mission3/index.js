// Mission 3 — KONAČNI SERTIFIKAT, the school archive (see registry.js for the mission interface)
import VaultHall from './VaultHall.jsx';
import * as m3 from './logic.js';
import { VaultPuzzle, StrikesHud, LockdownOverlay, Finale } from './ui.jsx';
import { SEALS } from './dilemmas.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

export default {
  id: 'mission3', number: 3, title: 'Konačni sertifikat', status: 'available',
  tagline: 'Školska arhiva: 4 dileme o odgovornoj upotrebi AI, hodnik sa senzorima i konačni prompt.',
  announcement: 'PAŽNJA, UČENICI. ZA KONAČNI SERTIFIKAT TREBA... JOŠ JEDAN PROMPT.',
  certificate: 'SERTIFIKAT OTKLJUČAN 100%',
  attemptLabel: 'Pokušaja sa konačnim promptom',
  ranks: ['AI ISTRAŽIVAČ: ODLIČAN (5)', 'AI ISTRAŽIVAČ', 'AI ISTRAŽIVAČ: POČETNIK'],
  extraStats: (s) => `Greške kod pečata: ${s.ms.strikes || 0} · Vanredni časovi: ${s.ms.lockdowns || 0} · Aktivirani senzori: ${s.ms.zaps || 0}`,
  startYaw: 0,
  initialState: m3.initialState,
  PuzzleUI: VaultPuzzle,
  HudExtra: StrikesHud,
  Overlay: LockdownOverlay,
  Finale,
  hudItems: (s) => [
    ...SEALS.slice().sort((a, b) => a.key - b.key).map((x) => ({ id: x.id, label: `${x.key} ${x.label}`, color: x.color, got: s.inventory.includes(x.id) })),
    { id: 'final', label: '4 KONAČNI PROMPT', color: '#e879f9', got: s.doorOpen },
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
    title: 'Odgovorna upotreba AI',
    points: [
      ['PRIVATNOST', 'U javni chatbot ne unosi slike, adresu, ocjene ni poruke. Ni svoje ni tuđe. Deepfake bez pristanka nije šala.'],
      ['INTEGRITET', 'AI može da pomogne oko ideja, plana i komentara. Rad mora biti tvoj. Reci kad si koristio AI i kako.'],
      ['PRISTRASNOST', 'AI ponavlja stereotipe iz podataka na kojima je učio. Traži raznolike primjere i pregledaj šta dobiješ.'],
      ['ODGOVORNOST', 'AI pravi nacrt, a ti odlučuješ. Provjeri odgovore, jer za ono što predaš odgovaraš ti.'],
    ],
    example: {
      badLabel: 'Slab prompt', goodLabel: 'Jak prompt',
      bad: '„Napravi plakat o AI. Evo imena i ocjena svih iz mog odjeljenja.“',
      good: '„Ti si dizajner školskih plakata koji piše kratko i jasno za tinejdžere. Napravi plakat sa pravilima korištenja AI u našem odjeljenju. Za učenike 2. razreda srednje škole; plakat stoji na zidu učionice i čita se za jedan minut. Naslov i 5 kratkih pravila, svako u jednoj rečenici. Zaštitna pravila: ne dijelimo lične podatke, rad je naš i kažemo kad smo koristili AI, pazimo na stereotipe, provjeravamo odgovore.“',
    },
    extra: 'Prije nego što koristiš AI za školu, pitaj nastavnika koja su pravila za taj predmet. Odgovorna upotreba je navika, a ne jedno dugme.',
  },
};
