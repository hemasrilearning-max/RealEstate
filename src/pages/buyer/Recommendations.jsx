import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
import propertyViewService from "../../services/propertyViewService";

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

function getPropertyCity(property) {
  if (
    typeof property?.location ===
    "string"
  ) {
    return normalize(
      property.location
    );
  }

  return normalize(
    property?.city ||
      property?.locality ||
      property?.area ||
      property?.location?.city ||
      property?.location?.area ||
      ""
  );
}

function getPropertyType(property) {
  return normalizeType(
    property?.propertyType
  );
}

function getPropertyListingType(property) {
  return normalizeListingType(
    property?.listingType
  );
}

function getRecommendationReason(
  scores
) {
  const reasons = [];

  if (scores.viewed > 0) {
    reasons.push(
      "similar to properties you recently viewed"
    );
  }

  if (scores.favorite > 0) {
    reasons.push(
      "similar to a property you favorited"
    );
  }

  if (scores.city > 0) {
    reasons.push(
      "matches a location from your activity"
    );
  }

  if (scores.propertyType > 0) {
    reasons.push(
      "matches a property type from your activity"
    );
  }

  if (scores.listingType > 0) {
    reasons.push(
      "matches your listing preference"
    );
  }

  if (reasons.length === 0) {
    return "Recommended from currently available HomeSpace properties.";
  }

  return (
    reasons.slice(0, 2).join(" and ") +
    "."
  );
}

