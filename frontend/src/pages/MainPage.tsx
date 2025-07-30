import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import MainPageView from "../components/MainPageView";

export default function MainPage(){
    const [token, setToken] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(token ? true : false);
    }, []);

    const handleJoinEvent = async () => {
        try {
            await axios.post(`/api/join/${token}`, {}, {
                headers: {Authorization: "Bearer "+ localStorage.getItem("token")}
            });
            navigate(`/events/${token}`);
        } catch (err) {
            alert ("Failed to connect.");
        }
    };
    return (
        <MainPageView
            token={token}
            setToken={setToken}
            isAuthenticated={isAuthenticated}
            onJoin={handleJoinEvent}
            onLogin={() => navigate("/login")}
            onRegister={() => navigate("/register")}
            onGoToDashboard={() => navigate("/dashboard")}
        />
    );
}