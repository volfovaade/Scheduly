import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { TopBar } from "./Topbar";

/**
 * Main layout wrapper for all pages in the application.
 * Provides a consistent structure with sidebar navigation, top bar, and footer.
 * The sidebar can be toggled on mobile/tablet devices for better UX.
 *
 * @returns The layout container with page content rendered in the middle
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="mih-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 lg:ml-72">
        <TopBar toggleSidebar={toggleSidebar} />
        <main className="flex-grow w-full">
          {/* Child routes are rendered here via Outlet */}
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
