import { useState } from "react";
import {
  Search,
  ShieldAlert,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
} from "lucide-react";

export default function Fraud() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [fraudCases, setFraudCases] = useState([
    {
      id: 1,
      type: "User",
      name: "Rajesh Kumar",
      email: "rajesh@gmail.com",
      issue: "Multiple suspicious accounts",
      riskScore: 92,
      date: "Sep 18, 2026",
      status: "Flagged",
    },
    {
      id: 2,
      type: "Property",
      name: "Luxury Villa - Whitefield",
      email: "owner@example.com",
      issue: "Duplicate property listing",
      riskScore: 78,
      date: "Sep 17, 2026",
      status: "Investigating",
    },
    {
      id: 3,
      type: "Transaction",
      name: "TXN-20260915001",
      email: "priya@gmail.com",
      issue: "Unusual payment activity",
      riskScore: 88,
      date: "Sep 15, 2026",
      status: "Flagged",
    },
    {
      id: 4,
      type: "User",
      name: "Amit Sharma",
      email: "amit@gmail.com",
      issue: "Repeated failed payments",
      riskScore: 71,
      date: "Sep 14, 2026",
      status: "Cleared",
    },
    {
      id: 5,
      type: "Property",
      name: "2BHK Apartment - HSR",
      email: "owner2@gmail.com",
      issue: "Suspicious property details",
      riskScore: 84,
      date: "Sep 12, 2026",
      status: "Blocked",
    },
  ]);

  const updateStatus = (id, status) => {
    setFraudCases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const filteredCases = fraudCases.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.issue.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const flaggedCount = fraudCases.filter(
    (item) => item.status === "Flagged"
  ).length;

  const investigatingCount = fraudCases.filter(
    (item) => item.status === "Investigating"
  ).length;

  const blockedCount = fraudCases.filter(
    (item) => item.status === "Blocked"
  ).length;

  const highRiskCount = fraudCases.filter(
    (item) => item.riskScore >= 80
  ).length;

  const getRiskColor = (score) => {
    if (score >= 80) return "text-red-600 bg-red-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusColor = (status) => {
    if (status === "Flagged")
      return "bg-red-100 text-red-700";

    if (status === "Investigating")
      return "bg-yellow-100 text-yellow-700";

    if (status === "Cleared")
      return "bg-green-100 text-green-700";

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 pt-4 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Fraud Detection
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and investigate suspicious activities
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium">
            {highRiskCount} High Risk
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Flagged</p>
              <h2 className="text-2xl font-bold mt-1">
                {flaggedCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Investigating</p>
              <h2 className="text-2xl font-bold mt-1">
                {investigatingCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Blocked</p>
              <h2 className="text-2xl font-bold mt-1">
                {blockedCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">High Risk</p>
              <h2 className="text-2xl font-bold mt-1">
                {highRiskCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, email or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-lg bg-white outline-none"
          >
            <option value="All">All Status</option>
            <option value="Flagged">Flagged</option>
            <option value="Investigating">
              Investigating
            </option>
            <option value="Cleared">Cleared</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Fraud Cases */}
      <div className="space-y-4">
        {filteredCases.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Details */}
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {item.type}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.email}
                  </p>

                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">
                      Issue:
                    </span>{" "}
                    {item.issue}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Detected on {item.date}
                  </p>
                </div>
              </div>

              {/* Risk */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    Risk Score
                  </p>

                  <span
                    className={`inline-flex px-3 py-1.5 rounded-lg font-bold ${getRiskColor(
                      item.riskScore
                    )}`}
                  >
                    {item.riskScore}/100
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateStatus(item.id, "Investigating")
                    }
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Investigate
                  </button>

                  {item.status !== "Cleared" && (
                    <button
                      onClick={() =>
                        updateStatus(item.id, "Cleared")
                      }
                      className="px-3 py-2 text-sm text-green-700 border border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Clear
                    </button>
                  )}

                  {item.status !== "Blocked" && (
                    <button
                      onClick={() =>
                        updateStatus(item.id, "Blocked")
                      }
                      className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4 inline mr-1" />
                      Block
                    </button>
                  )}

                  {item.status === "Blocked" && (
                    <button
                      onClick={() =>
                        updateStatus(item.id, "Flagged")
                      }
                      className="px-3 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50"
                    >
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            No fraud cases found.
          </div>
        )}
      </div>
    </div>
  );
}