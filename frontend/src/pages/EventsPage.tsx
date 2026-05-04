import { useEffect, useState } from "react";
import axios from "../api/axios";

/** Represents a basic event summary */
type Event = {
  id: string;
  title: string;
  description: string;
};

/**
 * Events listing page (currently not active in the main navigation).
 * This page fetches and displays all events in the system.
 * May be used for admin purposes or expanded in the future.
 *
 * @returns Events list view
 */
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  /**
   * Fetches all events from the backend when component mounts.
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Error loading events", err);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> - {e.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
