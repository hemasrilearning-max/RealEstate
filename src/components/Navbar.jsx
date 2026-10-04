import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

import {
  LogIn,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserPlus,
  Building2,
  Home,
  Heart,
  User,
  Search,
  MessageCircle,
  CalendarDays,
  ChevronDown,
  Eye,
  CreditCard,
  Star,
  Bell,
  Sparkles,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { ROLE_DASHBOARD } from "../data/users";

export default function Navbar() {
  const {
    user,
    logout,
    isAuthenticated,
    role,
  } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // ============================================================
  // BACKEND PROFILE PHOTO
  // ============================================================

  const [profilePhoto, setProfilePhoto] =
    useState(null);

  const photoObjectUrlRef =
    useRef(null);

  /*
   * Keep the user ID stable.
   *
   * Updating profile fields such as:
   * name, email, phone, occupation, city
   *
   * should NOT cause the Navbar to reload the profile photo.
   */
  const userId =
    user?.userId ||
    user?.id ||
    null;

  useEffect(() => {
    let mounted = true;

    const loadProfilePhoto = async () => {
      if (!userId || !isAuthenticated) {
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

        /*
         * Remove previous object URL
         * before creating a new one.
         */
        if (
          photoObjectUrlRef.current
        ) {
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
        /*
         * No profile photo uploaded.
         *
         * Keep the normal fallback avatar.
         */
        if (mounted) {
          setProfilePhoto(null);
        }
      }
    };

    loadProfilePhoto();

    return () => {
      mounted = false;

      if (
        photoObjectUrlRef.current
      ) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current =
          null;
      }
    };
  }, [
    userId,
    isAuthenticated,
    user?.profilePhotoUpdatedAt,
  ]);

  // ============================================================
  // FALLBACK AVATAR
  // ============================================================

  const fallbackAvatar =
    `https://i.pravatar.cc/150?u=${encodeURIComponent(
      user?.email || "user"
    )}`;

  const currentAvatar =
    profilePhoto ||
    user?.avatar ||
    fallbackAvatar;

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    logout();

    setOpen(false);
    setAccountOpen(false);

    navigate("/");
  };

  // ============================================================
  // CLOSE MENU
  // ============================================================

  const closeMenu = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  // ============================================================
  // DASHBOARD
  // ============================================================

  const dashboardPath = role
    ? ROLE_DASHBOARD[role] || "/login"
    : "/login";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            MAIN NAVBAR
        ====================================================== */}
        <div className="flex justify-between items-center h-16">

          {/* ===================================================
              LOGO
          ==================================================== */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 shrink-0"
          >
            <img
              src="/images/hspacelogo.png"
              alt="HomeSpace"
              width="120"
              className="h-auto object-contain"
            />
          </Link>

          {/* ===================================================
              DESKTOP NAVIGATION
          ==================================================== */}
          <div className="hidden md:flex items-center gap-5">

            {/* Home */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 font-medium transition"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            {/* Properties */}
            <Link
              to="/properties"
              onClick={closeMenu}
              className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 font-medium transition group"
            >
              <Building2 className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition" />
              <span>Properties</span>
            </Link>

            {/* =================================================
                AUTHENTICATED USER
            ================================================== */}
            {isAuthenticated ? (

              /* =================================================
                 BUYER
              ================================================== */
              role === "buyer" ? (

                <div className="relative">

                  {/* Buyer account button */}
                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        (prev) => !prev
                      )
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
                  >
                    <img
                      src={currentAvatar}
                      alt={
                        user?.name ||
                        "Buyer"
                      }
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
                    />

                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {user?.name ||
                          "Buyer"}
                      </div>

                      <div className="text-xs text-gray-400">
                        Buyer
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        accountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {/* =================================================
                      BUYER ACCOUNT DROPDOWN
                  ================================================== */}
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                      {/* User information */}
                      <div className="px-4 py-4 bg-purple-50 border-b border-purple-100">
                        <div className="flex items-center gap-3">

                          <img
                            src={currentAvatar}
                            alt={
                              user?.name ||
                              "Buyer"
                            }
                            className="w-11 h-11 rounded-full object-cover"
                          />

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user?.name ||
                                "Buyer"}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* =================================================
                          BUYER WEBSITE FUNCTIONALITY
                      ================================================== */}
                      <div className="py-2 max-h-[200px] overflow-y-auto">

                        {/* Profile */}
                        <Link
                          to="/profile"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>

                        {/* Favorites */}
                        <Link
                          to="/favorites"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Heart className="w-4 h-4" />
                          Favorites
                        </Link>

                        {/* Saved Searches */}
                        <Link
                          to="/saved-searches"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Search className="w-4 h-4" />
                          Saved Searches
                        </Link>

                        {/* Viewed Properties */}
                        <Link
                          to="/viewed-properties"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Viewed Properties
                        </Link>

                        {/* Messages */}
                        <Link
                          to="/messages"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Messages
                        </Link>

                        {/* Tour Bookings */}
                        <Link
                          to="/tours"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <CalendarDays className="w-4 h-4" />
                          Tour Bookings
                        </Link>

                        {/* Payments */}
                        <Link
                          to="/payments"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <CreditCard className="w-4 h-4" />
                          Payments
                        </Link>

                        {/* Reviews */}
                        <Link
                          to="/reviews"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Star className="w-4 h-4" />
                          Reviews
                        </Link>

                        {/* Notifications */}
                        <Link
                          to="/notifications"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Bell className="w-4 h-4" />
                          Notifications
                        </Link>

                        {/* Recommendations */}
                        <Link
                          to="/recommendations"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                        >
                          <Sparkles className="w-4 h-4" />
                          Recommendations
                        </Link>

                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              ) : (

                /* =================================================
                   AGENT / OWNER / ADMIN
                ================================================== */
                <>
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 font-medium transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <div className="flex items-center gap-3">

                    <img
                      src={currentAvatar}
                      alt={
                        user?.name ||
                        "User"
                      }
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
                    />

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        {user?.name}
                      </span>

                      <span className="ml-1.5 text-xs text-gray-400 capitalize">
                        ({role})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>

                  </div>
                </>
              )

            ) : (

              /* =================================================
                 LOGGED OUT
              ================================================== */
              <div className="flex items-center gap-3">

                {/* Login */}
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-gray-700 font-medium border border-gray-500 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>

              </div>
            )}

          </div>

          {/* ===================================================
              MOBILE MENU BUTTON
          ==================================================== */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 hover:text-purple-600"
            onClick={() =>
              setOpen((prev) => !prev)
            }
            aria-label="Open navigation menu"
          >
            {open ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}
        {open && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-100 pt-3">

            {/* Home */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            {/* Properties */}
            <Link
              to="/properties"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
            >
              <Building2 className="w-4 h-4" />
              Properties
            </Link>

            {isAuthenticated ? (

              /* =================================================
                 MOBILE AUTHENTICATED
              ================================================== */
              role === "buyer" ? (

                /* =================================================
                   MOBILE BUYER
                ================================================== */
                <div className="border-t border-gray-100 pt-3 mt-2">

                  {/* Buyer profile */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">

                    <img
                      src={currentAvatar}
                      alt={
                        user?.name ||
                        "Buyer"
                      }
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.name ||
                          "Buyer"}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  {/* Favorites */}
                  <Link
                    to="/favorites"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Link>

                  {/* Saved Searches */}
                  <Link
                    to="/saved-searches"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Search className="w-4 h-4" />
                    Saved Searches
                  </Link>

                  {/* Viewed Properties */}
                  <Link
                    to="/viewed-properties"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                    Viewed Properties
                  </Link>

                  {/* Messages */}
                  <Link
                    to="/messages"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Messages
                  </Link>

                  {/* Tours */}
                  <Link
                    to="/tours"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Tour Bookings
                  </Link>

                  {/* Payments */}
                  <Link
                    to="/payments"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </Link>

                  {/* Reviews */}
                  <Link
                    to="/reviews"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Star className="w-4 h-4" />
                    Reviews
                  </Link>

                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Link>

                  {/* Recommendations */}
                  <Link
                    to="/recommendations"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    Recommendations
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-3 py-2.5 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                </div>

              ) : (

                /* =================================================
                   MOBILE AGENT / OWNER / ADMIN
                ================================================== */
                <>
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard ({role})
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )

            ) : (

              /* =================================================
                 MOBILE LOGGED OUT
              ================================================== */
              <>
                {/* Login */}
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-700 border border-gray-500 rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-600 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  onClick={closeMenu}
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