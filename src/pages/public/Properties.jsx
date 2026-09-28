import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/PropertyCard";
import FilterBar from "../../components/FilterBar";
import { Bookmark, Check } from "lucide-react";

export default function Properties() {
  const { properties, savedSearches, addSavedSearch } = useData();
  const { user, isAuthenticated } = useAuth();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    listingType: searchParams.get("listingType") || "",
    propertyType: searchParams.get("propertyType") || "",
    bhk: searchParams.get("bhk") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    city: searchParams.get("city") || "",
    search: searchParams.get("search") || "",
  });

  const [applied, setApplied] = useState({
    listingType: searchParams.get("listingType") || "",
    propertyType: searchParams.get("propertyType") || "",
    bhk: searchParams.get("bhk") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    city: searchParams.get("city") || "",
    search: searchParams.get("search") || "",
  });

  const [saveMessage, setSaveMessage] = useState("");

  /*
   * ============================================================
   * SYNC URL PARAMETERS
   * ============================================================
   */

  useEffect(() => {
    const urlFilters = {
      listingType: searchParams.get("listingType") || "",
      propertyType: searchParams.get("propertyType") || "",
      bhk: searchParams.get("bhk") || "",
      status: searchParams.get("status") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      city: searchParams.get("city") || "",
      search: searchParams.get("search") || "",
    };

    setFilters(urlFilters);
    setApplied(urlFilters);
  }, [searchParams]);

  /*
   * ============================================================
   * FILTER PROPERTIES
   * ============================================================
   */

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (
        applied.listingType &&
        p.listingType !== applied.listingType
      ) {
        return false;
      }

      if (
        applied.propertyType &&
        p.propertyType !== applied.propertyType
      ) {
        return false;
      }

      if (applied.bhk && p.bhk !== applied.bhk) {
        return false;
      }

      if (applied.status && p.status !== applied.status) {
        return false;
      }

      if (
        applied.minPrice &&
        p.price < Number(applied.minPrice)
      ) {
        return false;
      }

      if (
        applied.maxPrice &&
        p.price > Number(applied.maxPrice)
      ) {
        return false;
      }

      if (
        applied.city &&
        !p.city
          ?.toLowerCase()
          .includes(applied.city.toLowerCase())
      ) {
        return false;
      }

      if (applied.search) {
        const q = applied.search.toLowerCase();

        const match =
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.locality?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q);

        if (!match) {
          return false;
        }
      }

      return true;
    });
  }, [properties, applied]);

  /*
   * ============================================================
   * CREATE SEARCH NAME
   * ============================================================
   */

  const getSearchName = () => {
    if (applied.search) {
      return applied.search;
    }

    if (applied.city) {
      return applied.city;
    }

    if (applied.propertyType && applied.bhk) {
      return `${applied.bhk} ${applied.propertyType}`;
    }

    if (applied.propertyType) {
      return applied.propertyType;
    }

    if (applied.listingType) {
      return applied.listingType === "Sale"
        ? "Buy Properties"
        : "Rent Properties";
    }

    return "My Property Search";
  };

  /*
   * ============================================================
   * CHECK DUPLICATE SEARCH
   * ============================================================
   */

  const filtersAreSame = (first, second) => {
    const keys = [
      "listingType",
      "propertyType",
      "bhk",
      "status",
      "minPrice",
      "maxPrice",
      "city",
      "search",
    ];

    return keys.every(
      (key) =>
        String(first?.[key] || "") ===
        String(second?.[key] || "")
    );
  };

  /*
   * ============================================================
   * SAVE SEARCH
   * ============================================================
   */

  const handleSaveSearch = () => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    const hasFilters = Object.values(applied).some(
      (value) => String(value).trim() !== ""
    );

    if (!hasFilters) {
      setSaveMessage(
        "Apply at least one filter before saving your search."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);

      return;
    }

    const duplicate = savedSearches.some((item) =>
      filtersAreSame(item.filters, applied)
    );

    if (duplicate) {
      setSaveMessage(
        "This search is already saved."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);

      return;
    }

    const result = addSavedSearch({
      name: getSearchName(),
      filters: {
        ...applied,
      },
      resultCount: filtered.length,
      alerts: true,
    });

    if (result?.success) {
      setSaveMessage(
        "Search saved successfully."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }
  };

  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */

  const handleClearFilters = () => {
    const empty = {
      listingType: "",
      propertyType: "",
      bhk: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      search: "",
    };

    setFilters(empty);
    setApplied(empty);

    navigate("/properties");
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-700 tracking-tight">
          All Properties
        </h1>

        <p className="text-gray-500 mt-1.5">
          {filtered.length} propert
          {filtered.length === 1 ? "y" : "ies"} found
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onSearch={() => setApplied({ ...filters })}
        />
      </div>

      {/* Save Search Bar */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">

        <div className="text-sm text-gray-600">
          {Object.values(applied).some(
            (value) => String(value).trim() !== ""
          ) ? (
            <>
              Save this search to quickly find these properties
              again.
            </>
          ) : (
            <>
              Apply filters to save a personalized property search.
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">

          {saveMessage && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" />
              {saveMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveSearch}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-sm"
          >
            <Bookmark className="w-4 h-4" />
            Save Search
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">

          <p className="text-gray-500 text-lg">
            No properties match your filters.
          </p>

          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 text-purple-600 font-medium hover:text-purple-700 hover:underline transition"
          >
            Clear all filters
          </button>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
            />
          ))}

        </div>
      )}
    </div>
  );
}

