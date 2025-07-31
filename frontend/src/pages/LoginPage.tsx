import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const res = await axios.post("/auth/login", { email, password });
            sessionStorage.setItem("token", res.data.token);
            sessionStorage.setItem("userId", res.data.userId);
            navigate("/dashboard");
        } catch (err: any) {
            setMessage("Login failed.");
        }
    };
    return (
        <div>
            <h2>Login</h2>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"/>
            <button onClick={handleLogin}>Login</button>
            <p>{message}</p>
        </div>
    )
}