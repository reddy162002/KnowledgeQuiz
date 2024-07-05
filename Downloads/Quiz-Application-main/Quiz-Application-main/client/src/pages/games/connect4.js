// src/ConnectFourGame.js
import React, { useState, useEffect } from "react";
import "./styles.css";

const ConnectFourGame = ({ setWinner }) => {
  const rows = 6;
  const columns = 7;
  const [board, setBoard] = useState(
    Array(rows)
      .fill(null)
      .map(() => Array(columns).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("Red");
  const [gameWinner, setGameWinner] = useState(null);

  useEffect(() => {
    if (currentPlayer === "Yellow" && !gameWinner) {
      const timeout = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, gameWinner]);

  useEffect(() => {
    if (gameWinner) {
      setWinner(gameWinner);
    }
  }, [gameWinner, setWinner]);

  const handleClick = (col) => {
    if (gameWinner || currentPlayer === "Yellow") return;

    const newBoard = makeMove(board, col, currentPlayer);
    if (!newBoard) return;

    setBoard(newBoard);
    if (checkForWinner(newBoard, currentPlayer)) {
      setGameWinner(currentPlayer);
    } else {
      setCurrentPlayer("Yellow");
    }
  };

  const computerMove = () => {
    const { col } = minimax(board, 5, -Infinity, Infinity, true);
    const newBoard = makeMove(board, col, "Yellow");

    setBoard(newBoard);
    if (checkForWinner(newBoard, "Yellow")) {
      setGameWinner("Yellow");
    } else {
      setCurrentPlayer("Red");
    }
  };

  const makeMove = (board, col, player) => {
    for (let row = rows - 1; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = board.map((row) => row.slice());
        newBoard[row][col] = player;
        return newBoard;
      }
    }
    return null;
  };

  const checkForWinner = (board, player) => {
    const checkDirection = (dx, dy) => {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          let count = 0;
          for (let k = 0; k < 4; k++) {
            const r = row + k * dy;
            const c = col + k * dx;
            if (r >= 0 && r < rows && c >= 0 && c < columns && board[r][c] === player) {
              count++;
            } else {
              break;
            }
          }
          if (count === 4) return true;
        }
      }
      return false;
    };

    return (
      checkDirection(1, 0) || // Horizontal
      checkDirection(0, 1) || // Vertical
      checkDirection(1, 1) || // Diagonal /
      checkDirection(1, -1)   // Diagonal \
    );
  };

  const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
    const winner = checkForWinner(board, "Yellow")
      ? "Yellow"
      : checkForWinner(board, "Red")
      ? "Red"
      : null;

    if (depth === 0 || winner) {
      if (winner === "Yellow") return { score: 10 - depth };
      if (winner === "Red") return { score: depth - 10 };
      return { score: 0 };
    }

    const availableMoves = [];
    for (let col = 0; col < columns; col++) {
      if (board[0][col] === null) availableMoves.push(col);
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      let bestMove = null;
      for (const col of availableMoves) {
        const newBoard = makeMove(board, col, "Yellow");
        const { score } = minimax(newBoard, depth - 1, alpha, beta, false);
        if (score > maxEval) {
          maxEval = score;
          bestMove = col;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return { col: bestMove, score: maxEval };
    } else {
      let minEval = Infinity;
      let bestMove = null;
      for (const col of availableMoves) {
        const newBoard = makeMove(board, col, "Red");
        const { score } = minimax(newBoard, depth - 1, alpha, beta, true);
        if (score < minEval) {
          minEval = score;
          bestMove = col;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return { col: bestMove, score: minEval };
    }
  };

  const resetGame = () => {
    setBoard(
      Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(null))
    );
    setCurrentPlayer("Red");
    setGameWinner(null);
  };

  return (
    <div className="connect-container">
      <h1>Connect Four</h1>
      {gameWinner && <h2>{gameWinner === "Red" ? "Blue" : "Yellow"} wins!</h2>}
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="cell"
                onClick={() => handleClick(colIndex)}
              >
                <div className={`disc ${cell}`}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="primary-outline-btn" onClick={resetGame}>Reset</button>
    </div>
  );
};

export default ConnectFourGame;