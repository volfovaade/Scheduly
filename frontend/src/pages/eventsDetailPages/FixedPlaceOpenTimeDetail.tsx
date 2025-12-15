import { useState, useEffect } from "react";
import { MapPin, Clock, TrendingUp, Sparkles } from "lucide-react";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { useNotification } from "../../context/NotificationContext";
import TimePreferenceForm from "../../components/TimePreferenceForm";
import axios from "../../api/axios";

interface Props {
    event: any;
    eventId: string;
    onClose: () => void;
    onDelete: () => void;
    onReload: () => void;
    showPreferenceFormInitially: boolean;
}

export default function FixedPlaceOpenTimeDetail({ 
    event, 
    eventId, 
    onClose,
    onReload,
    showPreferenceFormInitially 
}: Props) {
    const notify = useNotification();
    const [participants, setParticipants] = useState([]);
    const [showPreferenceForm, setShowPreferenceForm] = useState(showPreferenceFormInitially);
    const [timeSummary, setTimeSummary] = useState<any[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        try {
            const [participantsRes, summaryRes, myPrefRes] = await Promise.all([
                axios.get(`/events/${eventId}/participants`),
                axios.get(`/events/${eventId}/timePreferences/summary`),
                axios.get(`/events/${eventId}/timePreferences/my`)
            ]);
            
            setParticipants(participantsRes.data);
            setTimeSummary(summaryRes.data);
            setHasSubmitted(!!myPrefRes.data && myPrefRes.data.timeIntervals?.length > 0);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm("Find the best time based on everyone's availability?")) return;
        
        setFinalizing(true);
        try {
            await axios.post(`/events/${eventId}/finalizeFixedPlaceOpenTime`);
            onReload();
            notify.info("Best time found! Event is now closed.");
        } catch (err: any) {
            notify.error(err.response?.data || "Failed to finalize");
        } finally {
            setFinalizing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <ParticipantsList participants={participants} />

                {/* Event Info Card */}
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                        Fixed Event Location
                    </h3>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.fixedPlaceName}
                        </p>
                        {event.fixedAddress && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                📍 {event.fixedAddress}
                            </p>
                        )}
                    </div>
                </div>

                {event.phase === "Proposal" && (
                    <>
                        {/* Preference Submission */}
                        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                Submit Your Time Preferences
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Add all time slots when you're available. We'll find the time that works best for everyone.
                            </p>
                            
                            {hasSubmitted ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                                    <p className="text-green-800 dark:text-green-300 font-medium">
                                        ✓ You've submitted your time preferences
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                                    <p className="text-yellow-800 dark:text-yellow-300">
                                        ⚠️ You haven't submitted your preferences yet
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowPreferenceForm(true)}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {hasSubmitted ? "Edit" : "Add"} Time Preferences
                            </button>
                        </div>

                        {/* Time Summary */}
                        {timeSummary && timeSummary.length > 0 && (
                            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Most Popular Times
                                </h3>
                                <div className="space-y-2">
                                    {timeSummary.slice(0, 10).map((slot, index) => {
                                        const maxCount = timeSummary[0]?.count || 1;
                                        const percentage = (slot.count / maxCount) * 100;
                                        
                                        return (
                                            <div key={index} className="relative">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {slot.day} at {slot.hour}:00
                                                    </span>
                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {slot.count} {slot.count === 1 ? 'person' : 'people'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {timeSummary.length > 10 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                        Showing top 10 of {timeSummary.length} time slots
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Organizer Actions */}
                        {event.currentUserIsOrganizer && timeSummary.length > 0 && (
                            <div className="mb-8 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-800/20 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    <Sparkles className="w-5 h-5 text-pink-600" />
                                    Ready to Find the Best Time?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Click below to calculate the optimal time based on everyone's availability.
                                    The event will be automatically finalized.
                                </p>
                                <button
                                    onClick={handleFinalize}
                                    disabled={finalizing}
                                    className="w-full bg-gradient-to-r from-pink-800 to-pink-600 hover:from-pink-900 hover:to-pink-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {finalizing ? "Finding Best Time..." : "Find Best Time & Close Event"}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {event.phase === "Closed" && (
                    <FinalResult event={event} />
                )}

                {showPreferenceForm && event.phase === "Proposal" && (
                    <TimePreferenceForm
                        eventId={eventId}
                        timeRangeFrom={event.timeRangeFrom}
                        timeRangeTo={event.timeRangeTo}
                        onClose={() => setShowPreferenceForm(false)}
                        onSubmit={loadData}
                    />
                )}
            </div>
        </div>
    );
}