import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function RegisterPage() {
    const notify = useNotification();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const register = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/auth/register", form);
            await login(res.data.token, res.data.userId);
            navigate("/dashboard");
        } catch {
            notify.error("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <form onSubmit={register} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Account</h2>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                    name="name"
                    onChange={handleChange}
                    value={form.name}
                    required
                    disabled={loading}
                    placeholder="Your name"
                    className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={form.email}
                    required
                    disabled={loading}
                    placeholder="your@email.com"
                    className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                    name="password"
                    type="password"
                    onChange={handleChange}
                    value={form.password}
                    required
                    disabled={loading}
                    placeholder="Min. 6 characters"
                    className="w-full mb-6 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                    ) : "Create Account"}
                </button>

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Already have an account?</p>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

// import { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useNotification } from "../context/NotificationContext";

// export default function RegisterPage (){
//     const notify = useNotification();
//     const [form, setForm] = useState({name: "", email: "", password: ""});
//     const navigate = useNavigate();
//     const { login } = useAuth();
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
//         setForm({...form, [e.target.name]: e.target.value});

//     const register = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const res = await axios.post("/auth/register", form); 
//             await login(res.data.token, res.data.userId); // login after registration
//             navigate("/dashboard");
//         } catch (err) {
//             notify.error("Registration failed.");
//         } finally {
//             setLoading(false);
//         }
//     };
//     return (
//         <form onSubmit={register} className="max-w-md mx-auto p-6">
//         <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

//         <label className="block mb-1">Name</label>
//         <input
//             name="name"
//             onChange={handleChange}
//             value={form.name}
//             required
//             disabled={loading}
//             className="border p-2 mb-3 w-full rounded"
//         />

//         <label className="block mb-1">Email</label>
//         <input
//             name="email"
//             type="email"
//             onChange={handleChange}
//             value={form.email}
//             required
//             disabled={loading}
//             className="border p-2 mb-3 w-full rounded"
//         />

//         <label className="block mb-1">Password</label>
//         <input
//             name="password"
//             type="password"
//             onChange={handleChange}
//             value={form.password}
//             required
//             disabled={loading}
//             className="border p-2 mb-4 w-full rounded"
//         />

//         <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-green-600 text-white px-4 py-2 rounded"
//         >
//         {loading ? (
//                 <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                 >
//                     <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                     ></circle>
//                     <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
//                     ></path>
//                 </svg>
//             ) : (
//                 "Register"
//             )}
//         </button>
//         </form>
//     );
// }