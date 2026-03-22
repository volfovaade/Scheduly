import { useState, useEffect, useCallback } from "react";
import { MapPin, Clock } from "lucide-react";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { useNotification } from "../../context/NotificationContext";
import LocationPreferenceForm from "../../components/LocationPreferenceForm";
import FinalVotingForm from "../../components/FinalVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";
import axios from "../../api/axios";

interface Props {
  event: any;
  eventId: string;
  onReload: () => void;
  showPreferenceFormInitially: boolean;
}
type LocationSummary = {
  totalSubmissions: number;
  averageLatitude: number;
  averageLongitude: number;
  typeCounts: { type: string; count: number }[];
};
export default function FixedTimeOpenPlaceDetail({
  event,
  eventId,
  onReload,
  showPreferenceFormInitially,
}: Props) {
  const notify = useNotification();
  const [participants, setParticipants] = useState([]);
  const [showPreferenceForm, setShowPreferenceForm] = useState(
    showPreferenceFormInitially,
  );
  const [locationSummary, setLocationSummary] = useState<LocationSummary>({
    totalSubmissions: 0,
    averageLatitude: 0,
    averageLongitude: 0,
    typeCounts: [],
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [tieData, setTieData] = useState<{
    hasTie: boolean;
    tiedTypes: string[];
    topType: string;
  } | null>(null);
  const [organizerChoice, setOrganizerChoice] = useState<string | null>(null);

  const checkForTie = useCallback(async () => {
    try {
      const res = await axios.get(
        `/events/${eventId}/locationPreferences/topTypes`,
      );
      setTieData(res.data);
      if (!res.data.hasTie) setOrganizerChoice(res.data.topType);
    } catch (err) {
      console.error("Failed to check for tie:", err);
    }
  }, [eventId]);

  const loadData = useCallback(async () => {
    try {
      const [participantsRes, summaryRes, myPrefRes] = await Promise.all([
        axios.get(`/events/${eventId}/participants`),
        axios.get(`/events/${eventId}/locationPreferences/summary`),
        axios.get(`/events/${eventId}/locationPreferences/my`),
      ]);

      setParticipants(participantsRes.data);
      setLocationSummary(summaryRes.data);
      await checkForTie();
      setHasSubmitted(!!myPrefRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, [eventId, checkForTie]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFinalize = async () => {
    if (!window.confirm("Generate 3 best place options from user preferences?"))
      return;

    setFinalizing(true);
    try {
      await axios.post(`/events/${eventId}/finalizeFixedTimeOpenPlace`, {
        organizerPlaceTypeChoice: organizerChoice,
      });
      onReload();
      notify.info("Places generated! Voting phase started.");
    } catch (err: any) {
      const data = err.response?.data;
      const message =
        typeof data === "string"
          ? data
          : (data?.title ?? data?.detail ?? "Failed to finalize");
      notify.error(message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <ParticipantsList participants={participants} />

          {event.phase === "Proposal" && (
            <>
              {/* Event Info Card */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Fixed Event Time
                </h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    📅 Event will take place at:
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.fixedTimeFrom &&
                      new Date(event.fixedTimeFrom).toLocaleString("en-US", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Duration:{" "}
                    {event.fixedTimeFrom &&
                      event.fixedTimeTo &&
                      Math.round(
                        (new Date(event.fixedTimeTo).getTime() -
                          new Date(event.fixedTimeFrom).getTime()) /
                          (1000 * 60 * 60),
                      )}{" "}
                    hours
                  </p>
                </div>
              </div>

              {/* Preference Submission */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Submit Your Location Preference
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select where you'd like the event to take place. We'll
                  generate the 3 best options based on everyone's preferences.
                </p>

                {hasSubmitted ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      ✓ You've submitted your location preference
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                    <p className="text-yellow-800 dark:text-yellow-300">
                      ⚠️ You haven't submitted your preference yet
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowPreferenceForm(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {hasSubmitted ? "Edit" : "Add"} Location Preference
                </button>
              </div>

              {/* Organizer Actions */}
              {event.currentUserIsOrganizer &&
                locationSummary.totalSubmissions > 0 && (
                  <div className="mb-8 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-800/20 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      Ready to Generate Places?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {locationSummary.totalSubmissions} participant
                      {locationSummary.totalSubmissions !== 1 && "s"} submitted
                      their preferences. Click below to generate 3 optimal
                      locations and start voting.
                    </p>
                    {/* Tie-breaker UI */}
                    {tieData?.hasTie && (
                      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-3">
                          ⚖️ There's a tie! Please choose which place type to
                          use:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tieData.tiedTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => setOrganizerChoice(type)}
                              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                organizerChoice === type
                                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700"
                                  : "border-gray-300 hover:border-pink-400"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleFinalize}
                      disabled={
                        finalizing || (tieData?.hasTie && !organizerChoice)
                      }
                      className="w-full bg-gradient-to-r from-pink-800 to-pink-600 hover:from-pink-900 hover:to-pink-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {finalizing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating Places...
                        </span>
                      ) : (
                        "Generate Places & Start Voting"
                      )}
                    </button>
                  </div>
                )}
            </>
          )}

          {event.phase === "FinalVoting" && (
            <>
              <FinalVotingForm eventId={eventId} />
            </>
          )}

          {event.phase === "Closed" && <FinalResult event={event} />}

          {showPreferenceForm && event.phase === "Proposal" && (
            <LocationPreferenceForm
              eventId={eventId}
              onClose={() => setShowPreferenceForm(false)}
              onSubmit={loadData}
            />
          )}
        </div>
      </div>
    </EventDetailLayout>
  );
}
