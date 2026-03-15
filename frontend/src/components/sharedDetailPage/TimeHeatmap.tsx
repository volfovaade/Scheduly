import React from "react";

interface TimeItem {
  day: string;
  hour?: number;
  count: number;
}

interface Props {
  data: TimeItem[];
  totalParticipants: number;
  isMultiDay?: boolean;
}

const getHeatColor = (pct: number): string => {
  if (pct === 0) return "rgb(243 244 246)";
  // IInterpolation from red (0%) through yellow (50%) to green (100%)
  if (pct < 50) {
    const t = pct / 50;
    const r = 239;
    const g = Math.round(68 + (196 - 68) * t);
    const b = 68;
    return `rgb(${r} ${g} ${b})`;
  } else {
    const t = (pct - 50) / 50;
    const r = Math.round(239 + (22 - 239) * t);
    const g = Math.round(196 + (163 - 196) * t);
    const b = 68;
    return `rgb(${r} ${g} ${b})`;
  }
};

const formatDay = (day: string) =>
  new Date(day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function TimeHeatmap({
  data,
  totalParticipants,
  isMultiDay = false,
}: Props) {
  if (!data || data.length === 0) return null;

  const total = totalParticipants || 1;

  if (isMultiDay) {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const max = sorted[0]?.count || 1;

    return (
      <div className="space-y-2">
        {sorted.map((item) => {
          const pct = (item.count / total) * 100;
          const barPct = (item.count / max) * 100;

          return (
            <div key={item.day} className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatDay(item.day)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.count} / {total}
                  <span className="ml-1 text-gray-400">
                    ({Math.round(pct)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                <div
                  className="h-5 rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: getHeatColor(pct),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Single day
  const days = Array.from(new Set(data.map((d) => d.day))).sort();
  const hours = Array.from(new Set(data.map((d) => d.hour ?? 0))).sort(
    (a, b) => a - b,
  );

  const getCount = (day: string, hour: number) =>
    data.find((d) => d.day === day && d.hour === hour)?.count ?? 0;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex mb-1 ml-24">
          {hours.map((hour) => (
            <div
              key={hour}
              className="text-center text-gray-400 dark:text-gray-500"
              style={{ width: 20, fontSize: 10 }}
            >
              {hour % 3 === 0 ? hour : ""}
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day} className="flex items-center mb-1 gap-1">
            <div
              className="text-xs text-gray-600 dark:text-gray-400 text-right shrink-0"
              style={{ width: 88 }}
            >
              {formatDay(day)}
            </div>

            <div className="flex gap-px">
              {hours.map((hour) => {
                const count = getCount(day, hour);
                const pct = (count / total) * 100;

                return (
                  <div
                    key={hour}
                    title={`${formatDay(day)} ${hour}:00 — ${count}/${total} (${Math.round(pct)}%)`}
                    className="rounded-sm transition-transform hover:scale-y-125 hover:z-10 relative cursor-pointer"
                    style={{
                      width: 18,
                      height: 28,
                      backgroundColor: getHeatColor(pct),
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legenda */}
        <div className="flex items-center gap-2 mt-4 ml-24">
          <span className="text-xs text-gray-400">0%</span>
          <div className="flex gap-px">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
              <div
                key={p}
                className="rounded-sm"
                style={{
                  width: 16,
                  height: 12,
                  backgroundColor: getHeatColor(p),
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">100%</span>
        </div>
      </div>
    </div>
  );
}
