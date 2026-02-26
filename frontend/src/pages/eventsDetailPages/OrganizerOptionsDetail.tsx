import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import axios from "../../api/axios";
import OptionsList from "../../components/OptionList";
import AddOptionForm from "../../components/AddOptionForm";
import { ParticipantsList } from "../../components/sharedDetailPage/ParticipantsList";
import { FinalResult } from "../../components/sharedDetailPage/FinalResult";
import Option from "../../types/option";
import GenericVotingForm, { VoteOption } from "../../components/sharedDetailPage/GenericVotingForm";
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

export default function OrganizerOptionsDetail({ 
    event, 
    eventId, 
    onClose
}: Props) {
    const notify = useNotification();
    const [showAddForm, setShowAddForm] = useState(false);
    const [options, setOptions] = useState([]);
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        try {
            const [optionsRes, votesRes, participantsRes] = await Promise.all([
                axios.get(`/events/${eventId}/options`),
                axios.get(`/events/${eventId}/votes/my`),
                axios.get(`/events/${eventId}/participants`)
            ]);
            
            setOptions(optionsRes.data);
            setMyVotes(votesRes.data.map((v: any) => v.optionId));
            setParticipants(participantsRes.data);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    };

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

    const handleVote = async () => {
        try {
            await axios.post(`/events/${eventId}/votes`, {
                votes: myVotes.map(id => ({ optionId: id, score: 1 }))
            });
            notify.info("Vote saved");
            await loadData();
        } catch (err) {
            notify.error("Failed to save vote");
        }
    };

    return (
        <EventDetailLayout
            commentSection={<CommentSection eventId={eventId} />}
        >
            <div className="max-w-7xl mx-auto px-6">
                {/* Participants */}
                <ParticipantsList participants={participants} />

                {/* Phase-specific content */}
                {event.phase === "Proposal" && (
                    <>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                            {event.currentUserIsOrganizer && (
                                <button onClick={onClose} className="w-auto px-6 bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-lg font-semibold mb-6">
                                    Close Voting
                                </button>
                            )}
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
                                <p className="text-sm mt-2">Please refresh or check options later.</p>
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