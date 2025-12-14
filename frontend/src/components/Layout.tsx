import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { TopBar } from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  return (
    <div className="mih-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 lg:ml-72">
        <TopBar toggleSidebar={toggleSidebar} />
        <main className="flex-grow w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}