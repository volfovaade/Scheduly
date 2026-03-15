import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, BarChart2, Save, Eye, EyeOff, CheckCircle } from "lucide-react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

type UserStats = {
    organizedTotal: number;
    organizedActive: number;
    participatingTotal: number;
    participatingActive: number;
    closedEvents: number;
};

type Section = "profile" | "password" | "stats";

export default function SettingsPage() {
    const { user, isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const notify = useNotification();

    // Profile
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Stats
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const [activeSection, setActiveSection] = useState<Section>("profile");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`users/${user.id}/stats`);
                setStats(res.data);
            } catch {
                // stats are optional, fail silently
            } finally {
                setLoadingStats(false);
            }
        };
        loadStats();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            const res = await axios.put(`users/${user.id}`, { name, email });
            // refresh auth context with new name
            const token = sessionStorage.getItem("token")!;
            await login(token, res.data.id);
            notify.success("Profile updated successfully.");
        } catch (err: any) {
            notify.error(err?.response?.data || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;
        if (newPassword !== confirmPassword) {
            notify.error("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            notify.error("Password must be at least 6 characters.");
            return;
        }
        setSavingPassword(true);
        try {
            await axios.put(`users/${user.id}`, {
                currentPassword,
                newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            notify.success("Password changed successfully.");
        } catch (err: any) {
            notify.error(err?.response?.data || "Failed to change password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const statCards = stats
        ? [
              {
                  label: "Events organized",
                  value: stats.organizedTotal,
                  sub: `${stats.organizedActive} active`,
                  color: "from-pink-500 to-pink-700",
                  icon: "🎯",
              },
              {
                  label: "Events joined",
                  value: stats.participatingTotal,
                  sub: `${stats.participatingActive} active`,
                  color: "from-blue-500 to-blue-700",
                  icon: "👥",
              },
              {
                  label: "Completed events",
                  value: stats.closedEvents,
                  sub: "across all events",
                  color: "from-green-500 to-green-700",
                  icon: "✅",
              },
          ]
        : [];

    const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
        { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
        { id: "password", label: "Password", icon: <Lock className="w-4 h-4" /> },
        { id: "stats", label: "Statistics", icon: <BarChart2 className="w-4 h-4" /> },
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
                Settings
            </h2>

            {/* Tab nav */}
            <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeSection === item.id
                                ? "bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-400 shadow"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Profile section */}
            {activeSection === "profile" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-pink-500" />
                        Profile information
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Display name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                       focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-800
                                   text-white px-6 py-2.5 rounded-lg font-medium
                                   hover:from-pink-700 hover:to-pink-900 transition-all shadow
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingProfile ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save changes
                    </button>
                </div>
            )}

            {/* Password section */}
            {activeSection === "password" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-pink-500" />
                        Change password
                    </h3>

                    {/* Current password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600
                                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600
                                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                            />
                            {confirmPassword && newPassword === confirmPassword && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleChangePassword}
                        disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-800
                                   text-white px-6 py-2.5 rounded-lg font-medium
                                   hover:from-pink-700 hover:to-pink-900 transition-all shadow
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingPassword ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Lock className="w-4 h-4" />
                        )}
                        Change password
                    </button>
                </div>
            )}

            {/* Stats section */}
            {activeSection === "stats" && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-pink-500" />
                        Your statistics
                    </h3>

                    {loadingStats ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200
                                               dark:border-gray-700 p-5 flex flex-col gap-2"
                                >
                                    <div className="text-2xl">{card.icon}</div>
                                    <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                                        {card.value}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {card.label}
                                    </div>
                                    <div className="text-xs text-gray-400">{card.sub}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}