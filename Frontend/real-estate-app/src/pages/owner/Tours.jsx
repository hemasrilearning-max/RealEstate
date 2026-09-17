import React, { useState } from 'react';

export default function OwnerTours() {
  // Mock data representing booked tour slots
  const [tours, setTours] = useState([
    { id: 1, clientName: "Arvind G.", property: "3BHK Villa - Whitefield", date: "2026-09-18", time: "11:00 AM", type: "In-Person Visit", status: "Pending" },
    { id: 2, clientName: "Priya Sharma", property: "2BHK Apartment - HSR Layout", date: "2026-09-19", time: "04:30 PM", type: "Video Walkthrough", status: "Approved" },
    { id: 3, clientName: "Rahul Verma", property: "Studio - Indiranagar", date: "2026-09-15", time: "02:00 PM", type: "In-Person Visit", status: "Completed" },
    { id: 4, clientName: "Sneha Reddy", property: "3BHK Villa - Whitefield", date: "2026-09-22", time: "10:00 AM", type: "In-Person Visit", status: "Pending" }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');

  const handleUpdateStatus = (id, newStatus) => {
    setTours(prev => prev.map(tour => tour.id === id ? { ...tour, status: newStatus } : tour));
  };

  const statusStyles = {
    Pending: 'bg-orange-50 text-orange-600 border-orange-200',
    Approved: 'bg-green-50 text-green-600 border-green-200',
    Completed: 'bg-blue-50 text-blue-600 border-blue-200',
    Declined: 'bg-red-50 text-red-600 border-red-200'
  };

  const filteredTours = activeFilter === 'All' 
    ? tours 
    : tours.filter(t => t.status === activeFilter);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tour Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage viewing appointments requested by prospects.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/60 self-start">
          {['All', 'Pending', 'Approved', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Appointments Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{tour.clientName}</h4>
                  <p className="text-xs text-rose-500 font-semibold mt-0.5">{tour.property}</p>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${statusStyles[tour.status]}`}>
                  {tour.status}
                </span>
              </div>

              {/* Time slot elements */}
              <div className="mt-4 grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600 font-medium shadow-2xs">
                <div>📅 {tour.date}</div>
                <div>⏰ {tour.time}</div>
                <div className="col-span-2 pt-1.5 border-t border-gray-50 mt-1.5 text-gray-400">
                  Type: <span className="text-gray-700 font-semibold">{tour.type}</span>
                </div>
              </div>
            </div>

            {/* Quick action execution triggers */}
            {tour.status === 'Pending' && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/60">
                <button 
                  onClick={() => handleUpdateStatus(tour.id, 'Declined')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-red-500 transition-colors"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleUpdateStatus(tour.id, 'Approved')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs hover:opacity-95 transition-opacity"
                >
                  Approve Slot
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredTours.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
            No active tour viewings listed under this operational filter tab.
          </div>
        )}
      </div>
    </div>
  );
}
