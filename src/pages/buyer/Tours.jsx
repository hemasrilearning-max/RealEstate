import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import tourService from "../../services/tourService";
export default function BuyerTours() {
  const navigate = useNavigate();

  const { buyer, user } = useAuth();

  const profile = buyer || user;

  const buyerId =
    profile?.userId ||
    profile?.id;

  const [tours, setTours] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD BUYER TOURS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const loadTours = async () => {
      if (!buyerId) {
        setTours([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
  await tourService.getToursByBuyer(
    buyerId
  );

if (cancelled) {
  return;
}

setTours(
  Array.isArray(response)
    ? response
    : []
);
      } catch (err) {
        console.error(
          "Failed to load buyer tours:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load tour bookings."
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
  }, [buyerId]);

  /*
   * ---------------------------------------------------------
   * STATUS HELPERS
   * ---------------------------------------------------------
   */
  const normalizeStatus = (status) => {
    const value =
      String(status || "").toUpperCase();

    const statusMap = {
      PENDING: "Pending Approval",
      APPROVED: "Confirmed",
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      CANCELED: "Cancelled",
      DECLINED: "Declined",
      REJECTED: "Declined",
    };

    return (
      statusMap[value] ||
      String(status || "Pending Approval")
    );
  };

  /*
   * ---------------------------------------------------------
   * DATE FORMAT
   * ---------------------------------------------------------
   */
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate =
        new Date(`${date}T00:00:00`);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return date;
      }

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  /*
   * ---------------------------------------------------------
   * TIME FORMAT
   * ---------------------------------------------------------
   */
  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const parts =
      String(time).split(":");

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
   * CANCEL TOUR
   * ---------------------------------------------------------
   */
  const handleCancel = async (tourId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this tour?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(tourId);
      setError("");

      const updatedTour =
        await tourService.updateTourStatus(
          tourId,
          "CANCELLED"
        );

      setTours((prev) =>
        prev.map((tour) =>
          tour.id === tourId
            ? {
                ...tour,
                ...updatedTour,
                status:
                  updatedTour?.status ||
                  "CANCELLED",
              }
            : tour
        )
      );
    } catch (err) {
      console.error(
        "Failed to cancel tour:",
        err
      );

      setError(
        err.message ||
          "Failed to cancel tour."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * RESCHEDULE TOUR
   * ---------------------------------------------------------
   *
   * Uses the backend PUT /api/tours/{id}.
   * The user selects a new date and time.
   */
  const handleReschedule = async (tour) => {
    const newDate =
      window.prompt(
        "Enter the new tour date (YYYY-MM-DD):",
        tour.tourDate || ""
      );

    if (!newDate) {
      return;
    }

    const newTime =
      window.prompt(
        "Enter the new tour time (HH:MM):",
        tour.tourTime
          ? String(tour.tourTime).slice(
              0,
              5
            )
          : ""
      );

    if (!newTime) {
      return;
    }

    try {
      setUpdatingId(tour.id);
      setError("");

      const updatedTour =
        await tourService.updateTour(
          tour.id,
          {
            tourDate: newDate,
            tourTime: `${newTime}:00`,
            notes: tour.notes || "",
          }
        );

      setTours((prev) =>
        prev.map((item) =>
          item.id === tour.id
            ? {
                ...item,
                ...updatedTour,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to reschedule tour:",
        err
      );

      setError(
        err.message ||
          "Failed to reschedule tour."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * STATUS UI
   * ---------------------------------------------------------
   */
  const getStatusClasses = (status) => {
    const normalized =
      normalizeStatus(status);

    if (normalized === "Confirmed") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (
      normalized === "Cancelled" ||
      normalized === "Declined"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (normalized === "Completed") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = (status) => {
    const normalized =
      normalizeStatus(status);

    if (
      normalized === "Confirmed" ||
      normalized === "Completed"
    ) {
      return (
        <CheckCircle2 className="h-3.5 w-3.5" />
      );
    }

    return (
      <AlertCircle className="h-3.5 w-3.5" />
    );
  };

  const upcomingTours =
    tours.filter((tour) => {
      const status =
        normalizeStatus(tour.status);

      return (
        status !== "Cancelled" &&
        status !== "Declined" &&
        status !== "Completed"
      );
    });

  const confirmedTours =
    tours.filter(
      (tour) =>
        normalizeStatus(
          tour.status
        ) === "Confirmed"
    );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-5rem)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-emerald-600" />
                Tour Bookings
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Track your property visits and video walkthrough
                appointments.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/properties")
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4" />
              Browse Properties
            </button>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Total Bookings
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {tours.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Active Tours
            </p>

            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {upcomingTours.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Confirmed
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {confirmedTours.length}
            </p>
          </div>

        </div>

        {/* TOUR LIST */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

            <h2 className="text-base font-bold text-gray-900">
              Your Appointments
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              View the details of your scheduled property appointments.
            </p>

          </div>

          <div className="p-4 sm:p-6 space-y-4">

            {loading ? (
              <div className="py-16 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />

                <h3 className="font-semibold text-gray-900">
                  Loading tour bookings...
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we load your appointments.
                </p>
              </div>
            ) : tours.length === 0 ? (
              <div className="py-16 text-center">

                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />

                <h3 className="font-semibold text-gray-900">
                  No tour bookings
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Browse properties and schedule a viewing when you
                  find something you like.
                </p>

                <button
                  onClick={() =>
                    navigate("/properties")
                  }
                  className="mt-5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Browse Properties
                </button>

              </div>
            ) : (
              tours.map((tour) => {
                const status =
                  normalizeStatus(
                    tour.status
                  );

                const isUpdating =
                  updatingId === tour.id;

                return (
                  <div
                    key={tour.id}
                    className="border border-gray-100 bg-gray-50/40 p-4 sm:p-5 rounded-2xl hover:bg-white hover:shadow-sm transition-all"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* PROPERTY DETAILS */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start gap-3 flex-wrap">

                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex items-center gap-2 flex-wrap">

                              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                {tour.propertyTitle ||
                                  "Property"}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border ${getStatusClasses(
                                  tour.status
                                )}`}
                              >
                                {getStatusIcon(
                                  tour.status
                                )}

                                {status}
                              </span>

                            </div>

                            <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              Property location
                            </p>

                          </div>

                        </div>

                        {/* APPOINTMENT INFORMATION */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />

                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                                Date
                              </p>

                              <p className="text-xs text-gray-700 font-semibold">
                                {formatDate(
                                  tour.tourDate
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400 shrink-0" />

                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                                Time
                              </p>

                              <p className="text-xs text-gray-700 font-semibold">
                                {formatTime(
                                  tour.tourTime
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />

                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                                Tour Type
                              </p>

                              <p className="text-xs text-gray-700 font-semibold">
                                Property Visit
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 shrink-0" />

                            <div className="min-w-0">

                              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                                Buyer
                              </p>

                              <p className="text-xs text-gray-700 font-semibold truncate">
                                {tour.buyerName ||
                                  "You"}
                              </p>

                            </div>
                          </div>

                        </div>

                        {tour.notes && (
                          <div className="mt-4 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">
                              Notes:
                            </span>{" "}
                            {tour.notes}
                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[150px]">

                        {status !== "Cancelled" &&
                          status !== "Declined" &&
                          status !== "Completed" && (
                            <>
                              <button
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  handleReschedule(
                                    tour
                                  )
                                }
                                className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Reschedule"}
                              </button>

                              <button
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  handleCancel(
                                    tour.id
                                  )
                                }
                                className="px-3 py-2 text-xs font-semibold border border-red-200 rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Cancel Tour"}
                              </button>
                            </>
                          )}

                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* INFORMATION NOTE */}
        <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">

          <div className="flex gap-3">

            <Calendar className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />

            <div>

              <p className="text-xs font-semibold text-emerald-800">
                Tour booking information
              </p>

              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Your tour details will be updated when the property
                owner or agent confirms the appointment. Video
                walkthrough links will become available when online
                tour support is added to the backend.
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}