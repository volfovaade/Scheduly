import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../context/NotificationContext";
import { Calendar, MapPin, TriangleAlert, CheckCircle2, Scale } from "lucide-react";
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
  showPreferenceFormInitially: boolean;
};

export default function FullyOpenDetail({
  event,
  eventId,
  showPreferenceFormInitially,
}: Props) {
  const notify = useNotification();
  const [participants, setParticipants] = useState([]);
  const [showLocationPreferenceForm, setShowLocationPreferenceForm] = useState(false);
  const [showTimePreferenceForm, setShowTimePreferenceForm] = useState(false);
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
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  const checkForTie = useCallback(async () => {
    try {
      const res = await axios.get(`/events/${eventId}/locationPreferences/topTypes`);
      setTieData(res.data);
      if (!res.data.hasTie) setOrganizerChoice(res.data.topType);
    } catch (err) {
      console.error("Failed to check for tie:", err);
    }
  }, [eventId]);

  const loadData = useCallback(async () => {
    try {
      const [participantsRes, prefsRes, summaryRes] = await Promise.all([
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
  }, [eventId, checkForTie]);

  useEffect(() => {
    loadData();
    // open forms initially if redirected from creation
    if (showPreferenceFormInitially) {
      setShowTimePreferenceForm(true);
    }
  }, [loadData, showPreferenceFormInitially]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ParticipantsList participants={participants} />

          {event.phase === "Proposal" && (
            <>
              {/* Time preference card */}
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Submit Your Time Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add all time slots when you're available within the event's time range.
                </p>

                {hasTimePref ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <span className="text-sm">You've submitted your time preferences</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <TriangleAlert size={18} className="shrink-0" />
                      <span className="text-sm">You haven't submitted your time preferences yet</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowTimePreferenceForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {hasTimePref ? "Edit" : "Add"} Time Preferences
                </button>
              </div>

              {/* Location preference card */}
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Submit Your Location Preference
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select where you'd like the event to take place.
                </p>

                {hasLocationPref ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <span className="text-sm">You've submitted your location preference</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <TriangleAlert size={18} className="shrink-0" />
                      <span className="text-sm">You haven't submitted your location preference yet</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowLocationPreferenceForm(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {hasLocationPref ? "Edit" : "Add"} Location Preference
                </button>
              </div>

              {summary?.time && summary.time.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Time Preference Overview
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

              {/* Organizer finalize */}
              {event.currentUserIsOrganizer && (
                <div className="mb-6 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-800/20 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Generate Options?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click below to generate the best place and time combinations
                    from everyone's preferences and start voting.
                  </p>

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

                  {tieData?.hasTie && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 font-medium mb-3">
                        <Scale size={20} className="shrink-0" />
                        <p>There's a tie! Please choose which place type to use:</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tieData.tiedTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setOrganizerChoice(type)}
                            className={`px-4 py-2 rounded-lg border-2 dark:text-gray-300 font-medium transition-all ${
                              organizerChoice === type
                                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700"
                                : "border-gray-300 dark:border-gray-600 hover:border-pink-400"
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
                    disabled={finalizing || (tieData?.hasTie && !organizerChoice)}
                    className="w-full bg-gradient-to-r from-pink-800 to-pink-600 hover:from-pink-900 hover:to-pink-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {finalizing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

          {event.phase === "Closed" && event.finalPlaceName && (
            <FinalResult event={event} />
          )}
        </div>
      </div>

      {showTimePreferenceForm && event.phase === "Proposal" && (
        <TimePreferenceForm
          eventId={eventId}
          timeRangeFrom={event.timeRangeFrom}
          timeRangeTo={event.timeRangeTo}
          apiEndpoint={`/events/${eventId}/fullyOpenPreferences/time`}
          isMultiDay={event.isMultiDay}
          onClose={() => setShowTimePreferenceForm(false)}
          onSubmit={loadData}
        />
      )}

      {showLocationPreferenceForm && event.phase === "Proposal" && (
        <LocationPreferenceForm
          eventId={eventId}
          apiEndpoint={`/events/${eventId}/fullyOpenPreferences/location`}
          onClose={() => setShowLocationPreferenceForm(false)}
          onSubmit={loadData}
        />
      )}
    </EventDetailLayout>
  );
}