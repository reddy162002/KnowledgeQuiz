// src/WhackAMole.js
import React, { useState, useEffect } from "react";
import "./styles.css";

const WhackAMole = () => {
  const [holes, setHoles] = useState(new Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const moleInterval = setInterval(() => {
      const newHoles = new Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newHoles[randomIndex] = true;
      setHoles(newHoles);
    }, 1000);

    const gameTimer = setTimeout(() => {
      clearInterval(moleInterval);
      setGameOver(true);
    }, 30000); 

    return () => {
      clearInterval(moleInterval);
      clearTimeout(gameTimer);
    };
  }, [gameOver]);

  const handleClick = (index) => {
    if (holes[index]) {
      setScore(score + 1);
      setHoles(new Array(9).fill(false));
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setHoles(new Array(9).fill(false));
  };

  return (
      <div className="game-container">
      <h1 style={{fontSize:"6vh", fontWeight:"550"}}>Score: {score}</h1>
      {!gameOver ? (
      <div className="grid">
        {holes.map((hasMole, index) => (
          <div
            key={index}
            className={`hole ${hasMole ? "mole" : ""}`}
            onClick={() => handleClick(index)}
          ></div>
        ))}
      </div>
     ) : (
        <div className="game-over">
          <h2>Game Over!</h2>
          {/* <button className="primary-outlined-btn" onClick={resetGame}>Restart</button> */}
        </div>
      )}
    </div>
  );
};

export default WhackAMole;
