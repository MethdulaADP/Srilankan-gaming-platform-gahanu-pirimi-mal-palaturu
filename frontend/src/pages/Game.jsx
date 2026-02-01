import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import AksharaKeliyaGame from '../components/AksharaKeliyaGame';
import LankaTriviaGame from '../components/LankaTriviaGame';

function Game() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const roomId = searchParams.get('roomId');
  const gameType = searchParams.get('gameType');

  useEffect(() => {
    if (!roomId || !gameType) {
      navigate('/');
    }
  }, [roomId, gameType, navigate]);

  if (!connected) {
    return (
      <div className="main-content">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {gameType === 'aksharaKeliya' && <AksharaKeliyaGame socket={socket} roomId={roomId} />}
      {gameType === 'lankaTrivia' && <LankaTriviaGame socket={socket} roomId={roomId} />}
    </div>
  );
}

export default Game;
