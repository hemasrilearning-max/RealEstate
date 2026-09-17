import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext"; // 👈 Import your auth context hook here
import { 
  LayoutDashboard, Building2, PlusCircle, Users, MessageSquare, Calendar, CreditCard, Star, BarChart3, User, Globe, LogOut, Menu, X, CheckCircle, Clock, TrendingUp, Eye
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 👥 Dynamic global context authentication fetch
  const { agent, owner, buyer, user } = useAuth();
  const profile = agent || owner || buyer || user;
  const rawRole = profile?.role?.toLowerCase() || "owner";

  // Sidebar navigation paths mapping directly to your App.jsx routes
  const sidebarItems = [
    { to: '/owner/dashboard', name: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/owner/properties', name: 'My Properties', icon: Building2 },
    { to: '/owner/add-property', name: 'Add Property', icon: PlusCircle },
    { to: '/owner/leads', name: 'Leads', icon: Users },
    { to: '/owner/messages', name: 'Messages', icon: MessageSquare },
    { to: '/owner/tours', name: 'Tour Requests', icon: Calendar },
    { to: '/owner/payments', name: 'Payments', icon: CreditCard },
    { to: '/owner/reviews', name: 'Reviews', icon: Star },
    { to: '/owner/analytics', name: 'Analytics', icon: BarChart3 },
    { to: '/owner/profile', name: 'Profile', icon: User },
  ];

  // Dynamic values based on roles
  const displayAccountType = rawRole === "owner" ? "Premium Account" : "RealEstate Realty";
  const displayPortfolioText = rawRole === "owner" ? "Property Portfolio" : "Agent Dashboard";
  const badgeColor = rawRole === "owner" ? "text-rose-600" : "text-purple-600";
  const bgFallbackColor = rawRole === "owner" ? "bg-gray-200 text-gray-700" : "bg-purple-600 text-white";

  // Initials generator
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 8 Core Stats Data Panels matching your list parameters
  const statistics = [
    { label: 'Total Properties', count: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Listings', count: '8', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sold', count: '3', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rented', count: '5', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Views', count: '3,412', icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Total Leads', count: '24', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Requests', count: '2', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Revenue', count: '₹4.50 Cr', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  // Recent Leads Data Array
  const recentLeads = [
    { id: 1, name: 'Rohan Sharma', interest: 'Luxury 4 BHK Villa - Sarjapur', status: 'New', initial: 'R' },
    { id: 2, name: 'Priya Patel', interest: 'Spacious 3 BHK Apartment - Whitefield', status: 'New', initial: 'P' },
    { id: 3, name: 'Amit Verma', interest: '3 BHK Independent House - HSR Layout', status: 'Contacted', initial: 'A' },
    { id: 4, name: 'Neha Rao', interest: '2 BHK Fully Furnished Flat - Koramangala', status: 'Qualified', initial: 'N' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const isDashboardHome = location.pathname === '/owner' || location.pathname === '/owner/dashboard';

  const statusColors = {
    New: 'bg-blue-50 text-blue-600 border-blue-200',
    Contacted: 'bg-amber-50 text-amber-600 border-amber-200',
    Qualified: 'bg-green-50 text-green-600 border-green-200'
  };

  const SidebarContent = () => {
    // 👥 Get initials fallback text structure if no profile image exists yet
    const getInitials = (name) => {
      if (!name) return "U";
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // 🎨 Dynamic theme colors for fallback avatar background based on user type
    const bgFallbackColor = rawRole === "owner" ? "bg-rose-600 text-white shadow-rose-200" : "bg-purple-600 text-white shadow-purple-200";

    return (
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* 🌟 Dynamic Top-Left Profile Photo & Account Label Branding */}
          <div className="flex items-center gap-3 px-2 mb-8">
            
            {/* Profile Avatar Frame Box */}
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
              {profile?.avatar && !profile.avatar.includes("ui-avatars.com") ? (
                <img 
                  src={profile.avatar} 
                  alt={profile?.name || "User Profile"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-bold text-sm tracking-wider ${bgFallbackColor}`}>
                  {getInitials(profile?.name || "Owner")}
                </div>
              )}
            </div>

            {/* Dynamic Name & Ecosystem Subtext */}
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 leading-tight truncate">
                {profile?.name || "Priya Mehta"}
              </h2>
              <p className="text-xs text-gray-400 font-medium truncate">
                {profile?.company || (rawRole === "owner" ? "RealEstate Realty" : "Independent Portfolio")}
              </p>
            </div>
          </div>

          {/* Navigation Core NavLinks */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? rawRole === 'owner' 
                        ? 'bg-rose-50 text-rose-600 shadow-sm' 
                        : 'bg-purple-50 text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Account Bottom Options */}
        <div className="pt-4 border-t border-gray-100 space-y-1">
          <NavLink to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Globe className="h-4 w-4 text-gray-400" />
            Back to Website
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50/50 transition-colors">
            <LogOut className="h-4 w-4 text-rose-500" />
            Logout
          </button>
        </div>
      </div>
    );
  };



  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR DISPLAY */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col justify-between py-6 px-4 shrink-0">
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER ACCESSIBILITY VIEW */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white flex flex-col justify-between py-6 px-4 shadow-xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* MAIN VIEWPORT BODY CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-100 py-5 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {rawRole === "owner" ? "Owner Dashboard" : "Agent Dashboard"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage listings, view appointments, and track your metrics.</p>
            </div>
          </div>
          
          {/* Synchronized Header Profile Avatar Info Block */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                {profile?.company || displayPortfolioText}
              </p>
              <p className={`text-xs font-semibold ${badgeColor}`}>
                {displayAccountType}
              </p>
            </div>
            
            <div className="h-10 w-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
              {profile?.avatar && !profile.avatar.includes("ui-avatars.com") ? (
                <img 
                  src={profile.avatar} 
                  alt={profile?.name || "User Avatar"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-bold text-xs tracking-wider ${bgFallbackColor}`}>
                  {getInitials(profile?.name || "Owner")}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {isDashboardHome ? (
            /* RENDERS INTEGRATED DASHBOARD HOME OVERVIEW SCREEN DIRECTLY */
            <div className="space-y-8 animate-fadeIn">
              
              {/* 8-COLUMN CORE METRIC GRID PANELS */}
              <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {statistics.map((stat, index) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={index} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-w-0">
                      <div className={`h-8 w-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3 shrink-0`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                                            <div>
                        <p className="text-xs text-gray-400 font-medium truncate">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.count}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Lower Section Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Leads Feed */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-gray-900 text-base mb-4">Recent Inbound Leads</h3>
                  <div className="divide-y divide-gray-50">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-600 shrink-0">
                            {lead.initial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{lead.interest}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[lead.status] || 'bg-gray-50 text-gray-600'}`}>
                          {lead.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* DYNAMIC ROUTE PAGE VIEWS RENDERED VIA OUTLET CONTEXT */
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}

