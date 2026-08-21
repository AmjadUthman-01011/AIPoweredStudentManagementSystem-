const prisma = require("../config/prisma");
const studentService = require("../services/student.service");

const createGrade = async (data) => {

    const {
        studentId,
        courseId,
        score,
        grade,
        semester
    } = data;

    // Check student
    const student = await studentService.getStudentById(
        Number(studentId)
    );

    if (!student) {
        throw new Error("Student not found");
    }

    // Check course
    const course = await prisma.course.findUnique({
        where: {
            id: Number(courseId)
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Check if student is enrolled in course
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: Number(studentId),
                courseId: Number(courseId)
            }
        }
    });

    if (!enrollment) {
        throw new Error(
            "Student is not enrolled in this course"
        );
    }

    // Check score
    if (score < 0 || score > 100) {
        throw new Error(
            "Score must be between 0 and 100"
        );
    }

    // Check duplicate grade
    const existingGrade = await prisma.grade.findUnique({
        where: {
            studentId_courseId_semester: {
                studentId: Number(studentId),
                courseId: Number(courseId),
                semester
            }
        }
    });

    if (existingGrade) {
        throw new Error(
            "Grade already exists for this student, course and semester"
        );
    }

    // Create grade
    const newGrade = await prisma.grade.create({
        data: {
            studentId: Number(studentId),
            courseId: Number(courseId),
            score: Number(score),
            grade: grade || null,
            semester
        },
        include: {
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },
            course: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            }
        }
    });

    return newGrade;
};

const updateGrade = async (id, data) => {

    const gradeId = Number(id);

    if (!Number.isInteger(gradeId)) {
        throw new Error("Invalid grade ID");
    }

    // Find existing grade
    const existingGrade = await prisma.grade.findUnique({
        where: {
            id: gradeId
        }
    });

    if (!existingGrade) {
        throw new Error("Grade not found");
    }

    // Validate score if provided
    if (data.score !== undefined) {

        const score = Number(data.score);

        if (Number.isNaN(score) || score < 0 || score > 100) {
            throw new Error(
                "Score must be between 0 and 100"
            );
        }
    }

    // Update grade
    const updatedGrade = await prisma.grade.update({
        where: {
            id: gradeId
        },

        data: {
            ...(data.score !== undefined && {
                score: Number(data.score)
            }),

            ...(data.grade !== undefined && {
                grade: data.grade
            }),

            ...(data.semester !== undefined && {
                semester: data.semester
            })
        },

        include: {
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            }
        }
    });

    return updatedGrade;
};

const deleteGrade = async (id) => {

    const gradeId = Number(id);

    if (!Number.isInteger(gradeId)) {
        throw new Error("Invalid grade ID");
    }

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
        where: {
            id: gradeId
        }
    });

    if (!existingGrade) {
        throw new Error("Grade not found");
    }

    // Delete grade
    await prisma.grade.delete({
        where: {
            id: gradeId
        }
    });

    return true;
};

const getGradeById = async (id) => {

    const gradeId = Number(id);

    if (!Number.isInteger(gradeId)) {
        throw new Error("Invalid Grade ID");
    }

    return prisma.grade.findUnique({
        where: {
            id: gradeId
        },

        select: {
            id: true,
            studentId: true,
            courseId: true,
            score: true,
            grade: true,
            semester: true,
            createdAt: true,
            updatedAt: true,

            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    teacherId: true,
                    credits: true
                }
            }
        }
    });
};

const getGradesByUserId = async (userId) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            userId: id
        }
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    return prisma.grade.findMany({
        where: {
            studentId: student.id
        },

        select: {
            id: true,
            score: true,
            grade: true,
            semester: true,
            createdAt: true,
            updatedAt: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    credits: true,

                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });
};


const getMyGrades = async (userId) => {

    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            userId: id
        }
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    return prisma.grade.findMany({
        where: {
            studentId: student.id
        },

        select: {
            id: true,
            score: true,
            grade: true,
            semester: true,
            createdAt: true,
            updatedAt: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    credits: true,

                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });
};

