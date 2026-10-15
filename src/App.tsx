import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/auth.store";
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
import OrganizerEventsPage from "@/pages/OrganizerEventsPage";
import OrganizerEventDetailPage from "@/pages/OrganizerEventDetailPage";
import EditEventPage from "@/pages/EditEventPage";
import OrganizerStaffPage from "@/pages/OrganizerStaffPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import StaffScanPage from "@/pages/StaffScanPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminEventsPage from "@/pages/admin/AdminEventsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminRefundsPage from "@/pages/admin/AdminRefundsPage";
import AdminPayoutsPage from "@/pages/admin/AdminPayoutsPage";

export default function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin routes (no shared Navbar) ── */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/refunds" element={<AdminRefundsPage />} />
        <Route path="/admin/payouts" element={<AdminPayoutsPage />} />

        {/* ── Public / user-facing routes (with Navbar & Footer) ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-surface flex flex-col justify-between">
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1">
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
                    <Route path="/organizer/events" element={<OrganizerEventsPage />} />
                    <Route path="/organizer/events/:slug" element={<OrganizerEventDetailPage />} />
                    <Route path="/organizer/events/:slug/edit" element={<EditEventPage />} />
                    <Route path="/organizer/staff" element={<OrganizerStaffPage />} />
                    <Route path="/staff/accept-invite" element={<AcceptInvitePage />} />
                    <Route path="/staff/scan" element={<StaffScanPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
