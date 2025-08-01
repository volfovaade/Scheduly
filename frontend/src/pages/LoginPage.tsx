import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleLogin = async () => {
        try {
            const res = await axios.post("/auth/login", { email, password });
            await login(res.data.token, res.data.userId);
            navigate("/dashboard");
        } catch (err: any) {
            setMessage("Login failed. Please check your credentials.");
        }
    };
    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
      
            <input
                className="w-full mb-3 p-2 border rounded"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
            />
            
            <input
                className="w-full mb-4 p-2 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
            />

            <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
            >
                Login
            </button>

            {message && <p className="text-red-600 mt-3">{message}</p>}
        </div>
    )
}