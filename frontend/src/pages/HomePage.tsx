import { Calendar, Users, Lock, CheckCircle, Sparkles, MapPin, Clock, Navigation } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { JoinCard } from "../components/JoinCard";
import Logo from "../assets/badge.png";

type Props = {
  code: string;
  setCode: (code: string) => void;
  onJoin: () => void;
  onGoToDashboard: () => void;
};

const EVENT_TYPES = [
  {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    title: "Simple event",
    description: "You set place & time, others just sign up",
  },
  {
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    title: "Collaborative",
    description: "Anyone can propose options, everyone votes",
  },
  {
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    title: "Organizer choice",
    description: "Only you add options, participants vote",
  },
  {
    icon: MapPin,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    title: "Fixed time, open place",
    description: "Time is set, app suggests best locations",
  },
  {
    icon: Clock,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    title: "Fixed place, open time",
    description: "Place is set, app finds the best time overlap",
  },
  {
    icon: Navigation,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    title: "Fully open",
    description: "App generates best place & time from everyone's preferences",
  },
];

export function HomePage({ code, setCode, onJoin, onGoToDashboard }: Props) {
    const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-[calc(100vh-80px)] w-full">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img src={Logo} alt="Scheduly logo" className="w-21 h-20" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome in{" "}
            <span className="text-pink-700 dark:text-pink-400">Scheduly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern platform for event and reunion organization. Join events by
            code or create your own.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>
              You need to be <strong>logged in</strong> to join or create events.{" "}
              <a href="/register" className="underline hover:no-underline">Sign up</a>{" "}
              or{" "}
              <a href="/login" className="underline hover:no-underline">log in</a>.
            </span>
          </div>
        )}

        <JoinCard code={code} setCode={setCode} onJoin={onJoin} />

        {isAuthenticated && (
          <div className="bg-gradient-to-br from-pink-700 to-pink-800 rounded-2xl p-8 text-white mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-6 sm:mb-0">
                <h2 className="text-2xl font-bold mb-2">You already have an account</h2>
                <p className="text-pink-100">Go to your event management dashboard</p>
              </div>
              <button
                onClick={onGoToDashboard}
                className="bg-white text-pink-700 font-semibold py-3 px-8 rounded-xl
                           hover:bg-pink-50 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                My dashboard
              </button>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-600" />
            6 types of events to choose from
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EVENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800
                             border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <div className={`w-8 h-8 ${type.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{type.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{type.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-pink-700 dark:text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Easy organization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create and manage events quickly and easily</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-pink-700 dark:text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Team collab</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Invite participants and collaborate on finding the best time & place</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}