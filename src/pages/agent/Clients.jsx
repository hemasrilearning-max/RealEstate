import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

export default function Clients() {
  const { agent } = useAuth();
  const { clients } = useData();
  const myClients = clients
    .filter((c) => c.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Clients</h2>
        <p className="text-sm text-gray-500">{myClients.length} clients</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myClients.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">
            No clients yet.
          </p>
        ) : (
          myClients.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-semibold">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.type === "Buyer"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{c.email}</p>
                <p>{c.phone}</p>
                {c.interestedIn && (
                  <p className="text-xs text-gray-500 mt-2">
                    Interested in: {c.interestedIn}
                  </p>
                )}
                {c.budget && (
                  <p className="text-xs text-gray-500">Budget: {c.budget}</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                Added {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
