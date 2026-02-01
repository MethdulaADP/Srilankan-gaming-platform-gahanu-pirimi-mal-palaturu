import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { GameRoom } from './components/GameRoom';
import { SpyGameRoom } from './components/spy/SpyGameRoom';

import ScrollToTop from './components/ScrollToTop';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    // If not on dashboard, confirm before leaving
    if (location.pathname !== '/') {
      if (!window.confirm("Are you sure you want to quit the current game?")) {
        return;
      }
    }
    navigate('/');
  };

  return (
    <Layout onGoHome={handleGoHome}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/word-game" element={<GameRoom />} />
        <Route path="/word-game/:roomId" element={<GameRoom />} />
        <Route path="/spy-game" element={<SpyGameRoom />} />
        <Route path="/spy-game/:roomId" element={<SpyGameRoom />} />
      </Routes>
    </Layout>
  );
}

export default App;
