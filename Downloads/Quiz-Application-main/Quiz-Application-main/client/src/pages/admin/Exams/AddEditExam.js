import { Col, Form, message, Row, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { Tabs } from "antd";
import AddEditQuestion from "./AddEditQuestion";
import { db } from "../../../components/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayRemove, deleteDoc, collection, getDocs } from "firebase/firestore";

const { TabPane } = Tabs;

function AddEditExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [examData, setExamData] = useState(null);
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [questions, setQuestions] = useState([]);

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

  const fetchQuestions = async (questionIds) => {
    try {
      const questionsRef = collection(db, "Questions");
      const questionsData = await Promise.all(
        questionIds.map(async (id) => {
          const questionDoc = await getDoc(doc(questionsRef, id));
          if (questionDoc.exists()) {
            return { id: questionDoc.id, ...questionDoc.data() };
          }
          return null;
        })
      );
      setQuestions(questionsData.filter(question => question !== null));
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const examRef = id ? doc(db, "Quizzes", id) : doc(collection(db, "Quizzes"));
      const payload = {
        name: values.name,
        duration: parseInt(values.duration),
        passingMarks: parseInt(values.passingMarks),
        totalMarks: parseInt(values.totalMarks),
        subject: values.subject,
        question: values.questions || [],
      };
      let response;
      if (id) {
        await updateDoc(examRef, payload);
        response = { success: true, message: "Exam updated successfully" };
      } else {
        await setDoc(examRef, payload);
        response = { success: true, message: "Exam added successfully" };
      }
      if (response.success) {
        message.success(response.message);
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      console.error("Error adding/updating exam:", error);
      message.error(error.message);
    }
  };

  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const examRef = doc(db, "Quizzes", id);
      const examSnap = await getDoc(examRef);
      dispatch(HideLoading());
      if (examSnap.exists()) {
        const examData = examSnap.data();
        console.log(examData);
        setExamData(examData);
        if (examData.question) {
          fetchQuestions(examData.question);
        }
      } else {
        message.error("Exam not found");
      }
    } catch (error) {
      dispatch(HideLoading());
      console.error("Error fetching exam data:", error);
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (id) {
      getExamData();
    }
  }, [id]);

  const deleteQuestion = async (questionId) => {
    try {
      dispatch(ShowLoading());
      const questionRef = doc(db, "Questions", questionId);
      await deleteDoc(questionRef);
      const examRef = doc(db, "Quizzes", id);
      await updateDoc(examRef, {
        questions: arrayRemove(questionId),
      });
      dispatch(HideLoading());
      message.success("Question deleted successfully");
      getExamData();
    } catch (error) {
      dispatch(HideLoading());
      console.error("Error deleting question:", error);
      message.error(error.message);
    }
  };

  const questionsColumns = [
    {
      title: "Question",
      dataIndex: "name",
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (text, record) => {
        return Object.keys(record.options).map((key) => (
          <div key={key}>
            {key} : {record.options[key]}
          </div>
        ));
      },
    },
    {
      title: "Correct Option",
      dataIndex: "correctOption",
      render: (text, record) => {
        return ` ${record.correctOption} : ${record.options[record.correctOption]}`;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          <i
            className="ri-pencil-line"
            onClick={() => {
              setSelectedQuestion(record);
              setShowAddEditQuestionModal(true);
            }}
          ></i>
          <i
            className="ri-delete-bin-line"
            onClick={() => {
              deleteQuestion(record.id);
            }}
          ></i>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title={id ? "Edit Quiz" : "Add Quiz"} />
      <div className="divider"></div>
      <div style={{margin:"0vh 3vw"}}>
      {(examData || !id) && (
        <Form layout="vertical" onFinish={onFinish} initialValues={examData}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Exam Details" key="1">
              <Row gutter={[10, 10]}>
                <Col span={8}>
                  <Form.Item label="Exam Name" name="name" rules={[{ required: true, message: "Please enter the exam name" }]}>
                    <input type="text" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Exam Duration (in minutes)" name="duration" rules={[{ required: true, message: "Please enter the exam duration" }]}>
                    <input type="number" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Subject" name="subject" rules={[{ required: true, message: "Please select a subject" }]}>
                    <Select loading={loadingSubjects}>
                      {subjects.map((subject) => (
                        <Select.Option key={subject.id} value={subject.id}>
                          {subject.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Total Marks" name="totalMarks" rules={[{ required: true, message: "Please enter the total marks" }]}>
                    <input type="number" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Passing Marks" name="passingMarks" rules={[{ required: true, message: "Please enter the passing marks" }]}>
                    <input type="number" />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end gap-2">
                <button className="primary-outlined-btn" type="button" onClick={() => navigate("/admin/exams")}>
                  Cancel
                </button>
                <button className="primary-contained-btn" type="submit">
                  Save
                </button>
              </div>
            </TabPane>
            {id && (
              <TabPane tab="Questions" key="2">
                <div className="flex justify-end">
                  <button className="primary-outlined-btn" type="button" onClick={() => setShowAddEditQuestionModal(true)}>
                    Add Question
                  </button>
                </div>

                <Table columns={questionsColumns} dataSource={questions} rowKey="id" />
              </TabPane>
            )}
          </Tabs>
        </Form>
      )}
      </div>
      {showAddEditQuestionModal && (
        <AddEditQuestion
          setShowAddEditQuestionModal={setShowAddEditQuestionModal}
          showAddEditQuestionModal={showAddEditQuestionModal}
          examId={id}
          refreshData={getExamData}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
        />
      )}
    </div>
  );
}

export default AddEditExam;
