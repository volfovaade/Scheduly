type Props = {
    token: string;
    setToken: (v: string) => void;
    isAuthenticated: boolean;
    onJoin: () => void;
    onLogin: () => void;
    onRegister: () => void;
    onGoToDashboard: () => void;
};

export default function MainPageView({token, setToken, isAuthenticated, onJoin, onLogin, onRegister, onGoToDashboard} : Props){
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Easy Plan</h1>

            <div className="mb-6">
                <label className="block mb-2">Enter the event code (token):</label>
                <input
                    className="border p-2 w-full max-w-md"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                />
                <button onClick={onJoin} className="bg-blue-600 text-white px-4 py-2 mt-2">
                    Join
                </button>
            </div>

            {!isAuthenticated ? (
                <div className="space-x-4">
                    <button onClick={onLogin} className="bg-green-600 text-white px-4 py-2">Login</button>
                    <button onClick={onRegister} className="bg-gray-600 text-white px-4 py-2">Sign up</button>
                </div>
            ) : (
                <button onClick={onGoToDashboard} className="bg-purple-600 text-white px-4 py-2">
                    My dashboard
                </button>
            )}
        </div>
    );
}