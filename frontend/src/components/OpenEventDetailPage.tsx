import PlacePreferenceForm from "../components/PlacePreferenceForm";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import FinalVotingForm from "../components/FinalVotingForm";

interface Props {
    event: any;
    showPreferences: boolean;
    setShowPreferences: (val: boolean) => void;
    loadPreferencesSummary: () => void;
    preferenceSummary: any[];
    submittedUsers: any[];
    handleFinalize: () => void;
}

export default function OpenEventDetailPage({
    event,
    showPreferences,
    setShowPreferences,
    loadPreferencesSummary,
    preferenceSummary,
    submittedUsers,
    handleFinalize
}: Props) {
    const barData = preferenceSummary.map((item) => ({
            Label: `${item.day} ${item.hour}:00`,
            Count: item.count
    }));
    const eventCode = event.code;
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Open Event: {event.title}</h2>
            <p className="mb-4 text-gray-600">{event.description}</p>
            <p className="text-sm mb-4 text-gray-500">
                Select availability between {new Date(event.timeRangeFrom).toLocaleString()} and {new Date(event.timeRangeTo).toLocaleString()}
            </p>
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
            {event.currentUserIsOrganizer && event.phase === "Proposal" && (
                <button 
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
                    onClick={handleFinalize}
                >
                    Finalize Proposals
                </button>
            )}

            {event.phase === "FinalVoting" && (
                <FinalVotingForm eventId={event.id} />
            )}

            {event.phase === "Proposal" && (
                <>
                    <button onClick={() => setShowPreferences(true)} className="bg-purple-600 text-white px-4 py-2 mt-4">Edit Preferences</button>
                    {showPreferences && <PlacePreferenceForm eventId={event.id} onClose={() => setShowPreferences(false)} loadPreferencesSummary={loadPreferencesSummary}/>}

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">Participants</h3>
                        <ul className="list-disc ml-6">
                            {submittedUsers.map((user: any, index) => (
                                <li key={index}>{user.name} ({user.role})</li>
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
                </>
            )}
        </div>
    );
}