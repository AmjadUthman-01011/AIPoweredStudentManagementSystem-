const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");

const route = express.Router();

route.post("/register", authController.register);
route.post("/login", authController.login);
//route.get("/me", authenticate, authController.me);

module.exports = route;