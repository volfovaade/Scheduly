import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../context/NotificationContext";
import axios from "../../api/axios";
import AddOptionForm from "../../components/AddOptionForm";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import Option from "../../types/option";
import GenericVotingForm, {
  VoteOption,
} from "../../components/sharedDetailPage/GenericVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";

interface Props {
  event: any;
  eventId: string;
}

/**
 * Event detail page for "Organizer Proposals" event mode.
 * Only the organizer can add options (place + time combinations).
 * All participants vote on their preferred options.
 *
 * Voting phases:
 * - Proposal: Organizer adds options, participants vote on preferences
 * - Closed: Display final result
 *
 * @param event - Full event object with phase and other details
 * @param eventId - The event ID for API calls
 * @returns The event detail page with organizer proposals
 */
export default function OrganizerOptionsDetail({
  event,
  eventId,
}: Props) {
  const notify = useNotification();
  const [showAddForm, setShowAddForm] = useState(false);
  const [options, setOptions] = useState([]);
  const [participants, setParticipants] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [optionsRes, participantsRes] = await Promise.all([
        axios.get(`/events/${eventId}/options`),
        axios.get(`/events/${eventId}/participants`),
      ]);

      setOptions(optionsRes.data);
      setParticipants(participantsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handles adding a new option (place + time combination).
   * Only the organizer has permission to add options.
   *
   * @param optionData - The new option details
   */
  const handleAddOption = async (optionData: Option) => {
    try {
      await axios.post(`/events/${eventId}/options`, optionData);
      await loadData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        notify.warning("You don't have permission to add options");
      } else {
        notify.error("Failed to add option");
      }
    }
  };

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Participants */}
        <ParticipantsList participants={participants} />

        {/* Phase-specific content */}
        {event.phase === "Proposal" && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              {/* Add option button - only for organizer */}
              {event.currentUserIsOrganizer && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-auto px-6 bg-gradient-to-r from-pink-600 to-pink-800 text-white py-4 rounded-lg font-semibold mb-6"
                >
                  + Add Your Option
                </button>
              )}
            </div>
            <AddOptionForm
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
              onSubmit={handleAddOption}
              eventId={eventId}
              event={event}
            />
            <GenericVotingForm
              eventId={eventId}
              title="Option Preference Voting"
              voteType="Preference"
              providedOptions={options}
              filterOptions={(opt: VoteOption) => opt.source === "System"}
            />
            {options.length === 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
                <p>Organizer hasn't added any options yet.</p>
                <p className="text-sm mt-2">
                  Please refresh or check options later.
                </p>
              </div>
            )}
          </>
        )}

        {event.phase === "Closed" && event.finalPlaceName && (
          <FinalResult event={event} />
        )}
      </div>
    </EventDetailLayout>
  );
}
