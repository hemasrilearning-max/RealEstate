
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

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

import { useState, useEffect } from "react";

const navItems = [
  {
    to: "/agent/dashboard",
    icon: LayoutDashboard,
    label: "Overview",
    end: true,
  },
  {
    to: "/agent/properties",
    icon: Building2,
    label: "Properties",
  },
  {
    to: "/agent/clients",
    icon: Users,
    label: "Clients",
  },
  {
    to: "/agent/leads",
    icon: Target,
    label: "Leads",
  },
  {
    to: "/agent/messages",
    icon: MessageSquare,
    label: "Messages",
  },
  {
    to: "/agent/tours",
    icon: Calendar,
    label: "Tour Requests",
  },
  {
    to: "/agent/transactions",
    icon: Receipt,
    label: "Transactions",
  },
  {
    to: "/agent/reviews",
    icon: Star,
    label: "Reviews",
  },
  {
    to: "/agent/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  {
    to: "/agent/profile",
    icon: User,
    label: "Profile",
  },
];

export default function DashboardLayout() {
  const {
    user,
    agent,
    logout,
    isAuthenticated,
    loading,
    role,
  } = useAuth();

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  /*
   * For the Agent Dashboard, prefer the agent object.
   * Fall back to user if the logged-in role is agent.
   */
  const current =
    agent || (role?.toLowerCase() === "agent" ? user : null);

  /*
   * Use agent/user information only.
   */
  const profile = current;

  /*
   * Support different possible ID names coming from the backend.
   */
  const userId =
    profile?.userId ||
    profile?.id ||
    profile?.user?.id ||
    profile?.user?.userId ||
    null;

  /*
   * If profile photo changes, this value can force the effect
   * to reload the image.
   */
  const profilePhotoUpdatedAt =
    profile?.profilePhotoUpdatedAt || 0;

  /*
   * IMPORTANT:
   * All hooks must be declared BEFORE conditional returns.
   */
  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadProfilePhoto = async () => {
      if (!userId) {
        setProfilePhoto(null);
        return;
      }

      try {
        const blob = await userService.getProfilePhotoBlob(userId);

        if (cancelled) {
          return;
        }

        if (!blob) {
          setProfilePhoto(null);
          return;
        }

        objectUrl = URL.createObjectURL(blob);

        setProfilePhoto(objectUrl);
      } catch (error) {
        console.error(
          "Failed to load profile photo:",
          error
        );

        if (!cancelled) {
          setProfilePhoto(null);
        }
      }
    };

    loadProfilePhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId, profilePhotoUpdatedAt]);

  /*
   * Logout
   */
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />

          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Authentication / role protection
   *
   * This dashboard belongs only to agents.
   */
  if (
    !isAuthenticated ||
    role?.toLowerCase() !== "agent" ||
    !current
  ) {
    return <Navigate to="/login" replace />;
  }

  /*
   * Safe display values
   */
  const displayName =
    current?.name ||
    current?.firstName ||
    current?.fullName ||
    user?.name ||
    user?.firstName ||
    "Agent";

  const companyName =
    current?.company ||
    current?.companyName ||
    "Agent";

  /*
   * Sidebar
   */
  const SidebarContent = () => (
    <>
      {/* Profile Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {displayName}
            </p>

            <p className="text-xs text-gray-500 truncate">
              {companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
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
              <Icon className="w-[18px] h-[18px] shrink-0" />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <NavLink
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Home className="w-[18px] h-[18px] shrink-0" />

          <span>Back to Website</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />

          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* =========================
          DESKTOP SIDEBAR
          ========================= */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* =========================
          MOBILE SIDEBAR
          ========================= */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">

          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="relative w-72 max-w-[85vw] bg-white flex flex-col shadow-xl">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}

      {/* =========================
          MAIN CONTENT
          ========================= */}
      <div className="flex-1 lg:ml-64 min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-800 truncate">
              Agent Dashboard
            </h1>
          </div>

          {/* Header Profile */}
          <div className="hidden sm:flex items-center gap-2">
            {/* {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )} */}

            {/* <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
              {displayName}
            </span> */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

