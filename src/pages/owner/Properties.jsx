import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import AddProperty from "./AddProperty";

import {
  Plus,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Eye,
  Users,
  MoreVertical,
  CheckCircle,
  Clock,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import propertyService from "../../services/propertyService";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85";

export default function OwnerProperties() {
  const navigate = useNavigate();

  const { owner, user } = useAuth();

  const { propertyImages } = useData();

  const [propertiesData, setPropertiesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
   * =========================================================
   * EDITING PROPERTY
   * =========================================================
   */
  const [editingPropertyId, setEditingPropertyId] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOGGED-IN SELLER / OWNER
   * =========================================================
   */

  const profile = owner || user;

  const sellerId =
    profile?.userId ||
    profile?.id ||
    null;

  /*
   * =========================================================
   * FORMATTING HELPERS
   * =========================================================
   */

  const formatPrice = (
    price,
    listingType
  ) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "₹0";
    }

    if (
      String(listingType || "").toUpperCase() ===
      "RENT"
    ) {
      return `₹${numericPrice.toLocaleString(
        "en-IN"
      )} /mo`;
    }

    if (numericPrice >= 10000000) {
      return `₹${(
        numericPrice / 10000000
      ).toFixed(2)} Cr`;
    }

    if (numericPrice >= 100000) {
      return `₹${(
        numericPrice / 100000
      ).toFixed(2)} L`;
    }

    return `₹${numericPrice.toLocaleString(
      "en-IN"
    )}`;
  };

  const formatStatus = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "AVAILABLE":
      case "APPROVED":
      case "ACTIVE":
        return "Active";

      case "RENTED":
        return "Rented";

      case "SOLD":
        return "Sold";

      case "PENDING":
      case "PENDING_APPROVAL":
        return "Pending";

      case "REJECTED":
        return "Rejected";

      case "INACTIVE":
      case "ARCHIVED":
        return "Inactive";

      default:
        return status || "Unknown";
    }
  };

  const formatListingType = (
    listingType
  ) => {
    return String(listingType || "").toUpperCase() ===
      "RENT"
      ? "Rent"
      : "Sale";
  };

  const formatFurnishing = (
    furnishingStatus
  ) => {
    switch (
      String(
        furnishingStatus || ""
      ).toUpperCase()
    ) {
      case "FURNISHED":
        return "Fully Furnished";

      case "SEMI_FURNISHED":
        return "Semi Furnished";

      case "UNFURNISHED":
        return "Unfurnished";

      default:
        return "";
    }
  };

  const getLocality = (location) => {
    if (!location) {
      return "Location not available";
    }

    const parts = [
      location.area,
      location.city,
      location.state,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return (
      location.address ||
      "Location not available"
    );
  };

  /*
   * =========================================================
   * GET LOCAL PROPERTY IMAGE
   * =========================================================
   */

  const getLocalPropertyImage = (
    propertyId
  ) => {
    const images =
      propertyImages?.[
        String(propertyId)
      ];

    if (
      Array.isArray(images) &&
      images.length > 0
    ) {
      return images[0];
    }

    return FALLBACK_PROPERTY_IMAGE;
  };

  /*
   * =========================================================
   * BACKEND PROPERTY -> FRONTEND PROPERTY
   * =========================================================
   */

  const mapProperty = (property) => {
    return {
      id: property.id,

      title:
        property.title ||
        "Untitled Property",

      locality: getLocality(
        property.location
      ),

      price: formatPrice(
        property.price,
        property.listingType
      ),

      /*
       * Backend PropertyResponse currently does not
       * provide these analytics values.
       */

      views:
        property.views ?? 0,

      leads:
        property.leads ?? 0,

      status: formatStatus(
        property.status
      ),

      type: formatListingType(
        property.listingType
      ),

      specs: {
        beds:
          property.bedrooms ?? 0,

        baths:
          property.bathrooms ?? 0,

        area: property.area
          ? `${Number(
              property.area
            ).toLocaleString(
              "en-IN"
            )} sqft`
          : "0 sqft",
      },

      furnishing:
        formatFurnishing(
          property.furnishingStatus
        ),

      image:
        getLocalPropertyImage(
          property.id
        ),
    };
  };

  /*
   * =========================================================
   * LOAD OWNER PROPERTIES FROM BACKEND
   *
   * This is outside useEffect so that we can call it
   * again after editing a property.
   * =========================================================
   */

  const loadProperties = async () => {
    if (!sellerId) {
      setPropertiesData([]);
      setLoading(false);
      setError(
        "Unable to identify the logged-in owner."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await propertyService.getPropertiesBySeller(
          sellerId
        );

      /*
       * Support:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * and:
       *
       * {
       *   content: [...]
       * }
       */

      const backendProperties =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.content
            )
          ? response.content
          : Array.isArray(
              response?.data
            )
          ? response.data
          : Array.isArray(
              response?.properties
            )
          ? response.properties
          : [];

      setPropertiesData(
        backendProperties
      );
    } catch (err) {
      console.error(
        "Failed to load owner properties:",
        err
      );

      setError(
        err.message ||
          "Unable to load your properties."
      );

      setPropertiesData([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadInitialProperties =
      async () => {
        if (!sellerId) {
          if (mounted) {
            setPropertiesData([]);
            setLoading(false);
            setError(
              "Unable to identify the logged-in owner."
            );
          }

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await propertyService.getPropertiesBySeller(
              sellerId
            );

          if (!mounted) {
            return;
          }

          const backendProperties =
            Array.isArray(response)
              ? response
              : Array.isArray(
                  response?.content
                )
              ? response.content
              : Array.isArray(
                  response?.data
                )
              ? response.data
              : Array.isArray(
                  response?.properties
                )
              ? response.properties
              : [];

          setPropertiesData(
            backendProperties
          );
        } catch (err) {
          console.error(
            "Failed to load owner properties:",
            err
          );

          if (mounted) {
            setError(
              err.message ||
                "Unable to load your properties."
            );

            setPropertiesData([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadInitialProperties();

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  /*
   * =========================================================
   * AFTER PROPERTY IS SAVED
   *
   * AddProperty calls this after a successful update.
   * =========================================================
   */

  const handlePropertySaved =
    async () => {
      setEditingPropertyId(null);

      await loadProperties();
    };

  /*
   * =========================================================
   * CANCEL EDITING
   * =========================================================
   */

  const handleCancelEdit = () => {
    setEditingPropertyId(null);
  };

  /*
   * =========================================================
   * MAP BACKEND DATA FOR DISPLAY
   * =========================================================
   */

  const mappedProperties =
    useMemo(() => {
      return propertiesData.map(
        mapProperty
      );
    }, [
      propertiesData,
      propertyImages,
    ]);

  /*
   * =========================================================
   * SEARCH + STATUS FILTER
   * =========================================================
   */

  const filteredProperties =
    mappedProperties.filter(
      (property) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim();

        const matchesSearch =
          property.title
            .toLowerCase()
            .includes(search) ||
          property.locality
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          statusFilter === "All" ||
          property.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  /*
   * =========================================================
   * STATUS STYLE
   * =========================================================
   */

  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";

      case "Rented":
        return "bg-purple-50 text-purple-700 border border-purple-100";

      case "Sold":
        return "bg-gray-100 text-gray-700 border border-gray-200";

      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-100";

      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-100";

      case "Inactive":
        return "bg-gray-100 text-gray-700 border border-gray-200";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  /*
   * =========================================================
   * STATUS ICON
   * =========================================================
   */

  const getStatusIcon = (
    status
  ) => {
    if (
      status === "Active" ||
      status === "Pending"
    ) {
      return (
        <Clock className="w-3 h-3" />
      );
    }

    return (
      <CheckCircle className="w-3 h-3" />
    );
  };

  /*
   * =========================================================
   * SAME-PAGE EDIT MODE
   *
   * IMPORTANT:
   * We do NOT navigate to:
   *
   * /owner/properties/:id/edit
   *
   * Instead, AddProperty is rendered inside this same
   * Owner Properties route.
   * =========================================================
   */

  if (editingPropertyId) {
    return (
      <AddProperty
        propertyId={
          editingPropertyId
        }
        onCancel={
          handleCancelEdit
        }
        onSaved={
          handlePropertySaved
        }
      />
    );
  }

  /*
   * =========================================================
   * NORMAL OWNER PROPERTIES PAGE
   * =========================================================
   */

  return (
    <div className="space-y-6">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            My Registered Listings
          </h2>

          <p className="text-xs text-gray-500 mt-0.5">
            Review your properties, listing performance, buyer views,
            and leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/owner/add-property"
            )
          }
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </button>

      </div>

      {/* =========================================================
          SEARCH + FILTERS
      ========================================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">

        <div className="relative flex-1 max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <input
            type="text"
            placeholder="Search by locality or property name..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
          />

        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">

          {[
            "All",
            "Active",
            "Rented",
            "Sold",
          ].map((status) => (

            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(
                  status
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter ===
                status
                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>

          ))}

        </div>
      </div>

      {/* =========================================================
          LOADING
      ========================================================== */}

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center shadow-sm">

          <div className="w-8 h-8 mx-auto border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading your properties...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Fetching your registered listings.
          </p>

        </div>
      )}

      {/* =========================================================
          ERROR
      ========================================================== */}

      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl py-12 px-6 text-center shadow-sm">

          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <Search className="w-6 h-6 text-red-400" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-gray-900">
            Unable to load properties
          </h3>

          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadProperties()
            }
            className="mt-4 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Try Again
          </button>

        </div>
      )}

      {/* =========================================================
          PROPERTY COUNT + GRID
      ========================================================== */}

      {!loading && !error && (
        <>

          <div className="flex items-center justify-between">

            <p className="text-xs text-gray-500">

              Showing{" "}

              <span className="font-bold text-gray-800">
                {
                  filteredProperties.length
                }
              </span>{" "}

              {filteredProperties.length ===
              1
                ? "property"
                : "properties"}

            </p>

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear Search
              </button>
            )}

          </div>

          {filteredProperties.length >
          0 ? (

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {filteredProperties.map(
                (property) => (

                  <div
                    key={property.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition group"
                  >

                    {/* =================================================
                        PROPERTY IMAGE
                    ================================================== */}

                    <div className="relative w-full sm:w-48 h-52 sm:h-auto sm:min-h-[230px] shrink-0 bg-gray-100 overflow-hidden">

                      <img
                        src={
                          property.image ||
                          FALLBACK_PROPERTY_IMAGE
                        }
                        alt={
                          property.title
                        }
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            FALLBACK_PROPERTY_IMAGE;
                        }}
                      />

                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-white shadow-sm z-10 ${
                          property.type ===
                          "Sale"
                            ? "bg-blue-600"
                            : "bg-purple-600"
                        }`}
                      >
                        For{" "}
                        {
                          property.type
                        }
                      </span>

                    </div>

                    {/* =================================================
                        PROPERTY CONTENT
                    ================================================== */}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">

                      <div className="space-y-1.5">

                        <div className="flex justify-between items-start gap-2">

                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusStyle(
                              property.status
                            )}`}
                          >

                            {getStatusIcon(
                              property.status
                            )}

                            {
                              property.status
                            }

                          </span>

                          {/* =================================================
                              EDIT BUTTON
                          ================================================== */}

                          <button
                            type="button"
                            onClick={() =>
                              setEditingPropertyId(
                                property.id
                              )
                            }
                            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors"
                            aria-label={`Edit ${property.title}`}
                            title="Edit Property"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                        </div>

                        <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
                          {
                            property.title
                          }
                        </h4>

                        <p className="text-xs text-gray-400 flex items-center gap-1 font-medium truncate">

                          <MapPin className="w-3 h-3 shrink-0" />

                          {
                            property.locality
                          }

                        </p>

                      </div>

                      {/* =================================================
                          PROPERTY SPECS
                      ================================================== */}

                      <div className="flex items-center gap-3 text-gray-500 text-xs border-y border-gray-100 py-2 overflow-hidden">

                        <span className="flex items-center gap-1 font-medium whitespace-nowrap">

                          <BedDouble className="w-3.5 h-3.5 text-gray-400" />

                          {
                            property
                              .specs
                              .beds
                          }{" "}
                          BHK

                        </span>

                        <span className="flex items-center gap-1 font-medium whitespace-nowrap">

                          <Bath className="w-3.5 h-3.5 text-gray-400" />

                          {
                            property
                              .specs
                              .baths
                          }{" "}
                          Bath

                        </span>

                        <span className="flex items-center gap-1 font-medium whitespace-nowrap">

                          <Square className="w-3.5 h-3.5 text-gray-400" />

                          {
                            property
                              .specs
                              .area
                          }

                        </span>

                      </div>

                      {/* =================================================
                          PROPERTY VALUE + ANALYTICS
                      ================================================== */}

                      <div className="flex items-end justify-between gap-3 pt-1">

                        <div className="min-w-0">

                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Property Value
                          </p>

                          <p className="text-sm font-extrabold text-slate-900 truncate">
                            {
                              property.price
                            }
                          </p>

                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">

                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm">

                            <Eye className="w-3.5 h-3.5 text-gray-400" />

                            {
                              property.views
                            }

                          </span>

                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm">

                            <Users className="w-3.5 h-3.5 text-gray-400" />

                            {
                              property.leads
                            }

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center shadow-sm">

              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">

                <Search className="w-6 h-6 text-gray-400" />

              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-900">
                No properties found
              </h3>

              <p className="mt-1 text-xs text-gray-500">

                {propertiesData.length ===
                0
                  ? "You have not registered any properties yet."
                  : "Try changing your search or status filter."}

              </p>

              {propertiesData.length ===
              0 ? (

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/add-property"
                    )
                  }
                  className="mt-4 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                >

                  <Plus className="w-3.5 h-3.5" />

                  Add New Property

                </button>

              ) : (

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter(
                      "All"
                    );
                  }}
                  className="mt-4 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Reset Filters
                </button>

              )}

            </div>

          )}

        </>
      )}

    </div>
  );
}

