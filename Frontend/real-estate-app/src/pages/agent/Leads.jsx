import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const STATUSES = ["New", "Contacted", "Qualified", "Closed", "Lost"];

export default function Leads() {
  const { agent } = useAuth();
  const { leads, properties, updateLeadStatus } = useData();
  const myLeads = leads
    .filter((l) => l.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Leads</h2>
        <p className="text-sm text-gray-500">{myLeads.length} total leads</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                myLeads.map((lead) => {
                  const prop = properties.find((p) => p.id === lead.propertyId);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">{lead.email}</div>
                        <div className="text-xs text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        {prop?.title || "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-gray-600">
                        {lead.message || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            updateLeadStatus(lead.id, e.target.value)
                          }
                          className="text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
