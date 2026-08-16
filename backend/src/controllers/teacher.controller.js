const teacherService = require("../services/teacher.service");

const createTeacher = async (req, res, next) => {
    try {

        const teacher = await teacherService.createTeacher(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacher
        });

    } catch (error) {
        next(error);
    }
};

const updateTeacher = async (req, res, next) => {
    try {

        const teacher = await teacherService.updateTeacher(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            teacher
        });

    } catch (error) {
        next(error);
    }
};

const deleteTeacher = async (req, res, next) => {
    try {

        await teacherService.deleteTeacher(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

const getTeacher = async (req, res, next) => {
    try {

        const teacher = await teacherService.getTeacherById(
            req.params.id
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {
        next(error);
    }
};

const getMyProfile = async (req, res, next) => {
    try {

        const teacher = await teacherService.getTeacherByUserId(
            req.user.userId
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {
        next(error);
    }
};

const searchTeachers = async (req, res, next) => {
    try {

        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const teachers = await teacherService.searchTeachers(q);

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {
        next(error);
    }
};

const assignTeacherToCourse = async (req, res, next) => {
    try {

        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "courseId is required"
            });
        }

        const course = await teacherService.assignTeacherToCourse(
            req.params.id,
            courseId
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

const getTeacherCourses = async (req, res, next) => {
    try {
        const courses = await teacherService.getTeacherCourses(
            req.params.id
        );

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        next(error);
    }
};

const getMyCourses = async (req, res, next) => {
    try {
        const courses = await teacherService.getMyCourses(
            req.user.userId
        );

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        next(error);
    }
};

const getTeacherStudents = async (req, res, next) => {
    try {

        const students = await teacherService.getTeacherStudents(
            req.params.id
        );

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacher,
    getMyProfile,
    searchTeachers,
    assignTeacherToCourse,
    getTeacherCourses,
    getMyCourses,
    getTeacherStudents
};