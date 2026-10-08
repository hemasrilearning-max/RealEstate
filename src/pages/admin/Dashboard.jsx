import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Clock,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, propertiesResponse] =
        await Promise.all([
          axiosInstance.get("/api/users"),
          axiosInstance.get("/api/properties"),
        ]);

      setUsers(usersResponse.data || []);
      setProperties(propertiesResponse.data || []);
    } catch (err) {
      console.error("Dashboard data loading failed:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view dashboard data.");
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // USER STATISTICS
  // =========================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  const buyers = users.filter(
    (user) => user.role === "BUYER"
  ).length;

  const sellers = users.filter(
    (user) => user.role === "SELLER"
  ).length;

  const agents = users.filter(
    (user) => user.role === "BROKER"
  ).length;

  // =========================
  // PROPERTY STATISTICS
  // =========================

  const totalProperties = properties.length;

  const pendingProperties = properties.filter(
    (property) => property.status === "PENDING"
  ).length;

  const approvedProperties = properties.filter(
    (property) => property.status === "APPROVED"
  ).length;

  const availableProperties = properties.filter(
    (property) => property.status === "AVAILABLE"
  ).length;

  // =========================
  // RECENT USERS
  // =========================

  const recentUsers = [...users]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    })
    .slice(0, 5);

  // =========================
  // RECENT PROPERTIES
  // =========================

  const recentProperties = [...properties]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    })
    .slice(0, 5);

  const getUserName = (user) => {
    const name = `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    return name || user.username || "Unknown User";
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Overview of your real estate platform
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* =========================
          MAIN STAT CARDS
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        {/* Total Users */}
        <StatCard
          title="Total Users"
          value={loading ? "..." : totalUsers}
          icon={<Users className="w-6 h-6" />}
          description={`${activeUsers} active users`}
        />

        {/* Properties */}
        <StatCard
          title="Total Properties"
          value={loading ? "..." : totalProperties}
          icon={<Building2 className="w-6 h-6" />}
          description={`${availableProperties} available`}
        />

        {/* Active Users */}
        <StatCard
          title="Active Users"
          value={loading ? "..." : activeUsers}
          icon={<UserCheck className="w-6 h-6" />}
          description={`${inactiveUsers} inactive`}
        />

        {/* Pending Properties */}
        <StatCard
          title="Pending Properties"
          value={loading ? "..." : pendingProperties}
          icon={<Clock className="w-6 h-6" />}
          description={`${approvedProperties} approved`}
        />

      </div>

      {/* =========================
          USER OVERVIEW
      ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Registered users by role
              </p>
            </div>

            <Users className="w-6 h-6 text-purple-600" />

          </div>

          <div className="space-y-4">

            <OverviewRow
              label="Buyers"
              value={buyers}
              total={totalUsers}
            />

            <OverviewRow
              label="Owners"
              value={sellers}
              total={totalUsers}
            />

            <OverviewRow
              label="Agents"
              value={agents}
              total={totalUsers}
            />

            <OverviewRow
              label="Other Users"
              value={
                Math.max(
                  totalUsers -
                    buyers -
                    sellers -
                    agents,
                  0
                )
              }
              total={totalUsers}
            />

          </div>

        </div>

        {/* Property Overview */}

        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Property Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current property listing status
              </p>
            </div>

            <Building2 className="w-6 h-6 text-purple-600" />

          </div>

          <div className="space-y-4">

            <OverviewRow
              label="Available"
              value={availableProperties}
              total={totalProperties}
            />

            <OverviewRow
              label="Approved"
              value={approvedProperties}
              total={totalProperties}
            />

            <OverviewRow
              label="Pending"
              value={pendingProperties}
              total={totalProperties}
            />

            <OverviewRow
              label="Other"
              value={
                Math.max(
                  totalProperties -
                    availableProperties -
                    approvedProperties -
                    pendingProperties,
                  0
                )
              }
              total={totalProperties}
            />

          </div>

        </div>

      </div>

      {/* =========================
          RECENT USERS
      ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Users
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Recently registered users
              </p>
            </div>

            <ArrowUpRight className="w-5 h-5 text-gray-400" />

          </div>

          {loading ? (
            <p className="text-sm text-gray-500">
              Loading users...
            </p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No users found.
            </p>
          ) : (
            <div className="space-y-4">

              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                      {getUserName(user)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getUserName(user)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {user.email || "No email"}
                      </p>
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-xs font-medium text-gray-700">
                      {user.role || "USER"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* =========================
            RECENT PROPERTIES
        ========================= */}

        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Properties
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Recently added property listings
              </p>
            </div>

            <ArrowUpRight className="w-5 h-5 text-gray-400" />

          </div>

          {loading ? (
            <p className="text-sm text-gray-500">
              Loading properties...
            </p>
          ) : recentProperties.length === 0 ? (
            <p className="text-sm text-gray-500">
              No properties found.
            </p>
          ) : (
            <div className="space-y-4">

              {recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-gray-900 truncate">
                      {property.title || "Untitled Property"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {property.location?.city ||
                        "Location not available"}
                    </p>

                  </div>

                  <div className="text-right ml-4">

                    <p className="text-sm font-medium text-gray-900">
                      {property.price
                        ? `₹${Number(
                            property.price
                          ).toLocaleString("en-IN")}`
                        : "Price N/A"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {property.status || "UNKNOWN"}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* =========================
          NOTE
      ========================= */}

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          Transaction and payment statistics are not shown yet.
          They will be connected after the Transaction and Payment
          backend modules are completed.
        </p>
      </div>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="bg-white border rounded-xl p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>

        <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

      <p className="text-xs text-gray-500 mt-4">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   OVERVIEW ROW
===================================================== */

function OverviewRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between mb-1">

        <span className="text-sm text-gray-600">
          {label}
        </span>

        <span className="text-sm font-medium text-gray-900">
          {value}
        </span>

      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}