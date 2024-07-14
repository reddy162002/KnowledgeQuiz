import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/PageTitle";
import Card from "../../../components/Studentcard/card";
import { db } from "../../../components/firebase";
import { collection, getDocs, query, where } from 'firebase/firestore';

import connect4Image from "../../../images/connect4.jpeg";
import sudokuImage from '../../../images/sudoku.png';
import whackamoleImage from '../../../images/whackamole.png';
import wordguessImage from '../../../images/wordguess.jpeg';

function Home() {
  const navigate = useNavigate();
  const [games] = useState([
    { id: "sudoku", name: "Sudoku Game", image: sudokuImage },
    { id: "whackamole", name: "Whack-a-Mole", image: whackamoleImage },
    { id: "wordguess", name: "Word Guess", image: wordguessImage },
    { id: "connect4", name: "Connect Four", image: connect4Image }
  ]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [subjectQuiz, setSubjectQuiz] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const subjectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(subjectsData);
      setLoadingSubjects(false);
    } catch (error) {
      console.error("Error fetching subjects: ", error);
      setLoadingSubjects(false);
    }
  };

  const fetchSubjectQuizzes = async (subjectId) => {
    try {
      setLoadingQuizzes(true);
      const q = query(collection(db, 'Quizzes'), where('subject', '==', `${subjectId}`));
      const querySnapshot = await getDocs(q);
      const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizzesData);
      setLoadingQuizzes(false);
    } catch (error) {
      console.error('Error fetching quizzes: ', error);
      setLoadingQuizzes(false);
    }
  };

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    fetchSubjects();
  };

  const handleSubjectQuiz = (subjectId, name) => {
    setSubjectQuiz(true);
    const correctedName = name === 'Google Go' ? 'Python' : name;
    setSubjectName(correctedName);
    fetchSubjectQuizzes(subjectId);
  };
  

  const startQuiz = (quizId) => {
    navigate(`/user/write-exam/${quizId}?game=${selectedGame}`);
  };

  return (
    <div style={{ margin: "1vh 1vw" }}>
      <div style={{ padding: "0vh 2vh" }}>
        <PageTitle title={!selectedGame ? "Games" : !subjectQuiz ? "Subjects" : `${subjectName} Quizzes`} />
      </div>
      <div style={{ padding: "0.5vh 2vh" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1vw" }}>
          {!selectedGame ? (
            games.map((game) => (
              <Card
                key={game.id}
                height="250px"
                width="100%"
                borderStyle="normalselected"
              >
                <div style={{ display: "grid", gap: "2vh", padding: "1.5vh", textAlign: "center" }}>
                  <img src={game.image} alt={game.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  <h1 style={{ fontSize: "2.5vh" }}>{game.name}</h1>
                  <button
                    className="primary-outlined-btn"
                    onClick={() => handleGameSelect(game.id)}
                  >
                    Select Game
                  </button>
                </div>
              </Card>
            ))
          ) : !subjectQuiz ? (
            loadingSubjects ? (
              <p>Loading subjects...</p>
            ) : (
              subjects.filter(subject => subject.name !== 'Python').map((subject) => (
                <Card
                  key={subject.id}
                  height="250px"
                  width="100%"
                  borderStyle="normalselected"
                >
                  <div style={{ display: "grid", gap: "2vh", padding: "1.5vh", textAlign: "center" }}>
                  <h1 style={{ fontSize: "2.5vh" }}>{subject.name === 'Google Go' ? 'Python' : subject.name}</h1>
                    <button
                      className="primary-outlined-btn"
                      onClick={() => handleSubjectQuiz(subject.id, subject.name)}
                    >
                      View Quizzes
                    </button>
                  </div>
                </Card>
              ))
            )
          ) : (
            loadingQuizzes ? (
              <p>Loading quizzes...</p>
            ) : (
              quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  height="250px"
                  width="100%"
                  borderStyle="normalselected"
                >
                  <div style={{ display: "grid", gap: "1vh", padding: "1.5vh", textAlign: "center" }}>
                    <h1 className="text-2xl">{quiz.name}</h1>
                    <h1 className="text-md">Total Marks: {quiz.totalMarks}</h1>
                    <h1 className="text-md">Passing Marks: {quiz.passingMarks}</h1>
                    <h1 className="text-md">Duration: {quiz.duration}</h1>
                    <button
                      className="primary-outlined-btn"
                      onClick={() => startQuiz(quiz.id)}
                    >
                      Start Quiz
                    </button>
                  </div>
                </Card>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
