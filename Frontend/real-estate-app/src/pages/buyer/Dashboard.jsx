
import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, User, Heart, Search, Eye, MessageSquare, Calendar,
  CreditCard, Star, Bell, Sparkles, Globe, LogOut, Menu, X,
  CheckCircle, MapPin
} from "lucide-react";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { buyer, user } = useAuth();
  const profile = buyer || user;

  const sidebarItems = [
    { to: "/buyer/dashboard", name: "Overview", icon: LayoutDashboard, end: true },
    { to: "/buyer/profile", name: "Profile", icon: User },
    { to: "/buyer/favorites", name: "Favorites", icon: Heart },
    { to: "/buyer/saved-searches", name: "Saved Searches", icon: Search },
    { to: "/buyer/viewed-properties", name: "Viewed Properties", icon: Eye },
    { to: "/buyer/messages", name: "Messages", icon: MessageSquare },
    { to: "/buyer/tours", name: "Tour Bookings", icon: Calendar },
    { to: "/buyer/payments", name: "Payments", icon: CreditCard },
    { to: "/buyer/reviews", name: "Reviews", icon: Star },
    { to: "/buyer/notifications", name: "Notifications", icon: Bell },
    { to: "/buyer/recommendations", name: "Recommendations", icon: Sparkles }
  ];

  const statistics = [
    { label: "Favorite Properties", count: "14", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Upcoming Tours", count: "3", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Applications", count: "1", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Unread Messages", count: "4", icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  const recentRecommendations = [
    {
      id: 1,
      title: "Luxury 3 BHK Flat",
      loc: "Whitefield, Bangalore",
      price: "₹1.20 Cr",
      status: "Matching Search Criteria"
    },
    {
      id: 2,
      title: "Premium 2 BHK Apartment",
      loc: "HSR Layout, Bangalore",
      price: "₹45,000 /mo",
      status: "Price Drop Alert"
    }
  ];

  const getInitials = (name) =>
    name
      ? name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2)
      : "B";

  const handleLogout = () => navigate("/");

  const isDashboardHome =
    location.pathname === "/buyer" ||
    location.pathname === "/buyer/dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full min-h-0">

      {/* Profile */}
      <div className="flex items-center gap-3 px-2 mb-8 shrink-0">
        <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center shrink-0 bg-emerald-600 text-white font-bold text-sm">
          {profile?.avatar && !profile.avatar.includes("ui-avatars.com") ? (
            <img
              src={profile.avatar}
              alt={profile?.name || "User Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {getInitials(profile?.name || "Arjun Patel")}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 leading-tight truncate">
            {profile?.name || "Arjun Patel"}
          </h2>
          <p className="text-xs text-gray-400 font-medium truncate">
            {profile?.occupation || "Senior Software Engineer"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <nav className="space-y-1 pb-4">
          {sidebarItems.map(({ to, name, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 mt-2 border-t border-gray-100 space-y-1 shrink-0 bg-white">
        <NavLink
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Globe className="h-4 w-4 text-gray-400 shrink-0" />
          <span>Browse Properties</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-600 hover:bg-emerald-50/50"
        >
          <LogOut className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-white border-r border-gray-100 flex-col py-6 px-4 shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative w-72 max-w-[85vw] h-screen bg-white flex flex-col py-6 px-4 shadow-xl overflow-hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 py-5 px-4 sm:px-6 lg:px-8 flex items-center sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Buyer Workspace
              </h1>

              <p className="text-xs text-gray-500 mt-0.5">
                Welcome back, {profile?.name || "Arjun Patel"} ·{" "}
                {profile?.email || "buyer@gmail.com"}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {isDashboardHome ? (
            <div className="space-y-8">

              {/* Statistics */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statistics.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 min-w-0"
                    >
                      <div
                        className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider truncate">
                          {stat.label}
                        </p>

                        <p className="text-xl font-black text-gray-900 mt-0.5">
                          {stat.count}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Recommendations + Support */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recommendations */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    AI-Driven Discovery Matches
                  </h3>

                  <div className="divide-y divide-gray-50">
                    {recentRecommendations.map(item => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {item.title}
                          </h4>

                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {item.loc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-sm font-bold text-gray-900">
                            {item.price}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Support */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">
                      Need Direct Agent Support?
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      Schedule tours, connect with property owners directly,
                      or submit formal purchase applications smoothly.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/buyer/tours")}
                    className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    View All Bookings
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}

