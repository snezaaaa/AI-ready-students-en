// End-to-end play-through of Mission 1 in a real (headless) Chromium with WebGL.
// Usage: npm run build && npx vite preview --port 4173 &  then  npm run test:e2e
// Optional: BASE_URL=http://localhost:5173 SHOTS=./shots node tests/e2e/playthrough.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // install with: npm i -D playwright
import fs from 'node:fs';

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

const st = () => page.evaluate(() => { const s = window.__game.useGame.getState(); return { phase: s.phase, active: s.active, inventory: s.inventory, flags: s.flags, attempts: s.attempts, builderOpen: s.builderOpen, doorOpen: s.doorOpen, paused: s.paused, nearby: s.nearby, line: s.dialogue.current?.text || '' }; });
const pos = (i) => page.evaluate((i) => { const c = window.__world.chars[i]; return { x: c.x, z: c.z }; }, i);
const teleport = (i, x, z, yaw) => page.evaluate(([i, x, z, yaw]) => { const c = window.__world.chars[i]; c.x = x; c.z = z; c.vx = c.vz = 0; if (yaw !== undefined) window.__world.cam.yaw = yaw; }, [i, x, z, yaw]);
const wait = (ms) => page.waitForTimeout(ms);
const hold = async (key, ms) => { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); };
const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });
const waitPhase = async (p, timeout = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if ((await st()).phase === p) return true; await wait(200); } return false; };

await page.goto(BASE);
await page.waitForSelector('[data-testid=start]', { timeout: 60000 });
check('title screen shows the project credit', /u organizaciji JA Europe i JA Montenegro/.test(await page.textContent('[data-testid=project-credit]').catch(() => '')));
check('page title is the student edition', /AI ESCAPE: Zaključani sertifikat/.test(await page.title()));
const titleTxt = await page.textContent('.screen.title');
check('title screen: four characters, keys 1-4', (await page.$$('.lineup-card')).length === 4 && ['GPT', 'Gemi', 'Copilot', 'Claude'].every((n) => titleTxt.includes(n)) && /promjena lika/.test(titleTxt));
check('loading screen -> title screen', true);
await wait(800); await shot('01-title');

// ---- cinematic intro
await page.click('[data-testid=start]');
await wait(2600);
const ann = await page.textContent('[data-testid=announcement]').catch(() => '');
check('cinematic announcement shows', /PAŽNJA, UČENICI/.test(ann), JSON.stringify(ann));
await shot('02-intro-announcement');
await wait(7000); await shot('03-intro-shot');
await page.keyboard.press('Enter');  // skip
check('intro can be skipped -> playing', await waitPhase('playing', 5000));
await wait(800); await shot('04-gameplay');

// ---- movement + collision
const p0 = await pos(0);
await hold('KeyW', 1000);
const p1 = await pos(0);
check('WASD moves the character', Math.hypot(p1.x - p0.x, p1.z - p0.z) > 2, `moved ${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2)}m`);
await teleport(0, 0, 6, 0); // aisle, then walk south into the wall
await page.evaluate(() => { window.__world.cam.yaw = Math.PI; }); // forward = +z
await hold('KeyW', 2500);
const p2 = await pos(0);
check('walls block movement', p2.z <= 9 - 0.41 && p2.z > 7.5, `z=${p2.z.toFixed(2)}`);
await page.keyboard.press('Space');
let yJump = 0;
for (let i = 0; i < 12; i++) { yJump = Math.max(yJump, await page.evaluate(() => window.__world.chars[0].y)); await wait(50); }
check('jump works', yJump > 0.1, `y=${yJump.toFixed(2)}`);
// ---- double jump, standing on a desk, bonus star
await wait(900);
await page.keyboard.press('Space'); await wait(260); await page.keyboard.press('Space');
let yDouble = 0;
for (let i = 0; i < 14; i++) { yDouble = Math.max(yDouble, await page.evaluate(() => window.__world.chars[0].y)); await wait(40); }
check('double jump goes higher than a single jump', yDouble > 1.25, `y=${yDouble.toFixed(2)}`);
await wait(900);
await page.evaluate(() => { const c = window.__world.chars[0]; c.x = -2; c.z = 0; c.y = 1.2; c.vy = 0; c.vx = c.vz = 0; c.grounded = false; });
await wait(700);
const onDesk = await page.evaluate(() => { const c = window.__world.chars[0]; return { y: c.y, grounded: c.grounded }; });
check('you can stand on a desk (platform)', Math.abs(onDesk.y - 0.82) < 0.02 && onDesk.grounded, JSON.stringify(onDesk));
await page.keyboard.press('Space'); await wait(600);
check('jumping from the desk grabs the star above it', (await page.evaluate(() => window.__game.useGame.getState().stars.length)) === 1 && /1\/10/.test(await page.textContent('[data-testid=stars]')));
await wait(700); await shot('04b-on-desk-star');

// ---- character switching
await page.keyboard.press('Digit3');
await wait(300);
check('key 3 switches to Copilot', (await st()).active === 2);
await page.keyboard.press('Digit5'); await wait(200);
check('key 5 does nothing (only four characters)', (await st()).active === 2 && (await page.$$('.char-btn')).length === 4);

