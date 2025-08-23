import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "../api/axios";
import { SquareX } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

enum PlaceType {
    Restaurant = "Restaurant",
    Cafe = "Cafe",
    Park = "Park",
    Other = "Other"
}
type TimeInterval = {
    from: string;
    to: string;  // ISO
};
type Props = {
    eventId: string;
    timeRangeFrom: string;
    timeRangeTo: string;
    onClose: () => void;
    loadPreferencesSummary: () => void;
};

// strip "Z" and adjust for our timezone
function toLocalDateTimeString(isoString: string) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);  // parse UTC
        // check validity of data
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", isoString);
            return "";
        }
        const timeZoneOffset = date.getTimezoneOffset() * 60000;  // in ms
        const localISOTime = new Date(date.getTime() - timeZoneOffset)
                .toISOString()
                .slice(0, 16);  // without Z in the end... "YYYY-MM-DDTHH:mm"
        return localISOTime;
    } catch (err) {
        console.error("Error converting date:", err, isoString);
        return "";
    }
}
function fromLocalDateTimeString(localDateTime: string): string {
    if (!localDateTime) return "";
    
    try {
        // datetime-local is in format YYYY-MM-DDTHH:mm
        // create Date object, automatically interprates as local time
        const date = new Date(localDateTime);
        
        // transfer to ISO string (UTC)
        return date.toISOString();
        
    } catch (error) {
        console.error("Error converting local datetime:", error, localDateTime);
        return "";
    }
}
export default function PlacePreferenceForm({ eventId, timeRangeFrom, timeRangeTo, onClose, loadPreferencesSummary }: Props){
    const PRAGUE_LAT = 50.08;
    const PRAGUE_LNG = 14.42;
    const [type, setType] = useState<PlaceType>(PlaceType.Restaurant);
    const [latitude, setLatitude] = useState(PRAGUE_LAT); // for Prague as default
    const [longitude, setLongitude] = useState(PRAGUE_LNG);
    const [intervals, setIntervals] = useState<TimeInterval[]>([{from: "", to: ""}]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // load existing preferences
        const load = async () => {
            try {
                const res = await axios.get(`/events/${eventId}/preferences/my`);
                setType(res.data.type || PlaceType.Restaurant);
                setLatitude(res.data.latitude || PRAGUE_LAT);
                setLongitude(res.data.longitude || PRAGUE_LNG);

                // if there are no selected intervals yet
                if (res.data.timeIntervals && res.data.timeIntervals.length > 0) {
                    setIntervals(res.data.timeIntervals);
                } else {
                    setIntervals([{from: "", to: ""}]);
                }
            } catch (err) {
                console.error("Couldn't load existing preferences.");
            }
        };
        load();
    }, [eventId]);

    const handleIntervalChange = (index: number, field: 'from' | 'to', value: string) => {
        if (!value) return;

        const newDate = new Date(value);
        const rangeStart = new Date(timeRangeFrom);
        const rangeEnd = new Date(timeRangeTo);

        if (newDate < rangeStart || newDate > rangeEnd) {
            alert(`Selected ${field} time must be between ${toLocalDateTimeString(timeRangeFrom)} and ${toLocalDateTimeString(timeRangeTo)}`);
            return;
        }
        const updated = [...intervals];
        // transfer local datetime to ISO string for saving
        updated[index][field] = value ? fromLocalDateTimeString(value) : "";
        setIntervals(updated);
    };

    const validateIntervals = () => {
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            
            if (!interval.from || !interval.to) {
                alert(`Interval ${i + 1}: Please select both times.`);
                return false;
            }
            
            const fromTime = new Date(interval.from).getTime();
            const toTime = new Date(interval.to).getTime();
            
            if (fromTime >= toTime) {
                alert(`Interval ${i + 1}: Time "from" must be smaller than "to"`);
                return false;
            }
        }
        return true;
    };
    const handleAddInterval = () => {
        setIntervals([...intervals, {from: "", to: ""}]);
    };
    const handleRemoveInterval = (index: number) => {
        if (intervals.length > 1) {
            const updated = intervals.filter((_, idx) => idx !== index);
            setIntervals(updated);
        }
    };
    const handleSave = async () => {
        if (!validateIntervals()) return;
        try {
            setLoading(true);
            await axios.post(`/events/${eventId}/preferences`, {
                type,
                latitude,
                longitude,
                timeIntervals: intervals
            });
            await loadPreferencesSummary();
            onClose();
        } catch (err: any) {
            console.error("Error saving preferences:", err);
            
            if (err.response?.status === 404) {
                alert("Event not found.");
            } else if (err.response?.status === 400) {
                alert("Invalid data. Check please all the fields.");
            } else {
                alert("Couldn't save preferences. Please try again later.");
            }
        } finally {
            setLoading(false);
        }

    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
                    disabled={loading}
                ><SquareX size={18}/></button>

                <h2 className="text-xl font-bold mb-4">Submit Your Place Preference</h2>
                <div className="p-4 border mt-4 bg-white shadow rounded">
                    <h3 className="text-xl font-semibold mb-2">Your preferences</h3>

                    <label className="block mb-1">Place type:</label>
                    <select value={type} onChange={e => setType(e.target.value as PlaceType)} className="border p-1 mb-2">
                        {Object.values(PlaceType).map((pt) => (
                            <option key={pt} value={pt}>
                                {pt}
                            </option>
                        ))}
                    </select>

                    <label className="block mt-2 mb-1">Time intervals:</label>
                    {intervals.map((int, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input
                                type="datetime-local"
                                min={toLocalDateTimeString(timeRangeFrom)}
                                max={toLocalDateTimeString(timeRangeTo)}
                                value={int.from ? toLocalDateTimeString(int.from) : ""}
                                onChange={e => handleIntervalChange(idx, 'from', e.target.value)}
                                className="border p-1"
                            />
                            <input
                                type="datetime-local"
                                min={toLocalDateTimeString(timeRangeFrom)}
                                max={toLocalDateTimeString(timeRangeTo)}
                                value={int.to ? toLocalDateTimeString(int.to) : ""}
                                onChange={e => handleIntervalChange(idx, 'to', e.target.value)}
                                className="border p-1"
                            />
                            {intervals.length > 1 && (
                                <button
                                    onClick={() => handleRemoveInterval(idx)}
                                    className="text-red-600 hover:text-red-800 p-1 text-sm"
                                    title="Remove interval"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={handleAddInterval} className="text-sm text-blue-600 mb-4">+ Add time interval</button>
                    
                    <label className="block mb-2">Select location (click on the map):</label>
                    <div className="h-60 mb-4 rounded overflow-hidden">
                        <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapMarkerSetter setLat={setLatitude} setLong={setLongitude} />
                            <Marker position={[latitude, longitude]} icon={customIcon} />
                        </MapContainer>
                    </div>

                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
                        {loading ? "Saving..." : "Save preference"}
                    </button>
                </div>
            </div>
        </div>
    );
}
function MapMarkerSetter({ setLat, setLong }: { setLat: (v: number) => void; setLong: (v: number) => void }){
    useMapEvents({
        click(e: { latlng: { lat: number; lng: number; }; }) {
            setLat(e.latlng.lat);
            setLong(e.latlng.lng);
        }
    });
    return null;
}
 