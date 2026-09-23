import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../data/mockData";

export default function Analytics() {
  const { agent } = useAuth();
  const { properties, leads, transactions, tourRequests } = useData();

  const myProps = properties.filter((p) => p.agentId === agent.id);
  const myLeads = leads.filter((l) => l.agentId === agent.id);
  const myTx = transactions.filter((t) => t.agentId === agent.id);
  const myTours = tourRequests.filter((t) => t.agentId === agent.id);

  const totalViews = myProps.reduce((s, p) => s + (p.views || 0), 0);
  const totalLeads = myLeads.length;
  const conversionRate =
    totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : 0;
  const closedDeals = myTx.filter((t) => t.status === "Completed").length;
  const totalCommission = myTx
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + t.commission, 0);

  const byType = {};
  myProps.forEach((p) => {
    byType[p.propertyType] = (byType[p.propertyType] || 0) + 1;
  });

  const byListing = { Buy: 0, Rent: 0 };
  myProps.forEach((p) => {
    byListing[p.listingType] = (byListing[p.listingType] || 0) + 1;
  });

  const leadStatus = {};
  myLeads.forEach((l) => {
    leadStatus[l.status] = (leadStatus[l.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500">Performance overview of your listings</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews },
          { label: "Total Leads", value: totalLeads },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Closed Deals", value: closedDeals },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Property Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Properties by Type</h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${(count / myProps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(byType).length === 0 && (
              <p className="text-sm text-gray-500">No data</p>
            )}
          </div>
        </div>

        {/* Lead Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {Object.entries(leadStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(count / totalLeads) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(leadStatus).length === 0 && (
              <p className="text-sm text-gray-500">No data</p>
            )}
          </div>
        </div>

        {/* Listing Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Buy vs Rent</h3>
          <div className="flex gap-6">
            {Object.entries(byListing).map(([type, count]) => (
              <div key={type} className="text-center flex-1">
                <p className="text-3xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 mt-1">{type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Commission Earned</span>
              <span className="font-semibold text-green-700">
                {formatPrice(totalCommission)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tour Requests</span>
              <span className="font-medium">{myTours.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Listings</span>
              <span className="font-medium">{myProps.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
