import { useState } from "react";
import axios from "../api/axios";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post("/auth/forgotPassword", { email });
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    if (sent) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <div className="text-5xl mb-4">📬</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    If this email exists, a reset link has been sent. Check your inbox.
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Forgot Password</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter your email and we'll send you a reset link.
                </p>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full mb-6 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || !email}
                    className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="mt-4 text-center">
                    <a href="/login" className="text-sm text-pink-600 dark:text-pink-400 hover:underline">
                        ← Back to login
                    </a>
                </div>
            </div>
        </div>
    );
}