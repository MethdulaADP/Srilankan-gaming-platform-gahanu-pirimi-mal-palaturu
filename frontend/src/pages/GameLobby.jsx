import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

function GameLobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const [roomId, setRoomId] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    if (!socket || !connected) return;

    const game = searchParams.get('game');
    const username = searchParams.get('username');
    const joinRoomId = searchParams.get('roomId');

    if (joinRoomId) {
      // Join existing room
      socket.emit('joinRoom', { roomId: joinRoomId, username });
    } else if (game && username) {
      // Create new room
      socket.emit('createRoom', { gameType: game, username });
    }

    socket.on('roomCreated', (data) => {
      setRoomId(data.roomId);
      setGameType(data.gameType);
      setPlayerId(data.playerId);
      setIsHost(true);
      setPlayers([{ id: data.playerId, username }]);
    });

    socket.on('roomJoined', (data) => {
      setRoomId(data.roomId);
      setGameType(data.gameType);
      setPlayerId(data.playerId);
      setIsHost(false);
    });

    socket.on('playersList', (playersList) => {
      setPlayers(playersList);
    });

    socket.on('playerJoined', ({ playerId: newPlayerId, username }) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === newPlayerId)) return prev;
        return [...prev, { id: newPlayerId, username, score: 0 }];
      });
    });

    socket.on('playerLeft', ({ playerId: leftPlayerId }) => {
      setPlayers(prev => prev.filter(p => p.id !== leftPlayerId));
    });

    socket.on('gameStarted', () => {
      navigate(`/game?roomId=${roomId}&gameType=${gameType}`);
    });

    socket.on('error', (data) => {
      alert(data.message);
      navigate('/');
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('playersList');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameStarted');
      socket.off('error');
    };
  }, [socket, connected, searchParams, navigate, roomId, gameType]);

  const startGame = () => {
    if (socket && roomId) {
      socket.emit('startGame', { roomId });
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/?roomId=${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard!');
  };

  const getGameName = () => {
    switch (gameType) {
      case 'aksharaKeliya':
        return 'අක්ෂර කෙළිය (Akshara Keliya)';
      case 'lankaTrivia':
        return 'ලංකා ප්‍රශ්නෝත්තර (Lanka Trivia)';
      default:
        return 'Game';
    }
  };

  if (!connected) {
    return (
      <div className="main-content">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <h2 className="card-header">🎮 {getGameName()}</h2>
        
        {roomId && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Room Code:</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <code style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>{roomId}</code>
              <button className="btn btn-secondary" onClick={copyRoomLink}>📋 Copy Link</button>
            </div>
          </div>
        )}

        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
          Players ({players.length}/4)
        </h3>
        
        <div className="players-list">
          {players.map((player) => (
            <div key={player.id} className="player-item">
              <span className="player-name">
                {player.username}
                {player.id === playerId && ' (You)'}
                {isHost && player.id === playerId && ' 👑'}
              </span>
              <span className="player-score">Ready</span>
            </div>
          ))}
        </div>

        {players.length < 2 && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
            Waiting for more players to join...
          </p>
        )}

        {isHost && (
          <button
            className="btn btn-primary"
            onClick={startGame}
            disabled={players.length < 1}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {players.length < 2 ? 'Start Game (Single Player)' : 'Start Game'}
          </button>
        )}

        {!isHost && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', textAlign: 'center' }}>
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}

export default GameLobby;
