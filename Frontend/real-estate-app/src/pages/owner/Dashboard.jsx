import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, LogOut, Building2, MessageSquare } from "lucide-react";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "owner") {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Owner Dashboard</h1>
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-emerald-900">
            Owner panel is under construction
          </h2>
          <p className="text-emerald-700 text-sm mt-1">
            Soon you will be able to list your own properties, view enquiries and track interest.
            Logged in as <strong>{user.email}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-5">
            <Building2 className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold">My Properties</h3>
            <p className="text-sm text-gray-500 mt-1">Add & manage your listings</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold">Enquiries</h3>
            <p className="text-sm text-gray-500 mt-1">Messages from interested buyers</p>
          </div>
        </div>
      </main>
    </div>
  );
}
