import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EventDetailPageView from "../components/EventDetailPageView";

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
    useEffect(() => {
        const loadEvent = async () => {
            const res = await axios.get(`/events/${eventId}`);
            setEvent(res.data);
        };
        loadEvent();
    }, [eventId]);

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
        await axios.post(`/events/${eventId}/votes`);
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
        />
    )
}