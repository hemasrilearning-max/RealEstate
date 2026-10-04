import React, { useMemo, useState } from "react";
import {
  Sparkles,
  MapPin,
  ArrowRight,
  ThumbsDown,
  Star,
  ArrowLeft,
  Home,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeType(value) {
  const text = normalize(value);

  if (
    text.includes("apartment") ||
    text.includes("flat")
  ) {
    return "apartment";
  }

  if (text.includes("villa")) {
    return "villa";
  }

  if (
    text.includes("plot") ||
    text.includes("land")
  ) {
    return "plot";
  }

  if (
    text.includes("commercial") ||
    text.includes("office")
  ) {
    return "commercial";
  }

  return text;
}

function normalizeListingType(value) {
  const text = normalize(value);

  if (
    text === "sale" ||
    text === "buy" ||
    text === "sell"
  ) {
    return "sale";
  }

  if (
    text === "rent" ||
    text === "rental"
  ) {
    return "rent";
  }

  return text;
}

function getBhkNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const match = String(value).match(/\d+/);

  return match ? Number(match[0]) : null;
}

function getPriceNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const text = String(value)
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .trim()
    .toLowerCase();

  const match = text.match(
    /([\d.]+)\s*(cr|crore|lakh|lac|k)?/
  );

  if (!match) {
    const number = Number(
      text.replace(/[^\d.]/g, "")
    );

    return Number.isFinite(number)
      ? number
      : null;
  }

  const number = Number(match[1]);

  if (!Number.isFinite(number)) {
    return null;
  }

  if (
    match[2] === "cr" ||
    match[2] === "crore"
  ) {
    return number * 10000000;
  }

  if (
    match[2] === "lakh" ||
    match[2] === "lac"
  ) {
    return number * 100000;
  }

  if (match[2] === "k") {
    return number * 1000;
  }

  return number;
}

function getSearchCity(search) {
  return normalize(
    search?.city ||
      search?.location ||
      search?.locality ||
      search?.area ||
      search?.search ||
      ""
  );
}

function getSearchListingType(search) {
  return normalizeListingType(
    search?.listingType ||
      search?.type ||
      search?.purpose ||
      search?.transactionType ||
      ""
  );
}

function getSearchPropertyType(search) {
  return normalizeType(
    search?.propertyType ||
      search?.type ||
      ""
  );
}

function getSearchBhk(search) {
  return getBhkNumber(
    search?.bhk ||
      search?.bedrooms ||
      search?.beds
  );
}

function getSearchMinPrice(search) {
  return getPriceNumber(
    search?.minPrice ??
      search?.minimumPrice ??
      search?.budgetMin ??
      search?.minBudget
  );
}

function getSearchMaxPrice(search) {
  return getPriceNumber(
    search?.maxPrice ??
      search?.maximumPrice ??
      search?.budgetMax ??
      search?.maxBudget ??
      search?.budget
  );
}

function propertyMatchesSearch(property, search) {
  const propertyListingType =
    normalizeListingType(
      property.listingType
    );

  const propertyType =
    normalizeType(
      property.propertyType
    );

  const propertyCity =
    normalize(
      property.city ||
        property.locality ||
        property.location
    );

  const propertyPrice =
    getPriceNumber(property.price);

  const propertyBhk =
    getBhkNumber(
      property.bhk ||
        property.bedrooms
    );

  const searchListingType =
    getSearchListingType(search);

  const searchPropertyType =
    getSearchPropertyType(search);

  const searchCity =
    getSearchCity(search);

  const searchBhk =
    getSearchBhk(search);

  const minPrice =
    getSearchMinPrice(search);

  const maxPrice =
    getSearchMaxPrice(search);

  if (
    searchListingType &&
    propertyListingType &&
    searchListingType !== propertyListingType
  ) {
    return false;
  }

  if (
    searchPropertyType &&
    propertyType &&
    searchPropertyType !== propertyType
  ) {
    return false;
  }

  if (
    searchCity &&
    propertyCity &&
    !(
      propertyCity.includes(searchCity) ||
      searchCity.includes(propertyCity)
    )
  ) {
    return false;
  }

  if (
    propertyPrice !== null &&
    minPrice !== null &&
    propertyPrice < minPrice
  ) {
    return false;
  }

  if (
    propertyPrice !== null &&
    maxPrice !== null &&
    propertyPrice > maxPrice
  ) {
    return false;
  }

  if (
    searchBhk !== null &&
    propertyBhk !== null &&
    propertyBhk !== searchBhk
  ) {
    return false;
  }

  return true;
}

