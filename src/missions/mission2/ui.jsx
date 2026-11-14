import React, { useEffect, useState } from 'react';
import { useGame } from '../../game/store.js';
import { sfx } from '../../game/audio.js';
import { CLAIMS, SOURCES, evidenceFor } from './factCheck.js';
import { ROSTER } from '../../characters/roster.js';
import { submitFactCheck, startGroundedSequence } from './logic.js';

// ---------------------------------------------------------------- energy meter (HUD)
export function CaffeineMeter() {
  const caffeine = useGame((s) => Math.round(s.ms.caffeine ?? 100));
  const doorOpen = useGame((s) => s.doorOpen);
  const level = doorOpen ? 100 : caffeine;
  const low = level < 25;
  const color = level > 50 ? '#22c55e' : level > 25 ? '#facc15' : '#ef4444';
  return (
    <div className={`caffeine ${low ? 'low' : ''}`} data-testid="caffeine">
      <span>⚡ ENERGIJA</span>
      <div className="caffeine-bar"><div style={{ width: `${level}%`, background: color }} /></div>
      <b>{level}%</b>
      {low && <em>SPAVA TI SE… pojedi nešto!</em>}
    </div>
  );
}

// ---------------------------------------------------------------- nap overlay (failure state)
export function NapOverlay() {
  const napping = useGame((s) => s.ms.napping);
  if (!napping) return null;
  return (
    <div className="nap-overlay" data-testid="nap-overlay">
      <div className="zzz"><span>Z</span><span>z</span><span>z</span></div>
      <div className="nap-text">ZASPALI STE NA ČASU</div>
    </div>
  );
}

// ---------------------------------------------------------------- fact-check station
const VERDICTS = [[true, '✔ TAČNO'], [false, '✖ HALUCINACIJA']];
const NONE = {};
const STATUS_TEXT = { ok: '✔ tačno', wrong: '✖ dokaz kaže suprotno', missing: '✖ nije odgovoreno' };

/**
 * One claim at a time. Each claim shows ONE piece of evidence (found in the hallway);
 * the player reads it and marks the claim TRUE or HALLUCINATION.
 */
export function FactChecker() {
  const inventory = useGame((s) => s.inventory);
  const answers = useGame((s) => s.ms.answers || NONE);
  const attempts = useGame((s) => s.attempts);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!result) return;
    let i = 0;
    const id = setInterval(() => {
      i += 3; setTyped(result.output.slice(0, i));
      if (i >= result.output.length) { clearInterval(id); setBusy(false); }
    }, 14);
    return () => clearInterval(id);
  }, [result]);

  const setVerdict = (claimId, verdict) => {
    sfx.interact();
    useGame.getState().patchMs((m) => ({ answers: { ...m.answers, [claimId]: { verdict } } }));
  };
  const isDone = (c) => typeof answers[c.id]?.verdict === 'boolean' && !!evidenceFor(c.id, inventory);
  const doneCount = CLAIMS.filter(isDone).length;

  const onSubmit = () => {
    if (busy || doneCount < CLAIMS.length) return;
    setBusy(true); setTyped(''); setResult(null);
    setTimeout(() => {
      const r = submitFactCheck();
      setResult(r);
      if (r.success) setTimeout(() => startGroundedSequence(), 5200);
    }, 700);
  };

  const showStatus = result && !result.success;
  const c = CLAIMS[current];
  const a = answers[c.id] || {};
  const evId = evidenceFor(c.id, inventory);
  const ev = evId ? SOURCES[evId] : null;
  const need = SOURCES[c.reliable];
  const status = showStatus ? result.results[c.id] : null;
  const isLast = current === CLAIMS.length - 1;

  return (
    <div className="builder-wrap" data-testid="fact-checker">
      <div className="builder factcheck">
        <div className="builder-head">
          <div>
            <div className="builder-title">PROVJERA ČINJENICA</div>
            <div className="builder-sub how">Pročitaj dokaz i označi: <b>TAČNO</b> ili <b>HALUCINACIJA</b>. Dokaza: <b>{CLAIMS.filter((x) => evidenceFor(x.id, inventory)).length}/5</b></div>
          </div>
          <button className="btn small" onClick={() => useGame.getState().closeBuilder()} data-testid="builder-close">✕ Zatvori (Esc)</button>
        </div>

        <div className="claim-tabs" role="tablist" aria-label="Tvrdnje">
          {CLAIMS.map((cl, i) => {
            const st = showStatus ? result.results[cl.id] : null;
            return (
              <button key={cl.id} role="tab" aria-selected={i === current} data-testid={`claim-tab-${cl.id}`}
                className={`claim-tab ${i === current ? 'current' : ''} ${isDone(cl) ? 'done' : ''} ${st ? (st === 'ok' ? 'ok' : 'bad') : ''}`}
                onClick={() => setCurrent(i)}>
                <b>{i + 1}</b>{isDone(cl) ? ' ✓' : ''}
              </button>
            );
          })}
        </div>

        <div className={`claim one ${status ? (status === 'ok' ? 'ok' : 'bad') : ''}`} data-testid={`claim-${c.id}`}>
          <div className="claim-count">Tvrdnja {current + 1} od {CLAIMS.length}{status && <em className="claim-status"> · {STATUS_TEXT[status]}</em>}</div>
          <div className="claim-text big">SNACK-O-MAT kaže: „{c.text}“</div>

          {ev ? (
            <div className="evidence" style={{ '--c': ev.color }} data-testid={`evidence-${c.id}`}>
              <b>🔎 Dokaz: {ev.short}</b>
              <span className="says">„{ev.claims[c.id]}“</span>
            </div>
          ) : (
            <div className="source-missing" data-testid={`evidence-missing-${c.id}`}>🔒 Još nemaš dokaz. Potraži u hodniku: <b>{need.short}</b> (treba {ROSTER.find((x) => x.id === need.who).name}).</div>
          )}

          <div className="verdicts">
            {VERDICTS.map(([v, label]) => (
              <button key={label} data-testid={`verdict-${c.id}-${v}`} disabled={busy || !ev}
                className={`verdict ${v ? 'true' : 'false'} ${a.verdict === v ? 'sel' : ''}`}
                onClick={() => setVerdict(c.id, v)}>{label}</button>
            ))}
          </div>

          <div className="claim-nav">
            <button className="btn small" disabled={current === 0} onClick={() => setCurrent(current - 1)} data-testid="claim-prev">◀ Prethodna</button>
            {!isLast && <button className={`btn ${isDone(c) ? 'primary pulse' : ''}`} onClick={() => setCurrent(current + 1)} data-testid="claim-next">Sljedeća ▶</button>}
          </div>
        </div>

        <div className="builder-foot">
          <button className="btn primary big" onClick={onSubmit} disabled={busy || doneCount < CLAIMS.length} data-testid="submit-factcheck">
            {busy && !result ? 'PREGLEDAM…' : '⚡ POŠALJI'}
          </button>
          <span className="muted">Odgovoreno: {doneCount}/{CLAIMS.length} · Pokušaja: {attempts}</span>
        </div>

        {(result || busy) && (
          <div className={`ai-output ${result ? (result.success ? 'success' : 'fail') : ''}`} data-testid="ai-output">
            <div className="ai-head">{!result ? 'ANALIZIRAM…' : result.success ? `✅ SVE PROVJERENO — TAČNOST ${result.score}%` : `❌ NIJE PROŠLO — TAČNOST ${result.score}%`}</div>
            <pre>{typed}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
