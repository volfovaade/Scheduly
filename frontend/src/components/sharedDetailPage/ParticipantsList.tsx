import { Crown, Users } from "lucide-react";

export const ParticipantsList = ({ participants }: { participants: any[] }) => (
  <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors border border-gray-100 dark:border-gray-700">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      Participants ({participants.length})
    </h3>
    <div className="flex flex-wrap gap-2">
      {participants.map((p: any) => (
        <span
          key={p.userId}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800 shadow-sm"
        >
          {p.name}
          {p.role === "Organizator" && (
            <Crown 
              size={14} 
              className="text-yellow-600 dark:text-yellow-400 fill-yellow-500/20" 
              strokeWidth={2.5}
            />
          )}
        </span>
      ))}
    </div>
  </div>
);
