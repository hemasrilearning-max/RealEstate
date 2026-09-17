import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext"; // 👈 Integrated Auth Context Hook
import { 
  LayoutDashboard, User, Heart, Search, Eye, MessageSquare, Calendar, CreditCard, Star, Bell, Sparkles, Globe, LogOut, Menu, X, CheckCircle, Clock, Compass, MapPin
} from 'lucide-react';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 👥 Dynamic Global Context Authentication Fetch
  const { buyer, user } = useAuth();
  const profile = buyer || user;

  // 1. Module Sidebar List
  const sidebarItems = [
    { to: '/buyer/dashboard', name: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/buyer/profile', name: 'Profile', icon: User },
    { to: '/buyer/favorites', name: 'Favorites', icon: Heart },
    { to: '/buyer/saved-searches', name: 'Saved Searches', icon: Search },
    { to: '/buyer/viewed-properties', name: 'Viewed Properties', icon: Eye },
    { to: '/buyer/messages', name: 'Messages', icon: MessageSquare },
    { to: '/buyer/tours', name: 'Tour Bookings', icon: Calendar },
    { to: '/buyer/payments', name: 'Payments', icon: CreditCard },
    { to: '/buyer/reviews', name: 'Reviews', icon: Star },
    { to: '/buyer/notifications', name: 'Notifications', icon: Bell },
    { to: '/buyer/recommendations', name: 'Recommendations', icon: Sparkles },
  ];

  // 4 Actionable Metrics matching common tenant / buyer telemetry
  const statistics = [
    { label: 'Favorite Properties', count: '14', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Upcoming Tours', count: '3', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Applications', count: '1', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread Messages', count: '4', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Mock list mapping out personalized AI discovery matches
  const recentRecommendations = [
    { id: 1, title: 'Luxury 3 BHK Flat', loc: 'Whitefield, Bangalore', price: '₹1.20 Cr', status: 'Matching Search Criteria' },
    { id: 2, title: 'Premium 2 BHK Apartment', loc: 'HSR Layout, Bangalore', price: '₹45,000 /mo', status: 'Price Drop Alert' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  // State flag tracking whether the layout viewport handles subpages or default dashboard boards
  const isDashboardHome = location.pathname === '/buyer' || location.pathname === '/buyer/dashboard';

  // Initials generator helper method
  const getInitials = (name) => {
    if (!name) return "B";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* 🌟 Dynamic Top-Left Sidebar Profile Photo & Account Label Branding */}
        <div className="flex items-center gap-3 px-2 mb-8">
          {/* Profile Avatar Frame Box */}
          <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center shrink-0 bg-emerald-600 text-white font-bold text-sm">
            {profile?.avatar && !profile.avatar.includes("ui-avatars.com") ? (
              <img 
                src={profile.avatar} 
                alt={profile?.name || "User Profile"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold tracking-wider">
                {getInitials(profile?.name || "Arjun Patel")}
              </div>
            )}
          </div>

          {/* Live Sync Name & Workspace labels */}
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 leading-tight truncate">
              {profile?.name || "Arjun Patel"}
            </h2>
            <p className="text-xs text-gray-400 font-medium truncate">Buyer Ecosystem</p>
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
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
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
          Browse Properties
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-600 hover:bg-emerald-50/50 transition-colors">
          <LogOut className="h-4 w-4 text-emerald-500" />
          Logout
        </button>
      </div>
    </div>
  );

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
        {/* 🌟 Dynamic Top-Right Header Content Synchronization */}
        <header className="bg-white border-b border-gray-100 py-5 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Buyer Workspace</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Welcome back, {profile?.name || "Arjun Patel"} · {profile?.email || "buyer@gmail.com"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{profile?.name || "Arjun Patel"}</p>
              <p className="text-xs text-emerald-600 font-semibold">Premium Account</p>
            </div>
            
            {/* Synchronized Header Circle Avatar Frame */}
            <div className="h-10 w-10 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 shadow-sm shrink-0">
              {profile?.avatar && !profile.avatar.includes("ui-avatars.com") ? (
                <img 
                  src={profile.avatar} 
                  alt={profile?.name || "User Avatar"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold tracking-wider text-xs">
                  {getInitials(profile?.name || "Arjun Patel")}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {isDashboardHome ? (
            /* RENDERS INTEGRATED DASHBOARD HOME OVERVIEW SCREEN DIRECTLY */
            <div className="space-y-8 animate-fadeIn">
              
              {/* 4-COLUMN CORE METRIC GRID PANELS */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statistics.map((stat, index) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={index} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 min-w-0">
                      <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5">{stat.count}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* TWO-COLUMN ROW SECTION: RECOMMENDATIONS & TOUR TRACKER BANNERS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 🏡 Recommendations Panel Layout Box */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" /> AI-Driven Discovery Matches
                  </h3>
                  <div className="divide-y divide-gray-50">
                    {recentRecommendations.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {item.loc}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-sm font-bold text-gray-900">{item.price}</span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 📅 Right Columns Container side content panel card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">Need Direct Agent Support?</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Schedule tours, connect with property owners directly, or submit formal purchase applications smoothly.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/buyer/tours')} 
                    className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    View All Bookings
                  </button>
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
