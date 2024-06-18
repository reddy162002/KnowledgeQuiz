const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const subject = require("../models/sujectModal");

console.log(subject);


router.post("/add-subject", async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).send({ message: "All fields are required", success: false });
    }

    const newSubject = new subject({ name, image });
    await newSubject.save();
    res.send({ message: "Subject added successfully", success: true, data: newSubject });
  } catch (error) {
    res.status(500).send({ message: error.message, success: false });
  }
});


// get = subjects
router.get("/get-all-subjects", authMiddleware, async (req, res) => {
    try {
      const subjects = await subject.find();
      console.log(subjects);
  
      res.send({
        message: "subjects fetched successfully",
        data: subjects,
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        data: error,
        success: false,
      });
    }
  });
// get exams based on subjects
router.post("/get-subject-exams", authMiddleware, async (req, res) => {
    try {
      // Extract the subject from the request body
      const { subject } = req.body;
      console.log(subject);
  
      // Construct the query object based on the subject
      // If subject is provided, use it to filter exams; otherwise, fetch all exams
      const query = subject ? { subject: subject } : {};
      console.log(query);
  
      // Fetch exams based on the query object
      const exams = await Exam.find(query);
      console.log(exams);
  
      // Send the response with the fetched exams
      res.send({
        message: "Exams fetched successfully",
        data: exams,
        success: true,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      res.status(500).send({
        message: error.message,
        data: error,
        success: false,
      });
    }
  });

module.exports = router;