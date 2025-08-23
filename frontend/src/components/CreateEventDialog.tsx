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
    
    const handleSubmit = () => {
        if (!title.trim()) return;
        if (mode === "Open" && (!rangeFrom || !rangeTo)) {
            alert("Open event requires both From and To times.");
            return;
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
                        <label className="block text-sm font-medium mb-1">Allowed Time Range</label>
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
                                onChange={(e) => setRangeFrom(new Date(e.target.value))}
                                className="border px-2 py-1 rounded"
                            />
                            <span>–</span>
                            <input
                                type="datetime-local"
                                value={
                                    rangeTo
                                        ? new Date(rangeTo.getTime() - rangeTo.getTimezoneOffset() * 60000)
                                            .toISOString()
                                            .slice(0, 16)
                                        : ""
                                }
                                onChange={(e) => setRangeTo(new Date(e.target.value))}
                                className="border px-2 py-1 rounded"
                            />
                        </div>
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