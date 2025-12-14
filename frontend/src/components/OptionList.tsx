import { MapPin, Clock, CheckCircle } from "lucide-react";

type OptionType = {
    id: string;
    placeName: string;
    address?: string;
    timeFrom: string;
    timeTo: string;
    voteCount?: number;
    totalScore?: number;
};

type Props = {
    options: OptionType[]; 
    myVotes: string[]; // Array of option IDs
    setMyVotes: (votes: string[]) => void;
    showVoting: boolean;
};

export default function OptionList({ options, myVotes, setMyVotes, showVoting }: Props) {
    const toggleVote = (optionId: string) => {
        if (myVotes.includes(optionId)) {
            setMyVotes(myVotes.filter(vote => vote !== optionId));
        } else {
            setMyVotes([...myVotes, optionId]);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Options</h3>
            <ul className="space-y-3">
                {options.map(option => (
                    <li 
                        key={option.id}
                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-pink-600" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {option.placeName}
                                    </span>
                                </div>
                                
                                {option.address && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mb-2">
                                        {option.address}
                                    </p>
                                )}
                                
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-6">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {new Date(option.timeFrom).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} - {new Date(option.timeTo).toLocaleString('en-US', { timeStyle: 'short' })}
                                    </span>
                                </div>

                                {option.voteCount !== undefined && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                                        {option.voteCount} vote(s)
                                    </p>
                                )}
                            </div>

                            {showVoting && (
                                <button 
                                    onClick={() => toggleVote(option.id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        myVotes.includes(option.id)
                                            ? 'bg-pink-600 text-white hover:bg-pink-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {myVotes.includes(option.id) ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            Voted
                                        </span>
                                    ) : (
                                        'Vote'
                                    )}
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}