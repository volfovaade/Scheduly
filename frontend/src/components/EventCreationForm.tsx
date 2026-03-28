import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
  X,
} from "lucide-react";

type EventMode =
  | "SingleOption"
  | "CollaborativeOptions"
  | "OrganizerOptions"
  | "FixedTimeOpenPlace"
  | "FixedPlaceOpenTime"
  | "FullyOpen";

interface EventType {
  id: EventMode;
  title: string;
  description: string;
  icon: any;
  requiresTimeRange: boolean;
  requiresFixedPlace: boolean;
  requiresFixedTime: boolean;
  allowsParticipantOptions: boolean;
}

const EVENT_TYPES: EventType[] = [
  {
    id: "SingleOption",
    title: "Simple event",
    description: "You set the place and time, others just sign up",
    icon: CheckCircle,
    requiresTimeRange: false,
    requiresFixedPlace: true,
    requiresFixedTime: true,
    allowsParticipantOptions: false,
  },
  {
    id: "CollaborativeOptions",
    title: "Collaborative proposals",
    description: "Anyone can add suggestions for place and time",
    icon: Users,
    requiresTimeRange: true,
    requiresFixedPlace: false,
    requiresFixedTime: false,
    allowsParticipantOptions: true,
  },
  {
    id: "OrganizerOptions",
    title: "Organizer proposals",
    description: "Only you can add options, others vote on them",
    icon: Sparkles,
    requiresTimeRange: true,
    requiresFixedPlace: false,
    requiresFixedTime: false,
    allowsParticipantOptions: false,
  },
  {
    id: "FixedTimeOpenPlace",
    title: "Fixed time, finding a place",
    description: "The time is set, we’ll generate the 3 best locations",
    icon: MapPin,
    requiresTimeRange: false,
    requiresFixedPlace: false,
    requiresFixedTime: true,
    allowsParticipantOptions: false,
  },
  {
    id: "FixedPlaceOpenTime",
    title: "Fixed place, finding a time",
    description: "The place is set, we’ll find an overlap of available times",
    icon: Clock,
    requiresTimeRange: true,
    requiresFixedPlace: true,
    requiresFixedTime: false,
    allowsParticipantOptions: false,
  },
  {
    id: "FullyOpen",
    title: "Fully open event",
    description: "We’ll generate the best places and times from preferences",
    icon: Calendar,
    requiresTimeRange: true,
    requiresFixedPlace: false,
    requiresFixedTime: false,
    allowsParticipantOptions: false,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: any) => void;
}

