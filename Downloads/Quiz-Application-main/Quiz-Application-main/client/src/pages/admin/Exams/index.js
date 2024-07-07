import React, { useEffect, useState } from "react";
import { message, Table } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../../components/firebase";
import PageTitle from "../../../components/PageTitle";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const dispatch = useDispatch();

  const getExamsData = async () => {
    try {
      dispatch(ShowLoading());
      const querySnapshot = await getDocs(collection(db, "Quizzes"));
      const examsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(examsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error("Error fetching exams: " + error.message);
    }
  };

  const getSubjectsData = async () => {
    try {
      dispatch(ShowLoading());
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const subjectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(subjectsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error("Error fetching subjects: " + error.message);
    }
  };

  const deleteExam = async (examId) => {
    try {
      dispatch(ShowLoading());
      await deleteDoc(doc(db, "Quizzes", examId));
      message.success("Exam deleted successfully.");
      getExamsData();
    } catch (error) {
      dispatch(HideLoading());
      message.error("Error deleting exam: " + error.message);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((subject) => subject.id === subjectId);
    return subject ? subject.name : "Unknown";
  };

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "name",
    },
    {
      title: "Duration",
      dataIndex: "duration",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      render: (text, record) => getSubjectName(record.subject),
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
    },
    {
      title: "Passing Marks",
      dataIndex: "passingMarks",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          <i
            className="ri-pencil-line"
            onClick={() => navigate(`/admin/exams/edit/${record.id}`)}
          ></i>
          <i
            className="ri-delete-bin-line"
            onClick={() => deleteExam(record.id)}
          ></i>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getExamsData();
    getSubjectsData();
  }, []);

  return (
    <div>
      <div style={{ display: "grid" }}>
        <PageTitle title="Manage Quizzes" />
        <button
          style={{ placeSelf: "end", marginRight: "2vw" }}
          className="primary-outlined-btn flex items-center"
          onClick={() => navigate("/admin/exams/add")}
        >
          <i className="ri-add-line"></i>
          Add Exam
        </button>
      </div>
      <div style={{ margin: "0vh 2vw" }}>
        <div className="divider"></div>
        <Table columns={columns} dataSource={exams} pagination={{ pageSize: 7 }} rowKey="id" />
      </div>
    </div>
  );
}

export default Exams;
