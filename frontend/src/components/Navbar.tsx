import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar (){
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav 
            style={{ backgroundColor: "#970747" }}
            className="text-white px-6 py-3 shadow-md flex justify-between items-center"
        >
        <Link to="/" className="text-xl font-bold">Scheduly</Link>

        <div className="flex gap-4 items-center">
            <Link to="/" className="hover:underline">Home</Link>
            {!isAuthenticated ? (
            <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/register" className="hover:underline">Sign Up</Link>
            </>
            ) : (
            <>
                <span className="text-sm">Hello, {user?.name}</span>
                <Link to="/dashboard" className="hover:underline">My Dashboard</Link>
                <button onClick={() => { logout(); navigate("/"); } } className="hover:underline">Log Out</button>
            </>
            )}
        </div>
        </nav>
    );
}