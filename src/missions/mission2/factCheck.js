// Mission 2 puzzle rules: fact-check SNACK-O-MAT 9000's claims. Pure data + logic (unit-testable).
//
// Each claim is shown with ONE piece of evidence (its reliable source, once the player has found it).
// The player only decides: TRUE or HALLUCINATION. The unreliable pick-ups (leaflet, TikTok, rumour)
// are never offered as evidence; picking them up just teaches why they do not count.

export const CLAIMS = [
  { id: 'c1', short: 'Energy drinks and memory', text: 'Energy drinks improve your memory before a test.', truth: false, reliable: 'health' },
  { id: 'c2', short: 'Can of soda: about 35 g sugar', text: 'A 330 ml can of fizzy drink can contain about 35 g of sugar.', truth: true, reliable: 'label' },
  { id: 'c3', short: 'The brain uses only 10%', text: 'The brain uses only 10% of its capacity.', truth: false, reliable: 'textbook' },
  { id: 'c4', short: 'Water and concentration', text: 'Water helps you concentrate when you are dehydrated.', truth: true, reliable: 'teacher' },
  { id: 'c5', short: '"Light" chips have no fat', text: 'Chips labelled "light" contain no fat.', truth: false, reliable: 'cctv' },
];

// `claims` maps claim id -> what this source says about it. `who` = character id that can unlock it.
export const SOURCES = {
  textbook: {
    title: 'Biology textbook (school library)', short: 'Biology textbook', author: 'Textbook authors · approved, with references', reliable: true, color: '#a78bfa', who: 'mastermind',
    claims: { c3: 'The whole brain is active. Different parts do different jobs, even while you sleep. The "10%" story is a myth.' },
  },
  health: {
    title: 'Official health website', short: 'Official health website', author: 'Health institution · doctors, dated, with sources', reliable: true, color: '#f87171', who: 'mastermind',
    claims: { c1: 'Energy drinks do not improve memory. A lot of caffeine and sugar can cause nervousness, a racing heart and poor sleep. They are not recommended for young people.' },
  },
  cctv: {
    title: 'School camera footage', short: 'School camera footage', author: 'School camera · footage with date and time', reliable: true, color: '#facc15', who: 'joker',
    claims: { c5: 'The footage shows SNACK-O-MAT sticking its own "0% FAT" sticker over the nutrition label. The real label says: fat 22 g per 100 g.' },
  },
  teacher: {
    title: 'Biology teacher', short: 'Biology teacher', author: 'Biology teacher · subject expert, signed answer', reliable: true, color: '#4ade80', who: 'boss',
    claims: { c4: 'It is true. Even mild dehydration weakens attention and can cause headaches. When you drink water, it is easier to concentrate.' },
  },
  label: {
    title: 'Nutrition label on the drink can', short: 'Label on the can', author: 'Manufacturer · required information on the packaging', reliable: true, color: '#60a5fa', who: 'commentator',
    claims: { c2: 'Sugars: 10.6 g per 100 ml. A 330 ml can has about 35 g of sugar. That is roughly 9 teaspoons.' },
  },
  brochure: {
    title: 'SNACK-O-MAT 9000 leaflet', short: 'SNACK-O-MAT leaflet', author: 'Written by SNACK-O-MAT 9000 · about itself', reliable: false, color: '#94a3b8',
    claims: {
      c1: 'Energy drink = a guaranteed top grade!',
      c2: 'My drinks contain 0 g of sugar.',
      c3: 'The brain uses only 10%.',
      c4: 'Only my juice helps you concentrate.',
      c5: '"Light" chips: 0% fat, 100% taste!',
    },
  },
  tiktok: {
    title: 'TikTok screenshot ("HealthHack420")', short: 'TikTok screenshot', author: 'Anonymous account · no sources · 3 likes', reliable: false, color: '#94a3b8',
    claims: {
      c1: 'energy drink before a test = 100% memory, TRUST ME',
      c3: 'we only use 10% of our brain, they are hiding it!!!',
      c5: 'light chips are literally air',
    },
  },
  rumor: {
    title: 'Note: "a classmate heard"', short: '"A classmate heard" note', author: 'Unknown student · heard it from someone · no sources', reliable: false, color: '#94a3b8',
    claims: {
      c2: 'A classmate heard that cold soda has no sugar at all.',
      c4: 'His brother said water "waters down your brain" before a test.',
    },
  },
};

export const RELIABLE_IDS = Object.keys(SOURCES).filter((k) => SOURCES[k].reliable);

/** The one piece of evidence shown for a claim at the station: its reliable source, once found (else null). */
export const evidenceFor = (claimId, found) => {
  const c = CLAIMS.find((x) => x.id === claimId);
  return c && found.includes(c.reliable) ? c.reliable : null;
};

const BREW_TAUNTS = {
  wrong: () => 'The evidence says the opposite. Read it once more.',
  missing: () => 'You have no evidence for this claim yet. Until you find it, my word stands.',
};

const SUCCESS_NOTES = {
  c1: 'Official health website', c2: 'Label: about 35 g', c3: 'Biology textbook', c4: 'Biology teacher', c5: 'Camera: fat 22 g/100 g',
};

/**
 * One piece of evidence per claim; the player only decides TRUE or HALLUCINATION.
 * answers: { c1: { verdict: true|false|undefined }, ... }
 * found:   collected source ids. A claim without its (reliable) evidence cannot be judged yet.
 */
export function evaluateFactCheck(answers, found) {
  const results = {};
  let score = 0;
  const problems = [];
  for (const c of CLAIMS) {
    const v = answers?.[c.id]?.verdict;
    let r;
    if (typeof v !== 'boolean' || !evidenceFor(c.id, found)) r = 'missing';
    else if (v !== c.truth) r = 'wrong';
    else r = 'ok';
    results[c.id] = r;
    if (r === 'ok') score += 20;
    else problems.push({ claim: c.id, type: r });
  }
  const success = score === 100;
  let output;
  if (success) {
    output = [
      'FACT-CHECK REPORT',
      ...CLAIMS.map((c, i) => `  ${i + 1}. ${(c.short + ' ').padEnd(32, '.')} ${(c.truth ? 'TRUE' : 'HALLUCINATION').padEnd(13)}  [${SUCCESS_NOTES[c.id]}]`),
      '',
      'SNACK-O-MAT 9000: I was sure, and I was wrong. From now on I rely on sources. Dispensing snacks.',
    ].join('\n');
  } else {
    const order = ['wrong', 'missing'];
    const p = problems.slice().sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))[0];
    const claim = CLAIMS.find((c) => c.id === p.claim);
    output = `CLAIM: "${claim.text}"\nSNACK-O-MAT 9000: ${BREW_TAUNTS[p.type]()}`;
  }
  return { success, score, results, problems, output };
}

export const HINTS = {
  wrong: 'Read the evidence carefully: does it support the claim or say the opposite?',
  missing: 'For every claim, first find the evidence in the hallway, then decide.',
};
