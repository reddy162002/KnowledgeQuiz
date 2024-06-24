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

      <Row gutter={[16, 16]}>
          {exams.map((exam) => (
            <Col span={6}>
              <div className="card-lg flex flex-col gap-1 p-2">
                <h1 className="text-2xl">{exam?.name}</h1>

                <h1 className="text-md">Category : {exam.category}</h1>

                <h1 className="text-md">Total Marks : {exam.totalMarks}</h1>
                <h1 className="text-md">Passing Marks : {exam.passingMarks}</h1>
                <h1 className="text-md">Duration : {exam.duration}</h1>

                <button
                  className="primary-outlined-btn"
                  onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                >
                  Start Exam
                </button>
              </div>
            </Col>
          ))}
        </Row>
       
        </div>

      </div>
    )
  );
}

export default Home;
