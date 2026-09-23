import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

export default function Tours() {
  const { agent } = useAuth();
  const { tourRequests, properties, updateTourStatus } = useData();
  const myTours = tourRequests
    .filter((t) => t.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tour Requests</h2>
        <p className="text-sm text-gray-500">{myTours.length} requests</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Preferred Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No tour requests yet.
                  </td>
                </tr>
              ) : (
                myTours.map((t) => {
                  const prop = properties.find((p) => p.id === t.propertyId);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.phone}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        {prop?.title || "—"}
                      </td>
                      <td className="px-4 py-3">{t.preferredDate}</td>
                      <td className="px-4 py-3">{t.preferredTime}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate text-gray-600">
                        {t.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            updateTourStatus(t.id, e.target.value)
                          }
                          className="text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
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