function getRecommendationReason(
  property,
  scores
) {
  const reasons = [];

  if (scores.listingType > 0) {
    reasons.push(
      `Matches your ${property.listingType === "Rent" ? "rental" : "buying"} preference`
    );
  }

  if (scores.city > 0) {
    reasons.push(
      "matches your preferred location"
    );
  }

  if (scores.propertyType > 0) {
    reasons.push(
      "matches your preferred property type"
    );
  }

  if (scores.price > 0) {
    reasons.push(
      "fits your budget preference"
    );
  }

  if (scores.bhk > 0) {
    reasons.push(
      "matches your BHK preference"
    );
  }

  if (scores.favorite > 0) {
    reasons.push(
      "similar to a property you favorited"
    );
  }

  if (scores.viewed > 0) {
    reasons.push(
      "similar to properties you recently viewed"
    );
  }

  if (reasons.length === 0) {
    return "Recommended from currently available HomeSpace properties.";
  }

  return (
    reasons.slice(0, 2).join(" and ") + "."
  );
}

export default function BuyerRecommendations() {
  const navigate = useNavigate();

  const {
    properties,
    favoriteIds,
    savedSearches,
    viewedPropertyIds,
    getPropertyImage,
  } = useData();

  const [dismissedIds, setDismissedIds] =
    useState([]);

  /*
   * ============================================================
   * RECOMMENDATION ENGINE
   * ============================================================
   */

  const matches = useMemo(() => {
    if (!Array.isArray(properties)) {
      return [];
    }

    const favorites = Array.isArray(favoriteIds)
      ? favoriteIds
      : [];

    const viewed = Array.isArray(
      viewedPropertyIds
    )
      ? viewedPropertyIds
      : [];

    const searches = Array.isArray(
      savedSearches
    )
      ? savedSearches
      : [];

    const availableProperties =
      properties.filter((property) => {
        if (!property?.id) {
          return false;
        }

        if (
          dismissedIds.some(
            (id) =>
              String(id) ===
              String(property.id)
          )
        ) {
          return false;
        }

        const status = normalize(
          property.status
        );

        /*
         * Do not recommend unavailable properties.
         */
        if (
          [
            "sold",
            "rented",
            "archived",
            "rejected",
            "inactive",
            "deleted",
          ].includes(status)
        ) {
          return false;
        }

        return true;
      });

    /*
     * Calculate recommendation score
     * for every backend property.
     */
    const scored = availableProperties.map(
      (property) => {
        let score = 0;

        const scores = {
          listingType: 0,
          city: 0,
          propertyType: 0,
          price: 0,
          bhk: 0,
          favorite: 0,
          viewed: 0,
        };

        const propertyListingType =
          normalizeListingType(
            property.listingType
          );

        const propertyType =
          normalizeType(
            property.propertyType
          );

        const propertyCity =
          normalize(
            property.city ||
              property.locality ||
              property.location
          );

        const propertyPrice =
          getPriceNumber(property.price);

        const propertyBhk =
          getBhkNumber(
            property.bhk ||
              property.bedrooms
          );

        /*
         * --------------------------------------------------------
         * SAVED SEARCH MATCH
         * --------------------------------------------------------
         */

        const matchingSearches =
          searches.filter((search) =>
            propertyMatchesSearch(
              property,
              search
            )
          );

        if (
          matchingSearches.length > 0
        ) {
          /*
           * A saved search is strong buyer intent.
           */
          score += 25;

          scores.listingType = 25;

          const bestSearch =
            matchingSearches[0];

          const searchListingType =
            getSearchListingType(
              bestSearch
            );

          const searchPropertyType =
            getSearchPropertyType(
              bestSearch
            );

          const searchCity =
            getSearchCity(bestSearch);

          const searchBhk =
            getSearchBhk(bestSearch);

          const minPrice =
            getSearchMinPrice(
              bestSearch
            );

          const maxPrice =
            getSearchMaxPrice(
              bestSearch
            );

          /*
           * Location
           */
          if (
            searchCity &&
            propertyCity &&
            (
              propertyCity.includes(
                searchCity
              ) ||
              searchCity.includes(
                propertyCity
              )
            )
          ) {
            score += 20;
            scores.city = 20;
          }

          /*
           * Property type
           */
          if (
            searchPropertyType &&
            propertyType &&
            searchPropertyType ===
              propertyType
          ) {
            score += 15;
            scores.propertyType = 15;
          }

          /*
           * Budget
           */
          if (
            propertyPrice !== null
          ) {
            const withinMin =
              minPrice === null ||
              propertyPrice >= minPrice;

            const withinMax =
              maxPrice === null ||
              propertyPrice <= maxPrice;

            if (
              withinMin &&
              withinMax
            ) {
              score += 20;
              scores.price = 20;
            }
          }

          /*
           * BHK
           */
          if (
            searchBhk !== null &&
            propertyBhk !== null &&
            searchBhk === propertyBhk
          ) {
            score += 10;
            scores.bhk = 10;
          }

          /*
           * Listing type gets additional
           * confirmation when explicitly matched.
           */
          if (
            searchListingType &&
            propertyListingType &&
            searchListingType ===
              propertyListingType
          ) {
            scores.listingType = 25;
          }
        }

        /*
         * --------------------------------------------------------
         * FAVORITE SIMILARITY
         * --------------------------------------------------------
         */

        const favoriteProperties =
          properties.filter((item) =>
            favorites.some(
              (id) =>
                String(id) ===
                String(item.id)
            )
          );

        const similarFavorite =
          favoriteProperties.some(
            (favorite) => {
              const favoriteType =
                normalizeType(
                  favorite.propertyType
                );

              const favoriteListing =
                normalizeListingType(
                  favorite.listingType
                );

              const favoriteCity =
                normalize(
                  favorite.city ||
                    favorite.locality ||
                    favorite.location
                );

              const typeMatch =
                favoriteType &&
                propertyType &&
                favoriteType ===
                  propertyType;

              const listingMatch =
                favoriteListing &&
                propertyListingType &&
                favoriteListing ===
                  propertyListingType;

              const cityMatch =
                favoriteCity &&
                propertyCity &&
                (
                  favoriteCity.includes(
                    propertyCity
                  ) ||
                  propertyCity.includes(
                    favoriteCity
                  )
                );

              return (
                typeMatch ||
                listingMatch ||
                cityMatch
              );
            }
          );

        if (similarFavorite) {
          score += 5;
          scores.favorite = 5;
        }

        /*
         * --------------------------------------------------------
         * VIEWED PROPERTY SIMILARITY
         * --------------------------------------------------------
         */

        const viewedProperties =
          properties.filter((item) =>
            viewed.some(
              (id) =>
                String(id) ===
                String(item.id)
            )
          );

        const similarViewed =
          viewedProperties.some(
            (viewedProperty) => {
              const viewedType =
                normalizeType(
                  viewedProperty.propertyType
                );

              const viewedListing =
                normalizeListingType(
                  viewedProperty.listingType
                );

              const viewedCity =
                normalize(
                  viewedProperty.city ||
                    viewedProperty.locality ||
                    viewedProperty.location
                );

              const typeMatch =
                viewedType &&
                propertyType &&
                viewedType ===
                  propertyType;

              const listingMatch =
                viewedListing &&
                propertyListingType &&
                viewedListing ===
                  propertyListingType;

              const cityMatch =
                viewedCity &&
                propertyCity &&
                (
                  viewedCity.includes(
                    propertyCity
                  ) ||
                  propertyCity.includes(
                    viewedCity
                  )
                );

              return (
                typeMatch ||
                listingMatch ||
                cityMatch
              );
            }
          );

        if (similarViewed) {
          score += 5;
          scores.viewed = 5;
        }

        /*
         * Maximum score is 100.
         */
        score = Math.min(
          score,
          100
        );

        /*
         * Only show meaningful matches.
         */
        if (score < 25) {
          return null;
        }

        let scoreLabel = "Good Match";

        if (score >= 90) {
          scoreLabel =
            "Excellent Match";
        } else if (score >= 80) {
          scoreLabel =
            "Great Match";
        } else if (score >= 70) {
          scoreLabel =
            "Good Match";
        }

        return {
          ...property,

          score,

          scoreLabel,

          scoreText: `${score}% Match`,

          tag:
            propertyListingType ===
            "rent"
              ? "Rent"
              : "Buy",

          reason:
            getRecommendationReason(
              property,
              scores
            ),

          image:
            getPropertyImage
              ? getPropertyImage(
                  property.id,
                  Array.isArray(
                    property.images
                  ) &&
                    property.images.length >
                      0
                    ? property.images[0]
                    : ""
                )
              : Array.isArray(
                    property.images
                  ) &&
                  property.images.length >
                    0
                ? property.images[0]
                : "",
        };
      }
    );

    return scored
      .filter(Boolean)
      .sort((a, b) => {
        /*
         * Highest score first.
         */
        if (
          b.score !== a.score
        ) {
          return b.score - a.score;
        }

        /*
         * Featured properties are a
         * secondary tie-breaker.
         */
        if (
          Boolean(
            b.isFeatured
          ) !==
          Boolean(a.isFeatured)
        ) {
          return b.isFeatured
            ? 1
            : -1;
        }

        /*
         * Newer properties next.
         */
        return (
          new Date(
            b.createdAt || 0
          ).getTime() -
          new Date(
            a.createdAt || 0
          ).getTime()
        );
      })
      .slice(0, 10);
  }, [
    properties,
    favoriteIds,
    savedSearches,
    viewedPropertyIds,
    dismissedIds,
    getPropertyImage,
  ]);

  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  const handleDismiss = (id) => {
    setDismissedIds((prev) => [
      ...prev,
      id,
    ]);
  };

  const handleViewProperty = (
    property
  ) => {
    navigate(
      `/properties/${property.id}`
    );
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate("/properties")
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Browse Properties
            </button>

            <button
              onClick={() =>
                navigate("/")
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-emerald-600 fill-emerald-100" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Recommended Properties
              </h1>

              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Explore property suggestions based on your
                searches, favorites, recently viewed listings,
                and preferences.
              </p>

              {matches.length > 0 && (
                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />

                  <span className="text-xs font-semibold text-emerald-700">
                    {matches.length} personalized suggestions
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Curated For You
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              These listings are selected from available
              properties using your HomeSpace activity.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {matches.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-xl bg-white overflow-hidden hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
                >

                  {/* Property Visual */}
                  <div className="h-36 sm:h-40 bg-gradient-to-br from-emerald-50 via-gray-50 to-slate-100 relative flex items-center justify-center overflow-hidden">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home className="h-12 w-12 text-emerald-200" />
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-white/95 px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        {item.scoreText}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                          item.tag === "Buy"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        For {item.tag}
                      </span>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="p-4 flex flex-col flex-1">

                    <h3 className="font-bold text-gray-900 text-base">
                      {item.title ||
                        "Untitled Property"}
                    </h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                      {item.location ||
                        item.locality ||
                        item.city ||
                        "Location unavailable"}
                    </p>

                    <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-800">
                          Why this property?
                        </span>{" "}
                        {item.reason}
                      </p>
                    </div>

                    {/* Price + Actions */}
                    <div className="mt-auto pt-5">

                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-lg font-black text-emerald-600">
                          {item.price
                            ? typeof item.price ===
                              "number"
                              ? `₹${item.price.toLocaleString(
                                  "en-IN"
                                )}`
                              : item.price
                            : "Price on request"}
                        </span>

                        <span className="text-[10px] font-semibold text-gray-400">
                          {item.scoreLabel}
                        </span>
                      </div>

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleDismiss(
                              item.id
                            )
                          }
                          className="p-2.5 border border-gray-200 text-gray-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                          title="Not interested"
                          aria-label={`Dismiss ${item.title}`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleViewProperty(
                              item
                            )
                          }
                          className="flex-1 text-sm font-bold bg-gray-900 text-white px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                          View Property
                          <ArrowRight className="h-4 w-4" />
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {matches.length === 0 && (
                <div className="col-span-full text-center py-16 px-4">

                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Sparkles className="h-7 w-7 text-emerald-500" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    No recommendations right now
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    Continue browsing properties, saving
                    listings, and creating searches. HomeSpace
                    will use that activity to provide more
                    relevant recommendations.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/properties")
                    }
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Recommendation Information */}
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />

            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                How recommendations work
              </h3>

              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                Recommendations consider your saved searches,
                favorite properties, recently viewed listings,
                preferred locations, property types, BHK
                preferences, and budget. Properties with stronger
                matches receive a higher recommendation score.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}