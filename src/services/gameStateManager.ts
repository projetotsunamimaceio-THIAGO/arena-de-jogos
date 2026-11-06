/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  ForcaWordItem,
  GameType,
  Player,
  QuestionQuiz,
  QuestionVF,
  RoomId,
  RoomState,
  StopSubmission,
  Team,
  Theme,
} from '../types/game';

const STORAGE_KEYS = {
  ROOMS: 'arena_rooms_v1',
  THEMES: 'arena_themes_v1',
  QUESTIONS_VF: 'arena_questions_vf_v1',
  QUESTIONS_QUIZ: 'arena_questions_quiz_v1',
  FORCA_WORDS: 'arena_forca_words_v1',
  PLAYERS: 'arena_players_v1',
  TEAMS: 'arena_teams_v1',
  CURRENT_PLAYER: 'arena_current_player_v1',
};

// Seed themes
const DEFAULT_THEMES: Theme[] = [
  { id: 'geografia', name: 'GEOGRAFIA', description: 'Capitais, Países, Relevo e Clima' },
  { id: 'filme-jack', name: 'FILME: JACK', description: 'Perguntas sobre o clássico filme e cinema' },
  { id: 'filme-vingadores', name: 'FILME: VINGADORES', description: 'Universo Marvel, heróis e vilões' },
  { id: 'filme-michael-jackson', name: 'FILME: MICHAEL JACKSON', description: 'Rei do pop e história' },
  { id: 'geografia-do-brasil', name: 'GEOGRAFIA DO BRASIL', description: 'Estados, capitais e regiões' },
  { id: 'ciencias-do-corpo-humano', name: 'CIÊNCIAS DO CORPO HUMANO', description: 'Anatomia e biologia' },
  { id: 'filme-super-8', name: 'FILME SUPER 8', description: 'Cinema e ficção' },
  { id: 'o-estado-de-alagoas', name: 'O ESTADO DE ALAGOAS', description: 'Cultura e geografia local' },
];

// Seed questions for Verdadeiro ou Falso
const DEFAULT_VF_QUESTIONS: QuestionVF[] = [
  {
    id: 'vf-1',
    themeId: 'ciencias',
    question: 'A Terra é o único planeta do sistema solar com água líquida confirmada em abundância na superfície.',
    answer: true,
    explanation: 'Correto! Até o momento, a Terra é o único onde a água líquida cobre mais de 70% da superfície.',
  },
  {
    id: 'vf-2',
    themeId: 'ciencias',
    question: 'O som se propaga no vácuo do espaço sideral.',
    answer: false,
    explanation: 'Falso! O som necessita de um meio material (gás, líquido ou sólido) para se propagar.',
  },
  {
    id: 'vf-3',
    themeId: 'ciencias',
    question: 'A Grande Muralha da China pode ser vista a olho nu da Lua sem auxílio de telescópios.',
    answer: false,
    explanation: 'Falso! Astronautas da NASA confirmam que é impossível vê-la da Lua a olho nu.',
  },
  {
    id: 'vf-4',
    themeId: 'geografia',
    question: 'O Brasil faz fronteira com todos os países da América do Sul, exceto Chile e Equador.',
    answer: true,
    explanation: 'Verdadeiro! O Brasil faz fronteira com 10 países da América do Sul.',
  },
  {
    id: 'vf-5',
    themeId: 'geografia',
    question: 'A capital da Austrália é Sydney.',
    answer: false,
    explanation: 'Falso! A capital oficial da Austrália é Camberra (Canberra).',
  },
  {
    id: 'vf-6',
    themeId: 'filme-vingadores',
    question: 'O escudo do Capitão América nos filmes da Marvel é feito puramente de Adamantium.',
    answer: false,
    explanation: 'Falso! No MCU, o escudo original é feito do metal fictício Vibranium.',
  },
  {
    id: 'vf-7',
    themeId: 'filme-vingadores',
    question: 'Thor é o Deus do Trovão na mitologia nórdica e nos quadrinhos/filmes da Marvel.',
    answer: true,
    explanation: 'Verdadeiro! Thor é o filho de Odin e Deus do Trovão.',
  },
];