export default function BuyerRecommendations() {
  const navigate = useNavigate();

  const {
    properties,
    favoriteIds,
    getPropertyImage,
  } = useData();

  const [
    viewedProperties,
    setViewedProperties,
  ] = useState([]);

  const [
    loadingViewedProperties,
    setLoadingViewedProperties,
  ] = useState(true);

  const [
    dismissedIds,
    setDismissedIds,
  ] = useState([]);

  /*
   * ============================================================
   * LOAD VIEWED PROPERTIES FROM BACKEND
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadViewedProperties() {
      try {
        setLoadingViewedProperties(true);

        const response =
          await propertyViewService.getMyViewedProperties();

        if (cancelled) {
          return;
        }

        const list =
          Array.isArray(response)
            ? response
            : response?.content ||
              response?.data ||
              response?.properties ||
              [];

        setViewedProperties(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load viewed properties for recommendations:",
          error
        );

        if (!cancelled) {
          setViewedProperties([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingViewedProperties(
            false
          );
        }
      }
    }

    loadViewedProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * RECOMMENDATION ENGINE
   * ============================================================
   */

  const matches = useMemo(() => {
    if (!Array.isArray(properties)) {
      return [];
    }

    const favorites =
      Array.isArray(favoriteIds)
        ? favoriteIds
        : [];

    const viewed =
      Array.isArray(viewedProperties)
        ? viewedProperties
        : [];

    /*
     * Available properties only.
     */

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

        const status =
          normalize(property.status);

        /*
         * Hide unavailable properties.
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
     * If there are no available properties,
     * return empty.
     */

    if (
      availableProperties.length === 0
    ) {
      return [];
    }

    /*
     * ==========================================================
     * BUILD RECOMMENDATIONS
     * ==========================================================
     */

    const favoriteProperties =
      properties.filter((item) =>
        favorites.some(
          (id) =>
            String(id) ===
            String(item?.id)
        )
      );

    const scored =
      availableProperties.map(
        (property) => {
          let score = 25;

          const scores = {
            listingType: 0,
            city: 0,
            propertyType: 0,
            favorite: 0,
            viewed: 0,
          };

          const propertyType =
            getPropertyType(property);

          const propertyListingType =
            getPropertyListingType(
              property
            );

          const propertyCity =
            getPropertyCity(property);

          /*
           * ------------------------------------------------------
           * FAVORITE SIMILARITY
           * ------------------------------------------------------
           */

          const similarFavorite =
            favoriteProperties.find(
              (favorite) => {
                const favoriteType =
                  getPropertyType(
                    favorite
                  );

                const favoriteListing =
                  getPropertyListingType(
                    favorite
                  );

                const favoriteCity =
                  getPropertyCity(
                    favorite
                  );

                return (
                  (
                    favoriteType &&
                    propertyType &&
                    favoriteType ===
                      propertyType
                  ) ||
                  (
                    favoriteListing &&
                    propertyListingType &&
                    favoriteListing ===
                      propertyListingType
                  ) ||
                  (
                    favoriteCity &&
                    propertyCity &&
                    (
                      favoriteCity.includes(
                        propertyCity
                      ) ||
                      propertyCity.includes(
                        favoriteCity
                      )
                    )
                  )
                );
              }
            );

          if (similarFavorite) {
            score += 20;
            scores.favorite = 20;
          }

          /*
           * ------------------------------------------------------
           * VIEWED PROPERTY SIMILARITY
           * ------------------------------------------------------
           */

          const similarViewed =
            viewed.find(
              (viewedProperty) => {
                const viewedType =
                  getPropertyType(
                    viewedProperty
                  );

                const viewedListing =
                  getPropertyListingType(
                    viewedProperty
                  );

                const viewedCity =
                  getPropertyCity(
                    viewedProperty
                  );

                return (
                  (
                    viewedType &&
                    propertyType &&
                    viewedType ===
                      propertyType
                  ) ||
                  (
                    viewedListing &&
                    propertyListingType &&
                    viewedListing ===
                      propertyListingType
                  ) ||
                  (
                    viewedCity &&
                    propertyCity &&
                    (
                      viewedCity.includes(
                        propertyCity
                      ) ||
                      propertyCity.includes(
                        viewedCity
                      )
                    )
                  )
                );
              }
            );

          if (similarViewed) {
            score += 25;
            scores.viewed = 25;
          }

          /*
           * ------------------------------------------------------
           * LOCATION MATCH
           * ------------------------------------------------------
           */

          const locationMatch =
            viewed.some(
              (viewedProperty) => {
                const viewedCity =
                  getPropertyCity(
                    viewedProperty
                  );

                return (
                  viewedCity &&
                  propertyCity &&
                  (
                    viewedCity.includes(
                      propertyCity
                    ) ||
                    propertyCity.includes(
                      viewedCity
                    )
                  )
                );
              }
            );

          if (locationMatch) {
            score += 15;
            scores.city = 15;
          }

          /*
           * ------------------------------------------------------
           * PROPERTY TYPE MATCH
           * ------------------------------------------------------
           */

          const propertyTypeMatch =
            viewed.some(
              (viewedProperty) =>
                getPropertyType(
                  viewedProperty
                ) &&
                propertyType &&
                getPropertyType(
                  viewedProperty
                ) === propertyType
            );

          if (propertyTypeMatch) {
            score += 15;
            scores.propertyType = 15;
          }

          /*
           * ------------------------------------------------------
           * LISTING TYPE MATCH
           * ------------------------------------------------------
           */

          const viewedListingMatch =
            viewed.some(
              (viewedProperty) =>
                getPropertyListingType(
                  viewedProperty
                ) &&
                propertyListingType &&
                getPropertyListingType(
                  viewedProperty
                ) ===
                  propertyListingType
            );

          if (viewedListingMatch) {
            score += 10;
            scores.listingType = 10;
          }

          /*
           * Keep score between 25 and 100.
           */

          score = Math.min(
            score,
            100
          );

          let scoreLabel =
            "Good Match";

          if (score >= 90) {
            scoreLabel =
              "Excellent Match";
          } else if (score >= 80) {
            scoreLabel =
              "Great Match";
          }

          return {
            ...property,

            score,

            scoreLabel,

            scoreText:
              `${score}% Match`,

            tag:
              propertyListingType ===
              "rent"
                ? "Rent"
                : "Buy",

            reason:
              getRecommendationReason(
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

    /*
     * Sort highest score first.
     *
     * IMPORTANT:
     * We show only 3 recommendations
     * for testing.
     */

    return scored
      .filter(Boolean)
      .sort((a, b) => {
        if (
          b.score !== a.score
        ) {
          return b.score - a.score;
        }

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

        return (
          new Date(
            b.createdAt || 0
          ).getTime() -
          new Date(
            a.createdAt || 0
          ).getTime()
        );
      })
      .slice(0, 3);
  }, [
    properties,
    favoriteIds,
    viewedProperties,
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
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate(
                  "/properties"
                )
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
                favorites, recently viewed listings,
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

              {loadingViewedProperties ? (
                <div className="col-span-full text-center py-16 px-4">
                  <div className="h-10 w-10 mx-auto border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />

                  <p className="text-sm font-semibold text-gray-700 mt-4">
                    Loading personalized recommendations...
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Checking your recent property activity.
                  </p>
                </div>
              ) : (
                <>
                  {matches.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="border border-gray-100 rounded-xl bg-white overflow-hidden hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
                      >

                        {/* Property Visual */}

                        <div className="h-36 sm:h-40 bg-gradient-to-br from-emerald-50 via-gray-50 to-slate-100 relative flex items-center justify-center overflow-hidden">

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={
                                item.title
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Home className="h-12 w-12 text-emerald-200" />
                          )}

                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-white/95 px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm">
                              <Star className="h-3 w-3 fill-current" />
                              {
                                item.scoreText
                              }
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                                item.tag ===
                                "Buy"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              For{" "}
                              {
                                item.tag
                              }
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

                            {typeof item.location ===
                            "string"
                              ? item.location
                              : item.location?.area ||
                                item.location?.city ||
                                item.city ||
                                "Location unavailable"}
                          </p>

                          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              <span className="font-bold text-gray-800">
                                Why this property?
                              </span>{" "}
                              {
                                item.reason
                              }
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
                                {
                                  item.scoreLabel
                                }
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
                    )
                  )}

                  {/* Empty State */}

                  {matches.length ===
                    0 && (
                    <div className="col-span-full text-center py-16 px-4">

                      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                        <Sparkles className="h-7 w-7 text-emerald-500" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">
                        No recommendations right now
                      </h3>

                      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                        Continue browsing properties,
                        saving listings, and viewing
                        properties. HomeSpace will use
                        that activity to provide more
                        relevant recommendations.
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            "/properties"
                          )
                        }
                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Browse Properties
                        <ArrowRight className="h-4 w-4" />
                      </button>

                    </div>
                  )}
                </>
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
                Recommendations consider your
                favorite properties and recently
                viewed listings. Properties that
                match your viewing history, preferred
                locations, property types, and listing
                preferences receive a higher
                recommendation score.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

