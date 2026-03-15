import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { isAxiosError } from "axios";
import { HomePage } from "./HomePage";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function MainPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const notify = useNotification();
  const auth = useAuth();

  const handleJoinEvent = async () => {
    try {
      if (!auth.isAuthenticated) {
        notify.error("Use must be logged in to join an event.");
        navigate(`/login`);
        return;
      }
      const res = await axios.post(`/join/${code}`, {});
      navigate(`/events/${res.data.id}?showPreferenceForm=true`);
    } catch (err) {
      console.error(err);
      if (isAxiosError(err)) {
        notify.error(
          err.response?.data ||
            "Failed to join event. Please check the code and try again.",
        );
      } else {
        notify.error("Invalid or expired code (nebo chyba serveru)");
      }
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
