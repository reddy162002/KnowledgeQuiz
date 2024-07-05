import { Form, message, Modal } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { db } from "../../../components/firebase";
import { doc, addDoc, updateDoc, arrayUnion, collection, getDoc } from "firebase/firestore";

function AddEditQuestion({
  showAddEditQuestionModal,
  setShowAddEditQuestionModal,
  refreshData,
  examId,
  selectedQuestion,
  setSelectedQuestion
}) {
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());

      const requiredPayload = {
        name: values.name,
        correctOption: values.correctOption,
        options: {
          A: values.A,
          B: values.B,
          C: values.C,
          D: values.D,
        },
        quiz: examId,
      };

      let response;

      if (selectedQuestion) {
        const questionRef = doc(db, "Questions", selectedQuestion.id);
        const questionDoc = await getDoc(questionRef);
        if (questionDoc.exists()) {
          await updateDoc(questionRef, requiredPayload);
          response = { success: true, message: "Question updated successfully" };
        } else {
          response = { success: false, message: "Question not found" };
        }
      } else {
        // Add new question with a generated ID
        const questionRef = await addDoc(collection(db, "Questions"), requiredPayload);
        
        // Update associated exam with new question ID
        const examRef = doc(db, "Quizzes", examId);
        await updateDoc(examRef, {
          question: arrayUnion(questionRef.id),
        });
        
        response = { success: true, message: "Question added successfully" };
      }

      if (response.success) {
        message.success(response.message);
        refreshData();
        setShowAddEditQuestionModal(false);
      } else {
        message.error(response.message);
      }

      setSelectedQuestion(null);
      dispatch(HideLoading());

    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={selectedQuestion ? "Edit Question" : "Add Question"}
      visible={showAddEditQuestionModal}
      footer={false}
      onCancel={() => {
        setShowAddEditQuestionModal(false);
        setSelectedQuestion(null);
      }}
    >
      <Form
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          name: selectedQuestion?.name,
          A: selectedQuestion?.options?.A,
          B: selectedQuestion?.options?.B,
          C: selectedQuestion?.options?.C,
          D: selectedQuestion?.options?.D,
          correctOption: selectedQuestion?.correctOption,
        }}
      >
        <Form.Item name="name" label="Question">
          <input type="text" />
        </Form.Item>
        <Form.Item name="correctOption" label="Correct Option">
          <input type="text" />
        </Form.Item>

        <div className="flex gap-3">
          <Form.Item name="A" label="Option A">
            <input type="text" />
          </Form.Item>
          <Form.Item name="B" label="Option B">
            <input type="text" />
          </Form.Item>
        </div>
        <div className="flex gap-3">
          <Form.Item name="C" label="Option C">
            <input type="text" />
          </Form.Item>
          <Form.Item name="D" label="Option D">
            <input type="text" />
          </Form.Item>
        </div>

        <div className="flex justify-end mt-2 gap-3">
          <button
            className="primary-outlined-btn"
            type="button"
            onClick={() => setShowAddEditQuestionModal(false)}
          >
            Cancel
          </button>
          <button className="primary-contained-btn">Save</button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditQuestion;
