# AI ESCAPE: Zaključani sertifikat

3D avantura u pregledaču za srednjoškolce (15–18 godina). Učenici su zaključani u školi, a njihov **AI sertifikat** ostaje pod ključem dok ne prođu tri misije: napišu dobar prompt, provjere činjenice i pokažu da znaju da koriste AI odgovorno. Pomažu im četiri crtana AI pomoćnika.

Ovo je učenička verzija igre *Dungeons and Deadlines: THE FINAL PROMPT*. Originalni projekat nije mijenjan; ovo je zaseban projekat sa novom istorijom.

Napravljeno pomoću **Vite + React + Three.js + React Three Fiber**. Nema servera, nema AI API-ja, nema naloga. Sve se pretvara u obične statičke fajlove.

## Skakanje i zvjezdice

- **Dupli skok:** pritisni Space dvaput.
- **Platforme:** možeš da skočiš na klupe, stolove, pult i sofu i da stojiš na njima.
- **Zvjezdice:** u svakoj misiji ima 10 zvjezdica. Do svake se dolazi skokom (sa poda, duplim skokom ili sa klupe). Broj se vidi u HUD-u i na završnom ekranu. U Misiji 2 svaka zvjezdica daje i malo energije.

## Tekst u igri

Svaka interakcija ima **jednu kratku rečenicu**, bez šala. Titl ostaje duže na ekranu. Kad lik ne može nešto da uradi, piše samo ko može i koji taster da pritisneš („Ovo može samo GPT. Pritisni 1.“).

## Likovi

Četiri izmišljena crtana lika. Nemaju prave logotipe ni boje kompanija. Nijedan nije „loš“: svaki ima svoju prednost i svaki je potreban u svakoj misiji.

| Taster | Lik | Vještina |
|---|---|---|
| 1 | **GPT** | Rješava zagonetke. Priča puno i jako je samouvjeren. |
| 2 | **Gemi** | Zasmijava mašine, kreativan je, vidi slike i kamere. |
| 3 | **Copilot** | Pregovara sa svime, organizator, voli tabele. |
| 4 | **Claude** | Jasan glas, sve objasni, pažljiv i pristojan. |

## Misija 1: Nemogući prompt (učionica)

1. Uvod: razglas javlja *„PAŽNJA, UČENICI. VAŠ AI SERTIFIKAT JE ZAKLJUČAN.“*
2. Istraži učionicu. Svaki dio prompta može da uzme samo jedan lik, pa moraš da ih mijenjaš:

| Dio prompta | Gdje | Ko |
|---|---|---|
| ULOGA | Zagonetka na tabli | 1 · GPT (rješava zagonetke) |
| ZADATAK | Zaglavljeni štampač | 2 · Gemi (nasmije štampač) |
| KONTEKST | Ormar sa šifrom (šifra je na slici odjeljenja) | 2 · Gemi (vidi slike) |
| FORMAT | Automat | 3 · Copilot (pregovara) |
| *Buđenje PROMPTOTRONA* | Mikrofon na katedri | 4 · Claude (jasan glas) |

3. Na terminalu na katedri otvori **Graditelj prompta**, izaberi po jednu karticu za svaki dio i pritisni **TESTIRAJ PROMPT**. Prompt služi učeniku:
   - ULOGA: „Ti si strpljiv tutor iz biologije koji objašnjava srednjoškolcima.“
   - ZADATAK: „Napravi mi plan učenja za kontrolni iz fotosinteze.“
   - KONTEKST: „Ja sam učenik 1. razreda gimnazije, kontrolni je za 3 dana, imam 30 min dnevno i slabije razumijem hemijski dio.“
   - FORMAT: „Daj tabelu: Dan, Šta učim, Kako se provjerim.“

   Lažne kartice (toster, „uradi nešto sa biljkama“, „kontekst: utorak je“...) daju kratak loš odgovor i objašnjenje zašto je loš.
