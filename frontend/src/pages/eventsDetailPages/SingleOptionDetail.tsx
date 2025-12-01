import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import axios from "../../api/axios";
import Event from "../../types/event";
import OptionsList from "../../components/OptionList";
import AddOptionForm from "../../components/AddOptionForm";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";

interface Props {
    event: Event;
    eventId: string;
    onClose: () => void;
    onDelete: () => void;
    onReload: () => void;
    showPreferenceFormInitially: boolean;
}

export default function SingleOptionDetail({ 
    event, 
    eventId, 
    onClose
}: Props) {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        try {
            const participantsRes = await axios.get(`/events/${eventId}/participants`);
            setParticipants(participantsRes.data);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 dark:bg-gray-900">
            {/* Phase-specific content */}
            {event.phase === "Proposal" && (
                <>
                    {/* Single option given by organizer during the creation*/}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <MapPin className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Location</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{event.fixedPlaceName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.fixedAddress}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <Clock className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Time</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {new Date(event.fixedTimeFrom!).toLocaleString('cs-CZ', { 
                                        dateStyle: 'full',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <ParticipantsList participants={participants} />

                    {event.currentUserIsOrganizer && (
                        <button onClick={onClose} className="mt-4 ml-4 bg-green-600 text-white px-6 py-3 rounded-lg">
                            Close
                        </button>
                    )}
                </>
            )}

            {event.phase === "Closed" && event.finalPlaceName && (
                <FinalResult event={event} />
            )}
        </div>
    );
}