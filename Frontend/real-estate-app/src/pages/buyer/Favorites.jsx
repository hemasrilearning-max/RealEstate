import React, { useState } from 'react';
import { Heart, MapPin, ArrowRight, Trash2 } from 'lucide-react';

export default function BuyerFavorites() {
  // Mock data representing properties shortlisted by the active user
  const [favorites, setFavorites] = useState([
    { id: 1, title: 'Modern 3 BHK Apartment', loc: 'Whitefield, Bangalore', price: '₹1.20 Cr', type: 'Buy', image: '🏢' },
    { id: 2, title: 'Premium 2 BHK Flat', loc: 'HSR Layout, Bangalore', price: '₹45,000 /mo', type: 'Rent', image: '🏠' },
    { id: 3, title: 'Luxury 4 BHK Villa', loc: 'Sarjapur Road, Bangalore', price: '₹3.50 Cr', type: 'Buy', image: '🏰' },
  ]);

  const handleRemove = (id) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Title Header Row */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Saved Favorites
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage and track homes you have shortlisted for active viewing.</p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl self-start sm:self-center">
          {favorites.length} Shortlisted
        </span>
      </div>

      {/* Grid Multi-Card Layout Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {favorites.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
            
            <div>
              {/* Image Box Container Asset Placeholder */}
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-4 shadow-2xs select-none">
                {item.image}
              </div>

              {/* Title & Tag Layer */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm truncate max-w-[170px]">{item.title}</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" /> {item.loc}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                  item.type === 'Buy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  For {item.type}
                </span>
              </div>
            </div>

            {/* Footer Pricing & Operational Buttons */}
            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-black text-emerald-600">{item.price}</span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button className="text-[10px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-2xs">
                  Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {favorites.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm font-medium">
            💔 Your shortlist catalog workspace is currently empty.
          </div>
        )}
      </div>
    </div>
  );
}
