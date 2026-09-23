import { useState } from "react";
import {
  Search,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
} from "lucide-react";

export default function Disputes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [disputes, setDisputes] = useState([
    {
      id: 1,
      title: "Security deposit issue",
      raisedBy: "Arvind G.",
      otherParty: "Rahul Kumar",
      property: "3BHK Villa - Whitefield",
      category: "Payment",
      priority: "High",
      status: "Open",
      date: "Sep 18, 2026",
      description:
        "Tenant reported that the security deposit has not been returned after the lease ended.",
    },
    {
      id: 2,
      title: "Property condition mismatch",
      raisedBy: "Priya Sharma",
      otherParty: "Anil Raj",
      property: "2BHK Apartment - HSR Layout",
      category: "Property",
      priority: "Medium",
      status: "Under Review",
      date: "Sep 16, 2026",
      description:
        "The property condition was different from the condition shown in the listing.",
    },
    {
      id: 3,
      title: "Booking cancellation dispute",
      raisedBy: "Rahul Verma",
      otherParty: "Sneha R",
      property: "Studio - Indiranagar",
      category: "Booking",
      priority: "Low",
      status: "Resolved",
      date: "Sep 12, 2026",
      description:
        "Dispute regarding cancellation charges after a booking was cancelled.",
    },
    {
      id: 4,
      title: "Incorrect payment amount",
      raisedBy: "Kiran Kumar",
      otherParty: "Vikram S",
      property: "2BHK Apartment - Koramangala",
      category: "Payment",
      priority: "High",
      status: "Open",
      date: "Sep 10, 2026",
      description:
        "The amount charged during the transaction does not match the agreed amount.",
    },
    {
      id: 5,
      title: "Maintenance responsibility",
      raisedBy: "Sneha Rao",
      otherParty: "Kiran Kumar",
      property: "1BHK Apartment - Marathahalli",
      category: "Maintenance",
      priority: "Medium",
      status: "Rejected",
      date: "Sep 05, 2026",
      description:
        "Dispute regarding responsibility for a maintenance issue.",
    },
  ]);

  // Update dispute status
  const updateStatus = (id, status) => {
    setDisputes((current) =>
      current.map((dispute) =>
        dispute.id === id
          ? { ...dispute, status }
          : dispute
      )
    );
  };

  // Search + filters
  const filteredDisputes = disputes.filter((dispute) => {
    const value = search.toLowerCase();

    const matchesSearch =
      dispute.title.toLowerCase().includes(value) ||
      dispute.raisedBy.toLowerCase().includes(value) ||
      dispute.otherParty.toLowerCase().includes(value) ||
      dispute.property.toLowerCase().includes(value) ||
      dispute.category.toLowerCase().includes(value);

    const matchesStatus =
      statusFilter === "All" ||
      dispute.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      dispute.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  const openCount = disputes.filter(
    (d) => d.status === "Open"
  ).length;

  const reviewCount = disputes.filter(
    (d) => d.status === "Under Review"
  ).length;

  const resolvedCount = disputes.filter(
    (d) => d.status === "Resolved"
  ).length;

  const highPriorityCount = disputes.filter(
    (d) => d.priority === "High"
  ).length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row
        md:items-center md:justify-between
        gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Disputes
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and resolve disputes between users
          </p>
        </div>

        <div className="flex items-center gap-2
          bg-red-50 text-red-700
          px-4 py-2 rounded-lg">

          <AlertTriangle className="w-4 h-4" />

          <span className="font-semibold">
            {openCount}
          </span>

          <span className="text-sm">
            Open Disputes
          </span>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4
        gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Open
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {openCount}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Under Review
          </p>

          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {reviewCount}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {resolvedCount}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            High Priority
          </p>

          <p className="text-2xl font-bold text-orange-600 mt-1">
            {highPriorityCount}
          </p>
        </div>

      </div>

      {/* Search + Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2
              -translate-y-1/2 w-5 h-5
              text-gray-400"
            />

            <input
              type="text"
              placeholder="Search disputes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300
              rounded-lg pl-10 pr-4 py-3
              focus:outline-none focus:ring-2
              focus:ring-purple-500"
            />

          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border border-gray-300
            rounded-lg px-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Under Review">
              Under Review
            </option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="border border-gray-300
            rounded-lg px-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

        </div>

      </div>

      {/* Dispute Cards */}
      <div className="space-y-4">

        {filteredDisputes.length === 0 ? (

          <div className="bg-white border rounded-xl
            p-10 text-center">

            <p className="text-gray-500">
              No disputes found.
            </p>

          </div>

        ) : (

          filteredDisputes.map((dispute) => (

            <div
              key={dispute.id}
              className="bg-white border rounded-xl
              p-5 hover:shadow-sm transition"
            >

              {/* Top */}
              <div className="flex flex-col lg:flex-row
                lg:items-start lg:justify-between
                gap-4">

                <div className="flex gap-3">

                  <div className="w-11 h-11 rounded-lg
                    bg-red-100 flex items-center
                    justify-center flex-shrink-0">

                    <AlertTriangle
                      className="w-5 h-5 text-red-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-semibold text-gray-900">
                      {dispute.title}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      {dispute.category} • {dispute.date}
                    </p>

                  </div>

                </div>

                {/* Priority */}
                <span
                  className={`text-xs font-medium
                  px-3 py-1 rounded-full self-start ${
                    dispute.priority === "High"
                      ? "bg-red-50 text-red-600"
                      : dispute.priority === "Medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {dispute.priority} Priority
                </span>

              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3
                gap-4 mt-5 pt-4 border-t">

                <div>
                  <p className="text-xs text-gray-400">
                    Raised By
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {dispute.raisedBy}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Other Party
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {dispute.otherParty}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Property
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {dispute.property}
                  </p>
                </div>

              </div>

              {/* Description */}
              <div className="mt-4">

                <p className="text-xs text-gray-400 mb-1">
                  Description
                </p>

                <p className="text-sm text-gray-600">
                  {dispute.description}
                </p>

              </div>

              {/* Bottom */}
              <div className="flex flex-col md:flex-row
                md:items-center md:justify-between
                gap-3 mt-5 pt-4 border-t">

                {/* Status */}
                <div>

                  {dispute.status === "Open" && (
                    <span className="text-xs font-medium
                      text-red-600 bg-red-50
                      px-3 py-1.5 rounded-full">
                      ● Open
                    </span>
                  )}

                  {dispute.status === "Under Review" && (
                    <span className="text-xs font-medium
                      text-yellow-700 bg-yellow-50
                      px-3 py-1.5 rounded-full">
                      ● Under Review
                    </span>
                  )}

                  {dispute.status === "Resolved" && (
                    <span className="flex items-center gap-1
                      text-xs font-medium
                      text-green-600 bg-green-50
                      px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      Resolved
                    </span>
                  )}

                  {dispute.status === "Rejected" && (
                    <span className="flex items-center gap-1
                      text-xs font-medium
                      text-gray-600 bg-gray-100
                      px-3 py-1.5 rounded-full">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}

                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      updateStatus(dispute.id, "Under Review")
                    }
                    className="flex items-center gap-1
                    text-xs px-3 py-2 rounded-lg
                    border border-gray-300
                    text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>

                  {dispute.status !== "Resolved" && (
                    <button
                      onClick={() =>
                        updateStatus(dispute.id, "Resolved")
                      }
                      className="flex items-center gap-1
                      text-xs px-3 py-2 rounded-lg
                      bg-green-50 text-green-700
                      hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  )}

                  {dispute.status !== "Rejected" && (
                    <button
                      onClick={() =>
                        updateStatus(dispute.id, "Rejected")
                      }
                      className="flex items-center gap-1
                      text-xs px-3 py-2 rounded-lg
                      bg-red-50 text-red-600
                      hover:bg-red-100"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  {dispute.priority === "High" &&
                    dispute.status !== "Resolved" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            dispute.id,
                            "Under Review"
                          )
                        }
                        className="flex items-center gap-1
                        text-xs px-3 py-2 rounded-lg
                        bg-purple-50 text-purple-700
                        hover:bg-purple-100"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        Escalate
                      </button>
                    )}

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}