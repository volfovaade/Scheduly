import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

/**
 * Registration page where new users can create an account.
 * Includes validation for name, email, and password before submitting.
 * On successful registration, logs the user in and redirects to dashboard.
 *
 * @returns The registration form UI
 */
export default function RegisterPage() {
  const notify = useNotification();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (form.name.trim().length < 2 || form.name.length > 20) {
      return notify.error("Name must be between 2 and 20 characters.");
    }
    if (!emailRegex.test(form.email) || form.email.length > 50) {
      return notify.error("Please enter a valid email address.");
    }
    if (form.password.length < 6) {
      notify.error("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("/auth/register", form);
      await login(res.data.token, res.data.userId);
      navigate("/dashboard");
    } catch (err: any){
      const message = err.response?.data;
      if (typeof message === "string" && message.toLowerCase().includes("already exists")) {
        notify.error("This email address is already registered.");
      } else {
        notify.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={register}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Create Account
        </h2>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name
        </label>
        <input
          name="name"
          onChange={handleChange}
          value={form.name}
          required
          disabled={loading}
          placeholder="Your name"
          className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          onChange={handleChange}
          value={form.email}
          required
          disabled={loading}
          placeholder="your@email.com"
          className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          name="password"
          type="password"
          onChange={handleChange}
          value={form.password}
          required
          disabled={loading}
          placeholder="Min. 6 characters"
          className={`w-full mb-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            form.password.length > 0 && form.password.length < 6
              ? "border-red-400 dark:border-red-500"
              : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {/* Show password strength indicator */}
          {form.password.length > 0 && form.password.length < 6 && (
            <p className="text-xs text-red-500 mb-4">
              Password must be at least 6 characters ({form.password.length}/6)
            </p>
          )}
          {(form.password.length === 0 || form.password.length >= 6) && (
            <div className="mb-6" />
          )}

        <button
          type="submit"
          disabled={loading || form.password.length < 6}
          className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
