import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  Users,
  Building2,
  ShoppingCart,
  Wallet,
  Flag,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check admin login
  if (!user || user.role !== "admin") {
    navigate("/login", { replace: true });
    return null;
  }

  // =========================
  // MOCK DASHBOARD DATA
  // =========================

  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Properties",
      value: "856",
      icon: Building2,
      description: "All property listings",
    },
    {
      title: "Pending Approvals",
      value: "24",
      icon: Clock,
      description: "Properties waiting",
    },
    {
      title: "Transactions",
      value: "342",
      icon: ShoppingCart,
      description: "Total transactions",
    },
    {
      title: "Payments",
      value: "₹18.5L",
      icon: Wallet,
      description: "Total payments",
    },
    {
      title: "Reports",
      value: "17",
      icon: Flag,
      description: "Open reports",
    },
  ];

  const recentActivities = [
    {
      name: "Rahul Sharma",
      action: "registered as Buyer",
      time: "10 minutes ago",
    },
    {
      name: "Priya Patel",
      action: "submitted a new property",
      time: "30 minutes ago",
    },
    {
      name: "Amit Verma",
      action: "completed a payment",
      time: "1 hour ago",
    },
    {
      name: "Neha Rao",
      action: "reported a property",
      time: "2 hours ago",
    },
  ];

  const pendingProperties = [
    {
      property: "Luxury Villa",
      owner: "Rahul Sharma",
      location: "Bangalore",
      status: "Pending",
    },
    {
      property: "3 BHK Apartment",
      owner: "Priya Patel",
      location: "Whitefield",
      status: "Pending",
    },
    {
      property: "Independent House",
      owner: "Amit Verma",
      location: "HSR Layout",
      status: "Pending",
    },
  ];

  return (
    <div className="w-full">

      {/* =========================
          PAGE CONTENT
      ========================= */}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user.name}
        </p>
      </div>

      {/* Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Overview
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage your real-estate platform.
        </p>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-600" />
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {stat.title}
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {stat.description}
              </p>
            </div>
          );
        })}

      </div>

      {/* =========================
          RECENT ACTIVITY + PENDING
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl">

          <div className="p-5 border-b border-gray-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Activity
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Latest activity on the platform
              </p>
            </div>

            <Bell className="w-5 h-5 text-gray-400" />

          </div>

          <div className="divide-y divide-gray-100">

            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="p-5 flex items-center gap-4"
              >

                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                  {activity.name.charAt(0)}
                </div>

                <div className="flex-1">

                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">
                      {activity.name}
                    </span>{" "}
                    {activity.action}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>

                </div>

              </div>
            ))}

          </div>
        </div>

        {/* Pending Properties */}
        <div className="bg-white border border-gray-200 rounded-xl">

          <div className="p-5 border-b border-gray-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Pending Property Approvals
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Properties waiting for admin approval
              </p>
            </div>

            <Clock className="w-5 h-5 text-orange-500" />

          </div>

          <div className="divide-y divide-gray-100">

            {pendingProperties.map((property, index) => (
              <div
                key={index}
                className="p-5"
              >

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {property.property}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {property.owner} • {property.location}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs rounded-full whitespace-nowrap">
                    {property.status}
                  </span>

                </div>

                <div className="flex gap-2 mt-4">

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>

                </div>

              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}