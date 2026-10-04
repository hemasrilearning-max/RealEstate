import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/PropertyCard";
import wishlistService from "../../services/wishlistService";

export default function BuyerFavorites() {
  const { properties } = useData();
  const { user, isAuthenticated } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Load favorites from backend Wishlist
   */
  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      if (!isAuthenticated || !user?.userId) {
        setFavoriteIds([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response =
          await wishlistService.getWishlistByUser(
            user.userId
          );

        const wishlistItems = Array.isArray(response)
          ? response
          : [];

        const ids = wishlistItems
          .map((item) => item.propertyId)
          .filter(Boolean);

        if (!cancelled) {
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error(
          "Unable to load favorite properties:",
          error
        );

        if (!cancelled) {
          setFavoriteIds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.userId]);

  /*
   * Match backend wishlist property IDs
   * with the properties already loaded by DataContext.
   */
  const favorites = properties.filter((property) =>
    favoriteIds.includes(property.id)
  );

  const handleRemove = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.userId) {
      return;
    }

    try {
      await wishlistService.removeFromWishlist(
        user.userId,
        propertyId
      );

      setFavoriteIds((currentIds) =>
        currentIds.filter(
          (id) => id !== propertyId
        )
      );
    } catch (error) {
      console.error(
        "Unable to remove favorite:",
        error
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />

            <h1 className="text-2xl font-bold text-gray-900">
              My Favorites
            </h1>
          </div>

          <p className="text-gray-500 mt-1">
            Properties you have saved for later.
          </p>
        </div>

        <span className="inline-flex items-center justify-center bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold">
          {favorites.length} Saved
        </span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />

          <p className="text-gray-500 mt-4">
            Loading your favorite properties...
          </p>
        </div>
      ) : favorites.length === 0 ? (
        /* Empty Favorites */
        <div className="bg-white border border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
            <Heart className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            No favorite properties yet
          </h2>

          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Browse properties and click the heart icon to save
            the homes you are interested in.
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
        /* Favorites */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div
              key={property.id}
              className="relative"
            >
              <PropertyCard property={property} />

              {/* Remove favorite */}
              <button
                type="button"
                onClick={(e) =>
                  handleRemove(e, property.id)
                }
                className="absolute bottom-4 right-4 z-10 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}