import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROJECT_CREDIT } from '../../credits.js';
import { useGame } from '../../game/store.js';
import { ROSTER } from '../../characters/roster.js';
import PromptBuilderBase from '../../ui/PromptBuilderBase.jsx';
import { SEALS, sealById, STRIKES_FOR_LOCKDOWN } from './dilemmas.js';
import { SLOTS, CARDS, isFinalCardAvailable, assembleFinal } from './finalPrompt.js';
import { chooseSealOption, closeModal, testFinalPrompt, startVaultSequence } from './logic.js';

// ---------------------------------------------------------------- modal switch
export function VaultPuzzle() {
  const modal = useGame((s) => s.ms.modal);
  if (modal === 'seal') return <SealDilemma />;
  if (modal === 'final') return <FinalPromptBuilder />;
  return null;
}

function SealDilemma() {
  const sealId = useGame((s) => s.ms.seal);
  const wrong = useGame((s) => s.ms.wrongPicks?.[sealId]) || [];
  const last = useGame((s) => s.ms.lastAnswer);
  const strikes = useGame((s) => s.ms.strikes);
  const solved = useGame((s) => s.inventory.includes(sealId));
  const seal = sealById(sealId);
  if (!seal) return null;
  const owner = ROSTER.find((c) => c.id === seal.who);
  return (
    <div className="builder-wrap" data-testid="seal-dilemma">
      <div className="builder seal" style={{ '--c': seal.color }}>
        <div className="builder-head">
          <div>
            <div className="builder-title" style={{ color: seal.color }}>PEČAT: {seal.label} <span>// odgovara {owner.name}</span></div>
            <div className="builder-sub">Izaberi najodgovorniji postupak. Greške: <b>{strikes}/{STRIKES_FOR_LOCKDOWN}</b></div>
          </div>
          <button className="btn small" onClick={closeModal} data-testid="builder-close">✕ Zatvori (Esc)</button>
        </div>
        <div className="scenario">📋 {seal.scenario}</div>
        <div className="options">
          {seal.options.map((o, i) => {
            const isWrong = wrong.includes(o.id);
            const isRight = solved && o.good;
            return (
              <button key={o.id} data-testid={`opt-${o.id}`} disabled={solved || isWrong}
                className={`option ${isWrong ? 'wrong' : ''} ${isRight ? 'right' : ''}`}
                onClick={() => chooseSealOption(seal.id, o.id)}>
                <span className="opt-letter">{'ABC'[i]}</span> {o.text}
                {(isWrong || isRight) && <small>{o.why}</small>}
              </button>
            );
          })}
        </div>
        {last && (
          <div className={`ai-output ${last.correct ? 'success' : 'fail'}`} data-testid="seal-result">
            <div className="ai-head">{last.correct ? `✅ PEČAT OSVOJEN — otključano pravilo: „${seal.clause}“` : '❌ GREŠKA — Arhivar je oduševljen'}</div>
            <pre>{last.why}</pre>
          </div>
        )}
        {solved && <div className="builder-foot"><button className="btn primary big" onClick={closeModal} data-testid="seal-continue">Nastavi ▸</button></div>}
      </div>
    </div>
  );
}

function FinalPromptBuilder() {
  return (
    <PromptBuilderBase
      theme="gold"
      title="KONAČNI PROMPT" tag="// plakat „Pravila korištenja AI u našem odjeljenju“"
      subtitle="Izaberi po jednu karticu u svakoj koloni. Zaštitna pravila si osvojio/la kod pečata."
      slots={SLOTS} cards={CARDS}
      isAvailable={isFinalCardAvailable}
      lockedText={() => 'Osvoji sva četiri pečata da otključaš zaštitna pravila'}
      assemble={assembleFinal}
      onTest={testFinalPrompt} onSuccess={startVaultSequence}
      testLabel="📡 POŠALJI KONAČNI PROMPT" thinkingLabel="ARHIVAR OCJENJUJE…" successFoot="Otvaram arhivu…"
      successDelay={5200}
    />
  );
}

// ---------------------------------------------------------------- HUD + overlays
export function StrikesHud() {
  const strikes = useGame((s) => s.ms.strikes ?? 0);
  const zaps = useGame((s) => s.ms.zaps ?? 0);
  return (
    <div className="strikes" data-testid="strikes">
      <span>⚠ GREŠKE</span>
      {Array.from({ length: STRIKES_FOR_LOCKDOWN }, (_, i) => <i key={i} className={i < strikes ? 'on' : ''} />)}
      <span className="zaps">⚡ Senzori: {zaps}</span>
    </div>
  );
}

