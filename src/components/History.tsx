import type { Round, Player } from '../types';

interface Props {
  rounds: Round[];
  players: Player[];
  onSelectRound: (id: string) => void;
  onDeleteRound: (id: string) => void;
}

export default function History({ rounds, players, onSelectRound, onDeleteRound }: Props) {
  const playerName = (id: string) => players.find((p) => p.id === id)?.name ?? 'Óþekktur';

  if (rounds.length === 0) {
    return (
      <div className="section">
        <h2>📅 Söguleg umferðir</h2>
        <p className="empty-msg">Engar umferðir skráðar enn.</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>📅 Söguleg umferðir</h2>
      <ul className="history-list">
        {[...rounds].reverse().map((round) => (
          <li key={round.id} className="history-item">
            <div className="history-header" onClick={() => onSelectRound(round.id)}>
              <span className="round-course">⛳ {round.courseName}</span>
              <span className="round-date">{round.date}</span>
              {round.completed ? (
                <span className="badge badge-done">Lokið</span>
              ) : (
                <span className="badge badge-active">Í gangi</span>
              )}
            </div>
            <div className="history-meta">
              <span>{round.holes.length} holur</span>
              <span className="players-inline">
                {round.playerIds.map((id) => playerName(id)).join(', ')}
              </span>
            </div>
            <div className="history-actions">
              <button className="btn btn-outline btn-sm" onClick={() => onSelectRound(round.id)}>
                Opna
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(`Eyða umferð á ${round.courseName}?`)) {
                    onDeleteRound(round.id);
                  }
                }}
              >
                Eyða
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