4. Tačna kombinacija daje plan učenja za 3 dana u tabeli i otključava vrata. Prođi kroz vrata za pobjedu i objašnjenje metode Uloga / Zadatak / Kontekst / Format, uz savjet: prvi odgovor je nacrt, traži doradu i provjeri činjenice.

Računari na klupama i pametna tabla daju kratke savjete.

## Misija 2: Kriza kod automata (školski hodnik)

Uči **provjeru činjenica**: halucinacije, pouzdanost izvora i provjeru.

1. **SNACK-O-MAT 9000**, školski automat za grickalice i sokove, postao je „pametan“. Ne izbacuje ništa dok ne prihvatiš pet tvrdnji koje izgovara potpuno sigurno. Dvije su tačne, tri su izmišljene:

| Tvrdnja | Istina |
|---|---|
| Energetska pića poboljšavaju pamćenje pred kontrolni. | netačno |
| Limenka gaziranog soka od 0,33 l može imati oko 35 g šećera. | tačno |
| Mozak koristi samo 10% svog kapaciteta. | netačno |
| Voda pomaže koncentraciji kad si dehidriran. | tačno |
| Čips sa natpisom „light“ nema masti. | netačno |

2. Pronađi **pouzdan dokaz** za svaku tvrdnju. Svaki izvor otključava jedan lik:

| Izvor | Gdje | Ko |
|---|---|---|
| Udžbenik biologije | Polica školske biblioteke | 1 · GPT |
| Zvanični zdravstveni sajt | Tablet u ormariću sa zagonetkom | 1 · GPT |
| Snimak školske kamere | Monitor kamere | 2 · Gemi |
| Nastavnica biologije | Telefon u katedri | 3 · Copilot |
| Deklaracija na limenci | Durljiva vitrina sa sokovima (treba lijepa riječ) | 4 · Claude |

   Nepouzdani izvori (letak samog SNACK-O-MAT-a, snimak ekrana sa TikToka, ceduljica „drug iz odjeljenja je čuo“) mogu da se pokupe, ali igra odmah kaže da se ne računaju kao dokaz.
3. **Ne zaspi.** Skala **energije** pada dok istražuješ (oko 5 minuta od pune). **Usisivač-Botovi** te odbace i troše energiju. Puni se na česmi, jabukom iz kantine, užinom iz ranca i zvjezdicama. Robota možeš da preskočiš ili da skočiš na sto. Na 0% cijela ekipa **zaspi na času** (neuspjeh), pa se budi sa 60%.
4. Na **Stanici za provjeru** idi tvrdnju po tvrdnju. Uz svaku tvrdnju stoji **jedan dokaz** (onaj koji si pronašao/la). Pročitaj ga i označi: **TAČNO** ili **HALUCINACIJA**. Dok nemaš dokaz, dugmad su zaključana i piše gdje da ga tražiš.
5. Kad je svih pet provjereno, automat priznaje grešku i izbacuje užinu, a vrata ka arhivi se otvaraju. Objašnjenje na kraju: halucinacije, AI zvuči sigurno i kad griješi, kako provjeriti izvor, AI nije uvijek u krivu.

## Misija 3: Konačni sertifikat (školska arhiva)

Uči **odgovornu upotrebu AI** i spaja sve tri misije.

1. **ARHIVAR** čuva arhivu prezentacijom od 4.000 slajdova.
2. **Dvorana pečata:** četiri dileme iz života učenika. Svaki pečat otvara jedan lik, a tačan odgovor otključava jedno zaštitno pravilo za konačni prompt. Svaki odgovor ima objašnjenje.

