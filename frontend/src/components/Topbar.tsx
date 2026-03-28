import { Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  toggleSidebar: () => void;
};

export function TopBar({ toggleSidebar }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="sticky top-0 z-20
            bg-white/80 backdrop-blur-md dark:bg-gray-900/80 
            border-b border-gray-200 dark:border-gray-700 
            shadow-md dark:shadow-white/5 dark:shadow-md px-6 py-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
