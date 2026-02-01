# Gahanu Pirimi Mal Palaturu (ගහනු පිරිමි මල් පලතුරු)

A Sri Lankan–themed multiplayer gaming platform featuring culturally inspired party and word-based games. Designed with mixed local traditions, Sinhala language elements, and modern UI to create engaging social gameplay for friends and groups.

## 🎮 Features

- **Real-time Multiplayer Gameplay** - Play with friends using WebSocket technology
- **Sri Lankan Cultural Theme** - Beautiful UI inspired by traditional Lankan colors and patterns
- **Two Game Modes:**
  - **අක්ෂර කෙළිය (Akshara Keliya)** - Word Puzzle Game: Find hidden words in a grid
  - **ලංකා ප්‍රශ්නෝත්තර (Lanka Trivia)** - Test your knowledge about Sri Lanka
- **Room-based System** - Create and join game rooms with friends
- **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Architecture

The platform is built with a modern, scalable architecture:

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server for real-time features
- **SQLite** - Lightweight database (can be upgraded to PostgreSQL)

### Project Structure
```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # Game components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
├── backend/           # Node.js backend server
│   ├── src/
│   │   ├── games/        # Game logic
│   │   ├── database/     # Database setup
│   │   └── server.js     # Main server file
└── shared/            # Shared code (future use)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Srilankan-gaming-platform-gahanu-pirimi-mal-palaturu
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for the root project and all workspaces (frontend and backend).

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Building for Production

Build the entire application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🎯 How to Play

### Creating a Game Room

1. Visit the home page
2. Enter your name
3. Select a game mode:
   - **අක්ෂර කෙළිය (Akshara Keliya)** - Word Puzzle
   - **ලංකා ප්‍රශ්නෝත්තර (Lanka Trivia)** - Trivia Quiz
4. Share the room link with friends
5. Start the game when ready

### Joining a Game Room

1. Click the room link shared by your friend
2. Enter your name
3. Wait for the host to start the game

## 🎨 Game Modes

### අක්ෂර කෙළිය (Akshara Keliya) - Word Puzzle

Find hidden words in a 6x6 grid containing Sinhala and English letters. Words can be horizontal, vertical, or diagonal. The first player to find a word gets the points!

**Features:**
- Mixed Sinhala and English letters
- Real-time word discovery
- Score tracking
- Translations provided for educational value

### ලංකා ප්‍රශ්නෝත්තර (Lanka Trivia) - Sri Lankan Trivia

Test your knowledge about Sri Lankan history, culture, geography, and traditions. Questions are presented in both Sinhala and English.

**Features:**
- Questions in Sinhala and English
- Multiple choice format
- Immediate feedback
- Score tracking
- Cultural learning

## 🛠️ Technology Stack

### Frontend Technologies
- React 19
- Vite
- Socket.IO Client
- React Router DOM
- CSS3 with custom properties

### Backend Technologies
- Node.js
- Express.js
- Socket.IO
- Better-SQLite3
- UUID

## 🎨 Design System

The platform uses a Sri Lankan-inspired color palette:

- **Primary (Gold)**: #D4AF37 - Represents prosperity
- **Secondary (Maroon)**: #8B0000 - Traditional Sri Lankan color
- **Accent (Saffron)**: #FF6B35 - Cultural significance
- **Success (Green)**: #2E7D32 - Nature and growth

## 📝 API Documentation

### WebSocket Events

#### Client → Server

- `createRoom({ gameType, username })` - Create a new game room
- `joinRoom({ roomId, username })` - Join an existing room
- `startGame({ roomId })` - Start the game (host only)
- `submitWord({ roomId, word })` - Submit a found word (Akshara Keliya)
- `submitAnswer({ roomId, answerIndex })` - Submit an answer (Lanka Trivia)
- `nextQuestion({ roomId })` - Move to next question (host only)
- `getGameState({ roomId })` - Request current game state

#### Server → Client

- `roomCreated({ roomId, gameType, playerId })` - Room creation confirmed
- `roomJoined({ roomId, gameType, playerId })` - Successfully joined room
- `playerJoined({ playerId, username })` - New player joined
- `playerLeft({ playerId, username })` - Player left
- `playersList(players)` - List of all players in room
- `gameStarted({ gameState })` - Game has started
- `gameState(state)` - Current game state
- `wordFound({ playerId, word, points, translation, scores })` - Word discovered
- `wordRejected({ message })` - Word submission rejected
- `newQuestion(question)` - New trivia question
- `answerResult({ correct, correctAnswer, points })` - Answer result
- `gameOver(results)` - Game finished with final results
- `error({ message })` - Error occurred

## 🔒 Security Considerations

- Input validation on both client and server
- Room access control
- SQL injection prevention with parameterized queries
- XSS protection through React's built-in escaping

## 🚧 Future Enhancements

- User authentication and profiles
- Leaderboards and statistics
- More game modes
- Voice chat integration
- Mobile app versions
- Tournament system
- Custom room settings
- AI opponents for single-player mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Sri Lankan cultural heritage for inspiration
- The gaming community for feedback and support

