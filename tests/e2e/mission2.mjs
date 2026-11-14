// End-to-end play-through of Mission 2 (The Vending Machine Crisis) in headless Chromium with WebGL.
// Usage: npm run build && (npx vite preview --port 4173 &) && npm run test:e2e:m2
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright'); // install with: npm i -D playwright

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const SHOTS = process.env.SHOTS || 'tests/e2e/screenshots';
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const st = () => page.evaluate(() => { const s = window.__game.useGame.getState(); return { phase: s.phase, missionId: s.missionId, active: s.active, inventory: s.inventory, attempts: s.attempts, builderOpen: s.builderOpen, doorOpen: s.doorOpen, ms: s.ms, line: s.dialogue.current?.text || '' }; });
const pos = (i) => page.evaluate((i) => { const c = window.__world.chars[i]; return { x: c.x, z: c.z }; }, i);
const teleport = (i, x, z, yaw) => page.evaluate(([i, x, z, yaw]) => { const c = window.__world.chars[i]; c.x = x; c.z = z; c.vx = c.vz = 0; if (yaw !== undefined) window.__world.cam.yaw = yaw; }, [i, x, z, yaw]);
const patchMs = (patch) => page.evaluate((p) => window.__game.useGame.getState().patchMs(p), patch);
const parkBots = () => page.evaluate(() => window.__bots.forEach((b, i) => { b.x = -6.5; b.z = i ? 3.9 : -4.6; b.seg = 0; }));
const wait = (ms) => page.waitForTimeout(ms);
const hold = async (key, ms) => { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); };
const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });
const waitFor = async (fn, timeout = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await fn(await st())) return true; await wait(200); } return false; };
const advanceUntil = async (phase, max = 12) => { for (let i = 0; i < max && (await st()).phase !== phase; i++) { await page.keyboard.press('Enter'); await wait(450); } return (await st()).phase === phase; };

await page.goto(BASE);
await page.waitForSelector('[data-testid=start]', { timeout: 60000 });
await page.click('[data-testid=select-mission2]');
await wait(300);
check('mission select shows Mission 2', /START MISSION 2/.test(await page.textContent('[data-testid=start]')));
await shot('m2-01-title-select');

// ---- intro
await page.click('[data-testid=start]');
await wait(2600);
const ann = await page.textContent('[data-testid=announcement]').catch(() => '');
check('Mission 2 cinematic announcement', /THE SNACK MACHINE IS OUT OF CONTROL/.test(ann), JSON.stringify(ann));
await shot('m2-02-intro');
await wait(5500); await shot('m2-03-intro-brew');
await page.keyboard.press('Enter');
check('intro skippable -> playing in the school hallway', await waitFor((s) => s.phase === 'playing' && s.missionId === 'mission2', 5000));
let s = await st();
check('the leaflet (unreliable source) is handed over', s.inventory.includes('brochure'));
check('energy meter in HUD', await page.isVisible('[data-testid=caffeine]') && /ENERGY/.test(await page.textContent('[data-testid=caffeine]')));
await wait(1200); await shot('m2-04-gameplay');

// ---- movement still works here
const p0 = await pos(0);
await hold('KeyW', 900);
const p1 = await pos(0);
check('movement works in the hallway', Math.hypot(p1.x - p0.x, p1.z - p0.z) > 1.5);

// ---- caffeine drains over time
const c0 = (await st()).ms.caffeine;
await wait(3000);
const c1 = (await st()).ms.caffeine;
check('energy drains while exploring', c1 < c0, `${c0.toFixed(1)} -> ${c1.toFixed(1)}`);

// ---- Mop-Bot collision
const bot = await page.evaluate(() => ({ x: window.__bots[0].x, z: window.__bots[0].z }));
const before = (await st()).ms;
await teleport(0, bot.x + 0.3, bot.z);
check('a vacuum robot knocks you back and drains energy', await waitFor((s) => s.ms.bumps > before.bumps, 3000));
s = await st();
check('bump costs energy', s.ms.caffeine < before.caffeine - 5, `${before.caffeine.toFixed(1)} -> ${s.ms.caffeine.toFixed(1)}`);
await wait(900);

