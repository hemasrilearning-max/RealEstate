import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Eye,
  Heart,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import propertyViewService from "../../services/propertyViewService";

export default function ViewedProperties() {
  const navigate = useNavigate();

  const {
    properties,
    isFavorite,
    toggleFavorite,
  } = useData();

  const {
    isAuthenticated,
    user,
  } = useAuth();

  const [
    viewedPropertyIds,
    setViewedPropertyIds,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * ============================================================
   * LOAD VIEWED PROPERTIES FROM BACKEND
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadViewedProperties =
      async () => {
        if (
          !isAuthenticated ||
          user?.role !== "buyer"
        ) {
          setViewedPropertyIds([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);

          const response =
            await propertyViewService.getMyViewedProperties();

          if (cancelled) {
            return;
          }

          const list =
            Array.isArray(response)
              ? response
              : response?.content ||
                response?.data ||
                response?.properties ||
                [];

          const ids = list
            .map(
              (property) =>
                property?.id
            )
            .filter(
              (propertyId) =>
                propertyId != null
            );

          setViewedPropertyIds(ids);
        } catch (error) {
          console.error(
            "Failed to load viewed properties:",
            error
          );

          if (!cancelled) {
            setViewedPropertyIds([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadViewedProperties();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    user?.role,
  ]);

  /*
   * ============================================================
   * MATCH BACKEND VIEWED IDS WITH FRONTEND PROPERTIES
   * ============================================================
   */

  const viewedProperties =
    viewedPropertyIds
      .map((id) =>
        properties?.find(
          (property) =>
            String(property.id) ===
            String(id)
        )
      )
      .filter(Boolean);

  /*
   * ============================================================
   * FAVORITE
   * ============================================================
   */

  const handleFavorite = (
    propertyId
  ) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleFavorite(propertyId);
  };

  /*
   * ============================================================
   * PROPERTY HELPERS
   * ============================================================
   */

  const formatPrice = (property) => {
    const price =
      Number(property?.price);

    if (!Number.isFinite(price)) {
      return "₹0";
    }

    if (
      String(
        property?.listingType || ""
      ).toUpperCase() === "RENT"
    ) {
      return `₹${price.toLocaleString(
        "en-IN"
      )} /mo`;
    }

    if (price >= 10000000) {
      return `₹${(
        price / 10000000
      ).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(
        price / 100000
      ).toFixed(2)} L`;
    }

    return `₹${price.toLocaleString(
      "en-IN"
    )}`;
  };

  const getPropertyImage = (
    property
  ) => {
    if (
      Array.isArray(
        property?.images
      ) &&
      property.images.length > 0
    ) {
      return property.images[0];
    }

    return (
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85"
    );
  };

  const getLocation = (
    property
  ) => {
    if (
      typeof property?.location ===
      "string"
    ) {
      return property.location;
    }

    const location =
      property?.location || {};

    return [
      location.area,
      location.city,
      location.state,
    ]
      .filter(Boolean)
      .join(", ") ||
      property?.city ||
      "Location not available";
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Viewed Properties
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Properties you have recently viewed
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading viewed properties...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Fetching your viewing history.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Viewed Properties
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Properties you have recently viewed
          </p>
        </div>
      </div>

      {/* COUNT */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {viewedProperties.length}
          </span>{" "}
          {viewedProperties.length ===
          1
            ? "property"
            : "properties"}
        </p>
      </div>

      {/* EMPTY STATE */}
      {viewedProperties.length ===
      0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-16 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Eye className="w-7 h-7 text-gray-400" />
          </div>

          <h3 className="mt-5 text-base font-bold text-gray-900">
            No viewed properties yet
          </h3>

          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Properties you view will appear here so
            you can easily find them again.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/properties"
              )
            }
            className="mt-5 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        /* PROPERTY GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {viewedProperties.map(
            (property) => (
              <div
                key={property.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                {/* IMAGE */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  <img
                    src={getPropertyImage(
                      property
                    )}
                    alt={
                      property.title
                    }
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85";
                    }}
                  />

                  {/* VIEWED BADGE */}
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-black/65 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    <Eye className="w-3 h-3" />
                    Viewed
                  </span>

                  {/* FAVORITE */}
                  <button
                    type="button"
                    onClick={() =>
                      handleFavorite(
                        property.id
                      )
                    }
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                      isFavorite(
                        property.id
                      )
                        ? "bg-rose-600 text-white"
                        : "bg-white/90 text-gray-600 hover:text-rose-600"
                    }`}
                    aria-label={
                      isFavorite(
                        property.id
                      )
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={
                        isFavorite(
                          property.id
                        )
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {
                          property.title
                        }
                      </h3>

                      <p className="mt-1 text-xs text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />

                        {getLocation(
                          property
                        )}
                      </p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="mt-4">
                    <p className="text-lg font-extrabold text-gray-900">
                      {formatPrice(
                        property
                      )}
                    </p>
                  </div>

                  {/* SPECS */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                    {property.bedrooms !=
                      null && (
                      <span>
                        {
                          property.bedrooms
                        }{" "}
                        Beds
                      </span>
                    )}

                    {property.bathrooms !=
                      null && (
                      <span>
                        {
                          property.bathrooms
                        }{" "}
                        Baths
                      </span>
                    )}

                    {property.area !=
                      null && (
                      <span>
                        {
                          property.area
                        }{" "}
                        {
                          property.areaUnit ||
                          "sq.ft"
                        }
                      </span>
                    )}
                  </div>

                  {/* VIEW PROPERTY */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/properties/${property.id}`
                      )
                    }
                    className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-xs font-semibold transition"
                  >
                    View Property
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}