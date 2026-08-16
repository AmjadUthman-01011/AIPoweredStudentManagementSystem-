const express = require("express");

const studentController = require("../controllers/student.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();


// ========================================
// STUDENT → OWN PROFILE
// ========================================

router.get(
    "/myprofile",
    authenticate,
    authorize("STUDENT"),
    studentController.getMyProfile
);

router.get(
    "/myprofile/courses",
    authenticate,
    authorize("STUDENT"),
    studentController.getMyCourses
);


// ========================================
// ADMIN + TEACHER → ALL STUDENTS
// ========================================

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudents
);


// ========================================
// ADMIN + TEACHER → SEARCH STUDENTS
// ========================================

router.get(
    "/search",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.searchStudents
);

router.get(
    "/:id/courses",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudentCourses
);

router.get(
    "/:id/grades",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudentGrades
);

router.get(
    "/:id/attendance",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudentAttendance
);

router.get(
    "/:id/assignments",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudentAssignments
);


// ========================================
// ADMIN + TEACHER → SPECIFIC STUDENT
// ========================================

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudent
);


// ========================================
// ADMIN + TEACHER → UPDATE STUDENT
// ========================================

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.updateStudent
);


// ========================================
// ADMIN ONLY → DELETE STUDENT
// ========================================

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    studentController.deleteStudent
);


module.exports = router;