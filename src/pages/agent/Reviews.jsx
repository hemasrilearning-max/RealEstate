
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

export default function Reviews() {
  const { agent } = useAuth();

  // Logged-in broker ID
  const brokerId = agent?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD REVIEWS
  // ============================================================
  const loadReviews = async (showRefreshLoader = false) => {
    if (!brokerId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await brokerService.brokerReviews(
        brokerId
      );

      console.log("Broker Reviews API Response:", response);

      let reviewList = [];

      /*
       * Supports:
       *
       * 1. [ ... ]
       * 2. { content: [ ... ] }
       * 3. { data: [ ... ] }
       */

      if (Array.isArray(response)) {
        reviewList = response;
      } else if (Array.isArray(response?.content)) {
        reviewList = response.content;
      } else if (Array.isArray(response?.data)) {
        reviewList = response.data;
      }

      setReviews(reviewList);
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load reviews."
      );

      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    loadReviews();
  }, [brokerId]);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getClientName = (review) => {
    return (
      review?.clientName ||
      review?.buyerName ||
      review?.userName ||
      review?.client?.name ||
      review?.buyer?.name ||
      review?.user?.name ||
      "Client"
    );
  };

  const getPropertyTitle = (review) => {
    return (
      review?.propertyTitle ||
      review?.propertyName ||
      review?.property?.title ||
      review?.property?.name ||
      "Property"
    );
  };

  const getComment = (review) => {
    return (
      review?.comment ||
      review?.review ||
      review?.message ||
      "No comment provided."
    );
  };

  const getRating = (review) => {
    const rating = Number(review?.rating);

    if (Number.isNaN(rating)) {
      return 0;
    }

    return Math.max(0, Math.min(5, rating));
  };

  const getReviewDate = (review) => {
    const dateValue =
      review?.createdAt ||
      review?.createdDate ||
      review?.date ||
      review?.updatedAt;

    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString();
  };

  const getStatus = (review) => {
    return String(review?.status || "PENDING").toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ============================================================
  // SORT REVIEWS
  // ============================================================

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const dateA = new Date(
        a?.createdAt ||
          a?.createdDate ||
          a?.date ||
          a?.updatedAt ||
          0
      ).getTime();

      const dateB = new Date(
        b?.createdAt ||
          b?.createdDate ||
          b?.date ||
          b?.updatedAt ||
          0
      ).getTime();

      return dateB - dateA;
    });
  }, [reviews]);

  // ============================================================
  // AVERAGE RATING
  // ============================================================

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "—";
    }

    const validRatings = reviews
      .map((review) => getRating(review))
      .filter((rating) => rating > 0);

    if (validRatings.length === 0) {
      return "—";
    }

    const total = validRatings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return (total / validRatings.length).toFixed(1);
  }, [reviews]);

  // ============================================================
  // UPDATE REVIEW STATUS
  // ============================================================
  const updateReviewStatus = async (
    reviewId,
    newStatus
  ) => {
    if (!brokerId || !reviewId) {
      return;
    }

    try {
      setError("");
      setUpdatingStatus(reviewId);

      /*
       * IMPORTANT:
       *
       * This is the correct API call.
       *
       * Do NOT use:
       *
       * updateBrokerReviewStatus(...)
       *
       * Use:
       *
       * brokerService.updateBrokerReviewStatus(...)
       */

      await brokerService.updateBrokerReviewStatus(
        brokerId,
        reviewId,
        newStatus
      );

      // Update UI immediately
      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status: newStatus,
              }
            : review
        )
      );

      // Get latest data from backend
      await loadReviews();
    } catch (err) {
      console.error(
        "Failed to update review status:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update review status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  const deleteReview = async (reviewId) => {
    if (!brokerId || !reviewId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingReview(reviewId);

      await brokerService.deleteBrokerReview(
        brokerId,
        reviewId
      );

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) => review.id !== reviewId
        )
      );
    } catch (err) {
      console.error("Failed to delete review:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete review."
      );
    } finally {
      setDeletingReview(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Reviews
            </h2>

            <p className="text-sm text-gray-500">
              Loading reviews...
            </p>
          </div>

          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />

          <p className="text-sm text-gray-500 mt-3">
            Loading your reviews...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // BROKER NOT FOUND
  // ============================================================

  if (!brokerId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Reviews
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Unable to identify the logged-in broker.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

          <div>
            <p className="font-medium text-red-800">
              Broker information is missing
            </p>

            <p className="text-sm text-red-700 mt-1">
              Please log in again and try accessing the Reviews
              page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Reviews
          </h2>

          <p className="text-sm text-gray-500">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Average Rating */}

          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />

            <span className="font-semibold">
              {averageRating}
            </span>

            <span className="text-sm">
              avg rating
            </span>
          </div>

          {/* Refresh */}

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================
          REVIEW LIST
      ====================================================== */}

      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Star className="w-8 h-8 mx-auto text-gray-300" />

            <p className="text-gray-500 mt-3">
              No reviews yet.
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Customer reviews for this broker will appear here.
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => {
            const clientName = getClientName(review);
            const propertyTitle =
              getPropertyTitle(review);
            const rating = getRating(review);
            const comment = getComment(review);
            const status = getStatus(review);

            return (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                {/* =================================================
                    CLIENT + RATING
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Client */}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-sm text-gray-700">
                      {clientName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {clientName}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {propertyTitle}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${
                            index < rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {rating}/5
                    </span>
                  </div>
                </div>

                {/* =================================================
                    COMMENT
                ================================================== */}

                <p className="text-sm text-gray-600 mt-4 leading-6">
                  {comment}
                </p>

                {/* =================================================
                    DATE + ACTIONS
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                  {/* Date */}

                  <p className="text-xs text-gray-400">
                    {getReviewDate(review)}
                  </p>

                  {/* Actions */}

                  <div className="flex items-center gap-2">
                    {/* STATUS */}

                    <select
                      value={status}
                      onChange={(e) =>
                        updateReviewStatus(
                          review.id,
                          e.target.value
                        )
                      }
                      disabled={
                        updatingStatus === review.id
                      }
                      className={`text-xs font-medium border rounded-lg px-3 py-2 outline-none cursor-pointer ${getStatusClass(
                        status
                      )} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
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

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteReview(review.id)
                      }
                      disabled={
                        deletingReview === review.id
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />

                      {deletingReview === review.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