export function LockdownOverlay() {
  const lockdown = useGame((s) => s.ms.lockdown);
  const [n, setN] = useState(1);
  useEffect(() => {
    if (!lockdown) return;
    setN(1);
    const id = setInterval(() => setN((x) => x + 7 + Math.floor(Math.random() * 30)), 180);
    return () => clearInterval(id);
  }, [lockdown]);
  if (!lockdown) return null;
  const titles = ['Pravila arhive', 'Pravila arhive, nastavak', 'Još pravila', 'Pravila o pravilima'];
  return (
    <div className="lockdown" data-testid="lockdown-overlay">
      <div className="slide">
        <small>VANREDNI ČAS ODJELJENSKE ZAJEDNICE</small>
        <h2>{titles[Math.floor(n / 37) % titles.length]}</h2>
        <div className="bullets"><i /><i /><i /></div>
        <span>SLAJD {Math.min(n, 4000)} OD 4.000</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- finale extras on the debrief
// Certificate details. The student's name lives only in component state: it is never stored
// (no localStorage, no network) and is used for printing only.
export const ORGANISER = 'JA Montenegro';
export const ISSUER = { name: 'Snežana Kerndl', role: 'nastavnica informatike', school: 'JU Srednja ekonomsko-ugostiteljska škola, Bar' };
export const SKILLS = ['Pisanje prompta', 'Provjera činjenica', 'Odgovorna upotreba AI'];

function Certificate({ name, date, testId }) {
  return (
    <div className="certificate" data-testid={testId}>
      <div className="cert-top">AI ESCAPE · ZAKLJUČANI SERTIFIKAT</div>
      <div className="cert-title">AI SERTIFIKAT</div>
      <div className="cert-course">ODGOVORNI AI ISTRAŽIVAČ</div>
      <div className="cert-small">Ovaj sertifikat dobija</div>
      <div className="cert-name">{name.trim() || 'Ime i prezime'}</div>
      <div className="cert-small">za uspješno završene tri misije i savladane vještine:</div>
      <div className="cert-skills">{SKILLS.join(' · ')}</div>
      <div className="cert-organiser">Organizator programa: <b>{ORGANISER}</b></div>
      <div className="cert-foot">
        <span className="cert-sign"><i />Datum: {date}</span>
        <span className="seal">✦</span>
        <span className="cert-sign"><i />{ISSUER.name}, {ISSUER.role}<br /><small>{ISSUER.school}</small></span>
      </div>
      <div className="cert-credit" data-testid="cert-credit">{PROJECT_CREDIT}</div>
    </div>
  );
}

/** Print: a dedicated, page-sized copy under <body> is the only thing printed (A4 landscape, one page). */
function printCertificate() {
  window.print();
}

const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
export const formatDate = (d) => `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;

export function Finale() {
  const [name, setName] = useState('');
  const date = formatDate(new Date());
  return (
    <div className="finale">
      <Certificate name={name} date={date} testId="certificate" />
      {createPortal(<div id="print-certificate"><Certificate name={name} date={date} testId="print-certificate" /></div>, document.body)}
      <div className="cert-controls">
        <label>Ime i prezime učenika/ce <input data-testid="cert-name" value={name} maxLength={40} placeholder="Upiši ime i prezime" autoComplete="off" onChange={(e) => setName(e.target.value)} /></label>
        <button className="btn" data-testid="print-a4" onClick={printCertificate}>🖨 Štampaj (A4, položeno)</button>
      </div>
      <p className="muted cert-note">Ime se nigdje ne čuva. Koristi se samo za štampu ovog sertifikata.</p>
      <h3>🎓 Cijela igra u tri reda</h3>
      <div className="recap">
        <div><b>Misija 1 · Napiši dobro</b><span>Uloga + Zadatak + Kontekst + Format.</span></div>
        <div><b>Misija 2 · Provjeri</b><span>AI može da halucinira. Provjeri tvrdnje u pouzdanim, nezavisnim izvorima.</span></div>
        <div><b>Misija 3 · Koristi odgovorno</b><span>Čuvaj lične podatke, radi svojom glavom, pazi na stereotipe i stoj iza onoga što predaš.</span></div>
      </div>
      <div className="credits">
        <b>ULOGE</b>
        {ROSTER.map((c) => <span key={c.id} style={{ color: c.color }}>{c.name}</span>)}
        <b>U OSTALIM ULOGAMA</b>
        <span>PROMPTOTRON 3000 · SNACK-O-MAT 9000 · ARHIVAR · Usisivač-Botovi</span>
      </div>
    </div>
  );
}

export const SEAL_HUD = SEALS;
