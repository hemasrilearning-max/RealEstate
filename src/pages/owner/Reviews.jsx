import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import propertyService from "../../services/propertyService";
import reviewService from "../../services/reviewService";

export default function OwnerReviews() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    loadReviews();
  }, [user?.userId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Step 1:
       * Get all properties belonging to the logged-in owner.
       */
      const ownerPropertiesResponse =
        await propertyService.getPropertiesBySeller(
          user.userId
        );

      const ownerProperties = Array.isArray(
        ownerPropertiesResponse
      )
        ? ownerPropertiesResponse
        : ownerPropertiesResponse?.content ||
          ownerPropertiesResponse?.data ||
          ownerPropertiesResponse?.properties ||
          [];

      /*
       * Step 2:
       * Get reviews for each owner property.
       */
      const reviewResults = await Promise.all(
        ownerProperties
          .filter((property) => property?.id)
          .map(async (property) => {
            try {
              const response =
                await reviewService.getReviewsByProperty(
                  property.id
                );

              const propertyReviews = Array.isArray(response)
                ? response
                : response?.content ||
                  response?.data ||
                  response?.reviews ||
                  [];

              return propertyReviews.map((review) => ({
                ...review,
                propertyId:
                  review.propertyId || property.id,
                propertyTitle:
                  review.propertyTitle ||
                  property.title ||
                  "Property",
              }));
            } catch (reviewError) {
              console.error(
                `Unable to load reviews for property ${property.id}:`,
                reviewError
              );

              return [];
            }
          })
      );

      /*
       * Step 3:
       * Flatten all property review arrays into one list.
       */
      const allReviews = reviewResults
        .flat()
        .sort((a, b) => {
          const dateA = new Date(
            a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

      setReviews(allReviews);
    } catch (err) {
      console.error(
        "Unable to load owner reviews:",
        err
      );

      setError(
        err.message ||
          "Unable to load reviews. Please try again."
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper utility to draw rating star maps
  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < numericRating
            ? "text-amber-400"
            : "text-gray-200"
        }`}
      >
        ★
      </span>
    ));
  };

  // Format backend date into the existing UI format
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Calculate real portfolio score
  const portfolioScore =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + (Number(review.rating) || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Header Profile Title */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Reviews & Ratings
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Monitor operational tenant feedback and listing
            ratings.
          </p>
        </div>

        {/* Aggregate Score Indicator Badge */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl self-start">
          <div className="text-2xl font-black text-gray-900 leading-none">
            {portfolioScore}
          </div>

          <div>
            <div className="flex text-amber-400 leading-none">
              ★★★★★
            </div>

            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
              Portfolio Score
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            Loading reviews...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-6 border border-red-100 bg-red-50 rounded-xl p-5">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadReviews}
            className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        reviews.length === 0 && (
          <div className="mt-6 border border-gray-100 bg-gray-50/30 rounded-xl p-10 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No reviews yet
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Reviews for your properties will appear here.
            </p>
          </div>
        )}

      {/* Grid Stack List of Reviews */}
      {!loading &&
        !error &&
        reviews.length > 0 && (
          <div className="space-y-4 mt-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="border border-gray-100/80 bg-gray-50/20 p-5 rounded-xl transition-all hover:bg-white hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-gray-900">
                        {rev.userName ||
                          "Anonymous User"}
                      </span>

                      <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-500 font-medium">
                        {rev.status || "PENDING"}
                      </span>
                    </div>

                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {rev.propertyTitle ||
                        "Property"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <div className="flex gap-0.5">
                      {renderStars(rev.rating)}
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium mt-1">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-100/60">
                  "{rev.comment || "No comment provided."}"
                </p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}