// ---- interactions: wrong character first, then right one
const spots = { whiteboard: [-5, 7.6], printer: [9.5, -6.5], vending: [9.75, 3.6], cabinet: [10.1, -1.5], lectern: [-7.9, 0] };
await teleport(2, ...spots.whiteboard);
await wait(300);
check('interact prompt appears near object', !!(await st()).nearby, JSON.stringify((await st()).nearby));
await shot('05-interact-prompt');
await page.keyboard.press('KeyE');
await wait(400);
let s = await st();
check('wrong character cannot solve the riddle: one short line that names who can', s.inventory.length === 0 && /Ovo može samo GPT\. Pritisni 1\./.test(s.line), s.line.slice(0, 60));

const plan = [['Digit1', 0, 'whiteboard', 'role'], ['Digit2', 1, 'printer', 'task'], ['Digit3', 2, 'vending', 'format'], ['Digit2', 1, 'cabinet', 'context']];
for (const [key, idx, obj, slot] of plan) {
  await page.keyboard.press(key); await wait(250);
  await teleport(idx, ...spots[obj]); await wait(300);
  await page.keyboard.press('KeyE'); await wait(500);
  s = await st();
  check(`${obj} gives ${slot.toUpperCase()} component`, s.inventory.includes(slot));
  if (slot === 'task') await shot('06-pickup-toast');
}

// ---- terminal: needs Claude (key 4)
await page.keyboard.press('Digit1'); await wait(200);
await teleport(0, ...spots.lectern); await wait(300);
await page.keyboard.press('KeyE'); await wait(300);
check('terminal refuses everyone but Claude', !(await st()).flags.terminalOn);
await page.keyboard.press('Digit4'); await wait(200);
await teleport(3, ...spots.lectern); await wait(300);
await page.keyboard.press('KeyE'); await wait(400);
check('Claude wakes PROMPTOTRON', !!(await st()).flags.terminalOn);
await wait(1500); await shot('07-terminal-awake');
await page.keyboard.press('KeyE'); await wait(400);
check('prompt builder opens', (await st()).builderOpen);

// ---- pause
await page.keyboard.press('Escape'); await wait(200);
check('Esc closes builder', !(await st()).builderOpen);
await page.keyboard.press('Escape'); await wait(500);
check('Esc pauses', (await st()).paused);
await shot('08-pause');
await page.keyboard.press('Escape'); await wait(300);
check('Esc resumes', !(await st()).paused);
await page.keyboard.press('KeyE'); await wait(400);

// ---- failure state
for (const id of ['role_toaster', 'task_good', 'context_good', 'format_good']) await page.click(`[data-testid=card-${id}]`);
await page.click('[data-testid=test-prompt]');
await page.waitForSelector('.ai-output.fail', { timeout: 5000 });
await wait(1800);
s = await st();
check('bad prompt is rejected (failure state)', s.attempts === 1 && !s.doorOpen);
await shot('09-prompt-fail');

// ---- success
await page.click('[data-testid=card-role_good]');
await page.click('[data-testid=test-prompt]');
await page.waitForSelector('.ai-output.success', { timeout: 5000 });
await wait(2000); await shot('10-prompt-success');
const out1 = await page.evaluate(() => window.__game.useGame.getState().lastResult?.output || '');
check('success output is a 3-day study plan table', /PLAN UČENJA/.test(out1) && /Kako se provjerim/.test(out1) && /\| 3 /.test(out1));
check('good prompt accepted -> door cutscene', await waitPhase('cutscene', 8000));
await wait(2500); await shot('11-door-cutscene');
check('door is open', (await st()).doorOpen);
for (let i = 0; i < 8 && (await st()).phase === 'cutscene'; i++) { await page.keyboard.press('Enter'); await wait(400); }
check('back to gameplay after cutscene', await waitPhase('playing', 15000));

// ---- walk through the door for the victory
const a = (await st()).active;
await teleport(a, 0, -6.5, 0);
await hold('KeyW', 2600);
check('walking through the door triggers victory', await waitPhase('victory', 4000), JSON.stringify(await pos(a)));
await wait(2500); await shot('12-victory');
for (let i = 0; i < 8 && (await st()).phase === 'victory'; i++) { await page.keyboard.press('Enter'); await wait(400); }
check('mission complete screen with lesson', await waitPhase('complete', 10000));
await wait(600); await shot('13-complete');
const dtxt = await page.textContent('[data-testid=complete-screen]');
check('debrief is in Montenegrin: 33% + the four ingredients', /33%/.test(dtxt) && /MISIJA 1 ZAVRŠENA/.test(dtxt) && /ULOGA/.test(dtxt) && /prvi odgovor je samo nacrt/.test(dtxt) && /Zvjezdice: \d+\/10/.test(dtxt));
check('debrief offers "Nastavi na Misiju 2"', /Nastavi na Misiju 2/.test(await page.textContent('[data-testid=next-mission]').catch(() => '')));

// ---- responsive: small viewport loading/title
const mobile = await browser.newPage({ viewport: { width: 390, height: 780 } });
await mobile.goto(BASE);
await mobile.waitForSelector('[data-testid=start]', { timeout: 60000 });
await mobile.screenshot({ path: `${SHOTS}/14-title-mobile.png` });
check('title renders at phone width', true);

const real = errors.filter((e) => !/GPU stall|WebGL|AudioContext/i.test(e));
check('no runtime errors in console', real.length === 0, real.slice(0, 3).join(' | '));
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
