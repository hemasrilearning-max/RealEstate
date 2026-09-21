import { useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Filter,
} from "lucide-react";

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      role: "Buyer",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@gmail.com",
      phone: "9876543211",
      role: "Owner",
      status: "Active",
    },
    {
      id: 3,
      name: "Amit Verma",
      email: "amit@gmail.com",
      phone: "9876543212",
      role: "Agent",
      status: "Active",
    },
    {
      id: 4,
      name: "Neha Rao",
      email: "neha@gmail.com",
      phone: "9876543213",
      role: "Renter",
      status: "Inactive",
    },
    {
      id: 5,
      name: "Kiran Kumar",
      email: "kiran@gmail.com",
      phone: "9876543214",
      role: "Buyer",
      status: "Active",
    },
    {
      id: 6,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      phone: "9876543215",
      role: "Owner",
      status: "Active",
    },
  ]);

  // Search + filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Change user status
  const toggleStatus = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : user
      )
    );
  };

  return (
    <div className="w-full bg-gray-50 px-6 pt-2">

    {/* Page Heading */}
<div className="px-6 pt-2 pb-5">
  <h1 className="text-2xl font-bold text-gray-900">
    Users
  </h1>

  <p className="text-sm text-gray-500 mt-1">
    Manage all registered users
  </p>
</div>

      {/* Main */}
      <main className="p-8">

        {/* Top statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {users.length}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Active Users
            </p>

            <h2 className="text-2xl font-bold text-green-600 mt-2">
              {users.filter((u) => u.status === "Active").length}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Inactive Users
            </p>

            <h2 className="text-2xl font-bold text-red-600 mt-2">
              {users.filter((u) => u.status === "Inactive").length}
            </h2>
          </div>

        </div>

        {/* Search and filters */}
        <div className="bg-white border rounded-xl p-5 mb-6">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search */}
            <div className="relative flex-1">

              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* Role */}
            <div className="flex items-center gap-2">

              <Filter size={18} className="text-gray-500" />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5"
              >
                <option value="All">All Roles</option>
                <option value="Buyer">Buyer</option>
                <option value="Renter">Renter</option>
                <option value="Owner">Owner</option>
                <option value="Agent">Agent</option>
              </select>

            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

          </div>

        </div>

        {/* Users table */}
        <div className="bg-white border rounded-xl overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="font-semibold text-gray-900">
              All Users
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {filteredUsers.length} users found
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    User
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Phone
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="hover:bg-gray-50"
                  >

                    {/* User */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                          {user.name.charAt(0)}
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">

                      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                        {user.role}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        {/* View */}
                        <button
                          title="View User"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}
                        <button
                          title="Edit User"
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Edit size={17} />
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          title={
                            user.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() =>
                            toggleStatus(user.id)
                          }
                          className={`p-2 rounded-lg ${
                            user.status === "Active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.status === "Active" ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* No results */}
          {filteredUsers.length === 0 && (
            <div className="p-10 text-center">

              <UsersIcon className="mx-auto text-gray-300" size={40} />

              <p className="text-gray-500 mt-3">
                No users found
              </p>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}