import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = (gameType) => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    navigate(`/create?game=${gameType}&username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="main-content">
      <div className="decorative-pattern"></div>
      
      <div className="card">
        <h2 className="card-header">🎮 Welcome to Gahanu Pirimi Mal Palaturu</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Experience authentic Sri Lankan games with friends! Join multiplayer word puzzles and trivia games
          celebrating Lankan culture.
        </p>

        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input
            type="text"
            className="input"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && username && handleCreateRoom('aksharaKeliya')}
          />
        </div>

        <div className="game-grid">
          <div className="game-card" onClick={() => handleCreateRoom('aksharaKeliya')}>
            <div className="game-icon">🔤</div>
            <h3>අක්ෂර කෙළිය</h3>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Akshara Keliya
            </h4>
            <p>Find hidden words in a grid of Sinhala and English letters. Race against friends!</p>
          </div>

          <div className="game-card" onClick={() => handleCreateRoom('lankaTrivia')}>
            <div className="game-icon">🇱🇰</div>
            <h3>ලංකා ප්‍රශ්නෝත්තර</h3>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Lanka Trivia
            </h4>
            <p>Test your knowledge about Sri Lanka's history, culture, and traditions!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
