import { Trash2, LogOut } from "lucide-react";

type Props = {
    id: string;
    title: string;
    code: string;
    onClick: () => void;
    onAction?: () => void;
    icon?: "delete" | "leave";
};
export default function EventCard({id, title, code, onClick, onAction, icon}: Props){
    return (
        <div
            className="relative p-4 border rounded shadow hover:shadow-md cursor-pointer transition"
            onClick={onClick}
        >
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-sm text-gray-600">Code: {code}</p>

            {onAction && icon && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction();
                    }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                >
                    {icon === "delete" ? <Trash2 size={18} /> : <LogOut size={18} />}
                </button>
            )}
        </div>
    );
}