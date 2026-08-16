const studentService = require("../services/student.service");

const getStudents = async (req, res, next) => {
    try {

        const {
            page,
            limit,
            firstName,
            lastName,
            studentCode,
            email,
            phone
        } = req.query;

        const result = await studentService.getAllStudents({
            page,
            limit,
            firstName,
            lastName,
            email,
            phone
        });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        next(error);
    }
};

const getStudent = async (req, res, next) => {
    try {
        const student = await studentService.getStudentById(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

const getMyProfile = async (req, res, next) => {
    try {
        const student = await studentService.getStudentByUserId(
            req.user.userId
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.status(200).json({
            success: true,
            student,
        });
    } catch (error) {
        next(error);
    }
};

const getMyCourses = async (req, res, next) => {
    try {

        const student = await studentService.getStudentByUserId(
            req.user.userId
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const courses = await studentService.getStudentCourses(
            student.id
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

const updateStudent = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        const data = req.body;
        
        const student = await studentService.updateStudent(studentId, data);

        res.status(200).json({
            success: true,
            message: "student updated successfully",
            student
        });

    } catch (error) {
        next(error);
    }
};

const deleteStudent = async (req, res, next) => {
    try {

        const studentId = Number(req.params.id);

        const student = await studentService.getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Prevent student from deleting their own account
        if (student.userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        await studentService.deleteStudent(studentId);

        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

const searchStudents = async (req, res, next) => {
    try {

        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const students = await studentService.searchStudents(q);

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        next(error);
    }
};

const getStudentCourses = async (req, res, next) => {
    try {

        const courses = await studentService.getStudentCourses(
            req.params.id
        );

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {

        if (error.message === "Student not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const getStudentGrades = async (req, res, next) => {
    try {

        const grades = await studentService.getStudentGrades(
            req.params.id
        );

        res.status(200).json({
            success: true,
            count: grades.length,
            grades
        });

    } catch (error) {

        if (error.message === "Student not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const getStudentAttendance = async (req, res, next) => {
    try {

        const attendance =
            await studentService.getStudentAttendance(
                req.params.id
            );

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        });

    } catch (error) {

        if (error.message === "Student not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const getStudentAssignments = async (req, res, next) => {
    try {

        const assignments =
            await studentService.getStudentAssignments(
                req.params.id
            );

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });

    } catch (error) {

        if (error.message === "Student not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

module.exports = {
    getStudents,
    getStudent,
    getMyProfile,
    updateStudent,
    deleteStudent,
    searchStudents,
    getStudentCourses,
    getStudentGrades,
    getStudentAttendance,
    getStudentAssignments,
    getMyCourses,
};