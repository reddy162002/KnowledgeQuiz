import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { message, Table } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../components/firebase";
import moment from "moment";

function AdminReports() {
  const [reportsData, setReportsData] = useState([]);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    examName: "",
    userName: "",
  });

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => <>{record.exam.name}</>,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      render: (text, record) => <>{record.user.name}</>,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => (
        <>{moment(record.createdAt.toDate()).format("DD-MM-YYYY hh:mm:ss")}</>
      ),
    },
    {
      title: "Total Marks",
      dataIndex: "totalQuestions",
      render: (text, record) => <>{record.exam.totalMarks}</>,
    },
    {
      title: "Passing Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.exam.passingMarks}</>,
    },
    {
      title: "Obtained Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.result.obtainedMarks}</>,
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => <>{record.result.verdict}</>,
    },
  ];

  const getData = async (tempFilters) => {
    try {
      dispatch(ShowLoading());
      let reportsQuery = collection(db, "Reports");

      if (tempFilters.examName) {
        const quizzesSnapshot = await getDocs(
          query(collection(db, "Quizzes"), where("name", "==", tempFilters.examName))
        );
        const quizIds = quizzesSnapshot.docs.map((doc) => doc.id);
        reportsQuery = query(reportsQuery, where("quiz", "in", quizIds));
      }

      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = await Promise.all(
        reportsSnapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          const userDoc = await getDoc(doc(db, "Users", reportData.user));
          const quizDoc = await getDoc(doc(db, "Quizzes", reportData.quiz));
          return {
            ...reportData,
            user: userDoc.data(),
            exam: quizDoc.data(),
            id: reportDoc.id,
          };
        })
      );

      setReportsData(reportsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData(filters);
  }, []);

  return (
    <div>
      <PageTitle title="Reports" />
      <div style={{ padding: "0vh 2vw" }}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Exam"
            value={filters.examName}
            onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
          />
          <input
            type="text"
            placeholder="User"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
          />
          <button
            className="primary-outlined-btn"
            onClick={() => {
              setFilters({
                examName: "",
                userName: "",
              });
              getData({
                examName: "",
                userName: "",
              });
            }}
          >
            Clear
          </button>
          <button className="primary-contained-btn" onClick={() => getData(filters)}>
            Search
          </button>
        </div>
        <Table columns={columns} dataSource={reportsData} pagination={{ pageSize: 7 }} className="mt-2" />
      </div>
    </div>
  );
}

export default AdminReports;
