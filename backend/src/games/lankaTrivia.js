// Sri Lankan Trivia Party Game
export class LankaTrivia {
  constructor(roomId) {
    this.roomId = roomId;
    this.questions = this.getQuestions();
    this.currentQuestionIndex = 0;
    this.playerAnswers = {};
    this.playerScores = {};
  }

  getQuestions() {
    return [
      {
        question: "What is the capital of Sri Lanka?",
        questionSinhala: "ශ්‍රී ලංකාවේ අගනගරය කුමක්ද?",
        options: ["Colombo", "Kandy", "Galle", "Jaffna"],
        optionsSinhala: ["කොළඹ", "මහනුවර", "ගාල්ල", "යාපනය"],
        correct: 0,
        points: 10
      },
      {
        question: "Which is the highest mountain in Sri Lanka?",
        questionSinhala: "ශ්‍රී ලංකාවේ උසම කන්ද කුමක්ද?",
        options: ["Adam's Peak", "Pidurutalagala", "Knuckles", "Horton Plains"],
        optionsSinhala: ["ශ්‍රී පාද", "පිදුරුතලාගල", "නකල්ස්", "හෝර්ටන් තැන්න"],
        correct: 1,
        points: 15
      },
      {
        question: "What is Sri Lanka's national flower?",
        questionSinhala: "ශ්‍රී ලංකාවේ ජාතික මල කුමක්ද?",
        options: ["Lotus", "Blue Water Lily", "Orchid", "Rose"],
        optionsSinhala: ["නෙළුම්", "නිල් මානෙල්", "ඕකිඩ්", "රෝස"],
        correct: 1,
        points: 10
      },
      {
        question: "Which ancient kingdom was known as the 'City of Kings'?",
        questionSinhala: "රජුන්ගේ නගරය ලෙස හැඳින්වෙන පුරාණ රාජධානිය කුමක්ද?",
        options: ["Anuradhapura", "Polonnaruwa", "Sigiriya", "Kandy"],
        optionsSinhala: ["අනුරාධපුරය", "පොළොන්නරුව", "සීගිරිය", "මහනුවර"],
        correct: 1,
        points: 15
      },
      {
        question: "What is the traditional Sri Lankan New Year called?",
        questionSinhala: "සාම්ප්‍රදායික ශ්‍රී ලාංකික අලුත් අවුරුද්ද කුමක්ද?",
        options: ["Vesak", "Sinhala and Tamil New Year", "Poson", "Deepavali"],
        optionsSinhala: ["වෙසක්", "සිංහල හා දෙමළ අලුත් අවුරුද්ද", "පොසොන්", "දීපවාලි"],
        correct: 1,
        points: 10
      }
    ];
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    const q = this.questions[this.currentQuestionIndex];
    return {
      index: this.currentQuestionIndex,
      total: this.questions.length,
      question: q.question,
      questionSinhala: q.questionSinhala,
      options: q.options,
      optionsSinhala: q.optionsSinhala,
      points: q.points
    };
  }

  submitAnswer(playerId, answerIndex) {
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;
    
    this.playerAnswers[playerId] = answerIndex;
    
    if (isCorrect) {
      this.playerScores[playerId] = (this.playerScores[playerId] || 0) + question.points;
    }
    
    return {
      correct: isCorrect,
      correctAnswer: question.correct,
      points: isCorrect ? question.points : 0
    };
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.playerAnswers = {};
    return this.getCurrentQuestion();
  }

  isGameOver() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  getState() {
    return {
      currentQuestion: this.getCurrentQuestion(),
      scores: this.playerScores,
      questionIndex: this.currentQuestionIndex,
      totalQuestions: this.questions.length
    };
  }

  getResults() {
    return {
      scores: this.playerScores,
      winner: Object.entries(this.playerScores).sort((a, b) => b[1] - a[1])[0]
    };
  }
}
