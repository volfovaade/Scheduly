import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function DashboardPage() {
    const [organized, setOrganized] = useState([]);
    const [participating, setParticipating] = useState([]);

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem("token");
            const res = await axios.get("events/my", {
                headers: {Authorization: `Bearer ${token}`}
            });
            // JWT token has format: header.payload.signature
            // atob decodes base64 string to usual text
            const userId = JSON.parse(atob(token!.split(".")[1])).nameid;
            setOrganized(res.data.filter((e: any) => e.ownerId === userId));
            setParticipating(res.data.filter((e: any) => e.ownerId !== userId));
        };
        load();
    }, []);  // loads just once on component load

    return (
        <div className="p-6">
            <h2 className="text-2xl mb-4">Moje akce</h2>
            <ul className="list-disc ml-6">
                {participating.map((e: any) => <li key={e.id}>{e.title}</li>)}
            </ul>

            <h2 className="text-2xl mt-6 mb-4">Organizuji</h2>
            <ul className="list-disc ml-6">
                {organized.map((e: any) => <li key={e.id}>{e.title}</li>)}
            </ul>
        </div>
    );
}