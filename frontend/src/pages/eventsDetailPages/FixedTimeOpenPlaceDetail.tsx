import { useState, useEffect } from "react";
import { MapPin, Users, Clock, Sparkles } from "lucide-react";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { useNotification } from "../../context/NotificationContext";
import LocationPreferenceForm from "../../components/LocationPreferenceForm";
import FinalVotingForm from "../../components/FinalVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import axios from "../../api/axios";

interface Props {
    event: any;
    eventId: string;
    onClose: () => void;
    onDelete: () => void;
    onReload: () => void;
    showPreferenceFormInitially: boolean;
}
type LocationSummary = {
    totalSubmissions: number,
    averageLatitude: number, 
    averageLongitude: number,
    typeCounts: { type: string, count: number }[]
}
export default function FixedTimeOpenPlaceDetail({ 
    event, 
    eventId, 
    onClose, 
    onReload,
    showPreferenceFormInitially 
}: Props) {
    const notify = useNotification();
    const [participants, setParticipants] = useState([]);
    const [showPreferenceForm, setShowPreferenceForm] = useState(showPreferenceFormInitially);
    const [locationSummary, setLocationSummary] = useState<LocationSummary>({
        totalSubmissions: 0,
        averageLatitude: 0,
        averageLongitude: 0,
        typeCounts: []
    });
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        try {
            const [participantsRes, summaryRes, myPrefRes] = await Promise.all([
                axios.get(`/events/${eventId}/participants`),
                axios.get(`/events/${eventId}/locationPreferences/summary`),
                axios.get(`/events/${eventId}/locationPreferences/my`)
            ]);
            
            setParticipants(participantsRes.data);
            setLocationSummary(summaryRes.data);
            setHasSubmitted(!!myPrefRes.data);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm("Generate 3 best place options from user preferences?")) return;
        
        setFinalizing(true);
        try {
            await axios.post(`/events/${eventId}/finalizeFixedTimeOpenPlace`);
            onReload();
            notify.info("Places generated! Voting phase started.");
        } catch (err: any) {
            notify.error(err.response?.data || "Failed to finalize");
        } finally {
            setFinalizing(false);
        }
        
    };

    const handleClose = async () => {
        setFinalizing(true);
        onClose();
        setFinalizing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <ParticipantsList participants={participants} />

                {/* Event Info Card */}
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Fixed Event Time
                    </h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            📅 Event will take place at:
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.fixedTimeFrom && new Date(event.fixedTimeFrom).toLocaleString('en-US', {
                                dateStyle: 'full',
                                timeStyle: 'short'
                            })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Duration: {event.fixedTimeFrom && event.fixedTimeTo && 
                                Math.round((new Date(event.fixedTimeTo).getTime() - new Date(event.fixedTimeFrom).getTime()) / (1000 * 60 * 60))
                            } hours
                        </p>
                    </div>
                </div>

                {event.phase === "Proposal" && (
                    <>
                        {/* Preference Submission */}
                        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                                Submit Your Location Preference
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Select where you'd like the event to take place. We'll generate the 3 best options based on everyone's preferences.
                            </p>
                            
                            {hasSubmitted ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                                    <p className="text-green-800 dark:text-green-300 font-medium">
                                        ✓ You've submitted your location preference
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                                    <p className="text-yellow-800 dark:text-yellow-300">
                                        ⚠️ You haven't submitted your preference yet
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowPreferenceForm(true)}
                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {hasSubmitted ? "Edit" : "Add"} Location Preference
                            </button>
                        </div>

                        {/* Location Summary */}
                        {locationSummary && locationSummary.totalSubmissions > 0 && (
                            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    📊 Preference Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {locationSummary.totalSubmissions}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Latitude</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {locationSummary.averageLatitude?.toFixed(4)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Longitude</p>
                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                            {locationSummary.averageLongitude?.toFixed(4)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Place Types</p>
                                        <div className="mt-1 space-y-1">
                                            {locationSummary.typeCounts?.map((tc: any) => (
                                                <p key={tc.type} className="text-xs text-gray-700 dark:text-gray-300">
                                                    {tc.type}: {tc.count}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Organizer Actions */}
                        {event.currentUserIsOrganizer && locationSummary.totalSubmissions > 0 && (
                            <div className="mb-8 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-800/20 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-pink-600" />
                                    Ready to Generate Places?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {locationSummary.totalSubmissions} participant{locationSummary.totalSubmissions !== 1 && 's'} submitted their preferences.
                                    Click below to generate 3 optimal locations and start voting.
                                </p>
                                <button
                                    onClick={handleFinalize}
                                    disabled={finalizing}
                                    className="w-full bg-gradient-to-r from-pink-800 to-pink-600 hover:from-pink-900 hover:to-pink-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {finalizing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Generating Places...
                                        </span>
                                    ) : (
                                        "Generate Places & Start Voting"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {event.phase === "FinalVoting" && (
                    <>
                        <FinalVotingForm eventId={eventId} />
                        {/* Organizer Actions */}
                        {event.currentUserIsOrganizer && (
                            <button 
                                onClick={handleClose} 
                                disabled={finalizing} 
                                className="mt-4 ml-4 bg-green-600 text-white px-6 py-3 rounded-lg"
                            >
                                {finalizing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Closing...
                                    </span>
                                ) : (
                                    "Close Event"
                                )}
                            </button>
                        )}
                    </>
                )}

                {event.phase === "Closed" && (
                    <FinalResult event={event} />
                )}

                {showPreferenceForm && event.phase === "Proposal" && (
                    <LocationPreferenceForm
                        eventId={eventId}
                        onClose={() => setShowPreferenceForm(false)}
                        onSubmit={loadData}
                    />
                )}
            </div>
            <CommentSection eventId={eventId} />
        </div>
    );
}