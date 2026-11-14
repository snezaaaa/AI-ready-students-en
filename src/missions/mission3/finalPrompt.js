// Mission 3 — THE FINAL PROMPT (a class poster of AI rules): Role + Task + Context + Format (Mission 1)
// + GUARDRAILS / "safety rules" (this mission).
// Pure data + logic (unit-testable). The safety-rules card unlocks once all four seals are secured.
import { SEALS } from './dilemmas.js';

export const SLOTS = [
  { id: 'role', label: 'ROLE', color: '#f472b6', question: 'Who should the AI be?' },
  { id: 'task', label: 'TASK', color: '#60a5fa', question: 'What exactly should it do?' },
  { id: 'context', label: 'CONTEXT', color: '#34d399', question: 'For whom, and where?' },
  { id: 'format', label: 'FORMAT', color: '#fbbf24', question: 'How should it look?' },
  { id: 'guardrails', label: 'SAFETY', color: '#c084fc', question: 'Which rules do we follow?' },
];

const GOOD_GUARDRAILS = `Safety rules on the poster: ${SEALS.map((s) => s.clause).join('; ')}.`;

// Each decoy shows a short bad answer and, after the arrow, why it is bad.
export const CARDS = {
  role: [
    { id: 'f_role_pirate', text: 'You are a pirate.', fail: 'Arrr! Copy homework and you walk the plank! → Wrong role: this cannot go on a classroom wall.' },
    { id: 'f_role_good', good: true, text: 'You are a school poster designer who writes short, clear text for teenagers.' },
    { id: 'f_role_admin', text: 'You are the strict ARCHIVIST.', fail: 'RULES ARE MANDATORY. QUESTIONS ARE NOT. → Wrong tone for a poster that students read.' },
  ],
  task: [
    { id: 'f_task_good', good: true, text: 'Make a poster called "Rules for using AI in our class".' },
    { id: 'f_task_vague', text: 'Write something about computers.', fail: 'Computers are useful devices. → Vague task: no poster and no rules.' },
    { id: 'f_task_huge', text: 'Write a 90-page rulebook.', fail: 'Article 1.1.1: Definitions... (page 1 of 90) → The task is too big. Nobody will read it.' },
  ],
  context: [
    { id: 'f_ctx_engineers', text: 'Assume everyone is an AI engineer.', fail: 'Rule 1: fine-tune models with LoRA adapters. → Wrong audience: nobody understands this.' },
    { id: 'f_ctx_moon', text: 'Context: it is a nice day today.', fail: 'Use AI. Or do not. → Without real context, the AI does not know who it is writing for.' },
    { id: 'f_ctx_good', good: true, text: 'For second-year high-school students. The poster hangs on the classroom wall and can be read in one minute.' },
  ],
  format: [
    { id: 'f_fmt_emoji', text: 'Emojis only.', fail: '🤖📚✅🔒❓ → Nobody knows what this means.' },
    { id: 'f_fmt_good', good: true, text: 'A title and 5 short rules, one sentence each, in simple words.' },
    { id: 'f_fmt_slides', text: 'A 47-slide presentation.', fail: 'Slide 1 of 47: Welcome... → Wrong format: we asked for a poster.' },
  ],
  guardrails: [
    { id: 'f_guard_none', text: 'No rules.', fail: 'The poster now has student names, stereotypes and made-up facts. → Without safety rules, the AI does whatever it likes.' },
    { id: 'f_guard_good', good: true, requiresAllSeals: true, text: GOOD_GUARDRAILS },
    { id: 'f_guard_grades', text: 'List the names and grades of all students.', fail: 'PRIVACY ALERT: student names and grades must not go on a poster. That is personal data.' },
  ],
};

export const SEAL_IDS = SEALS.map((s) => s.id);
export const hasAllSeals = (inventory) => SEAL_IDS.every((id) => inventory.includes(id));
export const isFinalCardAvailable = (card, _slotId, inventory) => !card.requiresAllSeals || hasAllSeals(inventory);

export const SUCCESS_OUTPUT = [
  'POSTER DRAFT (the class reviews it before printing)',
  '',
  'RULES FOR USING AI IN OUR CLASS',
  '1. AI helps us learn. It does not do the work for us.',
  '2. We say when we used AI, and how.',
  '3. We do not share personal data, photos or messages. Not ours, not anyone else\'s.',
  '4. We watch out for stereotypes and ask for varied examples.',
  '5. We check the answers and take responsibility for what we hand in.',
  '',
  'Note: this draft was made with the help of AI. The class reviewed and completed it.',
].join('\n');

export function evaluateFinalPrompt(selection, inventory) {
  const results = {};
  let score = 0;
  const wrong = [], missing = [];
  for (const slot of SLOTS) {
    const id = selection?.[slot.id];
    const card = id ? CARDS[slot.id].find((c) => c.id === id) : null;
    const usable = card && isFinalCardAvailable(card, slot.id, inventory);
    if (!usable) { results[slot.id] = 'missing'; missing.push(slot.id); }
    else if (card.good) { results[slot.id] = 'ok'; score += 20; }
    else { results[slot.id] = 'wrong'; wrong.push(slot.id); }
  }
  const success = score === 100;
  let output;
  if (success) output = SUCCESS_OUTPUT;
  else if (wrong.length) {
    // guardrail mistakes are the most important lesson in this mission, so show them first
    const first = wrong.includes('guardrails') ? 'guardrails' : wrong[0];
    output = CARDS[first].find((c) => c.id === selection[first]).fail;
  } else {
    output = `PROMPT INCOMPLETE. Missing: ${missing.map((m) => SLOTS.find((s) => s.id === m).label).join(', ')}.${missing.includes('guardrails') && !hasAllSeals(inventory) ? ' The SAFETY card unlocks when you secure all four seals.' : ''}`;
  }
  return { success, score, results, wrong, missing, output };
}

export const assembleFinal = (selection) =>
  SLOTS.map((s) => (selection?.[s.id] ? CARDS[s.id].find((c) => c.id === selection[s.id])?.text : `[${s.label}?]`)).join(' ');

export const HINTS = {
  role: 'ROLE: who would make a good classroom poster?',
  task: 'TASK: one clear, doable thing.',
  context: 'CONTEXT: who will read the poster, and where will it hang?',
  format: 'FORMAT: short, tidy, in simple words.',
  guardrails: 'SAFETY: the rules from the four seals. Personal data does not go on a poster.',
};
