import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import GameLobby from './pages/GameLobby';
import Game from './pages/Game';

// Landing component to handle room joins
function Landing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const roomId = searchParams.get('roomId');

  React.useEffect(() => {
    if (roomId) {
      setShowPrompt(true);
    }
  }, [roomId]);

  const handleJoin = () => {
    if (username.trim()) {
      navigate(`/lobby?roomId=${roomId}&username=${encodeURIComponent(username)}`);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (showPrompt) {
    return (
      <div className="main-content">
        <div className="card">
          <h2 className="card-header">Join Game Room</h2>
          <div className="input-group">
            <label className="input-label">Enter your name to join:</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
              placeholder="Your name"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleJoin} style={{ flex: 1 }}>
              Join Game
            </button>
            <button className="btn btn-secondary" onClick={handleCancel} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Home />;
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>🎮 ගහනු පිරිමි මල් පලතුරු</h1>
          <div className="subtitle">Gahanu Pirimi Mal Palaturu - Sri Lankan Gaming Platform</div>
        </header>
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<GameLobby />} />
          <Route path="/lobby" element={<GameLobby />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

