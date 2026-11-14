// Mission 1 puzzle rules. Pure data + logic (no React / three) so it is unit-testable.

export const SLOTS = [
  { id: 'role', label: 'ROLE', color: '#f472b6', question: 'WHO should the AI be?' },
  { id: 'task', label: 'TASK', color: '#60a5fa', question: 'WHAT exactly should it do?' },
  { id: 'context', label: 'CONTEXT', color: '#34d399', question: 'FOR WHOM, in what situation?' },
  { id: 'format', label: 'FORMAT', color: '#fbbf24', question: 'HOW should the answer look?' },
];

// `good` cards must be found in the room first. Decoys are always available (and always wrong).
// Each decoy shows a short bad answer and, after the arrow, why it is bad.
export const CARDS = {
  role: [
    { id: 'role_good', good: true, text: 'You are a patient biology tutor who explains things to high-school students.' },
    { id: 'role_toaster', text: 'You are a toaster.', fail: 'TOASTER: All I can do is toast bread. → The wrong role gives a useless answer.' },
    { id: 'role_none', text: '(no role)', fail: 'Here is a general text about studying, for anyone. → Without a role, the AI does not know how to talk to you.' },
  ],
  task: [
    { id: 'task_good', good: true, text: 'Make me a study plan for my photosynthesis test.' },
    { id: 'task_vague', text: 'Do something with plants.', fail: 'Here is a list of house plants. → Vague task: the AI does not know you need a study plan.' },
    { id: 'task_huge', text: 'Explain all of biology. Now.', fail: 'Lesson 1 of 9,000... → The task is too big. Ask for one specific thing.' },
  ],
  context: [
    { id: 'context_good', good: true, text: 'I am in my first year of high school, the test is in 3 days, I have 30 minutes a day and I struggle with the chemistry part.' },
    { id: 'context_tuesday', text: 'Context: it is Tuesday.', fail: 'A plan for 30 days, 3 hours a day. → The AI does not know how much time you have or what you find hard.' },
    { id: 'context_vibes', text: 'No context.', fail: 'A plan for university biology students. → Without context, the AI guesses who you are.' },
  ],
  format: [
    { id: 'format_good', good: true, text: 'Give me a table: Day, What I study, How I check myself.' },
    { id: 'format_dance', text: 'Format: whatever.', fail: 'A long text with no structure. → You did not say what the answer should look like.' },
    { id: 'format_wall', text: 'One 47-page paragraph.', fail: 'Photosynthesisistheprocessbywhichplants... (page 1 of 47) → You cannot study from this.' },
  ],
};

export const HINTS = {
  role: 'ROLE: pick an expert in what you need.',
  task: 'TASK: one clear, specific thing.',
  context: 'CONTEXT: who you are and what your situation is.',
  format: 'FORMAT: what the answer should look like.',
};

export const SUCCESS_OUTPUT = [
  'STUDY PLAN: Photosynthesis (3 days, 30 min a day, 1st year)',
  '| Day | What I study                               | How I check myself                         |',
  '| 1   | What photosynthesis is: light, water, CO2  | Explain it to a friend in 3 sentences      |',
  '| 2   | The chemistry part, slowly: the equation   | Write the equation from memory, name parts |',
  '| 3   | Review + 10 test-style questions           | Answer without notes, then fix my mistakes |',
  'Tutor tip: go over the chemistry part for 10 minutes every day. Little, but often.',
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
  else output = `PROMPT INCOMPLETE. Missing: ${missing.map((m) => SLOTS.find((s) => s.id === m).label).join(', ')}.`;

  return { success, score, results, wrong, missing, output };
}

export const assemblePrompt = (selection) =>
  SLOTS.map((s) => (selection?.[s.id] ? CARDS[s.id].find((c) => c.id === selection[s.id])?.text : `[${s.label}?]`)).join(' ');
