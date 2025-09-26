type Props = {
    code: string;
    setCode: (code: string) => void;
    onJoin: () => void;
};

export function JoinCard({code, setCode, onJoin}: Props){
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Join the event
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Enter the event code you received from the organizer
                </p>
            </div>
            <div className="max-w-md mx-auto">
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the event code..."
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                            rounded-xl text-center text-lg font-mono tracking-wider
                            focus:ring-2 focus:ring-pink-700 focus:border-transparent
                            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                            transition-all duration-200"
                    />
                </div>
                <button 
                    onClick={onJoin}
                    disabled={!code.trim()}
                    className="w-full bg-gradient-to-r from-pink-700 to-pink-800 hover:from-pink-800 hover:to-pink-900
                        disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                        text-white font-semibold py-4 px-6 rounded-xl
                        transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                        shadow-lg hover:shadow-xl disabled:hover:scale-100"
                >
                    Join the event
                </button>
            </div>
        </div>
    );
}