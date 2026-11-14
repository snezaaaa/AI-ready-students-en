// Small helpers shared by the three missions.
import { ROSTER, indexOfChar } from '../characters/roster.js';

/** One short line for "this needs another character": names who can do it and which key to press. */
export const needs = (charId) => {
  const i = indexOfChar(charId);
  return `Ovo može samo ${ROSTER[i].name}. Pritisni ${i + 1}.`;
};
