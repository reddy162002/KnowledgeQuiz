import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../components/firebase";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instructions from "./Instructions";

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

  useEffect(() => {
    const getExamData = async () => {
    try {
    dispatch(ShowLoading());
    const quizRef = doc(db, "Quizzes", params.id);
    const quizSnapshot = await getDoc(quizRef);

    if (quizSnapshot.exists()) {
      const quizData = quizSnapshot.data();
      setExamData(quizData);
      
      // Fetch questions based on IDs from quizData
      const questionIds = quizData.question;
      console.log(questionIds);
      const questionPromises = questionIds.map(async (questionId) => {
        const questionRef = doc(db, "Questions", questionId);
        const questionSnapshot = await getDoc(questionRef);
        return questionSnapshot.data();
      });

      const fetchedQuestions = await Promise.all(questionPromises);
      setQuestions(fetchedQuestions);
      console.log(fetchedQuestions);

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
      // Assuming `addReport` function is updated to use Firebase
      // You need to implement `addReport` function using Firestore
      // Example: db.collection('Reports').add({ exam: params.id, result: tempResult, user: user._id })
      // Ensure `addReport` properly writes data to Firestore
      // const response = await addReport({
      //   exam: params.id,
      //   result: tempResult,
      //   user: user._id,
      // });
      // dispatch(HideLoading());
      // if (response.success) {
      //   setView("result");
      // } else {
      //   message.error(response.message);
      // }

      // Temporary mock response since `addReport` function is not implemented
      dispatch(HideLoading());
      setView("result");
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

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

  useEffect(() => {
    if (timeUp && view === "questions") {
      calculateResult();
      clearInterval(intervalId);
    }
  }, [timeUp, view, intervalId]);

  return (
    examData && (
      <div className="mt-2" style={{ padding: "3vh" }}>
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions examData={examData} setView={setView} startTimer={startTimer} />
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
      {questions[selectedQuestionIndex]?.options && Object.keys(questions[selectedQuestionIndex].options).map((option, index) => (
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
          onClick={() => {
            clearInterval(intervalId);
            setTimeUp(true);
          }}
        >
          Submit
        </button>
      )}
    </div>
  </div>
)}


        {view === "result" && (
          <div className="flex  items-center mt-2 justify-center result">
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
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Retake Exam
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
{view === "review" && (
  <div className="flex flex-col gap-2">
    {questions.map((question, index) => {
      const isCorrect = question.correctOption.toString() === selectedOptions[index];
      console.log(isCorrect);
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
            Submitted Answer : {selectedOptions[index]} - {question.options[selectedOptions[index]]}
          </h1>
          <h1 className="text-md">
            Correct Answer : {question.correctOption} - {question.options[question.correctOption]}
          </h1>
        </div>
      );
    })}

    <div className="flex justify-center gap-2">
      <button
        className="primary-outlined-btn"
        onClick={() => {
          navigate("/");
        }}
      >
        Close
      </button>
      <button
        className="primary-contained-btn"
        onClick={() => {
          window.location.reload();
        }}
      >
        Retake Exam
      </button>
    </div>
  </div>
)}

        {/* {view === "review" && (
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => {
              const isCorrect = question.correctOption === selectedOptions[index];
              return (
                <div
                  className={`
                    flex flex-col gap-1 p-2 ${
                      isCorrect ? "bg-success" : "bg-error"
                    }
                  `}
                  key={index}
                >
                  <h1 className="text-xl">
                    {index + 1} : {question.name}
                  </h1>
                  <h1 className="text-md">
                    Submitted Answer : {selectedOptions[index]} - {questions[selectedQuestionIndex].options[selectedOptions[index]]}
                  </h1>
                  <h1 className="text-md">
                    Correct Answer : {question.correctOption} - {questions[selectedQuestionIndex].options[question.correctOption]}
                  </h1>
                </div>
              );
            })}

            <div className="flex justify-center gap-2">
              <button
                className="primary-outlined-btn"
                onClick={() => {
                  navigate("/");
                }}
              >
                Close
              </button>
              <button
                className="primary-contained-btn"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Retake Exam
              </button>
            </div>
          </div>
        )} */}
      </div>
    )
  );
}

export default WriteExam;
