import React, { useState } from 'react';

export default function OwnerReviews() {
  // Mock data representing client reviews across properties
  const [reviews] = useState([
    {
      id: 1,
      reviewer: "Arvind G.",
      role: "Current Tenant",
      property: "3BHK Villa - Whitefield",
      rating: 5,
      date: "Sep 12, 2026",
      comment: "The property is extremely well-maintained. The owner was super helpful during the onboarding process and resolved a minor plumbing issue within 24 hours. Highly recommended space!",
    },
    {
      id: 2,
      reviewer: "Priya Sharma",
      role: "Prospective Viewer",
      property: "2BHK Apartment - HSR Layout",
      rating: 4,
      date: "Sep 08, 2026",
      comment: "Took a physical tour of the flat last weekend. The space is exactly as shown in the walkthrough videos. The neighborhood is peaceful, just looking over parking options before closing.",
    },
    {
      id: 3,
      reviewer: "Rahul Verma",
      role: "Past Tenant",
      property: "Studio - Indiranagar",
      rating: 5,
      date: "Aug 29, 2026",
      comment: "Stayed here for close to two years. Hassle-free experience, prompt security deposit return, and perfect documentation support throughout the lease lifecycle.",
    }
  ]);

  // Helper utility to draw rating star maps
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Header Profile Title */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monitor operational tenant feedback and listing ratings.</p>
        </div>

        {/* Aggregate Score Indicator Badge */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl self-start">
          <div className="text-2xl font-black text-gray-900 leading-none">4.8</div>
          <div>
            <div className="flex text-amber-400 leading-none">★★★★★</div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
              Portfolio Score
            </span>
          </div>
        </div>
      </div>

      {/* Grid Stack List of Reviews */}
      <div className="space-y-4 mt-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="border border-gray-100/80 bg-gray-50/20 p-5 rounded-xl transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-gray-900">{rev.reviewer}</span>
                  <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-500 font-medium">
                    {rev.role}
                  </span>
                </div>
                <p className="text-xs text-rose-500 font-semibold mt-1">{rev.property}</p>
              </div>
              
              <div className="flex flex-col sm:items-end">
                <div className="flex gap-0.5">{renderStars(rev.rating)}</div>
                <span className="text-[10px] text-gray-400 font-medium mt-1">{rev.date}</span>
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-100/60">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
