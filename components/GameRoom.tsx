import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, LanguageMode, Player, GameState, CATEGORIES } from '../types';
import { getRandomLetter, generateRoomCode } from '../constants';
import { D3Chart } from './D3Chart';
import { Lobby } from './Lobby';



import { useParams, useNavigate } from 'react-router-dom';

// Imports already handled in previous step, ensuring clean start
import { GameService } from '../services/gameService';
// const STORAGE_PREFIX = 'GPMP_ROOM_'; // REMOVED

import { Unsubscribe } from 'firebase/database';

const STORAGE_PREFIX = 'GPMP_ROOM_'; // Kept for legacy/fallback if needed, or we just remove usage completely.


export const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // STATE
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.MODE_SELECTION,
    language: LanguageMode.SINHALA,
    currentRound: 1,
    totalRounds: 3,
    currentLetter: '',
    players: [],
    timer: null,
    reviewingPlayerIndex: 0,
    finisherId: null,
    roomCode: roomId || null,
  });

  const [myInputs, setMyInputs] = useState<Record<string, string>>({});
  const [playerName, setPlayerName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-join if roomId corresponds to local storage state
  useEffect(() => {
    if (roomId) {
      setGameState(prev => ({ ...prev, roomCode: roomId }));

      // Subscribe to Firebase
      // We don't have "loadFromStorage" anymore in the same way, we rely on the subscription below.
      setJoinRoomCode(roomId);
    }
  }, [roomId]);

  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    if (newState.roomCode) {
      GameService.updateGameState(newState.roomCode, newState);
    }
  }, []);

  useEffect(() => {
    if (!gameState.roomCode) return;

    // Subscribe to real-time updates
    const unsubscribe = GameService.subscribeToRoom(gameState.roomCode, (data: GameState) => {
      if (data) {
        setGameState(prev => {
          // Prevent loop if local state is ahead (basic optimistic UI) - 
          // For now, simple overwrite is safer for consistency across devices
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            // FIREBASE FIX: Ensure players is always an array and filter out potential nulls (sparse arrays)
            const safePlayers = data.players
              ? (Array.isArray(data.players) ? data.players.filter(Boolean) : Object.values(data.players))
              : [];

            return {
              ...data,
              players: safePlayers,
            };
          }
          return prev;
        });
      }
    });

    return () => {
      // Unsubscribe needs to be handled if onValue returns unsubscribe function
      unsubscribe();
    };
  }, [gameState.roomCode]);

  // ACTIONS
  const handleQuitGame = () => {
    // Navigate home
    navigate('/');
  };

  const copyInviteLink = () => {
    try {
      const url = `${window.location.origin}/word-game/${gameState.roomCode}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => alert(`Share this link: ${url}`));
    } catch (e) { }
  };

  const startHost = async () => {
    try {
      if (!playerName.trim()) { setErrorMsg('Please enter your name'); return; }
      const code = generateRoomCode();
      const userId = 'user-' + Date.now();
      setCurrentUserId(userId);
      const initialPlayer: Player = { id: userId, name: playerName, isBot: false, isHost: true, score: 0, isReady: true, hasFinished: false, answers: {}, validations: {} };
      const newState: GameState = { phase: GamePhase.LOBBY, language: LanguageMode.SINHALA, currentRound: 1, totalRounds: 3, currentLetter: '', players: [initialPlayer], timer: null, reviewingPlayerIndex: 0, finisherId: null, roomCode: code };

      // CRITICAL: Wait for server confirmation before showing Lobby
      await GameService.updateGameState(code, newState);

      updateGameState(newState);
      setErrorMsg('');

      // Navigate to the new room URL
      navigate(`/word-game/${code}`);

    } catch (e: any) {
      console.error("Create failed:", e);
      setErrorMsg('Could not create room: ' + (e.message || 'Connection error'));
    }
  };

  const joinGame = async () => {
    try {
      if (!playerName.trim()) { setErrorMsg('Please enter your name'); return; }
      const codeToJoin = joinRoomCode.trim();
      if (!codeToJoin) { setErrorMsg('Please enter a room code'); return; }

      const serverState = await GameService.getRoomState(codeToJoin);
      if (!serverState) { setErrorMsg('Room not found'); return; }

      // Allow joining even if in Lobby (standard) or playing (re-join?)
      if (serverState.phase !== GamePhase.LOBBY && serverState.phase !== GamePhase.MODE_SELECTION) {
        // simplified
      }

      const existingPlayer = serverState.players.find((p: Player) => p.name.toLowerCase() === playerName.trim().toLowerCase());
      let newState = { ...serverState };
      if (existingPlayer) {
        setCurrentUserId(existingPlayer.id);
      } else {
        const userId = 'user-' + Date.now();
        setCurrentUserId(userId);
        const newPlayer: Player = { id: userId, name: playerName, isBot: false, isHost: false, score: 0, isReady: true, hasFinished: false, answers: {}, validations: {} };
        newState.players = [...serverState.players, newPlayer];

        // Update server with new player
        await GameService.updateGameState(codeToJoin, newState);
      }

      setErrorMsg('');
      if (existingPlayer) setGameState(newState);

      if (roomId !== codeToJoin) {
        navigate(`/word-game/${codeToJoin}`);
      }

    } catch (e) { setErrorMsg('Could not join room'); }
  };



  const startGame = () => {
    const newState: GameState = { ...gameState, phase: GamePhase.PLAYING, currentRound: 1, currentLetter: getRandomLetter(gameState.language), timer: null, finisherId: null };
    updateGameState(newState);
    setMyInputs({});
  };

  // Clear inputs when round changes
  useEffect(() => {
    setMyInputs({});
  }, [gameState.currentRound]);

  // Auto-submit answers when someone else finishes the round
  useEffect(() => {
    if (gameState.phase === GamePhase.FINISHED_WAITING && !gameState.finisherId) {
      // Should not happen, logic implies finisherId is set
    }

    if (gameState.phase === GamePhase.FINISHED_WAITING) {
      const me = gameState.players.find(p => p.id === currentUserId);
      if (me) {
        // Prepare current answers (local)
        const currentAnswers = myInputs || {};

        // Prepare server answers (checking safely)
        const serverAnswers = me.answers || {};

        // Check if we need to sync:
        // 1. Not marked finished yet
        // 2. OR Answers have changed locally vs server
        // We use JSON.stringify for simple deep comparison of the answer map
        const answersChanged = JSON.stringify(currentAnswers) !== JSON.stringify(serverAnswers);

        if (!me.hasFinished || answersChanged) {
          const myIndex = gameState.players.findIndex(p => p.id === currentUserId);
          if (myIndex !== -1) {
            const myPlayer = {
              ...gameState.players[myIndex],
              hasFinished: true,
              answers: currentAnswers
            };
            // Sync to server
            GameService.updatePath(gameState.roomCode!, `players/${myIndex}`, myPlayer);
          }
        }
      }
    }
  }, [gameState.phase, gameState.players, currentUserId, myInputs, updateGameState]);

  const handleFinishRound = async () => {
    if (gameState.phase !== GamePhase.PLAYING) return;

    const myIndex = gameState.players.findIndex(p => p.id === currentUserId);
    if (myIndex === -1) return;

    // 1. Prepare my player update
    const myPlayer = {
      ...gameState.players[myIndex],
      hasFinished: true,
      answers: myInputs
    };

    // 2. Optimistic Update (Local)
    const updatedPlayers = [...gameState.players];
    updatedPlayers[myIndex] = myPlayer;

    // We update local state to reflect UI changes immediately
    setGameState({
      ...gameState,
      players: updatedPlayers,
      phase: GamePhase.FINISHED_WAITING,
      finisherId: currentUserId,
      timer: 10
    });

    // 3. Network Update (Partial/Atomic)
    // We update ONLY:
    // - My player data (at my index)
    // - The global phase, timer, and finisherId
    // This leaves other players' data ALONE.
    const updates: any = {};
    updates[`players/${myIndex}`] = myPlayer;
    updates['phase'] = GamePhase.FINISHED_WAITING;
    updates['finisherId'] = currentUserId;
    updates['timer'] = 10;

    await GameService.patchGameState(gameState.roomCode!, updates);
  };

  const isHost = gameState.players.find(p => p.id === currentUserId)?.isHost;

  useEffect(() => {
    if (!isHost) return;
    if (gameState.phase === GamePhase.FINISHED_WAITING && gameState.timer !== null) {
      if (gameState.timer > 0) {
        timerRef.current = setTimeout(() => {
          // With Firebase, we just push the new timer value. 
          // We rely on the fact that we passed the task boundary check.
          // However, to be safe against race conditions, we could transaction, but let's keep it simple for now.
          updateGameState({ ...gameState, timer: (gameState.timer as number) - 1 });
        }, 1000);
      } else {
        finalizeRoundHost();
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState.phase, gameState.timer, isHost, gameState.roomCode, updateGameState]);

  const finalizeRoundHost = async () => {
    // SAFETY: Trust local state but sanitize players mapping
    const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];

    const updatedPlayers = safePlayers.map(p => {
      // Ensure answers object exists
      const finalAnswers = p.answers || {};
      return {
        ...p,
        hasFinished: true,
        answers: finalAnswers
      };
    });

    // CRITICAL: Ensure reviewingPlayerIndex is valid for next phase
    const nextIndex = (safePlayers.length > 0) ? 0 : 0;

    // Use patchGameState to be safer against concurrent writes, 
    // although for full-phase transitions, Host usually dictates truth.
    // But let's stick to updateGameState to sync the FULL player list changes (answers finalized)
    // We already sanitized the list so it shouldn't crash.
    const newState = {
      ...gameState,
      players: updatedPlayers,
      phase: GamePhase.REVIEW,
      reviewingPlayerIndex: nextIndex,
      timer: null
    };

    updateGameState(newState);
  };

  const handleValidation = (playerId: string, categoryId: string, isValid: boolean) => {
    // Local Optimistic Update
    const updatedPlayers = gameState.players.map(p => p.id === playerId ? { ...p, validations: { ...p.validations, [categoryId]: isValid } } : p);
    setGameState({ ...gameState, players: updatedPlayers });

    // Network Update (Granular)
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1 && gameState.roomCode) {
      GameService.updatePath(gameState.roomCode, `players/${playerIndex}/validations/${categoryId}`, isValid);
    }
  };

  const nextReviewHost = () => {
    if (!isHost) return;
    // SAFETY: Use safePlayers to match Review render logic
    const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];
    if (gameState.reviewingPlayerIndex < safePlayers.length - 1) {
      updateGameState({ ...gameState, reviewingPlayerIndex: gameState.reviewingPlayerIndex + 1 });
    } else {
      calculateScoresAndNextRoundHost();
    }
  };

  const calculateScoresAndNextRoundHost = () => {
    // SAFETY: Use optional chaining to access arrays
    const effectivePlayers = Array.isArray(gameState.players) ? gameState.players : [];

    const scoredPlayers = effectivePlayers.map(p => {
      let roundScore = 0;
      CATEGORIES.forEach(cat => {
        // Default to true if answer exists and not explicitly marked false
        // SAFETY: use ?. to prevent crash if validations/answers are undefined
        const isCorrect = p.validations?.[cat.id] ?? !!p.answers?.[cat.id];
        if (isCorrect) roundScore += 10;
      });
      return { ...p, score: p.score + roundScore, validations: {}, answers: {}, hasFinished: false };
    });

    if (gameState.currentRound >= gameState.totalRounds) {
      updateGameState({ ...gameState, players: scoredPlayers, phase: GamePhase.LEADERBOARD });
    } else {
      updateGameState({ ...gameState, players: scoredPlayers, currentRound: gameState.currentRound + 1, currentLetter: getRandomLetter(gameState.language), phase: GamePhase.PLAYING, finisherId: null, timer: null });
    }
  };

  const handlePlayAgainHost = () => {
    if (!isHost) return;
    updateGameState({ ...gameState, phase: GamePhase.LOBBY, currentRound: 1, totalRounds: 3, currentLetter: '', timer: null, finisherId: null, reviewingPlayerIndex: 0, players: gameState.players.map(p => ({ ...p, score: 0, answers: {}, validations: {}, hasFinished: false, isReady: true })) });
  };


  // --- RENDER PHASES ---

  // SAFETY BELT: Ensure players is always an array during render
  const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];
  const isPlayerInGame = currentUserId && safePlayers.some(p => p.id === currentUserId);
  const showJoinScreen = gameState.phase === GamePhase.MODE_SELECTION || !isPlayerInGame;

  // 1. MODE SELECTION (Setup) or JOIN SCREEN
  if (showJoinScreen) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-3xl font-serif font-bold text-sl-brown mb-8 text-center">Start Your Journey</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Host Card */}
          <div className="bg-white rounded-3xl shadow-card p-8 text-center border border-sl-sand hover:border-sl-maroon transition-all group">
            <div className="w-20 h-20 bg-sl-sand rounded-full mx-auto flex items-center justify-center mb-6 group-hover:bg-sl-maroon/10 transition-colors">
              <span className="text-4xl">🏠</span>
            </div>
            <h3 className="text-2xl font-bold text-sl-brown mb-2">Create Room</h3>
            <p className="text-sl-clay mb-6 text-sm">Be the host and invite your friends.</p>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-sl-paper border border-sl-sand rounded-xl p-4 text-center mb-4 focus:ring-2 focus:ring-sl-maroon focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-sl-brown"
              placeholder="Enter Your Name"
            />

            <div className="flex space-x-3 mb-6">
              <button onClick={() => setGameState(p => ({ ...p, language: LanguageMode.SINHALA }))} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${gameState.language === LanguageMode.SINHALA ? 'bg-sl-maroon text-white shadow-md' : 'bg-sl-paper text-sl-clay hover:bg-sl-sand'}`}>Sinhala</button>
              <button onClick={() => setGameState(p => ({ ...p, language: LanguageMode.ENGLISH }))} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${gameState.language === LanguageMode.ENGLISH ? 'bg-sl-maroon text-white shadow-md' : 'bg-sl-paper text-sl-clay hover:bg-sl-sand'}`}>English</button>
            </div>

            <button onClick={startHost} className="w-full bg-sl-maroon text-sl-gold py-4 rounded-xl font-bold text-lg hover:bg-sl-brown hover:shadow-lg transition-all transform active:scale-95 border-2 border-sl-maroon">Create New Room</button>
          </div>

          {/* Join Card */}
          <div className="bg-white rounded-3xl shadow-card p-8 text-center border border-sl-sand hover:border-sl-gold transition-all group">
            <div className="w-20 h-20 bg-sl-sand rounded-full mx-auto flex items-center justify-center mb-6 group-hover:bg-sl-gold/10 transition-colors">
              <span className="text-4xl">👋</span>
            </div>
            <h3 className="text-2xl font-bold text-sl-brown mb-2">Join Room</h3>
            <p className="text-sl-clay mb-6 text-sm">Enter a code to join an existing game.</p>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-sl-paper border border-sl-sand rounded-xl p-4 text-center mb-4 focus:ring-2 focus:ring-sl-gold focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-sl-brown"
              placeholder="Enter Your Name"
            />

            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              className="w-full bg-sl-paper border-2 border-sl-sand rounded-xl p-4 text-center mb-6 font-mono text-xl tracking-widest text-sl-brown focus:border-sl-gold outline-none"
              placeholder="CODE"
              maxLength={4}
            />

            <button onClick={joinGame} className="w-full bg-sl-gold text-sl-brown py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:shadow-lg transition-all transform active:scale-95">Join Game</button>
            {errorMsg && <p className="text-red-500 text-sm mt-4 font-medium bg-red-50 p-2 rounded-lg">{errorMsg}</p>}
          </div>
        </div>
        <button onClick={handleQuitGame} className="block mx-auto mt-8 text-sl-clay hover:text-sl-brown font-medium text-sm underline">Back to Home</button>
      </div>
    );
  }

  // 2. LOBBY (Waiting)
  if (gameState.phase === GamePhase.LOBBY) {
    return (
      <Lobby
        roomCode={gameState.roomCode!}
        players={gameState.players}
        isHost={!!isHost}
        onStartGame={startGame}
        onQuit={handleQuitGame}
      />
    );
  }

  // 3. GAMEPLAY (The Table)
  if (gameState.phase === GamePhase.PLAYING || gameState.phase === GamePhase.FINISHED_WAITING) {
    const isLocked = gameState.phase === GamePhase.FINISHED_WAITING && gameState.finisherId !== currentUserId;
    const finisherName = gameState.players.find(p => p.id === gameState.finisherId)?.name;

    return (
      <div className="container mx-auto px-4 py-4 max-w-5xl h-[calc(100dvh-6rem)] flex flex-col relative">
        {/* Top Bar */}
        {/* Top Bar - Compacted */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-sl-sand p-3 md:p-4 rounded-3xl shadow-soft mb-4 border border-white/5 backdrop-blur-sm">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <span className="block text-sl-clay text-[10px] font-bold uppercase tracking-widest mb-1">Current Letter</span>
            <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sl-gold to-yellow-600 drop-shadow-lg font-serif">{gameState.currentLetter}</span>
          </div>

          <div className="flex -space-x-3">
            {gameState.players.map(p => (
              <div key={p.id} className={`w-12 h-12 rounded-full border-4 border-sl-sand flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform hover:scale-110 hover:z-10 ${p.hasFinished ? 'bg-sl-maroon shadow-glow ring-2 ring-sl-maroon/50' : 'bg-sl-paper text-sl-clay'}`} title={p.name}>
                {p.name.charAt(0)}
              </div>
            ))}
          </div>

          <div className="text-center md:text-right mt-4 md:mt-0">
            <span className="block text-sl-clay text-xs font-bold uppercase tracking-widest mb-1">Cooldown</span>
            {gameState.timer !== null ? (
              <div className="text-4xl font-mono font-bold text-sl-terracotta animate-pulse-fast drop-shadow-lg">00:{gameState.timer < 10 ? `0${gameState.timer}` : gameState.timer}</div>
            ) : (
              <div className="text-4xl font-mono font-bold text-sl-paper/50">--:--</div>
            )}
          </div>
        </div>

        {/* The "Paper" Form - Compacted Grid */}
        <div className="bg-sl-sand rounded-3xl shadow-card p-4 md:p-6 mb-0 relative overflow-y-auto flex-1 custom-scrollbar pb-24 border border-white/5">
          {isLocked && (
            <div className="mb-6 bg-sl-maroon/10 text-sl-maroon px-6 py-3 rounded-xl border border-sl-maroon/20 flex items-center justify-center animate-pulse">
              <span className="font-bold text-lg mr-2">🛑 {finisherName} said STOP!</span>
              <span className="text-sm font-medium">Hurry! Completing in {gameState.timer}s...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="group relative">
                <label className="block text-xs font-bold text-sl-clay/70 mb-2 ml-1 uppercase tracking-wider">
                  {gameState.language === LanguageMode.SINHALA ? cat.labelSinhala : cat.labelEnglish}
                </label>
                <input
                  type="text"
                  disabled={gameState.phase === GamePhase.FINISHED_WAITING && gameState.finisherId === currentUserId}
                  value={myInputs[cat.id] || ''}
                  onChange={(e) => setMyInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  className="w-full bg-transparent border-b-2 border-sl-paper/50 focus:border-sl-gold rounded-t-lg px-3 py-2 text-lg font-bold text-sl-brown placeholder-sl-clay/20 outline-none transition-all focus:bg-sl-paper/30"
                  placeholder={`${gameState.currentLetter}...`}
                  autoComplete="off"
                />
                <div className="absolute bottom-0 left-0 h-0.5 bg-sl-gold w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        {gameState.phase === GamePhase.PLAYING && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40 px-6">
            <button
              onClick={handleFinishRound}
              className="bg-sl-maroon text-white text-2xl font-black py-4 px-16 rounded-full shadow-glow border-4 border-sl-sand transform transition-all active:scale-95 hover:bg-red-600 hover:scale-105 hover:rotate-1"
            >
              {gameState.language === LanguageMode.SINHALA ? 'අවසන්! (STOP)' : 'STOP!'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. REVIEW (Voting)
  if (gameState.phase === GamePhase.REVIEW) {
    // SAFETY: Handle case where players array is empty or index is out of bounds
    const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];
    const player = safePlayers[gameState.reviewingPlayerIndex];

    if (!player) {
      // Fallback UI if data is corrupted
      return (
        <div className="container mx-auto p-10 text-center">
          <h2 className="text-2xl font-bold text-sl-brown">Loading Review...</h2>
          <button onClick={handleQuitGame} className="mt-4 text-sm underline opacity-50">Exit if stuck</button>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif font-bold text-sl-brown drop-shadow-md">Review Answers</h2>
          <p className="text-sl-clay mt-2 font-medium">Check accuracy together. Majority decision rules.</p>
        </div>

        {/* Player Card */}
        <div className="bg-sl-sand rounded-3xl shadow-card overflow-hidden border border-white/5">
          <div className="bg-sl-paper/50 p-6 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-sl-maroon rounded-full text-white flex items-center justify-center font-bold text-2xl mr-4 border-2 border-sl-gold shadow-glow">
                {player.name.charAt(0)}
              </div>
              <div>
                <span className="block text-xs text-sl-clay font-bold uppercase tracking-widest">Player</span>
                <span className="text-2xl font-bold text-sl-brown">{player.name}</span>
              </div>
            </div>
            <div className="text-sm font-bold text-sl-gold bg-sl-maroon/10 px-3 py-1 rounded-lg border border-sl-maroon/20">
              {gameState.reviewingPlayerIndex + 1} / {safePlayers.length}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {CATEGORIES.map((cat, idx) => {
              const answer = player.answers?.[cat.id]; // Safe access
              const isValid = player.validations?.[cat.id] ?? !!answer;
              return (
                <div key={cat.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="mb-4 md:mb-0">
                    <span className="block text-xs font-bold text-sl-clay/70 uppercase mb-1 tracking-wider">
                      {gameState.language === LanguageMode.SINHALA ? cat.labelSinhala : cat.labelEnglish}
                    </span>
                    <span className={`text-xl font-medium ${!answer ? 'text-sl-clay/30 italic' : 'text-sl-brown'}`}>
                      {answer || '— Skipped —'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleValidation(player.id, cat.id, true)}
                      className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all ${isValid ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50' : 'bg-sl-paper text-sl-clay hover:bg-sl-paper/80'}`}
                    >
                      <span className="mr-2">Correct</span> ✓
                    </button>
                    <button
                      onClick={() => handleValidation(player.id, cat.id, false)}
                      className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all ${!isValid ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50' : 'bg-sl-paper text-sl-clay hover:bg-sl-paper/80'}`}
                    >
                      <span className="mr-2">Wrong</span> ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          {isHost ? (
            <button onClick={nextReviewHost} className="bg-sl-maroon text-white px-10 py-4 rounded-full font-bold shadow-glow hover:bg-red-700 transition-all flex items-center text-lg active:scale-95 border-2 border-sl-maroon/50">
              Next Player <span className="ml-2">→</span>
            </button>
          ) : (
            <div className="flex items-center text-sl-clay bg-sl-sand px-6 py-3 rounded-full shadow-sm border border-white/5">
              <div className="w-2 h-2 bg-sl-maroon rounded-full animate-ping mr-3"></div>
              Waiting for host...
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. RESULTS
  if (gameState.phase === GamePhase.LEADERBOARD) {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl text-center">
        <h2 className="text-4xl font-serif font-bold text-sl-brown mb-10 drop-shadow-md">Final Scores</h2>

        {/* Winner Card */}
        <div className="bg-sl-sand rounded-[2.5rem] shadow-xl p-10 mb-10 relative overflow-hidden border-2 border-sl-gold ring-4 ring-sl-gold/20">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sl-gold/10 to-transparent"></div>
          <div className="absolute top-4 right-4 text-6xl opacity-10 grayscale">🎉</div>
          <div className="absolute top-4 left-4 text-6xl opacity-10 grayscale">🏆</div>

          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-sl-gold to-yellow-600 text-white rounded-full mx-auto flex items-center justify-center text-4xl font-bold shadow-glow mb-4 border-4 border-sl-sand">
              1st
            </div>
            <h3 className="text-3xl font-black text-sl-brown mb-2">{winner.name}</h3>
            <div className="text-sl-maroon font-bold uppercase tracking-widest text-sm mb-6">Game Winner</div>
            <div className="text-6xl font-mono font-bold text-sl-brown drop-shadow-sm">{winner.score} <span className="text-xl text-sl-clay">pts</span></div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3 mb-12">
          {sortedPlayers.slice(1).map((p, i) => (
            <div key={p.id} className="bg-sl-sand px-6 py-4 rounded-2xl shadow-sm border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-sl-paper rounded-full flex items-center justify-center font-bold text-sl-clay text-sm border border-white/5">#{i + 2}</div>
                <div className="font-bold text-sl-brown text-lg">{p.name}</div>
              </div>
              <div className="font-mono font-bold text-sl-clay">{p.score} pts</div>
            </div>
          ))}
        </div>

        <div className="bg-sl-sand p-6 rounded-3xl shadow-soft mb-10 border border-white/5">
          <h4 className="text-xs font-bold uppercase text-sl-clay mb-4 tracking-widest">Score Distribution</h4>
          <D3Chart players={gameState.players} />
        </div>

        <div className="flex justify-center space-x-4 pb-10">
          {isHost && (
            <button onClick={handlePlayAgainHost} className="bg-sl-maroon text-white px-8 py-3 rounded-xl font-bold shadow-glow hover:bg-red-700 transition-colors border border-white/10">Play Again</button>
          )}
          <button onClick={handleQuitGame} className="bg-sl-paper text-sl-clay border border-white/5 px-8 py-3 rounded-xl font-bold hover:bg-sl-sand hover:text-sl-brown transition-colors">Back to Menu</button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};