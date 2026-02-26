import { useState, useEffect, useRef } from "react";
import { Clock, X, Plus, Trash2 } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import axios from "../api/axios";
import { toLocalDateTimeString } from "../utils/dateUtils";

interface Props {
    eventId: string;
    timeRangeFrom: string;
    timeRangeTo: string;
    apiEndpoint?: string;
    isMultiDay?: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

interface TimeSlot {
    id: string;
    from: Date;
    to: Date;
}

export default function TimePreferenceForm({
    eventId,
    timeRangeFrom,
    timeRangeTo,
    apiEndpoint,
    isMultiDay = false,
    onClose,
    onSubmit
}: Props) {

    const endpoint = apiEndpoint || `/events/${eventId}/timePreferences`;

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [days, setDays] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const notify = useNotification();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };  
    // helper funcions for validation
    const isOutOfRange = (date: Date) => {
        const from = new Date(timeRangeFrom);
        const to = new Date(timeRangeTo);
        return date < from || date > to;
    };

    const slotsOverlap = (a: TimeSlot, b: TimeSlot) => {
        return a.from < b.to && b.from < a.to;
    };

    const getSlotErrors = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        timeSlots.forEach((slot, i) => {
            if (slot.from >= slot.to) {
                errors[slot.id] = "End must be after start";
                return;
            }
            // Max 24h na jeden slot pro single day
            const diffInHours = (slot.to.getTime() - slot.from.getTime()) / (1000 * 60 * 60);
            if (diffInHours > 24) {
                errors[slot.id] = "A single time slot cannot exceed 24 hours";
                return;
            }
            if (isOutOfRange(slot.from) || isOutOfRange(slot.to)) {
                errors[slot.id] = "Slot is outside the allowed time range";
                return;
            }
            // check overlapping with other slots
            for (let j = 0; j < timeSlots.length; j++) {
                if (i !== j && slotsOverlap(slot, timeSlots[j])) {
                    errors[slot.id] = "Overlaps with another slot";
                    break;
                }
            }
        });

