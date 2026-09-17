import React, { useState } from 'react';
import { Search, MapPin, Bell, Trash2, ArrowRight } from 'lucide-react';

export default function BuyerSavedSearches() {
  // Mock data representing automated search parameters saved by the buyer
  const [searches, setSearches] = useState([
    { id: 1, query: "Whitefield, Bangalore", filters: "3 BHK · Buy · Max ₹1.5 Cr", alerts: true, date: "Saved 4 days ago" },
    { id: 2, query: "HSR Layout, Bangalore", filters: "2 BHK · Rent · Max ₹50k/mo", alerts: false, date: "Saved 1 week ago" }
  ]);

  const handleToggleAlert = (id) => {
    setSearches(prev => prev.map(item => 
      item.id === id ? { ...item, alerts: !item.alerts } : item
    ));
  };

  const handleRemoveSearch = (id) => {
    setSearches(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section */}
      <div className="pb-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-600" /> Saved Searches
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage search filters and automated matching alert parameters.</p>
        </div>
      </div>

      {/* Grid Stack List of Saved Search Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {searches.map((item) => (
          <div key={item.id} className="border border-gray-100 bg-gray-50/20 p-5 rounded-xl flex flex-col justify-between transition-all hover:bg-white hover:shadow-sm">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.query}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium bg-white border border-gray-100 px-2 py-1 rounded-md inline-block">
                      {item.filters}
                    </p>
                  </div>
                </div>

                {/* Instant Email Alert Status Notification Toggle */}
                <button 
                  onClick={() => handleToggleAlert(item.id)}
                  className={`p-2 rounded-lg border transition-all shrink-0 ${
                    item.alerts 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                  title={item.alerts ? "Email alerts active" : "Email alerts muted"}
                >
                  <Bell className="h-3.5 w-3.5 fill-current opacity-90" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-4">{item.date}</p>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => handleRemoveSearch(item.id)}
                className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                title="Delete saved search"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button className="text-[10px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-2xs">
                Run Search <ArrowRight className="h-3 w-3" />
              </button>
            </div>

          </div>
        ))}

        {searches.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm font-medium">
            🔍 You haven't configured any custom search filters yet.
          </div>
        )}
      </div>
    </div>
  );
}
