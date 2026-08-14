const express = require("express");

const healthRoutes = require("./health.route");
const authRoutes = require("./auth.route");
const studentRoutes = require("./student.route")
//const databaseRoutes = require("./database.route");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/student", studentRoutes);

//router.use("/database", databaseRoutes);

router.use("/auth", authRoutes);
module.exports = router;