const express = require("express");

const healthRoutes = require("./health.route");
//const databaseRoutes = require("./database.route");

const router = express.Router();

router.use("/health", healthRoutes);
//router.use("/database", databaseRoutes);

module.exports = router;