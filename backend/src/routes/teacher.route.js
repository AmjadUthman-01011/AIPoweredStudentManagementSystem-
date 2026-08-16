const express = require("express");

const teacherController = require("../controllers/teacher.controller");
const authorizeTeacherOwner = require("../middlewares/teacher.middleware");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Admin → create teacher
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    teacherController.createTeacher
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    teacherController.updateTeacher
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    teacherController.deleteTeacher
);

// Teacher → own profile
router.get(
    "/myprofile",
    authenticate,
    authorize("TEACHER"),
    teacherController.getMyProfile
);

router.get(
    "/search",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    teacherController.searchTeachers
);

router.patch(
    "/:id/courses",
    authenticate,
    authorize("ADMIN"),
    teacherController.assignTeacherToCourse
);

// Teacher → own courses
router.get(
    "/myprofile/courses",
    authenticate,
    authorize("TEACHER"),
    teacherController.getMyCourses
);


// Admin + Teacher → specific teacher's courses
router.get(
    "/:id/courses",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    authorizeTeacherOwner,
    teacherController.getTeacherCourses
);

router.get(
    "/:id/students",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    authorizeTeacherOwner,
    teacherController.getTeacherStudents
);

// Admin + Teacher → specific teacher
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    teacherController.getTeacher
);



module.exports = router;