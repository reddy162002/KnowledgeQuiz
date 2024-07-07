import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { message, Table } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { db, auth } from "../../../components/firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { PieChartJS } from "../../../components/ChartsJS/PieChart"; // Adjust the import path as necessary

function UserReports() {
  const [reportsData, setReportsData] = useState([]);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => <>{record.exam.name}</>,
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

  const getData = async (userId) => {
    try {
      dispatch(ShowLoading());
      const reportsQuery = query(collection(db, "Reports"), where("user", "==", userId));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = await Promise.all(
        reportsSnapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          const examDoc = await getDoc(doc(db, "Quizzes", reportData.quiz));
          reportData.exam = examDoc.data();
          return reportData;
        })
      );
      setReportsData(reportsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      console.log(error);
      message.error(error.message);
    }
  };

  const getVerdictCounts = (data) => {
    const counts = data.reduce(
      (acc, report) => {
        const verdict = report.result.verdict.toLowerCase(); // Convert verdict to lower case
        if (verdict === 'pass' || verdict === 'passed') {
          acc['Passed'] = (acc['Passed'] || 0) + 1;
        } else if (verdict === 'fail' || verdict === 'failed') {
          acc['Failed'] = (acc['Failed'] || 0) + 1;
        }
        return acc;
      },
      { Passed: 0, Failed: 0 }
    );
    return counts;
  };

  const prepareChartData = (counts) => ({
    labels: ["Passed", "Failed"],
    datasets: [
      {
        label: "Verdicts",
        data: [counts.Passed, counts.Failed],
        backgroundColor: ["#6CCA70", "#E4797B"],
        hoverBackgroundColor: ["#66bb6a", "#e57373"],
      },
    ],
  });

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        getData(user.uid);
      } else {
        setUser(null);
      }
    });
  }, []);

  const verdictCounts = getVerdictCounts(reportsData);
  const chartData = prepareChartData(verdictCounts);

  console.log('Verdict Counts:', verdictCounts); 
  console.log('Prepared Chart Data:', chartData); 

  return (
    <div>
      <PageTitle title="Reports" />
      <div className="divider" style={{ margin: "0vh 2vw" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", margin: "0vh 2vw" }}>
        <Table columns={columns} dataSource={reportsData} pagination={{ pageSize: 7 }}/>
        <div style={{ width: "400px", height: "400px", margin: "0 auto" }}>
          <PieChartJS chartData={chartData} title="Verdict Distribution" />
        </div>
      </div>
    </div>
  );
}

export default UserReports;
