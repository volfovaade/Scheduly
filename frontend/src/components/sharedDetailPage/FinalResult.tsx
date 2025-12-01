import { MapPin, Clock } from "lucide-react";

export const FinalResult = ({ event }: { event: any }) => (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-6 flex items-center gap-3">
            🎉 Event is Finalized!
        </h2>
        <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <MapPin className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Location</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{event.finalPlaceName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.finalAddress}</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Clock className="w-6 h-6 mt-1 text-green-600 dark:text-green-400" />
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Time</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {new Date(event.finalTimeFrom).toLocaleString('cs-CZ', { 
                            dateStyle: 'full',
                            timeStyle: 'short'
                        })}
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium text-center">
                📅 Don't forget to add this to your calendar! See you there! 🎊
            </p>
        </div>
    </div>
);
