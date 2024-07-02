import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../components/firebase";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instructions from "./Instructions";
import ConnectFourGame from "../../games/connect4"; // Import ConnectFourGame component

function WriteExam() {
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [result, setResult] = useState({});
  const [view, setView] = useState("instructions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  // Fetch exam data and questions based on params.id
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
  }, [params.id]);

  // Start timer when examData is initialized
  useEffect(() => {
    if (examData) {
      startTimer();
    }
  }, [examData]);

  // Function to calculate result
  const calculateResult = async () => {
    try {
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

      dispatch(ShowLoading());
      dispatch(HideLoading());
      setView("result");
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Function to start timer
  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeUp(true);
        clearInterval(intervalId);
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  // Effect to handle timer expiration
  useEffect(() => {
    if (timeUp && view === "questions") {
      calculateResult();
      clearInterval(intervalId);
    }
  }, [timeUp, view, intervalId]);

  // Function to handle submitting answers
  const submitAnswers = () => {
    clearInterval(intervalId);
    setTimeUp(true);
  };

  // Function to resume game
  const resumeGame = () => {
    setView("games");
    startTimer(); // Restart timer when returning to game view
  };

  // Conditional rendering based on examData existence
  return (
    examData && (
      <div className="mt-2" style={{ padding: "3vh" }}>
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions examData={examData} setView={setView} startTimer={startTimer} />
        )}

        {view === "games" && (
          <ConnectFourGame />
        )}

        {view === "questions" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-2xl">
                {selectedQuestionIndex + 1} : {questions[selectedQuestionIndex]?.name}
              </h1>

              <div className="timer">
                <span className="text-2xl">{secondsLeft}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {questions[selectedQuestionIndex]?.options &&
                Object.keys(questions[selectedQuestionIndex].options).map((option, index) => (
                  <div
                    className={`flex gap-2 flex-col ${
                      selectedOptions[selectedQuestionIndex] === option
                        ? "selected-option"
                        : "option"
                    }`}
                    key={index}
                    onClick={() => {
                      setSelectedOptions({
                        ...selectedOptions,
                        [selectedQuestionIndex]: option,
                      });
                    }}
                  >
                    <h1 className="text-xl">
                      {option} : {questions[selectedQuestionIndex].options[option]}
                    </h1>
                  </div>
                ))}
            </div>

            <div className="flex justify-between">
              {selectedQuestionIndex > 0 && (
                <button
                  className="primary-outlined-btn"
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex - 1)}
                >
                  Previous
                </button>
              )}

              {selectedQuestionIndex < questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex + 1)}
                >
                  Next
                </button>
              )}

              {selectedQuestionIndex === questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={submitAnswers}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Display result view */}
        {view === "result" && (
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
                  <button
                    className="primary-outlined-btn"
                    onClick={resumeGame}
                  >
                    Resume Game
                  </button>
                  <button
                    className="primary-contained-btn"
                    onClick={() => {
                      setView("review");
                    }}
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
        )}

        {/* Display review answers view */}
        {view === "review" && (
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => (
              <div className="flex flex-col gap-2" key={index}>
                <div className="flex justify-between">
                  <h1 className="text-xl">
                    {index + 1} : {question.name}
                  </h1>
                </div>

                <div className="flex flex-col gap-2">
                  {Object.keys(question.options).map((option, index) => (
                    <div
                      className={`flex gap-2 flex-col ${
                        selectedOptions[index] === option ? "selected-option" : "option"
                      }`}
                      key={index}
                    >
                      <h1 className="text-xl">
                        {option} : {question.options[option]}
                      </h1>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-2">
              <button
                className="primary-outlined-btn"
                onClick={resumeGame}
              >
                Resume Game
              </button>

              <button
                className="primary-contained-btn"
                onClick={() => {
                  navigate(`/answers/${params.id}`);
                }}
              >
                Go to Answers
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default WriteExam;
