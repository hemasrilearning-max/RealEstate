
import React, { useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Eye,
  Users,
  MoreVertical,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function OwnerProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /*
   * FRONTEND DEMO PROPERTY DATA
   *
   * These images are temporary frontend images.
   * Later, replace the image URL with the image URL
   * returned from your backend/database.
   */
  const propertiesData = [
    {
      id: 1,
      title: "Luxury 4 BHK Villa with Private Pool",
      locality: "Sarjapur Road, Bangalore",
      price: "₹3.50 Cr",
      views: 521,
      leads: 14,
      status: "Active",
      type: "Sale",
      specs: {
        beds: 4,
        baths: 4,
        area: "2800 sqft",
      },
      furnishing: "Fully Furnished",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    },

    {
      id: 2,
      title: "Spacious 3 BHK Apartment in Whitefield",
      locality: "Whitefield, Bangalore",
      price: "₹1.25 Cr",
      views: 342,
      leads: 9,
      status: "Active",
      type: "Sale",
      specs: {
        beds: 3,
        baths: 3,
        area: "1470 sqft",
      },
      furnishing: "Semi Furnished",
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    },

    {
      id: 3,
      title: "3 BHK Independent House - HSR Layout",
      locality: "HSR Layout Sector 2, Bangalore",
      price: "₹1.80 Cr",
      views: 398,
      leads: 6,
      status: "Sold",
      type: "Sale",
      specs: {
        beds: 3,
        baths: 3,
        area: "2000 sqft",
      },
      furnishing: "Semi Furnished",
      image:
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
    },

    {
      id: 4,
      title: "2 BHK Fully Furnished Flat for Rent",
      locality: "Koramangala, Bangalore",
      price: "₹45,000 /mo",
      views: 189,
      leads: 5,
      status: "Rented",
      type: "Rent",
      specs: {
        beds: 2,
        baths: 2,
        area: "1100 sqft",
      },
      furnishing: "Fully Furnished",
      image:
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85",
    },

    {
      id: 5,
      title: "Premium 3 BHK Modern Villa",
      locality: "Electronic City, Bangalore",
      price: "₹2.10 Cr",
      views: 275,
      leads: 11,
      status: "Active",
      type: "Sale",
      specs: {
        beds: 3,
        baths: 3,
        area: "2200 sqft",
      },
      furnishing: "Fully Furnished",
      image:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=85",
    },

    {
      id: 6,
      title: "Modern 2 BHK Apartment",
      locality: "Marathahalli, Bangalore",
      price: "₹38,000 /mo",
      views: 164,
      leads: 7,
      status: "Rented",
      type: "Rent",
      specs: {
        beds: 2,
        baths: 2,
        area: "1050 sqft",
      },
      furnishing: "Semi Furnished",
      image:
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    },
  ];

  /*
   * SEARCH + STATUS FILTER
   */
  const filteredProperties = propertiesData.filter((property) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      property.title.toLowerCase().includes(search) ||
      property.locality.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
   * STATUS STYLE
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";

      case "Rented":
        return "bg-purple-50 text-purple-700 border border-purple-100";

      case "Sold":
        return "bg-gray-100 text-gray-700 border border-gray-200";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  /*
   * STATUS ICON
   */
  const getStatusIcon = (status) => {
    if (status === "Active") {
      return <Clock className="w-3 h-3" />;
    }

    return <CheckCircle className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">

      {/* =========================================================
          HEADER
      ========================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            My Registered Listings
          </h2>

          <p className="text-xs text-gray-500 mt-0.5">
            Review your properties, listing performance, buyer views,
            and leads.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </button>
      </div>

      {/* =========================================================
          SEARCH + FILTERS
      ========================================================== */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">

        {/* Search */}
        <div className="relative flex-1 max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <input
            type="text"
            placeholder="Search by locality or property name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
          />

        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">

          {["All", "Active", "Rented", "Sold"].map((status) => (

            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>

          ))}

        </div>
      </div>

      {/* =========================================================
          PROPERTY COUNT
      ========================================================== */}
      <div className="flex items-center justify-between">

        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-800">
            {filteredProperties.length}
          </span>{" "}
          {filteredProperties.length === 1
            ? "property"
            : "properties"}
        </p>

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear Search
          </button>
        )}

      </div>

      {/* =========================================================
          PROPERTY GRID
      ========================================================== */}
      {filteredProperties.length > 0 ? (

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {filteredProperties.map((property) => (

            <div
              key={property.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition group"
            >

              {/* =================================================
                  PROPERTY IMAGE
              ================================================== */}
              <div className="relative w-full sm:w-48 h-52 sm:h-auto sm:min-h-[230px] shrink-0 bg-gray-100 overflow-hidden">

                <img
                  src={property.image}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80";
                  }}
                />

                {/* Sale / Rent Badge */}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-white shadow-sm z-10 ${
                    property.type === "Sale"
                      ? "bg-blue-600"
                      : "bg-purple-600"
                  }`}
                >
                  For {property.type}
                </span>

              </div>

              {/* =================================================
                  PROPERTY CONTENT
              ================================================== */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">

                {/* Top Content */}
                <div className="space-y-1.5">

                  <div className="flex justify-between items-start gap-2">

                    {/* Status */}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusStyle(
                        property.status
                      )}`}
                    >
                      {getStatusIcon(property.status)}
                      {property.status}
                    </span>

                    {/* Menu */}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded transition-colors"
                      aria-label={`More options for ${property.title}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {property.title}
                  </h4>

                  {/* Location */}
                  <p className="text-xs text-gray-400 flex items-center gap-1 font-medium truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {property.locality}
                  </p>

                </div>

                {/* =================================================
                    PROPERTY SPECIFICATIONS
                ================================================== */}
                <div className="flex items-center gap-3 text-gray-500 text-xs border-y border-gray-100 py-2 overflow-hidden">

                  <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                    <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                    {property.specs.beds} BHK
                  </span>

                  <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                    <Bath className="w-3.5 h-3.5 text-gray-400" />
                    {property.specs.baths} Bath
                  </span>

                  <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                    {property.specs.area}
                  </span>

                </div>

                {/* =================================================
                    PRICE + ANALYTICS
                ================================================== */}
                <div className="flex items-end justify-between gap-3 pt-1">

                  {/* Price */}
                  <div className="min-w-0">

                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Property Value
                    </p>

                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {property.price}
                    </p>

                  </div>

                  {/* Views + Leads */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">

                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      {property.views}
                    </span>

                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {property.leads}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        /* =========================================================
            EMPTY STATE
        ========================================================== */
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center shadow-sm">

          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-gray-900">
            No properties found
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Try changing your search or status filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
            }}
            className="mt-4 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Reset Filters
          </button>

        </div>

      )}

    </div>
  );
}
