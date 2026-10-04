import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import propertyService from "../../services/propertyService";

export default function OwnerAnalytics() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) {
      setProperties([]);
      setLoading(false);
      return;
    }

    loadAnalytics();
  }, [user?.userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await propertyService.getPropertiesBySeller(
          user.userId
        );

      const ownerProperties = Array.isArray(response)
        ? response
        : response?.content ||
          response?.data ||
          response?.properties ||
          [];

      const normalizedProperties = ownerProperties.map(
        (property) => ({
          ...property,
          id: property.id,
          title:
            property.title ||
            "Untitled Property",
          views: Number(property.views) || 0,
          leads: Number(property.leads) || 0,
        })
      );

      setProperties(normalizedProperties);
    } catch (err) {
      console.error(
        "Unable to load owner analytics:",
        err
      );

      setError(
        err.message ||
          "Unable to load analytics. Please try again."
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * REAL BACKEND METRICS
   * ---------------------------------------------------------
   */

  const totalViews = properties.reduce(
    (total, property) =>
      total + property.views,
    0
  );

  const totalLeads = properties.reduce(
    (total, property) =>
      total + property.leads,
    0
  );

  /*
   * View-to-Lead Rate can be calculated from the
   * property views and leads supplied by the backend.
   */
  const viewToLeadRate =
    totalViews > 0
      ? ((totalLeads / totalViews) * 100).toFixed(2)
      : "0.00";

  /*
   * The backend currently has no Lead/Tour module,
   * so these cannot be calculated reliably yet.
   */
  const conversionMetrics = [
    {
      title: "View-to-Lead Rate",
      value: `${viewToLeadRate}%`,
      change: "Live",
      trend: "up",
    },
    {
      title: "Lead-to-Tour Rate",
      value: "N/A",
      change: "Backend data unavailable",
      trend: "neutral",
    },
    {
      title: "Tour-to-Close Rate",
      value: "N/A",
      change: "Backend data unavailable",
      trend: "neutral",
    },
  ];

  /*
   * ---------------------------------------------------------
   * PROPERTY PERFORMANCE
   * ---------------------------------------------------------
   *
   * Performance percentage is calculated relative to the
   * highest-viewed property in the owner's portfolio.
   */

  const highestViews = properties.reduce(
    (highest, property) =>
      Math.max(highest, property.views),
    0
  );

  const assetPerformance = properties.map(
    (property) => ({
      name:
        property.title ||
        "Untitled Property",

      views: property.views,

      leads: property.leads,

      performance:
        highestViews > 0
          ? Math.round(
              (property.views /
                highestViews) *
                100
            )
          : 0,
    })
  );

  /*
   * Show highest traffic properties first.
   */
  assetPerformance.sort(
    (a, b) => b.views - a.views
  );

  /*
   * ---------------------------------------------------------
   * LEAD SOURCE DATA
   * ---------------------------------------------------------
   *
   * The backend does not currently expose lead-source
   * information, so we don't display made-up percentages.
   */
  const leadSources = [
    {
      channel: "Lead Source Tracking",
      share:
        "Not available",
      color: "bg-rose-500",
    },
    {
      channel: "Campaign Tracking",
      share:
        "Not available",
      color: "bg-indigo-500",
    },
    {
      channel: "External Referrals",
      share:
        "Not available",
      color: "bg-amber-400",
    },
  ];

  return (
    <div className="space-y-6 font-sans animate-fadeIn">
      {/* Module Title Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Performance Analytics
        </h2>

        <p className="text-sm text-gray-500 mt-0.5">
          Audit traffic conversions, exposure maps, and
          asset pipeline metrics.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Loading analytics...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAnalytics}
            className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Conversion funnel tracking columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {conversionMetrics.map(
              (metric, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {metric.title}
                  </span>

                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-2xl font-black text-gray-900">
                      {metric.value}
                    </span>

                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        metric.trend ===
                        "up"
                          ? "bg-green-50 text-green-600"
                          : metric.trend ===
                            "down"
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Grid distribution splits for analytics layout indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Property Breakdown Pipeline */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4">
                Traffic Breakdown by Asset
              </h3>

              {assetPerformance.length ===
              0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">
                    No property analytics available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assetPerformance.map(
                    (asset, index) => (
                      <div
                        key={index}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-700">
                            {asset.name}
                          </span>

                          <span className="text-gray-400 font-medium">
                            {asset.views} views ·{" "}
                            {asset.leads} leads
                          </span>
                        </div>

                        {/* Horizontal custom fill tracking indicator container */}
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${asset.performance}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Simple visual leads capture channel map */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">
                  Lead Sources
                </h3>

                <p className="text-xs text-gray-400 mb-4">
                  Distribution channel breakdown map
                  metrics.
                </p>

                <div className="space-y-2.5">
                  {leadSources.map(
                    (src, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50 border border-gray-100/50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${src.color}`}
                          ></span>

                          <span className="text-gray-600 font-medium">
                            {src.channel}
                          </span>
                        </div>

                        <span className="font-bold text-gray-900">
                          {src.share}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}