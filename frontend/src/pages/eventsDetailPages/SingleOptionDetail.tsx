import { useState, useEffect, useCallback } from "react";
import { MapPin, Clock } from "lucide-react";
import axios from "../../api/axios";
import Event from "../../types/event";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";

interface Props {
  event: Event;
  eventId: string;
}

/**
 * Event detail page for "Simple Event" mode.
 * Organizer has already decided the time and place.
 * Participants just view and confirm attendance (no voting).
 *
 * @param event - Full event object with fixed time and place
 * @param eventId - The event ID for API calls
 * @returns The simple event detail page
 */
export default function SingleOptionDetail({ event, eventId }: Props) {
  const [participants, setParticipants] = useState([]);

  /**
   * Loads the participant list from the backend.
   */
  const loadData = useCallback(async () => {
    try {
      const participantsRes = await axios.get(
        `/events/${eventId}/participants`,
      );
      setParticipants(participantsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, [eventId]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const from = new Date(event.fixedTimeFrom!);
  const to = new Date(event.fixedTimeTo!);
  const isSameDay = from.toDateString() === to.toDateString();
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  /**
   * Formats a time to HH:MM format
   */
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="max-w-7xl mx-auto px-6 dark:bg-gray-900">
        {/* Participants list */}
        <ParticipantsList participants={participants} />

        {/* Proposal phase - show fixed details */}
        {event.phase === "Proposal" && (
          <>
            {/* Event details card with location and time */}
            <div className="mb-6 grid grid-cols-1 gap-6">
              {/* Location card */}
              <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <MapPin className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                    Location
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {event.fixedPlaceName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.fixedAddress}
                  </p>
                </div>
              </div>

              {/* Time card */}
              <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Clock className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                <div className="flex flex-col w-full">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">
                    Time
                  </p>

                  <div className="text-gray-900 dark:text-white">
                    {isSameDay ? (
                      <div className="flex flex-col sm:flex-row sm:gap-2 sm:items-baseline">
                        <span className="text-lg font-bold capitalize">
                          {formatDate(from)}
                        </span>
                        <div className="flex items-center gap-1.5 text-lg">
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {formatTime(from)}
                          </span>
                          <span className="text-gray-400">–</span>
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {formatTime(to)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatDate(from)}</span>
                          <span className="text-gray-500">
                            {formatTime(from)}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm pl-4">until</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatDate(to)}</span>
                          <span className="text-gray-500">
                            {formatTime(to)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Closed phase - show final confirmation */}
        {event.phase === "Closed" && event.finalPlaceName && (
          <FinalResult event={event} />
        )}
      </div>
    </EventDetailLayout>
  );
}
