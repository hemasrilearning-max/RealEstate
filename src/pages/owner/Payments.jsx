import React, { useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const BROKER_COMMISSION_RATE = 0.02;

export default function OwnerPayments() {
  const { properties = [] } = useData();
  const { user } = useAuth();

  const currentUserId = getUserId(user);

  /*
   * Get only properties belonging to the logged-in owner.
   */
  const ownerProperties = useMemo(() => {
    if (!Array.isArray(properties)) {
      return [];
    }

    return properties.filter((property) => {
      const ownerId =
        getPropertyOwnerId(property);

      if (
        ownerId === null ||
        currentUserId === null
      ) {
        return false;
      }

      return (
        String(ownerId) ===
        String(currentUserId)
      );
    });
  }, [properties, currentUserId]);

  /*
   * Total value of the owner's current listings.
   */
  const portfolioValue = useMemo(() => {
    return ownerProperties.reduce(
      (total, property) =>
        total + getNumericPrice(property),
      0
    );
  }, [ownerProperties]);

  /*
   * Active / available owner listings.
   */
  const activeListings = useMemo(() => {
    return ownerProperties.filter(
      (property) => {
        const status =
          normalizeStatus(
            property.status
          );

        return [
          "ACTIVE",
          "AVAILABLE",
          "PUBLISHED",
          "LISTED",
        ].includes(status);
      }
    ).length;
  }, [ownerProperties]);

  /*
   * Rental listings.
   */
  const rentalListings = useMemo(() => {
    return ownerProperties.filter(
      (property) =>
        normalizeListingType(
          property
        ) === "RENT"
    ).length;
  }, [ownerProperties]);

  /*
   * Sale listings.
   */
  const saleListings = useMemo(() => {
    return ownerProperties.filter(
      (property) =>
        normalizeListingType(
          property
        ) === "SALE"
    ).length;
  }, [ownerProperties]);

  /*
   * ============================================================
   * COMPLETED SALES
   * ============================================================
   *
   * Revenue is calculated only from SOLD properties.
   */
  const soldProperties = useMemo(() => {
    return ownerProperties.filter(
      (property) =>
        normalizeStatus(
          property.status
        ) === "SOLD"
    );
  }, [ownerProperties]);

  /*
   * ============================================================
   * GROSS REVENUE
   * ============================================================
   *
   * Total sale value before broker commission.
   */
  const grossRevenue = useMemo(() => {
    return soldProperties.reduce(
      (total, property) =>
        total +
        getNumericPrice(property),
      0
    );
  }, [soldProperties]);

  /*
   * ============================================================
   * BROKER COMMISSION
   * ============================================================
   *
   * Broker gets 2% only when a broker is assigned
   * to the sold property.
   */
  const brokerCommission = useMemo(() => {
    return soldProperties.reduce(
      (total, property) => {
        const saleAmount =
          getNumericPrice(property);

        const hasBroker =
          isBrokerAssigned(property);

        if (
          !hasBroker ||
          saleAmount <= 0
        ) {
          return total;
        }

        return (
          total +
          saleAmount *
            BROKER_COMMISSION_RATE
        );
      },
      0
    );
  }, [soldProperties]);

  /*
   * ============================================================
   * OWNER NET REVENUE
   * ============================================================
   *
   * Gross sold amount - broker commission.
   */
  const netRevenue =
    grossRevenue -
    brokerCommission;

  /*
   * Number of sold properties that used a broker.
   */
  const brokerAssistedSales = useMemo(() => {
    return soldProperties.filter(
      (property) =>
        isBrokerAssigned(property)
    ).length;
  }, [soldProperties]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">

      {/* ========================================================
          TITLE
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Payments & Ledgers
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Review your property sales, broker commissions,
            and net revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors self-start"
        >
          📥 Export Account Statement
        </button>
      </div>

      {/* ========================================================
          REVENUE SUMMARY
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">

        {/* Gross Revenue */}
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Gross Revenue
          </span>

          <p className="text-2xl font-black text-gray-900 mt-1">
            {formatCurrency(
              grossRevenue
            )}
          </p>

          <p className="text-[11px] text-gray-400 mt-1">
            Total value of completed sales
          </p>
        </div>

        {/* Broker Commission */}
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Broker Commission
          </span>

          <p className="text-2xl font-black text-rose-600 mt-1">
            -{formatCurrency(
              brokerCommission
            )}
          </p>

          <p className="text-[11px] text-gray-400 mt-1">
            2% on broker-assisted sales
          </p>
        </div>

        {/* Net Revenue */}
        <div className="bg-gray-50/50 p-4 border border-emerald-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Net Revenue
          </span>

          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatCurrency(
              netRevenue
            )}
          </p>

          <p className="text-[11px] text-gray-400 mt-1">
            Revenue after broker commission
          </p>
        </div>

        {/* Completed Sales */}
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Completed Sales
          </span>

          <p className="text-2xl font-black text-blue-600 mt-1">
            {soldProperties.length}
          </p>

          <p className="text-[11px] text-gray-400 mt-1">
            Sold owner properties
          </p>
        </div>

        {/* Broker Sales */}
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Broker Sales
          </span>

          <p className="text-2xl font-black text-purple-600 mt-1">
            {brokerAssistedSales}
          </p>

          <p className="text-[11px] text-gray-400 mt-1">
            Sales with assigned broker
          </p>
        </div>
      </div>

      {/* ========================================================
          INFORMATION
      ======================================================== */}
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

        <p className="text-sm font-semibold text-blue-700">
          Revenue calculation
        </p>

        <p className="text-xs text-blue-600 mt-1 leading-5">
          Net revenue is calculated from completed SOLD
          properties. Properties with an assigned broker have
          2% broker commission deducted from the sale amount.
          Properties without a broker have no commission deduction.
        </p>

      </div>

      {/* ========================================================
          PROPERTY LEDGER
      ======================================================== */}
      <div className="overflow-x-auto mt-6">

        <table className="w-full text-left border-collapse">

          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">

              <th className="pb-3 pl-4">
                Property / Asset
              </th>

              <th className="pb-3">
                Listing
              </th>

              <th className="pb-3">
                Property Type
              </th>

              <th className="pb-3">
                Location
              </th>

              <th className="pb-3">
                Sale Amount
              </th>

              <th className="pb-3">
                Broker
              </th>

              <th className="pb-3">
                Commission
              </th>

              <th className="pb-3">
                Net Revenue
              </th>

              <th className="pb-3">
                Status
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">

            {ownerProperties.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">

                    <div className="text-3xl mb-3">
                      🏠
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No owner properties found
                    </p>

                    <p className="text-xs text-gray-400 mt-1 max-w-md leading-5">
                      No properties currently linked to the
                      logged-in owner were found in the existing
                      property data.
                    </p>

                  </div>
                </td>
              </tr>
            ) : (
              ownerProperties.map(
                (property) => {

                  const listingType =
                    normalizeListingType(
                      property
                    );

                  const status =
                    formatPropertyStatus(
                      property.status
                    );

                  const propertyTitle =
                    property.title ||
                    property.name ||
                    "Untitled Property";

                  const propertyType =
                    property.propertyType ||
                    "Property";

                  const location =
                    getPropertyLocation(
                      property
                    );

                  const price =
                    getNumericPrice(
                      property
                    );

                  const propertyId =
                    property.id ||
                    property.propertyId;

                  const hasBroker =
                    isBrokerAssigned(
                      property
                    );

                  const isSold =
                    normalizeStatus(
                      property.status
                    ) === "SOLD";

                  const commission =
                    isSold &&
                    hasBroker
                      ? price *
                        BROKER_COMMISSION_RATE
                      : 0;

                  const propertyNetRevenue =
                    isSold
                      ? price -
                        commission
                      : 0;

                  const brokerName =
                    getBrokerName(
                      property
                    );

                  return (
                    <tr
                      key={
                        propertyId ||
                        propertyTitle
                      }
                      className="hover:bg-gray-50/30 transition-colors"
                    >

                      {/* Property */}
                      <td className="py-4 pl-4">

                        <div className="font-bold text-gray-900">
                          {propertyTitle}
                        </div>

                        {propertyId && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Property #{propertyId}
                          </div>
                        )}

                      </td>

                      {/* Listing */}
                      <td className="py-4">

                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                            listingType === "RENT"
                              ? "bg-purple-50 text-purple-600 border-purple-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          {listingType ===
                          "RENT"
                            ? "Rental"
                            : "Sale"}
                        </span>

                      </td>

                      {/* Property Type */}
                      <td className="py-4 text-gray-700 font-medium">
                        {propertyType}
                      </td>

                      {/* Location */}
                      <td className="py-4 text-gray-500">

                        <div className="max-w-[220px] truncate">
                          {location}
                        </div>

                      </td>

                      {/* Sale Amount */}
                      <td className="py-4 font-bold text-gray-900">

                        {isSold
                          ? formatCurrency(
                              price
                            )
                          : "—"}

                        {!isSold &&
                          listingType ===
                            "RENT" && (
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                              Listed rental value
                            </div>
                          )}

                      </td>

                      {/* Broker */}
                      <td className="py-4">

                        {hasBroker ? (
                          <div>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-purple-50 text-purple-600 border-purple-200">
                              {brokerName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No broker
                          </span>
                        )}

                      </td>

                      {/* Commission */}
                      <td className="py-4">

                        {isSold &&
                        hasBroker ? (
                          <div>
                            <span className="font-bold text-rose-600">
                              -{formatCurrency(
                                commission
                              )}
                            </span>

                            <div className="text-[10px] text-gray-400 mt-0.5">
                              2%
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* Net Revenue */}
                      <td className="py-4">

                        {isSold ? (
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(
                              propertyNetRevenue
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* Status */}
                      <td className="py-4">

                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   USER HELPERS
============================================================ */

function getUserId(user) {
  if (!user) {
    return null;
  }

  return (
    user.userId ??
    user.id ??
    user.user?.userId ??
    user.user?.id ??
    null
  );
}

/* ============================================================
   PROPERTY OWNER HELPERS
============================================================ */

function getPropertyOwnerId(property) {
  if (!property) {
    return null;
  }

  return (
    property.sellerId ??
    property.ownerId ??
    property.seller?.id ??
    property.owner?.id ??
    property.seller?.userId ??
    property.owner?.userId ??
    null
  );
}

/* ============================================================
   BROKER HELPERS
============================================================ */

function getPropertyBrokerId(property) {
  if (!property) {
    return null;
  }

  return (
    property.brokerId ??
    property.agentId ??
    property.broker?.id ??
    property.broker?.userId ??
    property.agent?.id ??
    property.agent?.userId ??
    null
  );
}

function isBrokerAssigned(property) {
  const brokerId =
    getPropertyBrokerId(property);

  /*
   * If the backend property contains a broker/agent
   * relationship, consider this property broker-assisted.
   */
  if (
    brokerId !== null &&
    brokerId !== undefined &&
    brokerId !== ""
  ) {
    return true;
  }

  /*
   * Also support common boolean flags if your
   * frontend/backend sends one.
   */
  if (
    property?.brokerAssigned === true ||
    property?.hasBroker === true ||
    property?.isBrokerAssigned === true
  ) {
    return true;
  }

  return false;
}

function getBrokerName(property) {
  if (!property) {
    return "Broker";
  }

  return (
    property.brokerName ||
    property.agentName ||
    property.broker?.name ||
    property.broker?.fullName ||
    property.agent?.name ||
    property.agent?.fullName ||
    "Assigned Broker"
  );
}

/* ============================================================
   LISTING HELPERS
============================================================ */

function normalizeListingType(property) {
  const value = String(
    property?.listingType ||
      property?.propertyListingType ||
      property?.type ||
      ""
  ).toUpperCase();

  if (
    value === "RENT" ||
    value === "RENTAL" ||
    value === "LEASE"
  ) {
    return "RENT";
  }

  return "SALE";
}

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function formatPropertyStatus(status) {
  const normalized =
    normalizeStatus(status);

  switch (normalized) {
    case "ACTIVE":
    case "AVAILABLE":
    case "PUBLISHED":
    case "LISTED":
      return "Active";

    case "SOLD":
      return "Sold";

    case "RENTED":
      return "Rented";

    case "PENDING":
      return "Pending";

    case "INACTIVE":
    case "DRAFT":
      return "Inactive";

    default:
      return status || "Unknown";
  }
}

/* ============================================================
   PRICE HELPERS
============================================================ */

function getNumericPrice(property) {
  if (!property) {
    return 0;
  }

  const value =
    property.price ??
    property.amount ??
    property.listingPrice ??
    property.expectedPrice ??
    0;

  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const stringValue =
    String(value)
      .trim()
      .replace(/[₹,\s]/g, "");

  /*
   * Support values such as:
   * 35000000
   * ₹35000000
   * ₹3.5 Cr
   * 3.5 Crore
   * 50 Lakh
   */
  const croreMatch =
    stringValue.match(
      /^([\d.]+)(CR|CRORE)$/i
    );

  if (croreMatch) {
    return (
      Number(croreMatch[1]) *
      10000000
    );
  }

  const lakhMatch =
    stringValue.match(
      /^([\d.]+)(L|LAKH|LAKHS)$/i
    );

  if (lakhMatch) {
    return (
      Number(lakhMatch[1]) *
      100000
    );
  }

  return Number(
    stringValue
  ) || 0;
}

function formatCurrency(value) {
  const number =
    Number(value) || 0;

  return `₹${number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

/* ============================================================
   LOCATION HELPERS
============================================================ */

function getPropertyLocation(property) {
  if (!property) {
    return "-";
  }

  if (property.location) {
    if (
      typeof property.location ===
      "string"
    ) {
      return property.location;
    }

    const locationParts = [
      property.location.locality,
      property.location.city,
      property.location.state,
    ].filter(Boolean);

    if (
      locationParts.length > 0
    ) {
      return locationParts.join(
        ", "
      );
    }
  }

  return (
    property.locality ||
    property.area ||
    property.city ||
    property.address ||
    "-"
  );
}

/* ============================================================
   STATUS STYLES
============================================================ */

function getStatusClasses(status) {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-600 border-green-200";

    case "Sold":
      return "bg-blue-50 text-blue-600 border-blue-200";

    case "Rented":
      return "bg-purple-50 text-purple-600 border-purple-200";

    case "Pending":
      return "bg-amber-50 text-amber-600 border-amber-200";

    case "Inactive":
      return "bg-gray-50 text-gray-500 border-gray-200";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}