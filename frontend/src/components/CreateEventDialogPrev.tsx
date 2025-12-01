import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (event: { 
        title: string; 
        description: string;
        mode: "Open" | "Fixed";
        timeRangeFrom?: Date | null;
        timeRangeTo?: Date | null 
    }) => void;
}

export default function CreateEventDialog({ isOpen, onClose, onCreate }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<"Open" | "Fixed">("Fixed");
    // range only for open events
    const [rangeFrom, setRangeFrom] = useState<Date | null>(null);
    const [rangeTo, setRangeTo] = useState<Date | null>(null);
    const [error, setError] = useState<string>("");

    // time diff validation
    const validateTimeRange = (from: Date | null, to: Date | null): string => {
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
        setRangeFrom(newFrom);
        
        const validationError = validateTimeRange(newFrom, rangeTo);
        setError(validationError);
        
        // Auto-adjust "to" 
        if (rangeTo && newFrom >= rangeTo) {
            const newTo = new Date(newFrom.getTime() + 60 * 60 * 1000); // +1 hodina
            setRangeTo(newTo);
            setError("");
        }
    };
    
    const handleToChange = (value: string) => {
        const newTo = new Date(value);
        setRangeTo(newTo);
        
        const validationError = validateTimeRange(rangeFrom, newTo);
        setError(validationError);
    };

    // func to get min value for "to" field
    const getMinToValue = (): string => {
        if (!rangeFrom) return "";
        const minTo = new Date(rangeFrom.getTime() + 60 * 60 * 1000); // +1 hour
        return new Date(minTo.getTime() - minTo.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setError("Event name is required");
            return;
        }
        
        if (mode === "Open" && (!rangeFrom || !rangeTo)) {
            setError("Open event requires both From and To times");
            return;
        }
        
        if (mode === "Open") {
            const validationError = validateTimeRange(rangeFrom, rangeTo);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        onCreate({title, description, mode, timeRangeFrom: rangeFrom, timeRangeTo: rangeTo});
        setTitle("");
        setDescription("");
        setMode("Fixed");
        setRangeFrom(null);
        setRangeTo(null);
        onClose();
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-white rounded p-6 w-full max-w-md shadow-xl">
                <DialogTitle className="text-lg font-semibold mb-4">
                    New event
                </DialogTitle>
                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                    className="border px-3 py-2 w-full rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Name of the event"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                    className="border px-3 py-2 w-full rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Mode</label>
                    <select
                        className="border px-3 py-2 w-full rounded"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as "Open" | "Fixed")}
                    >
                        <option value="Fixed">Fixed</option>
                        <option value="Open">Open</option>
                    </select>
                </div>
                {mode === "Open" && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Allowed Time Range (minimum 1 hour)</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="datetime-local"
                                value={
                                    rangeFrom
                                        ? new Date(rangeFrom.getTime() - rangeFrom.getTimezoneOffset() * 60000)
                                            .toISOString()
                                            .slice(0, 16)
                                        : ""
                                }  
                                onChange={(e) => handleFromChange(e.target.value)}
                                className="border px-2 py-1 rounded"
                            />
                            <span>–</span>
                            <input
                                type="datetime-local"
                                min={getMinToValue()}
                                value={
                                    rangeTo
                                        ? new Date(rangeTo.getTime() - rangeTo.getTimezoneOffset() * 60000)
                                            .toISOString()
                                            .slice(0, 16)
                                        : ""
                                }
                                onChange={(e) => handleToChange(e.target.value)}
                                className="border px-2 py-1 rounded"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            End time must be at least 1 hour after start time
                        </p>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                    Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
                    Create
                    </button>
                </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}