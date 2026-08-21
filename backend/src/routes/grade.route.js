const express = require("express");

const gradeController = require("../controllers/grade.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();


// =====================================================
// CREATE GRADE
// Admin + Teacher
// =====================================================

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.createGrade
);


// =====================================================
// GET MY GRADES
// Student → own grades
// =====================================================

router.get(
    "/mygrades",
    authenticate,
    authorize("STUDENT"),
    gradeController.getMyGrades
);


// =====================================================
// GET GRADE BY ID
// Admin + Teacher
// =====================================================

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.getGrade
);


// =====================================================
// GET GRADES BY USER ID
// Admin + Teacher
// =====================================================

router.get(
    "/user/:userId",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.getGradesByUserId
);


// =====================================================
// UPDATE GRADE
// Admin + Teacher
// =====================================================

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.updateGrade
);


// =====================================================
// DELETE GRADE
// Admin + Teacher
// =====================================================

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.deleteGrade
);


// =====================================================
// COURSE AVERAGE
// Admin + Teacher
// =====================================================

router.get(
    "/course/:courseId/average",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.getCourseAverage
);


// =====================================================
// STUDENT AVERAGE
// Admin + Teacher
// =====================================================

router.get(
    "/student/:studentId/average",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.getStudentAverage
);


// =====================================================
// STUDENT GPA
// Admin + Teacher + Student
// =====================================================

router.get(
    "/student/:studentId/gpa",
    authenticate,
    authorize("ADMIN", "TEACHER", "STUDENT"),
    gradeController.getStudentGPA
);


// =====================================================
// STUDENT GRADE REPORT
// Admin + Teacher
// =====================================================

router.get(
    "/student/:studentId/report",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    gradeController.getStudentGradeReport
);


module.exports = router;
