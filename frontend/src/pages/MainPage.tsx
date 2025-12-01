import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { HomePage } from "../components/HomepageView";
import { useAuth } from "../context/AuthContext"; 
import { useNotification } from "../context/NotificationContext";

export default function MainPage(){
    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const notify = useNotification();

    const handleJoinEvent = async () => {
        try {
            const res = await axios.post(`/join/${code}`, {});
            navigate(`/events/${res.data.id}?showPreferenceForm=true`);
        } catch (err) {
            notify.error("Invalid or expired code");
            console.error(err);
        }
    };
    return (
        <HomePage
            code={code}
            setCode={setCode}
            onJoin={handleJoinEvent}
            onGoToDashboard={() => navigate("/dashboard")}
        />
    );
}