import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, SPEAKERS } from '../../src/characters/roster.js';
import { SPAWNS, VICTORY_SPOTS, DESKS } from '../../src/missions/mission1/layout.js';
import { useGame } from '../../src/game/store.js';
import { world } from '../../src/game/world.js';
import * as L1 from '../../src/missions/mission1/layout.js';
import * as L2 from '../../src/missions/mission2/layout.js';
import * as L3 from '../../src/missions/mission3/layout.js';
import { CORRIDOR } from '../../src/missions/mission3/lasers.js';

test('four characters: GPT, Gemi, Copilot, Claude (no fighter)', () => {
  assert.deepEqual(ROSTER.map((c) => c.name), ['GPT', 'Gemi', 'Copilot', 'Claude']);
  assert.deepEqual(ROSTER.map((c) => c.id), ['mastermind', 'joker', 'boss', 'commentator']);
  assert.ok(!ROSTER.some((c) => c.id === 'fighter'));
  for (const c of ROSTER) { assert.ok(c.skill && c.tagline, c.id); assert.equal(SPEAKERS[c.id].name, c.name); }
});

test('the world, spawns and victory spots are sized for four characters', () => {
  assert.equal(world.chars.length, 4);
  assert.equal(SPAWNS.length, 4);
  assert.equal(VICTORY_SPOTS.length, 4);
  assert.ok(DESKS.length >= ROSTER.length, 'every character has a desk');
});

test('only keys 1-4 switch characters', () => {
  const g = useGame.getState();
  assert.equal(g.switchCharacter(3), true);
  assert.equal(useGame.getState().active, 3);
  assert.equal(useGame.getState().switchCharacter(4), false);
  assert.equal(useGame.getState().active, 3);
  useGame.getState().switchCharacter(0);
});

test('player-facing names use Latin script only (no Cyrillic)', () => {
  const text = JSON.stringify([ROSTER, SPEAKERS]);
  assert.ok(!/[\u0400-\u04FF]/.test(text));
});

// ---------------- jumping: platforms and bonus stars
const JUMP = 6.2 * 6.2 / 40;                                  // single jump apex (m)
const DOUBLE = JUMP + (6.2 * 0.92) ** 2 / 40;                 // double jump apex (m)
const REACH = 1.9;                                            // a star is grabbed up to this far above the feet

for (const [name, L, ceiling] of [['mission1', L1, 4.6], ['mission2', L2, 4.2], ['mission3', L3, 6]]) {
  test(`${name}: ten bonus stars, every one needs a jump and every one is reachable`, () => {
    const cols = L.buildColliders();
    assert.equal(L.STARS.length, 10);
    for (const [x, y, z] of L.STARS) {
      const inCorridor = name === 'mission3' && z < CORRIDOR.maxZ && z > CORRIDOR.minZ;
      assert.ok(y < (inCorridor ? 3.4 : ceiling - 0.3), `star ${x},${z} is below the ceiling`);
      assert.ok(y > REACH + 0.2, `star ${x},${z} cannot be grabbed just by walking`);
      const platform = cols.filter((b) => b.top !== undefined && x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ).reduce((m, b) => Math.max(m, b.top), 0);
      assert.ok(platform <= DOUBLE - 0.2, 'the platform under the star can be climbed with a double jump');
      assert.ok(y < platform + DOUBLE + REACH - 0.1, `star ${x},${y},${z} is reachable (platform ${platform})`);
    }
  });
}

test('there are platforms to jump on in the classroom and the hallway', () => {
  assert.ok(L1.buildColliders().filter((b) => b.top !== undefined).length >= 5);
  assert.ok(L2.buildColliders().filter((b) => b.top !== undefined).length >= 4);
});
