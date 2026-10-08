import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();

      // Only SELLER users
      const sellerUsers = data.filter(
        (user) => String(user.role).toUpperCase() === "SELLER"
      );

      setOwners(sellerUsers);
    } catch (err) {
      console.error("Error fetching owners:", err);
      setError("Failed to load owners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const getFullName = (owner) => {
    return `${owner.firstName || ""} ${owner.lastName || ""}`.trim();
  };

  const handleViewOwner = (owner) => {
    alert(
      `Owner Details\n\n` +
        `Name: ${getFullName(owner) || owner.username}\n` +
        `Email: ${owner.email || "N/A"}\n` +
        `Phone: ${owner.phone || "N/A"}\n` +
        `Status: ${owner.status || "N/A"}`
    );
  };

  const toggleStatus = async (owner) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const currentStatus = String(owner.status).toUpperCase();

      const newStatus =
        currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const response = await fetch(
        `http://localhost:8080/api/users/${owner.id}/status`,
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
        throw new Error("Failed to update owner status");
      }

      // Get latest data from backend
      fetchOwners();
    } catch (err) {
      console.error("Error changing owner status:", err);
      alert("Failed to change owner status.");
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const searchValue = search.toLowerCase();

    const name = getFullName(owner).toLowerCase();
    const email = (owner.email || "").toLowerCase();
    const phone = owner.phone || "";

    return (
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  const activeOwners = owners.filter(
    (owner) =>
      String(owner.status).toUpperCase() === "ACTIVE"
  ).length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Owners
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage property owners and their listings
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {owners.length} Owners
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Total Owners
          </p>

          <p className="text-2xl font-bold mt-1">
            {owners.length}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active Owners
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeOwners}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Seller Users
          </p>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {owners.length}
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="relative">

          <Search
            className="absolute left-3 top-1/2
            -translate-y-1/2 w-5 h-5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search owner by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            Loading owners...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-red-500">
            {error}
          </p>

          <button
            onClick={fetchOwners}
            className="mt-4 px-4 py-2 rounded-lg
            bg-purple-600 text-white hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Owner Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {filteredOwners.map((owner) => {
            const fullName =
              getFullName(owner) ||
              owner.username ||
              "Owner";

            const isActive =
              String(owner.status).toUpperCase() === "ACTIVE";

            return (
              <div
                key={owner.id}
                className="bg-white border rounded-xl
                p-4 hover:shadow-md transition"
              >

                {/* Top */}
                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className="w-11 h-11 rounded-full
                      bg-purple-100 flex items-center justify-center"
                    >
                      <UserRound className="w-5 h-5 text-purple-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {fullName}
                      </h2>

                      <p className="text-xs text-gray-500">
                        Property Owner
                      </p>
                    </div>

                  </div>

                  <button className="p-1 rounded hover:bg-gray-100">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-sm">

                  <p className="text-gray-600">
                    📧 {owner.email || "N/A"}
                  </p>

                  <p className="text-gray-600">
                    📞 {owner.phone || "N/A"}
                  </p>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    Property Owner
                  </div>

                </div>

                {/* Bottom */}
                <div
                  className="flex items-center justify-between
                  mt-4 pt-4 border-t"
                >

                  {isActive ? (
                    <span
                      className="flex items-center gap-1
                      text-xs font-medium text-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1
                      text-xs font-medium text-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                      {owner.status || "Inactive"}
                    </span>
                  )}

                  <div className="flex gap-2">

                    {/* View */}
                    <button
                      onClick={() => handleViewOwner(owner)}
                      className="p-2 rounded-lg
                      text-gray-600 hover:bg-gray-100"
                      title="View Owner"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Activate / Deactivate */}
                    <button
                      onClick={() => toggleStatus(owner)}
                      className="text-xs px-3 py-2 rounded-lg
                      border border-gray-300 hover:bg-gray-50"
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

      {/* No Owners */}
      {!loading &&
        !error &&
        filteredOwners.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No owners found.
            </p>
          </div>
        )}

    </div>
  );
}