import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterUserPage from "@/pages/RegisterUserPage";
import RegisterOrganizerPage from "@/pages/RegisterOrganizerPage";
import AddEventPage from "@/pages/AddEventPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentFailedPage from "@/pages/PaymentFailedPage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import EventTicketDetailPage from "@/pages/EventTicketDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<AddEventPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterUserPage />} />
            <Route path="/register/organizer" element={<RegisterOrganizerPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/my-tickets/:eventId" element={<EventTicketDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
