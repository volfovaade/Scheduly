import { Calendar, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { JoinCard } from "../components/JoinCard";
import Logo from "../assets/badge.png";

type Props = {
  code: string;
  setCode: (code: string) => void;
  onJoin: () => void;
  onGoToDashboard: () => void;
};

export function HomePage({ code, setCode, onJoin, onGoToDashboard }: Props) {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-[calc(100vh-80px)] w-full">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Welcome section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src={Logo}
              alt="Scheduly logo"
              className="w-21 h-20 text-white"
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome in{" "}
            <span className="text-pink-700 dark:text-pink-400">Scheduly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern platform for event and reunion organization. Join the events
            by code received from your friend/colleague or create your own
            event.
          </p>
        </div>
        {/* Join event card */}
        <JoinCard code={code} setCode={setCode} onJoin={onJoin} />
        {/* Go to your dashboard page card */}
        {isAuthenticated && (
          <div className="bg-gradient-to-br from-pink-700 to-pink-800 rounded-2xl p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-6 sm:mb-0">
                <h2 className="text-2xl font-bold mb-2">
                  You already have account
                </h2>
                <p className="text-pink-100">
                  Go to your event management dashboard
                </p>
              </div>
              <button
                onClick={onGoToDashboard}
                className="bg-white text-pink-700 font-semibold py-3 px-8 rounded-xl
                                    hover:bg-pink-50 transform transition-all duration-200 hover:scale-105
                                    shadow-lg"
              >
                My dashboard
              </button>
            </div>
          </div>
        )}
        {/* Overview of main functionality features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-pink-700 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Easy organization
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage events quickly and easily
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-pink-700 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Team collab
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Invite participants and collaborate in real time
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
