import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BuyerTours() {
  const navigate = useNavigate();

  const [tours, setTours] = useState([
    {
      id: 1,
      property: "Luxury 4 BHK Villa",
      loc: "Sarjapur Road, Bangalore",
      date: "Sep 18, 2026",
      time: "11:30 AM",
      agent: "Arvind G. (Senior Broker)",
      type: "In-Person Tour",
      status: "Confirmed",
    },
    {
      id: 2,
      property: "Modern 3 BHK Apartment",
      loc: "Whitefield, Bangalore",
      date: "Sep 22, 2026",
      time: "04:00 PM",
      agent: "Sanjay Malhotra",
      type: "Video Walkthrough",
      status: "Pending Approval",
    },
  ]);

  const handleCancel = (tourId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this tour?"
    );

    if (!confirmed) return;

    setTours((prev) =>
      prev.map((tour) =>
        tour.id === tourId
          ? { ...tour, status: "Cancelled" }
          : tour
      )
    );
  };

  const handleReschedule = (tour) => {
    window.alert(
      `Reschedule request for "${tour.property}" will be available once tour scheduling is connected to the backend.`
    );
  };

  const getStatusClasses = (status) => {
    if (status === "Confirmed") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = (status) => {
    if (status === "Confirmed") {
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    }

    return <AlertCircle className="h-3.5 w-3.5" />;
  };

  const upcomingTours = tours.filter(
    (tour) => tour.status !== "Cancelled"
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-5rem)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-emerald-600" />
                Tour Bookings
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Track your property visits and video walkthrough
                appointments.
              </p>
            </div>

            <button
              onClick={() => navigate("/properties")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4" />
              Browse Properties
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Total Bookings
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {tours.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Active Tours
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {upcomingTours.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              Confirmed
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {
                tours.filter(
                  (tour) => tour.status === "Confirmed"
                ).length
              }
            </p>
          </div>
        </div>

        {/* TOUR LIST */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Your Appointments
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              View the details of your scheduled property appointments.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {tours.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />

                <h3 className="font-semibold text-gray-900">
                  No tour bookings
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Browse properties and schedule a viewing when you
                  find something you like.
                </p>

                <button
                  onClick={() => navigate("/properties")}
                  className="mt-5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              tours.map((tour) => (
                <div
                  key={tour.id}
                  className="border border-gray-100 bg-gray-50/40 p-4 sm:p-5 rounded-2xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* PROPERTY DETAILS */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          {tour.type === "Video Walkthrough" ? (
                            <Video className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <MapPin className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              {tour.property}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border ${getStatusClasses(
                                tour.status
                              )}`}
                            >
                              {getStatusIcon(tour.status)}
                              {tour.status}
                            </span>
                          </div>

                          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {tour.loc}
                          </p>
                        </div>
                      </div>

                      {/* APPOINTMENT INFORMATION */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />

                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">
                              Date
                            </p>

                            <p className="text-xs text-gray-700 font-semibold">
                              {tour.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />

                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">
                              Time
                            </p>

                            <p className="text-xs text-gray-700 font-semibold">
                              {tour.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {tour.type === "Video Walkthrough" ? (
                            <Video className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          )}

                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">
                              Tour Type
                            </p>

                            <p className="text-xs text-gray-700 font-semibold">
                              {tour.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 shrink-0" />

                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">
                              Agent
                            </p>

                            <p className="text-xs text-gray-700 font-semibold truncate">
                              {tour.agent}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[150px]">
                      {tour.status !== "Cancelled" && (
                        <>
                          <button
                            onClick={() => handleReschedule(tour)}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => handleCancel(tour.id)}
                            className="px-3 py-2 text-xs font-semibold border border-red-200 rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors"
                          >
                            Cancel Tour
                          </button>
                        </>
                      )}

                      {tour.type === "Video Walkthrough" &&
                        tour.status === "Confirmed" && (
                          <button
                            className="px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            Join Video Call
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* INFORMATION NOTE */}
        <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex gap-3">
            <Calendar className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />

            <div>
              <p className="text-xs font-semibold text-emerald-800">
                Tour booking information
              </p>

              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Your tour details will be updated when the property
                owner or agent confirms the appointment. Video
                walkthrough links will become available for confirmed
                online tours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
