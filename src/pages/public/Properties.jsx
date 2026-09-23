import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import PropertyCard from "../../components/PropertyCard";
import FilterBar from "../../components/FilterBar";

export default function Properties() {
  const { properties } = useData();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    listingType: searchParams.get("listingType") || "",
    propertyType: searchParams.get("propertyType") || "",
    bhk: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    search: searchParams.get("search") || "",
  });

  const [applied, setApplied] = useState(filters);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      listingType: searchParams.get("listingType") || prev.listingType,
      propertyType: searchParams.get("propertyType") || prev.propertyType,
      search: searchParams.get("search") || prev.search,
    }));
    setApplied((prev) => ({
      ...prev,
      listingType: searchParams.get("listingType") || prev.listingType,
      propertyType: searchParams.get("propertyType") || prev.propertyType,
      search: searchParams.get("search") || prev.search,
    }));
  }, [searchParams]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (applied.listingType && p.listingType !== applied.listingType)
        return false;
      if (applied.propertyType && p.propertyType !== applied.propertyType)
        return false;
      if (applied.bhk && p.bhk !== applied.bhk) return false;
      if (applied.status && p.status !== applied.status) return false;
      if (applied.minPrice && p.price < Number(applied.minPrice)) return false;
      if (applied.maxPrice && p.price > Number(applied.maxPrice)) return false;
      if (
        applied.city &&
        !p.city?.toLowerCase().includes(applied.city.toLowerCase())
      )
        return false;
      if (applied.search) {
        const q = applied.search.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.locality?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [properties, applied]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header – matching Login purple */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-700 tracking-tight">
          All Properties
        </h1>
        <p className="text-gray-500 mt-1.5">
          {filtered.length} propert{filtered.length === 1 ? "y" : "ies"} found
        </p>
      </div>

      <div className="mb-6">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onSearch={() => setApplied({ ...filters })}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            No properties match your filters.
          </p>
          <button
            onClick={() => {
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
            }}
            className="mt-4 text-purple-600 font-medium hover:text-purple-700 hover:underline transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}