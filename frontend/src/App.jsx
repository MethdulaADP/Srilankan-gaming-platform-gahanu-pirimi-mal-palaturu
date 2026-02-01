import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GameLobby from './pages/GameLobby';
import Game from './pages/Game';

// Landing component to handle room joins
function Landing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');

  if (roomId) {
    // Prompt for username and redirect to lobby
    const username = prompt('Enter your name to join the game:');
    if (username) {
      navigate(`/lobby?roomId=${roomId}&username=${encodeURIComponent(username)}`);
    } else {
      navigate('/');
    }
    return null;
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

