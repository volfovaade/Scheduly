import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import FixedEventDetailPage from "../components/FixedEventDetailPage";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<{ 
        title: string; 
        description: string; 
        code: string;
        mode: "Open" | "Fixed";
        timeRangeFrom: Date | null;
        timeRangeTo: Date | null;
        finalPlaceName: string;
        finalAddress: string;
        finalTimeFrom: string;
        finalTimeTo: string;
    } | null>(null);

    const [options, setOptions] = useState([]);
    const [votes, setVotes] = useState([]);
    const [newOption, setNewOption] = useState({
        placeName: "",
        location: "",
        timeFrom: new Date(),
        timeTo: new Date(),
    });
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const [participants, setParticipants] = useState([]);

    const loadParticipants = async () => {
        const usersRes = await axios.get(`/events/${eventId}/participants`);
        setParticipants(usersRes.data);
    };

    const loadOptions = async () => {
        const res = await axios.get(`/events/${eventId}/options`);
        setOptions(res.data);
    };

    const loadVotes = async () => {
        const res = await axios.get(`/events/${eventId}/votes/summary`);
        setVotes(res.data);
    };

    useEffect(() => {
        const loadEvent = async () => {
            const res = await axios.get(`/events/${eventId}`);
            setEvent(res.data);
            await loadOptions();
            await loadVotes();
            await loadParticipants();
        };
        loadEvent();
    }, [eventId]);

    const loadAll = async () => {
        await loadOptions();
        await loadVotes();
        await loadParticipants();
    };

    const handleVote = async () => {
        await axios.post(`/events/${eventId}/votes`, { optionIds: myVotes }, {
            headers: {"Content-Type": "application/json" }
        });
        alert("Vote saved.");
        await loadVotes();
    };
    const handleAddOption = async () => {
        await axios.post(`/events/${eventId}/options`, newOption);
        await loadOptions();
        // reset form
        setNewOption({
            placeName: "",
            location: "",
            timeFrom: new Date(),
            timeTo: new Date(),
        });
    }
    const handleCloseEvent = async () => {
        if (!window.confirm("Are you sure you want to close the event?")) return;
        try {
            await axios.post(`/events/${eventId}/closeFixed`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to close event.");
        }
    }

    return event ? (
        <FixedEventDetailPage
            event={event}
            options={options}
            votes={votes}
            newOption={newOption}
            setNewOption={setNewOption}
            myVotes={myVotes}
            setMyVotes={setMyVotes}
            handleVote={handleVote}
            handleAddOption={handleAddOption}
            submittedUsers={participants}
            handleCloseEvent={handleCloseEvent}
        />
    ) : (
    <div className="p-6 text-gray-500">Loading event...</div>
    );
}