import { useEffect, useState } from "react";
import axios from "../api/axios";

type Event = {
  id: string;
  title: string;
  description: string;
};
/// not being used at this time --- maybe later for admin page
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

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
