import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import EventsPage from "./pages/EventsPage";
import RegisterPage from "./pages/RegisterPage";
import EventDetailPage from "./pages/EventDetailPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;