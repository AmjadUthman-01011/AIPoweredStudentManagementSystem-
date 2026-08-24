const userService = require("../services/user.service");
const validator = require("../validators/authValidator");

const getUsers = async (req, res, next) => {
    try {

        const { page, limit} = req.query;

        const result = await userService.getAllUsers({
            page,
            limit
        });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const user = await userService.getUserById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        if(error.message === "The user is not exist"){
            res.status(404).json({
            success: false,
            message:error.message
        });
        }
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const data = req.body;

        const user = await userService.createUser(data);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });

    } catch (error) {
        if (error.message === "User already exists") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const data = req.body;
        
        const user = await userService.updateUser(userId, data);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });

    } catch (error) {
        if(error.message == "User not found"){
            res.status(404).json({
            success: false,
            message: error.message,
            });
        }
        if(error.message == "Email already exists"){
            res.status(401).json({
            success: false,
            message: error.message,
            });
        }
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);

        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        await userService.deleteUser(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        if(error.message === "User not found"){
            res.status(404).json({
            success: false,
            message: error.message
        });
        }
        next(error);
    }
};

const searchUsers = async (req, res, next) => {
    try {

        const { q } = req.query;

        const users = await userService.searchUsers(q);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        next(error);
    }
};

const getUsersByRole = async (req, res, next) => {
    try {

        const { role } = req.query;

        const users = await userService.getUsersByRole(
            role.toUpperCase()
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        if (error.message === "Invalid role") {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Use TEACHER or STUDENT"
            });
        }

        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {

        const { isActive } = req.body;

        const user = await userService.updateUserStatus(
            req.params.id,
            isActive
        );

        res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user
        });

    } catch (error) {

        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (error.message === "Invalid user ID") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        next(error);
    }
};

const updatePassword = async (req, res, next) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }

        const user = await userService.updatePassword(
            req.params.id,
            currentPassword,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            user
        });

    } catch (error) {

        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (
            error.message === "Current password is incorrect"
        ) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
            "New password must be different from current password"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.message === "Invalid user ID") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {

        const { role } = req.body;

        const user = await userService.updateUserRole(
            req.params.id,
            role.toUpperCase()
        );

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user
        });

    } catch (error) {

        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message === "Invalid role" ||
            error.message === "User already has this role"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.message === "Invalid user ID") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

module.exports = {
    getUsers,
    getUser, 
    createUser,
    updateUser, 
    deleteUser,
    searchUsers,
    getUsersByRole,
    updateUserStatus,
    updatePassword,
    updateUserRole
};