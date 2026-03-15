import { Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

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
          {/* Search */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg
                            focus:ring-2 focus:ring-pink-700 focus:bg-white dark:focus:bg-gray-700
                            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                            transition-all duration-200"
            />
          </div>
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
