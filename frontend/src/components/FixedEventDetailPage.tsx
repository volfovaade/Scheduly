import { useState } from "react";
import Option from "../types/option";
import Vote from "../types/vote";
import NewOption from "../types/newOption";
import { useNotification } from "../context/NotificationContext";

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
    const notify = useNotification();
    const eventCode = event.code;
    const [timeError, setTimeError] = useState<string>("");

    // Validace časového rozsahu
    const validateTimeRange = (from: Date, to: Date): string => {
        if (!from || !to) return "";
        
        if (from >= to) {
            return "Start time must be before end time";
        }
        
        const diffInMs = to.getTime() - from.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return "Time range must be at least 1 hour";
        }
        
        return "";
    };

    const handleFromChange = (value: string) => {
        const newFrom = new Date(value);
        let newTo = newOption.timeTo;
        
        // Auto-adjust "to" time if it's invalid
        if (!newTo || newFrom >= newTo) {
            newTo = new Date(newFrom.getTime() + 60 * 60 * 1000); // +1 hour
        }
        
        setNewOption({...newOption, timeFrom: newFrom, timeTo: newTo});
        
        // Validate
        const error = validateTimeRange(newFrom, newTo);
        setTimeError(error);
    };

    const handleToChange = (value: string) => {
        const newTo = new Date(value);
        setNewOption({...newOption, timeTo: newTo});
        
        // Validate
        const error = validateTimeRange(newOption.timeFrom, newTo);
        setTimeError(error);
    };

    const handleAddOptionWithValidation = () => {
        // Check if all fields are filled
        if (!newOption.placeName.trim()) {
            setTimeError("Place name is required");
            return;
        }
        if (!newOption.location.trim()) {
            setTimeError("Location is required");
            return;
        }
        if (!newOption.timeFrom || !newOption.timeTo) {
            setTimeError("Both start and end times are required");
            return;
        }

        // Validate time range
        const validationError = validateTimeRange(newOption.timeFrom, newOption.timeTo);
        if (validationError) {
            setTimeError(validationError);
            return;
        }
        // Clear error and proceed
        setTimeError("");
        handleAddOption();
    };

    // Get minimum value for "To" input
    const getMinToValue = (): string => {
        if (!newOption.timeFrom) return "";
        const minTo = new Date(newOption.timeFrom.getTime() + 60 * 60 * 1000); // +1 hour
        return new Date(minTo.getTime() - minTo.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    // Convert Date to datetime-local string
    const dateToInputValue = (date: Date): string => {
        if (!date) return "";
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Fixed Event: {event.title}</h2>
            <p className="mb-4 text-gray-600">{event.description}</p>

            <div className="mb-4">
                <strong>Event code:</strong> <code>{eventCode}</code>
                <button
                onClick={() => {
                    navigator.clipboard.writeText(eventCode);
                    notify.info("Copied!");
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

                        {/* Error message */}
                        {timeError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                {timeError}
                            </div>
                        )}
                        <div className="mb-3">
                            <input 
                                placeholder="Name of the place" 
                                className="border p-2 mr-2 w-48 rounded" 
                                value={newOption.placeName}
                                onChange={e => setNewOption({...newOption, placeName: e.target.value})} 
                            />
                            <input 
                                placeholder="Location (address)" 
                                className="border p-2 mr-2 w-48 rounded" 
                                value={newOption.location}
                                onChange={e => setNewOption({...newOption, location: e.target.value})} 
                            />
                        </div>
                        <div className="flex items-center gap-4 my-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">From:</label>
                                <input
                                    type="datetime-local"
                                    value={dateToInputValue(newOption.timeFrom)}
                                    onChange={(e) => handleFromChange(e.target.value)}
                                    className="border px-2 py-1 rounded"
                                />
                            </div>
                            <span className="text-gray-500 mt-6">–</span>
                            <div>
                                <label className="block text-sm font-medium mb-1">To:</label>
                                <input
                                    type="datetime-local"
                                    min={getMinToValue()}
                                    value={dateToInputValue(newOption.timeTo)}
                                    onChange={(e) => handleToChange(e.target.value)}
                                    className="border px-2 py-1 rounded"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            End time must be at least 1 hour after start time
                        </p>
                        <button 
                            onClick={handleAddOptionWithValidation} 
                            className="bg-green-600 text-white px-4 py-2"
                            disabled={!!timeError}
                        >
                            Add option
                        </button>
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