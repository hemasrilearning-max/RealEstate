import { BrowserRouter, Routes, Route, Link} from "react-router-dom";
//import { Home, Mail, Phone, MapPin } from "lucide-react";
import { Mail, Phone, MapPin } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

import Navbar from "./components/Navbar";


// Public pages
import Home from "./pages/public/Home";
import Properties from "./pages/public/Properties";
import PropertyDetail from "./pages/public/PropertyDetail";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Agent pages
import DashboardLayout from "./pages/agent/DashboardLayout";
import Overview from "./pages/agent/Overview";
import AgentProperties from "./pages/agent/Properties";
import Clients from "./pages/agent/Clients";
import AgentLeads from "./pages/agent/Leads"; // ✅ Renamed to avoid name clash
import Messages from "./pages/agent/Messages";
import Tours from "./pages/agent/Tours";
import Transactions from "./pages/agent/Transactions";
import Reviews from "./pages/agent/Reviews";
import Analytics from "./pages/agent/Analytics";
import Profile from "./pages/agent/Profile";

// Owner pages
import OwnerDashboardLayout from "./pages/owner/Dashboard";
import OwnerProperties from "./pages/owner/Properties";  
import AddProperty from "./pages/owner/AddProperty";
import OwnerLeads from "./pages/owner/Leads"; // ✅ Renamed to avoid name clash
import OwnerMessages from "./pages/owner/Messages";
import OwnerTours from "./pages/owner/Tours";
import OwnerPayments from "./pages/owner/Payments";
import OwnerReviews from "./pages/owner/Reviews";
import OwnerAnalytics from "./pages/owner/Analytics";
import OwnerProfile from "./pages/owner/Profile";

// Other role dashboards (placeholders)
import AdminDashboard from "./pages/admin/Dashboard";

// Buyer pages
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerProfile from "./pages/buyer/Profile";
import BuyerFavorites from "./pages/buyer/Favorites";
import BuyerTours from "./pages/buyer/Tours";
import BuyerSavedSearches from "./pages/buyer/SavedSearches";
import BuyerViewedProperties from "./pages/buyer/ViewedProperties";
import BuyerMessages from "./pages/buyer/Messages";
import BuyerPayments from "./pages/buyer/Payments";
import BuyerReviews from "./pages/buyer/Reviews";
import BuyerNotifications from "./pages/buyer/Notifications";
import BuyerRecommendations from "./pages/buyer/Recommendations";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      {/* <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} RealEstate Realty — Brokerage Real
            Estate Platform
          </p>
          <p className="mt-1 text-xs">
            Multi-role demo: Agent · Admin · Owner · Buyer
          </p>
        </div>
      </footer> */}

     

    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* <Home className="w-6 h-6 text-purple-400" /> */}
              <span className="text-xl font-bold text-white">HomeSpace</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner in finding the perfect home. Buy, rent or sell with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-purple-400 transition">All Properties</Link></li>
              <li><Link to="/properties?listingType=Sale" className="hover:text-purple-400 transition">Buy Property</Link></li>
              <li><Link to="/properties?listingType=Rent" className="hover:text-purple-400 transition">Rent Property</Link></li>
              <li><Link to="/about" className="hover:text-purple-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-purple-400 transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-purple-400 transition">FAQs</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition">Terms of Service</Link></li>
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
  

    </>
  );
}
// Simple temporary layout subpage component placeholder to prevent navigation white screens
function ModulePlaceholder({ title }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Module Portal: {title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        This sub-view panel tracks operational workflows mapped inside your HomeSpace ecosystem.
      </p>
    </div>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
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
            {/* Backward-compatible agent login redirect */}
            <Route
              path="/agent/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />
            {/* Agent Dashboard Section */}
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

            {/* Owner Ecosystem Dashboard Section */}
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

            {/* Admin dashboards */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* BUYER dashboards   */}
            
            <Route path="/buyer" element={<BuyerDashboard />}>
              {/* Renders the primary dashboard analytics overview workspace elements */}
              <Route index element={null} />
              <Route path="dashboard" element={null} />

              {/* Module subpages matching requested checklist options */}
              <Route path="profile" element={<BuyerProfile />} />
              <Route path="favorites" element={<BuyerFavorites />} />
              <Route path="saved-searches" element={<BuyerSavedSearches />} />
              <Route path="viewed-properties" element={<BuyerViewedProperties />} />
              <Route path="messages" element={<BuyerMessages />} />
              <Route path="tours" element={<BuyerTours />} />
              <Route path="payments" element={<BuyerPayments />} />
              <Route path="reviews" element={<BuyerReviews />} />
              <Route path="notifications" element={<BuyerNotifications />} />
              <Route path="recommendations" element={<BuyerRecommendations />} />
              
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}