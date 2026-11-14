/**
 * CHARACTER ROSTER
 * ----------------
 * Every character is pure data. The renderer (Avatar.jsx) picks a model based on `model.type`:
 *   - 'procedural' : built-in blocky avatar (BlockyAvatar.jsx) driven by `look`
 *   - 'glb'        : a custom GLB file, e.g. generated from a reference photo.
 *
 * To swap in a custom avatar later, drop a file into /public/avatars and change e.g.:
 *   model: { type: 'glb', url: 'avatars/mastermind.glb', scale: 1, yOffset: 0,
 *            clips: { idle: 'Idle', walk: 'Walk', run: 'Run', cheer: 'Cheer', dance: 'Dance' } }
 * If the GLB fails to load, the game automatically falls back to the procedural avatar.
 *
 * The four heroes are original cartoon AI helpers invented for this game. They use no real
 * logos or brand colours. Internal ids are kept from the original project.
 */

export const ROSTER = [
  {
    id: 'mastermind',
    name: 'GPT',
    color: '#a78bfa',
    skill: 'Rješava zagonetke',
    tagline: 'Rješava zagonetke. Samouvjeren.',
    idleStyle: 'thinker',
    defaultMood: 'smug',
    model: { type: 'procedural' },
    look: {
      skin: '#ddd6fe', hair: '#5b21b6', hairStyle: 'neat', antenna: '#f0abfc',
      shirt: '#6d4bd8', shirtDetail: '#f5f0ff', pants: '#3d3f52', shoes: '#1e1e28',
      accessory: 'glasses',
    },
  },
  {
    id: 'joker',
    name: 'Gemi',
    color: '#facc15',
    skill: 'Vidi slike i kamere',
    tagline: 'Kreativan. Vidi slike i kamere.',
    idleStyle: 'bouncy',
    defaultMood: 'grin',
    model: { type: 'procedural' },
    look: {
      skin: '#fef08a', hair: '#1c1c1c', hairStyle: 'cap', antenna: '#fb7185',
      shirt: '#f97316', shirtDetail: '#22c55e', pants: '#7c2d12', shoes: '#f5f5f5',
      accessory: 'hoodie',
    },
  },
  {
    id: 'boss',
    name: 'Copilot',
    color: '#4ade80',
    skill: 'Pregovara i organizuje',
    tagline: 'Pregovara i organizuje.',
    idleStyle: 'boss',
    defaultMood: 'serious',
    model: { type: 'procedural' },
    look: {
      skin: '#bbf7d0', hair: '#14532d', hairStyle: 'slick', antenna: '#fde047',
      shirt: '#1e2a4a', shirtDetail: '#ffffff', pants: '#1a2440', shoes: '#0d0d0d',
      accessory: 'suit',
    },
  },
  {
    id: 'commentator',
    name: 'Claude',
    color: '#60a5fa',
    skill: 'Jasan glas, sve objasni',
    tagline: 'Jasan glas. Pažljiv i pristojan.',
    idleStyle: 'talker',
    defaultMood: 'excited',
    model: { type: 'procedural' },
    look: {
      skin: '#bfdbfe', hair: '#1d4ed8', hairStyle: 'curly', antenna: '#86efac',
      shirt: '#0ea5e9', shirtDetail: '#1f2937', pants: '#374151', shoes: '#1e3a8a',
      accessory: 'headset',
    },
  },
];

export const SPEAKERS = {
  system: { name: 'RAZGLAS', color: '#ff4d4d' },
  ai: { name: 'PROMPTOTRON 3000', color: '#22d3ee' },
  brew: { name: 'SNACK-O-MAT 9000', color: '#fbbf24' },
  admin: { name: 'ARHIVAR', color: '#e879f9' },
  narrator: { name: '', color: '#cbd5e1' },
  ...Object.fromEntries(ROSTER.map((c) => [c.id, { name: c.name, color: c.color }])),
};

export const indexOfChar = (id) => ROSTER.findIndex((c) => c.id === id);
