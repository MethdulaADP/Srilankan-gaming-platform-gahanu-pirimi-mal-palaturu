import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpyGameState, SpyGamePhase, SpyPlayer, SpyMessage, SpyRole } from '../../types';
import { SPY_WORDS_DB } from '../../data/spyWords';
import { generateRoomCode } from '../../constants';
import { Lobby } from '../Lobby';
import { GameService } from '../../services/gameService';

// const STORAGE_PREFIX = 'GPMP_SPY_'; // REMOVED

export const SpyGameRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- STATE ---

    // Global Game State (Synced via Firebase)
    const [gameState, setGameState] = useState<SpyGameState>({
        phase: SpyGamePhase.LOBBY,
        roomCode: roomId || null,
        players: [],
        round: 1,
        maxRounds: 5,
        secretWord: '',
        imposterId: null,
        messages: [],
        winner: null,
        winReason: null,
        readyForNextRoundTimer: null
    });

    // Local Player State
    const [playerName, setPlayerName] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [joinRoomCode, setJoinRoomCode] = useState('');

    // UI State
    const [showGuessModal, setShowGuessModal] = useState(false);
    const [imposterGuess, setImposterGuess] = useState('');
    const [countdown, setCountdown] = useState(0); // Display countdown for Cooldown phase

    // Initialize join code from URL if present
    useEffect(() => {
        if (roomId) {
            setJoinRoomCode(roomId);
            // Also ensure game state knows about it (though useState init handles it too)
            setGameState(prev => ({ ...prev, roomCode: roomId }));
        }
    }, [roomId]);

    // Refs
    // const pollRef = useRef<ReturnType<typeof setInterval> | null>(null); // Not needed for firebase subscription uses internal listener

    const updateGameState = useCallback((newState: SpyGameState) => {
        setGameState(newState);
        if (newState.roomCode) {
            GameService.updateGameState(newState.roomCode, newState);
        }
    }, []);

    // Subscription to Firebase
    useEffect(() => {
        if (!gameState.roomCode) return;

        const unsubscribe = GameService.subscribeToRoom(gameState.roomCode, (data: SpyGameState) => {
            if (data) {
                setGameState(prev => {
                    // Basic conflict resolution / optimistic update prevention
                    if (JSON.stringify(prev) !== JSON.stringify(data)) {
                        // FIREBASE FIX: Ensure arrays are never null and handle object conversions
                        const safePlayers = data.players
                            ? (Array.isArray(data.players) ? data.players.filter(Boolean) : Object.values(data.players))
                            : [];

                        const safeMessages = data.messages
                            ? (Array.isArray(data.messages) ? data.messages.filter(Boolean) : Object.values(data.messages))
                            : [];

                        return {
                            ...data,
                            players: safePlayers as any, // Cast to avoid strict type complaints if structure varies slightly
                            messages: safeMessages
                        };
                    }
                    return prev;
                });
            }
        });

        return () => unsubscribe();
    }, [gameState.roomCode]);

    // Auto-scroll chat
    useEffect(() => {
        try {
            if (chatContainerRef.current) {
                const { scrollHeight, clientHeight } = chatContainerRef.current;
                chatContainerRef.current.scrollTo({
                    top: scrollHeight - clientHeight,
                    behavior: 'smooth'
                });
            }
        } catch (e) {
            console.error("Auto-scroll failed:", e);
        }
    }, [gameState.messages]);

    // --- GAME LOGIC ---

    const handleStartHost = async () => {
        if (!playerName) { setErrorMsg("Enter Name"); return; }
        const code = generateRoomCode();
        const uid = 'user-' + Date.now();
        setCurrentUserId(uid);

        const hostPlayer: SpyPlayer = {
            id: uid, name: playerName, isHost: true, isBot: false, score: 0, isReady: true, hasFinished: false, answers: {}, validations: {},
            hasVotedToStop: false, hasSubmittedMessage: false, voteTargetId: null
        };

        const newState: SpyGameState = {
            ...gameState,
            phase: SpyGamePhase.LOBBY,
            roomCode: code,
            players: [hostPlayer]
        };

        try {
            await GameService.updateGameState(code, newState);

            updateGameState(newState);
            navigate(`/spy-game/${code}`);
        } catch (e: any) {
            console.error("Spy Create failed:", e);
            setErrorMsg("Create failed: " + (e.message || 'Net err'));
        }
    };

    const handleJoinGame = async () => {
        if (!playerName || !joinRoomCode) { setErrorMsg("Enter Name & Code"); return; }

        const serverState = await GameService.getRoomState(joinRoomCode);
        if (!serverState) { setErrorMsg("Room not found"); return; }

        const existing = serverState.players.find((p: SpyPlayer) => p.name.toLowerCase() === playerName.toLowerCase());
        if (existing) {
            setCurrentUserId(existing.id);
            navigate(`/spy-game/${joinRoomCode}`);
            return;
        }

        if (serverState.players.length >= 8) { setErrorMsg("Room Full (Max 8)"); return; }
        if (serverState.phase !== SpyGamePhase.LOBBY) { setErrorMsg("Game Started"); return; }

        const uid = 'user-' + Date.now();
        setCurrentUserId(uid);
        const newPlayer: SpyPlayer = {
            id: uid, name: playerName, isHost: false, isBot: false, score: 0, isReady: true, hasFinished: false, answers: {}, validations: {},
            hasVotedToStop: false, hasSubmittedMessage: false, voteTargetId: null
        };

        const newState = { ...serverState, players: [...serverState.players, newPlayer] };
        await GameService.updateGameState(joinRoomCode, newState);

        navigate(`/spy-game/${joinRoomCode}`);
    };

    const hostStartGame = () => {
        if (gameState.players.length < 4) { alert("Need at least 4 players!"); return; }

        // Pick random word object
        const wordObj = SPY_WORDS_DB[Math.floor(Math.random() * SPY_WORDS_DB.length)];
        const word = wordObj.english; // Store canonical English name in state

        const imposterIndex = Math.floor(Math.random() * gameState.players.length);
        const imposterId = gameState.players[imposterIndex].id;

        const assignedPlayers = gameState.players.map(p => ({
            ...p,
            role: (p.id === imposterId ? 'IMPOSTER' : 'INNOCENT') as SpyRole,
            hasVotedToStop: false,
            hasSubmittedMessage: false,
            voteTargetId: null
        }));

        updateGameState({
            ...gameState,
            phase: SpyGamePhase.ASSIGNMENT,
            secretWord: word,
            imposterId: imposterId,
            players: assignedPlayers,
            round: 1,
            messages: [],
            winner: null,
            winReason: null
        });

        // Auto move to Playing after 5s
        setTimeout(() => {
            // We can trust current state OR force update based on what we just set.
            // Since we set timeout 5s ago, state might have changed (unlikely in assignment).
            // Safer to just push the phase change blindly for now or use subscription value if we had it.
            // But we can't access "latest" inside timeout without ref or functional update.
            // Functional update on 'updateGameState' isn't supported by my implementation directly (it takes object).
            // Let's assume Host is authority.
            // BETTER: Use GameService to set phase directly or read fresh via getRoomState.
            GameService.getRoomState(gameState.roomCode!).then(current => {
                if (current && current.phase === SpyGamePhase.ASSIGNMENT) {
                    GameService.updateGameState(gameState.roomCode!, { ...current, phase: SpyGamePhase.ROUND_IN_PROGRESS });
                }
            });
        }, 5000);
    };

    const handlePlayAgainHost = () => {
        if (!gameState.roomCode) return;
        const resetPlayers = gameState.players.map(p => ({
            ...p,
            role: undefined,
            hasVotedToStop: false,
            hasSubmittedMessage: false,
            voteTargetId: null,
            score: 0
        }));

        updateGameState({
            ...gameState,
            phase: SpyGamePhase.LOBBY,
            players: resetPlayers,
            round: 1,
            secretWord: '',
            imposterId: null,
            messages: [],
            winner: null,
            winReason: null,
            readyForNextRoundTimer: null
        });
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const currentPlayer = gameState.players.find(p => p.id === currentUserId);
        if (!currentPlayer || currentPlayer.hasSubmittedMessage) return;

        const newMessage: SpyMessage = {
            id: 'msg-' + Date.now(),
            playerId: currentUserId,
            playerName: currentPlayer.name,
            text: inputMessage,
            roundNumber: gameState.round,
            timestamp: Date.now()
        };

        const updatedPlayers = gameState.players.map(p => p.id === currentUserId ? { ...p, hasSubmittedMessage: true } : p);

        // Check if round complete
        const allSubmitted = updatedPlayers.every(p => p.hasSubmittedMessage);

        let nextPhase = gameState.phase;
        let nextRoundTimer = null;

        if (allSubmitted) {
            nextPhase = SpyGamePhase.ROUND_COOLDOWN;
            nextRoundTimer = Date.now() + 5000; // 5s cooldown
        }

        updateGameState({
            ...gameState,
            players: updatedPlayers,
            messages: [...gameState.messages, newMessage],
            phase: nextPhase,
            readyForNextRoundTimer: nextRoundTimer
        });
        setInputMessage('');
    };

    // --- ROUND TRANSITION LOGIC ---

    const advanceRound = useCallback(() => {
        // Validation: Verify we are in a state that allows advancement
        if (gameState.phase !== SpyGamePhase.ROUND_COOLDOWN && gameState.phase !== SpyGamePhase.ROUND_IN_PROGRESS) return;

        if (gameState.round >= gameState.maxRounds) {
            updateGameState({ ...gameState, phase: SpyGamePhase.VOTING, readyForNextRoundTimer: null });
        } else {
            // Reset message submission AND stop votes for the new round
            const resetPlayers = gameState.players.map(p => ({
                ...p,
                hasSubmittedMessage: false,
                hasVotedToStop: false
            }));

            updateGameState({
                ...gameState,
                phase: SpyGamePhase.ROUND_IN_PROGRESS,
                round: gameState.round + 1,
                players: resetPlayers,
                readyForNextRoundTimer: null
            });
        }
    }, [gameState, updateGameState]);

    const triggerEmergencyMeeting = () => {
        // Toggle vote for current user
        const updatedPlayers = gameState.players.map(p =>
            p.id === currentUserId ? { ...p, hasVotedToStop: !p.hasVotedToStop } : p
        );

        const votes = updatedPlayers.filter(p => p.hasVotedToStop).length;

        // Threshold: 2 votes required (Keeping this as requested by user previously)
        if (votes >= 2) {
            updateGameState({
                ...gameState,
                players: updatedPlayers,
                phase: SpyGamePhase.VOTING,
                readyForNextRoundTimer: null
            });
        } else {
            updateGameState({
                ...gameState,
                players: updatedPlayers
            });
        }
    };

    // Global Timer Effect: Handles Countdown & Auto-Advance
    useEffect(() => {
        if (gameState.phase !== SpyGamePhase.ROUND_COOLDOWN || !gameState.readyForNextRoundTimer) {
            setCountdown(0);
            return;
        }

        const checkTimer = () => {
            const now = Date.now();
            const remaining = Math.ceil((gameState.readyForNextRoundTimer! - now) / 1000);

            setCountdown(Math.max(0, remaining));

            if (remaining <= 0) {
                // Timer expired -> Auto Advance
                advanceRound();
            }
        };

        checkTimer(); // Check immediately
        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);

    }, [gameState.phase, gameState.readyForNextRoundTimer, advanceRound]);


    // --- VOTING LOGIC ---

    const voteToStop = () => {
        const updatedPlayers = gameState.players.map(p => p.id === currentUserId ? { ...p, hasVotedToStop: !p.hasVotedToStop } : p);
        const stopCount = updatedPlayers.filter(p => p.hasVotedToStop).length;

        // Dynamic Majority: Floor(N / 2) + 1
        const requiredVotes = Math.floor(gameState.players.length / 2) + 1;

        let nextPhase = gameState.phase;
        if (stopCount >= requiredVotes) {
            nextPhase = SpyGamePhase.VOTING;
        }

        updateGameState({ ...gameState, players: updatedPlayers, phase: nextPhase });
    };

    const castVote = (targetId: string) => {
        const updatedPlayers = gameState.players.map(p => p.id === currentUserId ? { ...p, voteTargetId: targetId } : p);
        updateGameState({ ...gameState, players: updatedPlayers });

        const votesCast = updatedPlayers.filter(p => p.voteTargetId).length;
        if (votesCast === gameState.players.length) {
            // Tally
            const voteCounts: Record<string, number> = {};
            updatedPlayers.forEach(p => {
                if (p.voteTargetId) voteCounts[p.voteTargetId] = (voteCounts[p.voteTargetId] || 0) + 1;
            });

            const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
            const topVote = sorted[0];
            const votedId = topVote[0];

            let winner: 'INNOCENT' | 'IMPOSTER' = 'IMPOSTER';
            let reason = '';

            if (votedId === gameState.imposterId) {
                winner = 'INNOCENT';
                reason = `Imposter ${gameState.players.find(p => p.id === gameState.imposterId)?.name} was caught!`;
            } else {
                winner = 'IMPOSTER';
                reason = `Innocents voted for ${gameState.players.find(p => p.id === votedId)?.name}, but the Imposter was ${gameState.players.find(p => p.id === gameState.imposterId)?.name}!`;
            }

            updateGameState({ ...gameState, players: updatedPlayers, phase: SpyGamePhase.GAME_OVER, winner, winReason: reason });
        }
    };

    const handleImposterGuessSubmit = () => {
        const guess = imposterGuess.toLowerCase().trim();
        const currentWordObj = SPY_WORDS_DB.find(w => w.english === gameState.secretWord);

        let isCorrect = false;

        if (currentWordObj) {
            // Check Canonical English
            if (guess === currentWordObj.english.toLowerCase()) isCorrect = true;
            // Check Canonical Sinhala
            if (guess === currentWordObj.sinhala.toLowerCase()) isCorrect = true;
            // Check Aliases
            if (currentWordObj.aliases.some(alias => guess === alias.toLowerCase())) isCorrect = true;
        } else {
            // Fallback for legacy words not in DB
            if (guess === gameState.secretWord.toLowerCase()) isCorrect = true;
        }

        if (isCorrect) {
            updateGameState({ ...gameState, phase: SpyGamePhase.GAME_OVER, winner: 'IMPOSTER', winReason: `Imposter correctly guessed "${gameState.secretWord}"!` });
        } else {
            updateGameState({ ...gameState, phase: SpyGamePhase.GAME_OVER, winner: 'INNOCENT', winReason: `Imposter guessed "${imposterGuess}" incorrectly. The word was "${gameState.secretWord}".` });
        }
        setShowGuessModal(false);
    };

    // --- HELPERS ---
    // SAFETY BELT: Ensure players is always an array
    const safePlayers = Array.isArray(gameState.players) ? gameState.players : [];

    const currentPlayer = safePlayers.find(p => p.id === currentUserId);
    const myRole = currentPlayer?.role;
    const stopVotes = safePlayers.filter(p => p.hasVotedToStop).length || 0;

    // --- RENDER: LOBBY & SETUP ---
    const isPlayerInGame = currentUserId && safePlayers.some(p => p.id === currentUserId);
    const showJoinScreen = gameState.phase === SpyGamePhase.LOBBY && !gameState.roomCode || !isPlayerInGame;

    if (showJoinScreen) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                <h1 className="text-4xl font-serif font-black text-sl-brown mb-8">Rahas Wachanaya</h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-sl-brown">Host Game</h2>
                        <input className="w-full p-3 border rounded-lg mb-4 text-center bg-sl-paper text-sl-brown placeholder-gray-400 font-bold focus:ring-2 focus:ring-sl-maroon outline-none" placeholder="Enter Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                        <button onClick={handleStartHost} className="w-full bg-sl-maroon text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-800 transition-all transform active:scale-95 text-lg">Create Room</button>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-sl-brown">Join Game</h2>
                        <input className="w-full p-3 border rounded-lg mb-4 text-center bg-sl-paper text-sl-brown placeholder-gray-400 font-bold focus:ring-2 focus:ring-sl-gold outline-none" placeholder="Enter Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                        <input className="w-full p-3 border rounded-lg mb-4 text-center bg-sl-paper font-mono text-xl tracking-widest text-sl-brown placeholder-gray-400 focus:ring-2 focus:ring-sl-gold outline-none" placeholder="CODE" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)} maxLength={4} />
                        <button onClick={handleJoinGame} className="w-full bg-sl-gold text-sl-brown py-4 rounded-xl font-bold shadow-lg hover:bg-yellow-400 transition-all transform active:scale-95 text-lg">Join Room</button>
                        {errorMsg && <p className="text-red-500 mt-2 text-sm">{errorMsg}</p>}
                    </div>
                </div>
            </div>
        )
    }

    if (gameState.phase === SpyGamePhase.LOBBY) {
        return (
            <Lobby
                roomCode={gameState.roomCode}
                players={gameState.players}
                isHost={!!currentPlayer?.isHost}
                onStartGame={hostStartGame}
                onAddBot={() => alert("Bots not supported in Spy mode yet!")}
                onQuit={() => navigate('/')}
                gameName="Rahas Wachanaya"
            />
        );
    }

    // --- RENDER: GAME ---
    return (
        <div className="container mx-auto px-4 py-2 max-w-3xl h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className={`p-3 rounded-2xl mb-2 shadow-lg flex justify-between items-center ${myRole === 'IMPOSTER' ? 'bg-red-900 text-white' : 'bg-sl-sand text-sl-brown border border-sl-gold'}`}>
                <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Round {gameState.round} / {gameState.maxRounds}</div>
                    <h2 className="text-lg font-black">
                        {gameState.phase === SpyGamePhase.ASSIGNMENT
                            ? (myRole === 'IMPOSTER' ? 'YOU ARE THE IMPOSTER' : 'YOU ARE INNOCENT')
                            : (myRole === 'IMPOSTER' ? '🤫 YOU ARE THE IMPOSTER' : `🔑 Word: ${gameState.secretWord}`)
                        }
                    </h2>
                </div>
                {myRole === 'IMPOSTER' && gameState.phase !== SpyGamePhase.GAME_OVER && (
                    <button onClick={() => setShowGuessModal(true)} className="bg-black/30 hover:bg-black/50 text-white text-[10px] px-3 py-1 rounded border border-white/20">
                        Guess Word
                    </button>
                )}
            </div>

            {/* CHAT LOG */}
            {gameState.phase !== SpyGamePhase.ASSIGNMENT && (
                <div ref={chatContainerRef} className="flex-1 bg-sl-paper/80 backdrop-blur rounded-3xl shadow-inner border border-white/10 p-3 mb-2 overflow-y-auto flex flex-col min-h-0">
                    {gameState.messages.length === 0 && <div className="text-center text-sl-clay mt-10 italic">Discussion starting...</div>}
                    {gameState.messages.map((msg, i) => {
                        const isMe = msg.playerId === currentUserId;
                        const prev = gameState.messages[i - 1];
                        const showRound = !prev || prev.roundNumber !== msg.roundNumber;
                        return (
                            <React.Fragment key={msg.id}>
                                {showRound && <div className="text-center text-xs text-sl-clay font-bold uppercase my-2 tracking-widest">— Round {msg.roundNumber} —</div>}
                                <div className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-sl-clay font-bold mb-0.5 px-1">{msg.playerName}</span>
                                    <div className={`px-3 py-1.5 rounded-2xl max-w-[85%] text-sm font-medium ${isMe ? 'bg-sl-maroon text-white rounded-br-none' : 'bg-white text-gray-800 border border-sl-sand rounded-bl-none shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            )}

            {/* ACTION AREA - Compacted */}
            <div className="bg-sl-sand p-3 rounded-t-3xl shadow-card border-t border-white/20 pb-6 md:pb-3 relative z-20">

                {/* 1. ROUND IN PROGRESS */}
                {gameState.phase === SpyGamePhase.ROUND_IN_PROGRESS && (
                    <>
                        {!currentPlayer?.hasSubmittedMessage ? (
                            <div className="flex gap-2">
                                <input
                                    className="flex-grow bg-white border border-sl-clay/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sl-gold text-black"
                                    placeholder="Type your message..."
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button onClick={handleSendMessage} className="bg-sl-gold text-sl-brown font-bold px-4 py-3 rounded-xl hover:bg-yellow-500 transition-colors">
                                    Send
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-sl-clay text-sm font-medium animate-pulse py-2">
                                Waiting for other players...
                            </div>
                        )}

                        {/* Optional Vote to Stop */}
                        <div className="mt-2 flex flex-col gap-1 border-t border-black/5 pt-2">
                            <div className="flex justify-between items-center">
                                <button onClick={voteToStop} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border ${currentPlayer?.hasVotedToStop ? 'bg-red-500 text-white border-red-600' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}>
                                    {currentPlayer?.hasVotedToStop ? 'Cancel Stop Vote' : '✋ STOP GAME'}
                                </button>
                                <div className="text-[10px] font-bold text-sl-clay">Votes: {stopVotes} / 3</div>
                            </div>
                            {stopVotes > 0 && (
                                <div className="text-[10px] text-sl-clay px-1">
                                    Voted: {gameState.players.filter(p => p.hasVotedToStop).map(p => p.name).join(', ')}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* 2. ROUND COOLDOWN (COUNTDOWN) */}
                {gameState.phase === SpyGamePhase.ROUND_COOLDOWN && (
                    <div className="text-center py-2">
                        <h3 className="text-lg font-bold text-sl-maroon mb-1">Round Complete!</h3>
                        <p className="text-sm font-bold text-sl-brown mb-2">
                            Next round in <span className="text-2xl text-sl-maroon">{countdown}</span>s...
                        </p>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={triggerEmergencyMeeting}
                                className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-all text-sm ${currentPlayer?.hasVotedToStop
                                    ? 'bg-sl-maroon text-white animate-pulse'
                                    : 'bg-white text-sl-maroon border-2 border-sl-maroon hover:bg-sl-maroon hover:text-white'
                                    }`}
                            >
                                {currentPlayer?.hasVotedToStop ? '🚨 Waiting...' : '🚨 Report Imposter!'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. VOTING */}
                {gameState.phase === SpyGamePhase.VOTING && (
                    <div className="text-center">
                        <h3 className="text-base font-bold text-sl-brown mb-2">Vote for the Imposter!</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {gameState.players.map(p => (
                                p.id !== currentUserId && (
                                    <button
                                        key={p.id}
                                        onClick={() => castVote(p.id)}
                                        className={`p-2 rounded-xl border-2 font-bold text-xs transition-all ${currentPlayer?.voteTargetId === p.id ? 'bg-sl-maroon text-white border-sl-maroon' : 'bg-white border-sl-sand text-sl-clay hover:border-sl-maroon'}`}
                                    >
                                        {p.name}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. GAME OVER */}
                {gameState.phase === SpyGamePhase.GAME_OVER && (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-2">{gameState.winner === 'INNOCENT' ? '🎉' : '🕵️‍♂️'}</div>
                        <h2 className="text-2xl font-black text-sl-brown mb-1">{gameState.winner === 'INNOCENT' ? 'Innocents Win!' : 'Imposter Wins!'}</h2>
                        <p className="text-xs text-sl-clay mb-4">{gameState.winReason}</p>
                        <div className="bg-white/50 p-3 rounded-xl mb-4 inline-block">
                            <div className="text-[10px] uppercase tracking-widest text-sl-clay font-bold">The Imposter Was</div>
                            <div className="text-lg font-bold text-sl-maroon">{gameState.players.find(p => p.id === gameState.imposterId)?.name}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {currentPlayer?.isHost && (
                                <button onClick={handlePlayAgainHost} className="bg-sl-maroon text-white px-6 py-2 rounded-xl font-bold hover:bg-sl-brown shadow-lg text-sm">
                                    Play Again
                                </button>
                            )}
                            <button onClick={() => navigate('/')} className="text-sl-clay text-xs font-bold hover:text-sl-brown underline">
                                Back to Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* GUESS MODAL */}
            {showGuessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-sl-paper w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-sl-brown mb-4">Guess the Word</h3>
                        <p className="text-xs text-sl-clay mb-4">If you guess correctly, you win instantly. If wrong, you lose.</p>
                        <input
                            className="w-full bg-white border border-sl-sand rounded-xl p-3 mb-4 text-center font-bold text-black"
                            placeholder="Type secret word..."
                            value={imposterGuess}
                            onChange={e => setImposterGuess(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowGuessModal(false)} className="flex-1 py-2 text-sl-clay font-bold">Cancel</button>
                            <button onClick={handleImposterGuessSubmit} className="flex-1 bg-sl-maroon text-white rounded-xl py-2 font-bold shadow-lg">Submit Guess</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
