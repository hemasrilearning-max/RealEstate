
import { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const statusLabel = (status) => {
  if (!status) return "Pending";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
};

const getStatusClass = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function Tours() {
  const { agent } = useAuth();
  const { properties } = useData();

  const [tours, setTours] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingTour, setDeletingTour] = useState(null);

  const [error, setError] = useState("");

  /*
   * ==========================================================
   * BROKER ID
   * ==========================================================
   *
   * Your existing code uses:
   *
   * agent.id
   *
   * Therefore we continue using agent.id.
   */
  const brokerId = agent?.id;

  /*
   * ==========================================================
   * LOAD TOURS
   * ==========================================================
   *
   * GET
   * /api/broker/tours/{brokerId}
   *
   * This goes through axiosInstance via brokerService.
   * Therefore your JWT authentication/interceptors remain active.
   */
  const loadTours = async () => {
    if (!brokerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await brokerService.brokerTours(
        brokerId
      );

      console.log("Broker tours API response:", data);

      /*
       * Normally the backend should return:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * But we support common wrapper formats too.
       */
      if (Array.isArray(data)) {
        setTours(data);
      } else if (Array.isArray(data?.content)) {
        setTours(data.content);
      } else if (Array.isArray(data?.data)) {
        setTours(data.data);
      } else {
        setTours([]);
      }
    } catch (err) {
      console.error(
        "Error loading broker tours:",
        err
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load tour requests."
      );

      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */
  useEffect(() => {
    if (brokerId) {
      loadTours();
    }
  }, [brokerId]);

  /*
   * ==========================================================
   * UPDATE TOUR STATUS
   * ==========================================================
   *
   * PATCH
   * /api/broker/tours/{brokerId}/{tourId}/status
   *
   * Body:
   *
   * {
   *   "status": "CONFIRMED"
   * }
   */
  const updateTourStatus = async (
    tourId,
    newStatus
  ) => {
    if (!brokerId || !tourId) return;

    try {
      setUpdatingStatus(tourId);
      setError("");

      await brokerService.updateBrokerTourStatus(
        brokerId,
        tourId,
        newStatus.toUpperCase()
      );

      /*
       * Reload from backend so the UI always represents
       * the actual database state.
       */
      await loadTours();
    } catch (err) {
      console.error(
        "Error updating tour status:",
        err
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update tour status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  /*
   * ==========================================================
   * DELETE TOUR
   * ==========================================================
   *
   * DELETE
   * /api/broker/tours/{brokerId}/{tourId}
   */
  const deleteTour = async (tourId) => {
    if (!brokerId || !tourId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tour request?"
    );

    if (!confirmed) return;

    try {
      setDeletingTour(tourId);
      setError("");

      await brokerService.deleteBrokerTour(
        brokerId,
        tourId
      );

      /*
       * Remove immediately from UI.
       */
      setTours((previousTours) =>
        previousTours.filter(
          (tour) => tour.id !== tourId
        )
      );
    } catch (err) {
      console.error(
        "Error deleting tour:",
        err
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to delete tour."
      );
    } finally {
      setDeletingTour(null);
    }
  };

  /*
   * ==========================================================
   * PROPERTY
   * ==========================================================
   *
   * Tours API may return:
   *
   * propertyId
   *
   * or:
   *
   * property: {
   *   id: ...
   * }
   */
  const getProperty = (tour) => {
    const propertyId =
      tour?.propertyId ||
      tour?.property?.id;

    return properties?.find(
      (property) =>
        Number(property.id) ===
        Number(propertyId)
    );
  };

  /*
   * ==========================================================
   * CLIENT NAME
   * ==========================================================
   */
  const getClientName = (tour) => {
    return (
      tour?.name ||
      tour?.clientName ||
      tour?.buyerName ||
      tour?.customerName ||
      tour?.userName ||
      "—"
    );
  };

  /*
   * ==========================================================
   * CLIENT PHONE
   * ==========================================================
   */
  const getClientPhone = (tour) => {
    return (
      tour?.phone ||
      tour?.clientPhone ||
      tour?.buyerPhone ||
      tour?.customerPhone ||
      "—"
    );
  };

  /*
   * ==========================================================
   * DATE
   * ==========================================================
   */
  const getPreferredDate = (tour) => {
    return (
      tour?.preferredDate ||
      tour?.tourDate ||
      tour?.requestedDate ||
      "—"
    );
  };

  /*
   * ==========================================================
   * TIME
   * ==========================================================
   */
  const getPreferredTime = (tour) => {
    return (
      tour?.preferredTime ||
      tour?.tourTime ||
      tour?.requestedTime ||
      "—"
    );
  };

  /*
   * ==========================================================
   * NOTES
   * ==========================================================
   */
  const getNotes = (tour) => {
    return (
      tour?.notes ||
      tour?.message ||
      tour?.description ||
      "—"
    );
  };

  /*
   * ==========================================================
   * SORT
   * ==========================================================
   */
  const sortedTours = [...tours].sort(
    (a, b) => {
      const dateA = new Date(
        a?.createdAt ||
          a?.createdDate ||
          0
      );

      const dateB = new Date(
        b?.createdAt ||
          b?.createdDate ||
          0
      );

      return dateB - dateA;
    }
  );

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Tour Requests
          </h2>

          <p className="text-sm text-gray-500">
            {tours.length}{" "}
            {tours.length === 1
              ? "request"
              : "requests"}
          </p>
        </div>

        <button
          type="button"
          onClick={loadTours}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}
      {error && (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4 font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================================
          TABLE
          ===================================================== */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="text-left text-gray-500 bg-gray-50">

              <tr>

                <th className="px-4 py-3 font-medium">
                  Client
                </th>

                <th className="px-4 py-3 font-medium">
                  Property
                </th>

                <th className="px-4 py-3 font-medium">
                  Preferred Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Time
                </th>

                <th className="px-4 py-3 font-medium">
                  Notes
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* =================================================
                  LOADING
                  ================================================= */}
              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >

                    <div className="flex items-center justify-center gap-2">

                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-purple-600 animate-spin"></div>

                      Loading tour requests...

                    </div>

                  </td>

                </tr>

              ) : sortedTours.length === 0 ? (

                /* =================================================
                   EMPTY
                   ================================================= */

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No tour requests yet.
                  </td>

                </tr>

              ) : (

                /* =================================================
                   DATA
                   ================================================= */

                sortedTours.map((tour) => {

                  const property =
                    getProperty(tour);

                  const tourId =
                    tour?.id;

                  const currentStatus =
                    (
                      tour?.status ||
                      "PENDING"
                    ).toUpperCase();

                  return (

                    <tr
                      key={tourId}
                      className="hover:bg-gray-50"
                    >

                      {/* CLIENT */}
                      <td className="px-4 py-3">

                        <p className="font-medium text-gray-900">
                          {getClientName(tour)}
                        </p>

                        <p className="text-xs text-gray-500">
                          {getClientPhone(tour)}
                        </p>

                      </td>

                      {/* PROPERTY */}
                      <td className="max-w-[220px] px-4 py-3">

                        <p className="truncate">

                          {property?.title ||
                            tour?.propertyTitle ||
                            tour?.propertyName ||
                            "—"}

                        </p>

                        {tour?.propertyId && (
                          <p className="text-xs text-gray-400">
                            Property #
                            {tour.propertyId}
                          </p>
                        )}

                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getPreferredDate(tour)}
                      </td>

                      {/* TIME */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getPreferredTime(tour)}
                      </td>

                      {/* NOTES */}
                      <td className="max-w-[180px] px-4 py-3">

                        <p className="truncate text-gray-600">
                          {getNotes(tour)}
                        </p>

                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">

                        <select
                          value={currentStatus}
                          disabled={
                            updatingStatus ===
                            tourId
                          }
                          onChange={(event) =>
                            updateTourStatus(
                              tourId,
                              event.target.value
                            )
                          }
                          className={`text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none ${getStatusClass(
                            currentStatus
                          )}`}
                        >

                          {STATUSES.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {statusLabel(
                                  status
                                )}
                              </option>
                            )
                          )}

                        </select>

                        {updatingStatus ===
                          tourId && (
                          <span className="ml-2 text-xs text-gray-400">
                            Updating...
                          </span>
                        )}

                      </td>

                      {/* DELETE */}
                      <td className="px-4 py-3">

                        <button
                          type="button"
                          onClick={() =>
                            deleteTour(
                              tourId
                            )
                          }
                          disabled={
                            deletingTour ===
                            tourId
                          }
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingTour ===
                          tourId
                            ? "Deleting..."
                            : "Delete"}
                        </button>

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

