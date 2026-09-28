import React, { useState } from "react";
import {
Sparkles,
MapPin,
ArrowRight,
ThumbsDown,
Star,
ArrowLeft,
Home,
SlidersHorizontal,
Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BuyerRecommendations() {
const navigate = useNavigate();

const [matches, setMatches] = useState([
{
id: 1,
title: "Luxury 3 BHK Flat",
loc: "Whitefield, Bangalore",
price: "₹1.20 Cr",
score: "98% Match",
tag: "Buy",
reason:
"Matches your locality target and budget criteria.",
searchParams:
"/properties?listingType=Sale&propertyType=Apartment&city=Whitefield",
},
{
id: 2,
title: "Premium 2 BHK Apartment",
loc: "HSR Layout, Bangalore",
price: "₹45,000 /mo",
score: "92% Match",
tag: "Rent",
reason:
"Similar to listings you viewed recently with price drops.",
searchParams:
"/properties?listingType=Rent&propertyType=Apartment&city=HSR%20Layout",
},
{
id: 3,
title: "Green View Studio Loft",
loc: "Indiranagar, Bangalore",
price: "₹28,000 /mo",
score: "87% Match",
tag: "Rent",
reason:
"Matches your preference for fully furnished spaces.",
searchParams:
"/properties?listingType=Rent&propertyType=Apartment&city=Indiranagar",
},
]);

const handleDismiss = (id) => {
setMatches((prev) =>
prev.filter((item) => item.id !== id)
);
};

const handleViewProperty = (item) => {
navigate(item.searchParams);
};

return ( <div className="min-h-screen bg-gray-50"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

    {/* Top Actions */}
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/properties")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Browse Properties
        </button>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
      </div>
    </div>

    {/* Page Header */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 mb-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6 text-emerald-600 fill-emerald-100" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Recommended Properties
          </h1>

          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Explore property suggestions based on your searches,
            favorites, recently viewed listings, and preferences.
          </p>

          {matches.length > 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                {matches.length} personalized suggestions
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Recommendation Content */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">
          Curated For You
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          These listings are selected based on your HomeSpace activity.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {matches.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 rounded-xl bg-white overflow-hidden hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
            >
              {/* Property Visual Placeholder */}
              <div className="h-36 sm:h-40 bg-gradient-to-br from-emerald-50 via-gray-50 to-slate-100 relative flex items-center justify-center">
                <Home className="h-12 w-12 text-emerald-200" />

                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-white/95 px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    {item.score}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                      item.tag === "Buy"
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    For {item.tag}
                  </span>
                </div>
              </div>

              {/* Property Information */}
              <div className="p-4 flex flex-col flex-1">

                <h3 className="font-bold text-gray-900 text-base">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {item.loc}
                </p>

                <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-800">
                      Why this property?
                    </span>{" "}
                    {item.reason}
                  </p>
                </div>

                {/* Price + Actions */}
                <div className="mt-auto pt-5">

                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-lg font-black text-emerald-600">
                      {item.price}
                    </span>

                    <span className="text-[10px] font-semibold text-gray-400">
                      Personalized match
                    </span>
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="p-2.5 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                      title="Not interested"
                      aria-label={`Dismiss ${item.title}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleViewProperty(item)}
                      className="flex-1 text-sm font-bold bg-gray-900 text-white px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                      View Properties
                      <ArrowRight className="h-4 w-4" />
                    </button>

                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {matches.length === 0 && (
            <div className="col-span-full text-center py-16 px-4">

              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-emerald-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                No recommendations right now
              </h3>

              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Continue browsing properties, saving listings, and
                creating searches. HomeSpace will use that activity
                to provide more relevant recommendations.
              </p>

              <button
                onClick={() => navigate("/properties")}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}
        </div>
      </div>
    </div>

    {/* Recommendation Information */}
    <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />

        <div>
          <h3 className="text-sm font-bold text-emerald-900">
            How recommendations work
          </h3>

          <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
            Recommendations can consider your saved searches,
            favorite properties, recently viewed listings, preferred
            locations, property types, and budget preferences. The
            current page uses sample recommendation data and can later
            be connected to the backend Recommendation API.
          </p>
        </div>
      </div>
    </div>

  </div>
</div>
);
}
