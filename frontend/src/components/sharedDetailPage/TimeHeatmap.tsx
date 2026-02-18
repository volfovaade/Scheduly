import React from "react";

interface TimeItem {
    day: string;      // "2025-01-10"
    hour?: number;    // undefined pokud multiday
    count: number;
}

interface Props {
    data: TimeItem[];
    totalParticipants: number;
    isMultiDay?: boolean;
}

export default function TimeHeatmap({ 
    data, 
    totalParticipants,
    isMultiDay = false 
}: Props) {

    if (!data || data.length === 0) return null;

    // pokud není multiday, agregujeme do 2h bloků
    const processed: TimeItem[] = [];

    data.forEach(item => {

        const hour = isMultiDay 
            ? undefined 
            : Math.floor((item.hour ?? 0) / 2) * 2;

        const existing = processed.find(
            p => p.day === item.day && p.hour === hour
        );

        if (existing) {
            existing.count += item.count;
        } else {
            processed.push({
                day: item.day,
                hour,
                count: item.count
            });
        }
    });

    const days = Array.from(new Set(processed.map(d => d.day)));

    const hours = isMultiDay
        ? []
        : Array.from(new Set(processed.map(d => d.hour)))
              .sort((a, b) => (a ?? 0) - (b ?? 0));

    const getCount = (day: string, hour?: number) => {
        const found = processed.find(
            d => d.day === day && d.hour === hour
        );
        return found?.count || 0;
    };

    const getHeatColor = (percentage: number) => {
        if (percentage >= 90) return "rgb(22 163 74)";
        if (percentage >= 70) return "rgb(59 130 246)";
        if (percentage >= 50) return "rgb(168 85 247)";
        if (percentage >= 30) return "rgb(249 115 22)";
        if (percentage > 0)  return "rgb(239 68 68)";
        return "rgb(229 231 235)";
    };

    return (
        <div className="overflow-x-auto">
            <div
                className="grid gap-1"
                style={{
                    gridTemplateColumns: isMultiDay
                        ? "120px 60px"
                        : `120px repeat(${hours.length}, 40px)`
                }}
            >
                {/* HEADER */}
                <div></div>
                {!isMultiDay &&
                    hours.map(hour => (
                        <div key={hour} className="text-xs text-center text-gray-500">
                            {hour}
                        </div>
                    ))
                }

                {/* ROWS */}
                {days.map(day => (
                    <React.Fragment key={day}>
                        <div className="text-sm font-medium">
                            {day}
                        </div>

                        {isMultiDay ? (
                            (() => {
                                const count = getCount(day);
                                const percentage = (count / (totalParticipants || 1)) * 100;

                                return (
                                    <div
                                        title={`${day} — ${count} votes`}
                                        className="h-8 w-14 rounded transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: getHeatColor(percentage)
                                        }}
                                    />
                                );
                            })()
                        ) : (
                            hours.map(hour => {
                                const count = getCount(day, hour);
                                const percentage = (count / (totalParticipants || 1)) * 100;

                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        title={`${day} ${hour}:00 — ${count} votes`}
                                        className="h-8 w-8 rounded transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: getHeatColor(percentage)
                                        }}
                                    />
                                );
                            })
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
