import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import PropertyCard from "../../components/PropertyCard";

export default function BuyerFavorites() {
  const {
    properties,
    favoriteIds,
    removeFavorite,
  } = useData();

  const favorites = properties.filter((property) =>
    favoriteIds.includes(property.id)
  );

  const handleRemove = (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();

    removeFavorite(propertyId);
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

      {/* Favorites */}
      {favorites.length === 0 ? (
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

