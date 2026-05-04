import {
  BookOpen,
  CheckCircle,
  Users,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  Calendar,
  Vote,
  Lock,
  ChevronDown,
  ChevronUp,
  Share2,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750
                   transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>
      {open && (
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoBox({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${color}`}>
      {children}
    </div>
  );
}

function EventTypeRow({
  icon,
  iconColor,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

/**
 * Comprehensive guide page explaining all features and functionality of Scheduly.
 * Includes sections on getting started, event types, voting phases, and admin features.
 *
 * @returns The how-to guide page with collapsible sections
 */
export default function HowToUsePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-pink-700 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">How to use Scheduly</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Everything you need to know to get started</p>
        </div>
      </div>

      <div className="space-y-3">

        {/* Getting started section */}
        <Section
          title="Getting started"
          icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
          defaultOpen={true}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Scheduly helps groups find the best time and place to meet. Here's how it works in 3 steps:
          </p>
          <div className="space-y-2">
            {[
              { step: "1", text: "Create an account and log in" },
              { step: "2", text: "Create a new event and share the 6-character code with your group" },
              { step: "3", text: "Participants join, submit their preferences, and the app finds the best option" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
              </div>
            ))}

          </div>
          <InfoBox color="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>You must be <strong>logged in</strong> to create or join events.</span>
            </div>
          </InfoBox>
        </Section>

        {/* Joining an event section */}
        <Section
          title="Joining an event"
          icon={<Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Every event has a unique <strong>6-character code</strong>. To join an event:
          </p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>• Ask the organizer for the event code</p>
            <p>• Enter it on the home page in the <em>"Join event"</em> field</p>
            <p>• You'll be taken directly to the event detail page</p>
          </div>
          <InfoBox color="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            You can also find all your events (both organized and joined) in <strong>My Events</strong> on the dashboard.
          </InfoBox>
        </Section>

        {/* Event types section */}
        <Section
          title="Event types"
          icon={<Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            When creating an event, you choose a type based on how much is already decided:
          </p>
          <div className="space-y-4">
            <EventTypeRow
              icon={<CheckCircle className="w-4 h-4" />}
              iconColor="text-green-600 dark:text-green-400"
              iconBg="bg-green-50 dark:bg-green-900/20"
              title="Simple event"
              description="You decide the place and time. Participants just confirm attendance. No voting needed."
            />
            <EventTypeRow
              icon={<Users className="w-4 h-4" />}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-50 dark:bg-blue-900/20"
              title="Collaborative proposals"
              description="Both you and participants can suggest options (place + time). Everyone votes on the best one."
            />
            <EventTypeRow
              icon={<Sparkles className="w-4 h-4" />}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-900/20"
              title="Organizer proposals"
              description="Only you add options. Participants vote. Good when you want full control over the choices."
            />
            <EventTypeRow
              icon={<MapPin className="w-4 h-4" />}
              iconColor="text-orange-600 dark:text-orange-400"
              iconBg="bg-orange-50 dark:bg-orange-900/20"
              title="Fixed time, open place"
              description="The time is already decided. Participants share their location preferences and the app generates 3 best matching places."
            />
            <EventTypeRow
              icon={<Clock className="w-4 h-4" />}
              iconColor="text-teal-600 dark:text-teal-400"
              iconBg="bg-teal-50 dark:bg-teal-900/20"
              title="Fixed place, open time"
              description="The place is already decided. Participants submit their available time slots and the app automatically finds the best overlap."
            />
            <EventTypeRow
              icon={<Navigation className="w-4 h-4" />}
              iconColor="text-pink-600 dark:text-pink-400"
              iconBg="bg-pink-50 dark:bg-pink-900/20"
              title="Fully open"
              description="Nothing is decided yet. Participants submit both time and location preferences. The app generates the best place + time combinations for final voting."
            />
          </div>
        </Section>

        {/* Time range vs fixed time section */}
        <Section
          title="Time range vs. fixed time"
          icon={<Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Time range</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                A window of time within which the event should take place. For example,{" "}
                <em>Monday 9:00 — Friday 22:00</em> or Monday 4th - Sunday 10th. Participants submit their available slots
                within this range, and the app finds the best overlap.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Fixed time</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The exact start and end of the event is already known. For example,{" "}
                <em>Saturday 14:00 — 18:00</em>. No time voting needed — the app only helps find the best place.
              </p>
            </div>
            <InfoBox color="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
              <strong>Single day</strong> events use hourly time slots. <strong>Multiday</strong> events let participants vote for preferred days.
            </InfoBox>
          </div>
        </Section>

        {/* Voting phases section */}
        <Section
          title="Voting phases"
          icon={<Vote className="w-5 h-5 text-pink-600 dark:text-pink-400" />}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Events with voting go through these phases:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex-shrink-0 mt-0.5">
                Proposal
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Participants submit their preferences (time availability, location preferences, or proposed options). The event is open for input.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full flex-shrink-0 mt-0.5">
                Final voting
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The organizer generates options based on preferences. Participants vote for their favourite. Only applies to event types with a voting step.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full flex-shrink-0 mt-0.5">
                Closed
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Either the organizer closes the event or if not before event's time range starts, it expires automatically. The winning option is shown to all participants and an email notification is sent.
              </p>
            </div>
          </div>
        </Section>

        {/* Submitting preferences section */}
        <Section
          title="Submitting preferences"
          icon={<MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
        >
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Time preferences</p>
              <p>Select one or more time slots when you're available within the event's time range. The app aggregates everyone's slots and finds the hour or day with the most overlap.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Location preferences</p>
              <p>Choose your preferred type of place (café, restaurant, park...), set a price level and minimum rating, and pin your preferred location on the map. The app averages everyone's input and queries Google Places for the best matches.</p>
            </div>
          </div>
        </Section>

        {/* Admin features section */}
        <Section
          title="Admin features"
          icon={<Lock className="w-5 h-5 text-gray-500" />}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Users with the <strong>Admin</strong> role have access to two extra tools:
          </p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              • <strong>Suspicious activity</strong> — shows users with unusually high event creation activity, useful for detecting misuse.
            </p>
            <p>
              • <strong>Clean up data</strong> — allows bulk deletion of old events past a certain age to keep the database tidy.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}