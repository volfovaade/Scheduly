import { useNavigate } from "react-router-dom";
 
export default function NotFoundPage() {
  const navigate = useNavigate();
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="mb-6">
          <span className="text-9xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
            404
          </span>
        </div>

        <div className="text-6xl mb-6">🗓️</div>
 
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Make sure the URL is correct.
        </p>
 
        {/* actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-600 to-pink-800 text-white px-6 py-3 rounded-lg
                       hover:from-pink-700 hover:to-pink-900 font-medium transition-all shadow-lg"
          >
            Go to home page
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                       font-medium transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}