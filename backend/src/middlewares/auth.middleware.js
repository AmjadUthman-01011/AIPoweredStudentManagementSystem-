const jwt = require("jsonwebtoken");

const authenticate = (req, res, next)=>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                success:false,
                message:"Authentication Required"
            })
        }
        
        const parts = authHeader.split(" ");

        if(parts[0]!=="Bearer" || parts.length !== 2){
            return res.status(401).json({
                success:false,
                message:"Invalid authorization format",
            })
        }

        const token = parts[1];

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId : decode.userId,
            role : decode.role,
        }

        next();

    }catch(error){
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        next(error);
    }
}

module.exports = authenticate;