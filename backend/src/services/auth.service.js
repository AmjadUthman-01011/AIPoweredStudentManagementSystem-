const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const register = async ({
    email,
    password,
    firstName,
    lastName, 
    dob,
    address,
    phone,
    }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {

        // Create User
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "STUDENT"
            }
        });

        // Create Student profile
        const student = await tx.student.create({
            data: {
                userId: user.id,
                studentCode: `STU-${user.id}`,
                firstName,
                lastName,
                dateOfBirth:dob,
                phone:phone,
                address: address

            }
        });

        return {
            user,
            student
        };
    });

    return {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        student: {
            id: result.student.id,
            studentCode: result.student.studentCode,
            firstName: result.student.firstName,
            lastName: result.student.lastName,
            dateOfBirth:result.dateOfBirth,
            phone:result.phone,
            address: result.address
        }
    };
};

const login = async ({ email, password }) => {

    // 1. Find the user
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    // 2. User doesn't exist
    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
        throw new Error("Account is deactivated");
    }

    // 3. Compare password with hashed password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    // 4. Password is incorrect
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    // 5. Create JWT
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    // 6. Return safe user information + token
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        },
        token
    };
};

const logout = (req, res)=>{
    return res.status(201).json({
        success:true,
        message:"Logout successful"
    })
}
module.exports = {register, login};