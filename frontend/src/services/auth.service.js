import api from "../lib/api";

const login = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

const register = async (data) => {
    const response = await api.post("/auth/register", data);

    return response.data;
};

export default {
    login,
    register,
};