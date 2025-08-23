import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import FixedEventDetailPage from "../components/FixedEventDetailPage";
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

    const [options, setOptions] = useState([]);
    const [votes, setVotes] = useState([]);
    const [newOption, setNewOption] = useState({
        placeName: "",
        location: "",
        timeFrom: new Date(),
        timeTo: new Date(),
    });
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const [participants, setParticipants] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{
        type: 'not-found' | 'network' | 'unauthorized' | 'unknown';
        message: string;
    } | null>(null);

    const loadParticipants = async () => {
        const usersRes = await axios.get(`/events/${eventId}/participants`);
        setParticipants(usersRes.data);
    };

    const loadOptions = async () => {
        const res = await axios.get(`/events/${eventId}/options`);
        setOptions(res.data);
    };

    const loadVotes = async () => {
        const res = await axios.get(`/events/${eventId}/votes/summary`);
        setVotes(res.data);
    };

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`/events/${eventId}`);
                setEvent(res.data);
                // load left data in parallel
                await Promise.all([
                    loadOptions(),
                    loadVotes(),
                    loadParticipants()
                ]);
            } catch (err: any) {
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
        if (eventId) loadEvent();
    }, [eventId]);

    const handleVote = async () => {
        try {
            await axios.post(`/events/${eventId}/votes`, { optionIds: myVotes }, {
                headers: {"Content-Type": "application/json" }
            });
            alert("Vote saved.");
            await loadVotes();
        } catch (err: any){
            if (err.response?.status === 404) {
                alert("Event was deleted.");
                navigate('/dashboard');
            } else {
                alert("The vote couldn't be saved.");
            }
        }
    };
    const handleAddOption = async () => {
        try {
            await axios.post(`/events/${eventId}/options`, newOption);
            await loadOptions();
            // reset form
            setNewOption({
                placeName: "",
                location: "",
                timeFrom: new Date(),
                timeTo: new Date(),
            });
        } catch (err: any){
            if (err.response?.status === 404) {
                alert("Event was deleted");
                navigate('/dashboard');
            } else {
                alert("The option couldn't be addeed.");
            }
        }
    }
    const handleCloseEvent = async () => {
        if (!window.confirm("Are you sure you want to close the event?")) return;
        try {
            const response = await axios.post(`events/${eventId}/closeFixed`);
            if (response.data.empty) {
                const confirmDelete = window.confirm(
                    "No votes were submitted. Do you really want to delete the event instead?"
                );
                if (confirmDelete) {
                    await axios.delete(`events/${eventId}`);
                    navigate('/dashboard');
                }
                return;
            }
            window.location.reload();
        } catch (err: any) {
            console.error("Full error:", err);
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
        <FixedEventDetailPage
            event={event}
            options={options}
            votes={votes}
            newOption={newOption}
            setNewOption={setNewOption}
            myVotes={myVotes}
            setMyVotes={setMyVotes}
            handleVote={handleVote}
            handleAddOption={handleAddOption}
            submittedUsers={participants}
            handleCloseEvent={handleCloseEvent}
        />
    ) : null;
}