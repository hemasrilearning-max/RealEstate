import { useEffect, useRef, useState } from "react";
import {
  Search,
  Star,
  CheckCircle,
  XCircle,
  EyeOff,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/reviews";

export default function Reviews() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const messageRef = useRef(null);

  // =========================================================
  // SCROLL TO MESSAGE
  // =========================================================

  useEffect(() => {
    if (message || error) {
      setTimeout(() => {
        messageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [message, error]);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch reviews: ${response.status}`
        );
      }

      const data = await response.json();

      const reviewList = Array.isArray(data)
        ? data
        : data.reviews ||
          data.content ||
          data.data ||
          [];

      setReviews(reviewList);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  useEffect(() => {
    fetchReviews();
  }, []);

  // =========================================================
  // UPDATE REVIEW STATUS
  // =========================================================

  const updateStatus = async (id, status) => {
    try {
      setError("");
      setMessage("");

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Backend statuses:
      // APPROVED
      // PENDING
      // REJECTED

      const backendStatus =
        status === "HIDDEN"
          ? "REJECTED"
          : status;

      const response = await fetch(
        `${API_URL}/${id}/status?status=${encodeURIComponent(
          backendStatus
        )}`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (!response.ok) {
        let errorMessage =
          `Failed to update review: ${response.status}`;

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Keep default message
        }

        throw new Error(errorMessage);
      }

      // Update UI immediately
      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === id
            ? {
                ...review,
                status: backendStatus,
              }
            : review
        )
      );

      // Success messages
      if (status === "APPROVED") {
        setMessage(
          "Review approved successfully."
        );
      } else if (status === "REJECTED") {
        setMessage(
          "Review rejected successfully."
        );
      } else if (status === "HIDDEN") {
        setMessage(
          "Review hidden successfully."
        );
      } else {
        setMessage(
          "Review status updated successfully."
        );
      }

      // Refresh from backend
      await fetchReviews();
    } catch (err) {
      console.error("Error updating review:", err);

      setError(
        err.message ||
          "Failed to update review status."
      );
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const deleteReview = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        let errorMessage =
          `Failed to delete review: ${response.status}`;

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Keep default message
        }

        throw new Error(errorMessage);
      }

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) => review.id !== id
        )
      );

      setMessage(
        "Review deleted successfully."
      );

      await fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);

      setError(
        err.message ||
          "Failed to delete review."
      );
    }
  };

  // =========================================================
  // DISPLAY STATUS
  // =========================================================

  const getDisplayStatus = (status) => {
    if (status === "REJECTED") {
      return "REJECTED";
    }

    return status;
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredReviews = reviews.filter(
    (review) => {
      const value = search.toLowerCase();

      const userName =
        review.userName ||
        review.user_name ||
        "";

      const propertyTitle =
        review.propertyTitle ||
        review.property_title ||
        "";

      const comment =
        review.comment ||
        "";

      const displayStatus =
        getDisplayStatus(review.status);

      const matchesSearch =
        userName
          .toLowerCase()
          .includes(value) ||
        propertyTitle
          .toLowerCase()
          .includes(value) ||
        comment
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        filterStatus === "All" ||
        displayStatus === filterStatus;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalReviews = reviews.length;

  const approvedReviews =
    reviews.filter(
      (review) =>
        review.status === "APPROVED"
    ).length;

  const pendingReviews =
    reviews.filter(
      (review) =>
        review.status === "PENDING"
    ).length;

  const rejectedReviews =
    reviews.filter(
      (review) =>
        review.status === "REJECTED"
    ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            Loading reviews...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor customer reviews
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg">

          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />

          <span className="font-semibold">
            {averageRating}
          </span>

          <span className="text-sm">
            avg rating
          </span>

        </div>

      </div>

      {/* SUCCESS / ERROR MESSAGE */}
      <div ref={messageRef}>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6">
            <p className="font-semibold">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            <p className="font-semibold">
              {error}
            </p>
          </div>
        )}

      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Total Reviews
          </p>

          <p className="text-2xl font-bold mt-1">
            {totalReviews}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Approved
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {approvedReviews}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {pendingReviews}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Rejected
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {rejectedReviews}
          </p>

        </div>

      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white border rounded-xl p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search reviewer, property or review..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >

            <option value="All">
              All Reviews
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>

          </select>

        </div>

      </div>

      {/* REVIEWS */}
      <div className="space-y-4">

        {filteredReviews.length === 0 ? (

          <div className="bg-white border rounded-xl p-10 text-center">

            <p className="text-gray-500">
              No reviews found.
            </p>

          </div>

        ) : (

          filteredReviews.map(
            (review) => {

              const displayStatus =
                getDisplayStatus(
                  review.status
                );

              const userName =
                review.userName ||
                review.user_name ||
                "Unknown User";

              const propertyTitle =
                review.propertyTitle ||
                review.property_title ||
                "Unknown Property";

              return (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >

                  {/* TOP */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">

                        {userName
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          {userName}
                        </p>

                        <p className="text-xs text-gray-500">
                          {propertyTitle}
                        </p>

                      </div>

                    </div>

                    {/* RATING */}
                    <div className="flex items-center gap-0.5">

                      {Array.from({
                        length: 5,
                      }).map(
                        (_, i) => (

                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i <
                              Number(
                                review.rating ||
                                  0
                              )
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />

                        )
                      )}

                    </div>

                  </div>

                  {/* COMMENT */}
                  <p className="text-sm text-gray-600 mt-4">
                    {review.comment}
                  </p>

                  {/* BOTTOM */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 pt-4 border-t">

                    <div className="flex items-center gap-3">

                      {/* APPROVED */}
                      {displayStatus ===
                        "APPROVED" && (

                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">

                          <CheckCircle className="w-4 h-4" />

                          Approved

                        </span>

                      )}

                      {/* PENDING */}
                      {displayStatus ===
                        "PENDING" && (

                        <span className="text-xs font-medium text-yellow-600">

                          ● Pending

                        </span>

                      )}

                      {/* REJECTED */}
                      {displayStatus ===
                        "REJECTED" && (

                        <span className="flex items-center gap-1 text-xs font-medium text-red-600">

                          <XCircle className="w-4 h-4" />

                          Rejected

                        </span>

                      )}

                      {/* DATE */}
                      {review.createdAt && (

                        <span className="text-xs text-gray-400">

                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}

                        </span>

                      )}

                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">

                      {/* APPROVE */}
                      {displayStatus !==
                        "APPROVED" && (

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              review.id,
                              "APPROVED"
                            )
                          }
                          className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                        >

                          <CheckCircle className="w-4 h-4" />

                          Approve

                        </button>

                      )}

                      {/* REJECT */}
                      {displayStatus !==
                        "REJECTED" && (

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              review.id,
                              "REJECTED"
                            )
                          }
                          className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >

                          <XCircle className="w-4 h-4" />

                          Reject

                        </button>

                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

    </div>
  );
}