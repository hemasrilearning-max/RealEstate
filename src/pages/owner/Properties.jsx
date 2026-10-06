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
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import propertyService from "../../services/propertyService";
import propertyViewService from "../../services/propertyViewService";
import leadService from "../../services/leadService";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85";

export default function OwnerProperties() {
  const navigate = useNavigate();

  const { owner, user } = useAuth();

  const {
    propertyImages,
    getPropertyImage,
  } = useData();

  const [propertiesData, setPropertiesData] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
   * =========================================================
   * EDITING PROPERTY
   * =========================================================
   */
  const [editingPropertyId, setEditingPropertyId] =
    useState(null);

  /*
   * =========================================================
   * DELETE PROPERTY
   * =========================================================
   */
  const [deletePropertyId, setDeletePropertyId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * =========================================================
   * PROPERTY ANALYTICS
   *
   * Stored separately from the property API.
   *
   * {
   *   "1": {
   *      views: 10,
   *      leads: 3
   *   }
   * }
   * =========================================================
   */
  const [propertyCounts, setPropertyCounts] =
    useState({});

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
      /*
       * Active is intentionally not displayed.
       * The property itself is still kept in the list.
       */
      case "AVAILABLE":
      case "APPROVED":
      case "ACTIVE":
        return "";

      case "RENTED":
        return "Rented";

      case "SOLD":
        return "Sold";

      /*
       * Pending is intentionally not displayed.
       */
      case "PENDING":
      case "PENDING_APPROVAL":
        return "";

      case "REJECTED":
        return "Rejected";

      case "INACTIVE":
      case "ARCHIVED":
        return "Inactive";

      default:
        return status || "";
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
   * GET PROPERTY IMAGE
   *
   * Priority:
   *
   * 1. Backend media image
   * 2. Existing local image
   * 3. Fallback image
   * =========================================================
   */

  const getOwnerPropertyImage = (
    propertyId
  ) => {
    const backendImage =
      getPropertyImage?.(propertyId);

    if (backendImage) {
      return backendImage;
    }

    const localImages =
      propertyImages?.[
        String(propertyId)
      ];

    if (
      Array.isArray(localImages) &&
      localImages.length > 0
    ) {
      return localImages[0];
    }

    return FALLBACK_PROPERTY_IMAGE;
  };

  /*
   * =========================================================
   * LOAD VIEW + LEAD COUNTS
   *
   * Both counts come directly from backend APIs.
   * =========================================================
   */

  const loadPropertyCounts = async (
    properties
  ) => {
    if (
      !Array.isArray(properties) ||
      properties.length === 0
    ) {
      setPropertyCounts({});
      return;
    }

    const results =
      await Promise.all(
        properties.map(
          async (property) => {
            const [
              viewResult,
              leadResult,
            ] =
              await Promise.allSettled([
                propertyViewService.getViewCount(
                  property.id
                ),

                leadService.getLeadCount(
                  property.id
                ),
              ]);

            const views =
              viewResult.status ===
              "fulfilled"
                ? Number(
                    viewResult.value || 0
                  )
                : 0;

            const leads =
              leadResult.status ===
              "fulfilled"
                ? Number(
                    leadResult.value || 0
                  )
                : 0;

            if (
              viewResult.status ===
              "rejected"
            ) {
              console.error(
                `Failed to load view count for property ${property.id}:`,
                viewResult.reason
              );
            }

            if (
              leadResult.status ===
              "rejected"
            ) {
              console.error(
                `Failed to load lead count for property ${property.id}:`,
                leadResult.reason
              );
            }

            return {
              id: property.id,
              views: Number.isFinite(
                views
              )
                ? views
                : 0,
              leads: Number.isFinite(
                leads
              )
                ? leads
                : 0,
            };
          }
        )
      );

    const counts = {};

    results.forEach(
      ({
        id,
        views,
        leads,
      }) => {
        counts[String(id)] = {
          views,
          leads,
        };
      }
    );

    setPropertyCounts(counts);
  };

  /*
   * =========================================================
   * BACKEND PROPERTY -> FRONTEND PROPERTY
   * =========================================================
   */

  const mapProperty = (property) => {
    const counts =
      propertyCounts[
        String(property.id)
      ] || {
        views: 0,
        leads: 0,
      };

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
       * Real backend view count.
       */
      views: counts.views,

      /*
       * Real backend lead count.
       */
      leads: counts.leads,

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
        getOwnerPropertyImage(
          property.id
        ),
    };
  };

  /*
   * =========================================================
   * LOAD OWNER PROPERTIES FROM BACKEND
   * =========================================================
   */

  const loadProperties = async () => {
    if (!sellerId) {
      setPropertiesData([]);
      setPropertyCounts({});
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

      /*
       * Load real backend view + lead counts.
       */
      await loadPropertyCounts(
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
      setPropertyCounts({});
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
            setPropertyCounts({});
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

          /*
           * Load backend analytics.
           *
           * Promise.allSettled is used so a failure
           * in one property's analytics does not
           * break the complete property page.
           */
          const results =
            await Promise.all(
              backendProperties.map(
                async (property) => {
                  const [
                    viewResult,
                    leadResult,
                  ] =
                    await Promise.allSettled([
                      propertyViewService.getViewCount(
                        property.id
                      ),

                      leadService.getLeadCount(
                        property.id
                      ),
                    ]);

                  const views =
                    viewResult.status ===
                    "fulfilled"
                      ? Number(
                          viewResult.value || 0
                        )
                      : 0;

                  const leads =
                    leadResult.status ===
                    "fulfilled"
                      ? Number(
                          leadResult.value || 0
                        )
                      : 0;

                  if (
                    viewResult.status ===
                    "rejected"
                  ) {
                    console.error(
                      `Failed to load view count for property ${property.id}:`,
                      viewResult.reason
                    );
                  }

                  if (
                    leadResult.status ===
                    "rejected"
                  ) {
                    console.error(
                      `Failed to load lead count for property ${property.id}:`,
                      leadResult.reason
                    );
                  }

                  return {
                    id: property.id,
                    views:
                      Number.isFinite(
                        views
                      )
                        ? views
                        : 0,
                    leads:
                      Number.isFinite(
                        leads
                      )
                        ? leads
                        : 0,
                  };
                }
              )
            );

          if (!mounted) {
            return;
          }

          const counts = {};

          results.forEach(
            ({
              id,
              views,
              leads,
            }) => {
              counts[String(id)] = {
                views,
                leads,
              };
            }
          );

          setPropertyCounts(
            counts
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
            setPropertyCounts({});
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
   * DELETE PROPERTY
   * =========================================================
   */

  const handleDeleteProperty = async () => {
    if (!deletePropertyId) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await propertyService.deleteProperty(
        deletePropertyId
      );

      setPropertiesData(
        (currentProperties) =>
          currentProperties.filter(
            (property) =>
              property.id !==
              deletePropertyId
          )
      );

      setPropertyCounts(
        (currentCounts) => {
          const updatedCounts = {
            ...currentCounts,
          };

          delete updatedCounts[
            String(deletePropertyId)
          ];

          return updatedCounts;
        }
      );

      setDeletePropertyId(null);
    } catch (err) {
      console.error(
        "Failed to delete property:",
        err
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          err?.message ||
          "Unable to delete the property."
      );
    } finally {
      setDeleting(false);
    }
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
      getPropertyImage,
      propertyCounts,
    ]);

  /*
   * =========================================================
   * SEARCH + STATUS FILTER
   *
   * Active and Pending are intentionally
   * NOT included.
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
      case "Rented":
        return "bg-purple-50 text-purple-700 border border-purple-100";

      case "Sold":
        return "bg-gray-100 text-gray-700 border border-gray-200";

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
    return (
      <CheckCircle className="w-3 h-3" />
    );
  };

  /*
   * =========================================================
   * SAME-PAGE EDIT MODE
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

      {/* HEADER */}

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

      {/* SEARCH + FILTERS */}

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

      {/* LOADING */}

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

      {/* ERROR */}

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

      {/* PROPERTY COUNT + GRID */}

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

                    {/* PROPERTY IMAGE */}

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

                    {/* PROPERTY CONTENT */}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">

                      <div className="space-y-1.5">

                        <div className="flex justify-between items-start gap-2">

                          {property.status ? (
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
                          ) : (
                            <span />
                          )}

                          {/* EDIT + DELETE */}

                          <div className="flex items-center gap-1">

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

                            <button
                              type="button"
                              onClick={() =>
                                setDeletePropertyId(
                                  property.id
                                )
                              }
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                              aria-label={`Delete ${property.title}`}
                              title="Delete Property"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>

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

                      {/* PROPERTY SPECS */}

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

                      {/* PROPERTY VALUE + ANALYTICS */}

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

                          {/* BACKEND VIEW COUNT */}

                          <span
                            className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm"
                            title="Property views"
                          >

                            <Eye className="w-3.5 h-3.5 text-gray-400" />

                            {
                              property.views
                            }

                          </span>

                          {/* BACKEND LEAD COUNT */}

                          <span
                            className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 shadow-sm"
                            title="Buyer leads"
                          >

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

      {/* DELETE CONFIRMATION MODAL */}

      {deletePropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Property?
                </h3>

                <p className="mt-1 text-sm text-gray-500 leading-6">
                  Are you sure you want to delete this
                  property? This action cannot be undone.
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setDeletePropertyId(null)
                }
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteProperty
                }
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Property"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}