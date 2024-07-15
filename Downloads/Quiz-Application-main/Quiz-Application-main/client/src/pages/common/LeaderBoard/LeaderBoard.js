import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { message, Table, Select } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../components/firebase";
import moment from "moment";

const { Option } = Select;

function LeaderBoard() {
  const [reportsData, setReportsData] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const dispatch = useDispatch();
  const [selectedQuiz, setSelectedQuiz] = useState("");

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => {
        if (selectedQuiz === "" && record.exam?.name) {
          return <>{record.exam.name}</>;
        } else {
          return null; // Render nothing if selectedQuiz is not empty and exam name is not available
        }
      },
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Rank",
      dataIndex: "ranking",
      render: (text, record, index) => <>{index + 1}</>,
      shouldDisplay: selectedQuiz !== "",
    },
    {
      title: "User",
      dataIndex: "userName",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={record.user?.photo}
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
            alt={`${record.user?.firstName} ${record.user?.lastName}`}
          />
          {record.user?.firstName} {record.user?.lastName}
        </div>
      ),
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => (
        <>{moment(record.createdAt?.toDate()).format("DD-MM-YYYY hh:mm:ss")}</>
      ),
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Total Marks",
      dataIndex: "totalQuestions",
      render: (text, record) => <>{record.exam?.totalMarks}</>,
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Passing Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.exam?.passingMarks}</>,
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Obtained Marks",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.result?.obtainedMarks}</>,
      shouldDisplay: true, // Always display this column in the columns definition
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => <>{record.result?.verdict}</>,
      shouldDisplay: true, // Always display this column in the columns definition
    },
  ];

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const reportsSnapshot = await getDocs(collection(db, "Reports"));
      const reportsData = await Promise.all(
        reportsSnapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          const userDoc = await getDoc(doc(db, "Users", reportData.user));
          const quizDoc = await getDoc(doc(db, "Quizzes", reportData.quiz));
          return {
            ...reportData,
            user: userDoc.exists() ? userDoc.data() : {},
            exam: quizDoc.exists() ? quizDoc.data() : {},
            id: reportDoc.id,
          };
        })
      );

      const highestScores = reportsData.reduce((acc, report) => {
        const key = `${report.user?.email}-${report.exam?.name}`;
        if (!acc[key] || acc[key].result?.obtainedMarks < report.result?.obtainedMarks) {
          acc[key] = report;
        }
        return acc;
      }, {});

      const filteredReportsData = Object.values(highestScores);
      filteredReportsData.sort((a, b) => b.result?.obtainedMarks - a.result?.obtainedMarks);

      setReportsData(filteredReportsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getQuizzes = async () => {
    try {
      const quizzesSnapshot = await getDocs(collection(db, "Quizzes"));
      const quizzesList = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizzes(quizzesList);
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
    getQuizzes();
  }, []);

  const handleQuizChange = async (quizId) => {
    setSelectedQuiz(quizId);
    if (quizId === "") {
      getData();
    } else {
      try {
        dispatch(ShowLoading());
        const reportsSnapshot = await getDocs(
          query(collection(db, "Reports"), where("quiz", "==", quizId))
        );
        const reportsData = await Promise.all(
          reportsSnapshot.docs.map(async (reportDoc) => {
            const reportData = reportDoc.data();
            const userDoc = await getDoc(doc(db, "Users", reportData.user));
            const quizDoc = await getDoc(doc(db, "Quizzes", reportData.quiz));
            return {
              ...reportData,
              user: userDoc.exists() ? userDoc.data() : {},
              exam: quizDoc.exists() ? quizDoc.data() : {},
              id: reportDoc.id,
            };
          })
        );

        const highestScores = reportsData.reduce((acc, report) => {
          const key = `${report.user?.email}-${report.exam?.name}`;
          if (!acc[key] || acc[key].result?.obtainedMarks < report.result?.obtainedMarks) {
            acc[key] = report;
          }
          return acc;
        }, {});

        const filteredReportsData = Object.values(highestScores);
        filteredReportsData.sort((a, b) => b.result?.obtainedMarks - a.result?.obtainedMarks);

        setReportsData(filteredReportsData);
        dispatch(HideLoading());
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
      }
    }
  };

  return (
    <div>
      <PageTitle title="Reports" />
      <div style={{ padding: "0vh 2vw" }}>
        <div className="flex gap-2 mb-4">
          <Select
            value={selectedQuiz}
            onChange={handleQuizChange}
            placeholder="Select Quiz"
            style={{ width: 200 }}
          >
            <Option value="">All Quizzes</Option>
            {quizzes.map((quiz) => (
              <Option key={quiz.id} value={quiz.id}>
                {quiz.name}
              </Option>
            ))}
          </Select>
        </div>
        <Table
          columns={columns.filter((col) => col.shouldDisplay)}
          dataSource={reportsData}
          pagination={{ pageSize: 7 }}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export default LeaderBoard;
