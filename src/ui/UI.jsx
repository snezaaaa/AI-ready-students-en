import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store.js';
import { ROSTER, SPEAKERS } from '../characters/roster.js';
import { MISSIONS, getMission } from '../missions/registry.js';
import { sfx } from '../game/audio.js';
import { PROJECT_CREDIT } from '../credits.js';
import { startMission, skipIntro, resume, restartMission, switchTo, lockPointer } from './actions.js';

export default function UI() {
  const phase = useGame((s) => s.phase);
  const paused = useGame((s) => s.paused);
  const builderOpen = useGame((s) => s.builderOpen);
  const mission = getMission(useGame((s) => s.missionId));
  const { PuzzleUI, Overlay } = mission;
  return (
    <div className="ui">
      <DialogueDirector />
      {phase === 'loading' && <LoadingScreen />}
      {phase === 'title' && <TitleScreen />}
      {(phase === 'intro' || phase === 'cutscene' || phase === 'victory') && <Letterbox />}
      {phase === 'intro' && <IntroOverlay text={mission.announcement} />}
      {phase === 'victory' && <div className="victory-banner">MISIJA {mission.number} ZAVRŠENA</div>}
      {Overlay && phase !== 'title' && phase !== 'loading' && <Overlay />}
      {(phase === 'playing' || phase === 'cutscene') && <HUD />}
      {phase !== 'title' && phase !== 'loading' && <Subtitles />}
      <Toast />
      {builderOpen && PuzzleUI && <PuzzleUI />}
      {paused && <PauseMenu />}
      {phase === 'complete' && <CompleteScreen />}
    </div>
  );
}

// ---------------------------------------------------------------- dialogue timing
function DialogueDirector() {
  const current = useGame((s) => s.dialogue.current);
  const qlen = useGame((s) => s.dialogue.queue.length);
  const paused = useGame((s) => s.paused);
  useEffect(() => {
    const s = useGame.getState();
    if (!current && qlen) { s.advanceDialogue(); return; }
    if (!current || paused) return;
    const ms = (current.duration ?? Math.min(10, Math.max(3.6, 2.2 + current.text.length * 0.085))) * 1000;
    const id = setTimeout(() => { if (useGame.getState().dialogue.current === current) useGame.getState().advanceDialogue(); }, ms);
    return () => clearTimeout(id);
  }, [current, qlen, paused]);
  return null;
}

function Subtitles() {
  const line = useGame((s) => s.dialogue.current);
  const builderOpen = useGame((s) => s.builderOpen);
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!line) { setShown(''); return; }
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 2;
      setShown(line.text.slice(0, i));
      if (i % 6 === 0) sfx.blip();
      if (i >= line.text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [line]);
  if (!line) return null;
  const sp = SPEAKERS[line.who] || SPEAKERS.narrator;
  const charIndex = ROSTER.findIndex((c) => c.id === line.who);
  return (
    <div className={`subtitles ${line.who === 'system' ? 'system' : ''} ${builderOpen ? 'top' : ''}`} onClick={() => useGame.getState().advanceDialogue()} data-testid="subtitles">
      {sp.name && (
        <div className="speaker" style={{ color: sp.color }}>
          {charIndex >= 0 && <span className="speaker-chip" style={{ background: sp.color }}>{charIndex + 1}</span>}
          {sp.name}
        </div>
      )}
      <div className="line">{shown}<span className="caret">▌</span></div>
      <div className="skip-hint">klik / Enter ▸</div>
    </div>
  );
}

// ---------------------------------------------------------------- loading & title
function LoadingScreen() {
  const [p, setP] = useState(5);
  useEffect(() => { const id = setInterval(() => setP((x) => Math.min(95, x + (100 - x) * 0.08)), 80); return () => clearInterval(id); }, []);
  const tips = ['Učitavanje…', 'Zaključavamo sertifikat…', 'Krijemo djelove prompta…', 'Skoro gotovo…'];
  return (
    <div className="screen loading">
      <Logo small />
      <div className="bar"><div style={{ width: `${p}%` }} /></div>
      <div className="loading-tip">{tips[Math.floor(p / 25) % tips.length]}</div>
    </div>
  );
}

function Logo({ small }) {
  return (
    <div className={`logo ${small ? 'small' : ''}`}>
      <div className="logo-top">AI <span>ESCAPE</span></div>
      <div className="logo-main">ZAKLJUČANI SERTIFIKAT</div>
    </div>
  );
}

