class StartGame {
  constructor() {
    this.endgameEl = document.getElementById('end-game-container');
    this.start = document.getElementById('start-btn');
    this.difficultySelect = document.getElementById('difficulty');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settings = document.getElementById('settings');
    this.difficultySelect.addEventListener('click', this.setDifficulty.bind(this));
    this.start.addEventListener('click', this.startGame.bind(this));
    this.settingsBtn.addEventListener('click', this.hide.bind(this));
    this.difficultyValue;
  }
  
  hide() {
    this.settings.classList.toggle('hide');
  }

  setDifficulty(e) {
    if (this.difficultySelect.selectedIndex !== 0) {
      this.difficultyValue = e.target.value;
    }
  }
   
  hideEndGameContainer() {
    this.endgameEl.style.display = "none";
  }

  async startGame() {
    if (this.difficultySelect.selectedIndex === 0) {
      this.endgameEl.innerHTML = `<div>Please choose a difficulty first</div>
      <button onclick="startGame.hideEndGameContainer()">
      Start Again
      </button>`;
      this.endgameEl.style.display = "flex";
      return;
    }
    const game = new Game(this.difficultyValue);
    await game.game();
  }
}

class Game {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.wordContainer = document.getElementById('word');
    this.text = document.getElementById('text');
    this.scoreEl = document.getElementById('score');
    this.wordArray = [];
    this.index = 0;
    this.score = 0;
    this.initialCountdown;
    this.wordLength;
    this.countDown;
    this.wordsNum;
    this.myInterval;
    this.myCountdown;
    this.timeEl = document.getElementById('time');
    this.wordsLeft = document.getElementById('words-left');
    this.text.addEventListener('input', this.evaluate.bind(this));
    this.words = [];
  }

  setings() {
    this.wordLength = this.difficulty === 'easy' ? 7 : this.difficulty === 'medium' ? 8 : this.difficulty === 'hard' ? 9 : null;
    this.countDown = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 7 : this.difficulty === 'hard' ? 4 : null;
    this.wordsNum = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 7 : this.difficulty === 'hard' ? 4 : null;
  }

  // reset() {
  //   this.wordArray = [];
  //   this.index = 0;
  //   this.score = 0;
  // }  

  async game() {
    // this.reset();
    //this.start.disabled = "true";
    this.text.focus();
    this.setings();
    this.initialCountdown = this.countDown;
    this.words = await SetWords.fetchWord(this.wordLength, this.wordsNum);
    this.wordArray.push(this.words);
    this.myCountdown = setInterval(this.myCountdownFunc.bind(this), 1000);
    this.wordContainer.textContent = this.wordArray[0][this.index];
    this.myInterval = setInterval(this.myIntervalFunc.bind(this), this.countDown * 1000);
    this.setRemainingWordNum()
  }

  clearIntervals() {
    clearInterval(this.myCountdown);
    clearInterval(this.myInterval);
  }

  addScore() {
    this.score++;
    this.scoreEl.textContent = this.score;
  }

  evaluate() {
    if (this.text.value === this.wordContainer.textContent) {
      this.addScore();
      this.clearIntervals();
      this.moveNext();
      this.countDown = this.initialCountdown;
      this.myCountdown = setInterval(this.myCountdownFunc.bind(this), 1000);
      this.myInterval = setInterval(this.myIntervalFunc.bind(this), this.countDown * 1000);
      this.wordsNum--;
      this.setRemainingWordNum();
    }
  }

  myCountdownFunc() {
    if (this.wordsNum > 0) {
      this.countDown--;
      this.timeEl.textContent = `${this.countDown}s`;
      if (this.countDown === 0) {
        this.countDown = this.initialCountdown;
      }
    }
  }

  moveNext() {
    this.index++;
    this.text.value = "";
    this.wordContainer.textContent = this.wordArray[0][this.index];
  }

  myIntervalFunc() {
    if (this.wordsNum > 0) {
      this.moveNext();
      this.wordsNum--;
      this.setRemainingWordNum();
    } 
  }

  setRemainingWordNum() {
    this.wordsLeft.textContent = `Words left: ${this.wordsNum}`;
    if (this.wordsNum === 0) {
      //this.start.disabled = "false";
      const gameOver = new GameOver(this.score);
      gameOver.gameOver();
    }
  } 
}

class GameOver extends Game {
  constructor(score) {
    super();
    this.score = score;
    this.endgameEl = document.getElementById('end-game-container');
  }

  gameOver() {
    this.clearIntervals();
    this.wordsLeft.textContent = "Words left: 0";
    this.timeEl.textContent = "";
    this.endgameEl.innerHTML = `<div>Game Over. Score: ${this.score}</div>
      <button onclick="HideEndGameContainer.hideEndGameContainer()">
      Exit
      </button>`;
    this.endgameEl.style.display = "flex";
  }
}

class SetWords {
  static async fetchWord(wordLength, wordsNum) {
    const word = await GetWords.getWords(wordLength, wordsNum)
    return word;
  }
}

class HideEndGameContainer {
  static hideEndGameContainer() {
    const endgameEl = document.getElementById('end-game-container');
    endgameEl.style.display = 'none';
    const scoreEl = document.getElementById('score');
    scoreEl.textContent = 0;
  }
  
}

class GetWords {
  static async getWords(wordLength, wordsNum) {
    try {
        const words = await fetch(`https://random-word-api.vercel.app/api?words=${wordsNum}&length=${wordLength}`);
        if (!words.ok) {
            throw new Error("Failed to fetch words.");
        }
      const data = await words.json(); 
      return data;
    } catch (err) {
        console.error("Fetching error: ", err.message);
    }
  }
}

const startGame = new StartGame();
