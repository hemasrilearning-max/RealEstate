import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import tourService from "../../services/tourService";

export default function OwnerTours() {
  const { owner, user } = useAuth();

  const profile = owner || user;

  const sellerId =
    profile?.userId ||
    profile?.id;

  const [tours, setTours] = useState([]);
  const [activeFilter, setActiveFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD OWNER TOURS
   * ---------------------------------------------------------
   *
   * Backend does not currently provide:
   *
   * GET /api/tours/owner/{ownerId}
   *
   * So we:
   *
   * 1. Get owner's properties
   * 2. Get tours for each property
   */
  useEffect(() => {
    let cancelled = false;

    const loadTours = async () => {
      if (!sellerId) {
        setTours([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * Get properties belonging to this owner.
         */
        const propertiesResponse =
          await fetch(
            `/api/properties/seller/${sellerId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "accessToken"
                )}`,
              },
            }
          );

        if (!propertiesResponse.ok) {
          throw new Error(
            "Failed to load owner properties."
          );
        }

        const properties =
          await propertiesResponse.json();

        if (cancelled) {
          return;
        }

        if (
          !Array.isArray(properties) ||
          properties.length === 0
        ) {
          setTours([]);
          return;
        }

        /*
         * Get tours for every property.
         */
        const tourResponses =
          await Promise.all(
            properties.map((property) =>
              tourService.getToursByProperty(
                property.id
              )
            )
          );

        if (cancelled) {
          return;
        }

        /*
         * Combine all property tours
         * into one array.
         */
        const allTours =
          tourResponses.flat();

        /*
         * Remove accidental duplicates.
         */
        const uniqueTours = Array.from(
          new Map(
            allTours.map((tour) => [
              tour.id,
              tour,
            ])
          ).values()
        );

        /*
         * Sort newest tour date first.
         */
        uniqueTours.sort((a, b) => {
          const dateA =
            `${a.tourDate || ""} ${
              a.tourTime || ""
            }`;

          const dateB =
            `${b.tourDate || ""} ${
              b.tourTime || ""
            }`;

          return dateB.localeCompare(dateA);
        });

        setTours(uniqueTours);
      } catch (err) {
        console.error(
          "Failed to load tours:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load tour requests."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTours();

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  /*
   * ---------------------------------------------------------
   * STATUS UPDATE
   * ---------------------------------------------------------
   */
const handleUpdateStatus = async (
  id,
  newStatus
) => {
  try {
    setUpdatingId(id);
    setError("");

    const backendStatus =
      newStatus === "APPROVED"
        ? "CONFIRMED"
        : newStatus;

    const updatedTour =
      await tourService.updateTourStatus(
        id,
        backendStatus
      );

    setTours((prev) =>
      prev.map((tour) =>
        tour.id === id
          ? {
              ...tour,
              ...updatedTour,
              status:
                updatedTour?.status ||
                backendStatus,
            }
          : tour
      )
    );
  } catch (err) {
    console.error(
      "Failed to update tour status:",
      err
    );

    setError(
      err.message ||
        "Failed to update tour status."
    );
  } finally {
    setUpdatingId(null);
  }
};
  /*
   * ---------------------------------------------------------
   * STATUS HELPERS
   * ---------------------------------------------------------
   */
  const normalizeStatus = (status) => {
    const value =
      String(status || "").toUpperCase();

    const statusMap = {
      PENDING: "Pending",
      APPROVED: "Approved",
      CONFIRMED: "Approved",
      COMPLETED: "Completed",
      DECLINED: "Declined",
      REJECTED: "Declined",
      CANCELLED: "Declined",
      CANCELED: "Declined",
    };

    return (
      statusMap[value] ||
      String(status || "Pending")
    );
  };

  const getBackendStatus = (status) => {
    const statusMap = {
      Pending: "PENDING",
      Approved: "APPROVED",
      Completed: "COMPLETED",
      Declined: "DECLINED",
    };

    return (
      statusMap[status] ||
      String(status || "").toUpperCase()
    );
  };

  /*
   * ---------------------------------------------------------
   * DATE / TIME FORMATTERS
   * ---------------------------------------------------------
   */
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate =
        new Date(`${date}T00:00:00`);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    /*
     * Backend LocalTime normally returns:
     * 11:00:00
     */
    const parts = String(time).split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return time;
    }

    const period =
      hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${String(
      displayHour
    ).padStart(2, "0")}:${minutes} ${period}`;
  };

  /*
   * ---------------------------------------------------------
   * STATUS STYLES
   * ---------------------------------------------------------
   */
  const statusStyles = {
    Pending:
      "bg-orange-50 text-orange-600 border-orange-200",

    Approved:
      "bg-green-50 text-green-600 border-green-200",

    Completed:
      "bg-blue-50 text-blue-600 border-blue-200",

    Declined:
      "bg-red-50 text-red-600 border-red-200",
  };

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */
  const filteredTours =
    activeFilter === "All"
      ? tours
      : tours.filter(
          (tour) =>
            normalizeStatus(
              tour.status
            ) === activeFilter
        );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">

      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Tour Requests
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Manage viewing appointments requested by prospects.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/60 self-start">

          {[
            "All",
            "Pending",
            "Approved",
            "Completed",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveFilter(tab)
              }
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Loading tour requests...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {filteredTours.map((tour) => {
            const displayStatus =
              normalizeStatus(
                tour.status
              );

            const isUpdating =
              updatingId === tour.id;

            return (
              <div
                key={tour.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >

                <div>

                  <div className="flex justify-between items-start">

                    <div className="min-w-0">

                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {tour.buyerName ||
                          "Buyer"}
                      </h4>

                      <p className="text-xs text-rose-500 font-semibold mt-0.5 truncate">
                        {tour.propertyTitle ||
                          "Property"}
                      </p>

                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border shrink-0 ${
                        statusStyles[
                          displayStatus
                        ] ||
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {displayStatus}
                    </span>

                  </div>

                  {/* Time slot elements */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600 font-medium shadow-2xs">

                    <div>
                      📅{" "}
                      {formatDate(
                        tour.tourDate
                      )}
                    </div>

                    <div>
                      ⏰{" "}
                      {formatTime(
                        tour.tourTime
                      )}
                    </div>

                    <div className="col-span-2 pt-1.5 border-t border-gray-50 mt-1.5 text-gray-400">
                      Type:{" "}
                      <span className="text-gray-700 font-semibold">
                        In-Person Visit
                      </span>
                    </div>

                  </div>

                  {tour.notes && (
                    <p className="text-xs text-gray-400 mt-3 line-clamp-2">
                      Notes: {tour.notes}
                    </p>
                  )}

                </div>

                {/* Quick action execution */}
                {displayStatus ===
                  "Pending" && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/60">

                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        handleUpdateStatus(
                          tour.id,
                          getBackendStatus(
                            "Declined"
                          )
                        )
                      }
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Decline"}
                    </button>

                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        handleUpdateStatus(
                          tour.id,
                          getBackendStatus(
                            "Approved"
                          )
                        )
                      }
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Approve Slot"}
                    </button>

                  </div>
                )}

              </div>
            );
          })}

          {filteredTours.length ===
            0 && (
            <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
              No active tour viewings listed under this operational filter tab.
            </div>
          )}

        </div>
      )}

    </div>
  );
}