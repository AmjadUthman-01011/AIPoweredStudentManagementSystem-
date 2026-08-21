const attendanceService = require("../services/attendance.service");


// =====================================================
// CREATE ATTENDANCE
// =====================================================

const createAttendance = async (req, res, next) => {

    try {

        const attendance =
            await attendanceService.createAttendance(
                req.body,
                req.user
            );

        res.status(201).json({
            success: true,
            message: "Attendance created successfully",
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET ALL ATTENDANCE
// =====================================================

const getAttendance = async (req, res, next) => {

    try {

        const {
            page,
            limit,
            studentId,
            courseId,
            status,
            date
        } = req.query;

        const result =
            await attendanceService.getAllAttendance({
                page,
                limit,
                studentId,
                courseId,
                status,
                date
            });

        res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET ATTENDANCE BY ID
// =====================================================

const getAttendanceById = async (req, res, next) => {

    try {

        const attendance =
            await attendanceService.getAttendanceById(
                req.params.id
            );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance not found"
            });
        }

        res.status(200).json({
            success: true,
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET MY ATTENDANCE
// =====================================================

const getMyAttendance = async (req, res, next) => {

    try {

        const {
            page,
            limit,
            courseId,
            status
        } = req.query;

        const result =
            await attendanceService.getMyAttendance(
                req.user.userId,
                {
                    page,
                    limit,
                    courseId,
                    status
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
// GET STUDENT ATTENDANCE
// =====================================================

const getStudentAttendance = async (req, res, next) => {

    try {

        const {
            page,
            limit,
            courseId,
            status
        } = req.query;

        const result =
            await attendanceService.getStudentAttendance(
                req.params.studentId,
                {
                    page,
                    limit,
                    courseId,
                    status
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
// GET COURSE ATTENDANCE
// =====================================================

const getCourseAttendance = async (req, res, next) => {

    try {

        const {
            page,
            limit,
            studentId,
            status,
            date
        } = req.query;

        const result =
            await attendanceService.getCourseAttendance(
                req.params.courseId,
                {
                    page,
                    limit,
                    studentId,
                    status,
                    date
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
// UPDATE ATTENDANCE
// =====================================================

const updateAttendance = async (req, res, next) => {

    try {

        const attendance =
            await attendanceService.updateAttendance(
                req.params.id,
                req.body,
                req.user
            );

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// DELETE ATTENDANCE
// =====================================================

const deleteAttendance = async (req, res, next) => {

    try {

        await attendanceService.deleteAttendance(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// BULK ATTENDANCE
// =====================================================

const createBulkAttendance = async (req, res, next) => {

    try {

        const attendance =
            await attendanceService.createBulkAttendance(
                req.body,
                req.user
            );

        res.status(201).json({
            success: true,
            message: "Attendance records created successfully",
            count: attendance.length,
            attendance
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// ATTENDANCE PERCENTAGE
// =====================================================

const getAttendancePercentage = async (req, res, next) => {

    try {

        const {
            studentId,
            courseId
        } = req.params;

        const result =
            await attendanceService.getAttendancePercentage(
                studentId,
                courseId
            );

        res.status(200).json({
            success: true,
            studentId: Number(studentId),
            courseId: courseId
                ? Number(courseId)
                : null,
            ...result
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// SEARCH ATTENDANCE
// =====================================================

const searchAttendance = async (req, res, next) => {

    try {

        const {
            q,
            page,
            limit
        } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const result =
            await attendanceService.searchAttendance(
                q,
                {
                    page,
                    limit
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


module.exports = {
    createAttendance,
    getAttendance,
    getAttendanceById,
    getMyAttendance,
    getStudentAttendance,
    getCourseAttendance,
    updateAttendance,
    deleteAttendance,
    createBulkAttendance,
    getAttendancePercentage,
    searchAttendance
};