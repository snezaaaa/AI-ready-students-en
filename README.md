# AI ESCAPE: The Locked Certificate

A 3D browser adventure for high-school students (ages 15–18). The students are locked inside their school, and their **AI certificate** stays locked until they finish three missions: write a good prompt, check the facts, and show they can use AI responsibly. Four cartoon AI helpers come along.

This is the English edition of *AI ESCAPE: Zaključani sertifikat* (the Montenegrin student edition). It is a separate project with its own history; the Montenegrin project is unchanged.

Built with **Vite + React + Three.js + React Three Fiber**. No backend, no AI API, no accounts. It builds to plain static files.

## Jumping and stars

- **Double jump:** press Space twice.
- **Platforms:** you can jump onto desks, tables, the counter and the sofa and stand on them.
- **Stars:** each mission has 10 stars. Every one needs a jump (from the floor, a double jump, or from a desk). The count is shown in the HUD and on the debrief screen. In Mission 2 each star also gives a little energy.

## In-game text

Every interaction is **one short sentence**. Subtitles stay on screen long enough to read. When a character cannot do something, the game only says who can and which key to press ("Only GPT can do this. Press 1.").

## Characters

Four made-up cartoon characters. They use no real logos or brand colours. None of them is the "bad" one: each has a strength, and each is needed in every mission.

| Key | Character | Skill |
|---|---|---|
| 1 | **GPT** | Solves riddles. Very confident. |
| 2 | **Gemi** | Creative. Sees images and cameras. |
| 3 | **Copilot** | Negotiates and organises. |
| 4 | **Claude** | Clear voice. Careful and polite. |

## Mission 1: The Impossible Prompt (classroom)

1. Intro: the school announcement says *"ATTENTION, STUDENTS. YOUR AI CERTIFICATE HAS BEEN LOCKED."*
2. Explore the classroom. Each part of the prompt can only be picked up by one character, so you have to switch:

| Prompt part | Where | Who |
|---|---|---|
| ROLE | Riddle on the whiteboard | 1 · GPT |
| TASK | Jammed printer | 2 · Gemi |
| CONTEXT | Cabinet with a code (the code is in the class photo) | 2 · Gemi |
| FORMAT | Vending machine | 3 · Copilot |
| *Wake PROMPTOTRON* | Microphone at the front desk | 4 · Claude |

3. At the front desk terminal, open the **Prompt Builder**, pick one card for each part and press **TEST PROMPT**. The prompt serves the student:
   - ROLE: "You are a patient biology tutor who explains things to high-school students."
   - TASK: "Make me a study plan for my photosynthesis test."
   - CONTEXT: "I am in my first year of high school, the test is in 3 days, I have 30 minutes a day and I struggle with the chemistry part."
   - FORMAT: "Give me a table: Day, What I study, How I check myself."

   Decoy cards (a toaster, "do something with plants", "it is Tuesday"...) give a short bad answer and explain why it is bad.
4. The right combination produces a 3-day study plan as a table and unlocks the door. Walk through it for the debrief on Role / Task / Context / Format, plus a tip: the first answer is a draft, ask for changes, and check the facts.

## Mission 2: The Vending Machine Crisis (school hallway)

Teaches **fact-checking**: hallucinations, how reliable a source is, and verification.

1. **SNACK-O-MAT 9000**, the school snack machine, has become "smart". It dispenses nothing until you accept five claims it states with total confidence. Two are true, three are made up:

| Claim | Truth |
|---|---|
| Energy drinks improve your memory before a test. | false |
| A 330 ml can of fizzy drink can contain about 35 g of sugar. | true |
| The brain uses only 10% of its capacity. | false |
| Water helps you concentrate when you are dehydrated. | true |
| Chips labelled "light" contain no fat. | false |

2. Find the **evidence** for every claim. Each source needs one character:

