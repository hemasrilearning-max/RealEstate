import { NavLink, Outlet } from "react-router-dom";
import {
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

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Properties", path: "/admin/properties", icon: Building2 },
  { name: "Agents", path: "/admin/agents", icon: UserRound },
  { name: "Owners", path: "/admin/owners", icon: UserCheck },
  { name: "Buyers / Renters", path: "/admin/buyers-renters", icon: UsersRound },
  { name: "Transactions", path: "/admin/transactions", icon: ArrowLeftRight },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Reviews", path: "/admin/reviews", icon: Star },
  { name: "Reports", path: "/admin/reports", icon: FileText },
  { name: "Disputes", path: "/admin/disputes", icon: Scale },
  { name: "Fraud Detection", path: "/admin/fraud", icon: ShieldAlert },
  { name: "Notifications", path: "/admin/notifications", icon: Bell },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">

        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              HomeSpace
            </h1>
            <p className="text-xs text-gray-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
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
                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* RIGHT SIDE PAGE CONTENT */}
      <main className="flex-1 min-w-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
}