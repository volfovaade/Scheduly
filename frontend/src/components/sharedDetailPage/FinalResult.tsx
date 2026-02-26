import { MapPin, Clock, CheckCircle2 } from "lucide-react";
import { formatLocalDate, formatLocalDateTime } from "../../utils/dateUtils";

export const FinalResult = ({ event }: { event: any }) => (
    <div className="bg-white dark:bg-gray-900 border border-yellow-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
        
        <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-pink-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Event is Finalized!
            </h2>
        </div>

        <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700">
                <MapPin className="w-6 h-6 mt-1 text-yellow-500 shrink-0" />
                <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Location</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{event.finalPlaceName}</p>
                    {event.finalAddress && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">{event.finalAddress}</p>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700">
                <Clock className="w-6 h-6 mt-1 text-yellow-500 shrink-0" />
                <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Time</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        From: {event.isMultiDay ? formatLocalDate(event.finalTimeFrom) : formatLocalDateTime(event.finalTimeFrom)}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        To: {event.isMultiDay ? formatLocalDate(event.finalTimeTo) : formatLocalDateTime(event.finalTimeTo)}
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-gray-900">
            <p className="text-yellow-800 dark:text-yellow-100 font-semibold text-center flex items-center justify-center gap-2">
                <span>📅</span> Don't forget to add this to your calendar!
            </p>
        </div>
    </div>
);
export default FinalResult;