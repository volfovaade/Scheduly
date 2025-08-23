import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useLocation } from "react-router-dom";
import OpenEventDetailPage from "../components/OpenEventDetailPage";
import ErrorNotification from "../components/ErrorNotification";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<{ 
        title: string; 
        description: string; 
        code: string;
        mode: "Open" | "Fixed";
        timeRangeFrom: Date | null;
        timeRangeTo: Date | null;
        finalPlaceName: string;
        finalAddress: string;
        finalTimeFrom: string;
        finalTimeTo: string;
    } | null>(null);
    
    const [preferenceSummary, setPreferenceSummary] = useState([]);
    const [submittedUsers, setSubmittedUsers] = useState([]);

    const location = useLocation();
    const showPreferenceFormInitially = new URLSearchParams(location.search).get("showPreferenceForm") === "true";
    const [showPreferences, setShowPreferences] = useState(showPreferenceFormInitially);

    const [duration, setDuration] = useState(2);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{
        type: 'not-found' | 'network' | 'unauthorized' | 'unknown';
        message: string;
    } | null>(null);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`/events/${eventId}`);
                setEvent(res.data);

            } catch (err: any){
                if (err.response?.status === 404) {
                    setError({
                        type: 'not-found',
                        message: 'Event wasn\'t found. Maybe it was deleted or you don\'t have permissions to display it.'
                    });
                } else if (err.response?.status === 401 || err.response?.status === 403) {
                    setError({
                        type: 'unauthorized', 
                        message: 'You don\'t have permissions to display the event.'
                    });
                } else if (err.code === 'NETWORK_ERROR' || !err.response) {
                    setError({
                        type: 'network',
                        message: 'Problem with the network connection. Please try later.'
                    });
                } else {
                    setError({
                        type: 'unknown',
                        message: 'Unexpected error has occured while loading the event.'
                    });
                }
            } finally {
                setLoading(false);
            }

        };
        if (eventId) {
            loadEvent();
            loadPreferencesSummary();
        }
    }, [eventId]);

    const loadPreferencesSummary = async () => {
        try {
            const [summaryRes, usersRes ] = await Promise.all([
                axios.get(`/events/${eventId}/preferences/summary`),
                axios.get(`/events/${eventId}/participants`)
            ]);
            setPreferenceSummary(summaryRes.data);  // [{ Day, Hour, Count }]
            setSubmittedUsers(usersRes.data);
        } catch (err: any){
            console.error(err);
            if (err.response?.status === 404) {
                alert("Event was deleted");
                navigate('/dashboard');
            } else {
                alert("Failed to load event preferences.");
            }
        }
    };

    const handleFinalize = async () => {
        const confirm = window.confirm("Are you sure you want to finalize proposals and start final voting?");
        if (!confirm) return;

        try {
            await axios.post(`/events/${eventId}/finalize`, null, {
                params: { duration }
            });
            window.location.reload(); 
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 404) {
                alert("Event was deleted");
                navigate('/dashboard');
            } else {
                alert("Failed to finalize proposals.");
            }
        }
    };

    const handleCloseEvent = async () => {
        if (!window.confirm("Are you sure you want to close the event?")) return;

        try {
            await axios.post(`/events/${eventId}/closeOpen`);
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 404) {
                alert("Event was deleted");
                navigate('/dashboard');
            } else {
                alert("Failed to close event.");
            }
        }
    }
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg">Loading event detail...</p>
                </div>
            </div>
        );
    }
    // error state
    if (error) {
        return (
            <ErrorNotification error={error} />
        );
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
            duration={duration}
            setDuration={setDuration}
            handleCloseEvent={handleCloseEvent}
        />
    ) : null;
}