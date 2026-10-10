
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Properties() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/properties");

      setProperties(response.data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);

      if (err.response?.status === 403) {
        setError("You are not authorized to view properties.");
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError("Failed to load properties.");
      }
    } finally {
      setLoading(false);
    }
  };

  // APPROVE PROPERTY
  // Backend endpoint:
  // PATCH /api/properties/{id}/approve
  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this property?"
    );

    if (!confirmed) return;

    try {
      const response = await axiosInstance.patch(
        `/api/properties/${id}/approve`
      );

      // Backend should return the updated property
      // with status = AVAILABLE
      const updatedProperty = response.data;

      setProperties((current) =>
        current.map((property) =>
          property.id === id
            ? {
                ...property,
                ...updatedProperty,
                status: updatedProperty?.status || "AVAILABLE",
              }
            : property
        )
      );

      alert("Property approved successfully.");
    } catch (err) {
      console.error("Error approving property:", err);

      alert(
        err.response?.data?.message ||
          "Failed to approve property. Please try again."
      );
    }
  };

  // DELETE PROPERTY
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/properties/${id}`);

      setProperties((current) =>
        current.filter((property) => property.id !== id)
      );

      alert("Property deleted successfully.");
    } catch (err) {
      console.error("Error deleting property:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete property. Please try again."
      );
    }
  };

  const formatText = (value) => {
    if (!value) return "-";

    return String(value)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getLocationText = (location) => {
    if (!location) return "Location not available";

    const parts = [
      location.address,
      location.area,
      location.city,
      location.state,
      location.country,
      location.pincode,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "Location not available";
  };

  const filteredProperties = properties.filter((property) => {
    const searchValue = search.toLowerCase().trim();

    const locationText = getLocationText(property.location);

    const matchesSearch =
      property.title?.toLowerCase().includes(searchValue) ||
      locationText.toLowerCase().includes(searchValue) ||
      property.sellerName?.toLowerCase().includes(searchValue) ||
      property.propertyType
        ?.toString()
        .toLowerCase()
        .includes(searchValue);

    const propertyStatus = property.status
      ? String(property.status).toUpperCase()
      : "";

    const matchesFilter =
      filter === "All" ||
      propertyStatus === filter.toUpperCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600";

      case "PENDING":
        return "text-yellow-600";

      case "REJECTED":
        return "text-red-600";

      case "SOLD":
        return "text-gray-600";

      case "RENTED":
        return "text-blue-600";

      case "INACTIVE":
        return "text-gray-500";

      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;

      case "REJECTED":
        return <XCircle className="w-4 h-4" />;

      case "AVAILABLE":
        return <CheckCircle className="w-4 h-4" />;

      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Properties
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Review and manage property listings
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {filteredProperties.length} Properties
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search by property, location, seller or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              "All",
              "Pending",
              "Available",
              "Rejected",
              "Sold",
              "Rented",
              "Inactive",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition ${
                  filter === item
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-4">
            Loading properties...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto" />

          <h3 className="font-semibold text-gray-700 mt-3">
            Unable to load properties
          </h3>

          <p className="text-sm text-red-500 mt-1">
            {error}
          </p>

          <button
            onClick={fetchProperties}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Property Cards */}
      {!loading && !error && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredProperties.map((property) => {
            const status = property.status
              ? String(property.status).toUpperCase()
              : "";

            return (
              <div
                key={property.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-5">

                  {/* Top */}
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded">
                      {formatText(property.listingType)}
                    </span>

                    <button
                      onClick={() => handleDelete(property.id)}
                      title="Delete property"
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status */}
                  <div
                    className={`flex items-center gap-1 text-sm font-medium mt-4 ${getStatusStyle(
                      status
                    )}`}
                  >
                    {getStatusIcon(status)}
                    {formatText(status)}
                  </div>

                  {/* Property Title */}
                  <h2 className="text-lg font-bold text-gray-900 mt-2">
                    {property.title}
                  </h2>

                  {/* Location */}
                  <div className="flex items-start gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />

                    <span>
                      {getLocationText(property.location)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-600">

                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      {property.bedrooms ?? 0} Beds
                    </div>

                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms ?? 0} Baths
                    </div>

                    <div className="flex items-center gap-1">
                      <Maximize className="w-4 h-4" />
                      {property.area ?? 0} sqft
                    </div>

                  </div>

                  {/* Property Type */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Property Type
                    </p>

                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {formatText(property.propertyType)}
                    </p>
                  </div>

                  {/* Seller */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Seller
                      </span>

                      <span className="font-medium text-gray-800">
                        {property.sellerName || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-5">
                    <p className="text-xs text-gray-500 uppercase">
                      Property Price
                    </p>

                    <p className="text-xl font-bold text-gray-900 mt-1">
                      ₹{property.price ?? "-"}
                    </p>
                  </div>

                  {/* APPROVE */}
                  {status === "PENDING" && (
                    <div className="mt-5 pt-4 border-t">

                      <button
                        onClick={() => handleApprove(property.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>

                    </div>
                  )}

                  {/* AVAILABLE */}
                  {status === "AVAILABLE" && (
                    <div className="mt-5 pt-4 border-t">
                      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Property Available
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Properties */}
      {!loading &&
        !error &&
        filteredProperties.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">

            <Search className="w-10 h-10 text-gray-300 mx-auto" />

            <h3 className="font-semibold text-gray-700 mt-3">
              No properties found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try changing your search or filter.
            </p>

          </div>
        )}
    </div>
  );
                  }
