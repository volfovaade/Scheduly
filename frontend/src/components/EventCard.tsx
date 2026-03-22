import { Trash2, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  title: string;
  code: string;
  mode: string;
  isMultiDay: boolean;
  onClick: () => void;
  onAction: () => void;
  icon: "delete" | "leave";
};

export default function EventCard({
  id,
  title,
  code,
  mode,
  isMultiDay,
  onClick,
  onAction,
  icon,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-gray-400 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
      {onAction && icon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className={`absolute top-3 right-3 p-1 rounded ${
            icon === "delete"
              ? "text-red-700 hover:text-red-900 dark:hover:text-red-600"
              : "text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          {icon === "delete" ? <Trash2 size={18} /> : <LogOut size={18} />}
        </button>
      )}

      <div onClick={onClick} className="cursor-pointer">
        <h4 className="font-semibold text-lg mb-2">{title}</h4>

        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Code: <span className="font-mono font-medium">{code}</span>
          </p>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Copy code"
          >
            {copied
              ? <Check size={14} className="text-green-500" />
              : <Copy size={14} />
            }
          </button>
        </div>

        <p className="text-sm text-gray-500">Type: {mode}</p>
      </div>
    </div>
  );
}