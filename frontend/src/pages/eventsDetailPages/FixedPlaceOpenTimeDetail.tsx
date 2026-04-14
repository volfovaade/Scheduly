import { useState, useEffect, useCallback } from "react";
import { MapPin, Clock, Calendar, CheckCircle2, TriangleAlert } from "lucide-react";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { useNotification } from "../../context/NotificationContext";
import TimePreferenceForm from "../../components/TimePreferenceForm";
import axios from "../../api/axios";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";
import TimeHeatmap from "../../components/sharedDetailPage/TimeHeatmap";

interface Props {
  event: any;
  eventId: string;
  onReload: () => void;
  showPreferenceFormInitially: boolean;
}

export default function FixedPlaceOpenTimeDetail({
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
  const [timeSummary, setTimeSummary] = useState<any[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [duration, setDuration] = useState(2);

  const loadData = useCallback(async () => {
    try {
      const [participantsRes, summaryRes, myPrefRes] = await Promise.all([
        axios.get(`/events/${eventId}/participants`),
        axios.get(`/events/${eventId}/timePreferences/summary`),
        axios.get(`/events/${eventId}/timePreferences/my`),
      ]);

      setParticipants(participantsRes.data);
      setTimeSummary(summaryRes.data?.time ?? []);
      const myPref = myPrefRes.data;
      const submitted = event.isMultiDay
        ? myPref?.time?.dates?.length > 0
        : myPref?.timeIntervals?.length > 0;
      setHasSubmitted(submitted);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, [eventId, event.isMultiDay]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDaysInTimeRange = () => {
    const from = new Date(event.timeRangeFrom);
    const to = new Date(event.timeRangeTo);
    const diffDays = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays;
  };

  const handleFinalize = async () => {
    if (!window.confirm("Find the best time based on everyone's availability?"))
      return;

    setFinalizing(true);
    try {
      await axios.post(
        `/events/${eventId}/finalizeFixedPlaceOpenTime`,
        { duration: duration },
      );
      onReload();
      notify.info("Best time found! Event is now closed.");
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
  const best = timeSummary?.length
    ? timeSummary.reduce((prev, current) =>
        current.count > prev.count ? current : prev,
      )
    : null;

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
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Fixed Event Location
                </h3>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.fixedPlaceName}
                  </p>
                  {event.fixedAddress && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                      <MapPin size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
                      <span>{event.fixedAddress}</span>
                    </p>
                  )}
                </div>
              </div>
              {/* Preference Submission */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Submit Your Time Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add all time slots when you're available. We'll find the time
                  that works best for everyone.
                </p>

                {hasSubmitted ? (
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
                  onClick={() => setShowPreferenceForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {hasSubmitted ? "Edit" : "Add"} Time Preferences
                </button>
              </div>

              {/* Time Summary */}
              {timeSummary && timeSummary.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Time Preference
                  </h3>
                  <TimeHeatmap
                    data={timeSummary}
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

              {/* Organizer Actions */}
              {event.currentUserIsOrganizer && timeSummary.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-800/20 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Find the Best Time?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click below to calculate the optimal time based on
                    everyone's availability. The event will be automatically
                    finalized.
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
                  <button
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="w-full bg-gradient-to-r from-pink-800 to-pink-600 hover:from-pink-900 hover:to-pink-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {finalizing
                      ? "Finding Best Time..."
                      : "Find Best Time & Close Event"}
                  </button>
                </div>
              )}
            </>
          )}

          {event.phase === "Closed" && event.finalTimeFrom && event.finalTimeTo &&
              < FinalResult event={event} />}

          {showPreferenceForm && event.phase === "Proposal" && (
            <TimePreferenceForm
              eventId={eventId}
              timeRangeFrom={event.timeRangeFrom}
              timeRangeTo={event.timeRangeTo}
              isMultiDay={event.isMultiDay}
              onClose={() => setShowPreferenceForm(false)}
              onSubmit={loadData}
            />
          )}
        </div>
      </div>
    </EventDetailLayout>
  );
}
