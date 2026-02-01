import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LankaTriviaGame.css';

function LankaTriviaGame({ socket, roomId }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('getGameState', { roomId });

    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('gameStarted', ({ gameState: state }) => {
      setGameState(state);
      // Check if this socket is the host (you'd need to track this from lobby)
      setIsHost(true); // Simplified for now
    });

    socket.on('newQuestion', (question) => {
      setGameState(prev => ({ ...prev, currentQuestion: question }));
      setSelectedAnswer(null);
      setAnswered(false);
      setResult(null);
    });

    socket.on('answerResult', (resultData) => {
      setResult(resultData);
      setAnswered(true);
    });

    socket.on('gameOver', (results) => {
      setGameOver(true);
      setFinalResults(results);
    });

    return () => {
      socket.off('gameState');
      socket.off('gameStarted');
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
    };
  }, [socket, roomId]);

  const submitAnswer = (answerIndex) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    socket.emit('submitAnswer', { roomId, answerIndex });
  };

  const nextQuestion = () => {
    socket.emit('nextQuestion', { roomId });
  };

  if (!gameState) {
    return (
      <div className="card">
        <div className="spinner"></div>
      </div>
    );
  }

  if (gameOver && finalResults) {
    return (
      <div className="trivia-game">
        <div className="card">
          <h2 className="card-header">🏆 Game Over!</h2>
          
          <div className="final-scores">
            <h3>Final Scores</h3>
            <div className="players-list">
              {Object.entries(finalResults.scores || {})
                .sort((a, b) => b[1] - a[1])
                .map(([playerId, score], index) => (
                  <div key={playerId} className="player-item">
                    <span className="player-name">
                      {index === 0 && '👑 '}
                      Player {playerId.slice(0, 8)}
                    </span>
                    <span className="player-score">{score} points</span>
                  </div>
                ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ width: '100%', marginTop: '2rem' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const question = gameState.currentQuestion;

  if (!question) {
    return (
      <div className="card">
        <p>Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div className="trivia-game">
      <div className="card">
        <h2 className="card-header">🇱🇰 ලංකා ප්‍රශ්නෝත්තර - Lanka Trivia</h2>
        
        <div className="question-progress">
          Question {question.index + 1} of {question.total}
        </div>

        <div className="question-card">
          <h3 className="question-text-sinhala">{question.questionSinhala}</h3>
          <h4 className="question-text-english">{question.question}</h4>
          
          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedAnswer === index ? 'selected' : ''
                } ${
                  answered && result?.correct && selectedAnswer === index
                    ? 'correct'
                    : ''
                } ${
                  answered && !result?.correct && selectedAnswer === index
                    ? 'incorrect'
                    : ''
                } ${
                  answered && result?.correctAnswer === index
                    ? 'show-correct'
                    : ''
                }`}
                onClick={() => submitAnswer(index)}
                disabled={answered}
              >
                <div className="option-sinhala">{question.optionsSinhala[index]}</div>
                <div className="option-english">{option}</div>
              </button>
            ))}
          </div>

          {answered && result && (
            <div className={`result-message ${result.correct ? 'correct' : 'incorrect'}`}>
              {result.correct ? (
                <>
                  <span className="result-icon">✅</span>
                  Correct! +{result.points} points
                </>
              ) : (
                <>
                  <span className="result-icon">❌</span>
                  Incorrect. The correct answer was: {question.options[result.correctAnswer]}
                </>
              )}
            </div>
          )}
        </div>

        {answered && isHost && (
          <button
            className="btn btn-primary"
            onClick={nextQuestion}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Next Question →
          </button>
        )}

        {answered && !isHost && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
            Waiting for host to continue...
          </p>
        )}

        <div className="scores-section">
          <h3>Current Scores</h3>
          <div className="players-list">
            {Object.entries(gameState.scores || {})
              .sort((a, b) => b[1] - a[1])
              .map(([playerId, score]) => (
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

export default LankaTriviaGame;
