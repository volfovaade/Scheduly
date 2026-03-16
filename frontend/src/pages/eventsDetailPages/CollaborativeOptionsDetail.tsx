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
  onClose: () => void;
  onDelete: () => void;
  onReload: () => void;
  showPreferenceFormInitially: boolean;
}

export default function CollaborativeOptionsDetail({
  event,
  eventId,
  onClose,
  onDelete,
  onReload,
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

  return (
    <EventDetailLayout commentSection={<CommentSection eventId={eventId} />}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Participants */}
        <ParticipantsList participants={participants} />

        {/* Phase-specific content */}
        {event.phase === "Proposal" && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              {event.currentUserIsOrganizer && (
                <button
                  onClick={onClose}
                  className="w-auto px-6 bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-lg font-semibold mb-6"
                >
                  Close Voting
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
            {event.allowParticipantOptions && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-auto px-6 bg-gradient-to-r from-pink-600 to-pink-800 text-white py-4 rounded-lg font-semibold mb-6"
              >
                + Add Your Option
              </button>
            )}
            <GenericVotingForm
              eventId={eventId}
              title="Option Preference Voting"
              voteType="Preference"
              providedOptions={options}
            />

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

        {event.phase === "Closed" && event.finalPlaceName && (
          <FinalResult event={event} />
        )}
      </div>
    </EventDetailLayout>
  );
}