// ---- before any evidence: the station shows what to look for, verdicts are locked
await parkBots();
await teleport(0, -3.4, 0); await wait(300);
await page.keyboard.press('KeyE'); await wait(500);
check('without evidence the verdict buttons are locked and the station says where to look', await page.isDisabled('[data-testid=verdict-c1-true]') && /Official health website/.test(await page.textContent('[data-testid=evidence-missing-c1]')));
await page.keyboard.press('Escape'); await wait(300);

// ---- wrong character, then each character's evidence
await parkBots();
await page.keyboard.press('Digit2'); await wait(250);
await teleport(1, 8.5, -3.5); await wait(300);
await page.keyboard.press('KeyE'); await wait(400);
s = await st();
check('wrong character cannot use the bookshelf', !s.inventory.includes('textbook') && /Only GPT can do this/.test(s.line), s.line.slice(0, 50));

const plan = [
  ['Digit1', 0, [8.5, -3.5], 'textbook', 'GPT / biology textbook on the library shelf'],
  ['Digit4', 3, [8.15, 5], 'label', 'Claude / sulking drinks cooler (can label)'],
  ['Digit3', 2, [6, -5.5], 'teacher', 'Copilot / biology teacher (phone in the desk)'],
  ['Digit2', 1, [-6, -6.3], 'cctv', 'Gemi / school camera footage'],
  ['Digit1', 0, [-3, 6.3], 'health', 'GPT / riddle locker with the health site'],
];
for (const [key, idx, spot, src, label] of plan) {
  await parkBots();
  await page.keyboard.press(key); await wait(250);
  await teleport(idx, ...spot); await wait(300);
  await page.keyboard.press('KeyE'); await wait(500);
  check(`${label} -> ${src}`, (await st()).inventory.includes(src));
  if (src === 'label') { await wait(600); await shot('m2-05-evidence-toast'); }
}
check('tablet locker rolled aside (collider swapped)', await page.evaluate(() => window.__world.colliders.find((c) => c.id === 'dishwasher').enabled === false));
await parkBots();
await teleport(0, 4, 7.0); await wait(300);
await page.keyboard.press('KeyE'); await wait(400);
check('decoy TikTok screenshot can be picked up', (await st()).inventory.includes('tiktok'));
await parkBots();
await teleport(0, 2.2, -3.9); await wait(300);
await page.keyboard.press('KeyE'); await wait(400);
check('decoy "a classmate heard" note can be picked up', (await st()).inventory.includes('rumor'));

// ---- snacks refill energy
await patchMs({ caffeine: 20 });
await parkBots();
await teleport(0, 2, 3.8); await wait(300);
await page.keyboard.press('KeyE'); await wait(400);
s = await st();
check('canteen apple refills energy (+30)', s.ms.caffeine >= 49 && s.ms.donuts === 2, `energy=${s.ms.caffeine.toFixed(1)} apples=${s.ms.donuts}`);
await parkBots();
await teleport(0, 8.55, 1.2); await wait(300);
const e0 = (await st()).ms.caffeine;
await page.keyboard.press('KeyE'); await wait(300);
check('water fountain refills a little energy', (await st()).ms.caffeine > e0 + 2);
await teleport(0, -8.1, -2.9); await wait(300);
const e1 = (await st()).ms.caffeine;
await page.keyboard.press('KeyE'); await wait(300);
check('snack from the backpack refills energy (+10)', (await st()).ms.caffeine > e1 + 8);

// ---- failure state: energy runs out -> asleep in class
await patchMs({ caffeine: 0.4 });
check('energy at 0 triggers the asleep-in-class failure state', await waitFor((s) => s.ms.napping && s.phase === 'cutscene', 4000));
await wait(600);
check('nap overlay shown', await page.isVisible('[data-testid=nap-overlay]') && /YOU FELL ASLEEP IN CLASS/.test(await page.textContent('[data-testid=nap-overlay]')));
await shot('m2-06-nap');
check('wake up after the nap with 60% energy', await advanceUntil('playing'));
s = await st();
check('nap counted and energy restored', s.ms.naps === 1 && Math.round(s.ms.caffeine) >= 58, `naps=${s.ms.naps} energy=${s.ms.caffeine.toFixed(1)}`);

