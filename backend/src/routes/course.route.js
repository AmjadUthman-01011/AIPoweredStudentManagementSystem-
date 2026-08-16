const express = require("express");

const courseController = require("../controllers/course.controller");
const {authorizeCourseTeacher, authorizeCourseAccess} =require("../middlewares/course.middleware");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();


// =========================
// ADMIN → CREATE COURSE
// =========================

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    courseController.createCourse
);

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER", "STUDENT"),
    courseController.getCourses
);

router.post(
    "/:id/students",
    authenticate,
    authorize("ADMIN"),
    courseController.enrollStudent
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER", "STUDENT"),
    authorizeCourseAccess,
    courseController.getCourse
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    courseController.updateCourse
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    courseController.deleteCourse
);

router.delete(
    "/:id/students/:studentId",
    authenticate,
    authorize("ADMIN"),
    courseController.removeStudent
);

router.patch(
    "/:id/teacher",
    authenticate,
    authorize("ADMIN"),
    courseController.assignTeacher
);

router.get(
    "/:id/students",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    authorizeCourseTeacher,
    courseController.getCourseStudents
);


module.exports = router;