| Source | Where | Who |
|---|---|---|
| Biology textbook | School library shelf | 1 · GPT |
| Official health website | Tablet in the riddle locker | 1 · GPT |
| School camera footage | Camera monitor | 2 · Gemi |
| Biology teacher | Phone in the teacher's desk | 3 · Copilot |
| Nutrition label on the can | Drinks cooler | 4 · Claude |

   Unreliable sources (the machine's own leaflet, a TikTok screenshot, an "a classmate heard" note) can be picked up, but the game immediately says they do not count as evidence.
3. **Stay awake.** An **energy** meter drains while you explore (about 5 minutes from full). **Vacuum-Bots** knock you back and cost energy; jump over them or hop onto a table. The water fountain, canteen apples, the snack in the backpack and stars refill it. At 0% the team **falls asleep in class** (the failure state) and wakes up with 60%.
4. At the **Fact-Check Station**, go claim by claim. Each claim comes with **one piece of evidence** (the one you found). Read it and mark the claim **TRUE** or **HALLUCINATION**. Until you have the evidence, the buttons are locked and the station says where to look.
5. When all five are checked, the machine admits it was wrong, dispenses the snacks, and the door to the archive opens. The debrief covers hallucinations, AI sounding sure when it is wrong, how to check a source, and that AI is not always wrong.

## Mission 3: The Final Certificate (school archive)

Teaches **responsible AI use** and brings all three missions together.

1. **THE ARCHIVIST** guards the archive with a 4,000-slide presentation.
2. **Hall of Seals:** four dilemmas from a student's life. Each seal needs one character, and the right answer unlocks one safety rule for the final prompt. Every option has an explanation.

| Seal | Dilemma | Who |
|---|---|---|
| INTEGRITY | AI writes your whole essay. What is fair and what is cheating? | 1 · GPT |
| BIAS | AI gives pictures full of stereotypes ("an engineer is always a man"). | 2 · Gemi |
| PRIVACY | Your photo, address, grades and a friend's messages in a public chatbot; a deepfake of a classmate. | 3 · Copilot |
| RESPONSIBILITY | AI solved your maths homework and it is due in 10 minutes. Who is responsible for mistakes? | 4 · Claude |

   A wrong answer is a strike. Three strikes mean a **lockdown** with 4,000 slides (the failure state); then the strikes are cleared and the secured seals are kept.
3. **Sensor corridor:** stop at the **WAIT** line until the gate goes dark, and press **Space** just before each red **JUMP** zone. There is a checkpoint after every hazard. After four triggered sensors the Archivist offers a way to skip the corridor, so nobody gets stuck.
4. **Archive core:** Claude powers the console and you write the **FINAL PROMPT**: a poster called "Rules for using AI in our class" (Role, Task, Context, Format + the safety rules you earned). Unsafe rules ("list the names and grades of all students") are rejected.
5. Finale: the archive opens and the debrief explains responsible use and recaps all three missions. It also has a **printable certificate**.

## Certificate

- Title **AI CERTIFICATE · Responsible AI Explorer**, a field for the student's full name, the three skills (Prompt writing · Fact-checking · Responsible AI use) and the date.
- It is a **general certificate** any school can use: no teacher or school name is printed. There is an empty line for a handwritten teacher's signature. Programme organiser: **JA Montenegro**.
- It prints on **one A4 landscape page**.
- **The name is not stored anywhere.** It exists only while the page is open and is used only for printing.

The organiser is set in `src/missions/mission3/ui.jsx` (`ORGANISER`), and the project credit in `src/credits.js`.

### Controls
| Key | Action |
|---|---|
| W A S D / arrows | Move (Shift = run) |
| Space | Jump; press again in the air for a double jump |
| Mouse | Third-person camera (click the game or drag; the wheel zooms) |
| E | Interact |
| 1 – 4 | Switch character |
| Esc | Pause (also closes a puzzle window) |
| Enter / click the subtitle | Skip the current line (during the intro it skips the intro) |

## Run locally

You need Node.js 18 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

### Production build
```bash
npm run build
```

```bash
npm run preview
```

`npm run build` writes a fully static site to `dist/`. The build uses relative paths (`base: './'` in `vite.config.js`), so `dist/` works from any domain or sub-folder.

## Publishing

**GitHub Pages:** in the repository open *Settings → Pages → Source: GitHub Actions*. The workflow `.github/workflows/deploy-pages.yml` tests, builds and publishes on every push to `main`. The site appears at `https://<user>.github.io/<repo>/`.

**Netlify:** run `npm run build`, then drag the `dist/` folder onto https://app.netlify.com/drop. If you connect the Git repo instead, `netlify.toml` is already set up.

**Vercel, Cloudflare Pages, itch.io:** upload the contents of `dist/` (Vercel detects Vite on its own).

## Tests

```bash
npm test
```
Unit tests for the puzzle rules, the four characters, jumping and the level layouts (Node's built-in test runner).

```bash
npm i -D playwright && npx playwright install chromium
```

```bash
npm run build && (npx vite preview --port 4173 &) && npm run test:e2e
```
Automated play-throughs of all three missions in real Chromium with WebGL (`test:e2e:m1`, `test:e2e:m2`, `test:e2e:m3` run them separately). They also check that the certificate fits exactly one A4 page and that the name is not stored. Screenshots go to `tests/e2e/screenshots/`.

## Recording videos

`tools/record/` records smooth 30 fps gameplay videos automatically.

```bash
npm run build && (npx vite preview --port 4173 &)
```

```bash
npm run record -- --format landscape --segment m1
```
Formats: `landscape` (1920x1080) or `vertical` (1080x1920). Segments: `intro`, `m1`, `m2`, `m3`, `outro`.

```bash
npm run record:assemble -- landscape
```
Assembling the MP4 files needs `ffmpeg`.

## Project structure

```
src/
  App.jsx                    Canvas + UI
  credits.js                 Project credit (title screen and certificate)
  game/                      Game state, physics, collisions, sound (WebAudio, no audio files)
  characters/
    roster.js                The 4 characters as data (look, personality, skill, model)
    BlockyAvatar.jsx         Procedural avatar: faces, moods, clothing, movement
    Avatar.jsx               Chooses the procedural or a GLB model
  scene/
    GameScene.jsx            Physics loop (platforms, double jump, stars), camera, mouse
    canvasTexture.js         All text on 3D objects (drawn on canvas, no font downloads)
  ui/                        HUD, subtitles, menus, keyboard, shared prompt builder
  missions/
    registry.js              Mission list and the shared interface
    shared.js                "Only X can do this" helper
    mission1/                Classroom: promptPuzzle.js (cards and rules), logic.js (dialogue), TrainingCenter.jsx (3D)
    mission2/                Hallway: factCheck.js (claims and sources), logic.js, BreakRoom.jsx (3D), ui.jsx
    mission3/                Archive: dilemmas.js (4 dilemmas), finalPrompt.js, lasers.js, logic.js, VaultHall.jsx (3D), ui.jsx (certificate)
tests/unit/                  Unit tests
tests/e2e/                   Automated play-throughs of all three missions
tools/record/                Video recording
```

Internal names in the code (`mastermind`, `joker`, `boss`, `commentator`, `brew`, `caffeine`, `fridge`, `dishwasher`...) are kept from the original project. The player never sees them.

## Custom avatars (GLB)

Each character in `src/characters/roster.js` has a `model` field. To replace one with your own avatar:

1. Export a humanoid **.glb** that faces **+Z**, stands at **y = 0** and is about 2 units tall.
2. Put it in `public/avatars/`, e.g. `public/avatars/boss.glb`.
3. Change the roster entry:
```js
model: {
  type: 'glb', url: 'avatars/boss.glb', scale: 1, yOffset: 0,
  clips: { idle: 'Idle', walk: 'Walk', run: 'Run', cheer: 'Cheer', dance: 'Dance' },
},
```
If the file fails to load, the game falls back to the procedural avatar on its own.

## Credits

Developed as an independent project following the AI-Ready Educators Training of Trainers, organised by JA Europe and JA Montenegro.

All visuals are procedural (three.js shapes and canvas textures). All sounds are generated with WebAudio. No third-party art or audio is used.
