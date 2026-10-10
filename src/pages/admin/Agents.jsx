import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");

  // ============================================================
  // FETCH AGENTS
  // ============================================================

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        "/api/users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status}`
        );
      }

      const data = await response.json();

      /*
       * In this project:
       *
       * BROKER = AGENT
       *
       * So we get all users and keep only BROKER users.
       */
      const brokerUsers = data.filter(
        (user) =>
          String(user.role).toUpperCase() === "BROKER"
      );

      setAgents(brokerUsers);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD AGENTS WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    fetchAgents();
  }, []);

  // ============================================================
  // GET FULL NAME
  // ============================================================

  const getFullName = (agent) => {
    return `${agent.firstName || ""} ${
      agent.lastName || ""
    }`.trim();
  };

  // ============================================================
  // VIEW AGENT
  // ============================================================

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
  };

  // ============================================================
  // ACTIVATE / DEACTIVATE AGENT
  // ============================================================

  const toggleStatus = async (agent) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const currentStatus =
        String(agent.status).toUpperCase();

      const newStatus =
        currentStatus === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      const response = await fetch(
        `/api/users/${agent.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update agent status"
        );
      }

      // Fetch latest data from backend
      await fetchAgents();
    } catch (err) {
      console.error(
        "Error changing agent status:",
        err
      );

      setPopupMessage("Failed to change agent status.");
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredAgents = agents.filter((agent) => {
    const searchValue = search.toLowerCase();

    const name =
      getFullName(agent).toLowerCase();

    const username =
      (agent.username || "").toLowerCase();

    const email =
      (agent.email || "").toLowerCase();

    const phone =
      agent.phone || "";

    return (
      name.includes(searchValue) ||
      username.includes(searchValue) ||
      email.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  // ============================================================
  // ACTIVE AGENTS
  // ============================================================

  const activeAgents = agents.filter(
    (agent) =>
      String(agent.status).toUpperCase() ===
      "ACTIVE"
  ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6">

      {(selectedAgent || popupMessage) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
          bg-black/50 p-4"
          onClick={() => {
            setSelectedAgent(null);
            setPopupMessage("");
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-popup-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="agent-popup-title"
                className="text-lg font-semibold text-gray-900"
              >
                {selectedAgent ? "Agent Details" : "Unable to update agent"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedAgent(null);
                  setPopupMessage("");
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedAgent ? (
              <dl className="space-y-3 text-sm">
                {[
                  ["Name", getFullName(selectedAgent) || selectedAgent.username || "N/A"],
                  ["Username", selectedAgent.username || "N/A"],
                  ["Email", selectedAgent.email || "N/A"],
                  ["Phone", selectedAgent.phone || "N/A"],
                  ["Role", selectedAgent.role || "N/A"],
                  ["Status", selectedAgent.status || "N/A"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <dt className="w-24 shrink-0 font-medium text-gray-500">
                      {label}
                    </dt>
                    <dd className="break-all text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-red-600">{popupMessage}</p>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedAgent(null);
                setPopupMessage("");
              }}
              className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2
              font-medium text-white hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agents
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage registered real estate agents
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {agents.length} Agents
        </div>

      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Total Agents */}

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Total Agents
          </p>

          <p className="text-2xl font-bold mt-1">
            {agents.length}
          </p>

        </div>

        {/* Active Agents */}

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Active Agents
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeAgents}
          </p>

        </div>

        {/* Broker Users */}

        <div className="bg-white border rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Broker Users
          </p>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {agents.length}
          </p>

        </div>

      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="bg-white border rounded-xl p-4 mb-6">

        <div className="relative">

          <Search
            className="absolute left-3 top-1/2
            -translate-y-1/2 w-5 h-5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search agent by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>

      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center">

          <p className="text-gray-500">
            Loading agents...
          </p>

        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="bg-white border rounded-xl p-10 text-center">

          <p className="text-red-500">
            {error}
          </p>

          <button
            onClick={fetchAgents}
            className="mt-4 px-4 py-2 rounded-lg
            bg-purple-600 text-white
            hover:bg-purple-700"
          >
            Retry
          </button>

        </div>
      )}

      {/* ======================================================
          AGENT CARDS
      ====================================================== */}

      {!loading &&
        !error &&
        filteredAgents.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {filteredAgents.map((agent) => {

              const fullName =
                getFullName(agent) ||
                agent.username ||
                "Agent";

              const isActive =
                String(agent.status).toUpperCase() ===
                "ACTIVE";

              return (
                <div
                  key={agent.id}
                  className="bg-white border rounded-xl
                  p-4 hover:shadow-md transition"
                >

                  {/* =================================================
                      TOP SECTION
                  ================================================= */}

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      {/* Avatar */}

                      <div
                        className="w-11 h-11 rounded-full
                        bg-purple-100
                        flex items-center
                        justify-center"
                      >
                        <UserRound
                          className="w-5 h-5 text-purple-600"
                        />
                      </div>

                      {/* Name */}

                      <div>

                        <h2 className="font-semibold text-gray-900">
                          {fullName}
                        </h2>

                        <p className="text-xs text-gray-500">
                          Real Estate Agent
                        </p>

                      </div>

                    </div>

                   

                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="mt-4 space-y-2 text-sm">

                    {/* Email */}

                    <p className="text-gray-600">
                      📧 {agent.email || "N/A"}
                    </p>

                    {/* Phone */}

                    <p className="text-gray-600">
                      📞 {agent.phone || "N/A"}
                    </p>

                    {/* Role */}

                    <div className="flex items-center gap-2 text-gray-600">

                      <Building2 className="w-4 h-4" />

                      Broker / Agent

                    </div>

                  </div>

                  {/* =================================================
                      BOTTOM SECTION
                  ================================================= */}

                  <div
                    className="flex items-center
                    justify-between mt-4 pt-4
                    border-t"
                  >

                    {/* STATUS */}

                    {isActive ? (

                      <span
                        className="flex items-center gap-1
                        text-xs font-medium
                        text-green-600"
                      >

                        <CheckCircle className="w-4 h-4" />

                        Active

                      </span>

                    ) : (

                      <span
                        className="flex items-center gap-1
                        text-xs font-medium
                        text-red-600"
                      >

                        <XCircle className="w-4 h-4" />

                        {agent.status || "Inactive"}

                      </span>

                    )}

                    {/* ACTIONS */}

                    <div className="flex gap-2">

                      {/* VIEW */}

                      <button
                        onClick={() =>
                          handleViewAgent(agent)
                        }
                        className="p-2 rounded-lg
                        text-gray-600
                        hover:bg-gray-100"
                        title="View Agent"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        onClick={() =>
                          toggleStatus(agent)
                        }
                        className="text-xs px-3 py-2
                        rounded-lg border
                        border-gray-300
                        hover:bg-gray-50"
                      >
                        {isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      {/* ======================================================
          NO AGENTS
      ====================================================== */}

      {!loading &&
        !error &&
        filteredAgents.length === 0 && (

          <div className="bg-white border rounded-xl p-10 text-center">

            <p className="text-gray-500">
              {search
                ? "No agents match your search."
                : "No agents found."}
            </p>

          </div>
        )}

    </div>
  );
}