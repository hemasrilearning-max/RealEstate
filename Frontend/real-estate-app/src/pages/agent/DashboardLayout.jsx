import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  MessageSquare,
  Calendar,
  Receipt,
  Star,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/agent/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/agent/properties", icon: Building2, label: "Properties" },
  { to: "/agent/clients", icon: Users, label: "Clients" },
  { to: "/agent/leads", icon: Target, label: "Leads" },
  { to: "/agent/messages", icon: MessageSquare, label: "Messages" },
  { to: "/agent/tours", icon: Calendar, label: "Tour Requests" },
  { to: "/agent/transactions", icon: Receipt, label: "Transactions" },
  { to: "/agent/reviews", icon: Star, label: "Reviews" },
  { to: "/agent/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/agent/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout() {
  const { user, agent, logout, isAuthenticated, loading, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prefer agent object; fall back to user if role is agent
  const current = agent || (role === "agent" ? user : null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || role !== "agent" || !current) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={current.avatar}
            alt={current.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{current.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {current.company || "Agent"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Home className="w-4.5 h-4.5" />
          Back to Website
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white flex flex-col shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-800">Agent Dashboard</h1>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
