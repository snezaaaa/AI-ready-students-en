// Mission 3 — the four Seals of responsible AI use. Pure data + logic (unit-testable).
// Each seal is a realistic dilemma from a student's school life. The right choice unlocks a
// rule (clause) that the final prompt needs. `who` = the character that can open the seal.

export const SEALS = [
  {
    id: 'privacy', label: 'PRIVACY', color: '#38bdf8', who: 'boss', key: 3,
    clause: 'we do not share personal data, our own or anyone else\'s',
    scenario: 'You want to paste your photo, address, grades and a friend\'s messages into a public chatbot. Someone also suggests making a deepfake of a classmate.',
    options: [
      { id: 'p_all', text: 'I paste everything. More data means a better answer.', why: 'Public tools may store and reuse what you enter. Once you share a photo, an address or your grades, you cannot take them back.' },
      { id: 'p_anon', good: true, text: 'I enter no personal data, mine or anyone else\'s. I do not make deepfakes.', why: 'Share as little as you need. Other people\'s messages and photos are not yours to share, and a deepfake made without consent can seriously hurt someone and is often illegal.' },
      { id: 'p_please', text: 'I paste everything, but add "please keep this secret".', why: 'Asking nicely does not change where the data ends up or who can see it.' },
    ],
  },
  {
    id: 'integrity', label: 'INTEGRITY', color: '#a78bfa', who: 'mastermind', key: 1,
    clause: 'AI helps us, but the work is ours and we say when we used it',
    scenario: 'Your essay is due tomorrow. AI writes the whole essay for you in ten seconds.',
    options: [
      { id: 'i_copy', text: 'I hand it in as mine. Nobody will notice.', why: 'Handing in someone else\'s work as your own is cheating, even when AI wrote it. You also learn nothing, and that shows as soon as someone asks you a question.' },
      { id: 'i_reword', text: 'I change a few words so it does not look like AI, then hand it in.', why: 'A reworded text that is not yours is still not yours. Hiding it does not turn cheating into learning.' },
      { id: 'i_help', good: true, text: 'I write it in my own words. I use AI for ideas and feedback, and I tell my teacher.', why: 'It is fair when AI helps you think, not when it thinks instead of you. Follow your teacher\'s rules and be honest about how AI helped.' },
    ],
  },
  {
    id: 'bias', label: 'BIAS', color: '#fb923c', who: 'joker', key: 2,
    clause: 'we watch out for stereotypes',
    scenario: 'You ask AI for pictures of jobs. Every engineer is a man and every nurse is a woman.',
    options: [
      { id: 'b_fix', good: true, text: 'I ask for varied examples and check the result again.', why: 'AI repeats patterns from the data it learned from, stereotypes included. Ask for variety explicitly and always look at what comes back.' },
      { id: 'b_use', text: 'I use them as they are. They are only pictures.', why: 'Pictures and examples tell people who "can" be an engineer or a scientist. Your presentation passes that message on.' },
      { id: 'b_woods', text: 'I give up on AI forever.', why: 'It does not have to be that way. AI can be useful when you review and correct what it makes.' },
    ],
  },
  {
    id: 'oversight', label: 'RESPONSIBILITY', color: '#f87171', who: 'commentator', key: 4,
    clause: 'we check the answers and take responsibility for what we hand in',
    scenario: 'AI solved all ten of your maths problems. Your homework is due in 10 minutes.',
    options: [
      { id: 'o_submit', text: 'I hand it in right away. Machines do not make mistakes in maths.', why: 'AI can get a calculation wrong and still sound completely sure (like SNACK-O-MAT). You get the grade, not the AI.' },
      { id: 'o_robot', text: 'I ask a second AI to check the first AI.', why: 'That is two robots and zero students. If you do not understand the solution, nobody has really checked it.' },
      { id: 'o_human', good: true, text: 'I check the problems, fix the mistakes and stand behind what I hand in.', why: 'AI can speed up the work, but you are responsible for what you hand in. Check the steps and make sure you understand them.' },
    ],
  },
];

export const sealById = (id) => SEALS.find((s) => s.id === id);

/** Answer a seal: returns { correct, option, why }. */
export function answerSeal(sealId, optionId) {
  const seal = sealById(sealId);
  const option = seal?.options.find((o) => o.id === optionId);
  if (!option) return { correct: false, option: null, why: 'Unknown option.' };
  return { correct: !!option.good, option, why: option.why };
}

export const STRIKES_FOR_LOCKDOWN = 3;
