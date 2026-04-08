import { useEffect, useState, useCallback } from "react";
import { Pencil, Check, X, Info, Copy } from "lucide-react";
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
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [copied, setCopied] = useState(false);

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
        <div className="px-4 sm:px-6 py-4">
          
          {/* Top row — back button + action buttons */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 whitespace-nowrap"
            >
              ← Back
            </button>

            <div className="flex gap-2">
              {event.currentUserIsOrganizer && event.phase === "Proposal" &&
                !["FixedTimeOpenPlace", "FullyOpen", "FixedPlaceOpenTime"].includes(event.mode) && (
                <button
                  onClick={handleCloseEvent}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700
                            text-white text-sm rounded-lg font-medium
                            hover:from-green-700 hover:to-green-800 transition-all shadow-sm whitespace-nowrap"
                >
                  Close Voting
                </button>
              )}
              {event.currentUserIsOrganizer && event.phase === "FinalVoting" && (
                <button
                  onClick={handleCloseEvent}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700
                            text-white text-sm rounded-lg font-medium
                            hover:from-green-700 hover:to-green-800 transition-all shadow-sm whitespace-nowrap"
                >
                  Close Event
                </button>
              )}
            </div>
          </div>

          {/* Title + description */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {event.title}
          </h1>

          <div className="relative mt-2 group">
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
                    <Check size={16} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {event.description ? (
                  <p className="text-gray-600 dark:text-gray-300 pr-8">{event.description}</p>
                ) : (
                  <p className="text-gray-400 italic pr-8">No description provided.</p>
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

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3 text-sm items-center">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1.5">
              Code: {event.code}
              <button
                onClick={() => setShowShareInfo(true)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="How to share"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className={`px-3 py-1 rounded-full ${
              event.phase === "Closed"
                ? "bg-gray-100 text-gray-700"
                : event.phase === "FinalVoting"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}>
              {event.phase}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {getModeLabel(event.mode)}
            </span>
          </div>

          {/* Share info modal */}
          {showShareInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareInfo(false)} />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invite participants
                  </h3>
                  <button
                    onClick={() => setShowShareInfo(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>Share this event code with anyone you want to invite:</p>

                  {/* Code display with copy */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                    <span className="text-2xl font-mono font-bold tracking-widest text-gray-900 dark:text-white flex-1 text-center">
                      {event.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(event.code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Participants enter this code on the home page to join the event.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <button
                    onClick={() => { setShowShareInfo(false); navigate("/how-to-use"); }}
                    className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
                  >
                    Full guide →
                  </button>
                  <button
                    onClick={() => setShowShareInfo(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {event.phase === "Closed" && event.cancelledReason && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {event.cancelledReason}
          </div>
        </div>
      )}
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
