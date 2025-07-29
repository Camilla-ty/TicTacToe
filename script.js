// Gameboard 모듈 (IIFE)
const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;
  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };
  const setMark = (index, mark) => {
    if (board[index] === "") {
      board[index] = mark;
      return true;
    }
    return false;
  };
  const checkWin = () => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c]
      ) {
        return board[a]; // 'X' or 'O'
      }
    }
    return null;
  };
  const checkTie = () => {
    return board.every(cell => cell !== "") && !checkWin();
  };
  return { getBoard, reset, setMark, checkWin, checkTie };
})();

// Player 팩토리
function Player(name, mark) {
  return { name, mark };
}

// GameController 모듈 (IIFE)
const GameController = (() => {
  let player1, player2, currentPlayer, gameOver;

  const start = (name1 = "Player 1", name2 = "Player 2") => {
    player1 = Player(name1, "X");
    player2 = Player(name2, "O");
    currentPlayer = player1;
    gameOver = false;
    Gameboard.reset();
    // console.log(`게임 시작! ${player1.name}(X) vs ${player2.name}(O)`);
    // printBoard();
  };

  const playTurn = (index) => {
    if (gameOver) {
      // console.log("게임이 이미 종료되었습니다. 재시작하세요.");
      return;
    }
    if (Gameboard.setMark(index, currentPlayer.mark)) {
      // printBoard();
      const winner = Gameboard.checkWin();
      if (winner) {
        gameOver = true;
        return;
      }
      if (Gameboard.checkTie()) {
        gameOver = true;
        return;
      }
      currentPlayer = currentPlayer === player1 ? player2 : player1;
    } else {
      // console.log("이미 선택된 칸입니다. 다른 칸을 선택하세요.");
    }
  };

  const getCurrentPlayer = () => currentPlayer;
  const isGameOver = () => gameOver;

  return { start, playTurn, getCurrentPlayer, isGameOver };
})();

// DisplayController 모듈 (IIFE)
const DisplayController = (() => {
  const boardElement = document.getElementById("gameboard");
  const resultElement = document.getElementById("result");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const player1Input = document.getElementById("player1");
  const player2Input = document.getElementById("player2");
  const turnIndicator = document.getElementById("turn-indicator");

  // 보드 렌더링
  function renderBoard() {
    const board = Gameboard.getBoard();
    boardElement.innerHTML = "";
    board.forEach((cell, idx) => {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.textContent = cell;
      cellDiv.dataset.index = idx;
      cellDiv.style.width = "60px";
      cellDiv.style.height = "60px";
      cellDiv.style.display = "flex";
      cellDiv.style.alignItems = "center";
      cellDiv.style.justifyContent = "center";
      cellDiv.style.fontSize = "2rem";
      cellDiv.style.background = "#fff";
      cellDiv.style.border = "1px solid #ccc";
      cellDiv.style.cursor = cell === "" && !GameController.isGameOver() ? "pointer" : "not-allowed";
      cellDiv.addEventListener("click", handleCellClick);
      boardElement.appendChild(cellDiv);
    });
  }

  // 턴 표시 렌더링
  function renderTurn() {
    if (GameController.isGameOver()) {
      turnIndicator.textContent = "";
      return;
    }
    const player = GameController.getCurrentPlayer();
    turnIndicator.textContent = `${player.name}(${player.mark}) 차례입니다.`;
  }

  // 결과 렌더링
  function renderResult() {
    const winner = Gameboard.checkWin();
    if (winner) {
      const name = winner === "X" ? player1Input.value || "Player 1" : player2Input.value || "Player 2";
      resultElement.textContent = `${name}(${winner}) 승리! 🎉`;
    } else if (Gameboard.checkTie()) {
      resultElement.textContent = "무승부!";
    } else {
      resultElement.textContent = "";
    }
  }

  // 셀 클릭 핸들러
  function handleCellClick(e) {
    const idx = Number(e.target.dataset.index);
    if (Gameboard.getBoard()[idx] !== "" || GameController.isGameOver()) {
      return;
    }
    GameController.playTurn(idx);
    renderBoard();
    renderResult();
    renderTurn();
  }

  // 입력란 활성/비활성화
  function setInputsDisabled(disabled) {
    player1Input.disabled = disabled;
    player2Input.disabled = disabled;
  }

  // 게임 시작/재시작 핸들러
  function startGame() {
    const name1 = player1Input.value || "Player 1";
    const name2 = player2Input.value || "Player 2";
    GameController.start(name1, name2);
    renderBoard();
    renderResult();
    renderTurn();
    setInputsDisabled(true);
  }

  // 재시작 버튼은 입력란 활성화
  function restartGame() {
    setInputsDisabled(false);
    resultElement.textContent = "";
    turnIndicator.textContent = "";
    boardElement.innerHTML = "";
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);

  // 최초 렌더링
  renderBoard();

  return { renderBoard, renderResult, renderTurn };
})(); 