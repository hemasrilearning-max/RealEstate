import React, { useEffect, useState } from "react";
import {
  Star,
  Calendar,
  Building2,
  Trash2,
  ArrowLeft,
  Home,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import reviewService from "../../services/reviewService";

export default function BuyerReviews() {
  const navigate = useNavigate();

  const { buyer, user } = useAuth();

  const profile = buyer || user;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const userId =
    profile?.userId ||
    profile?.id;

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      if (!userId) {
        setReviews([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await reviewService.getMyReviews();

        if (cancelled) {
          return;
        }

        setReviews(
          Array.isArray(response)
            ? response
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load buyer reviews:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load your reviews."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
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

  const handleRemoveReview = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await reviewService.deleteReview(id);

      setReviews((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove review:",
        err
      );

      setError(
        err.message ||
          "Failed to remove review."
      );
    } finally {
      setDeletingId(null);
    }
  };

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

  const fiveStarReviews =
    reviews.filter(
      (review) =>
        Number(review.rating) === 5
    ).length;

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
                <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                My Reviews
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage the feedback and ratings you have shared about
                properties and agents.
              </p>
            </div>

            <button
              onClick={() => navigate("/properties")}
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

        {/* REVIEW SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Reviews Written
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {reviews.length}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Average Rating
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating}
                  </p>

                  <div className="flex gap-0.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>

              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Five-Star Reviews
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {fiveStarReviews}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Your Feedback
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Reviews you have shared after viewing properties and
              working with agents.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {loading ? (
              <div className="text-center py-16">
                <Star className="h-8 w-8 text-gray-300 mx-auto mb-4" />

                <h3 className="font-semibold text-gray-900">
                  Loading your reviews...
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we load your feedback.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-2xl p-4 sm:p-5 bg-gray-50/30 hover:bg-white hover:shadow-sm transition-all"
                >
                  {/* REVIEW HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />

                        <span>
                          {review.propertyTitle ||
                            "Property Review"}
                        </span>
                      </h3>

                      <p className="text-xs text-gray-500 mt-2">
                        Agent:{" "}
                        <span className="font-semibold text-gray-700">
                          {review.agentName ||
                            review.agent?.name ||
                            "Not available"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end shrink-0">
                      <div
                        className="flex gap-0.5"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from(
                          { length: 5 },
                          (_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index <
                                Number(
                                  review.rating || 0
                                )
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          )
                        )}
                      </div>

                      <span className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />

                        {formatDate(
                          review.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* REVIEW CONTENT */}
                  <div className="mt-5 bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      “{review.comment || "No comment provided."}”
                    </p>
                  </div>

                  {/* REVIEW ACTIONS */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      disabled={
                        deletingId === review.id
                      }
                      onClick={() =>
                        handleRemoveReview(
                          review.id
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3.5 w-3.5" />

                      {deletingId === review.id
                        ? "Removing..."
                        : "Remove Review"}
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* EMPTY STATE */}
            {!loading &&
              reviews.length === 0 && (
                <div className="text-center py-16">
                  <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-amber-400" />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    No reviews yet
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    After viewing properties or working with agents,
                    you can share your experience here.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/properties")
                    }
                    className="mt-5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Explore Properties
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* INFORMATION NOTE */}
        <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex gap-3">
            <MessageSquare className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />

            <div>
              <p className="text-xs font-semibold text-emerald-800">
                Share your experience
              </p>

              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Your reviews can help other HomeSpace users understand
                their experience with a property and its agent. Review
                creation and backend persistence can be connected when
                the Review API is implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}