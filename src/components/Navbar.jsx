import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogIn,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserPlus,
  Building2,
  Home,
} from "lucide-react";
import { useState } from "react";
import { ROLE_DASHBOARD } from "../data/users";

export default function Navbar() {
  const { user, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const dashboardPath = role ? ROLE_DASHBOARD[role] || "/login" : "/login";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {/* <img
              src="../../images/hspacelogo.png"
              alt="HomeSpace"  width="120px"
              className="h-10 w-auto"
            /> */}
            <img
              src="../../images/hspacelogo.png"
              alt="HomeSpace"  width="120px"
            />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            {/* Properties */}
            <Link
              to="/properties"
              className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 font-medium transition group"
            >
              <Building2 className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition" />
              <span>Properties</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 font-medium transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className="ml-1.5 text-xs text-gray-400 capitalize">
                      ({role})
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Login – house icon + dark border */}
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-gray-700 font-medium border border-gray-500 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition"
                >
                  <Home className="w-4 h-4" />
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-purple-600"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-100 pt-3">
            <Link
              to="/properties"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
            >
              <Building2 className="w-4 h-4" />
              Properties
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard ({role})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-700 border border-gray-500 rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-600 transition"
                >
                  <Home className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}