const prisma = require("../config/prisma");

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async (data) => {

    const {
        userId,
        title,
        message
    } = data;

    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!title || !title.trim()) {
        throw new Error("Notification title is required");
    }

    if (!message || !message.trim()) {
        throw new Error("Notification message is required");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return prisma.notification.create({
        data: {
            userId: Number(userId),
            title: title.trim(),
            message: message.trim()
        }
    });
};


// =====================================================
// GET NOTIFICATION BY ID
// =====================================================

const getNotificationById = async (id, userId) => {

    const notificationId = Number(id);

    if (!Number.isInteger(notificationId)) {
        throw new Error("Invalid notification ID");
    }

    const notification =
        await prisma.notification.findUnique({
            where: {
                id: notificationId
            }
        });

    if (!notification) {
        return null;
    }

    // User can only access their own notification
    if (
        userId &&
        notification.userId !== Number(userId)
    ) {
        throw new Error(
            "You are not authorized to view this notification"
        );
    }

    return notification;
};


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications = async (
    userId,
    {
        page = 1,
        limit = 10,
        isRead
    } = {}
) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 10;
    }

    if (limit > 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    const where = {
        userId: id
    };

    // Filter unread/read
    if (isRead !== undefined) {

        if (
            isRead !== "true" &&
            isRead !== "false"
        ) {
            throw new Error(
                "isRead must be true or false"
            );
        }

        where.isRead = isRead === "true";
    }

    const [notifications, total] =
        await prisma.$transaction([

            prisma.notification.findMany({
                where,

                skip,
                take: limit,

                select: {
                    id: true,
                    title: true,
                    message: true,
                    isRead: true,
                    createdAt: true
                },

                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.notification.count({
                where
            })
        ]);

    return {
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(
            total / limit
        )
    };
};


// =====================================================
// GET UNREAD COUNT
// =====================================================

const getUnreadCount = async (userId) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const count = await prisma.notification.count({
        where: {
            userId: id,
            isRead: false
        }
    });

    return count;
};


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

const markAsRead = async (
    notificationId,
    userId
) => {

    const id = Number(notificationId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid notification ID");
    }

    const notification =
        await prisma.notification.findUnique({
            where: {
                id
            }
        });

    if (!notification) {
        throw new Error("Notification not found");
    }

    if (
        notification.userId !== Number(userId)
    ) {
        throw new Error(
            "You are not authorized to update this notification"
        );
    }

    return prisma.notification.update({
        where: {
            id
        },

        data: {
            isRead: true
        }
    });
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllAsRead = async (userId) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const result =
        await prisma.notification.updateMany({
            where: {
                userId: id,
                isRead: false
            },

            data: {
                isRead: true
            }
        });

    return result.count;
};


// =====================================================
// DELETE NOTIFICATION
// =====================================================

const deleteNotification = async (
    notificationId,
    userId
) => {

    const id = Number(notificationId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid notification ID");
    }

    const notification =
        await prisma.notification.findUnique({
            where: {
                id
            }
        });

    if (!notification) {
        throw new Error("Notification not found");
    }

    if (
        notification.userId !== Number(userId)
    ) {
        throw new Error(
            "You are not authorized to delete this notification"
        );
    }

    await prisma.notification.delete({
        where: {
            id
        }
    });

    return true;
};


// =====================================================
// DELETE ALL MY NOTIFICATIONS
// =====================================================

const deleteAllNotifications = async (userId) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const result =
        await prisma.notification.deleteMany({
            where: {
                userId: id
            }
        });

    return result.count;
};


// =====================================================
// CREATE NOTIFICATIONS FOR MULTIPLE USERS
// =====================================================

const createBulkNotifications = async ({
    userIds,
    title,
    message
}) => {

    if (
        !Array.isArray(userIds) ||
        userIds.length === 0
    ) {
        throw new Error(
            "User IDs are required"
        );
    }

    if (!title || !title.trim()) {
        throw new Error(
            "Notification title is required"
        );
    }

    if (!message || !message.trim()) {
        throw new Error(
            "Notification message is required"
        );
    }

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: userIds.map(Number)
            }
        },

        select: {
            id: true
        }
    });

    if (users.length !== userIds.length) {
        throw new Error(
            "One or more users were not found"
        );
    }

    const result =
        await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId: Number(userId),
                title: title.trim(),
                message: message.trim()
            }))
        });

    return result.count;
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