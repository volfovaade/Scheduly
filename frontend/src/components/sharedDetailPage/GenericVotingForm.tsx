import { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import { useNotification } from "../../context/NotificationContext";
import { Trash2, MapPin, Calendar, Users, ExternalLink } from "lucide-react";

export interface VoteOption {
  id: string;
  placeName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timeFrom: string;
  timeTo: string;
  source: string;
  voteCount: number;
  totalScore: number;
}

interface GenericVotingFormProps {
  eventId: string;
  title: string;
  voteType: string; // "Final" or "Preference"
  filterOptions?: (opt: VoteOption) => boolean;
  providedOptions?: VoteOption[];
  onDeleteOption?: (optionId: string) => void;
}

export default function GenericVotingForm({
  eventId,
  title,
  voteType,
  filterOptions,
  providedOptions,
  onDeleteOption
}: GenericVotingFormProps) {
  const notify = useNotification();

  const [localOptions, setLocalOptions] = useState<VoteOption[]>([]);
  const optionsToRender = localOptions;

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isMultiSelect = voteType !== "Final";

  const loadMyVote = useCallback(async () => {
    try {
      const res = await axios.get(`/events/${eventId}/votes/my`);
      const existingVotes = res.data.filter((v: any) => 
        v.type?.toLowerCase() === voteType.toLowerCase() ||
        v.Type?.toLowerCase() === voteType.toLowerCase()
      );

      if (existingVotes.length > 0) {
        setSelected(existingVotes.map((v: any) => v.optionId));
      } else {
        setSelected([]); // no votes yet
      }
    } catch (err) {
      console.error("Failed to load my vote:", err);
    }
  }, [eventId, voteType]);

  const loadOptions = useCallback(async () => {
    try {
      const [optionsRes, summaryRes] = await Promise.all([
        providedOptions ? Promise.resolve(null) : axios.get(`/events/${eventId}/options`),
        axios.get(`/events/${eventId}/votes/summary`),
      ]);

      const summary = summaryRes.data;

      if (!providedOptions && optionsRes) {
        // merge options with vote counts from summary
        const withCounts = optionsRes.data.map((opt: VoteOption) => {
          const s = summary.find((s: any) => s.id === opt.id);
          return {
            ...opt,
            voteCount: voteType === "Final"
              ? (s?.finalVotes ?? 0)
              : (s?.preferenceVotes ?? 0),
          };
        });
        setLocalOptions(withCounts);
      } else if (providedOptions) {
        // merge provided options with vote counts
        const withCounts = providedOptions.map((opt) => {
          const s = summary.find((s: any) => s.id === opt.id);
          return {
            ...opt,
            voteCount: voteType === "Final"
              ? (s?.finalVotes ?? 0)
              : (s?.preferenceVotes ?? 0),
          };
        });
        setLocalOptions(withCounts);
      }
    } catch (err) {
      console.error("Failed to load options:", err);
      notify.error("Failed to load voting options");
    }
  }, [eventId, notify, voteType, providedOptions]);

  useEffect(() => {
    loadOptions();
    loadMyVote();
  }, [loadMyVote, loadOptions]);

  const filteredOptions = filterOptions
    ? optionsToRender.filter(filterOptions)
    : optionsToRender;

  const handleToggle = (optionId: string) => {
    if (!isMultiSelect) {
      // for radio
      setSelected([optionId]);
    } else {
      setSelected((prev) => {
        // for checkbox
        if (prev.includes(optionId)) {
          return prev.filter((id) => id !== optionId);
        } else {
          return [...prev, optionId];
        }
      });
    }
  };

  // helper method to generate google maps url
  const getMapsUrl = (opt: VoteOption) => {
    if (opt.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opt.address)}`;
    } else if (opt.latitude && opt.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${opt.latitude},${opt.longitude}`;
    }
    return "#";
  };

  const handleVote = async () => {
    if (selected.length === 0)
      return notify.warning("Please select an one option.");

    setLoading(true);
    try {
      await axios.post(`/events/${eventId}/votes`, {
        votes: selected.map((id) => ({
          optionId: id,
          score: 1,
        })),
      });

      notify.info("Votes submitted successfully");
      await loadMyVote();
      await loadOptions();
    } catch (err) {
      console.error("Vote error:", err);
      notify.error("Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  if (filteredOptions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center border dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          No options available for {title}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-gray-50">{title}</h3>
      <ul className="space-y-4">
        {filteredOptions.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <li
              key={opt.id}
              className={`border p-4 rounded-xl shadow-sm transition-all ${
                isSelected
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type={!isMultiSelect ? "radio" : "checkbox"}
                  name={`vote-${voteType}-${opt.id}`}
                  checked={isSelected}
                  onChange={() => handleToggle(opt.id)}
                  className="mt-1.5 w-5 h-5 cursor-pointer accent-blue-600 dark:[color-scheme:dark]"
                />
                
                <div className="flex-1">
                  <p className="font-bold text-lg dark:text-white leading-tight mb-1">
                    {opt.placeName}
                  </p>

                  <a
                    href={getMapsUrl(opt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
                  >
                    <MapPin size={14} className="shrink-0" />
                    <span className="underline decoration-gray-300 group-hover:decoration-blue-500">
                      {opt.address}
                    </span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200 mb-2">
                    <Calendar size={14} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>
                      {new Date(opt.timeFrom).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      <span className="mx-1 text-gray-400">–</span>
                      {new Date(opt.timeTo).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Users size={14} />
                    <span>{opt.voteCount || 0} {opt.voteCount === 1 ? 'vote' : 'votes'}</span>
                  </div>

                  {onDeleteOption && (
                    <button
                      onClick={(e) => {
                        if (window.confirm("Remove this option?")) onDeleteOption(opt.id);
                      }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                    >
                      <Trash2 size={13} />
                      Remove Option
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleVote}
        disabled={selected.length === 0 || loading}
        className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}
