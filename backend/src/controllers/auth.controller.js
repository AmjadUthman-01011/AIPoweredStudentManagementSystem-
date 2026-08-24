const authService = require("../services/auth.service");
const validator = require("../validators/authValidator");

const register = async (req, res, next) => {
    try {
        const result = await validator(req.body,"Register");

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors
            });
        }

        const newUser = await authService.register(result.data);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            ...newUser,
        });

    } catch (err) {
        if (err.message === "User already exists") {
            return res.status(409).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
};

const login = async (req, res, next)=>{
    try{
        const result = await validator(req.body, "Login");

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors
            });
        }

        const newUserResult = await authService.login(result.data);

        if(!newUserResult){
            return res.status(401).json({success:false, ...newUserResult.message});
        }

         res.status(201).json({
            success: true,
            message: "Login successful",
            ...newUserResult,
        });
        
    }catch(err){
        if (err.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: err.message
            });
        }

        if (err.message === "Account is deactivated") {
            return res.status(401).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
}

const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

module.exports = {register, login, logout};