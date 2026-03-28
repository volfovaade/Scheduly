import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, X, Plus, Trash2, ArrowRight, ArrowDown } from "lucide-react";
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
  onSubmit,
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
      const diffInHours =
        (slot.to.getTime() - slot.from.getTime()) / (1000 * 60 * 60);
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
      timeSlots.map((slot) => {
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
      }),
    );
  };

  const loadPreference = useCallback(async () => {
    try {
      const res = await axios.get(`/events/${eventId}/timePreferences/my`);

      if (isMultiDay) {
        setDays(res.data?.time?.dates ?? []);
      } else if (res.data?.timeIntervals) {
        setTimeSlots(
          res.data.timeIntervals.map((i: any) => ({
            id: crypto.randomUUID(),
            from: new Date(i.from),
            to: new Date(i.to),
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, [eventId, isMultiDay]);

  useEffect(() => {
    loadPreference();
  }, [loadPreference]);

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
      setDays(days.filter((d) => d !== day));
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
        to: new Date(start.getTime() + 60 * 60 * 1000),
      },
    ]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isMultiDay) {
        await axios.post(endpoint, { dates: days });
      } else {
        await axios.post(endpoint, {
          timeIntervals: timeSlots.map((s) => ({
            from: s.from.toISOString(),
            to: s.to.toISOString(),
          })),
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
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex gap-2 items-center text-gray-900 dark:text-white">
            <Clock className="w-5 h-5" />
            {isMultiDay ? "Select Days" : "Select Times"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {isMultiDay ? (
            <div className="space-y-2">
              {getDaysInRange().map((day) => {
                const checked = days.includes(day);

                return (
                  <label key={day} className="flex gap-3 items-center text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDay(day)}
                      className="accent-blue-600"
                    />
                    {new Date(day).toLocaleDateString()}
                  </label>
                );
              })}
            </div>
          ) : (
            <>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Allowed range
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                  <span>
                    {new Date(timeRangeFrom).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                  <ArrowDown className="w-4 h-4 text-gray-400 sm:hidden" />
                  <span>
                    {new Date(timeRangeTo).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {!isMultiDay && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Max 24h per slot
                  </p>
                )}
              </div>

              <button
                onClick={addTimeSlot}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Slot
              </button>

              {(() => {
                const slotErrors = getSlotErrors();
                return timeSlots.map((slot) => (
                  <div key={slot.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="datetime-local"
                        min={toLocalDateTimeString(new Date(timeRangeFrom))}
                        max={toLocalDateTimeString(new Date(timeRangeTo))}
                        value={toLocalDateTimeString(slot.from)}
                        onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                        className={`flex-1 border rounded-lg px-3 py-2 text-sm
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white
                          [color-scheme:light] dark:[color-scheme:dark]
                          ${slotErrors[slot.id] ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                      />
                      <span className="hidden sm:flex items-center text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      <div className="flex gap-2 items-center">
                        <input
                          type="datetime-local"
                          min={toLocalDateTimeString(slot.from)}
                          max={toLocalDateTimeString(
                            new Date(Math.min(
                              slot.from.getTime() + 24 * 60 * 60 * 1000,
                              new Date(timeRangeTo).getTime(),
                            ))
                          )}
                          value={toLocalDateTimeString(slot.to)}
                          onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                          className={`flex-1 border rounded-lg px-3 py-2 text-sm
                            dark:bg-gray-700 dark:border-gray-600 dark:text-white
                            [color-scheme:light] dark:[color-scheme:dark]
                            ${slotErrors[slot.id] ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                        />
                        <button onClick={() => removeTimeSlot(slot.id)} className="flex-shrink-0">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {slotErrors[slot.id] && (
                      <p className="text-red-500 text-sm">{slotErrors[slot.id]}</p>
                    )}
                  </div>
                ));
              })()}
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
