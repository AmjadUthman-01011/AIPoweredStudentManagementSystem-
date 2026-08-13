const healthService = require("../services/health.service");

const getHealth = async (req, res, next) => {
    try {
        const result = await healthService.getHealth();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHealth
};