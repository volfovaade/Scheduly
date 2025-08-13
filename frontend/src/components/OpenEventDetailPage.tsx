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
    radius: number;
    setRadius: (val: number) => void;
    duration: number;
    setDuration: (val: number) => void;
    handleCloseEvent: () => void;
}

export default function OpenEventDetailPage({
    event,
    showPreferences,
    setShowPreferences,
    loadPreferencesSummary,
    preferenceSummary,
    submittedUsers,
    handleFinalize,
    radius,
    setRadius,
    duration,
    setDuration,
    handleCloseEvent
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

            {event.phase === "Proposal" && (
                <>
                    <button onClick={() => setShowPreferences(true)} className="bg-purple-600 text-white px-4 py-2 mt-4">Edit Preferences</button>
                    {showPreferences && <PlacePreferenceForm 
                                            eventId={event.id} 
                                            timeRangeFrom={event.timeRangeFrom}
                                            timeRangeTo={event.timeRangeTo}
                                            onClose={() => setShowPreferences(false)} 
                                            loadPreferencesSummary={loadPreferencesSummary}
                                            />}

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

            {event.currentUserIsOrganizer && event.phase === "Proposal" && (
                <>
                    <div className="mt-4 mb-4">
                        <label className="block font-medium">Search radius (km): {radius}</label>
                        <input
                            type="range"
                            min={3}
                            max={30}
                            step={1}
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium">Duration (hours): {duration}</label>
                        <input
                            type="range"
                            min={1}
                            max={24}
                            step={1}
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <button 
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={handleFinalize}
                    >
                        Finalize Proposals
                    </button>
                </>
            )}

            {event.currentUserIsOrganizer && event.phase === "FinalVoting" && (
                <button
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleCloseEvent}
                >
                    Close Event
                </button>
            )}

            {event.phase === "FinalVoting" && (
                <FinalVotingForm eventId={event.id} />
            )}

            {event.phase === "Closed" && (
                <div className="mt-6 p-4 border rounded bg-green-50">
                    <h3 className="text-xl font-bold mb-2">Final Decision</h3>
                    <p>
                        <strong>Place:</strong> {event.finalPlaceName}<br/>
                        <strong>Address:</strong> {event.finalAddress}<br/>
                        <strong>Time:</strong> {new Date(event.finalTimeFrom).toLocaleString()} – {new Date(event.finalTimeTo).toLocaleString()}
                    </p>
                    <p className="mt-4 text-green-700">
                        Note the date to your calendar! Excited to see you all there!!
                    </p>
                </div>
            )}
        </div>
    );
}