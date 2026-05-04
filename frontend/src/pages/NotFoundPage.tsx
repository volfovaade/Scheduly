import { MoveLeft, Home, Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * 404 Not Found page displayed when user navigates to a non-existent route.
 * Provides friendly messaging and navigation options to return.
 *
 * @returns The 404 error page
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        <div className="mb-6 flex flex-col items-center">
          <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4 animate-bounce">
            <Ghost size={48} className="text-pink-600 dark:text-pink-400" />
          </div>
          <span className="text-9xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Make sure the URL is correct.
        </p>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-800 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Home size={18} />
            Back to Home
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoveLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}