import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await axios.post("/auth/login", { email, password });
            await login(res.data.token, res.data.userId);
            navigate("/dashboard");
        } catch {
            setMessage("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Login</h2>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                    className="w-full mb-4 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    type="email"
                    disabled={loading}
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                    className="w-full mb-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    disabled={loading}
                />

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => navigate("/forgotPassword")}
                        className="text-sm text-pink-600 dark:text-pink-400 hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                    ) : "Login"}
                </button>

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Don't have an account?</p>
                    <button
                        onClick={() => navigate("/register")}
                        className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
                    >
                        Create an account
                    </button>
                </div>

                {message && <p className="text-red-600 dark:text-red-400 mt-4 text-sm">{message}</p>}
            </div>
        </div>
    );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import axios from "../api/axios";

// export default function LoginPage(){
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");
//     const navigate = useNavigate();
//     const { login } = useAuth();
//     const handleLogin = async () => {
//         setLoading(true); // start loading
//         setMessage("");   // clear old error
//         try {
//             const res = await axios.post("/auth/login", { email, password });
//             await login(res.data.token, res.data.userId);
//             navigate("/dashboard");
//         } catch (err: any) {
//             setMessage("Login failed. Please check your credentials.");
//         } finally {
//             setLoading(false);
//         }
//     };
//     return (
//         <div className="max-w-md mx-auto p-6">
//             <h2 className="text-2xl font-bold mb-4">Login</h2>
      
//             <input
//                 className="w-full mb-3 p-2 border rounded"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 placeholder="Email"
//                 type="email"
//                 disabled={loading}  // disabled while loading
//             />
            
//             <input
//                 className="w-full mb-4 p-2 border rounded"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 placeholder="Password"
//                 type="password"
//                 disabled={loading}
//             />

//             <button
//                 onClick={handleLogin}
//                 disabled={loading}
//                 className="w-full bg-blue-600 text-white px-4 py-2 rounded"
//             >
//                 {loading ? (
//                     <svg
//                         className="animate-spin h-5 w-5 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                     >
//                         <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                         ></circle>
//                         <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
//                         ></path>
//                     </svg>
//                 ) : (
//                     "Login"
//                 )}
//             </button>
//             <div className="mt-4 flex items-center justify-between">
//                 <p>Don't have account yet?</p>
//                 <button
//                     onClick={() => navigate("/register")}
//                     className="text-blue-600 underline"
//                 >
//                     Create an account
//                 </button>
//             </div>

//             {message && <p className="text-red-600 mt-3">{message}</p>}
//         </div>
//     )
// }
