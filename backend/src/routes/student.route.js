const express = require("express");

const studentController = require("../controllers/student.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Student → own profile
router.get(
    "/myprofile",
    authenticate,
    authorize("STUDENT"),
    studentController.getMyProfile
);

// Admin + Teacher → all students
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudents
);

// Admin + Teacher → specific student
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    studentController.getStudent
);

module.exports = router;