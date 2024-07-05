import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../components/firebase";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instructions from "./Instructions";
import ConnectFourGame from "../../games/connect4";
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
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [showModal, setShowModal] = useState(false);
  const [questionTimerId, setQuestionTimerId] = useState(null);

  // useEffect(() => {
  //   const getExamData = async () => {
  //     try {
  //       dispatch(ShowLoading());
  //       const quizRef = doc(db, "Quizzes", params.id);
  //       const quizSnapshot = await getDoc(quizRef);

  //       if (quizSnapshot.exists()) {
  //         const quizData = quizSnapshot.data();
  //         setExamData(quizData);

  //         const questionIds = quizData.question;
  //         const questionPromises = questionIds.map(async (questionId) => {
  //           const questionRef = doc(db, "Questions", questionId);
  //           const questionSnapshot = await getDoc(questionRef);
  //           return questionSnapshot.data();
  //         });

  //         const fetchedQuestions = await Promise.all(questionPromises);
  //         setQuestions(fetchedQuestions);
  //         setSecondsLeft(quizData.duration);
  //       } else {
  //         message.error("Quiz not found!");
  //       }
  //       dispatch(HideLoading());
  //     } catch (error) {
  //       dispatch(HideLoading());
  //       message.error(error.message);
  //     }
  //   };

  //   if (params.id) {
  //     getExamData();
  //   }
  // }, [params.id]);
  
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
            return questionSnapshot.data();
          });
  
          const fetchedQuestions = await Promise.all(questionPromises);
          setQuestions(fetchedQuestions);
          setSecondsLeft(quizData.duration);
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

  const calculateResult = () => {
    let correctAnswers = [];
    let wrongAnswers = [];

    questions.forEach((question, index) => {
      if (question.correctOption.toString() === selectedOptions[index]) {
        correctAnswers.push(question);
      } else {
        wrongAnswers.push(question);
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
    };

    setResult(tempResult);
    setViewSet("result");
    setShowModal(true);
  };

  useEffect(() => {
    if (timeUp) {
      calculateResult();
      clearInterval(intervalId);
    }
  }, [timeUp, intervalId]);
  useEffect(() => {
    if (viewSet === "result") {
      calculateResult();
    }
  }, [viewSet]);

  useEffect(() => {
    if (view === "games" && viewSet !== "result" && viewSet !== "review") {
      // Initial delay before showing the first question
      const initialDelay = setTimeout(() => {
        setShowModal(true);
        setSelectedQuestionIndex(0);
        console.log("Initial question:", questions[0]);

        const timerId = setInterval(() => {
          setSelectedQuestionIndex((prevIndex) => {
            if (prevIndex < questions.length - 1) {
              const nextIndex = prevIndex + 1;
              console.log("Next question:", questions[nextIndex]);
              setShowModal(true);
              return nextIndex;
            } else {
              clearInterval(timerId);
              calculateResult();
              console.log("Final question:", questions[prevIndex]);
              return prevIndex;
            }
          });
        }, 5000);

        setQuestionTimerId(timerId);
      }, 5000); // Delay before the first question

      return () => {
        clearTimeout(initialDelay);
        clearInterval(questionTimerId);
      };
    }
  }, [viewSet, view, questions.length]);

  const handleAnswerSelection = (option) => {
    setSelectedOptions({
      ...selectedOptions,
      [selectedQuestionIndex]: option,
    });
    setShowModal(false);
  };
  const resetGame = () => {
    window.location.href = window.location.href;
  };

  return (
    examData && (
      <div className="mt-2" style={{ padding: "3vh" }}>
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions examData={examData} setView={setView} />
        )}

        {view === "games" && <div style={{display:"grid"}}><ConnectFourGame />
      <button className="primary-outlined-btn" style={{placeSelf:"center"}} onClick={resetGame}>Reset</button>
        </div>}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} header="Question" size="xlarge">
          {viewSet === "result" ? (
            <div className="flex items-center mt-2 justify-center result">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl">RESULT</h1>
                <div className="divider"></div>
                <div className="marks">
                  <h1 className="text-md">Total Marks : {examData.totalMarks}</h1>
                  <h1 className="text-md">Obtained Marks : {result.obtainedMarks}</h1>
                  <h1 className="text-md">Wrong Answers : {result.wrongAnswers.length}</h1>
                  <h1 className="text-md">Passing Marks : {examData.passingMarks}</h1>
                  <h1 className="text-md">VERDICT : {result.verdict}</h1>

                  <div className="flex gap-2 mt-2">
                    <button className="primary-outlined-btn" onClick={() => setShowModal(false)}>
                      Resume Game
                    </button>
                    <button className="primary-contained-btn" onClick={() => setViewSet("review")}>
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
              {questions.map((question, index) => {
                const isCorrect = question.correctOption.toString() === selectedOptions[index];
                return (
                  <div
                    className={`flex flex-col gap-1 p-2 ${isCorrect ? "bg-success" : "bg-error"}`}
                    key={index}
                  >
                    <h1 className="text-xl">
                      {index + 1} : {question.name}
                    </h1>
                    <h1 className="text-md">Submitted Answer : {selectedOptions[index]}</h1>
                    <h1 className="text-md">Correct Answer : {question.correctOption}</h1>
                  </div>
                );
              })}
              <button className="primary-outlined-btn" onClick={() => setShowModal(false)}>
                      Resume Game
                    </button>
            </div>
          ) : (
            questions[selectedQuestionIndex] && (
              <div className="flex flex-col gap-2">
                {console.log("Current question:", questions[selectedQuestionIndex])}
                <h1 className="text-2xl">
                  {selectedQuestionIndex + 1} : {questions[selectedQuestionIndex]?.name}
                </h1>
                <div className="divider"></div>
                <div className="flex flex-col gap-2">
                  {Object.keys(questions[selectedQuestionIndex]?.options).map((option) => (
                    <div
                      key={option}
                      className={`flex gap-2 flex-col ${
                        selectedOptions[selectedQuestionIndex] === option ? "selected-option" : "option"
                      }`}
                      onClick={() => handleAnswerSelection(option)}
                    >
                      <h1 className="text-xl">
                        {option} : {questions[selectedQuestionIndex]?.options[option]}
                      </h1>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </Modal>

        
      </div>
    )
  );
}

export default WriteExam;
