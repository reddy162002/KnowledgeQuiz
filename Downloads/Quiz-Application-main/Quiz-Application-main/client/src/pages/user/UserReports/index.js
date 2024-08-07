import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { message, Table, Button, Tag, Spin, Modal } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { db, auth } from "../../../components/firebase";
import { collection, getDocs, doc,getDoc, query, where } from "firebase/firestore";
import { PieChartJS } from "../../../components/ChartsJS/PieChart";
import { BarChartJS } from "../../../components/ChartsJS/BarChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function QuizStatistics({ reportsData }) {
  const [quizStats, setQuizStats] = useState([]);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const dispatch = useDispatch();

  const columns = [
    {
      title: "Concept",
      dataIndex: "concept",
    },
    {
      title: "Total Attempts",
      dataIndex: "attempts",
    },
    {
      title: "Average Score",
      dataIndex: "avgScore",
      render: (text) => `${text}%`, // Display average score with percentage sign
    },
    {
      title: "Performance",
      dataIndex: "performance",
      render: (text) => {
        if (text === "Weak") {
          return <Tag color="red">Weak</Tag>;
        } else if (text === "Strong") {
          return <Tag color="green">Strong</Tag>;
        } else {
          return <Tag>{text}</Tag>;
        }
      },
    },
  ];

  const calculateQuizStatistics = (reports) => {
    const conceptStats = {};

    for (const report of reports) {
      const examName = report.exam?.name; // Check if exam exists before accessing name
      if (!examName) continue; // Skip if exam name is undefined

      if (!conceptStats[examName]) {
        conceptStats[examName] = {
          attempts: 0,
          totalScore: 0,
          totalMarks: 0,
        };
      }

      // Ensure report.result and report.exam are defined
      const obtainedMarks = report.result?.obtainedMarks || 0;
      const totalMarks = report.exam?.totalMarks || 0;

      conceptStats[examName].attempts += 1;
      conceptStats[examName].totalScore += obtainedMarks;
      conceptStats[examName].totalMarks += totalMarks;
    }

    const stats = Object.keys(conceptStats).map((concept) => {
      const attempts = conceptStats[concept].attempts;
      const totalMarks = conceptStats[concept].totalMarks;
      const totalScore = conceptStats[concept].totalScore;

      const avgScore = totalMarks
        ? ((totalScore / totalMarks) * 100).toFixed(2)
        : 0;

      const performance = totalMarks
        ? (avgScore >= 70 ? "Strong" : "Weak")
        : "N/A";

      return {
        concept,
        attempts,
        avgScore,
        performance,
      };
    });

    setQuizStats(stats);
    calculatePassedFailed(stats);
  };

  const calculatePassedFailed = (stats) => {
    let passed = 0;
    let failed = 0;

    stats.forEach((stat) => {
      if (stat.performance === "Strong") {
        passed++;
      } else if (stat.performance === "Weak") {
        failed++;
      }
    });

    setPassedCount(passed);
    setFailedCount(failed);
  };

  useEffect(() => {
    if (reportsData) {
      calculateQuizStatistics(reportsData);
    }
  }, [reportsData]);

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Tag color="green">Passed: {passedCount}</Tag>
        <Tag color="red">Failed: {failedCount}</Tag>
      </div>
      <Table columns={columns} dataSource={quizStats} pagination={{ pageSize: 5 }} />
    </>
  );
}

