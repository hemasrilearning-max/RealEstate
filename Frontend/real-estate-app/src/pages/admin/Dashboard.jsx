import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, LogOut, Users, Building2, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Welcome, {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-gray-600 hover:text-red-600">
            Website
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-purple-900">
            Admin panel is under construction
          </h2>
          <p className="text-purple-700 text-sm mt-1">
            Full admin features (manage all users, properties, system settings) will be added next.
            You are logged in as <strong>{user.email}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-5">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold">Users</h3>
            <p className="text-sm text-gray-500 mt-1">Manage agents, owners & buyers</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <Building2 className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold">All Properties</h3>
            <p className="text-sm text-gray-500 mt-1">Moderate & feature listings</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <Settings className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Platform configuration</p>
          </div>
        </div>
      </main>
    </div>
  );
}
