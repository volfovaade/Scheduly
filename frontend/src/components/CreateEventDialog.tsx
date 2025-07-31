import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (event: { title: string; description: string }) => void;
}

export default function CreateEventDialog({ isOpen, onClose, onCreate }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const handleSubmit = () => {
        if (!title.trim()) return;
        onCreate({title, description});
        setTitle("");
        setDescription("");
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
                    placeholder="Description (optionals)"
                    />
                </div>
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