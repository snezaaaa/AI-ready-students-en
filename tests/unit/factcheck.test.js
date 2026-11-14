import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLAIMS, SOURCES, evaluateFactCheck, evidenceFor, RELIABLE_IDS } from '../../src/missions/mission2/factCheck.js';
import { ROSTER } from '../../src/characters/roster.js';

const ALL = Object.keys(SOURCES);
const perfect = Object.fromEntries(CLAIMS.map((c) => [c.id, { verdict: c.truth }]));

test('perfect fact-check succeeds at 100%', () => {
  const r = evaluateFactCheck(perfect, ALL);
  assert.equal(r.success, true);
  assert.equal(r.score, 100);
  assert.match(r.output, /se oslanjam na izvore/i);
});

test('each claim shows exactly ONE piece of evidence: its reliable source, once found', () => {
  for (const c of CLAIMS) {
    assert.equal(evidenceFor(c.id, ALL), c.reliable);
    assert.equal(SOURCES[c.reliable].reliable, true);
    assert.ok(SOURCES[c.reliable].claims[c.id]);
    assert.equal(evidenceFor(c.id, ALL.filter((k) => k !== c.reliable)), null, 'decoys are never offered as evidence');
  }
  assert.equal(RELIABLE_IDS.length, 5);
  assert.equal(new Set(CLAIMS.map((c) => c.reliable)).size, 5);
});

test('a wrong verdict is "wrong" and the machine says the evidence disagrees', () => {
  const r = evaluateFactCheck({ ...perfect, c2: { verdict: false } }, ALL);
  assert.equal(r.success, false);
  assert.equal(r.results.c2, 'wrong');
  assert.equal(r.score, 80);
  assert.match(r.output, /Dokaz kaže suprotno/);
});

test('a claim cannot be judged before its evidence is found', () => {
  const r = evaluateFactCheck(perfect, ALL.filter((k) => k !== 'cctv'));
  assert.equal(r.results.c5, 'missing');
  assert.equal(r.score, 80);
});

test('an unanswered claim counts as missing', () => {
  const r = evaluateFactCheck({ ...perfect, c1: {} }, ALL);
  assert.equal(r.results.c1, 'missing');
});

test('two claims are true and three are hallucinations', () => {
  assert.equal(CLAIMS.filter((c) => c.truth).length, 2);
  assert.equal(CLAIMS.filter((c) => !c.truth).length, 3);
});

test('three unreliable decoys: the machine\'s leaflet, a TikTok screenshot and a rumour', () => {
  assert.deepEqual(Object.keys(SOURCES).filter((k) => !SOURCES[k].reliable).sort(), ['brochure', 'rumor', 'tiktok']);
});

test('every reliable source needs one of the four characters; everyone has 1-2 tasks', () => {
  const ids = ROSTER.map((c) => c.id);
  const count = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const k of RELIABLE_IDS) {
    assert.ok(ids.includes(SOURCES[k].who), `${k} -> ${SOURCES[k].who}`);
    count[SOURCES[k].who]++;
  }
  for (const id of ids) assert.ok(count[id] >= 1 && count[id] <= 2, `${id}: ${count[id]}`);
});
