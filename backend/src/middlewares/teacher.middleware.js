const prisma = require("../config/prisma");

const authorizeTeacherOwner = async (req, res, next) => {
    try {
        // Admin can access everything
        if (req.user.role === "ADMIN") {
            return next();
        }

        // Only teachers can continue
        if (req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const teacherId = Number(req.params.id);

        if (!Number.isInteger(teacherId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid teacher ID"
            });
        }

        const teacher = await prisma.teacher.findUnique({
            where: {
                id: teacherId
            },
            select: {
                id: true,
                userId: true
            }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        // Make sure teacher is accessing their own resource
        if (teacher.userId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only access your own resources"
            });
        }

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = authorizeTeacherOwner;