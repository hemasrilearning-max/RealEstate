import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

import Navbar from "./components/Navbar";

/* ============================================================
   PUBLIC PAGES
============================================================ */
import Home from "./pages/public/Home";
import Properties from "./pages/public/Properties";
import PropertyDetail from "./pages/public/PropertyDetail";
import Favorites from "./pages/public/Favorites";

/* ============================================================
   AUTH
============================================================ */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

/* ============================================================
   BUYER PUBLIC PAGES
   These are normal HomeSpace website pages.
   There is NO separate Buyer Dashboard.
============================================================ */
import BuyerProfile from "./pages/buyer/Profile";
import BuyerViewedProperties from "./pages/buyer/ViewedProperties";
import BuyerMessages from "./pages/buyer/Messages";
import BuyerTours from "./pages/buyer/Tours";
import BuyerPayments from "./pages/buyer/Payments";
import BuyerReviews from "./pages/buyer/Reviews";
import BuyerNotifications from "./pages/buyer/Notifications";
import BuyerRecommendations from "./pages/buyer/Recommendations";

/* ============================================================
   AGENT PAGES
============================================================ */
import DashboardLayout from "./pages/agent/DashboardLayout";
import Overview from "./pages/agent/Overview";
import AgentProperties from "./pages/agent/Properties";
import Clients from "./pages/agent/Clients";
import AgentLeads from "./pages/agent/Leads";
import Messages from "./pages/agent/Messages";
import Tours from "./pages/agent/Tours";
import Transactions from "./pages/agent/Transactions";
import Reviews from "./pages/agent/Reviews";
import Analytics from "./pages/agent/Analytics";
import Profile from "./pages/agent/Profile";

/* ============================================================
   OWNER PAGES
============================================================ */
import OwnerDashboardLayout from "./pages/owner/Dashboard";
import OwnerProperties from "./pages/owner/Properties";
import AddProperty from "./pages/owner/AddProperty";
import OwnerLeads from "./pages/owner/Leads";
import OwnerMessages from "./pages/owner/Messages";
import OwnerTours from "./pages/owner/Tours";
import OwnerPayments from "./pages/owner/Payments";
import OwnerReviews from "./pages/owner/Reviews";
import OwnerAnalytics from "./pages/owner/Analytics";
import OwnerProfile from "./pages/owner/Profile";

/* ============================================================
   ADMIN PAGES
============================================================ */
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AdminProperties from "./pages/admin/Properties";
import AdminAgents from "./pages/admin/Agents.jsx";
import AdminOwners from "./pages/admin/Owners.jsx";
import AdminBuyersRenters from "./pages/admin/BuyersRenters.jsx";
import AdminTransactions from "./pages/admin/Transactions.jsx";
import AdminPayments from "./pages/admin/Payments.jsx";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminReviews from "./pages/admin/Reviews";
import AdminReports from "./pages/admin/Reports";
import AdminDisputes from "./pages/admin/Disputes";
import AdminFraud from "./pages/admin/Fraud";
import AdminNotifications from "./pages/admin/Notifications";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

/* ============================================================
   PUBLIC WEBSITE LAYOUT
============================================================ */
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>

      <footer className="bg-slate-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-white">HomeSpace</span>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                Your trusted partner in finding the perfect home. Buy, rent or
                sell with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/properties"
                    className="hover:text-purple-400 transition"
                  >
                    All Properties
                  </Link>
                </li>

                <li>
                  <Link
                    to="/properties?listingType=Sale"
                    className="hover:text-purple-400 transition"
                  >
                    Buy Property
                  </Link>
                </li>

                <li>
                  <Link
                    to="/properties?listingType=Rent"
                    className="hover:text-purple-400 transition"
                  >
                    Rent Property
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    className="hover:text-purple-400 transition"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-purple-400 transition"
                  >
                    Contact Us
                  </Link>
                </li>

                <li>
                  <Link to="/faq" className="hover:text-purple-400 transition">
                    FAQs
                  </Link>
                </li>

                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-purple-400 transition"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/terms"
                    className="hover:text-purple-400 transition"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Get in Touch</h4>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  +91 98765 43210
                </li>

                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  hello@homespace.in
                </li>

                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                  Bangalore, Karnataka
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <p>© 2026 HomeSpace. All rights reserved.</p>

            <p>Made with ❤️ for home seekers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   APPLICATION
