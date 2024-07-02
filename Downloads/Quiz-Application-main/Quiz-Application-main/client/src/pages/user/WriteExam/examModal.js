import React from "react";
import Modal from "antd/lib/modal/Modal"; // Assuming you're using Ant Design for modals

const ExamModal = ({ visible, onCancel, children }) => {
  return (
    <Modal
      title="Exam"
      visible={visible}
      onCancel={onCancel}
      footer={null} // Remove footer to customize buttons as needed
    >
      {children}
    </Modal>
  );
};

export default ExamModal;
