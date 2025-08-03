import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PlacePreferenceForm from "../components/PlacePreferenceForm";
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from "recharts";

interface Option {
    id: string;
    placeName: string;
    location: string;
    timeFrom: string;
    timeTo: string;
}
interface NewOption {
    placeName: string;
    location: string;
    timeFrom: Date;
    timeTo: Date;
}

interface Props {
    options: Option[];
    newOption: NewOption;
    myVotes: string[];
    setMyVotes: (votes: string[]) => void;
    setNewOption: (opt: NewOption) => void;
    handleVote: () => void;
    handleAddOption: () => void;
    eventCode: string;
    showPreferences: boolean;
    setShowPreferences: (showPreferences: boolean) => void;
    preferenceSummary: any[];
    submittedUsers: any[],
    eventId: string | undefined;
    loadPreferencesSummary: () => void;
}

export default function EventDetailPageView({
    options, 
    newOption,
    myVotes, 
    setMyVotes, 
    setNewOption, 
    handleVote, 
    handleAddOption, 
    eventCode,
    showPreferences,
    setShowPreferences,
    preferenceSummary,
    submittedUsers,
    eventId,
    loadPreferencesSummary
    } : Props) {
    const barData = preferenceSummary.map((item) => ({
        Label: `${item.day} ${item.hour}:00`,
        Count: item.count
    }));
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Event detail</h2>

            <div className="mb-4">
                <strong>Event code:</strong> <code>{eventCode}</code>
                <button
                onClick={() => {
                    navigator.clipboard.writeText(eventCode);
                    alert("Copied!");
                }}
                className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded"
                >
                Copy
                </button>
            </div>
            
            <button onClick={() => setShowPreferences(true)} className="bg-purple-600 text-white px-4 py-2 mt-4">Edit Preferences</button>
            {showPreferences && <PlacePreferenceForm eventId={eventId!} onClose={() => setShowPreferences(false)} loadPreferencesSummary={loadPreferencesSummary}/>}

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Participants who submitted preferences</h3>
                <ul className="list-disc ml-6">
                    {submittedUsers.map((user: any) => (
                        <li key={user.id}>{user.name} ({user.role})</li>
                    ))}
                </ul>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Most preferred times</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                        <XAxis dataKey="Label" label={{ value: "Time", position: "insideBottom", offset: -5 }}/>
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Count" fill="#38bdf8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold">Voting options</h3>
                <ul className="mb-4">
                    {options.map((o: any) => (
                        <li key={o.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={o.id}
                                    checked={myVotes.includes(o.id)}
                                    onChange={e => {
                                        if (e.target.checked)
                                            setMyVotes([...myVotes, o.id]);
                                        else
                                            setMyVotes(myVotes.filter(id => id !== o.id));
                                    }}
                                />
                                <strong>{o.placeName}</strong>{" "}
                                <span className="text-sm text-gray-600">
                                    {new Date(o.timeFrom).toLocaleString()} - {new Date(o.timeTo).toLocaleString()}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
                <button className="bg-blue-600 text-white px-4 py-2" onClick={handleVote}>Send votes</button>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Add your preference</h3>
                <input placeholder="Name of the place" className="border p-1 mr-2" onChange={e => setNewOption({...newOption, placeName: e.target.value})} />
                <input placeholder="Location (address)" className="border p-1 mr-2" onChange={e => setNewOption({...newOption, location: e.target.value})} />
                <div className="flex items-center gap-4 my-2">
                    <div>
                        From: <DatePicker selected={newOption.timeFrom} onChange={date => setNewOption({...newOption, timeFrom: date!})} showTimeSelect dateFormat="Pp" />
                    </div>
                    <div>
                        To: <DatePicker selected={newOption.timeTo} onChange={date => setNewOption({...newOption, timeTo: date!})} showTimeSelect dateFormat="Pp" />
                    </div>
                </div>
                <button onClick={handleAddOption} className="bg-green-600 text-white px-4 py-2">Add option</button>
            </div>
        </div>
    );
}