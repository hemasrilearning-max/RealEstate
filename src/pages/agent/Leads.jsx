import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

const STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Closed",
  "Lost",
];

export default function Leads() {
  const { agent } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Get broker login user
  // ---------------------------------------------------------
  const getBrokerLogin = () => {
    try {
      const accessToken =
        localStorage.getItem("accessToken");

      const storedUser =
        localStorage.getItem("authUser");

      if (!accessToken || !storedUser) {
        return {
          brokerId: null,
          accessToken: null,
          user: null,
        };
      }

      const user = JSON.parse(storedUser);

      const brokerId =
        user?.id || user?.userId || agent?.id || agent?.userId;

      return {
        brokerId,
        accessToken,
        user,
      };
    } catch (err) {
      console.error(
        "Unable to read broker login information:",
        err
      );

      return {
        brokerId: null,
        accessToken: null,
        user: null,
      };
    }
  };

  // ---------------------------------------------------------
  // Load Leads
  // ---------------------------------------------------------
  const loadLeads = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        brokerId,
        accessToken,
        user,
      } = getBrokerLogin();

      console.log("Broker ID:", brokerId);
      console.log(
        "Broker token available:",
        !!accessToken
      );
      console.log("Broker user:", user);

      if (!accessToken) {
        setError(
          "Broker login session not found. Please login again."
        );
        setLeads([]);
        return;
      }

      if (!brokerId) {
        setError(
          "Broker information is not available. Please login again."
        );
        setLeads([]);
        return;
      }

      const response =
        await brokerService.brokerLeads(brokerId);

      console.log(
        "Broker Leads API response:",
        response
      );

      const leadData = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      setLeads(leadData);
    } catch (err) {
      console.error(
        "Failed to load broker leads:",
        err
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      if (err?.response?.status === 401) {
        setError(
          "Broker login session has expired. Please login again."
        );
      } else if (err?.response?.status === 403) {
        setError(
          "Broker access denied. Please login using the broker account."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load leads."
        );
      }

      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Load on page open
  // ---------------------------------------------------------
  useEffect(() => {
    loadLeads();
  }, [agent?.id, agent?.userId]);

  // ---------------------------------------------------------
  // Sort latest leads first
  // ---------------------------------------------------------
  const myLeads = [...leads].sort(
    (a, b) =>
      new Date(b?.createdAt || 0) -
      new Date(a?.createdAt || 0)
  );

  // ---------------------------------------------------------
  // Convert backend status to display status
  // ---------------------------------------------------------
  const normalizeStatus = (status) => {
    if (!status) return "New";

    const normalized =
      status.toString().toUpperCase();

    switch (normalized) {
      case "NEW":
        return "New";

      case "CONTACTED":
        return "Contacted";

      case "QUALIFIED":
        return "Qualified";

      case "CLOSED":
        return "Closed";

      case "LOST":
        return "Lost";

      default:
        return status;
    }
  };

  // ---------------------------------------------------------
  // Status styling
  // ---------------------------------------------------------
  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case "New":
        return {
          wrapper:
            "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

      case "Contacted":
        return {
          wrapper:
            "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "Qualified":
        return {
          wrapper:
            "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
        };

      case "Closed":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "Lost":
        return {
          wrapper:
            "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };

      default:
        return {
          wrapper:
            "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
        };
    }
  };

  // ---------------------------------------------------------
  // Status change
  // ---------------------------------------------------------
  const handleStatusChange = (leadId, newStatus) => {
    /*
     * UI update for now.
     *
     * Once the backend status-update API is available,
     * this can call that API.
     */
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
            }
          : lead
      )
    );
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Leads
          </h2>

          <p className="text-sm text-gray-500">
            Loading leads...
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Contact
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Property
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Message
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Source
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading leads...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Main page
  // ---------------------------------------------------------
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Leads
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {myLeads.length} total leads
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />

          <span className="text-xs text-gray-600">
            Live data
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadLeads}
            className="font-medium underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Header */}
            <thead className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5 font-medium">
                  Name
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Contact
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Property
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Message
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Source
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Status
                </th>

                <th className="px-4 py-3.5 font-medium">
                  Date
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100">

              {myLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-14 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>

                      <p className="text-gray-500">
                        No leads yet.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                myLeads.map((lead) => {
                  const status =
                    normalizeStatus(
                      lead.status
                    );

                  const statusStyle =
                    getStatusStyle(
                      lead.status
                    );

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 transition-colors"
                    >

                      {/* Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-semibold text-sm shrink-0">
                            {lead.name
                              ? lead.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "L"}
                          </div>

                          <div className="font-medium text-gray-900">
                            {lead.name || "—"}
                          </div>

                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">

                          {lead.email && (
                            <div className="text-xs text-gray-600">
                              {lead.email}
                            </div>
                          )}

                          {lead.phone && (
                            <div className="text-xs text-gray-500">
                              {lead.phone}
                            </div>
                          )}

                          {!lead.email &&
                            !lead.phone && (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}

                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-4 max-w-[180px]">
                        <div
                          className="truncate text-gray-700"
                          title={
                            lead.propertyTitle ||
                            lead.property?.title ||
                            lead.propertyName ||
                            ""
                          }
                        >
                          {lead.propertyTitle ||
                            lead.property?.title ||
                            lead.propertyName ||
                            "—"}
                        </div>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-4 max-w-[200px]">
                        <div
                          className="truncate text-gray-600"
                          title={
                            lead.message || ""
                          }
                        >
                          {lead.message || "—"}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          {lead.source || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="relative inline-flex">

                          <div
                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${statusStyle.dot}`}
                          />

                          <select
                            value={status}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value
                              )
                            }
                            className={`appearance-none cursor-pointer text-xs font-medium border rounded-lg pl-6 pr-8 py-1.5 outline-none transition-all hover:shadow-sm focus:ring-2 focus:ring-red-200 ${statusStyle.wrapper}`}
                          >
                            {STATUSES.map(
                              (item) => (
                                <option
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </option>
                              )
                            )}
                          </select>

                          {/* Dropdown arrow */}
                          <svg
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>

                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {lead.createdAt
                          ? new Date(
                              lead.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}