function UserReports() {
  const [reportsData, setReportsData] = useState([]);
  const [user, setUser] = useState(null);
  const [showQuizStats, setShowQuizStats] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const dispatch = useDispatch();

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => <>{record.exam.name}</>,
    },
    {
      title: "Game Name",
      dataIndex: "gameName",
      render: (text, record) => <>{record.result.gamename}</>, // Assuming 'gamename' is where game name is stored
    },
    {
      title: "Total Questions",
      dataIndex: "totalQuestions",
      render: (text, record) => <>{record.result.totalQuestions}</>, // Assuming 'totalQuestions' is where total questions count is stored
    },
    {
      title: "Answered Quesions",
      dataIndex: "correctAnswers",
      render: (text, record) => <>{record.result.correctCount}</>,
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
      render: (text, record) => <>{record.exam.totalMarks}</>,
    },
    {
      title: "Passing Marks",
      dataIndex: "passingMarks",
      render: (text, record) => <>{record.exam.passingMarks}</>,
    },
    {
      title: "Obtained Marks",
      dataIndex: "obtainedMarks",
      render: (text, record) => <>{record.result.obtainedMarks% 1 !== 0 ? record.result.obtainedMarks.toFixed(2) : record.result.obtainedMarks}</>,
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => {
        const verdict = record.result.verdict.toLowerCase();
        if (verdict === "pass" || verdict === "passed") {
          return <Tag color="green">Passed</Tag>;
        } else if (verdict === "fail" || verdict === "failed") {
          return <Tag color="red">Failed</Tag>;
        }
        return <Tag>{record.result.verdict}</Tag>;
      },
    },
  ];

  const getData = async (userId) => {
    try {
      setLoading(true); // Show loading indicator
      dispatch(ShowLoading());
      const reportsQuery = query(collection(db, "Reports"), where("user", "==", userId));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = await Promise.all(
        reportsSnapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          const examDoc = await getDoc(doc(db, "Quizzes", reportData.quiz));
          reportData.exam = examDoc.data();
          return {
            ...reportData,
            key: reportDoc.id, // Assign a unique key here
          };
        })
      );
      setReportsData(reportsData);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

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

  // Function to prepare game-specific chart data
  const prepareGameChartData = () => {
    const gameChartData = {};
  
    reportsData.forEach((report) => {
      const gameName = report.result.gamename; // Assuming 'gamename' is where game name is stored
      const examName = report.exam.name;
      const verdict = report.result.verdict.toLowerCase();
  
      if (!gameChartData[gameName]) {
        gameChartData[gameName] = {
          exams: {},
        };
      }
  
      if (!gameChartData[gameName].exams[examName]) {
        gameChartData[gameName].exams[examName] = {
          Passed: 0,
          Failed: 0,
        };
      }
  
      if (verdict === "pass" || verdict === "passed") {
        gameChartData[gameName].exams[examName].Passed++;
      } else if (verdict === "fail" || verdict === "failed") {
        gameChartData[gameName].exams[examName].Failed++;
      }
    });
  
    console.log("Chart is ",gameChartData);
    return gameChartData;
  };
  
  
  
  const gameChartData = prepareGameChartData();

  
  // const renderGameCharts = () => {
  //   return Object.keys(gameChartData).map((gameName, index) => {
  //     const exams = Object.keys(gameChartData[gameName].exams);
  
  //     const datasets = exams.map((examName, idx) => {
  //       const passedColor = idx % 2 === 0 ? "#6CCA70" : "#2196F3"; // Example of alternating colors for Passed bars
  //       const failedColor = passedColor; // Failed bars have the same color as Passed bars
  //       const failedBackgroundColor = `rgba(${hexToRgb(failedColor)}, 0.7)`; // Failed bars with 0.7 opacity
  
  //       return {
  //         label: `${examName}`,
  //         data: [
  //           gameChartData[gameName].exams[examName].Passed,
  //           gameChartData[gameName].exams[examName].Failed,
  //         ],
  //         backgroundColor: [passedColor, failedBackgroundColor], // Passed and Failed bars
  //         hoverBackgroundColor: [passedColor, failedBackgroundColor], // Hover colors for Passed and Failed bars
  //         barPercentage: 0.6,
  //       };
  //     });
  
  //     return (
  //       <div key={index} style={{ marginBottom: "20px" }}>
  //         <h3>{gameName} Quiz Results</h3>
  //         <div>
  //           <BarChartJS
  //             chartData={{
  //               labels: ["Passed", "Failed"],
  //               datasets: datasets,
  //             }}
  //             title={`${gameName} Quiz Results`}
  //             min={0}
  //             max={50}
  //           />
  //         </div>
  //       </div>
  //     );
  //   });
  // };
  
  // // Function to convert hex color to RGB format
  // const hexToRgb = (hex) => {
  //   const bigint = parseInt(hex.substring(1), 16);
  //   const r = (bigint >> 16) & 255;
  //   const g = (bigint >> 8) & 255;
  //   const b = bigint & 255;
  //   return `${r}, ${g}, ${b}`;
  // };
  
  const renderGameCharts = () => {
    const passedColors = ["#6CCA70", "#2196F3", "#FFC107", "#9C27B0"];
    return Object.keys(gameChartData).map((gameName, index) => {
      const exams = Object.keys(gameChartData[gameName].exams);
  
      const datasets = exams.map((examName, idx) => {
        const passedColor = passedColors[idx % passedColors.length]; // Example of alternating colors for Passed bars
        const failedColor = passedColor; // Failed bars have the same color as Passed bars with reduced opacity
        const failedBackgroundColor = `rgba(${hexToRgb(failedColor)}, 0.5)`; // Failed bars with 0.7 opacity
  
        return {
          label: `${examName}`,
          data: [
            gameChartData[gameName].exams[examName].Passed,
            gameChartData[gameName].exams[examName].Failed,
          ],
          backgroundColor: [passedColor, failedBackgroundColor], // Passed and Failed bars
          hoverBackgroundColor: [passedColor, failedBackgroundColor], // Hover colors for Passed and Failed bars
          borderColor: [passedColor, "black"], // Border colors for Passed and Failed bars
          borderWidth: 1, // Border width for Failed bars
          barPercentage: 0.4, // Adjust bar width as needed
          borderDash: [5, 5],
        };
      });
  
      return (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>{gameName} Quiz Results</h3>
          <div>
            <BarChartJS
              chartData={{
                labels: ["Passed", "Failed"],
                datasets: datasets,
              }}
              title={`${gameName} Quiz Results`}
              min={0}
              max={50}
              options={{
                indexAxis: 'y', // Ensure bars are grouped horizontally
                barGroup: { groupWidth: '75%' }, // Adjust group width as needed
                scales: {
                  x: {
                    stacked: true, // Ensure bars are stacked horizontally
                  },
                  y: {
                    stacked: true, // Ensure bars are stacked vertically
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      );
    });
  };
  
  // Function to convert hex color to RGB format
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };
  

  return (
    <div>
      <PageTitle title="Reports" />
      <div className="divider" style={{ margin: "0vh 2vw" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", margin: "0vh 2vw" }}>
        <Spin spinning={loading}> {/* Display loading spinner */}
          <Table columns={columns} dataSource={reportsData} pagination={{ pageSize: 7 }} />
        </Spin>
        <div style={{ width: "400px", height: "400px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PieChartJS chartData={chartData} title="Verdict Distribution" />
          <Button style={{marginTop: "20px"}} type="primary" onClick={() => setModalVisible(true)}>
          View Game Statistics
        </Button>
        </div>
      </div>
      <div style={{ margin: "0vh 2vw" }}>
        <Button type="primary" onClick={() => setShowQuizStats(!showQuizStats)}>
          {showQuizStats ? "Hide Quiz Statistics" : "Show Quiz Statistics"}
        </Button>
        {showQuizStats && <QuizStatistics reportsData={reportsData} />}
      </div>

       {/* Modal for displaying game-specific bar charts */}
       <Modal
        title="Game Statistics"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {renderGameCharts()}
      </Modal>

      {/* Button to open modal with game statistics */}
      <div style={{ margin: "20px 0" }}>
       
      </div>

    </div>
  );
}

function getVerdictCounts(data) {
  const counts = data.reduce(
    (acc, report) => {
      const verdict = report.result.verdict.toLowerCase(); // Convert verdict to lower case
      if (verdict === "pass" || verdict === "passed") {
        acc["Passed"] = (acc["Passed"] || 0) + 1;
      } else if (verdict === "fail" || verdict === "failed") {
        acc["Failed"] = (acc["Failed"] || 0) + 1;
      }
      return acc;
    },
    { Passed: 0, Failed: 0 }
  );
  return counts;
}

function prepareChartData(counts) {
  return {
    labels: ["Passed", "Failed"],
    datasets: [
      {
        label: "Verdicts",
        data: [counts.Passed, counts.Failed],
        backgroundColor: ["#6CCA70", "#E4797B"],
        hoverBackgroundColor: ["#66bb6a", "#e57373"],
      },
    ],
  };
}

export default UserReports;
