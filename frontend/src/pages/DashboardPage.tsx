import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import EventCreationForm from "../components/EventCreationForm";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import EventCard from "../components/EventCard";

type EventMode = "SingleOption" | "CollaborativeOptions" | "OrganizerOptions" 
                | "FixedTimeOpenPlace" | "FixedPlaceOpenTime" | "FullyOpen";

type Event = {
    id: string;
    title: string;
    description: string;
    ownerId: string;
    mode: EventMode;
    isMultiDay: boolean;
}

export default function DashboardPage() {
    const [organized, setOrganized] = useState<Event[]>([]);
    const [participating, setParticipating] = useState<Event[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();
    const notify = useNotification();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
            return;
        }
        
        const loadEvents = async () => {  
            try {
                setLoading(true);
                const res = await axios.get("events/my");
                setOrganized(res.data.filter((e: any) => e.ownerId === user!.id));
                setParticipating(res.data.filter((e: any) => e.ownerId !== user!.id));
            } catch (err) {
                console.error("Failed to load events", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadEvents();
    }, [isAuthenticated, user, navigate]);

    const handleAddEvent = async (data: any) => {
        try {
            const res = await axios.post("events", {
            title: data.title,
            description: data.description,
            mode: data.mode,
            isMultiDay: data.isMultiDay,
            constraint: getConstraintType(data.mode),
            timeRangeFrom: data.timeRangeFrom,
            timeRangeTo: data.timeRangeTo,
            fixedPlaceName: data.fixedPlace,
            fixedAddress: data.fixedAddress,
            fixedTimeFrom: data.fixedTimeFrom,
            fixedTimeTo: data.fixedTimeTo,
            allowParticipantOptions: data.allowParticipantOptions,
            maxOptionsPerUser: 3
        });
            setOrganized((prev) => [...prev, res.data]);
            navigateToEvent(res.data.id, data.mode);
        } catch (err) {
            notify.error("Event creation failed.");
            console.error(err);
        }
    }

    const getConstraintType = (mode: EventMode): number => {
        switch (mode) {
            case "CollaborativeOptions":
            case "OrganizerOptions":
            case "FullyOpen":
                return 1; // TimeRange
            case "FixedPlaceOpenTime":
                return 2; // FixedPlace - include time range
            case "FixedTimeOpenPlace":
                return 3; // FixedTime - include time range
            case "SingleOption":
                return 0; // None
            default:
                return 0; // None
        }
    };
    const navigateToEvent = (id: string, mode: EventMode, showPreferenceForm = true) => {
        const query = showPreferenceForm ? "?showPreferenceForm=true" : "";
        switch (mode) {
            case "SingleOption":
            case "CollaborativeOptions":
            case "OrganizerOptions":
                // no preference form needed, will vote on the page detail
                navigate(`/events/${id}`);
                break;
            case "FixedTimeOpenPlace":
            case "FixedPlaceOpenTime":
            case "FullyOpen":
                // Events requiring preferences
                navigate(`/events/${id}${query}`);
                break;
            default:
                navigate(`/events/${id}`);
        }
    };
    const handleDeleteEvent = async (eventId: string) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        
        try {
            await axios.delete(`events/${eventId}`);
            setOrganized(prev => prev.filter(e => e.id !== eventId));
        } catch (err) {
            notify.error("Failed to delete event");
            console.error(err);
        }
        ///// !!!!!!!!!!!!! pri delete bude potreba informovat lidi
        // ze se akce rusi
    };
    const handleLeaveEvent = async (eventId: string) => {
        if (!window.confirm("Are you sure you want to leave this event?")) return;
        
        try {
            await axios.delete(`events/${eventId}/participants/leave`);
            setParticipating(prev => prev.filter(e => e.id !== eventId));
        } catch (err) {
            notify.error("Failed to leave event");
            console.error(err);
        }
    };
    const handleGoToDetail = (id: string, mode: EventMode) => {
        // when going from dashboard not the creation
        // we do not need preferece form to be shown -> false
        navigateToEvent(id, mode, false);
    };

    // Get display name for event mode
    const getModeName = (mode: EventMode): string => {
        const names: Record<EventMode, string> = {
            SingleOption: "Simple",
            CollaborativeOptions: "Collaborative",
            OrganizerOptions: "Organizer Choice",
            FixedTimeOpenPlace: "Fixed Time",
            FixedPlaceOpenTime: "Fixed Place",
            FullyOpen: "Fully Open"
        };
        return names[mode] || mode;
    };
    // loading component
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg">Loading your events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">My Events</h2>
                <button
                    className="bg-gradient-to-r from-pink-600 to-pink-800 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-pink-900 font-medium transition-all shadow-lg hover:shadow-xl"
                    onClick={() => setShowDialog(true)}
                >
                    + Add Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900 dark:text-gray-50">
                {/* Participating */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">👥</span> Participating
                        <span className="text-sm font-normal text-gray-500">({participating.length})</span>
                    </h3>
                    {participating.length === 0 ? (
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
                            <p>You're not participating in any events yet.</p>
                            <p className="text-sm mt-2">Join an event using a code!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {participating.map((e) => (
                                <EventCard
                                    key={e.id}
                                    id={e.id}
                                    title={e.title}
                                    code={e.id.slice(0, 6)}
                                    mode={getModeName(e.mode)}
                                    isMultiDay={e.isMultiDay}
                                    onClick={() => handleGoToDetail(e.id, e.mode)}
                                    onAction={() => handleLeaveEvent(e.id)}
                                    icon="leave"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Organizing */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span> Organizing
                        <span className="text-sm font-normal text-gray-500">({organized.length})</span>
                    </h3>
                    {organized.length === 0 ? (
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
                            <p>You haven't created any events yet.</p>
                            <p className="text-sm mt-2">Click "Add Event" to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {organized.map((e) => (
                                <EventCard
                                    key={e.id}
                                    id={e.id}
                                    title={e.title}
                                    code={e.id.slice(0, 6)}
                                    mode={getModeName(e.mode)}
                                    isMultiDay={e.isMultiDay}
                                    onClick={() => handleGoToDetail(e.id, e.mode)}
                                    onAction={() => handleDeleteEvent(e.id)}
                                    icon="delete"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <EventCreationForm
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onCreate={handleAddEvent}
            />
        </div>
    );
}