import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import {
  Trash2,
  Filter,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

type AdminEvent = {
  id: string;
  title: string;
  createdAt: string;
  participantCount: number;
  ownerId: string;
};

export default function DataCleanupPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [daysThreshold, setDaysThreshold] = useState(365);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/admin/events/cleanup?daysOld=${daysThreshold}`,
      );
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      notify.error("Failed to load events for cleanup.");
    } finally {
      setLoading(false);
    }
  }, [daysThreshold, notify]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDeleteSingle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this specific event?"))
      return;
    try {
      await axios.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      notify.success("Event deleted successfully.");
    } catch (err) {
      notify.error("Failed to delete event.");
    }
  };

  const handleDeleteAll = async () => {
    const count = events.length;
    if (count === 0) return;

    const confirmMsg = `WARNING: You are about to DELETE ${count} events older than ${daysThreshold} days. This action cannot be undone. Are you sure?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`/admin/events/cleanup?daysOld=${daysThreshold}`);
      setEvents([]); // Clear list
      notify.success(`Successfully deleted ${count} events.`);
    } catch (err) {
      notify.error("Bulk delete failed.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-pink-700" />
          Data Clean Up
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage system storage by removing outdated events. Be careful, these
          actions are irreversible.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 justify-between">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show events older than (days)
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-xs">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={daysThreshold}
                  onChange={(e) => setDaysThreshold(Number(e.target.value))}
                  className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <button
                onClick={loadEvents}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* Danger Button */}
          {events.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="w-full md:w-auto px-6 py-2.5 bg-red-50 text-red-700 border border-red-200
                             hover:bg-red-100 hover:border-red-300 rounded-lg transition-all flex items-center justify-center gap-2 font-medium
                             dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/40"
            >
              <Trash2 className="w-4 h-4" />
              Delete All {events.length} Events
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Found Events ({events.length})
          </h3>
          <button
            onClick={loadEvents}
            title="Refresh"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No events found older than {daysThreshold} days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-3">Event Title</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3">Participants</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{event.participantCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteSingle(event.id)}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete this event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
