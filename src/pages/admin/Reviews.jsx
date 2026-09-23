import { useState } from "react";
import {
  Search,
  Star,
  CheckCircle,
  EyeOff,
  Trash2,
} from "lucide-react";

export default function Reviews() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [reviews, setReviews] = useState([
    {
      id: 1,
      clientName: "Rahul Sharma",
      propertyTitle: "Luxury 3BHK Apartment",
      rating: 5,
      comment:
        "Excellent property and very helpful agent. The entire process was smooth.",
      createdAt: "2026-09-15",
      status: "Approved",
    },
    {
      id: 2,
      clientName: "Priya Kumar",
      propertyTitle: "Modern 2BHK Flat",
      rating: 4,
      comment:
        "Good property with a great location. Overall experience was good.",
      createdAt: "2026-09-14",
      status: "Pending",
    },
    {
      id: 3,
      clientName: "Arjun Mehta",
      propertyTitle: "Premium Villa",
      rating: 5,
      comment:
        "Beautiful villa and excellent service from the agent.",
      createdAt: "2026-09-12",
      status: "Approved",
    },
    {
      id: 4,
      clientName: "Sneha Rao",
      propertyTitle: "Affordable 1BHK Apartment",
      rating: 3,
      comment:
        "The property was okay, but there were some issues during the visit.",
      createdAt: "2026-09-10",
      status: "Pending",
    },
    {
      id: 5,
      clientName: "Kiran Kumar",
      propertyTitle: "Family 3BHK Home",
      rating: 2,
      comment:
        "The property did not match the description provided online.",
      createdAt: "2026-09-08",
      status: "Hidden",
    },
  ]);

  // Update review status
  const updateStatus = (id, status) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === id
          ? { ...review, status }
          : review
      )
    );
  };

  // Delete review
  const deleteReview = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    setReviews((current) =>
      current.filter((review) => review.id !== id)
    );
  };

  // Search + filter
  const filteredReviews = reviews.filter((review) => {
    const value = search.toLowerCase();

    const matchesSearch =
      review.clientName.toLowerCase().includes(value) ||
      review.propertyTitle.toLowerCase().includes(value) ||
      review.comment.toLowerCase().includes(value);

    const matchesStatus =
      filterStatus === "All" ||
      review.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;

  const hiddenReviews = reviews.filter(
    (review) => review.status === "Hidden"
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor customer reviews
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50
          text-amber-800 px-4 py-2 rounded-lg">

          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />

          <span className="font-semibold">
            {averageRating}
          </span>

          <span className="text-sm">
            avg rating
          </span>

        </div>

      </div>

      {/* Statistics */}
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
            Hidden
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {hiddenReviews}
          </p>
        </div>

      </div>

      {/* Search + Filter */}
      <div className="bg-white border rounded-xl p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2
              -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search reviewer, property or review..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300
              rounded-lg pl-10 pr-4 py-3
              focus:outline-none focus:ring-2
              focus:ring-purple-500"
            />

          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg
            px-4 py-3 focus:outline-none
            focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Reviews</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Hidden">Hidden</option>
          </select>

        </div>

      </div>

      {/* Reviews */}
      <div className="space-y-4">

        {filteredReviews.length === 0 ? (

          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No reviews found.
            </p>
          </div>

        ) : (

          filteredReviews.map((review) => (

            <div
              key={review.id}
              className="bg-white border border-gray-200
              rounded-xl p-5"
            >

              {/* Top */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-purple-100
                    rounded-full flex items-center
                    justify-center font-semibold
                    text-purple-600">

                    {review.clientName.charAt(0)}

                  </div>

                  <div>

                    <p className="font-semibold text-gray-900">
                      {review.clientName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {review.propertyTitle}
                    </p>

                  </div>

                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5">

                  {Array.from({ length: 5 }).map((_, i) => (

                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />

                  ))}

                </div>

              </div>

              {/* Comment */}
              <p className="text-sm text-gray-600 mt-4">
                {review.comment}
              </p>

              {/* Bottom */}
              <div className="flex flex-col md:flex-row
                md:items-center md:justify-between
                gap-3 mt-4 pt-4 border-t">

                <div className="flex items-center gap-3">

                  {/* Status */}
                  {review.status === "Approved" && (
                    <span className="flex items-center gap-1
                      text-xs font-medium text-green-600">

                      <CheckCircle className="w-4 h-4" />
                      Approved

                    </span>
                  )}

                  {review.status === "Pending" && (
                    <span className="text-xs font-medium
                      text-yellow-600">

                      ● Pending

                    </span>
                  )}

                  {review.status === "Hidden" && (
                    <span className="flex items-center gap-1
                      text-xs font-medium text-red-600">

                      <EyeOff className="w-4 h-4" />
                      Hidden

                    </span>
                  )}

                  <span className="text-xs text-gray-400">
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">

                  {review.status !== "Approved" && (
                    <button
                      onClick={() =>
                        updateStatus(review.id, "Approved")
                      }
                      className="flex items-center gap-1
                      text-xs px-3 py-2 rounded-lg
                      bg-green-50 text-green-700
                      hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}

                  {review.status !== "Hidden" && (
                    <button
                      onClick={() =>
                        updateStatus(review.id, "Hidden")
                      }
                      className="flex items-center gap-1
                      text-xs px-3 py-2 rounded-lg
                      bg-gray-100 text-gray-700
                      hover:bg-gray-200"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </button>
                  )}

                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-1
                    text-xs px-3 py-2 rounded-lg
                    bg-red-50 text-red-600
                    hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}