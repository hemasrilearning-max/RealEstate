import React, { useState } from 'react';
import { Eye, MapPin, Calendar, Clock, ArrowRight, Heart } from 'lucide-react';

export default function BuyerViewedProperties() {
  // Mock data representing the buyer's recent browsing history tracking log
  const [history, setHistory] = useState([
    { id: 1, title: 'Modern 3 BHK Apartment', loc: 'Whitefield, Bangalore', price: '₹1.20 Cr', visitedDate: 'Today', viewedTime: '2 hours ago', tag: 'Buy', isFavorite: true },
    { id: 2, title: '3 BHK Independent House', loc: 'HSR Layout, Bangalore', price: '₹2.10 Cr', visitedDate: 'Yesterday', viewedTime: '6:15 PM', tag: 'Buy', isFavorite: false },
    { id: 3, title: 'Luxury 4 BHK Villa', loc: 'Sarjapur Road, Bangalore', price: '₹3.50 Cr', visitedDate: 'Sep 12, 2026', viewedTime: '3 days ago', tag: 'Buy', isFavorite: true },
    { id: 4, title: '2 BHK Fully Furnished Flat', loc: 'Koramangala, Bangalore', price: '₹35,000 /mo', visitedDate: 'Sep 10, 2026', viewedTime: '5 days ago', tag: 'Rent', isFavorite: false },
  ]);

  const handleToggleFavorite = (id) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600" /> Viewed Properties
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Review a history log of all property listings you have browsed.</p>
        </div>
        <span className="text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1 rounded-xl self-start sm:self-center">
          {history.length} Listings Logged
        </span>
      </div>

      {/* Grid Row Feed Stream List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {history.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group">
            
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 min-w-0">
                {/* Intent Badges */}
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mb-1.5 ${
                  item.tag === 'Buy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  For {item.tag}
                </span>
                
                <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" /> {item.loc}
                </p>
                
                {/* Viewing Timestamp Badge Indicators */}
                <div className="flex items-center gap-3 pt-2 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                    <Calendar className="h-3 w-3 text-gray-400" /> {item.visitedDate}
                  </span>
                  <span className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                    <Clock className="h-3 w-3 text-gray-400" /> {item.viewedTime}
                  </span>
                </div>
              </div>

              {/* Heart Shortlist Action Button */}
              <button 
                onClick={() => handleToggleFavorite(item.id)}
                className={`p-2 rounded-lg border transition-all shrink-0 ${
                  item.isFavorite 
                    ? 'bg-rose-50 border-rose-100 text-rose-500' 
                    : 'bg-white border-gray-200 text-gray-400 hover:text-rose-500 hover:bg-rose-50/50'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Bottom Panel Actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-md font-black text-emerald-600">{item.price}</span>
              <button className="text-[10px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-2xs">
                Open Listing <ArrowRight className="h-3 w-3" />
              </button>
            </div>

          </div>
        ))}

        {history.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm font-medium">
            👁️ Your browsing history timeline logs are empty.
          </div>
        )}
      </div>
    </div>
  );
}
