const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const register = async (data) => {

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    let result;
    try {
        result = await prisma.$transaction(async (tx) => {

            // Create User
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role: "STUDENT"
                }
            });

            // Create Student profile
            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dob,
                    phone: data.phone,
                    address: data.address
                }
            });

            return { user, student };
        });
    } catch (err) {
        if (err.code === "P2002") {
            throw new Error("User already exists");
        }
        throw err;
    }

    return {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        student: {
            id: result.student.id,
            firstName: result.student.firstName,
            lastName: result.student.lastName,
            dateOfBirth: result.student.dateOfBirth,
            phone: result.student.phone,
            address: result.student.address
        }
    };
};

const login = async (data) => {

    // 1. Find the user
    const user = await prisma.user.findUnique({
        where: {
            email:data.email
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
        data.password,
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
module.exports = {register, login, logout};