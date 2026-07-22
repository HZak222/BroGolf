export interface Player {
  id: string;
  name: string;
}

export interface Hole {
  number: number;
  par: number;
}

export interface Score {
  playerId: string;
  holeNumber: number;
  strokes: number | null;
}

export interface Round {
  id: string;
  date: string;
  courseName: string;
  holes: Hole[];
  scores: Score[];
  playerIds: string[];
  completed: boolean;
}

export interface AppState {
  players: Player[];
  rounds: Round[];
}

export type View = 'home' | 'players' | 'new-round' | 'scorecard' | 'leaderboard' | 'history';
