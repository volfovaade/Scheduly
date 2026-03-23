import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import EventsPage from "./pages/EventsPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EventDetailPage from "./pages/EventDetailPage";
import SettingsPage from "./pages/SettingsPage";
import SuspiciousActivityPage from "./pages/SuspiciousActivityPage";
import DataCleanupPage from "./pages/DataCleanupPage";
import NotFoundPage from "./pages/NotFoundPage";
import HowToUsePage from "./pages/HowToUsePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
          <Route path="/resetPassword" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route
            path="/admin/suspicious"
            element={<SuspiciousActivityPage />}
          />
          <Route path="/admin/cleanup" element={<DataCleanupPage />} />
          {/* catch-all — must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
