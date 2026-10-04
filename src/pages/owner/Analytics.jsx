import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import propertyService from "../../services/propertyService";
import leadService from "../../services/leadService";

export default function OwnerAnalytics() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) {
      setProperties([]);
      setLeads([]);
      setLoading(false);
      return;
    }

    loadAnalytics();
  }, [user?.userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [propertyResponse, leadResponse] =
        await Promise.all([
          propertyService.getPropertiesBySeller(
            user.userId
          ),
          leadService.getLeadsBySeller(
            user.userId
          ),
        ]);

      /*
       * ---------------------------------------------------------
       * PROPERTIES
       * ---------------------------------------------------------
       */

      const ownerProperties =
        Array.isArray(propertyResponse)
          ? propertyResponse
          : propertyResponse?.content ||
            propertyResponse?.data ||
            propertyResponse?.properties ||
            [];

      const normalizedProperties =
        ownerProperties.map((property) => ({
          ...property,

          id: property.id,

          title:
            property.title ||
            "Untitled Property",

          /*
           * Small project/demo numbers.
           *
           * Maximum 60 views per property.
           * This prevents production-sized numbers
           * from appearing in the project demo.
           */
          views: Math.min(
            Number(property.views) || 0,
            60
          ),
        }));

      setProperties(normalizedProperties);

      /*
       * ---------------------------------------------------------
       * LEADS
       * ---------------------------------------------------------
       */

      const ownerLeads =
        Array.isArray(leadResponse)
          ? leadResponse
          : leadResponse?.content ||
            leadResponse?.data ||
            leadResponse?.leads ||
            [];

      /*
       * Keep the actual backend lead records.
       * We do not create fake leads.
       */
      setLeads(
        ownerLeads.map((lead) => ({
          ...lead,

          id: lead.id,

          propertyId:
            lead.propertyId,

          propertyTitle:
            lead.propertyTitle ||
            "Unknown Property",

          status:
            String(
              lead.status || "NEW"
            ).toUpperCase(),

          createdAt:
            lead.createdAt || null,
        }))
      );
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
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * PROPERTY METRICS
   * ---------------------------------------------------------
   */

  const totalViews = properties.reduce(
    (total, property) =>
      total +
      (Number(property.views) || 0),
    0
  );

  /*
   * Keep lead count based on actual backend leads.
   */
  const totalLeads = leads.length;

  /*
   * ---------------------------------------------------------
   * LEAD STATUS METRICS
   * ---------------------------------------------------------
   */

  const newLeads = leads.filter(
    (lead) =>
      lead.status === "NEW"
  ).length;

  const contactedLeads = leads.filter(
    (lead) =>
      lead.status === "CONTACTED"
  ).length;

  const inProgressLeads = leads.filter(
    (lead) =>
      lead.status === "IN_PROGRESS"
  ).length;

  const convertedLeads = leads.filter(
    (lead) =>
      lead.status === "CONVERTED"
  ).length;

  const closedLeads = leads.filter(
    (lead) =>
      lead.status === "CLOSED"
  ).length;

  /*
   * ---------------------------------------------------------
   * CONVERSION METRICS
   * ---------------------------------------------------------
   */

  const viewToLeadRate =
    totalViews > 0
      ? (
          (totalLeads / totalViews) *
          100
        ).toFixed(2)
      : "0.00";

  const leadToConversionRate =
    totalLeads > 0
      ? (
          (convertedLeads /
            totalLeads) *
          100
        ).toFixed(2)
      : "0.00";

  const conversionMetrics = [
    {
      title: "View-to-Lead Rate",
      value: `${viewToLeadRate}%`,
      change:
        totalLeads > 0
          ? `${totalLeads} leads`
          : "No leads yet",
      trend:
        totalLeads > 0
          ? "up"
          : "neutral",
    },
    {
      title: "Lead-to-Conversion Rate",
      value: `${leadToConversionRate}%`,
      change:
        convertedLeads > 0
          ? `${convertedLeads} converted`
          : "No conversions yet",
      trend:
        convertedLeads > 0
          ? "up"
          : "neutral",
    },
    {
      title: "Lead Pipeline",
      value: `${totalLeads}`,
      change:
        `${newLeads} new · ${contactedLeads} contacted`,
      trend:
        totalLeads > 0
          ? "up"
          : "neutral",
    },
  ];

  /*
   * ---------------------------------------------------------
   * PROPERTY PERFORMANCE
   * ---------------------------------------------------------
   */

  const highestViews = properties.reduce(
    (highest, property) =>
      Math.max(
        highest,
        Number(property.views) || 0
      ),
    0
  );

  const assetPerformance =
    properties.map((property) => {
      const propertyLeads =
        leads.filter(
          (lead) =>
            Number(
              lead.propertyId
            ) ===
            Number(property.id)
        ).length;

      return {
        name:
          property.title ||
          "Untitled Property",

        views:
          Number(property.views) || 0,

        leads:
          propertyLeads,

        /*
         * Bar represents property views.
         *
         * Highest-viewed property = 100%
         */
        performance:
          highestViews > 0
            ? Math.round(
                ((Number(
                  property.views
                ) || 0) /
                  highestViews) *
                  100
              )
            : 0,
      };
    });

  /*
   * Highest traffic properties first.
   */
  assetPerformance.sort(
    (a, b) =>
      b.views - a.views
  );

  /*
   * ---------------------------------------------------------
   * LEAD STATUS DISTRIBUTION
   * ---------------------------------------------------------
   */

  const leadSources = [
    {
      channel: "New Leads",
      share:
        totalLeads > 0
          ? `${Math.round(
              (newLeads /
                totalLeads) *
                100
            )}%`
          : "0%",
      color: "bg-rose-500",
    },
    {
      channel: "Contacted",
      share:
        totalLeads > 0
          ? `${Math.round(
              (contactedLeads /
                totalLeads) *
                100
            )}%`
          : "0%",
      color: "bg-indigo-500",
    },
    {
      channel: "In Progress",
      share:
        totalLeads > 0
          ? `${Math.round(
              (inProgressLeads /
                totalLeads) *
                100
            )}%`
          : "0%",
      color: "bg-amber-400",
    },
    {
      channel: "Converted",
      share:
        totalLeads > 0
          ? `${Math.round(
              (convertedLeads /
                totalLeads) *
                100
            )}%`
          : "0%",
      color: "bg-green-500",
    },
    {
      channel: "Closed",
      share:
        totalLeads > 0
          ? `${Math.round(
              (closedLeads /
                totalLeads) *
                100
            )}%`
          : "0%",
      color: "bg-gray-500",
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
          {/* Conversion Metrics */}
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

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Breakdown */}
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

                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${asset.performance}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Lead Status Distribution */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">
                  Lead Pipeline
                </h3>

                <p className="text-xs text-gray-400 mb-4">
                  Real lead status distribution from
                  your backend.
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

              {/* Total Leads */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">
                    Total Leads
                  </span>

                  <span className="text-lg font-black text-gray-900">
                    {totalLeads}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase">
                New
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {newLeads}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase">
                Contacted
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {contactedLeads}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase">
                In Progress
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {inProgressLeads}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase">
                Converted
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {convertedLeads}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase">
                Closed
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {closedLeads}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}