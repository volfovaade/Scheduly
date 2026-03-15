import {
  X,
  Calendar,
  Settings,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  Trash2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/badge.png";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export function Sidebar({ isOpen, toggleSidebar }: Props) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const menuItems = [
    { icon: Home, label: "Home & Join", href: "/" },
    { icon: Calendar, label: "My events", href: "/dashboard" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  const adminMenuItems = [
    { icon: Trash2, label: "Clean up data", href: "/admin/cleanup" },
    {
      icon: AlertTriangle,
      label: "Suspicious activity",
      href: "/admin/suspicious",
    },
  ];
  const authItems = isAuthenticated
    ? [{ icon: LogOut, label: "Log out", action: logout, href: "/" }]
    : [
        { icon: LogIn, label: "Log in", action: null, href: "/login" },
        { icon: UserPlus, label: "Sign up", action: null, href: "/register" },
      ];

  return (
    <>
      {/* Backdrop - if window smaller, the main content will be darkened*/}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
      <div
        className={`
                fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900
                transform transition-transform duration-300 ease-in-out z-50
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0
                shadow-xl dark:shadow-white/10
                border-r border-gray-200 dark:border-gray-700
            `}
      >
        {/* Header in sidebar*/}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Scheduly logo"
                className="w-10 h-9 text-white"
              />
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Scheduly
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        {/* User info with first letter icon */}
        {isAuthenticated && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-700 rounded-full flex items-center justify-center ${
                  isAdmin
                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                    : "bg-gradient-to-br from-pink-600 to-pink-700"
                }`}
              >
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                {isAdmin && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300
                                        hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-400
                                        rounded-lg transition-colors duration-200 group"
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* Admin section - visible to admins */}
          {isAdmin && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 px-4 mb-3">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                  Admin Panel
                </h3>
              </div>
              <ul className="space-y-2">
                {adminMenuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300
                                                hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700 dark:hover:text-yellow-400
                                                rounded-lg transition-colors duration-200 group"
                    >
                      <item.icon className="w-5 h-5 group:hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Authorization section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              {authItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      if (item.action) item.action();
                      navigate(item.href);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300
                                        hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400
                                        rounded-lg transition-colors duration-200 group"
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}