        return errors;
    };

    const validate = () => {
        if (isMultiDay && days.length === 0) {
            setError("Select at least one day");
            scrollToTop();
            return false;
        }
        if (!isMultiDay && timeSlots.length === 0) {
            setError("Add at least one time slot");
            scrollToTop();
            return false;
        }
        if (!isMultiDay) {
            const slotErrors = getSlotErrors();
            if (Object.keys(slotErrors).length > 0) {
                setError("Please fix the errors in your time slots");
                scrollToTop();
                return false;
            }
        }
        setError("");
        return true;
    };

    const updateTimeSlot = (id: string, field: "from" | "to", value: string) => {
        const rangeStart = new Date(timeRangeFrom);
        const rangeEnd = new Date(timeRangeTo);

        setTimeSlots(
            timeSlots.map(slot => {
                if (slot.id !== id) return slot;

                let newDate = new Date(value);
                // Clamp do rozsahu
                if (newDate < rangeStart) newDate = rangeStart;
                if (newDate > rangeEnd) newDate = rangeEnd;

                const updated = { ...slot, [field]: newDate };
                // Auto-shift to if from >= to
                if (field === "from" && updated.from >= updated.to) {
                    updated.to = new Date(updated.from.getTime() + 60 * 60 * 1000);
                    if (updated.to > rangeEnd) updated.to = rangeEnd;
                }
                if (field === "to") {
                    const maxTo = new Date(updated.from.getTime() + 24 * 60 * 60 * 1000);
                    if (updated.to > maxTo) updated.to = maxTo;
                }
                return updated;
            })
        );
    };

    useEffect(() => {
        loadPreference();
    }, [eventId]);

    const loadPreference = async () => {
        try {
            const res = await axios.get(`/events/${eventId}/timePreferences/my`);

            if (isMultiDay) {
                setDays(res.data?.time?.dates ?? []);
            } else if (res.data?.timeIntervals) {
                setTimeSlots(
                    res.data.timeIntervals.map((i: any) => ({
                        id: crypto.randomUUID(),
                        from: new Date(i.from),
                        to: new Date(i.to)
                    }))
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getDaysInRange = () => {
        const result: string[] = [];
        const start = new Date(timeRangeFrom);
        const end = new Date(timeRangeTo);

        const current = new Date(start);

        while (current <= end) {
            result.push(current.toISOString().slice(0, 10));
            current.setDate(current.getDate() + 1);
        }

        return result;
    };

    const toggleDay = (day: string) => {
        if (days.includes(day)) {
            setDays(days.filter(d => d !== day));
        } else {
            setDays([...days, day]);
        }
    };

    const addTimeSlot = () => {
        const start = new Date(timeRangeFrom);

        setTimeSlots([
            ...timeSlots,
            {
                id: crypto.randomUUID(),
                from: start,
                to: new Date(start.getTime() + 60 * 60 * 1000)
            }
        ]);
    };

    const removeTimeSlot = (id: string) => {
        setTimeSlots(timeSlots.filter(s => s.id !== id));
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            if (isMultiDay) {
                await axios.post(endpoint, { dates: days });
            } else {
                await axios.post(endpoint, {
                    timeIntervals: timeSlots.map(s => ({
                        from: s.from.toISOString(),
                        to: s.to.toISOString()
                    }))
                });
            }
            console.log(days, timeSlots);
            notify.info("Preferences saved");
            onSubmit();
            onClose();

        } catch {
            notify.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div
                ref={scrollContainerRef}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >

                <div className="p-6 border-b flex justify-between">
                    <h2 className="text-xl font-semibold flex gap-2 items-center">
                        <Clock className="w-5 h-5" />
                        {isMultiDay ? "Select Days" : "Select Times"}
                    </h2>

                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {error && (
                        <div className="text-red-600">{error}</div>
                    )}

                    {isMultiDay ? (

                        <div className="space-y-2">

                            {getDaysInRange().map(day => {

                                const checked = days.includes(day);

                                return (
                                    <label key={day} className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleDay(day)}
                                        />
                                        {new Date(day).toLocaleDateString()}
                                    </label>
                                );
                            })}

                        </div>

                    ) : (

                        <>
                            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Allowed range: </span>
                                {new Date(timeRangeFrom).toLocaleString(undefined, {
                                    month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit"
                                })}
                                {" → "}
                                {new Date(timeRangeTo).toLocaleString(undefined, {
                                    month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit"
                                })}
                                <span className="ml-2 text-xs text-gray-400">(Single day =&gt; max 24h per slot)</span>
                            </div>

                            <button
                                onClick={addTimeSlot}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Slot
                            </button>

                            {(() => {
                                const slotErrors = getSlotErrors();
                                return timeSlots.map(slot => (
                                    <div key={slot.id} className="space-y-1">
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="datetime-local"
                                                min={toLocalDateTimeString(new Date(timeRangeFrom))}
                                                max={toLocalDateTimeString(new Date(timeRangeTo))}
                                                value={toLocalDateTimeString(slot.from)}
                                                onChange={e => updateTimeSlot(slot.id, "from", e.target.value)}
                                                className={`border rounded px-2 py-1 ${slotErrors[slot.id] ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            <span className="text-gray-400">→</span>
                                            <input
                                                type="datetime-local"
                                                min={toLocalDateTimeString(slot.from)}
                                                max={toLocalDateTimeString(
                                                    new Date(Math.min(
                                                        slot.from.getTime() + 24 * 60 * 60 * 1000,
                                                        new Date(timeRangeTo).getTime()
                                                    ))
                                                )}
                                                value={toLocalDateTimeString(slot.to)}
                                                onChange={e => updateTimeSlot(slot.id, "to", e.target.value)}
                                                className={`border rounded px-2 py-1 ${slotErrors[slot.id] ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            <button onClick={() => removeTimeSlot(slot.id)}>
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </button>
                                        </div>
                                        {slotErrors[slot.id] && (
                                            <p className="text-red-500 text-sm ml-1">{slotErrors[slot.id]}</p>
                                        )}
                                    </div>
                                ));
                            })()}

                        </>

                    )}

                    <div className="flex gap-3 pt-4 border-t">

                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 py-2 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 text-white py-2 rounded"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}