let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let computerOpponent = true;
let userScore = 0;
let computerScore = 0;

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const statusDisplay = document.getElementById('status');
const playWithComputerButton = document.getElementById('play-with-computer');
const invitePlayerButton = document.getElementById('invite-player');
const userScoreDisplay = document.getElementById('user-score');
const computerScoreDisplay = document.getElementById('computer-score');
const resetButton = document.getElementById('reset-button');

function handleResultValidation() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winConditions.length; i++) {
        const winCondition = winConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} has won!`;
        if (currentPlayer === 'X') {
            userScore++;
            userScoreDisplay.innerHTML = `User: ${userScore}`;
        } else {
            computerScore++;
            computerScoreDisplay.innerHTML = `Computer: ${computerScore}`;
        }
        gameActive = false;
        highlightWinningLine(winningLine);
        setTimeout(resetGame, 1500); // Automatically restart the game after 1.5 seconds
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        statusDisplay.innerHTML = `Game ended in a draw!`;
        gameActive = false;
        setTimeout(resetGame, 2000); // Automatically restart the game after 2 seconds
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (currentPlayer === 'O' && computerOpponent) {
        setTimeout(computerMove, 500); // Adding a slight delay for realism
    } else if (currentPlayer === 'O' && !computerOpponent) {
        updateURL();
    }

    statusDisplay.innerHTML = currentPlayer === 'X' ? 'Your turn!' : 'Computer\'s turn';
}


function highlightWinningLine(line) {
    line.forEach(index => {
        document.getElementById(`cell-${index}`).classList.add('highlight');
    });
}

function makeMove(index) {
    if (board[index] !== '' || !gameActive) {
        return;
    }

    board[index] = currentPlayer;
    document.getElementById(`cell-${index}`).innerHTML = currentPlayer;
    document.getElementById(`cell-${index}`).classList.add(currentPlayer);

    handleResultValidation();
}

function computerMove() {
    const bestMove = minimax(board, 'O', 2).index; // Limit depth to 2 for medium difficulty
    makeMove(bestMove);
}

function checkWinner() {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'tie';
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('highlight', 'X', 'O');
        cell.style.backgroundColor = '';
    });
    statusDisplay.innerHTML = computerOpponent ? 'Playing with Computer.' : 'Playing against another player.';
    resetButton.innerHTML = 'Restart Game';
    if (computerOpponent && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
    updateURL();
}

function playWithComputer() {
    resetGame();
    computerOpponent = true;
    playWithComputerButton.style.display = 'none';
    invitePlayerButton.style.display = 'inline-block';
}

function invitePlayer() {
    computerOpponent = false;
    resetGame();
    userScoreDisplay.innerHTML = 'You: 0';
    statusDisplay.innerHTML = 'Playing against another player. Share this link with your friend.';
    invitePlayerButton.style.display = 'none';
    playWithComputerButton.style.display = 'inline-block';
}

function updateURL() {
    const state = JSON.stringify({ board, currentPlayer, gameActive });
    const url = new URL(window.location);
    url.searchParams.set('state', btoa(state));
    window.history.replaceState(null, '', url);
}

function loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('state')) {
        const state = JSON.parse(atob(urlParams.get('state')));
        board = state.board;
        currentPlayer = state.currentPlayer;
        gameActive = state.gameActive;

        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.innerHTML = board[index];
            cell.classList.remove('highlight', 'X', 'O');
            cell.style.backgroundColor = '';
            if (board[index] === 'X' || board[index] === 'O') {
                cell.classList.add(board[index]);
            }
        });
        handleResultValidation();
    }
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('invite')) {
        computerOpponent = false;
        resetGame();
        userScoreDisplay.innerHTML = 'User 2: 0';
        statusDisplay.innerHTML = 'You are playing against another player. Share this link with your friend.';
    } else {
        playWithComputer();
    }
    loadStateFromURL();
}

// Minimax algorithm with depth limit
function minimax(newBoard, player, depth) {
    const availableSpots = newBoard.reduce((acc, val, index) => val === '' ? acc.concat(index) : acc, []);
    
    if (checkWinner(newBoard) === 'X') {
        return { score: -10 };
    } else if (checkWinner(newBoard) === 'O') {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    if (depth === 0) {
        return { score: 0 }; // Limit the depth for medium difficulty
    }

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X', depth - 1);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O', depth - 1);
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }

    return bestMove;
}

function checkWinner(board) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'tie';
}
