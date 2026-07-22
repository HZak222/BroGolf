import { useState, useEffect } from 'react';
import './App.css';
import Players from './components/Players';
import NewRound from './components/NewRound';
import Scorecard from './components/Scorecard';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import { loadState, saveState, generateId } from './utils/storage';
import type { AppState, View, Round } from './types';

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'home', label: '🏠 Heim' },
  { id: 'new-round', label: '🏌️ Ný umferð' },
  { id: 'leaderboard', label: '🏆 Stigatafla' },
  { id: 'history', label: '📅 Saga' },
  { id: 'players', label: '👤 Leikmenn' },
];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [view, setView] = useState<View>('home');
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

  // Restore active round from state on mount
  useEffect(() => {
    const active = state.rounds.find((r) => !r.completed);
    if (active) setActiveRoundId(active.id);
  }, [state.rounds]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ---- Player management ----
  function addPlayer(name: string) {
    setState((prev) => ({
      ...prev,
      players: [...prev.players, { id: generateId(), name }],
    }));
  }

  function removePlayer(id: string) {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));
  }

  // ---- Round management ----
  function startRound(
    courseName: string,
    _holeCount: 9 | 18,
    pars: number[],
    playerIds: string[]
  ) {
    const holes = pars.map((par, i) => ({ number: i + 1, par }));
    const scores = playerIds.flatMap((playerId) =>
      holes.map((hole) => ({ playerId, holeNumber: hole.number, strokes: null }))
    );
    const round: Round = {
      id: generateId(),
      date: new Date().toLocaleDateString('is-IS'),
      courseName,
      holes,
      scores,
      playerIds,
      completed: false,
    };
    setState((prev) => ({ ...prev, rounds: [...prev.rounds, round] }));
    setActiveRoundId(round.id);
    setView('scorecard');
  }

  function updateScore(
    roundId: string,
    playerId: string,
    holeNumber: number,
    strokes: number | null
  ) {
    setState((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r) => {
        if (r.id !== roundId) return r;
        const existing = r.scores.find(
          (s) => s.playerId === playerId && s.holeNumber === holeNumber
        );
        const newScores = existing
          ? r.scores.map((s) =>
              s.playerId === playerId && s.holeNumber === holeNumber
                ? { ...s, strokes }
                : s
            )
          : [...r.scores, { playerId, holeNumber, strokes }];
        return { ...r, scores: newScores };
      }),
    }));
  }

  function completeRound(roundId: string) {
    setState((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r) =>
        r.id === roundId ? { ...r, completed: true } : r
      ),
    }));
    setActiveRoundId(null);
    setView('leaderboard');
  }

  function deleteRound(roundId: string) {
    setState((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((r) => r.id !== roundId),
    }));
    if (activeRoundId === roundId) setActiveRoundId(null);
  }

  function openRound(id: string) {
    setActiveRoundId(id);
    setView('scorecard');
  }

  const activeRound = state.rounds.find((r) => r.id === activeRoundId);
  const inProgressRounds = state.rounds.filter((r) => !r.completed);

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">⛳</span>
        <h1>BroGolf</h1>
      </header>

      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-btn${view === item.id ? ' active' : ''}`}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </button>
        ))}
        {activeRound && (
          <button
            className={`nav-btn${view === 'scorecard' ? ' active' : ''}`}
            onClick={() => setView('scorecard')}
            style={{ color: '#fde68a' }}
          >
            📋 {activeRound.courseName}
          </button>
        )}
      </nav>

      <main className="app-main">
        {view === 'home' && (
          <>
            <div className="home-hero">
              <h2>⛳ BroGolf</h2>
              <p>Golf app fyrir Bakka bræður</p>
            </div>

            <div className="home-grid">
              <div className="home-card" onClick={() => setView('new-round')}>
                <div className="home-card-icon">🏌️</div>
                <h3>Ný umferð</h3>
                <p>Byrja nýja leiktíð</p>
              </div>
              <div className="home-card" onClick={() => setView('leaderboard')}>
                <div className="home-card-icon">🏆</div>
                <h3>Stigatafla</h3>
                <p>Skoða stigatöflu</p>
              </div>
              <div className="home-card" onClick={() => setView('history')}>
                <div className="home-card-icon">📅</div>
                <h3>Saga</h3>
                <p>Skoða leikjaferil</p>
              </div>
              <div className="home-card" onClick={() => setView('players')}>
                <div className="home-card-icon">👤</div>
                <h3>Leikmenn</h3>
                <p>{state.players.length} leikmenn skráðir</p>
              </div>
            </div>

            {inProgressRounds.length > 0 && (
              <div className="home-active">
                <h3>⏳ Ólokaðar umferðir</h3>
                {inProgressRounds.map((r) => (
                  <div key={r.id} className="active-round-card" onClick={() => openRound(r.id)}>
                    <div className="active-round-info">
                      <strong>{r.courseName}</strong>
                      <span>{r.date} · {r.holes.length} holur</span>
                    </div>
                    <span>▶</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'players' && (
          <Players
            players={state.players}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
          />
        )}

        {view === 'new-round' && (
          <NewRound players={state.players} onStart={startRound} />
        )}

        {view === 'scorecard' && activeRound ? (
          <Scorecard
            round={activeRound}
            players={state.players}
            onScoreChange={updateScore}
            onComplete={completeRound}
          />
        ) : view === 'scorecard' && !activeRound ? (
          <div className="section">
            <h2>📋 Skorkort</h2>
            <p className="empty-msg">Engin umferð valin. Byrjaðu nýja umferð.</p>
          </div>
        ) : null}

        {view === 'leaderboard' && (
          <Leaderboard
            rounds={state.rounds}
            players={state.players}
            onSelectRound={openRound}
          />
        )}

        {view === 'history' && (
          <History
            rounds={state.rounds}
            players={state.players}
            onSelectRound={openRound}
            onDeleteRound={deleteRound}
          />
        )}
      </main>
    </div>
  );
}
