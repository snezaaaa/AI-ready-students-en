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
            <div className="builder-title" style={{ color: seal.color }}>SEAL: {seal.label} <span>// answered by {owner.name}</span></div>
            <div className="builder-sub">Choose the most responsible action. Strikes: <b>{strikes}/{STRIKES_FOR_LOCKDOWN}</b></div>
          </div>
          <button className="btn small" onClick={closeModal} data-testid="builder-close">✕ Close (Esc)</button>
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
            <div className="ai-head">{last.correct ? `✅ SEAL SECURED — rule unlocked: "${seal.clause}"` : '❌ STRIKE — read why below'}</div>
            <pre>{last.why}</pre>
          </div>
        )}
        {solved && <div className="builder-foot"><button className="btn primary big" onClick={closeModal} data-testid="seal-continue">Continue ▸</button></div>}
      </div>
    </div>
  );
}

function FinalPromptBuilder() {
  return (
    <PromptBuilderBase
      theme="gold"
      title="THE FINAL PROMPT" tag="// poster: Rules for using AI in our class"
      subtitle="Pick one card in each column. You earned the safety rules at the seals."
      slots={SLOTS} cards={CARDS}
      isAvailable={isFinalCardAvailable}
      lockedText={() => 'Secure all four seals to unlock the safety rules'}
      assemble={assembleFinal}
      onTest={testFinalPrompt} onSuccess={startVaultSequence}
      testLabel="📡 SEND THE FINAL PROMPT" thinkingLabel="THE ARCHIVIST IS JUDGING…" successFoot="Opening the archive…"
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
      <span>⚠ STRIKES</span>
      {Array.from({ length: STRIKES_FOR_LOCKDOWN }, (_, i) => <i key={i} className={i < strikes ? 'on' : ''} />)}
      <span className="zaps">⚡ Sensors: {zaps}</span>
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
  const titles = ['Archive rules', 'Archive rules, continued', 'More rules', 'Rules about rules'];
  return (
    <div className="lockdown" data-testid="lockdown-overlay">
      <div className="slide">
        <small>EXTRA HOMEROOM LESSON</small>
        <h2>{titles[Math.floor(n / 37) % titles.length]}</h2>
        <div className="bullets"><i /><i /><i /></div>
        <span>SLIDE {Math.min(n, 4000)} OF 4,000</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- finale extras on the debrief
// No teacher or school name is printed. The right-hand line carries a drawn signature mark. The student's name lives only in component
// state: it is never stored (no localStorage, no network) and is used for printing only.
export const ORGANISER = 'JA Montenegro';
export const SKILLS = ['Prompt writing', 'Fact-checking', 'Responsible AI use'];

// A drawn, handwriting-style signature mark ("skerndl"). It is a stylised scribble, not a scan of
// a real signature. Drawn as SVG so it looks the same on every computer and in print.
const SIGNATURE_PATHS = [
  'M 40 20 C 30 6 8 14 18 30 C 28 44 44 46 34 60 C 26 70 8 64 6 54',
  'M 54 10 C 52 30 49 48 46 64',
  'M 76 18 C 66 28 58 36 51 40 C 60 42 68 52 74 58 C 80 56 88 50 90 44 C 92 38 84 37 82 44 C 80 54 90 60 98 54 C 102 50 104 44 106 40 C 105 48 105 54 108 56 C 110 48 115 39 120 41 C 123 44 120 52 123 56 C 126 48 131 40 136 42 C 139 45 136 52 140 56 C 148 56 153 48 150 43 C 145 38 137 48 144 55 C 152 60 160 34 164 8 C 161 30 158 50 163 56 C 168 58 174 40 179 6 C 174 32 171 54 180 56 C 192 56 206 50 222 42',
  'M 14 74 C 70 66 150 70 214 60',
];
function Signature() {
  return (
    <svg className="cert-signature" data-testid="cert-signature" viewBox="0 0 230 80" role="img" aria-label="skerndl" fill="none" stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {SIGNATURE_PATHS.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function Certificate({ name, date, testId }) {
  return (
    <div className="certificate" data-testid={testId}>
      <div className="cert-top">AI ESCAPE · THE LOCKED CERTIFICATE</div>
      <div className="cert-title">AI CERTIFICATE</div>
      <div className="cert-course">RESPONSIBLE AI EXPLORER</div>
      <div className="cert-small">This certificate is awarded to</div>
      <div className="cert-name">{name.trim() || 'Full name'}</div>
      <div className="cert-small">for completing all three missions and learning these skills:</div>
      <div className="cert-skills">{SKILLS.join(' · ')}</div>
      <div className="cert-organiser">Programme organiser: <b>{ORGANISER}</b></div>
      <div className="cert-foot">
        <span className="cert-sign"><i />Date: {date}</span>
        <span className="seal">✦</span>
        <span className="cert-sign"><Signature /><i />Teacher's signature</span>
      </div>
      <div className="cert-credit" data-testid="cert-credit">{PROJECT_CREDIT}</div>
    </div>
  );
}

/** Print: a dedicated, page-sized copy under <body> is the only thing printed (A4 landscape, one page). */
function printCertificate() {
  window.print();
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function Finale() {
  const [name, setName] = useState('');
  const date = formatDate(new Date());
  return (
    <div className="finale">
      <Certificate name={name} date={date} testId="certificate" />
      {createPortal(<div id="print-certificate"><Certificate name={name} date={date} testId="print-certificate" /></div>, document.body)}
      <div className="cert-controls">
        <label>Student's full name <input data-testid="cert-name" value={name} maxLength={40} placeholder="Type your full name" autoComplete="off" onChange={(e) => setName(e.target.value)} /></label>
        <button className="btn" data-testid="print-a4" onClick={printCertificate}>🖨 Print (A4 landscape)</button>
      </div>
      <p className="muted cert-note">Your name is not stored anywhere. It is only used to print this certificate.</p>
      <h3>🎓 The whole game in three lines</h3>
      <div className="recap">
        <div><b>Mission 1 · Write it well</b><span>Role + Task + Context + Format.</span></div>
        <div><b>Mission 2 · Check it</b><span>AI can hallucinate. Check claims against reliable, independent sources.</span></div>
        <div><b>Mission 3 · Use it responsibly</b><span>Protect personal data, do your own thinking, watch for stereotypes and stand behind what you hand in.</span></div>
      </div>
      <div className="credits">
        <b>STARRING</b>
        {ROSTER.map((c) => <span key={c.id} style={{ color: c.color }}>{c.name}</span>)}
        <b>ALSO STARRING</b>
        <span>PROMPTOTRON 3000 · SNACK-O-MAT 9000 · THE ARCHIVIST · the Vacuum-Bots</span>
      </div>
    </div>
  );
}

export const SEAL_HUD = SEALS;