// Seed questions for Quiz
const DEFAULT_QUIZ_QUESTIONS: QuestionQuiz[] = [
  {
    id: 'qz-1',
    themeId: 'ciencias',
    question: 'Qual é a unidade básica e menor de armazenamento de informação digital?',
    options: {
      A: 'BIT',
      B: 'BYTE',
      C: 'KILOBYTE',
      D: 'MEGABYTE',
    },
    correct: 'A',
    explanation: 'O Bit (dígito binário 0 ou 1) é a menor unidade fundamental de dado.',
  },
  {
    id: 'qz-2',
    themeId: 'ciencias',
    question: 'Qual planeta do sistema solar é conhecido popularmente como o "Planeta Vermelho"?',
    options: {
      A: 'Vênus',
      B: 'Marte',
      C: 'Júpiter',
      D: 'Mercúrio',
    },
    correct: 'B',
    explanation: 'Marte possui essa coloração avermelhada devido ao óxido de ferro em sua superfície.',
  },
  {
    id: 'qz-3',
    themeId: 'geografia',
    question: 'Qual é o maior país do mundo em extensão territorial?',
    options: {
      A: 'Canadá',
      B: 'China',
      C: 'Rússia',
      D: 'Estados Unidos',
    },
    correct: 'C',
    explanation: 'A Rússia tem mais de 17 milhões de quilômetros quadrados.',
  },
  {
    id: 'qz-4',
    themeId: 'filme-vingadores',
    question: 'Qual Joia do Infinito estava contida dentro do cetro de Loki em Vingadores (2012)?',
    options: {
      A: 'Joia do Espaço',
      B: 'Joia da Mente',
      C: 'Joia do Poder',
      D: 'Joia da Realidade',
    },
    correct: 'B',
    explanation: 'O cetro de Loki escondia a Joia da Mente amarela, que mais tarde deu origem ao Visão.',
  },
];

// Seed forca words
const DEFAULT_FORCA_WORDS: ForcaWordItem[] = [
  {
    id: 'fw-1',
    word: 'AMAZONIA',
    category: 'Geografia',
    hint1: 'Um país muito grande na América do Sul.',
    hint2: 'Tem a maior floresta tropical e rio do mundo.',
    extraHint: 'Se estende por 9 países e é chamada de pulmão do planeta.',
  },
  {
    id: 'fw-2',
    word: 'MICROSCOPIO',
    category: 'Ciências',
    hint1: 'Instrumento óptico usado em laboratório.',
    hint2: 'Permite visualizar células e microrganismos invisíveis a olho nu.',
    extraHint: 'Possui lentes de aumento oculares e objetivas.',
  },
  {
    id: 'fw-3',
    word: 'VIBRANIUM',
    category: 'Filmes Marvel',
    hint1: 'Metal mais valioso e resistente do reino de Wakanda.',
    hint2: 'Usado na confecção do traje do Pantera Negra.',
    extraHint: 'Absorve e redireciona energia cinética.',
  },
];

// Seed Stop categories (5 categorias solicitadas)
export const DEFAULT_STOP_CATEGORIES = [
  'NOME DE PESSOA',
  'FILME / SÉRIE / NOVELA',
  'MARCA QUALQUER',
  'SELEÇÃO DE FUTEBOL',
  'CIDADE OU ESTADO',
];

// Letras padrão bloqueadas no sorteio para não travar o raciocínio dos alunos
export const DEFAULT_BLOCKED_LETTERS = ['K', 'W', 'Y', 'X', 'Z'];

export const COLOR_PALETTE = [
  { id: 'roxo', name: 'ROXO', hex: '#9333ea', bgClass: 'bg-purple-600', ring: 'ring-purple-400' },
  { id: 'vermelho', name: 'VERMELHO', hex: '#ef4444', bgClass: 'bg-red-500', ring: 'ring-red-400' },
  { id: 'azul', name: 'AZUL', hex: '#3b82f6', bgClass: 'bg-blue-500', ring: 'ring-blue-400' },
  { id: 'amarelo', name: 'AMARELO', hex: '#eab308', bgClass: 'bg-yellow-500', ring: 'ring-yellow-300' },
  { id: 'verde', name: 'VERDE', hex: '#22c55e', bgClass: 'bg-green-500', ring: 'ring-green-400' },
  { id: 'laranja', name: 'LARANJA', hex: '#f97316', bgClass: 'bg-orange-500', ring: 'ring-orange-400' },
];