// ---- the fact-check
await parkBots();
await teleport(0, -3.4, 0); await wait(300);
await page.keyboard.press('KeyE'); await wait(500);
check('fact-check station opens', (await st()).builderOpen && await page.isVisible('[data-testid=fact-checker]'));
const answer = async (claim, verdict) => {
  await page.click(`[data-testid=claim-tab-${claim}]`);
  await page.click(`[data-testid=verdict-${claim}-${verdict}]`);
};
check('submit is locked until all 5 claims are answered', await page.isDisabled('[data-testid=submit-factcheck]'));
check('each claim shows exactly one piece of evidence and no source choice', (await page.$$('.evidence')).length === 1 && (await page.$$('.source')).length === 0 && /Official health website/.test(await page.textContent('[data-testid=evidence-c1]')));
check('only two answers: TRUE or HALLUCINATION', (await page.$$('.verdict')).length === 2 && /HALLUCINATION/.test(await page.textContent('[data-testid=verdict-c1-false]')));
await answer('c1', 'true');   // wrong on purpose: the evidence says the opposite
await answer('c2', 'true');
await answer('c3', 'false');
await answer('c4', 'true');
await answer('c5', 'false');
check('submit unlocks once every claim is answered', !(await page.isDisabled('[data-testid=submit-factcheck]')));
await page.click('[data-testid=claim-tab-c1]');
await shot('m2-07-factcheck');
await page.click('[data-testid=submit-factcheck]');
await page.waitForSelector('.ai-output.fail', { timeout: 6000 });
await wait(1500);
s = await st();
check('a wrong verdict is rejected', s.attempts === 1 && !s.doorOpen && s.ms.brewMood === 'gloating');
check('the failure highlights the wrong claim', (await page.$$('.claim-tab.bad')).length === 1 && await page.isVisible('.claim-tab.bad[data-testid=claim-tab-c1]'));
await shot('m2-08-factcheck-fail');
await page.click('[data-testid=claim-tab-c1]');
await page.click('[data-testid=verdict-c1-false]');
await page.click('[data-testid=submit-factcheck]');
await page.waitForSelector('.ai-output.success', { timeout: 6000 });
await wait(2500); await shot('m2-09-factcheck-success');
const out2 = await page.evaluate(() => window.__game.useGame.getState().lastResult?.output || '');
check('report lists 2 true claims and 3 hallucinations', (out2.match(/HALLUCINATION/g) || []).length === 3 && (out2.match(/TRUE /g) || []).length === 2);
check('correct fact-check grounds SNACK-O-MAT -> cutscene', await waitFor((s) => s.phase === 'cutscene' && s.doorOpen, 9000));
await wait(2500); await shot('m2-10-grounded');
check('back to gameplay after the cutscene', await advanceUntil('playing'));

// ---- through the door to the archive
const a = (await st()).active;
await teleport(a, 0, -6.2, 0);
await hold('KeyW', 2400);
check('walking into the archive antechamber triggers victory', await waitFor((s) => s.phase === 'victory', 4000), JSON.stringify(await pos(a)));
await wait(2500); await shot('m2-11-victory');
check('mission 2 complete screen', await advanceUntil('complete'));
await wait(600);
const txt = await page.textContent('[data-testid=complete-screen]');
check('debrief: 66% certificate + fact-checking lesson', /66%/.test(txt) && /hallucinations/i.test(txt) && /MISSION 2 COMPLETE/.test(txt) && /AI IS NOT ALWAYS WRONG/.test(txt));
await shot('m2-12-complete');
check('debrief offers "Continue to Mission 3"', /Mission 3/.test(await page.textContent('[data-testid=next-mission]').catch(() => '')));

const real = errors.filter((e) => !/GPU stall|WebGL|AudioContext/i.test(e));
check('no runtime errors in console', real.length === 0, real.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
