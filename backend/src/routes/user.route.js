const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const validate = require("../middlewares/validator.middleware");
const {
    idParamSchema,
    getUsersQuerySchema,
    searchUsersQuerySchema,
    getUsersByRoleQuerySchema,
    updateUserStatusBodySchema,
    updatePasswordBodySchema,
    updateUserRoleBodySchema,
    createUserBodySchema,
    updateUserBodySchema
} = require("../validators/user.validator");

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
    validate(getUsersQuerySchema, "query"),
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
    validate(searchUsersQuerySchema, "query"),
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
    //authorize("ADMIN"),
    validate(getUsersByRoleQuerySchema, "query"),
    userController.getUsersByRole
);

router.patch(
    "/:id/password",
    authenticate,
    authorize("ADMIN"),
    validate(idParamSchema, "params"),
    validate(updatePasswordBodySchema, "body"),
    userController.updatePassword
);

router.patch(
    "/:id/role",
    authenticate,
    authorize("ADMIN"),
    validate(idParamSchema, "params"),
    validate(updateUserRoleBodySchema, "body"),
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
    validate(idParamSchema, "params"),
    validate(updateUserStatusBodySchema, "body"),
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
    validate(idParamSchema, "params"),
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
    validate(createUserBodySchema, "body"), // still need this schema
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
    validate(idParamSchema, "params"),
    validate(updateUserBodySchema, "body"),
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
    //authorize("ADMIN"),
    validate(idParamSchema, "params"),
    userController.deleteUser
);

module.exports = router;