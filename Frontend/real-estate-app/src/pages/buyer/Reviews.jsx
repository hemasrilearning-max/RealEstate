import React, { useState } from 'react';
import { Star, MessageSquare, Calendar, Building2, Trash2 } from 'lucide-react';

export default function BuyerReviews() {
  // Mock data representing reviews posted by this buyer account
  const [reviews, setSetReviews] = useState([
    {
      id: 1,
      property: "Modern 3 BHK Apartment - Whitefield",
      agent: "Arvind G. (Senior Broker)",
      rating: 5,
      date: "Sep 14, 2026",
      comment: "Excellent experience viewing this flat. The video walkthrough matched the property dimensions perfectly. The agent was punctual, highly knowledgeable, and answered all queries regarding security deposits immediately.",
    },
    {
      id: 2,
      property: "Luxury 4 BHK Villa - Sarjapur Road",
      agent: "Sanjay Malhotra",
      rating: 4,
      date: "Aug 30, 2026",
      comment: "Beautiful villa structure and clean neighborhood environment. The tour was smooth, though scheduling took a little longer than expected due to current occupier timelines.",
    }
  ]);

  const handleRemoveReview = (id) => {
    setSetReviews(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> My Reviews & Feedback
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">View and manage ratings left for toured properties and assigned brokers.</p>
        </div>
        <span className="text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1 rounded-xl self-start sm:self-center">
          {reviews.length} Reviews Written
        </span>
      </div>

      {/* Stack List Feed of Review Cards */}
      <div className="space-y-4 mt-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="border border-gray-100/80 bg-gray-50/20 p-5 rounded-xl transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-600 shrink-0" /> {rev.property}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-1">Assigned Agent: <span className="text-gray-700 font-semibold">{rev.agent}</span></p>
              </div>
              
              <div className="flex flex-col sm:items-end shrink-0">
                {/* Visual Gold Star Row Rating */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3.5 w-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {rev.date}
                </span>
              </div>
            </div>

            {/* Comment Block Quotes */}
            <p className="text-xs text-gray-600 leading-relaxed mt-4 p-3 bg-white border border-gray-100 rounded-xl italic">
              "{rev.comment}"
            </p>

            {/* Action Row Panel */}
            <div className="mt-4 pt-3 border-t border-gray-100/60 flex justify-end">
              <button 
                onClick={() => handleRemoveReview(rev.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold border border-gray-200 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-2xs"
                title="Delete this review entry"
              >
                <Trash2 className="h-3 w-3" /> Remove Feedback
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            ⭐ You haven't written any property or agent ratings yet.
          </div>
        )}
      </div>
    </div>
  );
}
