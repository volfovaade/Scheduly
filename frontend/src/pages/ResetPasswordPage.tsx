import { useState } from "react";
import { CheckCircle } from "lucide-react";
import axios from "../api/axios";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token") || "";

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/auth/resetPassword", { token, newPassword: password });
      setDone(true);
    } catch {
      setError("Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-pink-700 dark:text-pink-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Password reset!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You can now log in with your new password.
          </p>

          <a
            href="/login"
            className="inline-block bg-pink-700 hover:bg-pink-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to login →
          </a>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Set New Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose a password for your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className="w-full mb-6 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !password}
          className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="mt-4 text-center">
          <a
            href="/forgotPassword"
            className="text-sm text-pink-600 dark:text-pink-400 hover:underline"
          >
            ← Request a new link
          </a>
        </div>
      </div>
    </div>
  );
}
