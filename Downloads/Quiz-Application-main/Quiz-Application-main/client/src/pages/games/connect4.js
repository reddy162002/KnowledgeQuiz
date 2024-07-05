// src/ConnectFourGame.js
import React, { useState, useEffect } from "react";
import "./styles.css";

const ConnectFourGame = () => {
  const rows = 6;
  const columns = 7;
  const [board, setBoard] = useState(
    Array(rows)
      .fill(null)
      .map(() => Array(columns).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("Red");
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (currentPlayer === "Yellow" && !winner) {
      const timeout = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, winner]);

  const handleClick = (col) => {
    if (winner || currentPlayer === "Yellow") return;

    const newBoard = makeMove(board, col, currentPlayer);
    if (!newBoard) return;

    setBoard(newBoard);
    if (checkForWinner(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer("Yellow");
    }
  };

  const computerMove = () => {
    const { col } = minimax(board, 5, -Infinity, Infinity, true);
    const newBoard = makeMove(board, col, "Yellow");

    setBoard(newBoard);
    if (checkForWinner(newBoard, "Yellow")) {
      setWinner("Yellow");
    } else {
      setCurrentPlayer("Red");
    }
  };

  const getValidMoves = (board) => {
    return board[0]
      .map((cell, colIndex) => (cell === null ? colIndex : null))
      .filter((col) => col !== null);
  };

  const makeMove = (board, col, player) => {
    const newBoard = board.map((row) => row.slice());
    for (let row = rows - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = player;
        return newBoard;
      }
    }
    return null;
  };

  const checkForWinner = (board, player) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (
          checkDirection(board, row, col, 0, 1, player) ||
          checkDirection(board, row, col, 1, 0, player) ||
          checkDirection(board, row, col, 1, 1, player) ||
          checkDirection(board, row, col, 1, -1, player)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const checkDirection = (board, row, col, rowDir, colDir, player) => {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      const newRow = row + i * rowDir;
      const newCol = col + i * colDir;
      if (
        newRow < 0 ||
        newRow >= rows ||
        newCol < 0 ||
        newCol >= columns ||
        board[newRow][newCol] !== player
      ) {
        break;
      }
      count++;
    }
    return count === 4;
  };

  const evaluateBoard = (board) => {
    let score = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (board[row][col] === "Yellow") {
          score += evaluatePosition(board, row, col, "Yellow");
        } else if (board[row][col] === "Red") {
          score -= evaluatePosition(board, row, col, "Red");
        }
      }
    }
    return score;
  };

  const evaluatePosition = (board, row, col, player) => {
    let score = 0;
    if (checkDirection(board, row, col, 0, 1, player)) score++;
    if (checkDirection(board, row, col, 1, 0, player)) score++;
    if (checkDirection(board, row, col, 1, 1, player)) score++;
    if (checkDirection(board, row, col, 1, -1, player)) score++;
    return score;
  };

  const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
    const validMoves = getValidMoves(board);
    const isTerminal =
      validMoves.length === 0 ||
      checkForWinner(board, "Red") ||
      checkForWinner(board, "Yellow");

    if (depth === 0 || isTerminal) {
      if (checkForWinner(board, "Yellow")) {
        return { score: 1000 };
      } else if (checkForWinner(board, "Red")) {
        return { score: -1000 };
      } else {
        return { score: evaluateBoard(board) };
      }
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      let bestMove = null;
      for (let col of validMoves) {
        const newBoard = makeMove(board, col, "Yellow");
        const evaluation = minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          false
        ).score;
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = col;
        }
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return { col: bestMove, score: maxEval };
    } else {
      let minEval = Infinity;
      let bestMove = null;
      for (let col of validMoves) {
        const newBoard = makeMove(board, col, "Red");
        const evaluation = minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          true
        ).score;
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = col;
        }
        beta = Math.min(beta, evaluation);
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
    setWinner(null);
  };

  return (
    <div className="connect-container">
      <h1>Connect Four</h1>
      {winner && <h2>{winner=== "Red" ? "Blue" : "Yellow"} wins!</h2>}
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
      {/* <button className="primary-outlined-btn" onClick={resetGame}>Reset Game</button> */}
    </div>
  );
};

export default ConnectFourGame;