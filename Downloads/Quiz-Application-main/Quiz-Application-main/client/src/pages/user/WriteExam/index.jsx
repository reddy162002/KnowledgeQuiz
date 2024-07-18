import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../../components/firebase";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instructions from "./Instructions";
import ConnectFourGame from "../../games/connect4";
import WhackAMole from "../../games/whackAMole";
import WordGridGame from "../../games/wordGuess";
import SudokuGame from "../../games/SudokuGame";
import Modal from "../../../components/Modal/modal";

function WriteExam() {
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [result, setResult] = useState({});
  const [viewSet, setViewSet] = useState("instructions");
  const [view, setView] = useState("instructions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [questionTimerId, setQuestionTimerId] = useState(null);
  const [user, setUser] = useState();
  const gameType = new URLSearchParams(location.search).get("game");
  const [waitTime, setWaitTime] = useState(5);
  const [lifeLine, setLifeLine] = useState(2);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const getExamData = async () => {
      try {
        dispatch(ShowLoading());
        const quizRef = doc(db, "Quizzes", params.id);
        const quizSnapshot = await getDoc(quizRef);

        if (quizSnapshot.exists()) {
          const quizData = quizSnapshot.data();
          setExamData(quizData);

          const questionIds = quizData.question;
          const questionPromises = questionIds.map(async (questionId) => {
            const questionRef = doc(db, "Questions", questionId);
            const questionSnapshot = await getDoc(questionRef);
            return { ...questionSnapshot.data(), id: questionSnapshot.id };
          });

          const fetchedQuestions = await Promise.all(questionPromises);
          setQuestions(fetchedQuestions);
        } else {
          message.error("Quiz not found!");
        }
        dispatch(HideLoading());
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
      }
    };

    if (params.id) {
      getExamData();
    }
  }, [params.id, dispatch]);
  const calculateResult = async (render) => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];
      let attemptedQuestions = 0;
  
      questions.forEach((question, index) => {
        if (selectedOptions[index] !== undefined) {
          attemptedQuestions++;
          if (question.correctOption.toString() === selectedOptions[index]) {
            correctAnswers.push(question);
          } else {
            wrongAnswers.push(question);
          }
        }
      });
  
      const perQueMarks = examData.totalMarks / questions.length;
      const obtainedMarks = correctAnswers.length * perQueMarks;
      const obtainedPercent = (obtainedMarks / examData.totalMarks) * 100;
  
      let verdict = "Pass";
      if (obtainedMarks < parseInt(examData.passingMarks)) {
        verdict = "Fail";
      }
  
      const tempResult = {
        correctAnswers,
        wrongAnswers,
        obtainedMarks,
        obtainedPercent,
        verdict,
        attemptedQuestions, // Added attempted questions count
      };
  
      if (user && params.id && render) {
        const correctAnswerIds = correctAnswers.map((q) => q.id);
        const wrongAnswerIds = wrongAnswers.map((q) => q.id);
  
        const reportData = {
          quiz: params.id,
          result: {
            ...tempResult,
            correctAnswers: correctAnswerIds,
            wrongAnswers: wrongAnswerIds,
            correctCount: correctAnswers.length,
            gamename: gameType,
            totalQuestions: questions.length,
          },
          user: user.uid,
          createdAt: new Date(),
        };
  
        await addDoc(collection(db, "Reports"), reportData);
        console.log("Report saved successfully");
      } else {
        console.error("No user signed in or quiz ID missing");
      }
  
      setResult(tempResult);
      setViewSet("result");
      setShowModal(true);
    } catch (error) {
      console.error("Error calculating or saving result: ", error);
      message.error("Failed to calculate or save result.");
    }
  };
  

  useEffect(() => {
    if (viewSet === "result") {
      calculateResult(true);
    }
  }, [viewSet]);

  useEffect(() => {
    if (view === "games" && viewSet !== "result" && viewSet !== "review") {
      setWaitTime(28);
      const initialDelay = setTimeout(() => {
        setShowModal(true);
        setSelectedQuestionIndex(0);
        startQuestionTimer();
        const timerId = setInterval(() => {
          setSelectedQuestionIndex((prevIndex) => {
            if (prevIndex < questions.length - 1) {
              const nextIndex = prevIndex + 1;
              setShowModal(true);
              startQuestionTimer();
              return nextIndex;
            } else {
              clearInterval(timerId);
              calculateResult(false);
              return prevIndex;
            }
          });
        }, 30000); // 30 seconds for question + 10 seconds gap

        setQuestionTimerId(timerId);
      }, 30000); // Initial delay to start the first question
      return () => {
        clearTimeout(initialDelay);
        clearInterval(questionTimerId);
      };
    }
  }, [viewSet, view, questions.length, setWaitTime]);

  const startQuestionTimer = () => {
    setSecondsLeft(30); // Set initial seconds left for each question
    const id = setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds > 0) {
          // Ensure that the countdown is accurate by using the current state
          const nextSeconds = prevSeconds - 1;
          return nextSeconds;
        } else {
          clearInterval(id);
          handleSkip(); // Automatically skip to the next question when time is up
          return 0;
        }
      });
    }, 1000); // Countdown interval is set to 1 second
  
    setIntervalId(id);
  };
  

  const handleAnswerSelection = (option) => {
    clearInterval(intervalId); // Clear current timer when an answer is selected
    setSelectedOptions({
      ...selectedOptions,
      [selectedQuestionIndex]: option,
    });
    if (selectedQuestionIndex === questions.length - 1) {
      // Last question logic, perhaps calculate result or show completion message
      calculateResult(false); // Example: Calculate results
      return;
    }
    setShowModal(false);
  setWaitTime(prevWaitTime => prevWaitTime + 1); // Resetting waitTime
    
    // Delay the next question for 5 seconds (modify the delay time as needed)
    setTimeout(() => {
      setSelectedQuestionIndex((prevIndex) => prevIndex + 1);
      startQuestionTimer(); // Start the timer for the next question
      setShowModal(true);
    }, 30000); // Changed delay from 10 seconds to 5 seconds
    clearInterval(questionTimerId);
  };
  
  const handleSkip = () => {
    clearInterval(intervalId); // Clear current timer when skipping
    setShowModal(false);
    setWaitTime(prevWaitTime => prevWaitTime + 1);
    if(lifeLine == 1){
      calculateResult(false);
      setWaitTime(0);
    }
    setLifeLine(prevLifeLine => prevLifeLine - 1);
    // Delay the next question for 5 seconds (modify the delay time as needed)
    setTimeout(() => {
      setSelectedQuestionIndex((prevIndex) => prevIndex + 1);
      startQuestionTimer(); // Start the timer for the next question
      setShowModal(true);
    }, 29000); // Changed delay from 10 seconds to 5 seconds
    clearInterval(questionTimerId);
  };

  const resetGame = () => {
    window.location.href = window.location.href; // Refresh the page to reset the exam
  };

  return (
    examData && (
      <div className="mt-2" style={{ padding: "3vh" }}>
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions examData={examData} setView={setView} gameType={gameType} />

        )}

        {view === "games" && (
          <div style={{ display: "grid" }}>
            {gameType === "sudoku" ? (
              <SudokuGame waitTime={waitTime}/>
            ) : gameType === "whackamole" ? (
              <WhackAMole waitTime={waitTime}/>
            ) : gameType === "wordguess" ? (
              <WordGridGame waitTime={waitTime}/>
            ) : gameType === "connect4" ? (
              <ConnectFourGame waitTime={waitTime}/>
            ) : (
              <p>Unknown game type</p>
            )}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          header="Question"
          size="xlarge"
        >
          {viewSet === "result" ? (
            <div className="flex items-center mt-2 justify-center result">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl">RESULT</h1>
                <div className="divider"></div>
                <div className="marks">
                <h1 className="text-md">Attempted Questions : {result.attemptedQuestions}</h1> {/* Added Attempted Questions */}
                  <h1 className="text-md">Total Marks : {examData.totalMarks}</h1>
                  <h1 className="text-md">Obtained Marks : {result.obtainedMarks}</h1>
                  <h1 className="text-md">Wrong Answers : {result.wrongAnswers.length}</h1>
                  <h1 className="text-md">Passing Marks : {examData.passingMarks}</h1>
                  <h1 className="text-md">VERDICT : {result.verdict}</h1>

                  <div className="flex gap-2 mt-2">
                    <button className="primary-outlined-btn" onClick={resetGame}>
                      Retake Exam
                    </button>
                    <button
                      className="primary-contained-btn"
                      onClick={() => setViewSet("review")}
                    >
                      Review Answers
                    </button>
                  </div>
                </div>
              </div>
              <div className="lottie-animation">
                {result.verdict === "Pass" && (
                  <lottie-player
                    src="https://assets2.lottiefiles.com/packages/lf20_ya4ycrti.json"
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                  ></lottie-player>
                )}

                {result.verdict === "Fail" && (
                  <lottie-player
                    src="https://assets4.lottiefiles.com/packages/lf20_qp1spzqv.json"
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                  ></lottie-player>
                )}
              </div>
            </div>
          ) : viewSet === "review" ? (
            <div className="flex flex-col gap-2">
              <div
                style={{
                  display: "grid",
                  gap: "2vh",
                  maxHeight: "54vh",
                  overflow: "auto",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {questions.map((question, index) => {
                  const isCorrect =
                    question.correctOption.toString() === selectedOptions[index];
                  return (
                    <div
                      className={`flex flex-col gap-1 p-2 ${
                        isCorrect ? "bg-success" : "bg-error"
                      }`}
                      key={index}
                    >
                      <h1 className="text-xl">
                        {index + 1} : {question.name}
                      </h1>
                      <h1 className="text-md">
                        Submitted Answer : {selectedOptions[index]}
                      </h1>
                      <h1 className="text-md">
                        Correct Answer : {question.correctOption}
                      </h1>
                    </div>
                  );
                })}
              </div>
              <div
                style={{ display: "flex", placeContent: "center", gap: "2vw" }}
              >
                <button className="primary-outlined-btn" onClick={resetGame}>
                  Retake Exam
                </button>
                <button
                  className="primary-contained-btn"
                  onClick={() => setShowModal(false)}
                >
                  Resume Game
                </button>
              </div>
            </div>
          ) : (
            questions[selectedQuestionIndex] && (
              <div className="flex flex-col gap-2">
                <div className="heart-container">
                LifeLines : 
              {Array.from({ length: lifeLine }, (_, index) => (
               <span key={index} className="heart-symbol">❤️</span>
              ))}
            </div>
                <h1 className="text-2xl">
                  {selectedQuestionIndex + 1} :{" "}
                  {questions[selectedQuestionIndex]?.name}
                </h1>
                <div className="divider"></div>
                <div className="flex flex-col gap-2">
                  {Object.keys(questions[selectedQuestionIndex]?.options)
                    .sort()
                    .map((option) => (
                      <div
                        key={option}
                        className={`flex gap-2 flex-col ${
                          selectedOptions[selectedQuestionIndex] === option
                            ? "selected-option"
                            : "option"
                        }`}
                        onClick={() => handleAnswerSelection(option)}
                      >
                        <h1 className="text-xl">
                          {option} : {questions[selectedQuestionIndex]?.options[option]}
                        </h1>
                      </div>
                    ))}
                </div>
                <div className="text-center text-lg mt-2">
                  Time left: {secondsLeft} seconds
                </div>
                <button className="primary-contained-btn" onClick={handleSkip}>
                  Skip
                </button>
              </div>
            )
          )}
        </Modal>
      </div>
    )
  );
}

export default WriteExam;
