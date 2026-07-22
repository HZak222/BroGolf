import type { Player } from '../types';

interface Props {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
}

export default function Players({ players, onAddPlayer, onRemovePlayer }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get('name') as string).trim();
    if (name) {
      onAddPlayer(name);
      form.reset();
    }
  }

  return (
    <div className="section">
      <h2>⛳ Leikmenn</h2>
      <form className="add-form" onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Nafn leikmanns"
          maxLength={30}
          required
        />
        <button type="submit" className="btn btn-primary">Bæta við</button>
      </form>

      {players.length === 0 ? (
        <p className="empty-msg">Engir leikmenn skráðir enn.</p>
      ) : (
        <ul className="player-list">
          {players.map((p) => (
            <li key={p.id} className="player-item">
              <span className="player-name">👤 {p.name}</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onRemovePlayer(p.id)}
              >
                Fjarlægja
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
