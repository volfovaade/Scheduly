import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { useNotification } from "../../context/NotificationContext";

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
}

export default function GenericVotingForm({
  eventId,
  title,
  voteType,
  filterOptions,
  providedOptions,
}: GenericVotingFormProps) {
  const notify = useNotification();

  const [localOptions, setLocalOptions] = useState<VoteOption[]>([]);
  const optionsToRender = providedOptions || localOptions;

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isMultiSelect = voteType !== "Final";

  useEffect(() => {
    if (!providedOptions) {
      loadOptions();
    }
    loadMyVote();
  }, [eventId, voteType, providedOptions]);

  const loadOptions = async () => {
    try {
      const res = await axios.get(`/events/${eventId}/options`);
      setLocalOptions(res.data);
    } catch (err) {
      console.error("Failed to load options:", err);
      notify.error("Failed to load voting options");
    }
  };

  const filteredOptions = filterOptions
    ? optionsToRender.filter(filterOptions)
    : optionsToRender;

  const loadMyVote = async () => {
    try {
      const res = await axios.get(`/events/${eventId}/votes/my`);
      const existingVotes = res.data.filter((v: any) => v.type === voteType);

      if (existingVotes.length > 0) {
        setSelected(existingVotes.map((v: any) => v.optionId));
      } else {
        setSelected([]); // no votes yet
      }
    } catch (err) {
      console.error("Failed to load my vote:", err);
    }
  };

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
              className={`border p-4 rounded shadow transition-all ${
                isSelected
                  ? "border-blue-500 dark:border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
              }`}
            >
              <label className="flex ml-4 mr-4 items-center gap-8 cursor-pointer">
                <div className="flex-1">
                  <p className="font-semibold text-lg dark:text-gray-50">
                    {opt.placeName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 dark:text-gray-200">
                    {opt.address}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-100">
                    📅{" "}
                    {new Date(opt.timeFrom).toLocaleString("en-US", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                    {" – "}
                    {new Date(opt.timeTo).toLocaleString("en-US", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-50 mt-2">
                    👥 Votes: {opt.voteCount || 0}
                  </p>
                </div>
                <input
                  type={!isMultiSelect ? "radio" : "checkbox"}
                  name={`vote-${voteType}`}
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => handleToggle(opt.id)}
                  className="w-4 h-4 dark:[color-scheme:dark]"
                />
              </label>
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleVote}
        disabled={selected.length === 0 || loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}
