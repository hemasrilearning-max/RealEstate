import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  Target,
  MessageSquare,
  Calendar,
  TrendingUp,
  Eye,
  Users,
} from "lucide-react";
import { formatPrice } from "../../data/mockData";

export default function Overview() {
  const { agent } = useAuth();
  const { properties, leads, messages, tourRequests, transactions } = useData();

  const myProps = properties.filter((p) => p.agentId === agent.id);
  const myLeads = leads.filter((l) => l.agentId === agent.id);
  const unreadMsgs = messages.filter(
    (m) => m.senderType === "buyer" && !m.read
  ).length;
  const pendingTours = tourRequests.filter(
    (t) => t.agentId === agent.id && t.status === "Pending"
  ).length;
  const totalViews = myProps.reduce((s, p) => s + (p.views || 0), 0);
  const completedDeals = transactions.filter(
    (t) => t.agentId === agent.id && t.status === "Completed"
  ).length;

  const stats = [
    {
      label: "Properties",
      value: myProps.length,
      icon: Building2,
      color: "bg-blue-50 text-blue-600",
      to: "/agent/properties",
    },
    {
      label: "Active Leads",
      value: myLeads.filter((l) => l.status !== "Closed").length,
      icon: Target,
      color: "bg-amber-50 text-amber-600",
      to: "/agent/leads",
    },
    {
      label: "Unread Messages",
      value: unreadMsgs,
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600",
      to: "/agent/messages",
    },
    {
      label: "Pending Tours",
      value: pendingTours,
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600",
      to: "/agent/tours",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: Eye,
      color: "bg-rose-50 text-rose-600",
      to: "/agent/analytics",
    },
    {
      label: "Closed Deals",
      value: completedDeals,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      to: "/agent/transactions",
    },
  ];

  const recentLeads = [...myLeads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Welcome back, {agent.name.split(" ")[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your listings today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <div
              className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center mb-3`}
            >
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">Recent Leads</h3>
            <Link
              to="/agent/leads"
              className="text-sm text-red-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">No leads yet.</p>
            ) : (
              recentLeads.map((lead) => {
                const prop = properties.find((p) => p.id === lead.propertyId);
                return (
                  <div key={lead.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {prop?.title || "Property"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        lead.status === "New"
                          ? "bg-blue-50 text-blue-700"
                          : lead.status === "Contacted"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Properties */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">Top Properties by Views</h3>
            <Link
              to="/agent/properties"
              className="text-sm text-red-600 hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {[...myProps]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 5)
              .map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                  <img
                    src={p.images?.[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(p.price, p.listingType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{p.views}</p>
                    <p className="text-xs text-gray-400">views</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
