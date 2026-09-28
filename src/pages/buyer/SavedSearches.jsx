
import { Search, MapPin, Bell, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

function formatDate(dateString) {
  if (!dateString) return "Saved recently";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  return `Saved ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function formatPrice(value) {
  if (!value) return "";

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  return `₹${number.toLocaleString("en-IN")}`;
}

function buildFilterText(filters = {}) {
  const parts = [];

  if (filters.bhk) {
    parts.push(filters.bhk);
  }

  if (filters.listingType) {
    parts.push(filters.listingType === "Sale" ? "Buy" : filters.listingType);
  }

  if (filters.propertyType) {
    parts.push(filters.propertyType);
  }

  if (filters.minPrice && filters.maxPrice) {
    parts.push(
      `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`
    );
  } else if (filters.maxPrice) {
    parts.push(`Max ${formatPrice(filters.maxPrice)}`);
  } else if (filters.minPrice) {
    parts.push(`Min ${formatPrice(filters.minPrice)}`);
  }

  if (filters.city) {
    parts.push(filters.city);
  }

  return parts.length > 0 ? parts.join(" · ") : "All properties";
}

export default function BuyerSavedSearches() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    savedSearches,
    deleteSavedSearch,
    toggleSavedSearchAlert,
  } = useData();

  const handleRunSearch = (item) => {
    const filters = item.filters || {};

    const params = new URLSearchParams();

    if (filters.listingType) {
      params.set("listingType", filters.listingType);
    }

    if (filters.propertyType) {
      params.set("propertyType", filters.propertyType);
    }

    if (filters.bhk) {
      params.set("bhk", filters.bhk);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    }

    if (filters.city) {
      params.set("city", filters.city);
    }

    if (filters.search) {
      params.set("search", filters.search);
    }

    navigate(`/properties?${params.toString()}`);
  };

  const handleDelete = (id) => {
    deleteSavedSearch(id);
  };

  const handleToggleAlert = (id) => {
    toggleSavedSearchAlert(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans">
        {/* Header */}
        <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              Saved Searches
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Your saved property searches and matching alerts.
            </p>

            {user?.email && (
              <p className="text-xs text-gray-400 mt-1">
                Saved for {user.email}
              </p>
            )}
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            {savedSearches.length} Saved
          </div>
        </div>

        {/* Saved searches */}
        {savedSearches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {savedSearches.map((item) => {
              const filters = item.filters || {};

              const location =
                filters.search ||
                filters.city ||
                "All locations";

              const filterText = buildFilterText(filters);

              return (
                <div
                  key={item.id}
                  className="border border-gray-100 bg-gray-50/20 p-5 rounded-xl flex flex-col justify-between transition-all hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {item.name || location}
                          </h4>

                          <p className="text-xs text-gray-500 mt-1 font-medium bg-white border border-gray-100 px-2 py-1 rounded-md inline-block">
                            {filterText}
                          </p>
                        </div>
                      </div>

                      {/* Alert */}
                      <button
                        type="button"
                        onClick={() => handleToggleAlert(item.id)}
                        className={`p-2 rounded-lg border transition-all shrink-0 ${
                          item.alerts
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                        title={
                          item.alerts
                            ? "Alerts active"
                            : "Alerts disabled"
                        }
                      >
                        <Bell
                          className={`h-3.5 w-3.5 ${
                            item.alerts ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {filters.listingType && (
                        <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                          {filters.listingType === "Sale"
                            ? "Buy"
                            : filters.listingType}
                        </span>
                      )}

                      {filters.propertyType && (
                        <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                          {filters.propertyType}
                        </span>
                      )}

                      {filters.bhk && (
                        <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-medium">
                          {filters.bhk}
                        </span>
                      )}

                      {filters.city && (
                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                          {filters.city}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 font-medium mt-4">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                      title="Delete saved search"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRunSearch(item)}
                      className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
                    >
                      Run Search
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-emerald-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No saved searches yet
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Search for properties, apply your filters and save the search
              to quickly find matching properties later.
            </p>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="mt-5 inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
            >
              Browse Properties
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

