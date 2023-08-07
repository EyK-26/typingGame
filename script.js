class StartGame {
  constructor() {
    this.endgameEl = document.getElementById('end-game-container');
    this.start = document.getElementById('start-btn');
    this.difficultySelect = document.getElementById('difficulty');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settings = document.getElementById('settings');
    this.difficultySelect.addEventListener('change', this.setDifficulty.bind(this));
    this.start.addEventListener('click', this.startGame.bind(this));
    this.settingsBtn.addEventListener('click', this.hide.bind(this));
    this.difficultyValue;
  }
  
  hide() {
    this.settings.classList.toggle('hide');
  }

  setDifficulty(e) {
    this.difficultyValue = e.target.value;
  }
   
  hideEndGameContainer() {
    this.endgameEl.style.display = "none";
  }

  async startGame() {
    if (!this.difficultyValue) {
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

class Game extends StartGame{
  constructor(difficulty) {
    super();
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
  }

  setings() {
    this.wordLength = this.difficulty === 'easy' ? 7 : this.difficulty === 'medium' ? 8 : this.difficulty === 'hard' ? 9 : null;
    this.countDown = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 7 : this.difficulty === 'hard' ? 4 : null;
    this.wordsNum = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 7 : this.difficulty === 'hard' ? 4 : null;
  }

  async game() {
    //this.start.disabled = "true";
    this.text.focus();
    this.setings();
    this.initialCountdown = this.countDown;
    const word = await SetWords.fetchWord(this.wordLength, this.wordsNum);
    this.wordArray.push(word);
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

  setRemainingWordNum() {
    this.wordsLeft.textContent = `Words left: ${this.wordsNum}`;
    if (this.wordsNum === 0) {
      //this.start.disabled = "false";
      const gameOver = new GameOver();
      gameOver.gameOver();
    }
  }

  evaluate() {
    if (this.text.value === this.wordContainer.textContent) {
      this.text.value = "";
      this.addScore();
      this.clearIntervals();
      this.index++;
      this.wordContainer.textContent = this.wordArray[0][this.index];
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

  myIntervalFunc() {
    if (this.wordsNum > 0) {
      this.index++;
      this.text.value = "";
      this.wordContainer.textContent = this.wordArray[0][this.index];
      this.wordsNum--;
      this.setRemainingWordNum();
    } 
  }
}

class GameOver extends Game {
  constructor() {
    super();
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

