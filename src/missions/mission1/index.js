// Mission 1 — THE IMPOSSIBLE PROMPT (see registry.js for the mission interface)
import TrainingCenter from './TrainingCenter.jsx';
import PromptBuilder from './PromptBuilder.jsx';
import * as m1 from './logic.js';
import { SPAWNS, buildColliders, OPEN_SPACES, STARS } from './layout.js';

const COMPONENTS = [['role', 'ROLE', '#f472b6'], ['task', 'TASK', '#60a5fa'], ['context', 'CONTEXT', '#34d399'], ['format', 'FORMAT', '#fbbf24']];

export default {
  id: 'mission1', number: 1, title: 'The Impossible Prompt', status: 'available',
  tagline: 'The classroom is locked. Collect Role, Task, Context and Format. Build the perfect prompt. Get out.',
  announcement: 'ATTENTION, STUDENTS. YOUR AI CERTIFICATE HAS BEEN LOCKED.',
  certificate: 'CERTIFICATE 33% UNLOCKED',
  attemptLabel: 'Prompt attempts',
  ranks: ['PROMPT MASTER', 'GOOD PROMPTER', 'BEGINNER'],
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
    title: 'A good prompt in 4 ingredients',
    points: [
      ['ROLE', 'Tell the AI who to be. "You are a patient biology tutor" gets a better answer than nothing.'],
      ['TASK', 'One clear thing. "Make me a study plan for my photosynthesis test" beats "do something with plants".'],
      ['CONTEXT', 'Who you are and what your situation is: your year, how much time you have, what you find hard. Without it the AI guesses.'],
      ['FORMAT', 'Say what the answer should look like: a table, a list, a word limit. Then you can use it straight away.'],
    ],
    example: {
      badLabel: 'Weak prompt', goodLabel: 'Strong prompt',
      bad: '"Explain plants to me."',
      good: '"You are a patient biology tutor who explains things to high-school students. Make me a study plan for my photosynthesis test. I am in my first year of high school, the test is in 3 days, I have 30 minutes a day and I struggle with the chemistry part. Give me a table: Day, What I study, How I check myself."',
    },
    extra: 'Tip: the first answer is only a draft. Ask for changes ("explain day 2 more simply") and always check the facts before you learn something by heart or hand it in.',
  },
};
