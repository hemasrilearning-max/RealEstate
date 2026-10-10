import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  UserCheck,
  UsersRound,
  ArrowLeftRight,
  CreditCard,
  Star,
  FileText,
  Scale,
  ShieldAlert,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Properties", path: "/admin/properties", icon: Building2 },
  { name: "Agents", path: "/admin/agents", icon: UserRound },
  { name: "Owners", path: "/admin/owners", icon: UserCheck },
  {
    name: "Buyers / Renters",
    path: "/admin/buyers-renters",
    icon: UsersRound,
  },
  {
    name: "Transactions",
    path: "/admin/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Payments",
    path: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: FileText,
  },
 
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState(user || null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const photoObjectUrlRef = useRef(null);

  /*
   * ============================================================
   * ADMIN USER ID
   * ============================================================
   */

  const userId =
    user?.userId ||
    user?.id ||
    null;

  /*
   * ============================================================
   * FETCH ADMIN PROFILE
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadAdminProfile = async () => {
      if (!userId) {
        return;
      }

      try {
        const response =
          await userService.getUserById(userId);

        if (!mounted) {
          return;
        }

        setAdminUser(
          response?.data ||
            response ||
            user ||
            null
        );
      } catch (error) {
        console.error(
          "Failed to load admin profile:",
          error
        );

        if (mounted) {
          setAdminUser(user || null);
        }
      }
    };

    loadAdminProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  /*
   * ============================================================
   * FETCH ADMIN PROFILE PHOTO
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadProfilePhoto = async () => {
      if (!userId) {
        if (mounted) {
          setProfilePhoto(null);
        }

        return;
      }

      try {
        const blob =
          await userService.getProfilePhotoBlob(
            userId
          );

        if (!mounted || !blob) {
          return;
        }

        if (photoObjectUrlRef.current) {
          URL.revokeObjectURL(
            photoObjectUrlRef.current
          );
        }

        const objectUrl =
          URL.createObjectURL(blob);

        photoObjectUrlRef.current =
          objectUrl;

        setProfilePhoto(objectUrl);
      } catch (error) {
        if (mounted) {
          setProfilePhoto(null);
        }
      }
    };

    loadProfilePhoto();

    return () => {
      mounted = false;

      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current = null;
      }
    };
  }, [
    userId,
    adminUser?.profilePhotoUpdatedAt,
  ]);

  /*
   * ============================================================
   * ADMIN NAME
   * ============================================================
   */

  const getAdminName = () => {
    const name =
      `${adminUser?.firstName || ""} ${
        adminUser?.lastName || ""
      }`.trim();

    return (
      name ||
      adminUser?.name ||
      adminUser?.username ||
      "Admin"
    );
  };

  const adminName = getAdminName();

  /*
   * ============================================================
   * ADMIN INITIALS
   * ============================================================
   */

  const getInitials = () => {
    const first =
      adminUser?.firstName?.charAt(0) || "";

    const last =
      adminUser?.lastName?.charAt(0) || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return adminName
      .charAt(0)
      .toUpperCase();
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ======================================================
          FIXED ADMIN SIDEBAR
      ====================================================== */}

      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col z-50">

        {/* ====================================================
            ADMIN PROFILE - TOP
        ==================================================== */}

        <div className="p-5 border-b border-gray-200 flex-shrink-0">

          <div className="flex items-center gap-3">

            {/* Profile Image */}
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={adminName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold flex-shrink-0">
                {getInitials()}
              </div>
            )}

            {/* Admin Details */}
            <div className="min-w-0">

              <p className="text-sm font-semibold text-gray-900 truncate">
                {adminName}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {adminUser?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : adminUser?.role === "ADMIN"
                  ? "Admin"
                  : "Admin Account"}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {adminUser?.email ||
                  "admin@realestate.com"}
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            ADMIN NAVIGATION
        ==================================================== */}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

        </nav>

        {/* ====================================================
            BOTTOM ACTIONS
        ==================================================== */}

        <div className="p-4 border-t border-gray-200 flex-shrink-0">

          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Home size={18} />

            <span>
              Back to Website
            </span>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          RIGHT SIDE PAGE CONTENT
      ====================================================== */}

      <main className="ml-64 min-h-screen min-w-0">

        <div className="p-6">
          <Outlet />
        </div>

      </main>

    </div>
  );
}