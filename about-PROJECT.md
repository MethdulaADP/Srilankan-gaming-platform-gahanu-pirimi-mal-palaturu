Project Status & Roadmap: Gahanu Pirimi Mal Palaturu
1. Project Overview
"Gahanu Pirimi Mal Palaturu" is a web-based platform dedicated to reviving and digitizing traditional Sri Lankan games. The project aims to bring the nostalgia of school-van rides and village festivals to the modern screen with a premium, culturally rich user experience.

The platform currently hosts one fully functional game (the titular "Word Game") and is architected to support multiple future games.

2. Technical Architecture
Framework: React (Vite) + TypeScript
Styling: Tailwind CSS (Custom "Sri Lankan" color palette: sl-maroon, sl-gold, sl-sand, sl-clay)
State Management: React useState / useReducer
Multiplayer Sync: Custom localStorage polling mechanism (Simulates real-time updates for local/same-browser testing; see Section 4).
Visualization: D3.js for leaderboard charts.
3. Current Status: Completed Features
Core Platform
Dashboard / Hub: A visually stunning landing page featuring:
Hero section with "Play Now" and "How to Play" actions.
Game Selection Grid (Word Game active; Pancha and Daam placeholders).
Cultural/History informational modals.
Background ambient music toggle.
Routing: Basic state-based routing between Dashboard and Game Rooms.
Game 1: Gahanu Pirimi Mal Palaturu (The Word Game)
Status: ✅ COMPLETE

Gameplay Loop:

Lobby: Create Room (Host) or Join Room (Guest). Players can add Bot opponents.
Round Start: Random letter generation (Sinhala/English).
Playing:
Players fill out categories: Girl Name, Boy Name, Fruit, Flower, Animal, Village, Country.
"Grace Period" Logic: When the first player finishes and clicks "STOP", a 10-second countdown begins for all other players.
Auto-Save: Inputs are saved to temporary storage to prevent data loss when the timer cuts off.
Review Phase:
Group voting system to validate answers.
Host controls the flow of reviewing each player.
Leaderboard:
Score calculation (10 pts per correct answer).
D3.js bar chart for visual score comparison.
"Play Again" functionality.
Key Features:

Bilingual Support: Toggle between Sinhala and English modes.
Bot Logic: Automated opponents with pre-defined answer banks.
Room Code System: Simple 4-digit code for joining games.
4. Roadmap: Remaining Things & Future Games
To turn this into a multi-game arcade, the following extensions are planned.

Game 2: Rahas Wachanaya (Find the Imposter)
Status: 🟡 **READY FOR TESTING**
Description: A 5-player social deduction game.
Features Implemented:
- Lobby with 5-player limit.
- Role Assignment (1 Imposter, 4 Innocent).
- Chat-based gameplay with 5 rounds.
- "We Know the Imposter" voting mechanism.
- Imposter "Guess Word" victory condition.
Game 3: Daam (දාම්) - Checkers Variant
Description: A strategic board game played on a 10x10 or 12x12 grid, similar to International Draughts. Status: 🚧 Planned Implementation Plan:

Board UI: A checkered board component (more complex than 8x8 standard checkers).
Logic Needed:
Turn Management: Strict turn-taking enforcement.
Move Validation: Valid diagonal moves, forced captures (if a capture is available, it must be taken).
King Logic: Detailed "Flying King" rules (can move any distance diagonally).
5. Technical Recommendations (Refactoring for Scale)
Before starting Game 2, we recommend these architectural changes:

A. Routing Upgrade (✅ COMPLETED)
Current: App.tsx uses Routes and Route from react-router-dom.
Routes: /, /word-game, /word-game/:roomId.
B. Component Extraction (✅ COMPLETED)
Extracted reusable parts from GameRoom.tsx to be used in Pancha and Daam:
Lobby: Extracted to components/Lobby.tsx.
C. Backend Evolution (Optional)
Current: localStorage polling. Good for same-device testing or simple demos.
Limitation: Does not work across different real devices (e.g., from my phone to your laptop).
Proposed: Integrate a real real-time backend.
Firebase Realtime Database: Easiest integration. Listen to /rooms/{roomId}.
Socket.io: More control, requires a Node.js server.