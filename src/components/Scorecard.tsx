import type { Round, Player, Score } from '../types';

interface Props {
  round: Round;
  players: Player[];
  onScoreChange: (roundId: string, playerId: string, holeNumber: number, strokes: number | null) => void;
  onComplete: (roundId: string) => void;
}

function getScore(scores: Score[], playerId: string, holeNumber: number): number | null {
  return scores.find((s) => s.playerId === playerId && s.holeNumber === holeNumber)?.strokes ?? null;
}

function playerTotal(scores: Score[], playerId: string): number {
  return scores
    .filter((s) => s.playerId === playerId && s.strokes !== null)
    .reduce((sum, s) => sum + (s.strokes ?? 0), 0);
}

function playerTotalVsPar(scores: Score[], playerId: string, holes: Round['holes']): number {
  return scores
    .filter((s) => s.playerId === playerId && s.strokes !== null)
    .reduce((sum, s) => {
      const hole = holes.find((h) => h.number === s.holeNumber);
      return sum + (s.strokes ?? 0) - (hole?.par ?? 0);
    }, 0);
}

function strokesClass(strokes: number | null, par: number): string {
  if (strokes === null) return '';
  const diff = strokes - par;
  if (diff <= -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 0) return 'par';
  if (diff === 1) return 'bogey';
  return 'double-bogey';
}

export default function Scorecard({ round, players, onScoreChange, onComplete }: Props) {
  const activePlayers = players.filter((p) => round.playerIds.includes(p.id));
  const parTotal = round.holes.reduce((s, h) => s + h.par, 0);

  const allFilled = round.holes.every((hole) =>
    activePlayers.every((player) => {
      const s = getScore(round.scores, player.id, hole.number);
      return s !== null && s > 0;
    })
  );

  return (
    <div className="section scorecard-section">
      <div className="scorecard-header">
        <h2>📋 {round.courseName}</h2>
        <span className="round-date">{round.date}</span>
      </div>

      <div className="scorecard-wrapper">
        <table className="scorecard-table">
          <thead>
            <tr>
              <th className="sticky-col">Hola</th>
              {round.holes.map((h) => (
                <th key={h.number}>{h.number}</th>
              ))}
              <th className="total-col">Samtals</th>
              <th className="diff-col">+/-</th>
            </tr>
            <tr className="par-row">
              <th className="sticky-col">Par</th>
              {round.holes.map((h) => (
                <td key={h.number}>{h.par}</td>
              ))}
              <td>{parTotal}</td>
              <td>—</td>
            </tr>
          </thead>
          <tbody>
            {activePlayers.map((player) => {
              const total = playerTotal(round.scores, player.id);
              const diff = playerTotalVsPar(round.scores, player.id, round.holes);
              const filledCount = round.scores.filter(
                (s) => s.playerId === player.id && s.strokes !== null
              ).length;
              const diffLabel =
                filledCount === 0 ? '—' : diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;

              return (
                <tr key={player.id}>
                  <td className="sticky-col player-name-cell">{player.name}</td>
                  {round.holes.map((hole) => {
                    const val = getScore(round.scores, player.id, hole.number);
                    return (
                      <td
                        key={hole.number}
                        className={`score-cell ${strokesClass(val, hole.par)}`}
                      >
                        {round.completed ? (
                          <span>{val ?? '—'}</span>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={val ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                              onScoreChange(round.id, player.id, hole.number, v);
                            }}
                            className="score-input"
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="total-col">{total || '—'}</td>
                  <td className={`diff-col ${diff < 0 ? 'under-par' : diff > 0 ? 'over-par' : 'at-par'}`}>
                    {diffLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!round.completed && (
        <div className="scorecard-actions">
          <button
            className="btn btn-success btn-lg"
            onClick={() => onComplete(round.id)}
            disabled={!allFilled}
            title={allFilled ? '' : 'Fylltu inn allar skoor fyrst'}
          >
            Ljúka umferð
          </button>
          {!allFilled && (
            <p className="hint">Fylltu inn skoor fyrir allar holur til að ljúka umferð.</p>
          )}
        </div>
      )}

      {round.completed && (
        <div className="completed-banner">✅ Umferð lokið</div>
      )}
    </div>
  );
}
