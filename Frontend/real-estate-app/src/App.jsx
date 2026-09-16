import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Leads from "./pages/agent/Leads";
import Messages from "./pages/agent/Messages";
import Tours from "./pages/agent/Tours";
import Transactions from "./pages/agent/Transactions";
import Reviews from "./pages/agent/Reviews";
import Analytics from "./pages/agent/Analytics";
import Profile from "./pages/agent/Profile";

// Other role dashboards (placeholders)
import AdminDashboard from "./pages/admin/Dashboard";
import OwnerDashboard from "./pages/owner/Dashboard";
import BuyerDashboard from "./pages/buyer/Dashboard";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} NoBroker Realty — Zero Brokerage Real
            Estate Platform
          </p>
          <p className="mt-1 text-xs">
            Multi-role demo: Agent · Admin · Owner · Buyer
          </p>
        </div>
      </footer>
    </>
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

            {/* Agent Dashboard */}
            <Route path="/agent" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Overview />} />
              <Route path="properties" element={<AgentProperties />} />
              <Route path="clients" element={<Clients />} />
              <Route path="leads" element={<Leads />} />
              <Route path="messages" element={<Messages />} />
              <Route path="tours" element={<Tours />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin / Owner / Buyer dashboards */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
