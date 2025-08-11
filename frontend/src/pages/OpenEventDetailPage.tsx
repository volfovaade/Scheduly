import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useLocation } from "react-router-dom";
import OpenEventDetailPage from "../components/OpenEventDetailPage";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<{ 
        title: string; 
        description: string; 
        code: string;
        mode: "Open" | "Fixed";
        timeRangeFrom: Date | null;
        timeRangeTo: Date | null;
    } | null>(null);
    
    const [preferenceSummary, setPreferenceSummary] = useState([]);
    const [submittedUsers, setSubmittedUsers] = useState([]);

    const location = useLocation();
    const showPreferenceFormInitially = new URLSearchParams(location.search).get("showPreferenceForm") === "true";
    const [showPreferences, setShowPreferences] = useState(showPreferenceFormInitially);

    const [radius, setRadius] = useState(2);  // in km (change to meters in backend)
    const [duration, setDuration] = useState(2);

    useEffect(() => {
        const loadEvent = async () => {
            const res = await axios.get(`/events/${eventId}`);
            setEvent(res.data);
        };
        loadEvent();
        loadPreferencesSummary();
    }, [eventId]);

    const loadPreferencesSummary = async () => {
        const [summaryRes, usersRes ] = await Promise.all([
            axios.get(`/events/${eventId}/preferences/summary`),
            axios.get(`/events/${eventId}/participants`)
        ]);
        setPreferenceSummary(summaryRes.data);  // [{ Day, Hour, Count }]
        setSubmittedUsers(usersRes.data);
    };

    const handleFinalize = async () => {
        const confirm = window.confirm("Are you sure you want to finalize proposals and start final voting?");
        if (!confirm) return;

        try {
            await axios.post(`/events/${eventId}/finalize`, null, {
                params: { radius, duration }
            });
            window.location.reload();  // to do: navigate to new form
        } catch (err) {
            console.error(err);
            alert("Failed to finalize proposals.");
        }
    };

    const handleCloseEvent = async () => {
        if (!window.confirm("Are you sure you want to close the event?")) return;

        try {
            await axios.post(`/events/${eventId}/close`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to close event.");
        }
    }

    return event ? (
        <OpenEventDetailPage 
            event={event}
            showPreferences={showPreferences}
            setShowPreferences={setShowPreferences}
            loadPreferencesSummary={loadPreferencesSummary}
            preferenceSummary={preferenceSummary}
            submittedUsers={submittedUsers}
            handleFinalize={handleFinalize}
            radius={radius}
            setRadius={setRadius}
            duration={duration}
            setDuration={setDuration}
            handleCloseEvent={handleCloseEvent}
        />
    ) : (
    <div className="p-6 text-gray-500">Loading event...</div>
    );
}