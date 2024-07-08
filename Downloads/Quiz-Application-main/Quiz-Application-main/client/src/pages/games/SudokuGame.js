import React, { useState, useEffect } from "react";
import "./Sudoku.css";

const initialBoards = [
  [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9],
  ],
  [
    [null, null, 3, null, 2, null, 6, null, null],
    [9, null, null, 3, null, 5, null, null, 1],
    [null, null, 1, 8, null, 6, 4, null, null],
    [null, null, 8, 1, null, 2, 9, null, null],
    [7, null, null, null, null, null, null, null, 8],
    [null, null, 6, 7, null, 8, 2, null, null],
    [null, null, 2, 6, null, 9, 5, null, null],
    [8, null, null, 2, null, 3, null, null, 9],
    [null, null, 5, null, 1, null, 3, null, null],
  ],
  [
    [null, 2, null, 6, null, 8, null, null, null],
    [5, 8, null, null, null, 9, 7, null, null],
    [null, null, null, null, 4, null, null, null, null],
    [3, 7, null, null, null, null, 5, null, null],
    [6, null, null, null, null, null, null, null, 4],
    [null, null, 8, null, null, null, null, 1, 3],
    [null, null, null, null, 2, null, null, null, null],
    [null, null, 9, 8, null, null, null, 3, 6],
    [null, null, null, 3, null, 6, null, 9, null],
  ],
];

const solutionBoards = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [4, 8, 3, 9, 2, 1, 6, 5, 7],
    [9, 6, 7, 3, 4, 5, 8, 2, 1],
    [2, 5, 1, 8, 7, 6, 4, 9, 3],
    [5, 4, 8, 1, 3, 2, 9, 7, 6],
    [7, 2, 9, 5, 6, 4, 1, 3, 8],
    [1, 3, 6, 7, 9, 8, 2, 4, 5],
    [3, 7, 2, 6, 8, 9, 5, 1, 4],
    [8, 1, 4, 2, 5, 3, 7, 6, 9],
    [6, 9, 5, 4, 1, 7, 3, 8, 2],
  ],
  [
    [1, 2, 3, 6, 7, 8, 9, 4, 5],
    [5, 8, 4, 2, 3, 9, 7, 6, 1],
    [9, 6, 7, 1, 4, 5, 3, 2, 8],
    [3, 7, 2, 4, 6, 1, 5, 8, 9],
    [6, 9, 1, 5, 8, 3, 2, 7, 4],
    [4, 5, 8, 7, 9, 2, 6, 1, 3],
    [8, 3, 6, 9, 2, 4, 1, 5, 7],
    [2, 1, 9, 8, 5, 7, 4, 3, 6],
    [7, 4, 5, 3, 1, 6, 8, 9, 2],
  ],
];

const SudokuGame = () => {
  const [board, setBoard] = useState([]);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * initialBoards.length);
    setBoard(initialBoards[randomIndex]);
    setSolutionBoard(solutionBoards[randomIndex]);
  }, []);

  const handleInputChange = (rowIndex, colIndex, value) => {
    const newBoard = [...board];
    newBoard[rowIndex][colIndex] = value;
    setBoard(newBoard);

    const newErrors = validateBoard(newBoard);
    setErrors(newErrors);
  };

  const isBoardCompleted = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (
          board[i][j] === null ||
          board[i][j] === undefined ||
          board[i][j] === ""
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const isBoardCorrect = () => {
    return errors.length === 0;
  };

  const validateBoard = (board) => {
    const errors = [];

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== null && board[i][j] !== solutionBoard[i][j]) {
          errors.push({ row: i, col: j });
        }
      }
    }

    return errors;
  };

  const handleSubmit = () => {
    if (isBoardCompleted() && isBoardCorrect()) {
      alert("Congratulations! Sudoku completed successfully.");
    } else {
      alert("There are errors in the Sudoku board.");
    }
  };

  return (
    <div className="sudoku">
      <h1 className="sudoku-heading">Sudoku Game</h1>
      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => (
              <input
                key={colIndex}
                type="text"
                className={`sudoku-cell ${
                  errors.some(
                    (error) => error.row === rowIndex && error.col === colIndex
                  )
                    ? "error"
                    : ""
                }`}
                value={cell || ""}
                onChange={(e) =>
                  handleInputChange(
                    rowIndex,
                    colIndex,
                    parseInt(e.target.value) || null
                  )
                }
                disabled={
                  cell !== null &&
                  !errors.some(
                    (error) => error.row === rowIndex && error.col === colIndex
                  )
                } // Disable initial values
              />
            ))}
          </div>
        ))}
      </div>
      <button className="sudoku-submit-btn" onClick={handleSubmit}>
        Submit Sudoku
      </button>
    </div>
  );
};

export default SudokuGame;
