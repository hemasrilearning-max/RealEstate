
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

export default function Clients() {
  const { agent } = useAuth();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET CURRENT BROKER ID
  // =====================================================

  const getBrokerId = () => {
    // First use AuthContext
    if (agent?.id) {
      return agent.id;
    }

    if (agent?.userId) {
      return agent.userId;
    }

    // Fallback to localStorage
    try {
      const storedUser = localStorage.getItem("authUser");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return user?.id || user?.userId || null;
    } catch (err) {
      console.error("Unable to read logged-in user:", err);
      return null;
    }
  };

  // =====================================================
  // LOAD CLIENTS FROM DATABASE
  // =====================================================

  const loadClients = async () => {
    setError("");

    const brokerId = getBrokerId();

    if (!brokerId) {
      setError(
        "Broker information is not available. Please login again."
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log("Loading clients for broker:", brokerId);

      const response =
        await brokerService.brokerClients(brokerId);

      console.log("Clients API response:", response);

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: [...]
       * }
       */

      const clientData = Array.isArray(response?.data)
        ? response.data
        : [];

      setClients(clientData);

    } catch (err) {
      console.error("Failed to load clients:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load clients.";

      setError(message);
      setClients([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CLIENTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadClients();
  }, [agent?.id, agent?.userId]);

  // =====================================================
  // SORT BY CREATED DATE
  // =====================================================

  const myClients = [...clients].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  // =====================================================
  // CLIENT TYPE
  // =====================================================

  const getClientType = (client) => {
    const type =
      client?.clientType ||
      client?.type ||
      "";

    switch (type.toString().toUpperCase()) {
      case "BUYER":
        return "Buyer";

      case "SELLER":
        return "Seller";

      case "BOTH":
        return "Both";

      default:
        return type || "Client";
    }
  };

  // =====================================================
  // CLIENT TYPE STYLE
  // =====================================================

  const getClientTypeStyle = (client) => {
    const type = getClientType(client);

    if (type === "Buyer") {
      return "bg-blue-50 text-blue-700";
    }

    if (type === "Seller") {
      return "bg-emerald-50 text-emerald-700";
    }

    return "bg-purple-50 text-purple-700";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Clients
          </h2>

          <p className="text-sm text-gray-500">
            Loading clients...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse"
            >

              <div className="flex items-center gap-3 mb-3">

                <div className="w-10 h-10 bg-gray-200 rounded-full" />

                <div className="space-y-2">

                  <div className="h-4 bg-gray-200 rounded w-28" />

                  <div className="h-3 bg-gray-200 rounded w-16" />

                </div>

              </div>

              <div className="space-y-2">

                <div className="h-3 bg-gray-200 rounded w-40" />

                <div className="h-3 bg-gray-200 rounded w-32" />

                <div className="h-3 bg-gray-200 rounded w-36" />

              </div>

            </div>
          ))}

        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Clients
        </h2>

        <p className="text-sm text-gray-500">
          {myClients.length} clients
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">

          <span>{error}</span>

          <button
            type="button"
            onClick={loadClients}
            className="font-medium underline hover:no-underline"
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          CLIENT CARDS
      ================================================= */}

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

              {/* =========================================
                  CLIENT NAME + TYPE
              ========================================= */}

              <div className="flex items-center gap-3 mb-3">

                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-semibold">

                  {c.name
                    ? c.name.charAt(0).toUpperCase()
                    : "C"}

                </div>

                <div>

                  <p className="font-semibold text-gray-900">
                    {c.name || "Unnamed Client"}
                  </p>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getClientTypeStyle(
                      c
                    )}`}
                  >
                    {getClientType(c)}
                  </span>

                </div>

              </div>

              {/* =========================================
                  CLIENT DETAILS
              ========================================= */}

              <div className="space-y-1 text-sm text-gray-600">

                {c.email && (
                  <p>{c.email}</p>
                )}

                {c.phone && (
                  <p>{c.phone}</p>
                )}

                {c.address && (
                  <p>{c.address}</p>
                )}

                {/* =====================================
                    OPTIONAL FRONTEND FIELDS
                    Kept for compatibility
                ===================================== */}

                {c.interestedIn && (
                  <p className="text-xs text-gray-500 mt-2">
                    Interested in: {c.interestedIn}
                  </p>
                )}

                {c.budget && (
                  <p className="text-xs text-gray-500">
                    Budget: {c.budget}
                  </p>
                )}

              </div>

              {/* =========================================
                  CREATED DATE
              ========================================= */}

              <div className="mt-3 pt-3 border-t text-xs text-gray-400">

                Added{" "}

                {c.createdAt
                  ? new Date(
                      c.createdAt
                    ).toLocaleDateString()
                  : "N/A"}

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