| Pečat | Dilema | Ko |
|---|---|---|
| INTEGRITET | AI ti napiše cijeli esej za domaći. Šta je fer, a šta varanje? | 1 · GPT |
| PRISTRASNOST | AI daje slike i primjere pune stereotipa („inženjer je uvijek muškarac“). | 2 · Gemi |
| PRIVATNOST | Slika, adresa, ocjene i poruke druga u javnom chatbotu; deepfake druga iz razreda. | 3 · Copilot |
| ODGOVORNOST | AI ti je riješio zadatke iz matematike, a predaješ za 10 minuta. Ko odgovara za greške? | 4 · Claude |

   Pogrešan odgovor je greška. Tri greške znače **vanredni čas** sa 4.000 slajdova (neuspjeh); poslije toga se greške brišu, a osvojeni pečati ostaju.
3. **Hodnik sa senzorima:** stani kod linije **ČEKAJ** dok se kapija ne ugasi i pritisni **Space** tik prije svake crvene zone **SKOČI**. Poslije svake prepreke je kontrolna tačka. Poslije četiri aktivirana senzora Arhivar nudi opravdanje (preskakanje hodnika), da niko ne ostane zaglavljen.
4. **Jezgro arhive:** Claude uključuje konzolu, a ti pišeš **KONAČNI PROMPT**: plakat „Pravila korištenja AI u našem odjeljenju“ (Uloga, Zadatak, Kontekst, Format + zaštitna pravila koja si osvojio/la). Nebezbjedna pravila („napiši imena i ocjene svih učenika“) se odbijaju.
5. Finale: arhiva se otvara, a završni ekran objašnjava odgovornu upotrebu i ponavlja sve tri misije. Tu je i **sertifikat za štampu**.

## Sertifikat

- Naslov **AI SERTIFIKAT · Odgovorni AI istraživač**, polje za ime i prezime učenika/ce, tri savladane vještine (Pisanje prompta · Provjera činjenica · Odgovorna upotreba AI) i datum.
- Potpis: **Snežana Kerndl, nastavnica informatike · JU Srednja ekonomsko-ugostiteljska škola, Bar**. Organizator programa: **JA Montenegro**.
- Štampa se na **A4, položeno, jedna strana**.
- **Ime se nigdje ne čuva.** Postoji samo dok je stranica otvorena i koristi se samo za štampu.

Podaci o potpisu i organizatoru su u `src/missions/mission3/ui.jsx` (`ISSUER`, `ORGANISER`), a tekst o projektu u `src/credits.js`.

### Kontrole
| Taster | Radnja |
|---|---|
| W A S D / strelice | Kretanje (Shift = trčanje) |
| Space | Skok; još jednom u vazduhu = dupli skok |
| Miš | Kamera iz trećeg lica (klikni na igru ili prevuci; točkić zumira) |
| E | Akcija |
| 1 – 4 | Promjena lika |
| Esc | Pauza (zatvara i prozor sa zagonetkom) |
| Enter / klik na titl | Preskače trenutnu rečenicu (u uvodu preskače uvod) |

## Pokretanje na svom računaru

Treba ti Node.js 18 ili noviji.

```bash
npm install
```

```bash
npm run dev
```

