// components/AddOptionForm.tsx
import { useState, useRef } from "react";
import { MapPin, Clock, X, ArrowRight } from "lucide-react";
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

export default function AddOptionForm({
  eventId,
  event,
  onSubmit,
  onClose,
  isOpen,
}: Props) {
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [timeFrom, setTimeFrom] = useState<Date | null>(null);
  const [timeTo, setTimeTo] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const validateTimeRange = (from: Date | null, to: Date | null): string => {
    if (!from || !to) return "Please fill in both start and end time";
    if (from >= to) return "Start time must be before end time";
    const diffInHours = (to.getTime() - from.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 0.5) return "Duration must be at least 30 minutes";
    if (event.isMultiDay && diffInHours < 24)
      return "Time range must be at least 24 hours for multiple day events";
    if (!event.isMultiDay && diffInHours > 24)
      return "Time range cannot exceed 24 hours for single day events";
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
        id: "",
        placeName: placeName.trim(),
        address: address.trim() || "",
        timeFrom: timeFrom.toISOString(),
        timeTo: timeTo.toISOString(),
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        ref={scrollContainerRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex gap-2 items-center text-gray-900 dark:text-white">
            <MapPin className="w-5 h-5" />
            Add Option
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Place name *
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g., Café Na Rohu"
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2
                         focus:ring-pink-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">{placeName.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Karlovo náměstí 5, Praha 2"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2
                         focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time *
            </label>

            {event.timeRangeFrom && event.timeRangeTo && (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600 mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Allowed range:{" "}
                </span>
                {new Date(event.timeRangeFrom).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" → "}
                {new Date(event.timeRangeTo).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="datetime-local"
                value={formatDateTime(timeFrom)}
                onChange={(e) => setTimeFrom(new Date(e.target.value))}
                min={event.timeRangeFrom ? formatDateTime(new Date(event.timeRangeFrom)) : undefined}
                max={event.timeRangeTo ? formatDateTime(new Date(event.timeRangeTo)) : undefined}
                className="flex-1 border border-gray-300 dark:border-gray-600
                          dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2
                          [color-scheme:light] dark:[color-scheme:dark]"
              />
              <span className="hidden sm:flex items-center text-gray-400 text-sm"><ArrowRight /></span>
              <input
                type="datetime-local"
                value={formatDateTime(timeTo)}
                onChange={(e) => setTimeTo(new Date(e.target.value))}
                min={timeFrom ? formatDateTime(timeFrom) : undefined}
                max={event.timeRangeTo ? formatDateTime(new Date(event.timeRangeTo)) : undefined}
                className="flex-1 border border-gray-300 dark:border-gray-600
                          dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2
                          [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {event.isMultiDay ? "Min. 24 hours duration" : "Min. 30 minutes, max. 24 hours"}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { handleReset(); onClose(); }}
              disabled={loading}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg
                         font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}