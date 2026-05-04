import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../context/NotificationContext";
import axios from "../../api/axios";
import AddOptionForm from "../../components/AddOptionForm";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import GenericVotingForm from "../../components/sharedDetailPage/GenericVotingForm";
import CommentSection from "../../components/sharedDetailPage/CommentSection";
import EventDetailLayout from "../../components/sharedDetailPage/EventDetailLayout";

interface Props {
  event: any;
  eventId: string;
}

/**
 * Event detail page for "Collaborative Options" event mode.
 * Both organizer and participants can propose options (place + time).
 * Everyone votes on their preferred option.
 *
 * Voting phases:
 * - Proposal: Users can add options and vote on preferences
 * - Closed: Shows final result
 *
 * @param event - Full event object with phase and other details
 * @param eventId - The event ID for API calls
 * @returns The collaborative event detail page
 */
export default function CollaborativeOptionsDetail({
  event,
  eventId,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [options, setOptions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const notify = useNotification();

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
   * Only available if event allows participant options.
   *
   * @param optionData - The new option details
   */
  const handleAddOption = async (optionData: any) => {
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
  const handleDeleteOption = async (optionId: string) => {
    try {
      await axios.delete(`/events/${eventId}/options/${optionId}`);
      notify.info("Option removed.");
      await loadData();
    } catch {
      notify.error("Failed to remove option.");
    }
  };

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Participants list */}
        <ParticipantsList participants={participants} />

        {/* Proposal phase - users can add options and vote */}
        {event.phase === "Proposal" && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            </div>

            {/* Add option form dialog */}
            <AddOptionForm
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
              onSubmit={handleAddOption}
              eventId={eventId}
              event={event}
            />

            {/* Show add option button if event allows participant options */}
            {event.allowParticipantOptions && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-auto px-6 bg-gradient-to-r from-pink-600 to-pink-800 text-white py-4 rounded-lg font-semibold mb-6"
              >
                + Add Your Option
              </button>
            )}

            {/* Voting form for preference voting */}
            <GenericVotingForm
              eventId={eventId}
              title="Option Preference Voting"
              voteType="Preference"
              providedOptions={options}
              onDeleteOption={event.currentUserIsOrganizer ? handleDeleteOption : undefined}
            />

            {/* Empty state when no options exist */}
            {options.length === 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500 dark:text-gray-200">
                <p>No options have been added for now.</p>
                <p className="text-sm mt-2">
                  Please refresh or check options later.
                </p>
              </div>
            )}
          </>
        )}

        {/* Closed phase - show final results */}
        {event.phase === "Closed" && event.finalPlaceName && (
          <FinalResult event={event} />
        )}
      </div>
    </EventDetailLayout>
  );
}