function createDefaultRoom(id: RoomId, code: string): RoomState {
  return {
    id,
    code,
    active: true,
    currentGame: 'none',
    themeId: 'ciencias',
    phase: 'lobby',
    currentQuestionIndex: 0,
    questionTimer: 30,
    isTimerRunning: false,
    cores: {
      forbiddenColor: null,
      roundActive: false,
      duration: 5,
      colorOptions: ['roxo', 'vermelho', 'azul', 'amarelo', 'verde', 'laranja'],
    },
    forca: {
      word: 'AMAZONIA',
      category: 'Geografia',
      hint1: 'Um país muito grande na América do Sul.',
      hint2: 'Tem a maior floresta tropical do mundo.',
      extraHint: 'Se estende por 9 países sul-americanos.',
      revealedHintsCount: 1,
      guessedLetters: [],
      maxErrors: 6,
    },
    stop: {
      letter: 'B',
      usedLetters: ['B'],
      blockedLetters: [...DEFAULT_BLOCKED_LETTERS],
      categories: [...DEFAULT_STOP_CATEGORIES],
      timer: 84, // 1:24
      isStopTriggered: false,
      answersRevealed: false,
    },
    updatedAt: Date.now(),
  };
}

class GameStateManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('arena_de_jogos_sync');
        this.broadcastChannel.onmessage = () => {
          this.notifyListeners();
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment, using storage events.', e);
      }

      window.addEventListener('storage', () => {
        this.notifyListeners();
      });

      this.initializeDefaults();
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    queueMicrotask(() => {
      this.listeners.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.error('Error in listener:', err);
        }
      });
    });
  }

  private broadcastUpdate() {
    this.notifyListeners();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'SYNC', timestamp: Date.now() });
      } catch (e) {
        // Ignore broadcast error
      }
    }
  }

  private initializeDefaults() {
    if (typeof window === 'undefined') return;

    const existingRoomsData = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!existingRoomsData) {
      const initialRooms: Record<RoomId, RoomState> = {
        'SALA 1': createDefaultRoom('SALA 1', '1234'),
        'SALA 2': createDefaultRoom('SALA 2', '2468'),
        'SALA 3': createDefaultRoom('SALA 3', '3691'),
        'SALA 4': createDefaultRoom('SALA 4', '4826'),
      };
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(initialRooms));
    } else {
      try {
        const parsed = JSON.parse(existingRoomsData);
        let updated = false;
        // Ensure static fixed codes for reliable student entry
        const staticCodes: Record<RoomId, string> = {
          'SALA 1': '1234',
          'SALA 2': '2468',
          'SALA 3': '3691',
          'SALA 4': '4826',
        };
        Object.keys(staticCodes).forEach((rKey) => {
          const rId = rKey as RoomId;
          if (parsed[rId] && parsed[rId].code !== staticCodes[rId]) {
            parsed[rId].code = staticCodes[rId];
            updated = true;
          }
        });
        Object.keys(parsed).forEach((rKey) => {
          const room = parsed[rKey as RoomId];
          if (room && room.stop) {
            if (!room.stop.blockedLetters || !Array.isArray(room.stop.blockedLetters)) {
              room.stop.blockedLetters = [...DEFAULT_BLOCKED_LETTERS];
              updated = true;
            }
            const currentCats = room.stop.categories || [];
            if (
              currentCats.length !== DEFAULT_STOP_CATEGORIES.length ||
              currentCats[0] !== DEFAULT_STOP_CATEGORIES[0] ||
              currentCats[1] !== DEFAULT_STOP_CATEGORIES[1]
            ) {
              room.stop.categories = [...DEFAULT_STOP_CATEGORIES];
              updated = true;
            }
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.THEMES)) {
      localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(DEFAULT_THEMES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS_VF)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS_VF, JSON.stringify(DEFAULT_VF_QUESTIONS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS_QUIZ)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS_QUIZ, JSON.stringify(DEFAULT_QUIZ_QUESTIONS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.FORCA_WORDS)) {
      localStorage.setItem(STORAGE_KEYS.FORCA_WORDS, JSON.stringify(DEFAULT_FORCA_WORDS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      const defaultTeams: Team[] = [
        { id: 'equipe-a', name: 'EQUIPE A', roomId: 'SALA 1', color: '#ef4444', score: 35 },
        { id: 'equipe-b', name: 'EQUIPE B', roomId: 'SALA 1', color: '#3b82f6', score: 45 },
        { id: 'equipe-c', name: 'EQUIPE C', roomId: 'SALA 1', color: '#10b981', score: 20 },
      ];
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(defaultTeams));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
    }
  }

  // --- Rooms Management ---
  public getRooms(): Record<RoomId, RoomState> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      'SALA 1': createDefaultRoom('SALA 1', '1234'),
      'SALA 2': createDefaultRoom('SALA 2', '2468'),
      'SALA 3': createDefaultRoom('SALA 3', '3691'),
      'SALA 4': createDefaultRoom('SALA 4', '4826'),
    };
  }

  public getRoom(roomId: RoomId): RoomState {
    const rooms = this.getRooms();
    return rooms[roomId] || createDefaultRoom(roomId, '1234');
  }

  public updateRoom(roomId: RoomId, partial: Partial<RoomState>) {
    const rooms = this.getRooms();
    const current = rooms[roomId] || createDefaultRoom(roomId, '1234');
    rooms[roomId] = {
      ...current,
      ...partial,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    this.broadcastUpdate();
  }

  public regenerateRoomCode(roomId: RoomId): string {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.updateRoom(roomId, { code: newCode });
    return newCode;
  }

  public toggleRoomActive(roomId: RoomId): boolean {
    const room = this.getRoom(roomId);
    const updated = !room.active;
    this.updateRoom(roomId, { active: updated });
    return updated;
  }

  // --- Themes ---
  public getThemes(): Theme[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEMES);
      return data ? JSON.parse(data) : DEFAULT_THEMES;
    } catch {
      return DEFAULT_THEMES;
    }
  }

  public addTheme(name: string, description?: string): Theme {
    const themes = this.getThemes();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newTheme: Theme = { id, name: name.toUpperCase(), description };
    themes.push(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
    this.broadcastUpdate();
    return newTheme;
  }

  public deleteTheme(themeId: string) {
    let themes = this.getThemes();
    themes = themes.filter((t) => t.id !== themeId);
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
    this.broadcastUpdate();
  }

  // --- Questions: Verdadeiro ou Falso ---
  public getVFQuestions(themeId?: string): QuestionVF[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS_VF);
      const all: QuestionVF[] = data ? JSON.parse(data) : DEFAULT_VF_QUESTIONS;
      return themeId ? all.filter((q) => q.themeId === themeId) : all;
    } catch {
      return DEFAULT_VF_QUESTIONS;
    }
  }

  public saveVFQuestion(question: Omit<QuestionVF, 'id'>): QuestionVF {
    const questions = this.getVFQuestions();
    const newQ: QuestionVF = { ...question, id: 'vf-' + Date.now() + Math.random().toString(36).substring(2, 6) };
    questions.push(newQ);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_VF, JSON.stringify(questions));
    this.broadcastUpdate();
    return newQ;
  }

  public deleteVFQuestion(id: string) {
    let questions = this.getVFQuestions();
    questions = questions.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_VF, JSON.stringify(questions));
    this.broadcastUpdate();
  }

  // --- Questions: Quiz ---
  public getQuizQuestions(themeId?: string): QuestionQuiz[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS_QUIZ);
      const all: QuestionQuiz[] = data ? JSON.parse(data) : DEFAULT_QUIZ_QUESTIONS;
      return themeId ? all.filter((q) => q.themeId === themeId) : all;
    } catch {
      return DEFAULT_QUIZ_QUESTIONS;
    }
  }

  public saveQuizQuestion(question: Omit<QuestionQuiz, 'id'>): QuestionQuiz {
    const questions = this.getQuizQuestions();
    const newQ: QuestionQuiz = { ...question, id: 'qz-' + Date.now() + Math.random().toString(36).substring(2, 6) };
    questions.push(newQ);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_QUIZ, JSON.stringify(questions));
    this.broadcastUpdate();
    return newQ;
  }

  public deleteQuizQuestion(id: string) {
    let questions = this.getQuizQuestions();
    questions = questions.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS_QUIZ, JSON.stringify(questions));
    this.broadcastUpdate();
  }

  // --- Forca Words ---
  public getForcaWords(): ForcaWordItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORCA_WORDS);
      return data ? JSON.parse(data) : DEFAULT_FORCA_WORDS;
    } catch {
      return DEFAULT_FORCA_WORDS;
    }
  }

  public saveForcaWord(wordItem: Omit<ForcaWordItem, 'id'>): ForcaWordItem {
    const words = this.getForcaWords();
    const cleanWord = wordItem.word.trim().toUpperCase();
    const item: ForcaWordItem = {
      ...wordItem,
      word: cleanWord,
      id: 'fw-' + Date.now(),
    };
    words.push(item);
    localStorage.setItem(STORAGE_KEYS.FORCA_WORDS, JSON.stringify(words));
    this.broadcastUpdate();
    return item;
  }

  public deleteForcaWord(id: string) {
    let words = this.getForcaWords();
    words = words.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.FORCA_WORDS, JSON.stringify(words));
    this.broadcastUpdate();
  }

  public loadForcaWordIntoRoom(roomId: RoomId, wordItem: ForcaWordItem) {
    const room = this.getRoom(roomId);
    this.updateRoom(roomId, {
      forca: {
        ...room.forca,
        word: wordItem.word.toUpperCase(),
        category: wordItem.category,
        hint1: wordItem.hint1,
        hint2: wordItem.hint2,
        extraHint: wordItem.extraHint,
        revealedHintsCount: 1,
        guessedLetters: [],
        maxErrors: 6,
      },
    });
  }

  // --- Players & Teams ---
  public getPlayers(roomId?: RoomId): Player[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      const all: Player[] = data ? JSON.parse(data) : [];
      return roomId ? all.filter((p) => p.roomId === roomId) : all;
    } catch {
      return [];
    }
  }

  public registerPlayer(name: string, roomId: RoomId, mode: 'individual' | 'equipe', teamId?: string): Player {
    const cleanName = name.trim().toUpperCase();
    const players = this.getPlayers();

    // Check duplicate name in same room
    const existingIndex = players.findIndex((p) => p.roomId === roomId && p.name === cleanName);
    let player: Player;

    if (existingIndex >= 0) {
      player = {
        ...players[existingIndex],
        mode,
        teamId: mode === 'equipe' ? teamId : undefined,
        lastActive: Date.now(),
      };
      players[existingIndex] = player;
    } else {
      player = {
        id: 'p-' + Date.now() + Math.random().toString(36).substring(2, 5),
        name: cleanName,
        roomId,
        mode,
        teamId: mode === 'equipe' ? teamId : undefined,
        score: 0,
        lastActive: Date.now(),
      };
      players.push(player);
    }

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(player));
    this.broadcastUpdate();
    return player;
  }

  public getCurrentPlayer(): Player | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public updatePlayerScore(playerId: string, deltaPoints: number) {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx >= 0) {
      players[idx].score = Math.max(0, players[idx].score + deltaPoints);
      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer && currentPlayer.id === playerId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(players[idx]));
      }

      // If in team, update team score as well
      if (players[idx].mode === 'equipe' && players[idx].teamId) {
        this.updateTeamScore(players[idx].teamId!, deltaPoints);
      }

      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      this.broadcastUpdate();
    }
  }

  public submitPlayerAnswer(playerId: string, answer: any) {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx >= 0) {
      players[idx].currentAnswer = answer;
      players[idx].hasAnsweredCurrentQuestion = true;
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer && currentPlayer.id === playerId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(players[idx]));
      }
      this.broadcastUpdate();
    }
  }

  public resetCurrentAnswers(roomId: RoomId) {
    const players = this.getPlayers();
    players.forEach((p) => {
      if (p.roomId === roomId) {
        p.hasAnsweredCurrentQuestion = false;
        p.currentAnswer = undefined;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    this.broadcastUpdate();
  }

  public kickPlayer(playerId: string) {
    let players = this.getPlayers();
    players = players.filter((p) => p.id !== playerId);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    const current = this.getCurrentPlayer();
    if (current && current.id === playerId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYER);
    }
    this.broadcastUpdate();
  }

  public resetRoomScores(roomId: RoomId) {
    const players = this.getPlayers();
    players.forEach((p) => {
      if (p.roomId === roomId) {
        p.score = 0;
        p.hasAnsweredCurrentQuestion = false;
        p.currentAnswer = undefined;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    const teams = this.getTeams(roomId);
    teams.forEach((t) => (t.score = 0));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    this.broadcastUpdate();
  }

  // --- Teams Management ---
  public getTeams(roomId?: RoomId): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      const all: Team[] = data ? JSON.parse(data) : [];
      return roomId ? all.filter((t) => t.roomId === roomId) : all;
    } catch {
      return [];
    }
  }

  public createTeam(name: string, roomId: RoomId): Team {
    const teams = this.getTeams();
    const teamColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const color = teamColors[teams.length % teamColors.length];
    const newTeam: Team = {
      id: 'eq-' + Date.now() + Math.random().toString(36).substring(2, 5),
      name: name.toUpperCase().startsWith('EQUIPE') ? name.toUpperCase() : `EQUIPE ${name.toUpperCase()}`,
      roomId,
      color,
      score: 0,
    };
    teams.push(newTeam);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.broadcastUpdate();
    return newTeam;
  }

  public updateTeamScore(teamId: string, deltaPoints: number) {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx >= 0) {
      teams[idx].score = Math.max(0, teams[idx].score + deltaPoints);
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      this.broadcastUpdate();
    }
  }

  // --- Stop Submissions & Correction Engine ---
  public submitStopAnswers(
    roomId: RoomId,
    playerId: string,
    playerName: string,
    answers: Record<string, string>,
    teamId?: string
  ) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    const currentSubmissions = { ...(stopState.submissions || {}) };

    currentSubmissions[playerId] = {
      playerId,
      playerName: playerName.toUpperCase(),
      teamId,
      roomId,
      letter: stopState.letter,
      answers,
      pointsPerCategory: currentSubmissions[playerId]?.pointsPerCategory || {},
      totalPoints: currentSubmissions[playerId]?.totalPoints || 0,
      approved: currentSubmissions[playerId]?.approved || false,
    };

    this.updateRoom(roomId, {
      stop: {
        ...stopState,
        submissions: currentSubmissions,
      },
    });
  }

  public evaluateStopSubmissions(roomId: RoomId) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    const currentLetter = (stopState.letter || 'A').toUpperCase();
    const categories = stopState.categories || [];
    const submissions = { ...(stopState.submissions || {}) };

    // For each category, count how many players wrote each cleaned word
    const categoryWordCounts: Record<string, Record<string, number>> = {};
    categories.forEach((cat) => {
      categoryWordCounts[cat] = {};
      Object.values(submissions).forEach((sub) => {
        const rawWord = (sub.answers[cat] || '').trim().toUpperCase();
        if (rawWord && rawWord.startsWith(currentLetter)) {
          categoryWordCounts[cat][rawWord] = (categoryWordCounts[cat][rawWord] || 0) + 1;
        }
      });
    });

    // Score each submission automatically
    Object.values(submissions).forEach((sub) => {
      const pointsPerCat: Record<string, number> = {};
      let total = 0;

      categories.forEach((cat) => {
        const rawWord = (sub.answers[cat] || '').trim().toUpperCase();
        if (!rawWord || !rawWord.startsWith(currentLetter)) {
          pointsPerCat[cat] = 0;
        } else {
          const count = categoryWordCounts[cat][rawWord] || 0;
          if (count > 1) {
            pointsPerCat[cat] = 5; // Repetida por outro aluno
          } else {
            pointsPerCat[cat] = 10; // Exclusiva / Única
          }
        }
        total += pointsPerCat[cat];
      });

      sub.pointsPerCategory = pointsPerCat;
      sub.totalPoints = total;
      sub.approved = true;
    });

    this.updateRoom(roomId, {
      stop: {
        ...stopState,
        answersRevealed: true,
        submissions,
      },
    });
  }

  public overrideStopCategoryPoints(
    roomId: RoomId,
    playerId: string,
    category: string,
    points: number
  ) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    const submissions = { ...(stopState.submissions || {}) };

    if (submissions[playerId]) {
      const currentPoints = { ...(submissions[playerId].pointsPerCategory || {}) };
      currentPoints[category] = points;

      let newTotal = 0;
      Object.values(currentPoints).forEach((pts) => {
        newTotal += pts;
      });

      submissions[playerId].pointsPerCategory = currentPoints;
      submissions[playerId].totalPoints = newTotal;

      this.updateRoom(roomId, {
        stop: {
          ...stopState,
          submissions,
        },
      });
    }
  }

  public applyStopScoresToRoom(roomId: RoomId) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    const submissions = stopState.submissions || {};

    if (stopState.scoresApplied) return;

    Object.values(submissions).forEach((sub) => {
      if (sub.totalPoints > 0) {
        this.updatePlayerScore(sub.playerId, sub.totalPoints);
      }
    });

    this.updateRoom(roomId, {
      stop: {
        ...stopState,
        scoresApplied: true,
      },
    });
  }

  public toggleStopBlockedLetter(roomId: RoomId, letter: string) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    const current = new Set(stopState.blockedLetters || DEFAULT_BLOCKED_LETTERS);
    const upper = letter.toUpperCase();

    if (current.has(upper)) {
      current.delete(upper);
    } else {
      current.add(upper);
    }

    this.updateRoom(roomId, {
      stop: {
        ...stopState,
        blockedLetters: Array.from(current).sort(),
      },
    });
  }

  public setStopBlockedLetters(roomId: RoomId, letters: string[]) {
    const room = this.getRoom(roomId);
    const stopState = room.stop;
    this.updateRoom(roomId, {
      stop: {
        ...stopState,
        blockedLetters: [...letters].map((l) => l.toUpperCase()).sort(),
      },
    });
  }

  // --- Spreadsheet (XLSX) Import and Template Generators ---
  public parseVFExcel(fileBuffer: ArrayBuffer, themeId: string): { success: boolean; count: number; error?: string } {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames.find((s) => s.toLowerCase().includes('quest')) || workbook.SheetNames[0];
      if (!sheetName) return { success: false, count: 0, error: 'Aba de questões não encontrada no arquivo.' };

      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        return { success: false, count: 0, error: 'A planilha precisa conter cabeçalho e ao menos uma pergunta.' };
      }

      // Expected columns: A = PERGUNTA, B = V, C = F
      const newQuestions: QuestionVF[] = [];
      let skipped = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue;

        const questionText = String(row[0]).trim();
        const vCell = row[1] !== undefined ? String(row[1]).trim().toUpperCase() : '';
        const fCell = row[2] !== undefined ? String(row[2]).trim().toUpperCase() : '';

        const isV = vCell === 'V' || vCell === 'X' || vCell === '1' || vCell === 'SIM';
        const isF = fCell === 'F' || fCell === 'X' || fCell === '1' || fCell === 'SIM';

        if ((isV && isF) || (!isV && !isF)) {
          // invalid row: either both marked or neither
          skipped++;
          continue;
        }

        newQuestions.push({
          id: 'vf-xlsx-' + Date.now() + '-' + i,
          themeId,
          question: questionText,
          answer: isV,
        });
      }

      if (newQuestions.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'Nenhuma pergunta válida encontrada. Verifique se as colunas V ou F contêm "X" ou "V".',
        };
      }

      const existing = this.getVFQuestions();
      localStorage.setItem(STORAGE_KEYS.QUESTIONS_VF, JSON.stringify([...existing, ...newQuestions]));
      this.broadcastUpdate();
      return { success: true, count: newQuestions.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Falha ao processar arquivo XLSX.' };
    }
  }

  public parseQuizExcel(fileBuffer: ArrayBuffer, themeId: string): { success: boolean; count: number; error?: string } {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return { success: false, count: 0, error: 'Aba de questões não encontrada.' };

      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        return { success: false, count: 0, error: 'A planilha precisa conter cabeçalho e ao menos uma pergunta.' };
      }

      // Expected columns: PERGUNTA, A, B, C, D, CORRETA
      const newQuizList: QuestionQuiz[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0] || !row[1] || !row[2] || !row[3] || !row[4] || !row[5]) continue;

        const question = String(row[0]).trim();
        const optA = String(row[1]).trim();
        const optB = String(row[2]).trim();
        const optC = String(row[3]).trim();
        const optD = String(row[4]).trim();
        const correct = String(row[5]).trim().toUpperCase();

        if (!['A', 'B', 'C', 'D'].includes(correct)) continue;

        newQuizList.push({
          id: 'qz-xlsx-' + Date.now() + '-' + i,
          themeId,
          question,
          options: { A: optA, B: optB, C: optC, D: optD },
          correct: correct as 'A' | 'B' | 'C' | 'D',
        });
      }

      if (newQuizList.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'Nenhuma pergunta válida encontrada. Verifique se as colunas são: PERGUNTA, A, B, C, D, CORRETA.',
        };
      }

      const existing = this.getQuizQuestions();
      localStorage.setItem(STORAGE_KEYS.QUESTIONS_QUIZ, JSON.stringify([...existing, ...newQuizList]));
      this.broadcastUpdate();
      return { success: true, count: newQuizList.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Falha ao processar arquivo XLSX.' };
    }
  }

  public downloadVFTemplate() {
    const data = [
      ['PERGUNTA', 'V', 'F'],
      ['A Terra é o único planeta conhecido com água líquida na superfície?', 'X', ''],
      ['O som consegue se propagar no vácuo do espaço sideral?', '', 'X'],
      ['A muralha da China pode ser vista da Lua a olho nu?', '', 'X'],
      ['O Brasil possui fronteira terrestre com o Uruguai?', 'X', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questões');

    const resultWs = XLSX.utils.aoa_to_sheet([['RESULTADOS', 'STATUS'], ['Total de Questões', 4]]);
    XLSX.utils.book_append_sheet(wb, resultWs, 'Resultados');

    XLSX.writeFile(wb, 'Jogo_Verdadeiro_Falso_Modelo.xlsx');
  }

  public downloadQuizTemplate() {
    const data = [
      ['PERGUNTA', 'A', 'B', 'C', 'D', 'CORRETA'],
      ['Qual é a menor unidade de informação no computador?', 'BIT', 'BYTE', 'KILOBYTE', 'MEGABYTE', 'A'],
      ['Qual planeta é conhecido como Planeta Vermelho?', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'B'],
      ['Quantos estados tem o Brasil mais o DF?', '25', '26', '27', '28', 'C'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Perguntas_Quiz');

    XLSX.writeFile(wb, 'Quiz_Perguntas_Modelo.xlsx');
  }

  public parseForcaExcel(fileBuffer: ArrayBuffer): { success: boolean; count: number; error?: string } {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName =
        workbook.SheetNames.find((s) => s.toLowerCase().includes('forca') || s.toLowerCase().includes('palavr')) ||
        workbook.SheetNames[0];
      if (!sheetName) return { success: false, count: 0, error: 'Aba de palavras não encontrada.' };

      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        return { success: false, count: 0, error: 'A planilha precisa conter cabeçalho e ao menos uma palavra.' };
      }

      // Expected columns: PALAVRA, CATEGORIA, DICA 1, DICA 2, DICA EXTRA
      const newForcaList: ForcaWordItem[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue;

        // Clean secret word: keep letters, spaces or hyphens, uppercase
        const rawWord = String(row[0]).trim().toUpperCase();
        // Remove accents for clean hangman play (AMAZÔNIA -> AMAZONIA)
        const normalizedWord = rawWord
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z\s]/g, '')
          .trim();

        if (!normalizedWord || normalizedWord.length < 2) continue;

        const category = row[1] ? String(row[1]).trim() : 'Geral';
        const hint1 = row[2] ? String(row[2]).trim() : 'Dica 1 não informada';
        const hint2 = row[3] ? String(row[3]).trim() : 'Dica 2 não informada';
        const extraHint = row[4] ? String(row[4]).trim() : 'Dica extra não informada';

        newForcaList.push({
          id: 'fw-xlsx-' + Date.now() + '-' + i,
          word: normalizedWord,
          category,
          hint1,
          hint2,
          extraHint,
        });
      }

      if (newForcaList.length === 0) {
        return {
          success: false,
          count: 0,
          error:
            'Nenhuma palavra válida encontrada. Verifique se as colunas são: PALAVRA, CATEGORIA, DICA 1, DICA 2, DICA EXTRA.',
        };
      }

      const existing = this.getForcaWords();
      localStorage.setItem(STORAGE_KEYS.FORCA_WORDS, JSON.stringify([...existing, ...newForcaList]));
      this.broadcastUpdate();
      return { success: true, count: newForcaList.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Falha ao processar arquivo XLSX da Forca.' };
    }
  }

  public downloadForcaTemplate() {
    const data = [
      ['PALAVRA', 'CATEGORIA', 'DICA 1', 'DICA 2', 'DICA EXTRA'],
      [
        'AMAZONIA',
        'Geografia',
        'Fica na América do Sul e possui o maior rio em volume d’água',
        'Abriga a maior floresta tropical do planeta',
        'Se estende por 9 países sul-americanos',
      ],
      [
        'VIBRANIUM',
        'Cinema & Quadrinhos',
        'Metal fictício ultra resistente do reino de Wakanda',
        'Utilizado no escudo do Capitão América e traje do Pantera Negra',
        'Capaz de absorver e redirecionar impactos de energia cinética',
      ],
      [
        'MICROSCOPIO',
        'Ciências',
        'Instrumento óptico fundamental em laboratórios biológicos',
        'Possui conjunto de lentes oculares e objetivas de aumento',
        'Permite visualizar células vivas, bactérias e microrganismos',
      ],
      [
        'SATURNO',
        'Astronomia',
        'Sexto planeta a partir do Sol no nosso sistema solar',
        'Reconhecido mundialmente pelo seu espetacular sistema de anéis',
        'É o segundo maior planeta do sistema solar, atrás apenas de Júpiter',
      ],
      [
        'DINOSSAURO',
        'História & Biologia',
        'Répteis gigantes que dominaram a Terra no período mesozóico',
        'Extintos após o impacto devastador de um meteoro há 66 milhões de anos',
        'Tiranossauro Rex e Velociraptor são exemplos famosos no cinema',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Palavras_Forca');

    const infoWs = XLSX.utils.aoa_to_sheet([
      ['INSTRUÇÕES', 'JOGO DA FORCA - ARENA DE JOGOS'],
      ['Coluna A (PALAVRA)', 'Palavra secreta que os alunos devem adivinhar (ex: BRASIL)'],
      ['Coluna B (CATEGORIA)', 'Área temática da palavra (ex: Geografia, Ciências, Cinema)'],
      ['Coluna C (DICA 1)', 'Primeira pista liberada para os alunos'],
      ['Coluna D (DICA 2)', 'Segunda pista liberada para os alunos'],
      ['Coluna E (DICA EXTRA)', 'Pista final de desempate/revelação'],
    ]);
    XLSX.utils.book_append_sheet(wb, infoWs, 'Instruções');

    XLSX.writeFile(wb, 'Jogo_da_Forca_Modelo.xlsx');
  }
}

export const gameStateManager = new GameStateManager();
