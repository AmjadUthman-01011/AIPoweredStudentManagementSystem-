const express = require("express");

const healthRoutes = require("./health.route");
const authRoutes = require("./auth.route");
const studentRoutes = require("./student.route");
const userRoutes = require("./user.route");
//const databaseRoutes = require("./database.route");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/users", userRoutes);

//router.use("/database", databaseRoutes);



module.exports = router;