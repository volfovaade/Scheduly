import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage (){
    const [form, setForm] = useState({name: "", email: "", password: ""});
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
        setForm({...form, [e.target.name]: e.target.value});

    const register = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("/auth/register", form); 
            await login(res.data.token, res.data.userId); // login after registration
            navigate("/dashboard");
        } catch (err) {
            alert("Registration failed.");
        }
    };
    return (
        <form onSubmit={register} className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <label className="block mb-1">Name</label>
        <input
            name="name"
            onChange={handleChange}
            value={form.name}
            required
            className="border p-2 mb-3 w-full rounded"
        />

        <label className="block mb-1">Email</label>
        <input
            name="email"
            type="email"
            onChange={handleChange}
            value={form.email}
            required
            className="border p-2 mb-3 w-full rounded"
        />

        <label className="block mb-1">Password</label>
        <input
            name="password"
            type="password"
            onChange={handleChange}
            value={form.password}
            required
            className="border p-2 mb-4 w-full rounded"
        />

        <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
            Register
        </button>
        </form>
    );
}