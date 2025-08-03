import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import EventDetailPageView from "../components/EventDetailPageView";
import { useLocation } from "react-router-dom";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<{ title: string; description: string; code: string } | null>(null);
    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState({
        placeName: "",
        location: "",
        timeFrom: new Date(),
        timeTo: new Date(),
    });
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const [preferenceSummary, setPreferenceSummary] = useState([]);
    const [submittedUsers, setSubmittedUsers] = useState([]);

    const location = useLocation();
    const showPreferenceFormInitially = new URLSearchParams(location.search).get("showPreferenceForm") === "true";
    const [showPreferences, setShowPreferences] = useState(showPreferenceFormInitially);

    useEffect(() => {
        const loadEvent = async () => {
            const res = await axios.get(`/events/${eventId}`);
            setEvent(res.data);
        };
        loadEvent();
        loadPreferencesSummary();
    }, [eventId]);

    const loadPreferencesSummary = async () => {
        const [summaryRes, usersRes ] = await Promise.all([
            axios.get(`/events/${eventId}/preferences/summary`),
            axios.get(`/events/${eventId}/participants`)
        ]);
        setPreferenceSummary(summaryRes.data);  // [{ Day, Hour, Count }]
        setSubmittedUsers(usersRes.data);
    };

    useEffect(() => {
        console.log("Preference summary", preferenceSummary);
    }, [preferenceSummary]);

    const loadOptions = async () => {
        const res = await axios.get(`/events/${eventId}/options`);
        setOptions(res.data);
    }
    const loadVotes = async () => {
        const res = await axios.get(`/events/${eventId}/votes/summary`);
        setOptions(res.data);
    }

    useEffect(() => {
        loadOptions();
        loadVotes();
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

    return (
        <EventDetailPageView
            options={options}
            newOption={newOption}
            setNewOption={setNewOption}
            myVotes={myVotes}
            setMyVotes={setMyVotes}
            handleVote={handleVote}
            handleAddOption={handleAddOption}
            eventCode={event?.code ?? ""}
            showPreferences={showPreferences}
            setShowPreferences={setShowPreferences}
            preferenceSummary={preferenceSummary}
            submittedUsers={submittedUsers}
            eventId={eventId}
            loadPreferencesSummary={loadPreferencesSummary}
        />
    )
}