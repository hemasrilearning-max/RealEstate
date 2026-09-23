import { useState } from "react";
import {
  Users,
  Building2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Activity,
  Download,
  Calendar,
} from "lucide-react";

export default function Analytics() {
  const [period, setPeriod] = useState("This Month");

  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Properties",
      value: "856",
      change: "+8.2%",
      icon: Building2,
    },
    {
      title: "Transactions",
      value: "342",
      change: "+15.4%",
      icon: CreditCard,
    },
    {
      title: "Revenue",
      value: "₹18.5L",
      change: "+10.8%",
      icon: IndianRupee,
    },
  ];

  const monthlyData = [
    { month: "Apr", users: 720, properties: 510, transactions: 180 },
    { month: "May", users: 810, properties: 590, transactions: 210 },
    { month: "Jun", users: 900, properties: 650, transactions: 245 },
    { month: "Jul", users: 1020, properties: 720, transactions: 278 },
    { month: "Aug", users: 1140, properties: 790, transactions: 310 },
    { month: "Sep", users: 1248, properties: 856, transactions: 342 },
  ];

  const topProperties = [
    {
      name: "3BHK Villa - Whitefield",
      views: 1245,
      inquiries: 86,
      bookings: 14,
    },
    {
      name: "2BHK Apartment - HSR Layout",
      views: 1080,
      inquiries: 72,
      bookings: 11,
    },
    {
      name: "Luxury Villa - Sarjapur",
      views: 945,
      inquiries: 64,
      bookings: 9,
    },
    {
      name: "1BHK Apartment - Marathahalli",
      views: 820,
      inquiries: 51,
      bookings: 8,
    },
  ];

  const recentActivity = [
    {
      text: "New user registrations",
      value: "+124",
      time: "This month",
    },
    {
      text: "New property listings",
      value: "+86",
      time: "This month",
    },
    {
      text: "Completed transactions",
      value: "+42",
      time: "This month",
    },
    {
      text: "New reviews",
      value: "+68",
      time: "This month",
    },
  ];

  const handleExport = () => {
    const csvRows = [
      ["Metric", "Value", "Growth"],
      ["Total Users", "1248", "12.5%"],
      ["Properties", "856", "8.2%"],
      ["Transactions", "342", "15.4%"],
      ["Revenue", "1850000", "10.8%"],
    ];

    const csv = csvRows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "admin-analytics.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 pt-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor platform performance and business insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white border rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h2>

                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>

                <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth Overview */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Platform Growth
            </h2>

            <p className="text-sm text-gray-500">
              Users, properties and transactions
            </p>
          </div>

          <Activity className="w-5 h-5 text-purple-600" />
        </div>

        <div className="space-y-5">
          {monthlyData.map((item) => (
            <div key={item.month}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  {item.month}
                </span>

                <span className="text-gray-500">
                  {item.users} users • {item.properties} properties •{" "}
                  {item.transactions} transactions
                </span>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${(item.users / 1248) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Properties */}
        <div className="bg-white border rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Properties
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Properties with highest activity
            </p>
          </div>

          <div className="space-y-4">
            {topProperties.map((property, index) => (
              <div
                key={property.name}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">
                        {property.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {property.views} views
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-green-600">
                    {property.bookings} bookings
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">
                      Views
                    </p>
                    <p className="font-semibold mt-1">
                      {property.views}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">
                      Inquiries
                    </p>
                    <p className="font-semibold mt-1">
                      {property.inquiries}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Platform Activity
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Recent platform statistics
            </p>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.text}
                className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {activity.text}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>

                <span className="font-semibold text-purple-600">
                  {activity.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />

              <div>
                <p className="font-medium text-gray-900">
                  Overall Growth
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Platform activity has increased by 12.8%
                  compared with the previous period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}