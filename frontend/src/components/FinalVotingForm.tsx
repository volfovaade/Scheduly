import { useState, useEffect } from "react";
import axios from "../api/axios";

interface FinalOption {
    id: string;
    placeName: string;
    adress: string;
    timeFrom: string;
    timeTo: string;
}
interface Props {
    eventId: string;
}

export default function FinalVotingForm({ eventId }: Props){
    const [options, setOptions] = useState<FinalOption[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const res = await axios.get(`/events/${eventId}/options/final`);
            setOptions(res.data);
        };
        load();
    }, [eventId]);

    const handleVote = async () => {
        if (!selected) return alert("Please select an option.");
        await axios.post(`/events/${eventId}/votes/final`, selected, {
            headers: { "Content-Type": "application/json" }
        });
        alert("Vote submitted");
    }
    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Final Voting</h3>
            <ul className="space-y-4">
                {options.map(opt => (
                    <li key={opt.id} className="border p-4 rounded shadow">
                        <label className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="final"
                                value={opt.id}
                                checked={selected === opt.id}
                                onChange={() => setSelected(opt.id)}
                            />
                            <div>
                                <p className="font-semibold">{opt.placeName}</p>
                                <p className="text-sm text-gray-600">{opt.adress}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(opt.timeFrom).toLocaleString()} – {new Date(opt.timeTo).toLocaleString()}
                                </p>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>
            <button onClick={handleVote} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                Submit Vote
            </button>
        </div>
    );
}