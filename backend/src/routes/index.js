const express = require("express");

const healthRoutes = require("./health.route");
const authRoutes = require("./auth.route");
const studentRoutes = require("./student.route");
const userRoutes = require("./user.route");
const teacherRoutes = require("./teacher.route");
const courseRoutes = require("./course.route");
const gradeRoutes = require("./grade.route");
const attendanceRoutes = require("./attendance.route");
const notificationRoutes = require("./notification.route");

//const databaseRoutes = require("./database.route");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/users", userRoutes);
router.use("/teachers", teacherRoutes);
router.use("/courses", courseRoutes );
router.use("/grades", gradeRoutes );
router.use("/attendance", attendanceRoutes );
router.use("/anotifications", notificationRoutes);
//router.use("/database", databaseRoutes);
module.exports = router;