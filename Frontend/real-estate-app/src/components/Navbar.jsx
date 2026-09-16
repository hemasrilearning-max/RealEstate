import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, LogIn, LayoutDashboard, LogOut, Menu, X, UserPlus } from "lucide-react";
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
          <Link to="/" className="flex items-center gap-2">
            <img src="../../images/hspacelogo.png" className="header-logo" title="" width="120px" height="auto"/>
            {/* <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div> */}
            {/* <span className="text-xl font-bold text-gray-900">
              Real<span className="text-red-600">Estate</span>
            </span> */}
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/properties"
              className="text-gray-600 hover:text-red-600 font-medium transition"
            >
              Properties
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 font-medium transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className="ml-1.5 text-xs text-gray-400 capitalize">
                      ({role})
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-red-600 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2 border-t pt-3">
            <Link
              to="/properties"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
            >
              Properties
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
                >
                  Dashboard ({role})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 bg-red-600 text-white rounded text-center"
                >
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
