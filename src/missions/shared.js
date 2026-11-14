// Small helpers shared by the three missions.
import { ROSTER, indexOfChar } from '../characters/roster.js';

/** One short line for "this needs another character": names who can do it and which key to press. */
export const needs = (charId) => {
  const i = indexOfChar(charId);
  return `Only ${ROSTER[i].name} can do this. Press ${i + 1}.`;
};
