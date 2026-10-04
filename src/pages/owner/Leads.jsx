import React, { useEffect, useMemo, useState } from "react";
import {
  Phone,
  RefreshCw,
  X,
  Mail,
  User,
  Home,
  Calendar,
  FileText,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import leadService from "../../services/leadService";

export default function Leads() {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [selectedLead, setSelectedLead] = useState(null);

  /*
   * Seller ID can have different names depending on
   * how AuthContext stores the logged-in user.
   */
  const sellerId =
    user?.id ||
    user?.userId ||
    user?.sellerId ||
    user?.user?.id ||
    user?.user?.userId;

  useEffect(() => {
    loadLeads();
  }, [sellerId]);

  async function loadLeads() {
    if (!sellerId) {
      setLoading(false);
      setError(
        "Unable to identify the logged-in seller."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await leadService.getLeadsBySeller(
          sellerId
        );

      setLeads(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load leads:",
        err
      );

      setError(
        err?.message ||
          "Unable to load leads. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * UPDATE STATUS
   * ============================================================
   */
  async function handleStatusChange(
    leadId,
    status
  ) {
    try {
      setUpdatingId(leadId);
      setError("");

      const updatedLead =
        await leadService.updateLeadStatus(
          leadId,
          status
        );

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? updatedLead
            : lead
        )
      );

      /*
       * If details modal is currently open,
       * update the displayed lead as well.
       */
      setSelectedLead((currentLead) =>
        currentLead?.id === leadId
          ? updatedLead
          : currentLead
      );
    } catch (err) {
      console.error(
        "Failed to update lead status:",
        err
      );

      setError(
        err?.message ||
          "Unable to update lead status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * ============================================================
   * STATUS LABEL
   * ============================================================
   */
  function getStatusLabel(status) {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "NEW":
        return "New";

      case "CONTACTED":
        return "Contacted";

      case "IN_PROGRESS":
        return "In Progress";

      case "CONVERTED":
        return "Converted";

      case "CLOSED":
        return "Closed";

      default:
        return status || "Unknown";
    }
  }

  /*
   * ============================================================
   * STATUS COLORS
   * ============================================================
   */
  function getStatusColors(status) {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "NEW":
        return "bg-blue-50 text-blue-600 border-blue-200";

      case "CONTACTED":
        return "bg-amber-50 text-amber-600 border-amber-200";

      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-600 border-purple-200";

      case "CONVERTED":
        return "bg-green-50 text-green-600 border-green-200";

      case "CLOSED":
        return "bg-gray-100 text-gray-500 border-gray-200";

      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  }

  /*
   * ============================================================
   * TIME FORMAT
   * ============================================================
   */
  function formatTimeframe(createdAt) {
    if (!createdAt) {
      return "-";
    }

    const created = new Date(createdAt);

    if (Number.isNaN(created.getTime())) {
      return "-";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      created.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr${
        hours === 1 ? "" : "s"
      } ago`;
    }

    if (days === 1) {
      return "1 day ago";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return created.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /*
   * ============================================================
   * FULL DATE / TIME FOR DETAILS
   * ============================================================
   */
  function formatFullDate(createdAt) {
    if (!createdAt) {
      return "-";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /*
   * ============================================================
   * NEXT STATUS
   * ============================================================
   */
  function getNextStatus(status) {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "NEW":
        return "CONTACTED";

      case "CONTACTED":
        return "IN_PROGRESS";

      case "IN_PROGRESS":
        return "CONVERTED";

      default:
        return null;
    }
  }

  /*
   * ============================================================
   * FILTERED LEADS
   * ============================================================
   */
  const filteredLeads = useMemo(() => {
    if (filter === "All") {
      return leads;
    }

    return leads.filter(
      (lead) =>
        String(
          lead.status || ""
        ).toUpperCase() === filter
    );
  }, [leads, filter]);

  const filterOptions = [
    {
      value: "All",
      label: "All",
    },
    {
      value: "NEW",
      label: "New",
    },
    {
      value: "CONTACTED",
      label: "Contacted",
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
    },
    {
      value: "CONVERTED",
      label: "Converted",
    },
  ];

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">

        {/* ======================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Leads Management
            </h2>

            <p className="text-sm text-gray-500 mt-0.5">
              Track and convert tenant inquiries for your active
              listings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* STATUS FILTERS */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/60">
              {filterOptions.map(
                (status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        status.value
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filter ===
                      status.value
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {status.label}
                  </button>
                )
              )}
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={loadLeads}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <div className="py-16 text-center">

            <RefreshCw
              size={24}
              className="mx-auto text-gray-400 animate-spin"
            />

            <p className="text-sm text-gray-500 mt-3">
              Loading leads...
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                TABLE
            ================================================== */}
            <div className="overflow-x-auto mt-6">

              <table className="w-full text-left border-collapse min-w-[900px]">

                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">

                    <th className="pb-3 pl-4">
                      Lead Contact
                    </th>

                    <th className="pb-3">
                      Target Property
                    </th>

                    <th className="pb-3">
                      Status
                    </th>

                    <th className="pb-3">
                      Received
                    </th>

                    <th className="pb-3 pr-4 text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">

                  {filteredLeads.map(
                    (lead) => {
                      const nextStatus =
                        getNextStatus(
                          lead.status
                        );

                      const isUpdating =
                        updatingId ===
                        lead.id;

                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >

                          {/* ==================================================
                              CONTACT
                          ================================================== */}
                          <td className="py-4 pl-4">

                            <div className="font-bold text-gray-900">
                              {lead.name ||
                                lead.buyerName ||
                                "Unknown"}
                            </div>

                            <div className="text-xs text-gray-400 mt-0.5">
                              {lead.email ||
                                "-"}{" "}
                              ·{" "}
                              {lead.phone ||
                                "-"}
                            </div>

                          </td>

                          {/* ==================================================
                              PROPERTY
                          ================================================== */}
                          <td className="py-4 font-medium text-gray-700">
                            {lead.propertyTitle ||
                              "Property"}
                          </td>

                          {/* ==================================================
                              STATUS
                          ================================================== */}
                          <td className="py-4">

                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusColors(
                                lead.status
                              )}`}
                            >
                              {getStatusLabel(
                                lead.status
                              )}
                            </span>

                          </td>

                          {/* ==================================================
                              RECEIVED
                          ================================================== */}
                          <td className="py-4 text-gray-500 text-xs font-medium">
                            {formatTimeframe(
                              lead.createdAt
                            )}
                          </td>

                          {/* ==================================================
                              ACTIONS
                          ================================================== */}
                          <td className="py-4 pr-4">

                            <div className="flex justify-end items-center gap-2">

                              {/* CALL */}
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                                >
                                  <Phone
                                    size={13}
                                  />

                                  Call
                                </a>
                              )}

                              {/* DETAILS */}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedLead(
                                    lead
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                              >
                                Details
                              </button>

                              {/* NEXT STATUS */}
                              {nextStatus && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      lead.id,
                                      nextStatus
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : getStatusLabel(
                                        nextStatus
                                      )}
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

              {/* ==================================================
                  NO LEADS
              ================================================== */}
              {filteredLeads.length === 0 && (
                <div className="text-center py-12">

                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center">
                    <Phone
                      size={20}
                      className="text-gray-400"
                    />
                  </div>

                  <p className="text-sm font-medium text-gray-600 mt-3">
                    No leads found
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    No inquiries match this status filter
                    right now.
                  </p>

                </div>
              )}

            </div>
          </>
        )}
      </div>

      {/* ========================================================
          LEAD DETAILS MODAL
      ======================================================== */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedLead(null);
            }
          }}
        >

          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/40" />

          {/* MODAL */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            {/* ==================================================
                MODAL HEADER
            ================================================== */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Lead Details
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Property enquiry information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(null)
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>

            </div>

            {/* ==================================================
                MODAL CONTENT
            ================================================== */}
            <div className="p-5 space-y-4">

              {/* BUYER */}
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <User
                    size={18}
                    className="text-gray-500"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Lead Contact
                  </p>

                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedLead.name ||
                      selectedLead.buyerName ||
                      "Unknown"}
                  </p>
                </div>

              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail
                    size={18}
                    className="text-gray-500"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Email
                  </p>

                  {selectedLead.email ? (
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="font-medium text-gray-700 hover:text-purple-600 mt-0.5 inline-block"
                    >
                      {selectedLead.email}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-700 mt-0.5">
                      -
                    </p>
                  )}
                </div>

              </div>

              {/* PHONE */}
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone
                    size={18}
                    className="text-gray-500"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Phone
                  </p>

                  {selectedLead.phone ? (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="font-medium text-gray-700 hover:text-purple-600 mt-0.5 inline-block"
                    >
                      {selectedLead.phone}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-700 mt-0.5">
                      -
                    </p>
                  )}
                </div>

              </div>

              {/* PROPERTY */}
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Home
                    size={18}
                    className="text-gray-500"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Target Property
                  </p>

                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedLead.propertyTitle ||
                      "Property"}
                  </p>
                </div>

              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">

                <div>
                  <p className="text-xs text-gray-400">
                    Status
                  </p>

                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {getStatusLabel(
                      selectedLead.status
                    )}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusColors(
                    selectedLead.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedLead.status
                  )}
                </span>

              </div>

              {/* RECEIVED */}
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Calendar
                    size={18}
                    className="text-gray-500"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Received
                  </p>

                  <p className="font-medium text-gray-700 mt-0.5">
                    {formatFullDate(
                      selectedLead.createdAt
                    )}
                  </p>
                </div>

              </div>

              {/* MESSAGE / ENQUIRY */}
              {selectedLead.message && (
                <div className="border-t border-gray-100 pt-4">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <FileText
                        size={18}
                        className="text-gray-500"
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs text-gray-400">
                        Enquiry Message
                      </p>

                      <p className="text-sm text-gray-600 leading-relaxed mt-1 whitespace-pre-wrap break-words">
                        {selectedLead.message}
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* ==================================================
                MODAL FOOTER
            ================================================== */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-2">

              {selectedLead.phone && (
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                >
                  <Phone size={15} />
                  Call Buyer
                </a>
              )}

              {getNextStatus(
                selectedLead.status
              ) && (
                <button
                  type="button"
                  disabled={
                    updatingId ===
                    selectedLead.id
                  }
                  onClick={() =>
                    handleStatusChange(
                      selectedLead.id,
                      getNextStatus(
                        selectedLead.status
                      )
                    )
                  }
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {updatingId ===
                  selectedLead.id
                    ? "Updating..."
                    : `Mark ${getStatusLabel(
                        getNextStatus(
                          selectedLead.status
                        )
                      )}`}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(null)
                }
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-gray-600 rounded-lg hover:bg-white transition"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}