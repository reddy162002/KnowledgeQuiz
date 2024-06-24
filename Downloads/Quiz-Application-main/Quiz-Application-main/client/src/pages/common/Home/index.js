import { Col, message, Row } from "antd";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllExams } from "../../../apicalls/exams";
import { getSubjectExams, getAllSubjects } from "../../../apicalls/subjects";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Studentcard/card";

function Home() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const getExams = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      if (response.success) {
        // setExams(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  const [subjectQuiz, setSubjectQuiz] = useState(false);
  const handleSubjectQuiz = (subject) => {
    setSubjectQuiz(true);
    console.log(subject);
    getSubjectQuizzes(subject);
  }
  const getSubjects = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllSubjects();
      if (response.success) {
        setSubjects(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getSubjects();
    // getExams();
  }, []);

  const getSubjectQuizzes = async (subject) => {
    try {
      dispatch(ShowLoading());
      const response = await getSubjectExams(subject);
      if (response.success) {
        setExams(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  return (
    user && (
      <div style={{margin:"1vh 1vw"}}>
        <div style={{padding:"0vh 2vh"}}><PageTitle title={!subjectQuiz ? "Subjects" : "Quizzes"}/></div>
      <div style={{padding:"0.5vh 2vh"}}>
      {!subjectQuiz && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1vw"}}>
          {subjects.map((exam) => (
           <Card
           height="100%"
           width="100%"
           borderStyle="normalselected"
         >
          <div style={{display:"grid", gap:"2vh", padding:"1.5vh"}}>
                <h1 style={{fontSize:"2.5vh"}}>{exam?.name}</h1>
                <img style={{placeSelf:"center", height:"10vh", width:"10vw"}} src= {exam.image} />
                <button
                  className="primary-outlined-btn"
                  onClick={() => handleSubjectQuiz(exam.name)}
                >
                  View Quizzes
                </button>
          </div>
        </Card>
      ))}
      </div>
      )}
        {subjectQuiz && (
        <>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1vw"}}>
          {exams.map((exam) => (
            <Card
            height="100%"
            width="100%"
            borderStyle="normalselected"
          >
              <div style={{display:"grid", gap:"1vh", padding:"1.5vh"}}>
                <h1 className="text-2xl">{exam?.name}</h1>

                <h1 className="text-md">Subject : {exam.subject}</h1>

                <h1 className="text-md">Total Marks : {exam.totalMarks}</h1>
                <h1 className="text-md">Passing Marks : {exam.passingMarks}</h1>
                <h1 className="text-md">Duration : {exam.duration}</h1>

                <button
                  className="primary-outlined-btn"
                  onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                >
                  Start Quiz
                </button>
              </div>
           </Card>
          ))}
          </div>
        </>)}
       
        </div>

      </div>
    )
  );
}

export default Home;
