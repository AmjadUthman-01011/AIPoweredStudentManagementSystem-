const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { success } = require("zod");

const register = async ({ email, password, role }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: role || "STUDENT"
        }
    });

    return {
        id: user.id,
        email: user.email,
        role: user.role
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

module.exports = {register, login};