import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import MainPageView from "../components/MainPageView";
import { useAuth } from "../context/AuthContext"; 

export default function MainPage(){
    const [code, setCode] = useState("");
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleJoinEvent = async () => {
        try {
            const res = await axios.post(`/join/${code}`, {});
            navigate(`/events/${res.data}`);
        } catch (err) {
            alert("Invalid or expired code");
            console.error(err);
        }
    };
    return (
        <MainPageView
            code={code}
            setCode={setCode}
            isAuthenticated={isAuthenticated}
            onJoin={handleJoinEvent}
            onLogin={() => navigate("/login")}
            onRegister={() => navigate("/register")}
            onGoToDashboard={() => navigate("/dashboard")}
        />
    );
}