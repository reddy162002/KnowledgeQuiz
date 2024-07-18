import React, { useState, useEffect } from "react";
import "./newStyles.css";

const WordGridGame = ({ waitTime}) => {
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(waitTime);

  useEffect(() => {
    console.log("secondsLeft updated:", secondsLeft);
    if (secondsLeft > 0) {
      const timerId = setInterval(() => {
        setSecondsLeft((prevSeconds) => {
          console.log("Prev secondsLeft:", prevSeconds);
          return prevSeconds - 1;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [secondsLeft]);

  useEffect(() => {
    console.log("waitTime updated:", waitTime);
    setSecondsLeft(waitTime); // Reset secondsLeft when waitTime changes
  }, [waitTime]);

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const rows = 6;
    const cols = 10;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "GRAPE"];

    let newGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        letter: letters.charAt(Math.floor(Math.random() * letters.length)),
        isHidden: false, // indicates if this cell contains part of a hidden word
        wordChar: "", // the character of the hidden word in this cell
        isSelected: false, // indicates if this cell is selected
        isFound: false, // indicates if this cell is part of a found word
      }))
    );

    // Place words randomly in the grid
    words.forEach((word) => {
      let wordPlaced = false;
      while (!wordPlaced) {
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
        const startRow = Math.floor(Math.random() * rows);
        const startCol = Math.floor(Math.random() * cols);
        if (canPlaceWord(word, newGrid, startRow, startCol, orientation)) {
          placeWord(word, newGrid, startRow, startCol, orientation);
          wordPlaced = true;
        }
      }
    });

    setGrid(newGrid);
    setWordsToFind(words);
    setFoundWords([]);
    setSelectedCells([]);
    setGameOver(false);
  };

  const canPlaceWord = (word, grid, startRow, startCol, orientation) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const wordLength = word.length;

    if (orientation === "horizontal" && startCol + wordLength > cols) {
      return false;
    }
    if (orientation === "vertical" && startRow + wordLength > rows) {
      return false;
    }

    for (let i = 0; i < wordLength; i++) {
      const row = orientation === "vertical" ? startRow + i : startRow;
      const col = orientation === "horizontal" ? startCol + i : startCol;

      if (
        grid[row][col].isHidden &&
        grid[row][col].wordChar !== word.charAt(i)
      ) {
        return false;
      }
    }

    return true;
  };

  const placeWord = (word, grid, startRow, startCol, orientation) => {
    const wordLength = word.length;

    for (let i = 0; i < wordLength; i++) {
      const row = orientation === "vertical" ? startRow + i : startRow;
      const col = orientation === "horizontal" ? startCol + i : startCol;
      grid[row][col].isHidden = true;
      grid[row][col].wordChar = word.charAt(i);
    }
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (gameOver || grid[rowIndex][colIndex].isSelected) return;

    const newSelectedCells = [...selectedCells, { rowIndex, colIndex }];
    setSelectedCells(newSelectedCells);

    const selectedLetters = newSelectedCells
      .map((cell) => grid[cell.rowIndex][cell.colIndex].wordChar)
      .join("");

    // Check if the selected letters match any word
    const foundWord = wordsToFind.find((word) => word === selectedLetters);

    if (foundWord) {
      const newFoundWords = [...foundWords, foundWord];
      setFoundWords(newFoundWords);

      // Mark cells of the found word as isFound
      newSelectedCells.forEach((cell) => {
        grid[cell.rowIndex][cell.colIndex].isFound = true;
      });

      setGameOver(newFoundWords.length === wordsToFind.length);
      setSelectedCells([]);
    } else if (
      newSelectedCells.length >=
      Math.max(...wordsToFind.map((word) => word.length))
    ) {
      // Reset selection if the sequence of cells doesn't form a word
      newSelectedCells.forEach((cell) => {
        grid[cell.rowIndex][cell.colIndex].isSelected = false;
      });
      setSelectedCells([]);
    } else {
      // Mark selected cells as isSelected
      grid[rowIndex][colIndex].isSelected = true;
    }

    setGrid([...grid]);
  };

  const restartGame = () => {
    generateGrid();
  };

  return (
    <div className="word-grid-game" style={{display:"grid", justifyContent:"center"}}>
      <h1 style={{placeSelf:"center"}}>Word Search Game</h1>
      <p style={{placeSelf:"center"}}>Hidden Words: {wordsToFind.length}</p>
      <div className="grid-container">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${
                  cell.isFound
                    ? "found"
                    : selectedCells.find(
                        (selected) =>
                          selected.rowIndex === rowIndex &&
                          selected.colIndex === colIndex
                      )
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.isHidden ? cell.wordChar : cell.letter}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:"grid", placeContent: "center"}} className="word-list">
        <h2>Words to Find</h2>
        <div style={{display:"flex", gap:"2vw"}}>
          {wordsToFind.map((word, index) => (
            <div
              key={index}
              className={foundWords.includes(word) ? "found" : ""}
            >
              {word}
            </div>
          ))}
        </div>
        <br></br>
        <div className="text-center text-lg">
                  Next Question in : {secondsLeft} seconds
                </div>
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Congratulations!</h2>
          <p>You found all the hidden words.</p>
          <button className="primary-outlined-btn" onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default WordGridGame;
