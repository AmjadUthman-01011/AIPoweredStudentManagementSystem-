const teacherService = require("../services/teacher.service");

const courseService = require("../services/course.service");

const createCourse = async (req, res, next) => {

    try {

        const course = await courseService.createCourse(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        next(error);
    }
};

const getCourses = async (req, res, next) => {
    try {

        const {
            page,
            limit,
            search,
            teacherId,
            credits
        } = req.query;

        const result = await courseService.getAllCourses({
            page,
            limit,
            search,
            teacherId,
            credits
        });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        next(error);
    }
};
const getCourse = async (req, res, next) => {
    try {

        const course = await courseService.getCourseById(
            req.params.id
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        res.status(200).json({
            success: true,
            course
        });

    } catch (error) {
        next(error);
    }
};

const updateCourse = async (req, res, next) => {
    try {

        const course = await courseService.updateCourse(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        });

    } catch (error) {
        next(error);
    }
};

const deleteCourse = async (req, res, next) => {
    try {

        const course = await courseService.deleteCourse(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
            course
        });

    } catch (error) {
        next(error);
    }
};
const assignTeacher = async (req, res, next) => {
    try {

        const { teacherId } = req.body;

        if (!teacherId) {
            return res.status(400).json({
                success: false,
                message: "teacherId is required"
            });
        }

        const course = await courseService.assignTeacher(
            req.params.id,
            teacherId
        );

        res.status(200).json({
            success: true,
            message: "Teacher assigned to course successfully",
            course
        });

    } catch (error) {
        next(error);
    }
};

const getCourseStudents = async (req, res, next) => {
    try {

        const result = await courseService.getCourseStudents(
            req.params.id
        );

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        next(error);
    }
};

const enrollStudent = async (req, res, next) => {

    try {

        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "studentId is required"
            });
        }

        const enrollment =
            await courseService.enrollStudent(
                req.params.id,
                studentId
            );

        res.status(201).json({
            success: true,
            message: "Student enrolled successfully",
            enrollment
        });

    } catch (error) {
        next(error);
    }
};

const removeStudent = async (req, res, next) => {

    try {

        await courseService.removeStudent(
            req.params.id,
            req.params.studentId
        );

        res.status(200).json({
            success: true,
            message: "Student removed from course successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse,
    assignTeacher,
    getCourseStudents,
    enrollStudent,
    removeStudent
};