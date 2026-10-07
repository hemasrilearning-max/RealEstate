import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

export default function Analytics() {
  const { user, agent } = useAuth();

  const brokerId =
    agent?.userId || agent?.id || user?.userId || user?.id;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!brokerId) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await brokerService.brokerAnalytics(brokerId);

        // Support both raw DTO and { data: DTO } / { success, data }
        const payload =
          response?.data && typeof response.data === "object"
            ? response.data
            : response;

        setAnalytics(payload);
      } catch (err) {
        console.error("Failed to load broker analytics:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [brokerId]);

  if (!brokerId) {
    return (
      <div className="p-6 text-gray-500">
        Broker information is not available. Please login again.
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics available.</div>;
  }

  const totalProperties = analytics.totalProperties ?? 0;
  const totalLeads = analytics.totalLeads ?? 0;
  const conversionRate = analytics.conversionRate ?? 0;
  const closedDeals = analytics.closedDeals ?? 0;
  const activeListings = analytics.activeListings ?? 0;
  const totalTours = analytics.totalTours ?? 0;
  const totalClients = analytics.totalClients ?? 0;
  const totalCommission = analytics.totalCommission ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-gray-500">Performance overview of your listings</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Total Properties</p>
          <h2 className="text-3xl font-bold mt-2">{totalProperties}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Active Listings</p>
          <h2 className="text-3xl font-bold mt-2">{activeListings}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Total Leads</p>
          <h2 className="text-3xl font-bold mt-2">{totalLeads}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Conversion Rate</p>
          <h2 className="text-3xl font-bold mt-2">{conversionRate}%</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Closed Deals</p>
          <h2 className="text-3xl font-bold mt-2">{closedDeals}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Total Tours</p>
          <h2 className="text-3xl font-bold mt-2">{totalTours}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Total Clients</p>
          <h2 className="text-3xl font-bold mt-2">{totalClients}</h2>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-gray-500">Total Commission</p>
          <h2 className="text-3xl font-bold mt-2">{totalCommission}</h2>
        </div>
      </div>
    </div>
  );
}
