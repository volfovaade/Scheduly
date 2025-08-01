import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CreateEventDialog from "../components/CreateEventDialog";
import { useAuth } from "../context/AuthContext";
import { Trash2, LogOut } from "lucide-react";

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

    const handleAddEvent = async (data: { title: string; description: string }) => {
        try {
            const res = await axios.post("events", data);
            setOrganized((prev) => [...prev, res.data]);
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
    const handleGoToDetail = (id: string) => {
        navigate(`/events/${id}`);
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
                    <div
                        key={e.id}
                        className="relative p-4 border rounded shadow hover:shadow-md cursor-pointer transition"
                        onClick={() => handleGoToDetail(e.id)}
                    >
                        <h4 className="font-bold text-lg">{e.title}</h4>
                        <p className="text-sm text-gray-600">Code: {e.id.slice(0, 6)}</p>
                        <button
                            onClick={() => {
                                e.stopPropagation();  // to prevent from showing detail on click
                                handleLeaveEvent(e.id);
                            }}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                    ))}
                </div>
                </div>

                {/* Organizing */}
                <div>
                <h3 className="text-xl font-semibold mb-4">Organizing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organized.map((e: any) => (
                    <div
                        key={e.id}
                        className="relative p-4 border rounded shadow hover:shadow-md cursor-pointer transition"
                        onClick={() => handleGoToDetail(e.id)}
                    >
                        <h4 className="font-bold text-lg">{e.title}</h4>
                        <p className="text-sm text-gray-600">Code: {e.id.slice(0, 6)}</p>
                        <button
                            onClick={() => {
                                e.stopPropagation();
                                handleDeleteEvent(e.id);
                            }}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
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