// components/LocationPreferenceForm.tsx
import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
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
        iconSize: [25, 41],      // default marker size
        iconAnchor: [12, 41],    
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      })}
    />
  );
}

type PlaceType =
  | "Cafe" | "Restaurant" | "Bar" | "Hotel" | "Camping"
  | "Parc" | "Museum" | "Cinema" | "ShoppingMall" | "SportsCenter";

type PriceLevel = 0 | 1 | 2 | 3 | 4;

const PLACE_TYPES: { id: PlaceType; label: string; emoji: string }[] = [
  { id: "Cafe", label: "Café", emoji: "☕" },
  { id: "Restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "Bar", label: "Bar", emoji: "🍺" },
  { id: "Hotel", label: "Hotel", emoji: "🏨" },
  { id: "Camping", label: "Camping", emoji: "⛺" },
  { id: "Parc", label: "Park", emoji: "🌳" },
  { id: "Museum", label: "Museum", emoji: "🏛️" },
  { id: "Cinema", label: "Cinema", emoji: "🎬" },
  { id: "ShoppingMall", label: "Shopping", emoji: "🛍️" },
  { id: "SportsCenter", label: "Sports", emoji: "🏋️" },
];

const PRICE_LABELS = ["Any", "Budget", "Moderate", "Upscale", "Luxury"];
const PRICE_SYMBOLS = ["–", "€", "€€", "€€€", "€€€€"];

export default function LocationPreferenceForm({
  eventId,
  apiEndpoint,
  onClose,
  onSubmit,
}: Props) {
  const endpoint = apiEndpoint || `/events/${eventId}/locationPreferences`;
  const notify = useNotification();

  const [placeType, setPlaceType] = useState<PlaceType>("Cafe");
  const [latitude, setLatitude] = useState<number>(50.0755);
  const [longitude, setLongitude] = useState<number>(14.4378);
  const [zoom] = useState(13);
  const [loading, setLoading] = useState(false);
  const [priceLevel, setPriceLevel] = useState<PriceLevel>(0);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const res = await axios.get(`/events/${eventId}/locationPreferences/my`);
        if (res.data) {
          setPlaceType(res.data.type);
          setLatitude(res.data.latitude);
          setLongitude(res.data.longitude);
          setPriceLevel(res.data.preferredPriceLevel ?? 0);
          setMinRating(res.data.minRating ?? 0);
        }
      } catch {
        // no existing preference — use defaults
      }
    };
    loadPreference();
  }, [eventId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(endpoint, {
        type: placeType,
        latitude,
        longitude,
        preferredPriceLevel: priceLevel,
        minRating,
      });
      notify.info("Location preference saved!");
      await onSubmit();
      onClose();
    } catch {
      notify.error("Failed to save preference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex gap-2 items-center text-gray-900 dark:text-white">
            <MapPin className="w-5 h-5" />
            Select Location Preference
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Place type */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Place type
            </p>
            <div className="grid grid-cols-5 gap-2">
              {PLACE_TYPES.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => setPlaceType(id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    placeType === id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                  }`}
                >
                  <div className="text-xl mb-0.5">{emoji}</div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Price level slider */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price level:{" "}
              <span className="font-bold text-blue-600">
                {PRICE_SYMBOLS[priceLevel]} {PRICE_LABELS[priceLevel]}
              </span>
            </p>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={priceLevel}
              onChange={(e) => setPriceLevel(Number(e.target.value) as PriceLevel)}
              className="w-full accent-blue-600"
            />
            {/* Labels aligned under slider */}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {PRICE_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          {/* Min rating slider */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum rating:{" "}
              <span className="font-bold text-blue-600">
                {minRating > 0 ? `${minRating} ⭐` : "Any"}
              </span>
            </p>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Any</span>
              <span>1.0</span>
              <span>2.0</span>
              <span>3.0</span>
              <span>4.0</span>
              <span>5.0 ⭐</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred location{" "}
                <span className="text-xs text-gray-400 font-normal">
                  (click on map to set)
                </span>
              </p>
            </div>

            <div className="relative w-full h-72 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
              <MapContainer
                center={[latitude, longitude]}
                zoom={zoom}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  latitude={latitude}
                  longitude={longitude}
                  setLatitude={setLatitude}
                  setLongitude={setLongitude}
                />
              </MapContainer>

              <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 shadow">
                📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}