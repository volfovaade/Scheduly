import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CreateEventDialog from "../components/CreateEventDialog";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";

type Event = {
    id: string;
    title: string;
    description: string;
    ownerId: string;
}
export default function DashboardPage() {
    const [organized, setOrganized] = useState<Event[]>([]);
    const [participating, setParticipating] = useState<Event[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
            return;
        }
        const load = async () => {  
            try {
                const res = await axios.get("events/my");
                setOrganized(res.data.filter((e: any) => e.ownerId === user!.id));
                setParticipating(res.data.filter((e: any) => e.ownerId !== user!.id));
            } catch (err) {
                console.error("Failed to load events", err);
                navigate("/");
            }
        };
        load();
    }, [isAuthenticated, user, navigate]); 

    const handleAddEvent = async (data: { 
        title: string; 
        description: string;
        mode: "Open" | "Fixed";
        timeRangeFrom?: Date | null;
        timeRangeTo?: Date | null;
    }) => {
        try {
            const res = await axios.post("events", {
            title: data.title,
            description: data.description,
            mode: data.mode,
            timeRangeFrom: data.timeRangeFrom,
            timeRangeTo: data.timeRangeTo,
        });
            setOrganized((prev) => [...prev, res.data]);
            if (data.mode === "Open"){
                navigate(`/events/open/${res.data.id}?showPreferenceForm=true`); // navigate to placePreference form
            } else {
                navigate(`/events/fixed/${res.data.id}?showPreferenceForm=true`); // navigate to placePreference form
            }
        } catch (err) {
            alert("Event creation failed.");
            console.error(err);
        }
    }
    const handleDeleteEvent = async (eventId: string) => {
        await axios.delete(`events/${eventId}`);
        ///// !!!!!!!!!!!!! pri delete bude potreba informovat lidi
        // ze se akce rusi
    };
    const handleLeaveEvent = async (eventId: string) => {
        await axios.delete(`events/${eventId}/participants/leave`);
    };
    const handleGoToDetail = (id: string, mode: string) => {
        if (mode === "Open"){
            navigate(`/events/open/${id}`);
        } else {
            navigate(`/events/fixed/${id}`);
        }
    };
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">My Events</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Participating */}
                <div>
                <h3 className="text-xl font-semibold mb-4">Participating</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {participating.map((e: any) => (
                        <EventCard
                            key={e.id}
                            id={e.id}
                            title={e.title}
                            code={e.id.slice(0, 6)}
                            onClick={() => handleGoToDetail(e.id, e.mode)}
                            onAction={() => handleLeaveEvent(e.id)}
                            icon="leave"
                            mode={e.mode}
                        />
                    ))}
                </div>
                </div>

                {/* Organizing */}
                <div>
                <h3 className="text-xl font-semibold mb-4">Organizing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organized.map((e: any) => (
                        <EventCard
                            key={e.id}
                            id={e.id}
                            title={e.title}
                            code={e.id.slice(0, 6)}
                            onClick={() => handleGoToDetail(e.id, e.mode)}
                            onAction={() => handleDeleteEvent(e.id)}
                            icon="delete"
                            mode={e.mode}
                        />
                    ))}
                </div>
                </div>
            </div>
            <CreateEventDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onCreate={handleAddEvent}
            />
            <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowDialog(true)}>
                Add event
            </button>
        </div>
    );
}