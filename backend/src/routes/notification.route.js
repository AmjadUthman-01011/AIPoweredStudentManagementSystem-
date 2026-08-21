const express = require("express");

const notificationController = require("../controllers/notification.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();


// ==========================================
// CREATE NOTIFICATION
// Admin + Teacher
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    notificationController.createNotification
);


// ==========================================
// CREATE BULK NOTIFICATIONS
// Admin + Teacher
// ==========================================

router.post(
    "/bulk",
    authenticate,
    authorize("ADMIN", "TEACHER"),
    notificationController.createBulkNotifications
);


// ==========================================
// GET MY NOTIFICATIONS
// All authenticated users
// ==========================================

router.get(
    "/my",
    authenticate,
    notificationController.getMyNotifications
);


// ==========================================
// GET UNREAD COUNT
// All authenticated users
// ==========================================

router.get(
    "/unread-count",
    authenticate,
    notificationController.getUnreadCount
);


// ==========================================
// MARK ALL AS READ
// All authenticated users
// ==========================================

router.patch(
    "/read-all",
    authenticate,
    notificationController.markAllAsRead
);


// ==========================================
// GET NOTIFICATION BY ID
// ==========================================

router.get(
    "/:id",
    authenticate,
    notificationController.getNotificationById
);


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

router.patch(
    "/:id/read",
    authenticate,
    notificationController.markAsRead
);


// ==========================================
// DELETE NOTIFICATION
// ==========================================

router.delete(
    "/:id",
    authenticate,
    notificationController.deleteNotification
);


// ==========================================
// DELETE ALL MY NOTIFICATIONS
// ==========================================

router.delete(
    "/",
    authenticate,
    notificationController.deleteAllNotifications
);


module.exports = router;