function TitleScreen() {
  const missionId = useGame((s) => s.missionId);
  const selected = getMission(missionId);
  return (
    <div className="screen title">
      <Logo />
      <p className="pitch">Škola je zaključana, a sa njom i tvoj AI sertifikat.<br />Tri misije: napiši dobar prompt, provjeri činjenice, koristi AI odgovorno.</p>
      <div className="lineup">
        {ROSTER.map((c, i) => (
          <div key={c.id} className="lineup-card" style={{ '--c': c.color }}>
            <div className="num">{i + 1}</div>
            <div className="mini-head" style={{ background: c.look.skin, borderTopColor: c.look.hair }}><i /><i /></div>
            <div className="mini-body" style={{ background: c.look.shirt }} />
            <b>{c.name}</b>
            <small>{c.tagline}</small>
          </div>
        ))}
      </div>
      <div className="title-buttons">
        <button className="btn primary" data-testid="start" onClick={() => startMission()}>▶ POKRENI MISIJU {selected.number}</button>
        <button className="btn" onClick={() => startMission({ skipIntro: true })}>Preskoči uvod</button>
      </div>
      <div className="missions-row" role="radiogroup" aria-label="Izaberi misiju">
        {MISSIONS.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={m.id === missionId}
            data-testid={`select-${m.id}`}
            disabled={m.status !== 'available'}
            className={`mission-pill ${m.status} ${m.id === missionId ? 'selected' : ''}`}
            onClick={() => useGame.setState({ missionId: m.id })}
          >
            M{m.number}: {m.title} {m.status !== 'available' && <em>uskoro</em>}
          </button>
        ))}
      </div>
      <p className="mission-tagline">{selected.tagline}</p>
      <Controls />
      <p className="project-credit" data-testid="project-credit">{PROJECT_CREDIT}</p>
    </div>
  );
}

function Controls() {
  return (
    <div className="controls">
      <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> kretanje</span>
      <span><kbd>Shift</kbd> trčanje</span>
      <span><kbd>Miš</kbd> kamera</span>
      <span><kbd>E</kbd> akcija</span>
      <span><kbd>1</kbd>–<kbd>4</kbd> promjena lika</span>
      <span><kbd>Space</kbd> skok (2× = dupli skok)</span>
      <span><kbd>Esc</kbd> pauza</span>
    </div>
  );
}

// ---------------------------------------------------------------- cinematics
function Letterbox() { return (<><div className="letterbox top" /><div className="letterbox bottom" /></>); }

function IntroOverlay({ text }) {
  const [t, setT] = useState(0);
  useEffect(() => { const start = performance.now(); const id = setInterval(() => setT((performance.now() - start) / 1000), 50); return () => clearInterval(id); }, []);
  const typed = text.slice(0, Math.floor(Math.max(0, t - 0.4) * 28));
  return (
    <>
      {t < 8.5 && (
        <div className={`announce ${t > 7.5 ? 'fade' : ''}`}>
          <div className="announce-tag">⚠ HITNO OBAVJEŠTENJE ⚠</div>
          <div className="announce-text" data-testid="announcement">{typed}</div>
        </div>
      )}
      <div className="alarm-vignette" />
      <button className="btn skip" data-testid="skip-intro" onClick={skipIntro}>Preskoči ▸▸ <small>(Enter)</small></button>
    </>
  );
}

// ---------------------------------------------------------------- HUD
function HUD() {
  const st = useGame();
  const mission = getMission(st.missionId);
  const [locked, setLocked] = useState(!!document.pointerLockElement);
  useEffect(() => {
    const f = () => setLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', f);
    return () => document.removeEventListener('pointerlockchange', f);
  }, []);
  const objective = mission.objective(st);
  const items = mission.hudItems(st);
  const { HudExtra } = mission;
  return (
    <>
      <div className="hud-objective" data-testid="objective">
        <div className="mission-name">MISIJA {mission.number} · {mission.title.toUpperCase()}</div>
        <div className="objective-text">▸ {objective}</div>
        <div className="components">
          {items.map(({ id, label, color, got }) => (
            <div key={id} className={`comp ${got ? 'got' : ''}`} style={{ '--c': color }} data-testid={`comp-${id}`}>
              {got ? '✔' : '?'} {label}
            </div>
          ))}
        </div>
        {mission.stars && <div className="stars-hud" data-testid="stars">⭐ Zvjezdice: {st.stars.length}/{mission.stars.length} <small>(skači!)</small></div>}
        {HudExtra && <HudExtra />}
      </div>
      <div className="char-bar">
        {ROSTER.map((c, i) => (
          <button key={c.id} className={`char-btn ${st.active === i ? 'active' : ''}`} style={{ '--c': c.color }} onClick={() => switchTo(i)} data-testid={`char-${i + 1}`}>
            <span className="num">{i + 1}</span>
            <span className="cname">{c.name}</span>
            <span className="skill">{c.skill}</span>
          </button>
        ))}
      </div>
      {st.nearby && st.phase === 'playing' && (
        <div className="interact-prompt" data-testid="interact-prompt"><kbd>E</kbd> {st.nearby.label}</div>
      )}
      {!locked && st.phase === 'playing' && !st.builderOpen && (
        <div className="look-hint" onClick={lockPointer}>Klikni na igru da gledaš okolo mišem (ili prevuci)</div>
      )}
    </>
  );
}

