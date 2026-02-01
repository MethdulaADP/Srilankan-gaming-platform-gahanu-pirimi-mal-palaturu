// Sinhala Word Puzzle Game - Find words in a grid
export class AksharaKeliya {
  constructor(roomId) {
    this.roomId = roomId;
    this.grid = this.generateGrid();
    this.words = this.getWordList();
    this.foundWords = new Set();
    this.playerScores = {};
  }

  generateGrid() {
    // Create a 6x6 grid with Sinhala letters and some English
    const letters = [
      'අ', 'ආ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඒ', 'ඔ', 'ඕ',
      'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ', 'ත', 'ද', 'න', 'ප',
      'බ', 'ම', 'ය', 'ර', 'ල', 'ව', 'ස', 'හ', 'ළ', 'ෆ',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
    ];

    const grid = [];
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 6; j++) {
        row.push(letters[Math.floor(Math.random() * letters.length)]);
      }
      grid.push(row);
    }

    // Place some words in the grid
    this.placeWordsInGrid(grid);
    
    return grid;
  }

  placeWordsInGrid(grid) {
    const wordsToPlace = ['CAT', 'DOG', 'SUN', 'FUN'];
    
    wordsToPlace.forEach(word => {
      // Simple horizontal placement
      const row = Math.floor(Math.random() * 6);
      const col = Math.floor(Math.random() * (6 - word.length));
      
      for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = word[i];
      }
    });
  }

  getWordList() {
    return [
      { word: 'CAT', translation: 'බළලා', points: 10 },
      { word: 'DOG', translation: 'බල්ලා', points: 10 },
      { word: 'SUN', translation: 'හිරු', points: 10 },
      { word: 'FUN', translation: 'විනෝදය', points: 10 }
    ];
  }

  submitWord(playerId, word) {
    const upperWord = word.toUpperCase();
    const wordObj = this.words.find(w => w.word === upperWord);
    
    if (wordObj && !this.foundWords.has(upperWord)) {
      this.foundWords.add(upperWord);
      this.playerScores[playerId] = (this.playerScores[playerId] || 0) + wordObj.points;
      return { success: true, points: wordObj.points, translation: wordObj.translation };
    }
    
    return { success: false, message: 'Word not found or already discovered' };
  }

  getState() {
    return {
      grid: this.grid,
      words: this.words,
      foundWords: Array.from(this.foundWords),
      scores: this.playerScores
    };
  }
}
