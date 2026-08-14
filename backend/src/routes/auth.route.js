const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const route = express.Router();

// public
route.post("/register", authController.register);
route.post("/login", authController.login);
route.post("/logout", authenticate,authController.logout);

//authenticated authorized


//authenticated test
//route.get("/me", authenticate, authController.me);

// authenticated and authorized test
route.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    authController.adminTest
);

route.get(
    "/teacher-test",
    authenticate,
    authorize("TEACHER"),
    authController.teacherTest
);

route.get(
    "/student-test",
    authenticate,
    authorize("STUDENT"),
    authController.studentTest
);

module.exports = route;