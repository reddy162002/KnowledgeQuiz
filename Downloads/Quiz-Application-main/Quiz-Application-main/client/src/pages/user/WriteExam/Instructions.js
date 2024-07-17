import React from "react";
import { useNavigate } from "react-router-dom";

function Instructions({ examData, setView, gameType }) {
  const navigate = useNavigate();

  const renderInstructions = () => {
    switch (gameType) {
      case "sudoku":
        return (
          <>
            <li>Solve the Sudoku puzzle in the given time.</li>
            <li>Fill all the empty cells with numbers from 1 to 9.</li>
            <li>Each row, column, and 3x3 grid must contain all digits from 1 to 9 without repetition.</li>
          </>
        );
      case "whackamole":
        return (
          <>
            <li>Click on the moles as they appear on the screen.</li>
            <li>Try to click as many moles as possible within the time limit.</li>
            <li>Each successful hit will increase your score.</li>
          </>
        );
      case "wordguess":
        return (
          <>
            <li>Guess the word based on the given hints.</li>
            <li>Fill in the blanks with the correct letters to form the word.</li>
            <li>You have a limited number of attempts to guess the correct word.</li>
          </>
        );
      case "connect4":
        return (
          <>
            <li>Take turns to drop colored discs into the grid.</li>
            <li>The first player to form a horizontal, vertical, or diagonal line of four discs wins.</li>
            <li>Prevent your opponent from forming a line of four discs.</li>
          </>
        );
      default:
        return <li>Unknown game type. Please follow the general instructions.</li>;
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <ul className="flex flex-col gap-1">
        <h1 className="text-2xl underline">Game Instructions</h1>
        {renderInstructions()}
        <h1 className="text-2xl underline">Exam Instructions</h1>
        <li>Exam must be completed in {examData.duration} Minutes.</li>
        <li>
          Exam will be submitted automatically after {examData.duration} Minutes.
        </li>
        <li>Once submitted, you cannot change your answers.</li>
        <li>Do not refresh the page.</li>
        <li>
          You can use the <span className="font-bold">"Previous"</span> and{" "}
          <span className="font-bold">"Next"</span> buttons to navigate between
          questions.
        </li>
        <li>
          Total marks of the exam is{" "}
          <span className="font-bold">{examData.totalMarks}</span>.
        </li>
        <li>
          Passing marks of the exam is{" "}
          <span className="font-bold">{examData.passingMarks}</span>.
        </li>
      </ul>

      <div className="flex gap-2">
        <button className="primary-outlined-btn" onClick={() => navigate('/')}>
          CLOSE
        </button>
        <button
          className="primary-contained-btn"
          onClick={() => {
            setView("games");
          }}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

export default Instructions;
