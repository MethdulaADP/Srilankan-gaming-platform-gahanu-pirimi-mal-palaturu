import { useState, useEffect } from 'react';
import './AksharaKeliyaGame.css';

function AksharaKeliyaGame({ socket, roomId }) {
  const [gameState, setGameState] = useState(null);
  const [wordInput, setWordInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Request initial game state
    socket.emit('getGameState', { roomId });

    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('gameStarted', ({ gameState: state }) => {
      setGameState(state);
    });

    socket.on('wordFound', ({ word, points, translation, scores }) => {
      setMessage(`✅ "${word}" found! (${translation}) +${points} points`);
      setGameState(prev => ({ ...prev, foundWords: [...prev.foundWords, word], scores }));
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('wordRejected', ({ message: msg }) => {
      setMessage(`❌ ${msg}`);
      setTimeout(() => setMessage(''), 3000);
    });

    return () => {
      socket.off('gameState');
      socket.off('gameStarted');
      socket.off('wordFound');
      socket.off('wordRejected');
    };
  }, [socket, roomId]);

  const submitWord = (e) => {
    e.preventDefault();
    if (!wordInput.trim()) return;

    socket.emit('submitWord', { roomId, word: wordInput.trim() });
    setWordInput('');
  };

  if (!gameState) {
    return (
      <div className="card">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="akshara-game">
      <div className="card">
        <h2 className="card-header">🔤 අක්ෂර කෙළිය - Word Puzzle</h2>
        
        <div className="game-instructions">
          <p>Find words hidden in the grid below. Words to find:</p>
          <div className="word-list">
            {gameState.words?.map((wordObj, idx) => (
              <span
                key={idx}
                className={gameState.foundWords?.includes(wordObj.word) ? 'found' : ''}
              >
                {wordObj.word} ({wordObj.translation})
              </span>
            ))}
          </div>
        </div>

        <div className="letter-grid">
          {gameState.grid?.map((row, i) => (
            <div key={i} className="grid-row">
              {row.map((letter, j) => (
                <div key={j} className="grid-cell">
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={submitWord} style={{ marginTop: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Enter word you found:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="input"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="Type word here..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </div>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="scores-section">
          <h3>Scores</h3>
          <div className="players-list">
            {Object.entries(gameState.scores || {}).map(([playerId, score]) => (
              <div key={playerId} className="player-item">
                <span className="player-name">Player {playerId.slice(0, 8)}</span>
                <span className="player-score">{score} points</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AksharaKeliyaGame;
