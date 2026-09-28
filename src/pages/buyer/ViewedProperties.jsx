import { Eye, MapPin, ArrowRight, Heart, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../data/mockData";

export default function ViewedProperties() {
  const navigate = useNavigate();

  const {
    properties,
    viewedPropertyIds,
    isFavorite,
    toggleFavorite,
  } = useData();

  const { isAuthenticated } = useAuth();

  /*
   * viewedPropertyIds is stored with the newest property first.
   *
   * We map those IDs back to the real properties from DataContext.
   */
  const viewedProperties = viewedPropertyIds
    .map((id) =>
      properties.find(
        (property) => String(property.id) === String(id)
      )
    )
    .filter(Boolean);

  const handleFavorite = (propertyId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleFavorite(propertyId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="mb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-600" />

              <h1 className="text-2xl font-bold text-gray-900">
                Viewed Properties
              </h1>
            </div>

            <p className="text-gray-500 mt-1">
              Properties you recently viewed on HomeSpace.
            </p>
          </div>

          {viewedProperties.length > 0 && (
            <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold">
              <Eye className="w-4 h-4" />
              {viewedProperties.length}{" "}
              {viewedProperties.length === 1
                ? "Property"
                : "Properties"}
            </span>
          )}

        </div>
      </div>

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}
      {viewedProperties.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 px-6 text-center shadow-sm">

          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5">
            <Eye className="w-8 h-8 text-emerald-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            No viewed properties yet
          </h2>

          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Properties you open while browsing HomeSpace will
            automatically appear here.
          </p>

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 mt-6 bg-purple-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Browse Properties
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      ) : (
        /* =======================================================
           PROPERTY GRID
        ======================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {viewedProperties.map((property) => {

            const favorite = isFavorite(property.id);

            const image =
              property.images?.[0] ||
              "https://via.placeholder.com/800x500";

            return (
              <div
                key={property.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >

                {/* =================================================
                    IMAGE
                ================================================= */}
                <div className="relative aspect-[16/10] bg-gray-100">

                  <img
                    src={image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Listing type */}
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${
                      property.listingType === "Rent"
                        ? "bg-blue-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    For {property.listingType}
                  </span>

                  {/* Favorite */}
                  <button
                    type="button"
                    onClick={() =>
                      handleFavorite(property.id)
                    }
                    aria-label={
                      favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:bg-white transition"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorite
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {/* =================================================
                    PROPERTY INFORMATION
                ================================================= */}
                <div className="p-5">

                  <h2 className="font-bold text-gray-900 text-lg line-clamp-1">
                    {property.title}
                  </h2>

                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 shrink-0" />

                    <span className="truncate">
                      {property.location}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 text-xl font-bold text-purple-600">
                    {formatPrice(
                      property.price,
                      property.listingType
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-500">

                    {property.bhk && (
                      <span>
                        {property.bhk} Bedrooms
                      </span>
                    )}

                    {property.bathrooms && (
                      <span>
                        {property.bathrooms} Bathrooms
                      </span>
                    )}

                    {property.area && (
                      <span>
                        {property.area}{" "}
                        {property.areaUnit || "sqft"}
                      </span>
                    )}

                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mt-5 pt-4">

                    <Link
                      to={`/properties/${property.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                    >
                      Open Listing
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* =========================================================
          BOTTOM BROWSE LINK
      ========================================================= */}
      {viewedProperties.length > 0 && (
        <div className="mt-10 text-center">

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition"
          >
            <Home className="w-4 h-4" />
            Continue Browsing Properties
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      )}

    </div>
  );
}

