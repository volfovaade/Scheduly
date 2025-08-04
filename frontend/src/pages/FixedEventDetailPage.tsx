import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useLocation } from "react-router-dom";
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
    } | null>(null);

    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState({
        placeName: "",
        location: "",
        timeFrom: new Date(),
        timeTo: new Date(),
    });
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const [participants, setParticipants] = useState([]);

    const location = useLocation();
    const showPreferenceFormInitially = new URLSearchParams(location.search).get("showPreferenceForm") === "true";
    const [showPreferences, setShowPreferences] = useState(showPreferenceFormInitially);

    const loadParticipants = async () => {
        const usersRes = await axios.get(`/events/${eventId}/participants`);
        setParticipants(usersRes.data);
    };

    const loadOptions = async () => {
        const res = await axios.get(`/events/${eventId}/options`);
        setOptions(res.data);
    }
    const loadVotes = async () => {
        const res = await axios.get(`/events/${eventId}/votes/summary`);
        setOptions(res.data);
    }

    useEffect(() => {
        const loadEvent = async () => {
            const res = await axios.get(`/events/${eventId}`);
            setEvent(res.data);
        };
        loadEvent();
        loadOptions();
        loadVotes();
        loadParticipants();
    }, [eventId]);

    const handleVote = async () => {
        await axios.post(`/events/${eventId}/votes`, { optionIds: myVotes }, {
            headers: {"Content-Type": "application/json" }
        });
        alert("Vote saved.");
    };
    const handleAddOption = async () => {
        await axios.post(`/events/${eventId}/options`, newOption);
        await loadOptions();
    }

    return event ? (
        <FixedEventDetailPage
            event={event}
            options={options}
            newOption={newOption}
            setNewOption={setNewOption}
            myVotes={myVotes}
            setMyVotes={setMyVotes}
            handleVote={handleVote}
            handleAddOption={handleAddOption}
            submittedUsers={participants}
        />
    ) : (
    <div className="p-6 text-gray-500">Loading event...</div>
    );
}