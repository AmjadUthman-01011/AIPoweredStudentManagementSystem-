const prisma = require("../config/prisma");

const authorizeCourseTeacher = async (req, res, next) => {
    try {

        // Admin can access any course
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

        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const teacher = await prisma.teacher.findUnique({
            where: {
                userId: req.user.userId
            },
            select: {
                id: true
            }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const course = await prisma.course.findUnique({
            where: {
                id: courseId
            },
            select: {
                id: true,
                teacherId: true
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (course.teacherId !== teacher.id) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this course"
            });
        }

        next();

    } catch (error) {
        next(error);
    }
};

const authorizeCourseAccess = async (req, res, next) => {

    try {

        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        // ADMIN
        if (req.user.role === "ADMIN") {
            return next();
        }

        // Get course
        const course = await prisma.course.findUnique({
            where: {
                id: courseId
            },
            select: {
                id: true,
                teacherId: true
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // =========================
        // TEACHER
        // =========================

        if (req.user.role === "TEACHER") {

            const teacher = await prisma.teacher.findUnique({
                where: {
                    userId: req.user.userId
                },
                select: {
                    id: true
                }
            });

            if (
                !teacher ||
                teacher.id !== course.teacherId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not assigned to this course"
                });
            }

            return next();
        }

        // =========================
        // STUDENT
        // =========================

        if (req.user.role === "STUDENT") {

            const student = await prisma.student.findUnique({
                where: {
                    userId: req.user.userId
                },
                select: {
                    id: true
                }
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found"
                });
            }

            const enrollment =
                await prisma.enrollment.findUnique({
                    where: {
                        studentId_courseId: {
                            studentId: student.id,
                            courseId
                        }
                    }
                });

            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    message: "You are not enrolled in this course"
                });
            }

            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access denied"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {authorizeCourseTeacher, authorizeCourseAccess};