"use client";

import { useState } from "react";
import authService from "@/services/auth.service";

export default function Home() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            const data = await authService.login(
                email,
                password
            );

            console.log("LOGIN RESPONSE:", data);

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            setMessage("Login successful");

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">

                <h1 className="text-2xl font-bold mb-6">
                    Student Management
                </h1>

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="w-full border p-3 rounded-lg"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="w-full border p-3 rounded-lg"
                    />

                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800"
                    >
                        Login
                    </button>

                </form>

                {message && (
                    <p className="mt-4 text-center">
                        {message}
                    </p>
                )}

            </div>

        </main>
    );
}