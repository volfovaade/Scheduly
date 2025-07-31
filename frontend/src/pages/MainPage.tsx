import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import MainPageView from "../components/MainPageView";

export default function MainPage(){
    const [code, setCode] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        setIsAuthenticated(token ? true : false);
    }, []);

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