============================================================ */
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* ==================================================
                PUBLIC HOMESPACE WEBSITE
            ================================================== */}

            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />

            <Route
              path="/properties"
              element={
                <PublicLayout>
                  <Properties />
                </PublicLayout>
              }
            />

            <Route
              path="/properties/:id"
              element={
                <PublicLayout>
                  <PropertyDetail />
                </PublicLayout>
              }
            />

            {/* ==================================================
                BUYER FUNCTIONALITY
                NORMAL HOMESPACE WEBSITE
                NO /buyer ROUTES
            ================================================== */}

            {/* Favorites */}
            <Route
              path="/favorites"
              element={
                <PublicLayout>
                  <Favorites />
                </PublicLayout>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <PublicLayout>
                  <BuyerProfile />
                </PublicLayout>
              }
            />

            {/* Viewed Properties */}
            <Route
              path="/viewed-properties"
              element={
                <PublicLayout>
                  <BuyerViewedProperties />
                </PublicLayout>
              }
            />

            {/* Messages */}
            <Route
              path="/messages"
              element={
                <PublicLayout>
                  <BuyerMessages />
                </PublicLayout>
              }
            />

            {/* Tour Bookings */}
            <Route
              path="/tours"
              element={
                <PublicLayout>
                  <BuyerTours />
                </PublicLayout>
              }
            />

            {/* Payments */}
            <Route
              path="/payments"
              element={
                <PublicLayout>
                  <BuyerPayments />
                </PublicLayout>
              }
            />

            {/* Reviews */}
            <Route
              path="/reviews"
              element={
                <PublicLayout>
                  <BuyerReviews />
                </PublicLayout>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <PublicLayout>
                  <BuyerNotifications />
                </PublicLayout>
              }
            />

            {/* Recommendations */}
            <Route
              path="/recommendations"
              element={
                <PublicLayout>
                  <BuyerRecommendations />
                </PublicLayout>
              }
            />

            {/* ==================================================
                AUTH
            ================================================== */}

            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />

            <Route
              path="/register"
              element={
                <PublicLayout>
                  <Register />
                </PublicLayout>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <PublicLayout>
                  <ForgotPassword />
                </PublicLayout>
              }
            />

            {/* Backward-compatible agent login */}
            <Route
              path="/agent/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />

            {/* ==================================================
                AGENT DASHBOARD
                Remains separate
            ================================================== */}

            <Route path="/agent" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Overview />} />

              <Route path="properties" element={<AgentProperties />} />

              <Route path="clients" element={<Clients />} />

              <Route path="leads" element={<AgentLeads />} />

              <Route path="messages" element={<Messages />} />

              <Route path="tours" element={<Tours />} />

              <Route path="transactions" element={<Transactions />} />

              <Route path="reviews" element={<Reviews />} />

              <Route path="analytics" element={<Analytics />} />

              <Route path="profile" element={<Profile />} />
            </Route>

            {/* ==================================================
                OWNER DASHBOARD
                Remains separate
            ================================================== */}

            <Route path="/owner" element={<OwnerDashboardLayout />}>
              <Route index element={null} />

              <Route path="dashboard" element={null} />

              <Route path="properties" element={<OwnerProperties />} />

              <Route path="add-property" element={<AddProperty />} />

              <Route path="leads" element={<OwnerLeads />} />

              <Route path="messages" element={<OwnerMessages />} />

              <Route path="tours" element={<OwnerTours />} />

              <Route path="payments" element={<OwnerPayments />} />

              <Route path="reviews" element={<OwnerReviews />} />

              <Route path="analytics" element={<OwnerAnalytics />} />

              <Route path="profile" element={<OwnerProfile />} />
            </Route>

            {/* ==================================================
                ADMIN DASHBOARD
                Remains separate
            ================================================== */}

            <Route path="/admin" element={<AdminLayout />}>
              {/* Dashboard */}
              <Route index element={<AdminDashboard />} />

              <Route path="dashboard" element={<AdminDashboard />} />

              {/* Users */}
              <Route path="users" element={<Users />} />

              {/* Properties */}
              <Route path="properties" element={<AdminProperties />} />

              {/* Agents */}
              <Route path="agents" element={<AdminAgents />} />

              {/* Owners */}
              <Route path="owners" element={<AdminOwners />} />

              {/* Buyers / Renters */}
              <Route path="buyers-renters" element={<AdminBuyersRenters />} />

              {/* Transactions */}
              <Route path="transactions" element={<AdminTransactions />} />

              {/* Payments */}
              <Route path="payments" element={<AdminPayments />} />

              {/* Reviews */}
              <Route path="reviews" element={<AdminReviews />} />

              {/* Reports */}
              <Route path="reports" element={<AdminReports />} />

              {/* Disputes */}
              <Route path="disputes" element={<AdminDisputes />} />

              {/* Fraud */}
              <Route path="fraud" element={<AdminFraud />} />

              {/* Notifications */}
              <Route path="notifications" element={<AdminNotifications />} />

              {/* Analytics */}
              <Route path="analytics" element={<AdminAnalytics />} />

              {/* Settings */}
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
