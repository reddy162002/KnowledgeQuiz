const { default: axiosInstance } = require(".");

// get exams based on subjects
export const getAllSubjects = async (subject) => {
    try {
      const response = await axiosInstance.get("/api/subjects/get-all-subjects");
      console.log(response);
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  };

export const getSubjectExams = async (subject) => {
    try {
      // Make the POST request with the subject in the request body if provided
      const response = await axiosInstance.post("/api/subjects/get-subject-exams", {
        subject: subject // Include the subject in the request body
      });
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  };