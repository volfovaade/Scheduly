// components/LocationPreferenceForm.tsx
import { useState, useEffect } from "react";
import { MapPin, X, Locate } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import axios from "../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Props {
    eventId: string;
    apiEndpoint?: string;
    onClose: () => void;
    onSubmit: () => void;
}
function LocationMarker({ latitude, longitude, setLatitude, setLongitude }: any) {
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });

  return (
    <Marker
      position={[latitude, longitude]}
      icon={L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      })}
    />
  );
}
type PlaceType = "Parc" | "Cafe" | "Restaurant" | "Other";

export default function LocationPreferenceForm({ eventId, apiEndpoint, onClose, onSubmit }: Props) {
    const endpoint = apiEndpoint || `/events/${eventId}/locationPreferences`;
    const notify = useNotification();
    const [placeType, setPlaceType] = useState<PlaceType>("Cafe");
    const [latitude, setLatitude] = useState<number>(50.0755); // Prague default
    const [longitude, setLongitude] = useState<number>(14.4378);
    const [zoom, setZoom] = useState(13);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    // Load existing preference
    useEffect(() => {
        const loadPreference = async () => {
            try {
                const res = await axios.get(`/events/${eventId}/locationPreferences/my`);
                if (res.data) {
                    setPlaceType(res.data.type);
                    setLatitude(res.data.latitude);
                    setLongitude(res.data.longitude);
                }
            } catch (err) {
                console.error("Failed to load preference:", err);
            }
        };
        loadPreference();
    }, [eventId]);

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    setZoom(15);
                    setLocating(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    notify.error("Could not get your location");
                    setLocating(false);
                }
            );
        } else {
            notify.warning("Geolocation is not supported by your browser");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post(endpoint, {
                type: placeType,
                latitude,
                longitude
            });
            notify.info("Location preference saved!");
            await onSubmit();
            onClose();
        } catch (err) {
            notify.error("Failed to save preference");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <MapPin className="w-6 h-6" />
                                Select Your Preferred Location
                            </h2>
                            <p className="text-green-100 text-sm mt-1">
                                Click on the map or adjust coordinates below
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Place Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            What type of place do you prefer?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Parc", "Cafe", "Restaurant", "Other"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setPlaceType(type as PlaceType)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        placeType === type
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg"
                                            : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                                    }`}
                                >
                                    <div className="text-3xl mb-2">
                                        {type === "Parc" && "🌳"}
                                        {type === "Cafe" && "☕"}
                                        {type === "Restaurant" && "🍽️"}
                                        {type === "Other" && "📍"}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {type}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* OpenStreetMap */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select location on map
                            </label>
                            <button
                                onClick={handleGetCurrentLocation}
                                disabled={locating}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                <Locate className="w-4 h-4" />
                                {locating ? "Locating..." : "Use My Location"}
                            </button>
                        </div>
                        
                        <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-inner">

                            <MapContainer
                                center={[latitude, longitude]}
                                zoom={zoom}
                                className="w-full h-full rounded-xl"
                            >
                                <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker
                                latitude={latitude}
                                longitude={longitude}
                                setLatitude={setLatitude}
                                setLongitude={setLongitude}
                                />
                            </MapContainer>

                            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            💡 Tip: You can click on "Use My Location" to set your current position as preffered location.
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Your Preference:
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>📍 Place Type: <strong className="text-gray-900 dark:text-white">{placeType}</strong></p>
                            <p>🌍 Location: <strong className="text-gray-900 dark:text-white font-mono">{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong></p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Location"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}