import { useState } from 'react';
import type { Player } from '../types';

interface Props {
  players: Player[];
  onStart: (courseName: string, holeCount: 9 | 18, pars: number[], playerIds: string[]) => void;
}

const DEFAULT_PAR_9 = [4, 3, 4, 5, 4, 3, 4, 4, 5];
const DEFAULT_PAR_18 = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 4, 3, 5, 4, 3, 4, 4, 5];

export default function NewRound({ players, onStart }: Props) {
  const [courseName, setCourseName] = useState('');
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [pars, setPars] = useState<number[]>(DEFAULT_PAR_18);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map((p) => p.id));

  function handleHoleCountChange(n: 9 | 18) {
    setHoleCount(n);
    setPars(n === 9 ? DEFAULT_PAR_9 : DEFAULT_PAR_18);
  }

  function handleParChange(index: number, value: number) {
    const next = [...pars];
    next[index] = value;
    setPars(next);
  }

  function togglePlayer(id: string) {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPlayers.length === 0) {
      alert('Veldu að minnsta kosti einn leikmann.');
      return;
    }
    onStart(courseName.trim() || 'Ónefnt svæði', holeCount, pars, selectedPlayers);
  }

  return (
    <div className="section">
      <h2>🏌️ Ný umferð</h2>

      {players.length === 0 ? (
        <p className="empty-msg">Bættu við leikmönnum áður en þú byrjar umferð.</p>
      ) : (
        <form className="new-round-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseName">Heiti vallar</label>
            <input
              id="courseName"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="t.d. Borgarnes Golf"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Fjöldi hola</label>
            <div className="hole-toggle">
              <button
                type="button"
                className={`btn ${holeCount === 9 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleHoleCountChange(9)}
              >
                9 holur
              </button>
              <button
                type="button"
                className={`btn ${holeCount === 18 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleHoleCountChange(18)}
              >
                18 holur
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Leikmenn</label>
            <div className="player-checkboxes">
              {players.map((p) => (
                <label key={p.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(p.id)}
                    onChange={() => togglePlayer(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Par per holu</label>
            <div className="par-grid">
              {pars.map((par, i) => (
                <div key={i} className="par-cell">
                  <span className="hole-label">H{i + 1}</span>
                  <select
                    value={par}
                    onChange={(e) => handleParChange(i, Number(e.target.value))}
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Byrja umferð
          </button>
        </form>
      )}
    </div>
  );
}
