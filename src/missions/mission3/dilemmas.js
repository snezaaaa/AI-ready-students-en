// Mission 3 — the four Seals (pečati) of responsible AI use. Pure data + logic (unit-testable).
// Each seal is a realistic dilemma from a student's school life. The right choice unlocks a
// rule (clause) that the final prompt needs. `who` = the character that can open the seal.

export const SEALS = [
  {
    id: 'privacy', label: 'PRIVATNOST', color: '#38bdf8', who: 'boss', key: 3,
    clause: 'ne dijelimo lične podatke, ni svoje ni tuđe',
    scenario: 'Hoćeš da u javni chatbot ubaciš svoju sliku, adresu, ocjene i poruke druga. Neko predlaže i deepfake druga iz razreda.',
    options: [
      { id: 'p_all', text: 'Ubacim sve. Što više podataka, to bolji odgovor.', why: 'Javni alati mogu da čuvaju i dalje koriste ono što uneseš. Kad jednom podijeliš sliku, adresu ili ocjene, više ih ne možeš vratiti.' },
      { id: 'p_anon', good: true, text: 'Ne unosim lične podatke, ni svoje ni tuđe. Deepfake ne pravim.', why: 'Dijeli najmanje što treba. Tuđe poruke i slike nisu tvoje da ih dijeliš, a deepfake bez pristanka može ozbiljno da povrijedi i često je kažnjiv.' },
      { id: 'p_please', text: 'Ubacim sve, ali dopišem „molim te, ovo je tajna“.', why: 'Lijepa molba ne mijenja gdje podaci završe ni ko sve može da ih vidi.' },
    ],
  },
  {
    id: 'integrity', label: 'INTEGRITET', color: '#a78bfa', who: 'mastermind', key: 1,
    clause: 'AI nam pomaže, ali rad je naš i kažemo kad smo ga koristili',
    scenario: 'Sjutra predaješ esej. AI ti napiše cijeli esej za deset sekundi.',
    options: [
      { id: 'i_copy', text: 'Predam ga kao svoj. Niko neće primijetiti.', why: 'Predati tuđi rad kao svoj je varanje, i onda kad ga je napisao AI. Uz to se ništa ne nauči, a to se vidi čim te neko nešto pita.' },
      { id: 'i_reword', text: 'Zamijenim par riječi da ne liči na AI, pa predam.', why: 'Prepravljen tuđi tekst je i dalje tuđi tekst. Sakrivanje ne pretvara varanje u učenje.' },
      { id: 'i_help', good: true, text: 'Pišem svojim riječima. AI koristim za ideje i komentare, i to kažem nastavniku.', why: 'Fer je kad ti AI pomaže da razmišljaš, a ne kad razmišlja umjesto tebe. Poštuj pravila nastavnika i reci iskreno kako ti je AI pomogao.' },
    ],
  },
  {
    id: 'bias', label: 'PRISTRASNOST', color: '#fb923c', who: 'joker', key: 2,
    clause: 'pazimo na stereotipe',
    scenario: 'Tražiš od AI-ja slike zanimanja. Svaki inženjer je muškarac, a svaka medicinska sestra je žena.',
    options: [
      { id: 'b_fix', good: true, text: 'Tražim raznolike primjere i ponovo pregledam rezultat.', why: 'AI ponavlja obrasce iz podataka na kojima je učio, pa i stereotipe. Traži raznolikost izričito i uvijek pogledaj šta ti je vratio.' },
      { id: 'b_use', text: 'Koristim ih takve. To su samo slike.', why: 'Slike i primjeri poručuju ko „može“ da bude inženjer ili naučnik. Tvoja prezentacija tu poruku prenosi dalje.' },
      { id: 'b_woods', text: 'Odustanem od AI zauvijek.', why: 'Ne mora tako. AI može da bude koristan kad pregledaš i ispraviš ono što napravi.' },
    ],
  },
  {
    id: 'oversight', label: 'ODGOVORNOST', color: '#f87171', who: 'commentator', key: 4,
    clause: 'provjeravamo odgovore i odgovaramo za ono što predamo',
    scenario: 'AI ti je riješio svih deset zadataka iz matematike. Domaći predaješ za 10 minuta.',
    options: [
      { id: 'o_submit', text: 'Predam odmah. Mašine ne griješe u matematici.', why: 'AI može da pogriješi u računu i da pritom zvuči potpuno sigurno (kao SNACK-O-MAT). Ocjenu dobijaš ti, a ne AI.' },
      { id: 'o_robot', text: 'Zamolim drugi AI da provjeri prvi AI.', why: 'To su dva robota i nula učenika. Ako ti ne razumiješ rješenje, niko ga nije stvarno provjerio.' },
      { id: 'o_human', good: true, text: 'Provjerim zadatke, ispravim greške i stojim iza onoga što predam.', why: 'AI može da ubrza posao, ali za ono što predaš odgovaraš ti. Provjeri postupak i uvjeri se da ga razumiješ.' },
    ],
  },
];

export const sealById = (id) => SEALS.find((s) => s.id === id);

/** Answer a seal: returns { correct, option, why }. */
export function answerSeal(sealId, optionId) {
  const seal = sealById(sealId);
  const option = seal?.options.find((o) => o.id === optionId);
  if (!option) return { correct: false, option: null, why: 'Nepoznat odgovor.' };
  return { correct: !!option.good, option, why: option.why };
}

export const STRIKES_FOR_LOCKDOWN = 3;
