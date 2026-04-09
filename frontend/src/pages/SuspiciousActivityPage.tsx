import { useState, useEffect } from "react";
import axios from "../api/axios";
import { ShieldAlert, UserMinus, AlertOctagon } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

type SuspiciousUser = {
  id: string;
  email: string;
  eventCount: number;
  reason: string; // for now just one reason, monitoring only excessive event creation
};

export default function SuspiciousActivityPage() {
  const [users, setUsers] = useState<SuspiciousUser[]>([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  useEffect(() => {
    const loadSuspicious = async () => {
      try {
        const res = await axios.get("admin/users/suspicious");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        notify.error("Failed to load suspicious activity.");
      } finally {
        setLoading(false);
      }
    };
    loadSuspicious();
  }, [notify]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("WARNING: This will permanently DELETE the user and ALL their events. Are you sure?")) return;
    
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      notify.success("User and all their data were deleted.");
    } catch (err) {
      notify.error("Failed to delete user.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          Suspicious Activity Monitor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Detected anomalies and potential spam accounts requiring your
          attention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
          <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold">
            Flagged Users
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {users.length}
          </p>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            All Clear!
          </h3>
          <p className="text-gray-500 mt-1">
            No suspicious activity detected at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Decorative bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertOctagon className="w-6 h-6 text-yellow-700 dark:text-yellow-500" />
                </div>
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                  High Risk
                </span>
              </div>

              <h3
                className="font-bold text-gray-900 dark:text-white text-lg truncate"
                title={user.email}
              >
                {user.email}
              </h3>

              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Created Events:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.eventCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reason:</span>
                  <span className="text-yellow-700 dark:text-yellow-500 font-medium">
                    {user.reason}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <UserMinus className="w-4 h-4" /> Delete Account & Data
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
