const express = require("express");

const userController = require("../controllers/user.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// ===============================
// GET ALL USERS
// GET /api/users
// ADMIN only
// ===============================
router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    userController.getUsers
);

// ===============================
// Search for user
// GET /api/users/search?q=value
// ADMIN only
// ===============================
router.get(
    "/search",
    authenticate,
    authorize("ADMIN"),
    userController.searchUsers
);

// ===============================
// Filter users by Role
// GET /api/users/filter?role=role
// ADMIN only
// ===============================
router.get(
    "/filter",
    authenticate,
    authorize("ADMIN"),
    userController.getUsersByRole
);

router.patch(
    "/:id/password",
    authenticate,
    authorize("ADMIN"),
    userController.updatePassword
);

router.patch(
    "/:id/role",
    authenticate,
    authorize("ADMIN"),
    userController.updateUserRole
);
// ===============================
// UPDATE the activasion
// PATCH /api/users/:id/status
// ADMIN only
// ===============================
router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN"),
    userController.updateUserStatus
);

// ===============================
// GET USER BY ID
// GET /api/users/:id
// ADMIN only
// ===============================
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.getUser
);

// ===============================
// CREATE USER
// POST /api/users
// ADMIN only
// ===============================
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    userController.createUser
);

// ===============================
// UPDATE USER
// PATCH /api/users/:id
// ADMIN only
// ===============================
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.updateUser
);

// ===============================
// DELETE USER
// DELETE /api/users/:id
// ADMIN only
// ===============================
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.deleteUser
);

module.exports = router;