import { useState } from "react";
import {
  Search,
  UserRound,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function BuyersRenters() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      type: "Buyer",
      activity: 12,
      status: "Active",
    },
    {
      id: 2,
      name: "Priya N",
      email: "priya@gmail.com",
      phone: "9845671230",
      type: "Renter",
      activity: 8,
      status: "Active",
    },
    {
      id: 3,
      name: "Arjun Kumar",
      email: "arjun@gmail.com",
      phone: "9988776655",
      type: "Buyer",
      activity: 15,
      status: "Active",
    },
    {
      id: 4,
      name: "Sneha Rao",
      email: "sneha@gmail.com",
      phone: "9123456789",
      type: "Renter",
      activity: 6,
      status: "Inactive",
    },
    {
      id: 5,
      name: "Kiran S",
      email: "kiran@gmail.com",
      phone: "9012345678",
      type: "Buyer",
      activity: 10,
      status: "Active",
    },
    {
      id: 6,
      name: "Ananya R",
      email: "ananya@gmail.com",
      phone: "9876123456",
      type: "Renter",
      activity: 9,
      status: "Active",
    },
  ]);

  const toggleStatus = (id) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value) ||
      user.phone.includes(value) ||
      user.type.toLowerCase().includes(value)
    );
  });

  const buyers = users.filter((user) => user.type === "Buyer").length;
  const renters = users.filter((user) => user.type === "Renter").length;
  const active = users.filter((user) => user.status === "Active").length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buyers & Renters
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage buyers, renters and their activity
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {users.length} Users
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Buyers
          </p>
          <p className="text-2xl font-bold mt-1">
            {buyers}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Renters
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {renters}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active Users
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {active}
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
            placeholder="Search buyer or renter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredUsers.map((user) => (

          <div
            key={user.id}
            className="bg-white border rounded-xl
            p-4 hover:shadow-md transition"
          >

            {/* User */}
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full
                  bg-purple-100 flex items-center justify-center">

                  <UserRound className="w-5 h-5 text-purple-600" />

                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {user.name}
                  </h2>

                  <p className="text-xs text-gray-500">
                    {user.type}
                  </p>
                </div>

              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user.type === "Buyer"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {user.type}
              </span>

            </div>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm">

              <p className="text-gray-600">
                📧 {user.email}
              </p>

              <p className="text-gray-600">
                📞 {user.phone}
              </p>

              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-4 h-4" />
                {user.activity} Activities
              </div>

            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between
              mt-4 pt-4 border-t">

              {user.status === "Active" ? (
                <span className="flex items-center gap-1
                  text-xs font-medium text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1
                  text-xs font-medium text-red-600">
                  <XCircle className="w-4 h-4" />
                  Inactive
                </span>
              )}

              <div className="flex gap-2">

                <button
                  className="p-2 rounded-lg
                  text-gray-600 hover:bg-gray-100"
                  title="View User"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleStatus(user.id)}
                  className="text-xs px-3 py-2 rounded-lg
                  border border-gray-300 hover:bg-gray-50"
                >
                  {user.status === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            No buyers or renters found.
          </p>
        </div>
      )}

    </div>
  );
}