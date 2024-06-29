import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../../../components/PageTitle";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Studentcard/card";

import { auth, db } from "../../../components/firebase";
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { toast } from "react-toastify";

function Home() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [subjectQuiz, setSubjectQuiz] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        const subjectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(subjectsData);
        setLoadingSubjects(false);
      } catch (error) {
        console.error("Error fetching subjects: ", error);
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const fetchSubjectQuizzes = async (subjectId) => {
    try {
      setLoadingQuizzes(true);
      const q = query(collection(db, 'Quizzes'), where('subject', '==', `subjects/${subjectId}`));
      const querySnapshot = await getDocs(q);
      const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizzesData);
      setLoadingQuizzes(false);
      setSubjectQuiz(true);
    } catch (error) {
      console.error('Error fetching quizzes: ', error);
      setLoadingQuizzes(false);
    }
  };
    const [subjectName, setSubjectName] = useState();
    const handleSubjectQuiz = (subjectId, subjectName) => {
      setSubjectQuiz(true);
      setSubjectName(subjectName);
      fetchSubjectQuizzes(subjectId);
    }


  return (
      <div style={{margin:"1vh 1vw"}}>
        <div style={{padding:"0vh 2vh"}}><PageTitle title={!subjectQuiz ? "Subjects" : `${subjectName} Quizzes `}/></div>
      <div style={{padding:"0.5vh 2vh"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1vw"}}>

      {!subjectQuiz ? (
        <>
         {loadingSubjects ? (
              <p>Loading subjects...</p>
            ) : (
          subjects.map((exam) => (
            
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
                  onClick={() => handleSubjectQuiz(exam.id, exam.name)}
                >
                  View Quizzes
                </button>
          </div>
        </Card>

      )) 
    )}
      </>
      ) : ( 
        <>
         {loadingQuizzes ? (
              <p>Loading quizzes...</p>
            ) : (
              quizzes.map((quiz) => (
        <Card
        key={quiz.id}
        height="100%"
        width="100%"
        borderStyle="normalselected"
      >
          <div style={{display:"grid", gap:"1vh", padding:"1.5vh"}}>
            <h1 className="text-2xl">{quiz?.name}</h1>
            <h1 className="text-md">Total Marks : {quiz.totalMarks}</h1>
            <h1 className="text-md">Passing Marks : {quiz.passingMarks}</h1>
            <h1 className="text-md">Duration : {quiz.duration}</h1>

            <button
              className="primary-outlined-btn"
              onClick={() => navigate(`/user/write-exam/${quiz.id}`)}
            >
              Start Quiz
            </button>
          </div>
       </Card>
      ))
    )}
      </>
    )}
      </div>
      </div>

      </div>
    )
}

export default Home;
