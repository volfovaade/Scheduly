import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

export default function LoginPage(){
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleLogin = async () => {
        setLoading(true); // start loading
        setMessage("");   // clear old error
        try {
            const res = await axios.post("/auth/login", { email, password });
            await login(res.data.token, res.data.userId);
            navigate("/dashboard");
        } catch (err: any) {
            setMessage("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
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
                disabled={loading}  // disabled while loading
            />
            
            <input
                className="w-full mb-4 p-2 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                disabled={loading}
            />

            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                        ></path>
                    </svg>
                ) : (
                    "Login"
                )}
            </button>

            {message && <p className="text-red-600 mt-3">{message}</p>}
        </div>
    )
}