function Toast() {
  const toast = useGame((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => useGame.getState().clearToast(), 5200);
    return () => clearTimeout(id);
  }, [toast]);
  if (!toast) return null;
  return (
    <div className="toast" key={toast.key} style={{ '--c': toast.color }} data-testid="toast">
      <div className="toast-title">{toast.title}</div>
      <div className="toast-body">{toast.body}</div>
      {toast.tip && <div className="toast-tip">💡 {toast.tip}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- menus
function PauseMenu() {
  const muted = useGame((s) => s.muted);
  return (
    <div className="screen pause" data-testid="pause-menu">
      <div className="panel">
        <h2>PAUZA</h2>
                <button className="btn primary" onClick={resume}>Nastavi</button>
        <button className="btn" onClick={restartMission}>Počni misiju ispočetka</button>
        <button className="btn" onClick={() => useGame.getState().toggleMute()}>{muted ? 'Uključi zvuk' : 'Isključi zvuk'}</button>
        <button className="btn" onClick={() => { useGame.getState().resetMission(); useGame.setState({ phase: 'title' }); }}>Nazad na naslovnu</button>
        <Controls />
      </div>
    </div>
  );
}

function CompleteScreen() {
  const st = useGame();
  const mission = getMission(st.missionId);
  const secs = st.finishedAt && st.startedAt ? Math.round((st.finishedAt - st.startedAt) / 1000) : 0;
  const L = mission.lesson;
  const next = MISSIONS.find((m) => m.number === mission.number + 1);
  const rank = st.attempts <= 1 ? mission.ranks[0] : st.attempts <= 3 ? mission.ranks[1] : mission.ranks[2];
  return (
    <div className="screen complete" data-testid="complete-screen">
      <div className="panel wide">
        <div className="stamp">{mission.certificate}</div>
        <h1>MISIJA {mission.number} ZAVRŠENA</h1>
        <p className="stats">Vrijeme: {Math.floor(secs / 60)} min {secs % 60} s · {mission.attemptLabel}: {st.attempts}{mission.extraStats ? ` · ${mission.extraStats(st)}` : ''}{mission.stars ? ` · Zvjezdice: ${st.stars.length}/${mission.stars.length}` : ''} · Titula: {rank}</p>
        <h3>📚 Šta si upravo naučio/la: {L.title}</h3>
        <div className="lesson-grid">
          {L.points.map(([k, v]) => <div key={k} className="lesson"><b>{k}</b><span>{v}</span></div>)}
        </div>
        <div className="compare">
          <div className="bad"><b>❌ {L.example.badLabel}</b><p>{L.example.bad}</p></div>
          <div className="good"><b>✅ {L.example.goodLabel}</b><p>{L.example.good}</p></div>
        </div>
        <p className="muted">{L.extra}</p>
        {mission.Finale && <mission.Finale />}
        <div className="next">
          {MISSIONS.filter((m) => m.number > mission.number).map((m) => (
            <div key={m.id} className="next-card"><b>Misija {m.number}: {m.title}</b><span>{m.tagline}</span><em>{m.status === 'available' ? 'Otključano!' : 'Uskoro'}</em></div>
          ))}
        </div>
        <div className="title-buttons">
          {next?.status === 'available' && (
            <button className="btn primary" data-testid="next-mission" onClick={() => startMission({ missionId: next.id })}>▶ Nastavi na Misiju {next.number}</button>
          )}
          <button className={`btn ${next?.status === 'available' ? '' : 'primary'}`} onClick={() => startMission()}>Igraj ponovo Misiju {mission.number}</button>
          <button className="btn" onClick={() => { useGame.setState({ phase: 'title' }); }}>Naslovna</button>
        </div>
      </div>
    </div>
  );
}
