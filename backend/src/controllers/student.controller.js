const studentService = require("../services/student.service");

const getStudents = async (req, res, next) => {
    try {
        const students = await studentService.getAllStudents();

        res.status(200).json({
            success: true,
            count: students.length,
            students
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
            student
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudents,
    getStudent,
    getMyProfile
};