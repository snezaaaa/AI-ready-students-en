// Mission 1 puzzle rules. Pure data + logic (no React / three) so it is unit-testable.

export const SLOTS = [
  { id: 'role', label: 'ULOGA', color: '#f472b6', question: 'KO treba da bude AI?' },
  { id: 'task', label: 'ZADATAK', color: '#60a5fa', question: 'ŠTA tačno treba da uradi?' },
  { id: 'context', label: 'KONTEKST', color: '#34d399', question: 'ZA KOGA i u kakvoj situaciji?' },
  { id: 'format', label: 'FORMAT', color: '#fbbf24', question: 'KAKO treba da izgleda odgovor?' },
];

// `good` cards must be found in the room first. Decoys are always available (and always wrong).
export const CARDS = {
  role: [
    { id: 'role_good', good: true, text: 'Ti si strpljiv tutor iz biologije koji objašnjava srednjoškolcima.' },
    { id: 'role_toaster', text: 'Ti si toster.', fail: 'TOSTER: Mogu samo da ispečem hljeb. → Pogrešna uloga daje beskoristan odgovor.' },
    { id: 'role_none', text: '(bez uloge)', fail: 'Evo opšteg teksta o učenju, za bilo koga. → Bez uloge AI ne zna kako da ti se obrati.' },
  ],
  task: [
    { id: 'task_good', good: true, text: 'Napravi mi plan učenja za kontrolni iz fotosinteze.' },
    { id: 'task_vague', text: 'Uradi nešto sa biljkama.', fail: 'Evo liste sobnih biljaka. → Nejasan zadatak: AI ne zna da ti treba plan učenja.' },
    { id: 'task_huge', text: 'Objasni mi cijelu biologiju. Odmah.', fail: 'Lekcija 1 od 9.000... → Prevelik zadatak. Traži jednu konkretnu stvar.' },
  ],
  context: [
    { id: 'context_good', good: true, text: 'Ja sam učenik 1. razreda gimnazije, kontrolni je za 3 dana, imam 30 min dnevno i slabije razumijem hemijski dio.' },
    { id: 'context_tuesday', text: 'Kontekst: utorak je.', fail: 'Plan za 30 dana, po 3 sata dnevno. → AI ne zna koliko imaš vremena ni šta ti ne ide.' },
    { id: 'context_vibes', text: 'Bez konteksta.', fail: 'Plan za studente biologije. → Bez konteksta AI nagađa ko si.' },
  ],
  format: [
    { id: 'format_good', good: true, text: 'Daj tabelu: Dan, Šta učim, Kako se provjerim.' },
    { id: 'format_dance', text: 'Format: kako god.', fail: 'Dugačak tekst bez reda. → Nisi rekao/la kako odgovor treba da izgleda.' },
    { id: 'format_wall', text: 'Jedan pasus od 47 strana.', fail: 'Fotosintezajeprocesukojembiljke... (strana 1 od 47) → Ovo ne možeš koristiti za učenje.' },
  ],
};

export const HINTS = {
  role: 'ULOGA: izaberi stručnjaka za ono što ti treba.',
  task: 'ZADATAK: jedna jasna, konkretna stvar.',
  context: 'KONTEKST: ko si i kakva je situacija.',
  format: 'FORMAT: kako odgovor treba da izgleda.',
};

export const SUCCESS_OUTPUT = [
  'PLAN UČENJA: Fotosinteza (3 dana po 30 min, 1. razred)',
  '| Dan | Šta učim                                   | Kako se provjerim                       |',
  '| 1   | Šta je fotosinteza: svjetlost, voda, CO2   | Objasnim drugu u 3 rečenice, bez sveske |',
  '| 2   | Hemijski dio, polako: jednačina, dio po dio | Napišem jednačinu napamet i imenujem sve |',
  '| 3   | Ponavljanje + 10 pitanja kao na kontrolnom | Riješim bez gledanja, pa ispravim greške |',
  'Savjet tutora: hemijski dio ponovi svaki dan po 10 minuta. Malo, ali redovno.',
];

export const cardById = (id) => {
  for (const slot of SLOTS) {
    const c = CARDS[slot.id].find((x) => x.id === id);
    if (c) return { ...c, slot: slot.id };
  }
  return null;
};

/** Is this card selectable given what the player has collected? */
export const isCardAvailable = (card, slotId, inventory) => !card.good || inventory.includes(slotId);

/**
 * selection: { role: cardId|null, task: ..., context: ..., format: ... }
 * inventory: array of collected slot ids, e.g. ['role','task']
 */
export function evaluatePrompt(selection, inventory) {
  const results = {};
  let score = 0;
  const wrong = [];
  const missing = [];
  for (const slot of SLOTS) {
    const id = selection?.[slot.id];
    const card = id ? CARDS[slot.id].find((c) => c.id === id) : null;
    const usable = card && (!card.good || inventory.includes(slot.id));
    if (!usable) {
      results[slot.id] = 'missing';
      missing.push(slot.id);
    } else if (card.good) {
      results[slot.id] = 'ok';
      score += 25;
    } else {
      results[slot.id] = 'wrong';
      wrong.push(slot.id);
    }
  }
  const success = score === 100;
  let output;
  if (success) output = SUCCESS_OUTPUT.join('\n');
  else if (wrong.length) output = CARDS[wrong[0]].find((c) => c.id === selection[wrong[0]]).fail;
  else output = `PROMPT NIJE POTPUN. Nedostaje: ${missing.map((m) => SLOTS.find((s) => s.id === m).label).join(', ')}.`;

  return { success, score, results, wrong, missing, output };
}

export const assemblePrompt = (selection) =>
  SLOTS.map((s) => (selection?.[s.id] ? CARDS[s.id].find((c) => c.id === selection[s.id])?.text : `[${s.label}?]`)).join(' ');
