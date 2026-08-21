const gradeService = require("../services/grade.service");

// ========================================
// CREATE GRADE
// ========================================

const createGrade = async (req, res, next) => {
    try {

        const grade = await gradeService.createGrade(
            req.body,
            req.user
        );

        res.status(201).json({
            success: true,
            message: "Grade created successfully",
            grade
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET GRADE BY ID
// ========================================

const getGrade = async (req, res, next) => {
    try {

        const grade = await gradeService.getGradeById(
            req.params.id
        );

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Grade not found"
            });
        }

        res.status(200).json({
            success: true,
            grade
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET MY GRADES
// ========================================

const getMyGrades = async (req, res, next) => {
    try {

        const grades = await gradeService.getMyGrades(
            req.user.userId
        );

        res.status(200).json({
            success: true,
            count: grades.length,
            grades
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET GRADES BY USER ID
// ========================================

const getGradesByUserId = async (req, res, next) => {
    try {

        const grades = await gradeService.getGradesByUserId(
            req.params.userId
        );

        res.status(200).json({
            success: true,
            count: grades.length,
            grades
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// UPDATE GRADE
// ========================================

const updateGrade = async (req, res, next) => {
    try {

        const grade = await gradeService.updateGrade(
            req.params.id,
            req.body,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Grade updated successfully",
            grade
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// DELETE GRADE
// ========================================

const deleteGrade = async (req, res, next) => {
    try {

        await gradeService.deleteGrade(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Grade deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// COURSE AVERAGE
// ========================================

const getCourseAverage = async (req, res, next) => {
    try {

        const { courseId } = req.params;
        const { semester } = req.query;

        const result = await gradeService.getCourseAverage(
            courseId,
            semester
        );

        res.status(200).json({
            success: true,
            courseId: Number(courseId),
            semester: semester || null,
            ...result
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// STUDENT AVERAGE
// ========================================

const getStudentAverage = async (req, res, next) => {
    try {

        const { studentId } = req.params;
        const { semester } = req.query;

        const result = await gradeService.getStudentAverage(
            studentId,
            semester
        );

        res.status(200).json({
            success: true,
            studentId: Number(studentId),
            semester: semester || null,
            ...result
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// STUDENT GPA
// ========================================

const getStudentGPA = async (req, res, next) => {
    try {

        const { studentId } = req.params;
        const { semester } = req.query;

        const result = await gradeService.getStudentGPA(
            studentId,
            semester
        );

        res.status(200).json({
            success: true,
            studentId: Number(studentId),
            semester: semester || null,
            ...result
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// STUDENT GRADE REPORT
// ========================================

const getStudentGradeReport = async (req, res, next) => {
    try {

        const { studentId } = req.params;
        const { semester } = req.query;

        const report = await gradeService.getStudentGradeReport(
            studentId,
            semester
        );

        res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    createGrade,
    getGrade,
    getMyGrades,
    getGradesByUserId,
    updateGrade,
    deleteGrade,
    getCourseAverage,
    getStudentAverage,
    getStudentGPA,
    getStudentGradeReport
};