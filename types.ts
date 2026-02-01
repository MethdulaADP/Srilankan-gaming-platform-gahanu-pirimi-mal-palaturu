export enum GamePhase {
  DASHBOARD = 'DASHBOARD',
  MODE_SELECTION = 'MODE_SELECTION', // New: Choose Host or Join
  LOBBY = 'LOBBY',                   // New: Waiting for players
  PLAYING = 'PLAYING',
  FINISHED_WAITING = 'FINISHED_WAITING',
  REVIEW = 'REVIEW',
  LEADERBOARD = 'LEADERBOARD',
}

export enum LanguageMode {
  SINHALA = 'SINHALA',
  ENGLISH = 'ENGLISH',
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  isHost: boolean; // New: Identifies the room creator
  score: number;
  isReady: boolean;
  hasFinished: boolean;
  answers: Record<string, string>;
  validations: Record<string, boolean>;
}

export interface Category {
  id: string;
  labelSinhala: string;
  labelEnglish: string;
}

export interface GameState {
  phase: GamePhase;
  language: LanguageMode;
  currentRound: number;
  totalRounds: number;
  currentLetter: string;
  players: Player[];
  timer: number | null;
  reviewingPlayerIndex: number;
  finisherId: string | null;
  roomCode: string | null; // New: Room identifier
}

export const CATEGORIES: Category[] = [
  { id: 'girl', labelSinhala: 'ගැහැණු නම', labelEnglish: 'Girl Name' },
  { id: 'boy', labelSinhala: 'පිරිමි නම', labelEnglish: 'Boy Name' },
  { id: 'flower', labelSinhala: 'මලේ නම', labelEnglish: 'Flower' },
  { id: 'fruit', labelSinhala: 'පළතුරෙහි නම', labelEnglish: 'Fruit' },
  { id: 'animal', labelSinhala: 'සතාගේ නම', labelEnglish: 'Animal' },
  { id: 'village', labelSinhala: 'ගමෙහි නම', labelEnglish: 'Village' },
  { id: 'country', labelSinhala: 'රටෙහි නම', labelEnglish: 'Country' },
];

export const SINHALA_LETTERS = ['අ', 'ක', 'ම', 'න', 'ප', 'ර', 'ස', 'බ', 'ල', 'ව'];
export const ENGLISH_LETTERS = ['A', 'B', 'C', 'D', 'M', 'N', 'P', 'R', 'S', 'T'];

// --- RAHAS WACHANAYA (GAME 2) TYPES ---

// --- RAHAS WACHANAYA (GAME 2) TYPES ---

export enum SpyGamePhase {
  LOBBY = 'LOBBY',
  ASSIGNMENT = 'ASSIGNMENT', // Briefly show roles
  ROUND_IN_PROGRESS = 'ROUND_IN_PROGRESS',
  ROUND_COOLDOWN = 'ROUND_COOLDOWN', // Between rounds
  VOTING = 'VOTING',
  GAME_OVER = 'GAME_OVER',
}

export type SpyRole = 'INNOCENT' | 'IMPOSTER';

export interface SpyMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  roundNumber: number;
  timestamp: number;
}

export interface SpyWord {
  id: string;
  english: string;
  sinhala: string;
  aliases: string[]; // Mixed English, Sinhala, Singlish, Misspellings
}

export interface SpyPlayer extends Player {
  role?: SpyRole;
  hasVotedToStop: boolean;
  hasSubmittedMessage: boolean; // For current round logic
  voteTargetId: string | null;
}

export interface SpyGameState {
  phase: SpyGamePhase;
  roomCode: string | null;
  players: SpyPlayer[];
  round: number; // 1 to 5
  maxRounds: number;
  secretWord: string; // Cannonical English Name
  imposterId: string | null;
  messages: SpyMessage[];
  winner: 'INNOCENT' | 'IMPOSTER' | null;
  winReason: string | null;
  readyForNextRoundTimer?: number | null;
}
