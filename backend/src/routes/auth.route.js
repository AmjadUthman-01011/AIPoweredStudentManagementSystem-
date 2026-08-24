const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const route = express.Router();

// public
route.post("/register", authController.register);
route.post("/login", authController.login);
route.post("/logout", authenticate, authController.logout);

module.exports = route;