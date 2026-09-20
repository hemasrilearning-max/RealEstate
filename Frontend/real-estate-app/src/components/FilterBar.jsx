import {
  PROPERTY_TYPES,
  BHK_OPTIONS,
  STATUS_OPTIONS,
  LISTING_TYPES,
} from "../data/mockData";

export default function FilterBar({ filters, setFilters, onSearch }) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => {
    setFilters({
      listingType: "",
      propertyType: "",
      bhk: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      search: "",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Location, title..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Buy / Rent
          </label>
          <select
            value={filters.listingType}
            onChange={(e) => update("listingType", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          >
            <option value="">All</option>
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* BHK */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            BHK
          </label>
          <select
            value={filters.bhk}
            onChange={(e) => update("bhk", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          >
            <option value="">Any</option>
            {BHK_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          >
            <option value="">Any</option>
            {STATUS_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Min Price (₹)
          </label>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Max Price (₹)
          </label>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="e.g. Bangalore"
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            onClick={onSearch}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition text-sm"
          >
            Search
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}