import { useEffect, useState, useCallback } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import axios from "../api/axios";
import ErrorNotification from "../components/ErrorNotification";
import Event from "../types/event";

// Import of components for different event modes
import SingleOptionDetail from "./eventsDetailPages/SingleOptionDetail";
import CollaborativeOptionsDetail from "./eventsDetailPages/CollaborativeOptionsDetail";
import OrganizerOptionsDetail from "./eventsDetailPages/OrganizerOptionsDetail";
import FixedTimeOpenPlaceDetail from "./eventsDetailPages/FixedTimeOpenPlaceDetail";
import FixedPlaceOpenTimeDetail from "./eventsDetailPages/FixedPlaceOpenTimeDetail";
import FullyOpenDetail from "./eventsDetailPages/FullyOpenDetail";

type EventMode =
  | "SingleOption"
  | "CollaborativeOptions"
  | "OrganizerOptions"
  | "FixedTimeOpenPlace"
  | "FixedPlaceOpenTime"
  | "FullyOpen";
  
export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();
  const location = useLocation();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: "not-found" | "network" | "unauthorized" | "unknown";
    message: string;
  } | null>(null);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const showPreferenceFormInitially =
    new URLSearchParams(location.search).get("showPreferenceForm") === "true";

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError({
          type: "not-found",
          message:
            "Event wasn't found. Maybe it was deleted or you don't have permissions.",
        });
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError({
          type: "unauthorized",
          message: "You don't have permissions to view this event.",
        });
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        setError({
          type: "network",
          message: "Network connection problem. Please try later.",
        });
      } else {
        setError({
          type: "unknown",
          message: "Unexpected error occurred while loading the event.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleCloseEvent = async () => {
    if (!window.confirm("Are you sure you want to close the event?")) return;

    try {
      const response = await axios.post(`/events/${eventId}/close`);
      if (response.data.empty) {
        const confirmDelete = window.confirm(
          "No votes were submitted. Do you want to delete the event instead?",
        );
        if (confirmDelete) {
          await axios.delete(`/events/${eventId}`);
          navigate("/dashboard");
        }
        return;
      }
      await loadEvent(); // Reload to show closed state
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        notify.error("Event was not found.");
        navigate("/dashboard");
      } else {
        notify.error("Failed to close event.");
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`/events/${eventId}`);
      navigate("/dashboard");
    } catch (err) {
      notify.error("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg">Loading event detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorNotification error={error} />;
  }

  if (!event) return null;

  const handleSaveDescription = async () => {
    try {
      await axios.put(`/events/${eventId}/description`, {
        description: editedDescription,
      });
      setEvent({ ...event, description: editedDescription });
      setIsEditingDescription(false);
      notify.info("Description updated");
      await loadEvent(); // refresh to get any changes from the server
    } catch (err) {
      notify.error("Failed to update description");
    }
  };

  // Render appropriate component based on event mode
  const renderEventDetail = () => {
    const commonProps = {
      event,
      eventId: eventId!,
      onDelete: handleDeleteEvent,
      onReload: loadEvent,
      showPreferenceFormInitially,
    };

    switch (event.mode) {
      case "SingleOption":
        return <SingleOptionDetail {...commonProps} />;

      case "CollaborativeOptions":
        return <CollaborativeOptionsDetail {...commonProps} />;

      case "OrganizerOptions":
        return <OrganizerOptionsDetail {...commonProps} />;

      case "FixedTimeOpenPlace":
        return <FixedTimeOpenPlaceDetail {...commonProps} />;

      case "FixedPlaceOpenTime":
        return <FixedPlaceOpenTimeDetail {...commonProps} />;

      case "FullyOpen":
        return <FullyOpenDetail {...commonProps} />;

      default:
        return (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">Unknown event type: {event.mode}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* event header... common for all types */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-600">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h1>
              <div className="relative mt-3 group">
                {isEditingDescription ? (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-all">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={3}
                      className="w-full resize-none bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
                      placeholder="Enter event description..."
                    />

                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={handleSaveDescription}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        <Check size={16} />
                        Save
                      </button>

                      <button
                        onClick={() => setIsEditingDescription(false)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {event.description ? (
                      <p className="text-gray-600 dark:text-gray-300 pr-8">
                        {event.description}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic pr-8">
                        No description provided.
                      </p>
                    )}

                    {event.currentUserIsOrganizer && (
                      <button
                        onClick={() => {
                          setEditedDescription(event.description || "");
                          setIsEditingDescription(true);
                        }}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-blue-600"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Code: {event.code}
                </span>
                <span
                  className={`px-3 py-1 rounded-full ${
                    event.phase === "Closed"
                      ? "bg-gray-100 text-gray-700"
                      : event.phase === "FinalVoting"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {event.phase}
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {getModeLabel(event.mode)}
                </span>
              </div>
            </div>
            {/* right header side */}
            <div className="flex flex-col items-end gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 whitespace-nowrap"
              >
                ← Back to Dashboard
              </button>

              {event.currentUserIsOrganizer && event.phase === "Proposal" && 
                event.mode !== "FixedTimeOpenPlace" && event.mode !== "FullyOpen" && (
                <button
                  onClick={handleCloseEvent}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700
                            text-white text-sm rounded-lg font-medium
                            hover:from-green-700 hover:to-green-800 transition-all shadow-sm whitespace-nowrap"
                >
                Close Voting
                </button>
              )}

              {event.currentUserIsOrganizer && event.phase === "FinalVoting" && (
                <button
                  onClick={handleCloseEvent}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700
                            text-white text-sm rounded-lg font-medium
                            hover:from-green-700 hover:to-green-800 transition-all shadow-sm whitespace-nowrap"
                >
                Close Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* dynamic content based on event mode */}
      {renderEventDetail()}
    </div>
  );
}

function getModeLabel(mode: EventMode): string {
  const labels: Record<EventMode, string> = {
    SingleOption: "Simple Event",
    CollaborativeOptions: "Collaborative",
    OrganizerOptions: "Organizer Choice",
    FixedTimeOpenPlace: "Fixed Time",
    FixedPlaceOpenTime: "Fixed Place",
    FullyOpen: "Fully Open",
  };
  return labels[mode] || mode;
}
