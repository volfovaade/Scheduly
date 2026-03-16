import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../context/NotificationContext";
import { Calendar, MapPin } from "lucide-react";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import axios from "../../api/axios";
import LocationPreferenceForm from "../../components/LocationPreferenceForm";
import TimePreferenceForm from "../../components/TimePreferenceForm";
import GenericVotingForm, {
  VoteOption,
} from "../../components/sharedDetailPage/GenericVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";
import TimeHeatmap from "../../components/sharedDetailPage/TimeHeatmap";

type Props = {
  event: any;
  eventId: string;
  onClose: () => void;
  showPreferenceFormInitially: boolean;
};

export default function FullyOpenDetail({
  event,
  eventId,
  onClose,
  showPreferenceFormInitially,
}: Props) {
  const notify = useNotification();
  const [participants, setParticipants] = useState([]);
  const [showLocationPreferenceForm, setShowLocationPreferenceForm] = useState(
    showPreferenceFormInitially,
  );
  const [showTimePreferenceForm, setShowTimePreferenceForm] = useState(
    showPreferenceFormInitially,
  );
  const [summary, setSummary] = useState<any>(null);
  const [duration, setDuration] = useState(2);
  const [hasLocationPref, setHasLocationPref] = useState(false);
  const [hasTimePref, setHasTimePref] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [tieData, setTieData] = useState<{
    hasTie: boolean;
    tiedTypes: string[];
  } | null>(null);
  const [organizerChoice, setOrganizerChoice] = useState<string | null>(null);

  const getDaysInTimeRange = () => {
    const from = new Date(event.timeRangeFrom);
    const to = new Date(event.timeRangeTo);
    const diffDays = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays;
  };
  const checkForTie = async () => {
    try {
      const res = await axios.get(
        `/events/${eventId}/locationPreferences/topTypes`,
      );
      setTieData(res.data);
      console.log("Tie data:", res.data);
      if (!res.data.hasTie) setOrganizerChoice(res.data.topType);
    } catch (err) {
      console.error("Failed to check for tie:", err);
    }
  };
  const loadData = useCallback(async () => {
    try {
      const [participantsRes, prefsRes, summaryRes] =
        await Promise.all([
          axios.get(`/events/${eventId}/participants`),
          axios.get(`/events/${eventId}/fullyOpenPreferences/my`),
          axios.get(`/events/${eventId}/fullyOpenPreferences/summary`),
        ]);

      setParticipants(participantsRes.data);
      setHasLocationPref(!!prefsRes.data.location);
      setHasTimePref(!!prefsRes.data.time);
      setSummary(summaryRes.data);
      await checkForTie();
    } catch (err) {
      console.error(err);
    }
  }, [eventId, event.isMultiDay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFinalize = async () => {
    if (!window.confirm("Finalize and generate place+time options?")) return;
    try {
      await axios.post(`/events/${eventId}/finalizeFullyOpen`, {
        duration: duration,
        organizerPlaceTypeChoice: organizerChoice,
      });
      window.location.reload();
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

  const best = summary?.time?.length
    ? summary.time.reduce((prev: any, current: any) =>
        current.count > prev.count ? current : prev,
      )
    : null;

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <ParticipantsList participants={participants} />
          {event.phase === "Proposal" && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Submit Your Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select your preferred location and available times
                </p>
                <div className="flex cols-1 gap-2 mb-4">
                  <div>
                    {hasTimePref && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ✓ Time submitted
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setShowTimePreferenceForm(!showTimePreferenceForm)
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium mt-3"
                    >
                      {showTimePreferenceForm ? "Hide" : "Edit"} Time
                      Preferences
                    </button>
                  </div>
                  <div>
                    {hasLocationPref && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ✓ Location submitted
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setShowLocationPreferenceForm(
                          !showLocationPreferenceForm,
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium mt-3"
                    >
                      {showLocationPreferenceForm ? "Hide" : "Edit"} Location
                      Preferences
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {showLocationPreferenceForm && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Location Preference
                      </h4>
                      <LocationPreferenceForm
                        eventId={eventId}
                        apiEndpoint={`/events/${eventId}/fullyOpenPreferences/location`}
                        onClose={() => setShowLocationPreferenceForm(false)}
                        onSubmit={loadData}
                      />
                    </div>
                  )}
                  {showTimePreferenceForm && (
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Time Preference
                      </h4>
                      <TimePreferenceForm
                        eventId={eventId}
                        timeRangeFrom={event.timeRangeFrom}
                        timeRangeTo={event.timeRangeTo}
                        apiEndpoint={`/events/${eventId}/fullyOpenPreferences/time`}
                        isMultiDay={event.isMultiDay}
                        onClose={() => setShowTimePreferenceForm(false)}
                        onSubmit={loadData}
                      />
                    </div>
                  )}
                </div>
              </div>

              {summary?.time && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Time Preference
                  </h3>

                  <TimeHeatmap
                    data={summary.time}
                    totalParticipants={participants.length}
                    isMultiDay={event.isMultiDay}
                  />

                  {best && (
                    <p className="mt-4 text-sm text-purple-700 dark:text-purple-300">
                      Most preferred: {best.day}{" "}
                      {event.isMultiDay ? undefined : `${best.hour}:00`} (
                      {best.count} votes)
                    </p>
                  )}
                </div>
              )}
              {event.currentUserIsOrganizer && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Finalize Event
                  </h3>
                  <label className="block mb-4">
                    <span className="text-gray-700 dark:text-gray-300">
                      Duration: {duration} {event.isMultiDay ? "days" : "hours"}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={event.isMultiDay ? getDaysInTimeRange() : 12}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </label>
                  {/* Tie-breaker UI */}
                  {tieData?.hasTie && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-3">
                        ⚖️ There's a tie! Please choose which place type to use:
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
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
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
            <GenericVotingForm
              eventId={eventId}
              title="Final Voting - Select Your Preferred Option"
              voteType="Final"
              filterOptions={(opt: VoteOption) => opt.source === "Generated"}
            />
          )}
          {event.phase === "FinalVoting" && event.currentUserIsOrganizer && (
            <button
              onClick={onClose}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              Close Event
            </button>
          )}
          {event.phase === "Closed" && event.finalPlaceName && (
            <FinalResult event={event} />
          )}
        </div>
      </div>
    </EventDetailLayout>
  );
}
