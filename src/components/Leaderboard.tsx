import type { Round, Player } from '../types';

interface Props {
  rounds: Round[];
  players: Player[];
  onSelectRound: (id: string) => void;
}

function playerTotal(round: Round, playerId: string): number {
  return round.scores
    .filter((s) => s.playerId === playerId && s.strokes !== null)
    .reduce((sum, s) => sum + (s.strokes ?? 0), 0);
}

function playerDiff(round: Round, playerId: string): number {
  return round.scores
    .filter((s) => s.playerId === playerId && s.strokes !== null)
    .reduce((sum, s) => {
      const hole = round.holes.find((h) => h.number === s.holeNumber);
      return sum + (s.strokes ?? 0) - (hole?.par ?? 0);
    }, 0);
}

export default function Leaderboard({ rounds, players, onSelectRound }: Props) {
  const completedRounds = rounds.filter((r) => r.completed);

  if (completedRounds.length === 0) {
    return (
      <div className="section">
        <h2>🏆 Stigatafla</h2>
        <p className="empty-msg">Engar lokaðar umferðir enn. Ljúktu við umferð til að sjá stigatöflu.</p>
      </div>
    );
  }

  // Aggregate totals across all completed rounds
  const totals: Record<string, { name: string; rounds: number; totalStrokes: number; totalDiff: number }> = {};
  for (const player of players) {
    totals[player.id] = { name: player.name, rounds: 0, totalStrokes: 0, totalDiff: 0 };
  }

  for (const round of completedRounds) {
    for (const playerId of round.playerIds) {
      if (!totals[playerId]) continue;
      const t = playerTotal(round, playerId);
      const d = playerDiff(round, playerId);
      if (t > 0) {
        totals[playerId].rounds += 1;
        totals[playerId].totalStrokes += t;
        totals[playerId].totalDiff += d;
      }
    }
  }

  const ranked = Object.entries(totals)
    .filter(([, v]) => v.rounds > 0)
    .sort(([, a], [, b]) => a.totalDiff - b.totalDiff);

  return (
    <div className="section">
      <h2>🏆 Stigatafla</h2>

      {ranked.length === 0 ? (
        <p className="empty-msg">Engir leikmenn með skráðar umferðir.</p>
      ) : (
        <div className="leaderboard">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Leikmaður</th>
                <th>Umferðir</th>
                <th>Heildarslag</th>
                <th>+/- Par</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(([, entry], i) => {
                const diffLabel =
                  entry.totalDiff === 0
                    ? 'E'
                    : entry.totalDiff > 0
                    ? `+${entry.totalDiff}`
                    : `${entry.totalDiff}`;
                return (
                  <tr key={entry.name} className={i === 0 ? 'leader-row' : ''}>
                    <td className="rank-cell">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td>{entry.name}</td>
                    <td>{entry.rounds}</td>
                    <td>{entry.totalStrokes}</td>
                    <td className={entry.totalDiff < 0 ? 'under-par' : entry.totalDiff > 0 ? 'over-par' : 'at-par'}>
                      {diffLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="section-subtitle">Umferðarsaga</h3>
      <ul className="round-list">
        {completedRounds
          .slice()
          .reverse()
          .map((round) => (
            <li key={round.id} className="round-item" onClick={() => onSelectRound(round.id)}>
              <span className="round-course">{round.courseName}</span>
              <span className="round-date">{round.date}</span>
              <span className="round-holes">{round.holes.length} holur</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