Zatim otvori adresu koju Vite ispiše (obično http://localhost:5173).

### Produkciona verzija
```bash
npm run build
```

```bash
npm run preview
```

`npm run build` pravi potpuno statički sajt u folderu `dist/`. Koriste se relativne putanje (`base: './'` u `vite.config.js`), pa `dist/` radi sa bilo kog domena ili podfoldera.

## Objavljivanje

**GitHub Pages:** u repozitorijumu otvori *Settings → Pages → Source: GitHub Actions*. Workflow `.github/workflows/deploy-pages.yml` testira, gradi i objavljuje pri svakom push-u na granu `main`. Sajt je na `https://<korisnik>.github.io/<repo>/`.

**Netlify:** pokreni `npm run build`, pa prevuci folder `dist/` na https://app.netlify.com/drop. Ako povežeš Git repo, `netlify.toml` je već podešen.

**Vercel, Cloudflare Pages, itch.io:** otpremi sadržaj foldera `dist/` (Vercel sam prepozna Vite).

## Testovi

```bash
npm test
```
Unit testovi za pravila zagonetki, četiri lika i raspored nivoa (ugrađeni Node test runner).

```bash
npm i -D playwright && npx playwright install chromium
```

```bash
npm run build && (npx vite preview --port 4173 &) && npm run test:e2e
```
Automatski prelazi sve tri misije u pravom Chromiumu sa WebGL-om (`test:e2e:m1`, `test:e2e:m2`, `test:e2e:m3` pokreću ih posebno). Provjerava i da sertifikat staje na tačno jednu A4 stranu i da se ime ne čuva. Screenshotovi idu u `tests/e2e/screenshots/`.

## Snimanje videa

`tools/record/` automatski snima glatke videe igre u 30 fps.

```bash
npm run build && (npx vite preview --port 4173 &)
```

```bash
npm run record -- --format landscape --segment m1
```
Formati: `landscape` (1920x1080) ili `vertical` (1080x1920). Segmenti: `intro`, `m1`, `m2`, `m3`, `outro`.

```bash
npm run record:assemble -- landscape
```
Za sastavljanje MP4 fajlova treba `ffmpeg`.

## Struktura projekta

```
src/
  App.jsx                    Canvas + UI
  credits.js                 Tekst o projektu (naslovna i sertifikat)
  game/                      Stanje igre, fizika, sudari, zvuk (WebAudio, bez audio fajlova)
  characters/
    roster.js                4 lika kao podaci (izgled, karakter, vještina, model)
    BlockyAvatar.jsx         Proceduralni avatar: lica, raspoloženja, odjeća, pokreti
    Avatar.jsx               Bira proceduralni ili GLB model
  scene/
    GameScene.jsx            Petlja fizike, kamera, miš
    canvasTexture.js         Sav tekst na 3D objektima (crta se na canvasu, bez preuzimanja fontova)
  ui/                        HUD, titlovi, meniji, tastatura, zajednički graditelj prompta
  missions/
    registry.js              Lista misija i zajednički interfejs
    mission1/                Učionica: promptPuzzle.js (kartice i pravila), logic.js (dijalozi), TrainingCenter.jsx (3D)
    mission2/                Hodnik: factCheck.js (tvrdnje i izvori), logic.js, BreakRoom.jsx (3D), ui.jsx
    mission3/                Arhiva: dilemmas.js (4 dileme), finalPrompt.js, lasers.js, logic.js, VaultHall.jsx (3D), ui.jsx (sertifikat)
tests/unit/                  Unit testovi
tests/e2e/                   Automatski prelazi sve tri misije
tools/record/                Snimanje videa
```

Interna imena u kodu (`mastermind`, `joker`, `boss`, `commentator`, `brew`, `caffeine`, `fridge`, `dishwasher`...) ostala su iz originalnog projekta. Igrač ih ne vidi.

## Sopstveni avatari (GLB)

Svaki lik u `src/characters/roster.js` ima polje `model`. Da ga zamijeniš svojim avatarom:

1. Izvezi humanoidni **.glb** koji gleda prema **+Z**, stoji na **y = 0** i visok je oko 2 jedinice.
2. Stavi ga u `public/avatars/`, npr. `public/avatars/boss.glb`.
3. Promijeni unos u rosteru:
```js
model: {
  type: 'glb', url: 'avatars/boss.glb', scale: 1, yOffset: 0,
  clips: { idle: 'Idle', walk: 'Walk', run: 'Run', cheer: 'Cheer', dance: 'Dance' },
},
```
Ako fajl ne može da se učita, igra se sama vraća na proceduralni avatar.

## Zasluge

Razvijeno kao samostalan projekat nakon obuke trenera „AI-Ready Educators“, u organizaciji JA Europe i JA Montenegro.

Sva grafika je proceduralna (three.js oblici i canvas teksture). Svi zvukovi nastaju u WebAudio. Nema tuđih grafičkih ni zvučnih materijala.
