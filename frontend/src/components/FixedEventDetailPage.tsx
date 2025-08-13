import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Option {
    id: string;
    placeName: string;
    location: string;
    timeFrom: string;
    timeTo: string;
}
interface Vote {
    id: string;
    voteCount: number;
}
interface NewOption {
    placeName: string;
    location: string;
    timeFrom: Date;
    timeTo: Date;
}

interface Props {
    event: any;
    options: Option[];
    votes: Vote[];
    newOption: NewOption;
    myVotes: string[];
    setMyVotes: (votes: string[]) => void;
    setNewOption: (opt: NewOption) => void;
    handleVote: () => void;
    handleAddOption: () => void;
    submittedUsers: any[];
    handleCloseEvent: () => void;
}

export default function FixedEventDetailPage({
    event,
    options, 
    votes,
    newOption,
    myVotes, 
    setMyVotes, 
    setNewOption, 
    handleVote, 
    handleAddOption, 
    submittedUsers,
    handleCloseEvent
    } : Props) {
    const eventCode = event.code;
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Fixed Event: {event.title}</h2>
            <p className="mb-4 text-gray-600">{event.description}</p>

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
            
            <div className="mt-6">
                <h3 className="text-lg font-semibold">Participants</h3>
                <ul className="list-disc ml-6">
                    {submittedUsers.map((user: any, index) => (
                        <li key={index}>{user.name} ({user.role})</li>
                    ))}
                </ul>
            </div>

            { event.phase === "Proposal" && (
                <>
                    <div className="border-t mb-6">
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
                </>
            )}

            {event.currentUserIsOrganizer && event.phase === "Proposal" && (
                <button
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleCloseEvent}
                >
                    Close Event
                </button>
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