import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EventDetailPageView from "../components/EventDetailPageView";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState({
        placeName: "",
        location: "",
        timeFrom: new Date(),
        timeTo: new Date(),
    });
    const [myVotes, setMyVotes] = useState<string[]>([]);
    const loadOptions = async () => {
        const res = await axios.get(`/events/${eventId}/options`, {
            headers: { Authorization: `Bearer: ${localStorage.getItem("token")}`}
        });
        setOptions(res.data);
    }
    const loadVotes = async () => {
        const res = await axios.get(`/events/${eventId}/votes/summary`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setOptions(res.data);
    }

    useEffect(() => {
        loadOptions();
        loadVotes();
    }, [eventId]);

    const handleVote = async () => {
        await axios.post(`/events/${eventId}/votes`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        alert("Vote saved.");
    };
    const handleAddOption = async () => {
        await axios.post(`/events/${eventId}/options`, newOption, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
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
        />
    )
}