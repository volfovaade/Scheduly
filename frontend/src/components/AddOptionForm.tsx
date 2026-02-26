// components/AddOptionForm.tsx
import { useState, useRef } from "react";
import { MapPin, Clock, X } from "lucide-react";
import Option from "../types/option";
import Event from "../types/event";
import { formatLocalDateTime } from "../utils/dateUtils";

interface Props {
    eventId: string;
    event: Event;
    onSubmit: (optionData: Option) => Promise<void>;
    onClose: () => void;
    isOpen: boolean;
}

export default function AddOptionForm({ eventId, event, onSubmit, onClose, isOpen }: Props) {
    const [placeName, setPlaceName] = useState("");
    const [address, setAddress] = useState("");
    const [timeFrom, setTimeFrom] = useState<Date | null>(null);
    const [timeTo, setTimeTo] = useState<Date | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatDateTime = (date: Date | null) => {
        if (!date) return "";

        const pad = (n: number) => n.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const validateTimeRange = (from: Date | null, to: Date | null): string => {
        if (!from || !to) return "Please fill in both start and end time";
        if (from >= to) return "Start time must be before end time";
        
        const diffInMs = to.getTime() - from.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 0.5) return "Duration must be at least 30 minutes";
        if (event.isMultiDay && diffInHours < 24) return "Time range must be at least 24 hours for multiple day events";
        if (!event.isMultiDay && diffInHours > 24) return "Time range cannot exceed 24 hours for single day events";
        // Validate against event time range if exists
        if (event.timeRangeFrom && event.timeRangeTo) {
            const eventFrom = new Date(event.timeRangeFrom);
            const eventTo = new Date(event.timeRangeTo);
            
            if (from < eventFrom || to > eventTo) {
                return `Time must be within event range: ${formatLocalDateTime(eventFrom)} - ${formatLocalDateTime(eventTo)}`;
            }
        }
        
        return "";
    };

    const handleReset = () => {
        setPlaceName("");
        setAddress("");
        setTimeFrom(null);
        setTimeTo(null);
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        
        if (!placeName.trim()) {
            setError("Place name is required");
            scrollToTop();
            return;
        }

        if (!timeFrom || !timeTo) {
            setError("Please fill in both start and end time");
            scrollToTop();
            return;
        }

        const validationError = validateTimeRange(timeFrom, timeTo);
        if (validationError) {
            setError(validationError);
            scrollToTop();
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                id: "", // ID will be assigned by backend
                placeName: placeName.trim(),
                address: address.trim() || "",
                timeFrom: timeFrom.toISOString(),
                timeTo: timeTo.toISOString()
            });
            
            handleReset();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add option");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={onClose}
            />
            <div ref={scrollContainerRef}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-pink-700 to-pink-900 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Add New Option</h2>
                            <p className="text-pink-100 text-sm mt-1">for {event.title}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Place Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Place Name *
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                value={placeName}
                                onChange={(e) => setPlaceName(e.target.value)}
                                placeholder="e.g., Café Na Rohu, Park Riegrovy sady..."
                                maxLength={100}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {placeName.length}/100 characters
                            </p>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address (optional)
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="e.g., Karlovo náměstí 5, Praha 2"
                                maxLength={200}
                            />
                        </div>

                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Time Range *
                            </label>
                            
                            {event.timeRangeFrom && event.timeRangeTo && (
                                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        📅 Event time range: {formatLocalDateTime(new Date(event.timeRangeFrom))} - {formatLocalDateTime(new Date(event.timeRangeTo))}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                        From
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateTime(timeFrom)}
                                        onChange={(e) => setTimeFrom(new Date(e.target.value))}
                                        className="w-full px-4 py-3 border border-gray-300 [color-scheme:light]
                                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] dark:placeholder-gray-400
                                            rounded-lg focus:ring-1"
                                        min={event.timeRangeFrom ? formatDateTime(new Date(event.timeRangeFrom)) : undefined}
                                        max={event.timeRangeTo ? formatDateTime(new Date(event.timeRangeTo)) : undefined}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                        To
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateTime(timeTo)}
                                        onChange={(e) => setTimeTo(new Date(e.target.value))}
                                        className="w-full px-4 py-3 border border-gray-300 [color-scheme:light]
                                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] dark:placeholder-gray-400
                                            rounded-lg focus:ring-1"
                                        min={timeFrom ? formatDateTime(timeFrom) : undefined}
                                        max={event.timeRangeTo ? formatDateTime(new Date(event.timeRangeTo)) : undefined}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                { event.isMultiDay ? "💡 Minimum duration: 1 day" : "💡 Minimum duration: 30 minutes" }
                            </p>
                        </div>

                        {/* Preview */}
                        {placeName && timeFrom && timeTo && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Preview:
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <p>
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        <strong>{placeName}</strong>
                                    </p>
                                    {address && <p className="ml-4">{address}</p>}
                                    <p>
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {new Date(timeFrom).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} - {new Date(timeTo).toLocaleString('en-US', { timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                handleReset();
                                onClose();
                            }}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white rounded-lg hover:from-pink-700 hover:to-pink-900 font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Adding...
                                </span>
                            ) : (
                                'Add Option'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}