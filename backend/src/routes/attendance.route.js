const express = require("express");

const attendanceController = require("../controllers/attendance.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();


// =====================================================
// CREATE SINGLE ATTENDANCE
// Admin + Teacher
// =====================================================

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.createAttendance
);


// =====================================================
// CREATE BULK ATTENDANCE
// Admin + Teacher
// =====================================================

router.post(
    "/bulk",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.createBulkAttendance
);


// =====================================================
// MY ATTENDANCE
// Student → own attendance
// =====================================================

router.get(
    "/myattendance",
    authenticate,
    authorize("STUDENT"),
    attendanceController.getMyAttendance
);


// =====================================================
// SEARCH ATTENDANCE
// Admin + Teacher
// =====================================================

router.get(
    "/search",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.searchAttendance
);


// =====================================================
// ATTENDANCE PERCENTAGE FOR STUDENT + COURSE
// Admin + Teacher + Student
// =====================================================

router.get(
    "/student/:studentId/course/:courseId/percentage",
    authenticate,
    authorize("ADMIN", "TEACHER", "STUDENT"),
    attendanceController.getAttendancePercentage
);


// =====================================================
// STUDENT ATTENDANCE
// Admin + Teacher
// =====================================================

router.get(
    "/student/:studentId",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.getStudentAttendance
);


// =====================================================
// COURSE ATTENDANCE
// Admin + Teacher
// =====================================================

router.get(
    "/course/:courseId",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.getCourseAttendance
);


// =====================================================
// ALL ATTENDANCE
// Admin + Teacher
// =====================================================

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.getAttendance
);


// =====================================================
// GET ATTENDANCE BY ID
// Admin + Teacher
// =====================================================

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.getAttendanceById
);


// =====================================================
// UPDATE ATTENDANCE
// Admin + Teacher
// =====================================================

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.updateAttendance
);


// =====================================================
// DELETE ATTENDANCE
// Admin + Teacher
// =====================================================

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    attendanceController.deleteAttendance
);


module.exports = router;