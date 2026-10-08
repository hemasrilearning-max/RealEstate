import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  X,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function BuyersRenters() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch registered users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/users");

      const allUsers = response.data || [];

      // Only BUYER and SELLER users
      const customerUsers = allUsers.filter(
        (user) =>
          user.role === "BUYER" ||
          user.role === "RENTER"
      );

      setUsers(customerUsers);
    } catch (err) {
      console.error("Error fetching users:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view users.");
      } else {
        setError("Failed to load registered users.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get full name
  const getName = (user) => {
    const name = `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    return name || user.username || "Unknown User";
  };

  // Get display type
  const getUserType = (user) => {
    if (user.role === "BUYER") {
      return "Buyer";
    }

    return user.role || "User";
  };

  // Search
  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase().trim();

    const name = getName(user).toLowerCase();

    const matchesSearch =
      name.includes(value) ||
      user.email?.toLowerCase().includes(value) ||
      user.phone?.toLowerCase().includes(value) ||
      user.username?.toLowerCase().includes(value);

    const matchesFilter =
      filter === "All" ||
      (filter === "Buyer" && user.role === "BUYER") ||
      (filter === "Active" && user.status === "ACTIVE") ||
      (filter === "Inactive" && user.status === "INACTIVE");

    return matchesSearch && matchesFilter;
  });

  // Statistics
  const buyers = users.filter(
    (user) => user.role === "BUYER"
  ).length;

  

  const active = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  // Activate / Deactivate
  const toggleStatus = async (user) => {
    const newStatus =
      user.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      const response = await axiosInstance.patch(
        `/api/users/${user.id}/status`,
        {
          status: newStatus,
        }
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? response.data
            : item
        )
      );

      if (selectedUser?.id === user.id) {
        setSelectedUser(response.data);
      }
    } catch (err) {
      console.error("Status update failed:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update user status."
      );
    }
  };

  // Delete user
  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${getName(user)}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(
        `/api/users/${user.id}`
      );

      setUsers((current) =>
        current.filter(
          (item) => item.id !== user.id
        )
      );

      setSelectedUser(null);
    } catch (err) {
      console.error("Delete failed:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete user."
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buyers & Renters
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage registered buyers and customers
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {users.length} Users
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Buyers
          </p>

          <p className="text-2xl font-bold mt-1">
            {buyers}
          </p>
        </div>

        

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active Users
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {active}
          </p>
        </div>

      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2
              -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name, email, phone or username..."
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

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg
            px-4 py-3 focus:outline-none
            focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Users</option>
            <option value="Buyer">Buyers</option>

            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border rounded-xl p-12 text-center">

          <div
            className="w-8 h-8 border-4 border-purple-200
            border-t-purple-600 rounded-full
            animate-spin mx-auto"
          />

          <p className="text-sm text-gray-500 mt-4">
            Loading registered users...
          </p>

        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl p-10 text-center">

          <XCircle className="w-10 h-10 text-red-400 mx-auto" />

          <p className="text-red-500 mt-3">
            {error}
          </p>

          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2
            bg-purple-600 text-white rounded-lg"
          >
            Try Again
          </button>

        </div>
      )}

      {/* User Cards */}
      {!loading &&
        !error &&
        filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {filteredUsers.map((user) => (

              <div
                key={user.id}
                className="bg-white border border-gray-200
                rounded-xl p-5 hover:shadow-md transition"
              >

                {/* User Header */}
                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className="w-11 h-11 rounded-full
                      bg-purple-100 flex items-center
                      justify-center"
                    >
                      <UserRound
                        className="w-5 h-5 text-purple-600"
                      />
                    </div>

                    <div>

                      <h2 className="font-semibold text-gray-900">
                        {getName(user)}
                      </h2>

                      <p className="text-xs text-gray-500">
                        {getUserType(user)}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`text-xs px-2 py-1
                    rounded-full ${
                      user.role === "BUYER"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {getUserType(user)}
                  </span>

                </div>

                {/* Details */}
                <div className="mt-5 space-y-2 text-sm">

                  <p className="text-gray-600">
                    📧 {user.email || "-"}
                  </p>

                  <p className="text-gray-600">
                    📞 {user.phone || "-"}
                  </p>

                  <p className="text-gray-500">
                    Username: {user.username || "-"}
                  </p>

                </div>

                {/* Bottom */}
                <div
                  className="flex items-center
                  justify-between mt-5 pt-4 border-t"
                >

                  {/* Status */}
                  {user.status === "ACTIVE" ? (
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
                      Inactive
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">

                    {/* View */}
                    <button
                      onClick={() =>
                        setSelectedUser(user)
                      }
                      className="p-2 rounded-lg
                      text-gray-600
                      hover:bg-gray-100"
                      title="View User"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Activate / Deactivate */}
                    <button
                      onClick={() =>
                        toggleStatus(user)
                      }
                      className="text-xs px-3 py-2
                      rounded-lg border
                      border-gray-300
                      hover:bg-gray-50"
                    >
                      {user.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        deleteUser(user)
                      }
                      className="p-2 rounded-lg
                      text-red-500
                      hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      {/* No Results */}
      {!loading &&
        !error &&
        filteredUsers.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">

            <Search
              className="w-10 h-10
              text-gray-300 mx-auto"
            />

            <p className="text-gray-500 mt-3">
              No registered buyers  found.
            </p>

          </div>
        )}

      {/* View User Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/40
          flex items-center justify-center
          z-50 p-4"
        >

          <div
            className="bg-white rounded-2xl
            w-full max-w-md p-6 shadow-xl"
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Registered customer information
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="p-2 rounded-lg
                hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* User Details */}
            <div className="mt-6 space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Full Name
                </p>

                <p className="font-medium text-gray-900">
                  {getName(selectedUser)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Username
                </p>

                <p className="font-medium text-gray-900">
                  {selectedUser.username || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="font-medium text-gray-900">
                  {selectedUser.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>

                <p className="font-medium text-gray-900">
                  {selectedUser.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Role
                </p>

                <p className="font-medium text-gray-900">
                  {selectedUser.role || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Account Status
                </p>

                <p
                  className={`font-medium ${
                    selectedUser.status === "ACTIVE"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedUser.status || "-"}
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t">

              <button
                onClick={() =>
                  toggleStatus(selectedUser)
                }
                className="px-4 py-2 rounded-lg
                border border-gray-300
                hover:bg-gray-50"
              >
                {selectedUser.status === "ACTIVE"
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                onClick={() =>
                  deleteUser(selectedUser)
                }
                className="px-4 py-2 rounded-lg
                bg-red-600 text-white
                hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}