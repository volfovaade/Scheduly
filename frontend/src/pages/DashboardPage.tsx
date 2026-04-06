import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import EventCreationForm from "../components/EventCreationForm";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import EventCard from "../components/EventCard";
import { Search, Target, Users, Info, X } from "lucide-react";

type EventMode =
  | "SingleOption"
  | "CollaborativeOptions"
  | "OrganizerOptions"
  | "FixedTimeOpenPlace"
  | "FixedPlaceOpenTime"
  | "FullyOpen";

type Event = {
  id: string;
  title: string;
  code: string;
  description: string;
  ownerId: string;
  mode: EventMode;
  isMultiDay: boolean;
};

export default function DashboardPage() {
  const [organized, setOrganized] = useState<Event[]>([]);
  const [participating, setParticipating] = useState<Event[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const notify = useNotification();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Add filtered lists before return
  const filteredOrganized = organized.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParticipating = participating.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("events/my");
        setOrganized(res.data.filter((e: any) => e.ownerId === user!.id));
        setParticipating(res.data.filter((e: any) => e.ownerId !== user!.id));
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isAuthenticated, user, navigate]);

  const handleAddEvent = async (data: any) => {
    try {
      const res = await axios.post("events", {
        title: data.title,
        description: data.description,
        mode: data.mode,
        isMultiDay: data.isMultiDay,
        constraint: getConstraintType(data.mode),
        timeRangeFrom: data.timeRangeFrom,
        timeRangeTo: data.timeRangeTo,
        fixedPlaceName: data.fixedPlace,
        fixedAddress: data.fixedAddress,
        fixedTimeFrom: data.fixedTimeFrom,
        fixedTimeTo: data.fixedTimeTo,
        allowParticipantOptions: data.allowParticipantOptions,
        maxOptionsPerUser: 3,
      });
      setOrganized((prev) => [...prev, res.data]);
      navigateToEvent(res.data.id, data.mode);
    } catch (err) {
      notify.error("Event creation failed.");
      console.error(err);
    }
  };

  const getConstraintType = (mode: EventMode): number => {
    switch (mode) {
      case "CollaborativeOptions":
      case "OrganizerOptions":
      case "FullyOpen":
        return 1; // TimeRange
      case "FixedPlaceOpenTime":
        return 2; // FixedPlace - include time range
      case "FixedTimeOpenPlace":
        return 3; // FixedTime - include time range
      case "SingleOption":
        return 0; // None
      default:
        return 0; // None
    }
  };
  const navigateToEvent = (
    id: string,
    mode: EventMode,
    showPreferenceForm = true,
  ) => {
    const query = showPreferenceForm ? "?showPreferenceForm=true" : "";
    switch (mode) {
      case "SingleOption":
      case "CollaborativeOptions":
      case "OrganizerOptions":
        // no preference form needed, will vote on the page detail
        navigate(`/events/${id}`);
        break;
      case "FixedTimeOpenPlace":
      case "FixedPlaceOpenTime":
      case "FullyOpen":
        // Events requiring preferences
        navigate(`/events/${id}${query}`);
        break;
      default:
        navigate(`/events/${id}`);
    }
  };
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`events/${eventId}`);
      setOrganized((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      notify.error("Failed to delete event");
      console.error(err);
    }
    ///// !!!!!!!!!!!!! pri delete bude potreba informovat lidi
    // ze se akce rusi
  };
  const handleLeaveEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to leave this event?")) return;

    try {
      await axios.delete(`events/${eventId}/participants/leave`);
      setParticipating((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      notify.error("Failed to leave event");
      console.error(err);
    }
  };
  const handleGoToDetail = (id: string, mode: EventMode) => {
    // when going from dashboard not the creation
    // we do not need preferece form to be shown -> false
    navigateToEvent(id, mode, false);
  };

  // Get display name for event mode
  const getModeName = (mode: EventMode): string => {
    const names: Record<EventMode, string> = {
      SingleOption: "Simple",
      CollaborativeOptions: "Collaborative",
      OrganizerOptions: "Organizer Choice",
      FixedTimeOpenPlace: "Fixed Time",
      FixedPlaceOpenTime: "Fixed Place",
      FullyOpen: "Fully Open",
    };
    return names[mode] || mode;
  };
  // loading component
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            My Events
          </h2>
          <button
            onClick={() => setShowInfo(true)}
            className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            title="How does it work?"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="pl-9 pr-4 py-2 w-full sm:w-48 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
          <button
            className="bg-gradient-to-r from-pink-600 to-pink-800 text-white px-4 py-2 sm:px-6 sm:py-3
                      rounded-lg hover:from-pink-700 hover:to-pink-900 font-medium transition-all
                      shadow-lg hover:shadow-xl whitespace-nowrap text-sm sm:text-base"
            onClick={() => setShowDialog(true)}
          >
            + Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900 dark:text-gray-50">
        {/* Participating */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="text-blue-500" size={24} /> Participating
            <span className="text-sm font-normal text-gray-500">
              ({filteredParticipating.length})
            </span>
          </h3>
          {filteredParticipating.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
              <p>You're not participating in any events yet.</p>
              <p className="text-sm mt-2">Join an event using a code!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParticipating.map((e) => (
                <EventCard
                  key={e.id}
                  id={e.id}
                  title={e.title}
                  code={e.code}
                  mode={getModeName(e.mode)}
                  isMultiDay={e.isMultiDay}
                  onClick={() => handleGoToDetail(e.id, e.mode)}
                  onAction={() => handleLeaveEvent(e.id)}
                  icon="leave"
                />
              ))}
            </div>
          )}
        </div>

        {/* Organizing */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="text-pink-500" size={24} /> Organizing
            <span className="text-sm font-normal text-gray-500">
              ({filteredOrganized.length})
            </span>
          </h3>
          {filteredOrganized.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
              <p>You haven't created any events yet.</p>
              <p className="text-sm mt-2">Click "Add Event" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrganized.map((e) => (
                <EventCard
                  key={e.id}
                  id={e.id}
                  title={e.title}
                  code={e.code}
                  mode={getModeName(e.mode)}
                  isMultiDay={e.isMultiDay}
                  onClick={() => handleGoToDetail(e.id, e.mode)}
                  onAction={() => handleDeleteEvent(e.id)}
                  icon="delete"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <EventCreationForm
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onCreate={handleAddEvent}
      />
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInfo(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                How to use My Events
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                <p>Create a new event by clicking <strong className="text-gray-900 dark:text-white">+ Add Event</strong> and choose the type that suits your needs.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                <p>Share the <strong className="text-gray-900 dark:text-white">6-character code</strong> shown on each event card with your friends or colleagues.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                <p>Participants enter the code on the home page to join. You can also copy it directly using the copy icon on the event card.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">4</span>
                <p>Once everyone submits their preferences, close voting and let the app find the best time and place.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={() => { setShowInfo(false); navigate("/how-to-use"); }}
                className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
              >
                Full guide →
              </button>
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}    
    </div>
  );
}
