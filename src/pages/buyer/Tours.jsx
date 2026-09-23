import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BuyerTours() {
  // Mock data representing tours booked by this specific buyer account
  const [tours] = useState([
    { 
      id: 1, 
      property: 'Luxury 4 BHK Villa', 
      loc: 'Sarjapur Road, Bangalore',
      date: 'Sep 18, 2026', 
      time: '11:30 AM', 
      agent: 'Arvind G. (Senior Broker)', 
      type: 'In-Person Tour', 
      status: 'Confirmed' 
    },
    { 
      id: 2, 
      property: 'Modern 3 BHK Apartment', 
      loc: 'Whitefield, Bangalore',
      date: 'Sep 22, 2026', 
      time: '04:00 PM', 
      agent: 'Sanjay Malhotra', 
      type: 'Video Walkthrough', 
      status: 'Pending Approval' 
    },
  ]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Header section */}
      <div className="pb-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" /> Tour Bookings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Track your upcoming house viewings and video walkthrough schedules.</p>
        </div>
      </div>

      {/* Appointment Cards List Stack */}
      <div className="space-y-4 mt-6">
        {tours.map((tour) => (
          <div 
            key={tour.id} 
            className="border border-gray-100 bg-gray-50/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:bg-white hover:shadow-sm"
          >
            {/* Left Content Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="font-bold text-gray-900 text-sm">{tour.property}</h4>
                
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                  tour.status === 'Confirmed' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {tour.status === 'Confirmed' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {tour.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500 font-medium pt-1">
                <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-gray-400" /> {tour.date}</p>
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-gray-400" /> {tour.time}</p>
                <p className="flex items-center gap-2 text-emerald-600 font-semibold">
                  {tour.type === 'Video Walkthrough' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {tour.type}
                </p>
                <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-gray-400" /> Agent: {tour.agent}</p>
              </div>
            </div>

            {/* Right Action Trigger Buttons */}
            <div className="flex gap-2 self-start md:self-center">
              <button className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs">
                Cancel / Reschedule
              </button>
              {tour.type === 'Video Walkthrough' && tour.status === 'Confirmed' && (
                <button className="px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                  Join Video Call
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
