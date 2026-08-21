const notificationService = require("../services/notification.service");

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async (req, res, next) => {
    try {
        const notification =
            await notificationService.createNotification(req.body);

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET NOTIFICATION BY ID
// =====================================================

const getNotificationById = async (req, res, next) => {
    try {
        const notification =
            await notificationService.getNotificationById(
                req.params.id,
                req.user.userId
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications = async (req, res, next) => {
    try {
        const {
            page,
            limit,
            isRead
        } = req.query;

        const result =
            await notificationService.getMyNotifications(
                req.user.userId,
                {
                    page,
                    limit,
                    isRead
                }
            );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET UNREAD COUNT
// =====================================================

const getUnreadCount = async (req, res, next) => {
    try {
        const count =
            await notificationService.getUnreadCount(
                req.user.userId
            );

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// MARK AS READ
// =====================================================

const markAsRead = async (req, res, next) => {
    try {
        const notification =
            await notificationService.markAsRead(
                req.params.id,
                req.user.userId
            );

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// MARK ALL AS READ
// =====================================================

const markAllAsRead = async (req, res, next) => {
    try {
        const count =
            await notificationService.markAllAsRead(
                req.user.userId
            );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updatedCount: count
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// DELETE NOTIFICATION
// =====================================================

const deleteNotification = async (req, res, next) => {
    try {
        await notificationService.deleteNotification(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// DELETE ALL MY NOTIFICATIONS
// =====================================================

const deleteAllNotifications = async (req, res, next) => {
    try {
        const count =
            await notificationService.deleteAllNotifications(
                req.user.userId
            );

        res.status(200).json({
            success: true,
            message: "All notifications deleted successfully",
            deletedCount: count
        });
    } catch (error) {
        next(error);
    }
};


// =====================================================
// CREATE BULK NOTIFICATIONS
// =====================================================

const createBulkNotifications = async (req, res, next) => {
    try {
        const count =
            await notificationService.createBulkNotifications(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Notifications created successfully",
            count
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createNotification,
    getNotificationById,
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createBulkNotifications
};