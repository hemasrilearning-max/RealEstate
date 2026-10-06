import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";

import { formatPrice } from "../data/mockData";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import wishlistService from "../services/wishlistService";
import propertyViewService from "../services/propertyViewService";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  const {
    isFavorite,
    toggleFavorite,
    getPropertyImage,
  } = useData();

  const { user, isAuthenticated } = useAuth();

  /*
   * ============================================================
   * PROPERTY IMAGE
   * ============================================================
   *
   * Priority:
   * 1. Backend media image
   * 2. Local/browser image
   * 3. Placeholder
   */
  const propertyImage =
    getPropertyImage(property?.id) ||
    property?.images?.[0] ||
    "https://via.placeholder.com/400x300";

  /*
   * ============================================================
   * FAVORITE STATE
   * ============================================================
   */
  const localFavorite = isFavorite(property.id);

  const [favorite, setFavorite] =
    useState(localFavorite);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  /*
   * ============================================================
   * VIEW COUNT
   * ============================================================
   */
  const [viewCount, setViewCount] = useState(
    Number(property?.views || 0)
  );

  /*
   * ============================================================
   * LOAD VIEW COUNT FROM BACKEND
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadViewCount = async () => {
      if (!property?.id) {
        setViewCount(0);
        return;
      }

      try {
        const count =
          await propertyViewService.getViewCount(
            property.id
          );

        if (!cancelled) {
          setViewCount(Number(count || 0));
        }
      } catch (error) {
        console.error(
          "Unable to load property view count:",
          error
        );

        /*
         * Keep the existing property.views value
         * as fallback if the backend request fails.
         */
        if (!cancelled) {
          setViewCount(
            Number(property?.views || 0)
          );
        }
      }
    };

    loadViewCount();

    return () => {
      cancelled = true;
    };
  }, [property?.id, property?.views]);

  /*
   * ============================================================
   * LOAD WISHLIST STATUS
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadWishlistStatus = async () => {
      if (
        !isAuthenticated ||
        !user?.userId ||
        !property?.id
      ) {
        setFavorite(false);
        return;
      }

      try {
        const result =
          await wishlistService.isWishlisted(
            user.userId,
            property.id
          );

        if (!cancelled) {
          setFavorite(Boolean(result));
        }
      } catch (error) {
        console.error(
          "Unable to check wishlist status:",
          error
        );

        if (!cancelled) {
          setFavorite(localFavorite);
        }
      }
    };

    loadWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    user?.userId,
    property?.id,
  ]);

  /*
   * ============================================================
   * FAVORITE
   * ============================================================
   */
  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.userId) {
      console.error(
        "Logged-in user ID is not available."
      );

      return;
    }

    if (favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);

    try {
      if (favorite) {
        await wishlistService.removeFromWishlist(
          user.userId,
          property.id
        );

        setFavorite(false);

        /*
         * Keep DataContext synchronized.
         */
        if (localFavorite) {
          toggleFavorite(property.id);
        }
      } else {
        await wishlistService.addToWishlist(
          user.userId,
          property.id
        );

        setFavorite(true);

        /*
         * Keep DataContext synchronized.
         */
        if (!localFavorite) {
          toggleFavorite(property.id);
        }
      }
    } catch (error) {
      console.error(
        "Wishlist update failed:",
        error
      );

      /*
       * Keep current heart state if
       * backend request fails.
       */
      setFavorite(favorite);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 block"
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={propertyImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(event) => {
            if (
              event.currentTarget.src !==
              "https://via.placeholder.com/400x300"
            ) {
              event.currentTarget.src =
                "https://via.placeholder.com/400x300";
            }
          }}
        />

        {/* Listing badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              property.listingType === "Rent"
                ? "bg-blue-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {property.listingType}
          </span>

          {property.isFeatured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white">
              Featured
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={favoriteLoading}
          aria-label={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          title={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            favorite
              ? "bg-white text-red-500"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          } ${
            favoriteLoading
              ? "opacity-70 cursor-wait"
              : ""
          }`}
        >
          <Heart
            className={`w-5 h-5 ${
              favorite
                ? "fill-red-500"
                : ""
            }`}
          />
        </button>

        {/* Views */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {viewCount}
        </div>
      </div>

      {/* ======================================================
          PROPERTY DETAILS
      ====================================================== */}

      <div className="p-4">
        <div className="text-xl font-bold text-gray-900 mb-1">
          {formatPrice(
            property.price,
            property.listingType
          )}

          {property.pricePerSqft && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ₹
              {property.pricePerSqft.toLocaleString(
                "en-IN"
              )}
              /sqft
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-red-600 transition">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />

          <span className="line-clamp-1">
            {property.location}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          {property.bhk && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bhk}
            </span>
          )}

          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} Bath
            </span>
          )}

          <span className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            {property.area}{" "}
            {property.areaUnit}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {property.propertyType}
          </span>

          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {property.status}
          </span>

          {property.furnishing && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {property.furnishing}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