export default function CreateEventDialog({
  isOpen,
  onClose,
  onCreate,
}: Props) {
  const [step, setStep] = useState(1);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [eventType, setEventType] = useState<EventMode | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [rangeFrom, setRangeFrom] = useState<Date | null>(null);
  const [rangeTo, setRangeTo] = useState<Date | null>(null);

  const [fixedPlace, setFixedPlace] = useState("");
  const [fixedAddress, setFixedAddress] = useState("");

  const [fixedTimeFrom, setFixedTimeFrom] = useState<Date | null>(null);
  const [fixedTimeTo, setFixedTimeTo] = useState<Date | null>(null);

  const selectedType = EVENT_TYPES.find((t) => t.id === eventType);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // func to scroll up
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleReset = useCallback(() => {
    setStep(1);
    setIsMultiDay(false);
    setEventType(null);
    setTitle("");
    setDescription("");
    setError("");
    setRangeFrom(getDefaultDate(9));
    setRangeTo(getDefaultDate(16));
    setFixedPlace("");
    setFixedAddress("");
    setFixedTimeFrom(getDefaultDate(9));
    setFixedTimeTo(getDefaultDate(16));
  },[]);


  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen, handleReset]);

  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // minimum is tomorrow
    tomorrow.setHours(0, 0, 0, 0);
    return new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  const getDefaultDate = (hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // tomorrow
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const validateTimeRange = (
    from: Date | null,
    to: Date | null,
    isFixedTime = false,
  ): string => {
    if (!from || !to) return "";
    if (from >= to) return "Start time must be before end time";

    const diffInMs = to.getTime() - from.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (isFixedTime) {
      if (isMultiDay && diffInHours < 24)
        return "Event time must be at least 24 hours for multiday events";
      if (!isMultiDay && diffInHours > 24)
        return "Event time cannot exceed 24 hours for single day events";
    } else {
      // timeRange
      if (isMultiDay && diffInHours < 24)
        return "Time range must be at least 24 hours for multiday events";
      if (!isMultiDay && diffInHours < 1)
        return "Time range must be at least 1 hour";
    }

    return "";
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("The event name is mandatory");
      scrollToTop();
      return;
    }

    if (selectedType?.requiresTimeRange && (!rangeFrom || !rangeTo)) {
      setError("Please fill in the time range");
      scrollToTop();
      return;
    }

    if (selectedType?.requiresTimeRange) {
      const validationError = validateTimeRange(rangeFrom, rangeTo, false);
      if (validationError) {
        setError(validationError);
        scrollToTop();
        return;
      }
    }
    if (selectedType?.requiresFixedTime && fixedTimeFrom && fixedTimeTo) {
      const validationError = validateTimeRange(
        fixedTimeFrom,
        fixedTimeTo,
        true,
      );
      if (validationError) {
        setError(validationError);
        scrollToTop();
        return;
      }
    }
    if (selectedType?.requiresFixedPlace && !fixedPlace.trim()) {
      setError("Please fill in the fixed place");
      scrollToTop();
      return;
    }

    if (selectedType?.requiresFixedTime && (!fixedTimeFrom || !fixedTimeTo)) {
      setError("Please fill in the fixed time of the event");
      scrollToTop();
      return;
    }
    onCreate({
      title,
      description,
      mode: eventType,
      isMultiDay,
      timeRangeFrom: rangeFrom?.toISOString(),
      timeRangeTo: rangeTo?.toISOString(),
      fixedPlace,
      fixedAddress,
      fixedTimeFrom: fixedTimeFrom?.toISOString(),
      fixedTimeTo: fixedTimeTo?.toISOString(),
      allowParticipantOptions: selectedType?.allowsParticipantOptions,
    });

    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={scrollContainerRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r  from-pink-700 to-pink-900 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">New event</h2>
              <p className="text-pink-100 text-sm mt-1">Step {step} out of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
                Will the event be one or multiday?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setIsMultiDay(false);
                    setRangeFrom(getDefaultDate(9));
                    setRangeTo(getDefaultDate(16));
                    setStep(2);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-pink-600 hover:bg-pink-50 dark:border-gray-700 dark:hover:bg-gray-600 transition-all group"
                >
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-pink-600" />
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Single day
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Event over one day
                  </p>
                </button>
                <button
                  onClick={() => {
                    setIsMultiDay(true);
                    const from = getDefaultDate(9);
                    const to = new Date(from);
                    to.setDate(from.getDate() + 2);
                    to.setHours(16, 0, 0, 0);
                    setRangeFrom(from);
                    setRangeTo(to);
                    setStep(2);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-pink-600 hover:bg-pink-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-all group"
                >
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-pink-600" />
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Multiday
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Event over multiple days
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Choose event type
                </h3>
                <button
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="text-sm text-pink-700 hover:text-pink-800 dark:hover:text-pink-600"
                >
                  ← Back
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EVENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setEventType(type.id);
                        setStep(3);
                      }}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-pink-600 hover:bg-pink-50 dark:border-gray-700 dark:hover:bg-gray-600 transition-all text-left group"
                    >
                      <Icon className="w-10 h-10 mb-3 text-gray-400 group-hover:text-pink-600" />
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {type.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && selectedType && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Event details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">
                    {selectedType.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStep(2);
                    setError("");
                  }}
                  className="text-sm text-pink-700 hover:text-pink-800 dark:hover:text-pink-600"
                >
                  ← Change type
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event title *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="For example: weekend trip..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional event description..."
                  rows={3}
                />
              </div>

              {selectedType.requiresTimeRange && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isMultiDay ? "Time range (min. 24 hours) *" : "Time range (min. 1 hour) *"}
                  </label>
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                    <div className="w-full">
                      <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block sm:hidden">From</label>
                      <input
                        type="datetime-local"
                        min={getMinDateTime()}
                        value={formatDateTime(rangeFrom)}
                        onChange={(e) => setRangeFrom(new Date(e.target.value))}
                        className="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block sm:hidden">To</label>
                      <input
                        type="datetime-local"
                        min={rangeFrom ? formatDateTime(rangeFrom) : getMinDateTime()}
                        value={formatDateTime(rangeTo)}
                        onChange={(e) => setRangeTo(new Date(e.target.value))}
                        className="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType.requiresFixedPlace && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fixed place *
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-1"
                      value={fixedPlace}
                      onChange={(e) => setFixedPlace(e.target.value)}
                      placeholder="For example: Café Na rohu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-1"
                      value={fixedAddress}
                      onChange={(e) => setFixedAddress(e.target.value)}
                      placeholder="For example: Karlovo náměstí 5, Praha 2"
                    />
                  </div>
                </div>
              )}

              {selectedType.requiresFixedTime && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fixed event time *
                  </label>
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                    <div className="w-full min-w-0">
                      <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">From</label>
                      <input
                        type="datetime-local"
                        min={getMinDateTime()}
                        value={formatDateTime(fixedTimeFrom)}
                        onChange={(e) => setFixedTimeFrom(new Date(e.target.value))}
                        className="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">To</label>
                      <input
                        type="datetime-local"
                        min={fixedTimeFrom ? formatDateTime(fixedTimeFrom) : getMinDateTime()}
                        max={!isMultiDay && fixedTimeFrom
                          ? formatDateTime(new Date(fixedTimeFrom.getTime() + 24 * 60 * 60 * 1000))
                          : undefined}
                        value={formatDateTime(fixedTimeTo)}
                        onChange={(e) => setFixedTimeTo(new Date(e.target.value))}
                        className="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white rounded-lg hover:from-pink-700 hover:to-pink-900 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Create event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
