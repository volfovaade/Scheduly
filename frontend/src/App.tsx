import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import EventsPage from "./pages/EventsPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import OpenEventDetailPage from "./pages/OpenEventDetailPage"; 
import FixedEventDetailPage from "./pages/FixedEventDetailPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<MainPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/open/:eventId" element={<OpenEventDetailPage />} />
          <Route path="/events/fixed/:eventId" element={<FixedEventDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;