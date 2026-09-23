import React, { useState } from 'react';
import { Sparkles, MapPin, ArrowRight, ThumbsDown, Star } from 'lucide-react';

export default function BuyerRecommendations() {
  // Mock data representing AI-curated property suggestions matching user telemetry
  const [matches, setMatches] = useState([
    { id: 1, title: 'Luxury 3 BHK Flat', loc: 'Whitefield, Bangalore', price: '₹1.20 Cr', score: '98% Match', tag: 'Buy', reason: 'Matches your locality target and budget criteria.' },
    { id: 2, title: 'Premium 2 BHK Apartment', loc: 'HSR Layout, Bangalore', price: '₹45,000 /mo', score: '92% Match', tag: 'Rent', reason: 'Similar to listings you viewed recently with price drops.' },
    { id: 3, title: 'Green View Studio Loft', loc: 'Indiranagar, Bangalore', price: '₹28,000 /mo', score: '87% Match', tag: 'Rent', reason: 'Matches your preference for fully furnished spaces.' }
  ]);

  const handleDismiss = (id) => {
    setMatches(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 fill-emerald-100" /> Curated Recommendations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Explore tailored property suggestions based on your search history and activity parameters.</p>
        </div>
      </div>

      {/* Grid Flow Feed of Recommended Houses */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {matches.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
            
            <div>
              {/* Highlight Score Badge Label */}
              <div className="flex justify-between items-center mb-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shadow-2xs">
                  <Star className="h-3 w-3 fill-current" /> {item.score}
                </span>
                
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  item.tag === 'Buy' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  For {item.tag}
                </span>
              </div>

              {/* Title & Location details */}
              <div className="mt-2">
                <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" /> {item.loc}
                </p>
              </div>

              {/* AI logic tag reasoning description text */}
              <p className="text-[11px] text-gray-500 bg-white border border-gray-100/80 p-3 rounded-lg mt-3 leading-relaxed">
                ✨ <span className="font-semibold text-gray-700">Why this?</span> {item.reason}
              </p>
            </div>

            {/* Bottom Actions pricing and interaction elements */}
            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-black text-emerald-600">{item.price}</span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDismiss(item.id)}
                  className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                  title="Not interested"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
                <button className="text-[10px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-2xs">
                  View Home <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {matches.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm font-medium">
            ✨ Check back soon! We are evaluating more matching inventory listings for you.
          </div>
        )}
      </div>
    </div>
  );
}
