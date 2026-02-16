import { useState, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import { Calendar, MapPin } from "lucide-react";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import axios from "../../api/axios";
import LocationPreferenceForm from "../../components/LocationPreferenceForm";
import TimePreferenceForm from "../../components/TimePreferenceForm";
import GenericVotingForm, { VoteOption } from "../../components/sharedDetailPage/GenericVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";

type Props = {
    event: any;
    eventId: string;
    onClose: () => void;
    showPreferenceFormInitially: boolean;
};

export default function FullyOpenDetail({ event, eventId, onClose, showPreferenceFormInitially }: Props) {
    const notify = useNotification();
    const [participants, setParticipants] = useState([]);
    const [showLocationPreferenceForm, setShowLocationPreferenceForm] = useState(showPreferenceFormInitially);
    const [showTimePreferenceForm, setShowTimePreferenceForm] = useState(showPreferenceFormInitially);
    const [summary, setSummary] = useState<any>(null);
    const [duration, setDuration] = useState(2);
    const [generatedOptions, setGeneratedOptions] = useState([]);
    const [myVote, setMyVote] = useState<string | null>(null);
    const [hasLocationPref, setHasLocationPref] = useState(false);
    const [hasTimePref, setHasTimePref] = useState(false);

    useEffect(() => {
        loadData();
    }, [eventId]);

    const getDaysInTimeRange = () => {
        const from = new Date(event.timeRangeFrom);
        const to = new Date(event.timeRangeTo);
        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays;
    }
    const loadData = async () => {
        try {
            const [participantsRes, prefsRes, summaryRes, optionsRes, votesRes] = await Promise.all([
                axios.get(`/events/${eventId}/participants`),
                axios.get(`/events/${eventId}/fullyOpenPreferences/my`),
                axios.get(`/events/${eventId}/fullyOpenPreferences/summary`),
                axios.get(`/events/${eventId}/options`),
                axios.get(`/events/${eventId}/votes/my`)
            ]);

            setParticipants(participantsRes.data);
            setHasLocationPref(!!prefsRes.data.location);
            setHasTimePref(!!prefsRes.data.time);
            setSummary(summaryRes.data);
            setGeneratedOptions(optionsRes.data.filter((o: any) => o.source === "Generated"));

            const finalVote = votesRes.data.find((v: any) => v.type === "Final");
            if (finalVote) setMyVote(finalVote.optionId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm("Finalize and generate place+time options?")) return;
        try {
            await axios.post(`/events/${eventId}/finalizeFullyOpen?duration=${duration}`);
            window.location.reload();
        } catch (err) {
            notify.error("Failed to finalize");
        }
    };

    return (
        <EventDetailLayout 
            commentSection={<CommentSection eventId={eventId} />}
        >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <ParticipantsList participants={participants} />
                    {event.phase === "Proposal" && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                    Submit Your Preferences
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Select your preferred location and available times
                                </p>
                                <div className="flex cols-1 gap-2 mb-4">
                                    <div>
                                        {hasTimePref && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                ✓ Time submitted
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => setShowTimePreferenceForm(!showTimePreferenceForm)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium mt-3"
                                        >
                                            {showTimePreferenceForm ? 'Hide' : 'Edit'} Time Preferences
                                        </button>
                                    </div>
                                    <div>
                                        {hasLocationPref && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                ✓ Location submitted
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => setShowLocationPreferenceForm(!showLocationPreferenceForm)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium mt-3"
                                        >
                                            {showLocationPreferenceForm ? 'Hide' : 'Edit'} Location Preferences
                                        </button>
                                    </div>
                                </div>
                                

                                
                                <div className="mt-6 space-y-6">
                                    {showLocationPreferenceForm && (
                                        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                Location Preference
                                            </h4>
                                            <LocationPreferenceForm
                                                eventId={eventId}
                                                apiEndpoint={`/events/${eventId}/fullyOpenPreferences/location`}
                                                onClose={() => setShowLocationPreferenceForm(false)}
                                                onSubmit={loadData}
                                            />
                                        </div>
                                    )}
                                    {showTimePreferenceForm && (
                                        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                                Time Preference
                                            </h4>
                                            <TimePreferenceForm 
                                                eventId={eventId} 
                                                timeRangeFrom={event.timeRangeFrom}
                                                timeRangeTo={event.timeRangeTo} 
                                                apiEndpoint={`/events/${eventId}/fullyOpenPreferences/time`} 
                                                onClose={() => setShowTimePreferenceForm(false)}
                                                onSubmit={loadData}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                    
                            {summary?.location && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        Location Summary
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {summary.location.totalSubmissions}
                                            </p>
                                        </div>
                                        {summary.location.typeCounts.map((tc: any, i: number) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{tc.type}</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tc.count}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {summary?.time && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                        Time Preference Summary
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {summary.time.slice(0, 8).map((item: any, i: number) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.day}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{item.hour}:00</p>
                                                <p className="text-xs text-gray-500">{item.count} votes</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {event.currentUserIsOrganizer && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Finalize Event
                                    </h3>
                                    <label className="block mb-4">
                                        <span className="text-gray-700 dark:text-gray-300">Duration: {event.isMultiDay ? (duration / 24) : duration} {event.isMultiDay ? "days" : "hours"}</span>
                                        <input
                                            type="range"
                                            min={1}
                                            max={event.isMultiDay ? getDaysInTimeRange() : 12}
                                            value={event.isMultiDay ? (duration / 24) : duration}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                // Store as hours in both cases
                                                event.isMultiDay ? setDuration(val * 24) : setDuration(val);
                                            }}
                                            className="w-full mt-2"
                                        />
                                    </label>
                                    <button
                                        onClick={handleFinalize}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                                    >
                                        Generate Options
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {event.phase === "FinalVoting" && (
                        <GenericVotingForm 
                            eventId={eventId}
                            title="Final Voting - Select Your Preferred Option"
                            voteType="Final"
                            filterOptions={(opt: VoteOption) => opt.source === "Generated"}
                        />
                    )}
                    {event.phase === "FinalVoting" && event.currentUserIsOrganizer && (
                        <button
                            onClick={onClose}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                        >
                            Close Event
                        </button>
                    )}
                    {event.phase === "Closed" && event.finalPlaceName && (
                        <FinalResult event={event} />
                    )}
                </div>
            </div>
        </EventDetailLayout>
    )
}