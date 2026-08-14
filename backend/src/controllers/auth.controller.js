const authService = require("../services/auth.service");

const register = async (req, res, next)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"Email and Password are required"
            });
        }

        const newUserResult = await authService.register({
            email, password, role:"STUDENT"
        });

        if(!newUserResult){
            return res.status(401).json({success:false, message: newUserResult.message});
        }

         res.status(201).json({
            success: true,
            message: "Registration successful",
            ...newUserResult,
        });

    }catch(err){
        next(err);
    }
}

const login = async (req, res, next)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"Email and Password are required"
            });
        }

        const newUserResult = await authService.login({
            email, password
        });

        if(!newUserResult){
            return res.status(401).json({success:false, ...newUserResult.message});
        }

         res.status(201).json({
            success: true,
            message: "Login successful",
            ...newUserResult,
        });
        
    }catch(err){
        next(err);
    }
}

const me = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
};

module.exports = {register, login, me};