// components/TimePreferenceForm.tsx
import { useState, useEffect, useRef } from "react";
import { Clock, X, Plus, Trash2 } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import axios from "../api/axios";

interface Props {
    eventId: string;
    timeRangeFrom: string;
    timeRangeTo: string;
    apiEndpoint?: string;
    onClose: () => void;
    onSubmit: () => void;
}

interface TimeSlot {
    id: string;
    from: Date;
    to: Date;
}

export default function TimePreferenceForm({ eventId, timeRangeFrom, timeRangeTo, apiEndpoint, onClose, onSubmit }: Props) {
    const endpoint = apiEndpoint || `/events/${eventId}/timePreferences`;
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const notify = useNotification();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    useEffect(() => {
        loadPreference();
    }, [eventId]);

    const loadPreference = async () => {
        try {
            const res = await axios.get(`/events/${eventId}/timePreferences/my`);
            if (res.data && res.data.timeIntervals) {
                setTimeSlots(res.data.timeIntervals.map((interval: any) => ({
                    id: Math.random().toString(),
                    from: new Date(interval.from),
                    to: new Date(interval.to)
                })));
            }
        } catch (err) {
            console.error("Failed to load preference:", err);
        }
    };
    const getDefaultDateTime = () => {
        const date = new Date(timeRangeFrom);
        return date;
    }
    const addTimeSlot = () => {
        const date = getDefaultDateTime();
        setTimeSlots([...timeSlots, {
            id: Math.random().toString(),
            from: date,
            to: new Date(date.getTime() + 60 * 60 * 1000) // +1 hour
        }]);
    };

    const removeTimeSlot = (id: string) => {
        setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    };

    const updateTimeSlot = (id: string, field: 'from' | 'to', value: string) => {
        setTimeSlots(timeSlots.map(slot =>
            slot.id === id ? { ...slot, [field]: new Date(value) } : slot
        ));
    };

    const formatDateTime = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const validateSlots = () => {
        if (timeSlots.length === 0) {
            setError("Please add at least one time slot");
            scrollToTop();
            return false;
        }

        for (const slot of timeSlots) {
            if (slot.from >= slot.to) {
                setError("Start time must be before end time");
                scrollToTop();
                return false;
            }

            const eventFrom = new Date(timeRangeFrom);
            const eventTo = new Date(timeRangeTo);

            if (slot.from < eventFrom || slot.to > eventTo) {
                setError("Time slots must be within event time range");
                scrollToTop();
                return false;
            }
        }

        setError("");
        return true;
    };

    const handleSubmit = async () => {
        if (!validateSlots()) return;

        setLoading(true);
        try {
            await axios.post(endpoint, {
                timeIntervals: timeSlots.map(slot => ({
                    from: slot.from.toISOString(),
                    to: slot.to.toISOString()
                }))
            });
            notify.info("Time preferences saved!");
            onSubmit();
            onClose();
        } catch (err) {
            notify.error("Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div ref={scrollContainerRef}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Clock className="w-6 h-6" />
                                Select Your Available Times
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">
                                Add all time slots when you're available
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
                            {error}
                        </div>
                    )}

                    {/* Event Time Range Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            📅 Event time range: {new Date(timeRangeFrom).toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} 
                                                - {new Date(timeRangeTo).toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Time Slots */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Your Available Time Slots ({timeSlots.length})
                            </label>
                            <button
                                onClick={addTimeSlot}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Time Slot
                            </button>
                        </div>

                        {timeSlots.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">No time slots added yet</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    Click "Add Time Slot" to start
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {timeSlots.map((slot, index) => (
                                    <div
                                        key={slot.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                                        From
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={formatDateTime(slot.from)}
                                                        onChange={(e) => updateTimeSlot(slot.id, 'from', e.target.value)}
                                                        min={formatDateTime(new Date(timeRangeFrom))}
                                                        max={formatDateTime(new Date(timeRangeTo))}
                                                        className="w-full px-3 py-2 border border-gray-300 text-sm [color-scheme:light]
                                                            dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] dark:placeholder-gray-400
                                                            rounded-lg focus:ring-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                                        To
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={formatDateTime(slot.to)}
                                                        onChange={(e) => updateTimeSlot(slot.id, 'to', e.target.value)}
                                                        min={formatDateTime(new Date(slot.from))}
                                                        max={formatDateTime(new Date(timeRangeTo))}
                                                        className="w-full px-3 py-2 border border-gray-300 text-sm [color-scheme:light]
                                                            dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] dark:placeholder-gray-400
                                                            rounded-lg focus:ring-1"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeTimeSlot(slot.id)}
                                                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {timeSlots.length > 0 && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Summary:
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You've added <strong>{timeSlots.length}</strong> time slot{timeSlots.length !== 1 && 's'} when you're available
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || timeSlots.length === 0}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}