import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage (){
    const [form, setForm] = useState({name: "", email: "", password: ""});
    const handleChange = (e: any) => setForm({...form, [e.target.name]: e.target.value});
    const navigate = useNavigate();
    const register = async (e: any) => {
        e.preventDefault();
        try {
            await axios.post("/register", form);
            navigate("/");
        } catch (err) {
            alert("Registration failed.");
        }
    };
    return (
        <form onSubmit={register}>
            <label>Name</label>
            <input name="name" onChange={handleChange} required />
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} required />
            <label>Password</label>
            <input name="password" type="password" onChange={handleChange} required />
            <button type="submit">Register</button>
        </form>
    )
}