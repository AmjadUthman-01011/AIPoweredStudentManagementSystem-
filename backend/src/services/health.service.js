const getHealth = async () => {
    return {
        status: "OK",
        message: "Student Management API is running"
    };
};

module.exports = {
    getHealth
};