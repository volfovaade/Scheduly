import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";

interface FinalOption {
  id: string;
  placeName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timeFrom: string;
  timeTo: string;
  source: string; // Manual, Generated, System
  voteCount: number;
  totalScore: number;
}
interface Props {
  eventId: string;
}

export default function FinalVotingForm({ eventId }: Props) {
  const notify = useNotification();
  const [options, setOptions] = useState<FinalOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadMyVote();
  }, [eventId]);

  const loadOptions = async () => {
    try {
      const res = await axios.get(`/events/${eventId}/options`);
      // filter out just generated options
      const generatedOptions = res.data.filter(
        (opt: FinalOption) => opt.source === "Generated",
      );
      setOptions(generatedOptions);
    } catch (err) {
      console.error("Failed to load options:", err);
      notify.error("Failed to load voting options");
    }
  };
  // load already sent vote
  const loadMyVote = async () => {
    try {
      const res = await axios.get(`/events/${eventId}/votes/my`);
      // find vote of type Final
      const finalVote = res.data.find((v: any) => v.type === "Final");
      if (finalVote) {
        setSelected(finalVote.optionId);
      }
    } catch (err) {
      console.error("Failed to load my vote:", err);
    }
  };

  const handleVote = async () => {
    if (!selected) return notify.warning("Please select an option.");

    setLoading(true);
    try {
      await axios.post(
        `/events/${eventId}/votes`,
        {
          votes: [
            {
              optionId: selected,
              score: 1,
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      notify.info("Vote submitted");
      await loadOptions(); // refresh with current number of votes
    } catch (err) {
      console.error("Vote error:", err);
      notify.error("Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  if (options.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">No options available for voting yet.</p>
      </div>
    );
  }
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-50">
        Final Voting - Select Your Preferred Option
      </h3>
      <ul className="space-y-4">
        {options.map((opt) => (
          <li
            key={opt.id}
            className={`border p-4 rounded shadow transition-all ${
              selected === opt.id
                ? "border-blue-500 dark:border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
            }`}
          >
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="radio"
                name="final"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
                className="mt-1 dark:[color-scheme:dark]"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg dark:text-gray-50">
                  {opt.placeName}
                </p>
                <p className="text-sm text-gray-600 mb-2 dark:text-gray-200">
                  {opt.address}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-100">
                  📅{" "}
                  {new Date(opt.timeFrom).toLocaleString("cs-CZ", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                  {" – "}
                  {new Date(opt.timeTo).toLocaleString("cs-CZ", {
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-50 mt-2">
                  👥 Current votes: {opt.voteCount || 0}
                </p>
              </div>
            </label>
          </li>
        ))}
      </ul>
      <button
        onClick={handleVote}
        disabled={!selected || loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}