const validateGrade = ({ score, grade, semester }) => {

    if (score === undefined || score === null) {
        throw new Error("Score is required");
    }

    const numericScore = Number(score);

    if (
        Number.isNaN(numericScore) ||
        numericScore < 0 ||
        numericScore > 100
    ) {
        throw new Error("Score must be between 0 and 100");
    }

    if (!semester || !semester.trim()) {
        throw new Error("Semester is required");
    }

    if (grade !== undefined && grade !== null) {

        const validGrades = [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D",
            "F"
        ];

        if (!validGrades.includes(grade)) {
            throw new Error("Invalid letter grade");
        }
    }

    return true;
};

const canTeacherManageGrade = async (userId, courseId) => {

    const teacher = await prisma.teacher.findUnique({
        where: {
            userId: Number(userId)
        }
    });

    if (!teacher) {
        throw new Error("Teacher profile not found");
    }

    const course = await prisma.course.findFirst({
        where: {
            id: Number(courseId),
            teacherId: teacher.id
        }
    });

    if (!course) {
        throw new Error(
            "You are not authorized to manage grades for this course"
        );
    }

    return true;
};

const getCourseAverage = async (courseId, semester) => {

    const grades = await prisma.grade.findMany({
        where: {
            courseId: Number(courseId),
            ...(semester && {
                semester
            })
        },

        select: {
            score: true
        }
    });

    if (grades.length === 0) {
        return {
            average: 0,
            count: 0
        };
    }

    const total = grades.reduce(
        (sum, grade) => sum + grade.score,
        0
    );

    const average = total / grades.length;

    return {
        average: Number(average.toFixed(2)),
        count: grades.length
    };
};

const getStudentAverage = async (studentId, semester) => {

    const grades = await prisma.grade.findMany({
        where: {
            studentId: Number(studentId),
            ...(semester && {
                semester
            })
        },

        select: {
            score: true
        }
    });

    if (grades.length === 0) {
        return {
            average: 0,
            count: 0
        };
    }

    const total = grades.reduce(
        (sum, grade) => sum + grade.score,
        0
    );

    const average = total / grades.length;

    return {
        average: Number(average.toFixed(2)),
        count: grades.length
    };
};

const getStudentGPA = async (studentId, semester) => {

    const grades = await prisma.grade.findMany({
        where: {
            studentId: Number(studentId),
            ...(semester && {
                semester
            })
        },

        select: {
            grade: true,

            course: {
                select: {
                    credits: true
                }
            }
        }
    });

    const gradePoints = {
        "A+": 4.0,
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D": 1.0,
        "F": 0.0
    };

    if (grades.length === 0) {
        return {
            gpa: 0,
            totalCredits: 0
        };
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const item of grades) {

        if (!item.grade) {
            continue;
        }

        const points = gradePoints[item.grade];

        if (points === undefined) {
            continue;
        }

        const credits = item.course.credits;

        totalPoints += points * credits;
        totalCredits += credits;
    }

    const gpa =
        totalCredits === 0
            ? 0
            : totalPoints / totalCredits;

    return {
        gpa: Number(gpa.toFixed(2)),
        totalCredits
    };
};

const getStudentGradeReport = async (studentId, semester) => {

    const student = await prisma.student.findUnique({
        where: {
            id: Number(studentId)
        },

        select: {
            id: true,
            firstName: true,
            lastName: true
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const grades = await prisma.grade.findMany({
        where: {
            studentId: Number(studentId),
            ...(semester && {
                semester
            })
        },

        select: {
            id: true,
            score: true,
            grade: true,
            semester: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    credits: true
                }
            }
        },

        orderBy: {
            course: {
                code: "asc"
            }
        }
    });

    const average =
        grades.length === 0
            ? 0
            : grades.reduce(
                (sum, item) => sum + item.score,
                0
            ) / grades.length;

    return {
        student,
        semester: semester || "All semesters",
        grades,
        summary: {
            courses: grades.length,
            average: Number(average.toFixed(2))
        }
    };
};

module.exports = {
    createGrade,
    updateGrade,
    deleteGrade,
    getGradeById,
    getGradesByUserId,
    getMyGrades,
    validateGrade,
    canTeacherManageGrade,
    getCourseAverage,
    getStudentAverage,
    getStudentGPA,
    getStudentGradeReport
};