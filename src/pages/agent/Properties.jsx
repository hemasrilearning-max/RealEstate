
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Search,
    RefreshCw,
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Building2,
    ChevronDown,
    X,
    Loader2,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

// ======================================================
// DEFAULT IMAGE
// ======================================================

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

// ======================================================
// PRICE FORMATTER
// ======================================================

const formatPrice = (price, listingType) => {
    const value = Number(price || 0);

    if (!value) {
        return "₹0";
    }

    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }

    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(1)} K`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
};

// ======================================================
// NORMALIZE ENUM VALUES
// ======================================================

const formatEnum = (value) => {
    if (!value) {
        return "-";
    }

    return value
        .toString()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ======================================================
// STATUS STYLE
// ======================================================

const getStatusStyle = (status) => {
    const normalized = status?.toString().toUpperCase();

    switch (normalized) {
        case "AVAILABLE":
        case "APPROVED":
        case "ACTIVE":
            return "bg-green-50 text-green-700 border-green-200";

        case "PENDING":
        case "PENDING_APPROVAL":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "BOOKED":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "SOLD":
        case "CLOSED":
            return "bg-gray-100 text-gray-700 border-gray-200";

        case "RENTED":
            return "bg-purple-50 text-purple-700 border-purple-200";

        default:
            return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

// ======================================================
// PROPERTY TYPE STYLE
// ======================================================

const getPropertyTypeIcon = (propertyType) => {
    const type = propertyType?.toString().toUpperCase();

    if (type === "PLOT") {
        return "🌳";
    }

    if (type === "VILLA") {
        return "🏡";
    }

    if (type === "HOUSE") {
        return "🏠";
    }

    return "🏢";
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AgentProperties() {

    const { agent } = useAuth();

    // ==================================================
    // STATE
    // ==================================================

    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [propertyTypeFilter, setPropertyTypeFilter] = useState("ALL");

    const [listingTypeFilter, setListingTypeFilter] = useState("ALL");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showFilters, setShowFilters] = useState(false);

    const [selectedProperty, setSelectedProperty] = useState(null);

    // ==================================================
    // GET CURRENT BROKER ID
    // ==================================================

    const getBrokerId = () => {

        // First try AuthContext
        if (agent?.id) {
            return agent.id;
        }

        if (agent?.userId) {
            return agent.userId;
        }

        // Fallback to localStorage
        try {

            const storedUser =
                localStorage.getItem("authUser");

            if (!storedUser) {
                return null;
            }

            const user = JSON.parse(storedUser);

            return user?.id || user?.userId || null;

        } catch (err) {

            console.error(
                "Unable to read logged-in user:",
                err
            );

            return null;
        }
    };

    // ==================================================
    // LOAD PROPERTIES FROM DATABASE
    // ==================================================

    const loadProperties = async (showRefreshLoader = false) => {

        setError("");

        const brokerId = getBrokerId();

        if (!brokerId) {

            setError(
                "Broker information is not available. Please login again."
            );

            setLoading(false);

            return;
        }

        if (showRefreshLoader) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {

            console.log(
                "Loading properties for broker:",
                brokerId
            );

            const response =
                await brokerService.brokerProperties(
                    brokerId
                );

            console.log(
                "Broker properties API response:",
                response
            );

            /*
             * Expected backend response:
             *
             * {
             *   success: true,
             *   message: "...",
             *   data: [...]
             * }
             */

            const propertyData =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            setProperties(propertyData);

        } catch (err) {

            console.error(
                "Failed to load broker properties:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to load properties.";

            setError(message);

            setProperties([]);

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };

    // ==================================================
    // LOAD WHEN PAGE OPENS
    // ==================================================

    useEffect(() => {

        loadProperties();

    }, [agent?.id, agent?.userId]);

    // ==================================================
    // FILTER PROPERTIES
    // ==================================================

    const filteredProperties = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return properties.filter((property) => {

            const title =
                property?.title?.toLowerCase() || "";

            const description =
                property?.description?.toLowerCase() || "";

            const propertyType =
                property?.propertyType
                    ?.toString()
                    .toUpperCase() || "";

            const listingType =
                property?.listingType
                    ?.toString()
                    .toUpperCase() || "";

            const status =
                property?.status
                    ?.toString()
                    .toUpperCase() || "";

            const location =
                property?.location?.toString().toLowerCase() ||
                "";

            // Search
            const matchesSearch =
                !searchValue ||
                title.includes(searchValue) ||
                description.includes(searchValue) ||
                location.includes(searchValue) ||
                propertyType
                    .toLowerCase()
                    .includes(searchValue);

            // Property type
            const matchesPropertyType =
                propertyTypeFilter === "ALL" ||
                propertyType === propertyTypeFilter;

            // Listing type
            const matchesListingType =
                listingTypeFilter === "ALL" ||
                listingType === listingTypeFilter;

            // Status
            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesPropertyType &&
                matchesListingType &&
                matchesStatus
            );
        });

    }, [
        properties,
        search,
        propertyTypeFilter,
        listingTypeFilter,
        statusFilter,
    ]);

    // ==================================================
    // STATISTICS
    // ==================================================

    const totalValue = useMemo(() => {

        return properties.reduce(
            (total, property) =>
                total + Number(property?.price || 0),
            0
        );

    }, [properties]);

    const availableCount = useMemo(() => {

        return properties.filter((property) => {

            const status =
                property?.status
                    ?.toString()
                    .toUpperCase();

            return (
                status === "AVAILABLE" ||
                status === "APPROVED" ||
                status === "ACTIVE"
            );

        }).length;

    }, [properties]);

    const pendingCount = useMemo(() => {

        return properties.filter((property) => {

            const status =
                property?.status
                    ?.toString()
                    .toUpperCase();

            return (
                status === "PENDING" ||
                status === "PENDING_APPROVAL"
            );

        }).length;

    }, [properties]);

    // ==================================================
    // DELETE PROPERTY
    // ==================================================

    const handleDelete = async (propertyId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this property?"
            );

        if (!confirmed) {
            return;
        }

        /*
         * DELETE API can be added once the backend
         * delete endpoint is connected in brokerService.
         *
         * For now we don't modify the DB accidentally.
         */

        console.log(
            "Delete property requested:",
            propertyId
        );

        alert(
            "Delete API is ready to be connected. The property was not deleted."
        );
    };

    // ==================================================
    // EDIT PROPERTY
    // ==================================================

    const handleEdit = (property) => {

        setSelectedProperty(property);

    };

    // ==================================================
    // LOADING STATE
    // ==================================================

    if (loading) {

        return (
            <div className="min-h-[500px] flex items-center justify-center">

                <div className="text-center">

                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">

                        <Loader2
                            className="w-7 h-7 text-purple-700 animate-spin"
                        />

                    </div>

                    <h3 className="text-gray-900 font-semibold">
                        Loading properties...
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        Fetching your properties from the database
                    </p>

                </div>

            </div>
        );
    }

    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="space-y-6 pb-10">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">

                            <Building2
                                className="w-6 h-6 text-purple-700"
                            />

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold text-gray-900">
                                My Properties
                            </h2>

                            <p className="text-sm text-gray-500 mt-0.5">
                                Manage properties listed under your broker account
                            </p>

                        </div>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => loadProperties(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                    >

                        <RefreshCw
                            className={`w-4 h-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Refresh

                    </button>

                    {/* <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white rounded-xl text-sm font-semibold hover:bg-purple-800 shadow-sm transition"
                    >

                        <Plus className="w-4 h-4" />

                        Add Property

                    </button> */}

                </div>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">

                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

                    <div className="flex-1">

                        <p className="font-semibold text-red-800">
                            Unable to load properties
                        </p>

                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() => loadProperties()}
                        className="text-sm font-medium text-red-700 hover:text-red-900"
                    >
                        Try Again
                    </button>

                </div>

            )}

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* Total */}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Total Properties
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {properties.length}
                            </h3>

                        </div>

                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">

                            <Building2 className="w-5 h-5 text-purple-700" />

                        </div>

                    </div>

                </div>

                {/* Available */}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Available
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {availableCount}
                            </h3>

                        </div>

                        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">

                            <Eye className="w-5 h-5 text-green-700" />

                        </div>

                    </div>

                </div>

                {/* Pending */}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Pending
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {pendingCount}
                            </h3>

                        </div>

                        <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">

                            <Loader2 className="w-5 h-5 text-amber-700" />

                        </div>

                    </div>

                </div>

                {/* Value */}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Portfolio Value
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {formatPrice(totalValue)}
                            </h3>

                        </div>

                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            ₹
                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================================
                SEARCH + FILTERS
            ================================================== */}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">

                <div className="flex flex-col lg:flex-row gap-3">

                    {/* Search */}

                    <div className="relative flex-1">

                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by title, location or property type..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />

                    </div>

                    {/* Filter Button */}

                    <button
                        type="button"
                        onClick={() =>
                            setShowFilters(!showFilters)
                        }
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                            showFilters
                                ? "bg-purple-50 border-purple-200 text-purple-700"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                    >

                        <ChevronDown
                            className={`w-4 h-4 transition ${
                                showFilters
                                    ? "rotate-180"
                                    : ""
                            }`}
                        />

                        Filters

                    </button>

                </div>

                {/* Filters */}

                {showFilters && (

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">

                        {/* Property Type */}

                        <select
                            value={propertyTypeFilter}
                            onChange={(e) =>
                                setPropertyTypeFilter(
                                    e.target.value
                                )
                            }
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >

                            <option value="ALL">
                                All Property Types
                            </option>

                            <option value="FLAT">
                                Flat
                            </option>

                            <option value="APARTMENT">
                                Apartment
                            </option>

                            <option value="VILLA">
                                Villa
                            </option>

                            <option value="HOUSE">
                                House
                            </option>

                            <option value="PLOT">
                                Plot
                            </option>

                        </select>

                        {/* Listing Type */}

                        <select
                            value={listingTypeFilter}
                            onChange={(e) =>
                                setListingTypeFilter(
                                    e.target.value
                                )
                            }
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >

                            <option value="ALL">
                                All Listing Types
                            </option>

                            <option value="SALE">
                                Sale
                            </option>

                            <option value="RENT">
                                Rent
                            </option>

                        </select>

                        {/* Status */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >

                            <option value="ALL">
                                All Statuses
                            </option>

                            <option value="AVAILABLE">
                                Available
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="APPROVED">
                                Approved
                            </option>

                            <option value="BOOKED">
                                Booked
                            </option>

                            <option value="SOLD">
                                Sold
                            </option>

                            <option value="RENTED">
                                Rented
                            </option>

                        </select>

                    </div>
                )}

            </div>

            {/* ==================================================
                RESULTS HEADER
            ================================================== */}

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-gray-500">

                        Showing{" "}

                        <span className="font-semibold text-gray-800">
                            {filteredProperties.length}
                        </span>{" "}

                        of{" "}

                        <span className="font-semibold text-gray-800">
                            {properties.length}
                        </span>{" "}

                        properties

                    </p>

                </div>

                {(search ||
                    propertyTypeFilter !== "ALL" ||
                    listingTypeFilter !== "ALL" ||
                    statusFilter !== "ALL") && (

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setPropertyTypeFilter("ALL");
                            setListingTypeFilter("ALL");
                            setStatusFilter("ALL");
                        }}
                        className="inline-flex items-center gap-1.5 text-sm text-purple-700 hover:text-purple-900 font-medium"
                    >

                        <X className="w-4 h-4" />

                        Clear Filters

                    </button>
                )}

            </div>

            {/* ==================================================
                PROPERTY LIST
            ================================================== */}

            {filteredProperties.length === 0 ? (

                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">

                        <Building2
                            className="w-8 h-8 text-purple-600"
                        />

                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                        No properties found
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">

                        {properties.length === 0
                            ? "You don't have any properties listed yet."
                            : "Try changing your search or filters."}

                    </p>

                    {properties.length === 0 && (

                        <button
                            type="button"
                            className="mt-5 inline-flex items-center gap-2 bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-800"
                        >

                            <Plus className="w-4 h-4" />

                            Add Your First Property

                        </button>

                    )}

                </div>

            ) : (

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead>

                                <tr className="bg-gray-50 border-b border-gray-200">

                                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Property
                                    </th>

                                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>

                                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>

                                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>

                                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>

                                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {filteredProperties.map(
                                    (property) => {

                                        const image =
                                            property?.images?.[0] ||
                                            property?.imageUrl ||
                                            DEFAULT_IMAGE;

                                        return (

                                            <tr
                                                key={property.id}
                                                className="hover:bg-purple-50/30 transition"
                                            >

                                                {/* PROPERTY */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-4">

                                                        <div className="relative flex-shrink-0">

                                                            <img
                                                                src={image}
                                                                alt={
                                                                    property.title ||
                                                                    "Property"
                                                                }
                                                                className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.src =
                                                                        DEFAULT_IMAGE;
                                                                }}
                                                            />

                                                            <span className="absolute -top-2 -left-2 w-7 h-7 rounded-lg bg-white shadow flex items-center justify-center text-sm">
                                                                {getPropertyTypeIcon(
                                                                    property.propertyType
                                                                )}
                                                            </span>

                                                        </div>

                                                        <div className="min-w-0">

                                                            <h3 className="font-semibold text-gray-900 truncate max-w-[300px]">

                                                                {property.title ||
                                                                    "Untitled Property"}

                                                            </h3>

                                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">

                                                                <MapPin className="w-3.5 h-3.5" />

                                                                <span className="truncate max-w-[270px]">

                                                                    {property.location ||
                                                                        "Location not available"}

                                                                </span>

                                                            </div>

                                                            <p className="text-xs text-gray-400 mt-1">

                                                                Property ID: #

                                                                {property.id}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* TYPE */}

                                                <td className="px-4 py-4">

                                                    <div>

                                                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">

                                                            {formatEnum(
                                                                property.propertyType
                                                            )}

                                                        </span>

                                                        <p className="text-xs text-gray-500 mt-1.5">

                                                            {formatEnum(
                                                                property.listingType
                                                            )}

                                                        </p>

                                                    </div>

                                                </td>

                                                {/* PRICE */}

                                                <td className="px-4 py-4">

                                                    <p className="font-bold text-gray-900">

                                                        {formatPrice(
                                                            property.price,
                                                            property.listingType
                                                        )}

                                                    </p>

                                                    {property.listingType
                                                        ?.toString()
                                                        .toUpperCase() ===
                                                        "RENT" && (

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            per month
                                                        </p>

                                                    )}

                                                </td>

                                                {/* DETAILS */}

                                                <td className="px-4 py-4">

                                                    <div className="space-y-1.5">

                                                        <div className="flex items-center gap-3 text-xs text-gray-600">

                                                            <span className="inline-flex items-center gap-1">

                                                                <BedDouble className="w-3.5 h-3.5 text-gray-400" />

                                                                {property.bedrooms ??
                                                                    0}{" "}
                                                                Beds

                                                            </span>

                                                            <span className="inline-flex items-center gap-1">

                                                                <Bath className="w-3.5 h-3.5 text-gray-400" />

                                                                {property.bathrooms ??
                                                                    0}{" "}
                                                                Baths

                                                            </span>

                                                        </div>

                                                        <div className="flex items-center gap-1 text-xs text-gray-500">

                                                            <Maximize className="w-3.5 h-3.5 text-gray-400" />

                                                            {property.area ??
                                                                "-"}{" "}
                                                            sqft

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-4 py-4">

                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                                                            property.status
                                                        )}`}
                                                    >

                                                        {formatEnum(
                                                            property.status
                                                        )}

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end items-center gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedProperty(
                                                                    property
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition"
                                                            title="View Property"
                                                        >

                                                            <Eye className="w-4 h-4" />

                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    property
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition"
                                                            title="Edit Property"
                                                        >

                                                            <Pencil className="w-4 h-4" />

                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    property.id
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition"
                                                            title="Delete Property"
                                                        >

                                                            <Trash2 className="w-4 h-4" />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

            {/* ==================================================
                VIEW PROPERTY MODAL
            ================================================== */}

            {selectedProperty && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() =>
                            setSelectedProperty(null)
                        }
                    />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">

                            <div>

                                <h3 className="font-bold text-lg text-gray-900">
                                    Property Details
                                </h3>

                                <p className="text-xs text-gray-500 mt-0.5">
                                    Property #{selectedProperty.id}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedProperty(null)
                                }
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >

                                <X className="w-5 h-5 text-gray-500" />

                            </button>

                        </div>

                        {/* IMAGE */}

                        <div className="p-6">

                            <img
                                src={
                                    selectedProperty?.images?.[0] ||
                                    DEFAULT_IMAGE
                                }
                                alt={
                                    selectedProperty.title ||
                                    "Property"
                                }
                                className="w-full h-64 object-cover rounded-2xl"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        DEFAULT_IMAGE;
                                }}
                            />

                            <div className="mt-5">

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <h2 className="text-xl font-bold text-gray-900">

                                            {selectedProperty.title}

                                        </h2>

                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">

                                            <MapPin className="w-4 h-4" />

                                            {selectedProperty.location ||
                                                "Location not available"}

                                        </div>

                                    </div>

                                    <span
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                                            selectedProperty.status
                                        )}`}
                                    >

                                        {formatEnum(
                                            selectedProperty.status
                                        )}

                                    </span>

                                </div>

                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">

                                    <div className="bg-gray-50 rounded-xl p-3">

                                        <p className="text-xs text-gray-500">
                                            Price
                                        </p>

                                        <p className="font-bold text-gray-900 mt-1">
                                            {formatPrice(
                                                selectedProperty.price
                                            )}
                                        </p>

                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3">

                                        <p className="text-xs text-gray-500">
                                            Type
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {formatEnum(
                                                selectedProperty.propertyType
                                            )}
                                        </p>

                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3">

                                        <p className="text-xs text-gray-500">
                                            Bedrooms
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {selectedProperty.bedrooms ??
                                                "-"}
                                        </p>

                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3">

                                        <p className="text-xs text-gray-500">
                                            Area
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {selectedProperty.area ??
                                                "-"}{" "}
                                            sqft
                                        </p>

                                    </div>

                                </div>

                                {selectedProperty.description && (

                                    <div className="mt-5">

                                        <h4 className="font-semibold text-gray-900">
                                            Description
                                        </h4>

                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            {
                                                selectedProperty.description
                                            }
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

