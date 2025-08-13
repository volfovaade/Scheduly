import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "../api/axios";
import { SquareX } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { NOTFOUND } from "dns";

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
    const date = new Date(isoString);  // parse UTC
    const timeZoneOffset = date.getTimezoneOffset() * 60000;  // in ms
    const localISOTime = new Date(date.getTime() - timeZoneOffset)
            .toISOString()
            .slice(0, 16);  // without Z in the end... "YYYY-MM-DDTHH:mm"
    return localISOTime;
}
export default function PlacePreferenceForm({ eventId, timeRangeFrom, timeRangeTo, onClose, loadPreferencesSummary }: Props){
    const [type, setType] = useState<PlaceType>(PlaceType.Other);
    const [latitude, setLatitude] = useState(50.08); // for Prague as default
    const [longitude, setLongitude] = useState(14.42);
    const [intervals, setIntervals] = useState<TimeInterval[]>([{from: "", to: ""}]);
    
    useEffect(() => {
        // load existing preferences
        const load = async () => {
            try {
                const res = await axios.get(`/events/${eventId}/preferences/my`);
                if (res.status === 404) {
                    return;  // defaults will stay set
                };
                setType(res.data.type);
                setLatitude(res.data.latitude);
                setLongitude(res.data.longitude);
                setIntervals(res.data.timeIntervals);
            } catch (err) {
                console.error("Couldn't load existing preferences.");
            }
        };
        load();
    }, [eventId]);
    const handleAddInterval = () => {
        setIntervals([...intervals, {from: "", to: ""}]);
    };
    const handleSave = async () => {
        await axios.post(`/events/${eventId}/preferences`, {
            type,
            latitude,
            longitude,
            timeIntervals: intervals
        });
        alert("Preferences saved");
        await loadPreferencesSummary();
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
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
                                onChange={e => {
                                    const updated = [...intervals];
                                    updated[idx].from = e.target.value;
                                    setIntervals(updated);
                                }}
                                className="border p-1"
                            />
                            <input
                                type="datetime-local"
                                min={toLocalDateTimeString(timeRangeFrom)}
                                max={toLocalDateTimeString(timeRangeTo)}
                                value={int.to ? toLocalDateTimeString(int.to) : ""}
                                onChange={e => {
                                    const updated = [...intervals];
                                    updated[idx].to = e.target.value;
                                    setIntervals(updated);
                                }}
                                className="border p-1"
                            />
                        </div>
                    ))}
                    <button onClick={handleAddInterval} className="text-sm text-blue-600 mb-4">+ Add time interval</button>
                    
                    <label className="block mb-2">Select location:</label>
                    <div className="h-60 mb-4 rounded overflow-hidden">
                        <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapMarkerSetter setLat={setLatitude} setLong={setLongitude} />
                            <Marker position={[latitude, longitude]} icon={customIcon} />
                        </MapContainer>
                    </div>

                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
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
 