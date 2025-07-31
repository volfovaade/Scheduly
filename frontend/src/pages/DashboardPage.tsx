import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CreateEventDialog from "../components/CreateEventDialog";

type Event = {
    id: string;
    title: string;
    description: string;
    ownerId: string;
}
export default function DashboardPage() {
    const [organized, setOrganized] = useState<Event[]>([]);
    const [participating, setParticipating] = useState<Event[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {  
            // !!!!!!!!!!!!!!!!!!!!!! maybe add try/catch so if you are not logged in 
            // and we put /dashboard to url, it does not end up with error but goes back to main page
            const res = await axios.get("events/my");
            const userId = sessionStorage.getItem("userId");
            setOrganized(res.data.filter((e: any) => e.ownerId === userId));
            setParticipating(res.data.filter((e: any) => e.ownerId !== userId));
        };
        load();
    }, []);  // loads just once on component load

    const handleAddEvent = async (data: { title: string; description: string }) => {
        try {
            const res = await axios.post("events", data);
            setOrganized((prev) => [...prev, res.data]);
        } catch (err) {
            alert("Event creation failed.");
            console.error(err);
        }
    }
    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };
    const handleGoToDetail = (id: string) => {
        navigate(`/events/${id}`);
    }
    return (
        <div className="p-6">
            <h2 className="text-2xl mb-4">My events</h2>
            <ul className="list-disc ml-6">
                {participating.map((e: any) => <button onClick={() => handleGoToDetail(e.id)} key={e.id}>{e.title}</button>)}
            </ul>

            <h2 className="text-2xl mt-6 mb-4">Organizing</h2>
            <ul className="list-disc ml-6">
                {organized.map((e: any) => <button onClick={() => handleGoToDetail(e.id)} key={e.id}>{e.title}</button>)}
            </ul>
            <CreateEventDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onCreate={handleAddEvent}
            />
            <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowDialog(true)}>
                Add event
            </button>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}