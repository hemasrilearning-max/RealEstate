import { useState } from "react";
import {
  Search,
  UserRound,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Plus,
  X,
} from "lucide-react";

export default function Owners() {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [owners, setOwners] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      phone: "9876543210",
      properties: 5,
      status: "Active",
    },
    {
      id: 2,
      name: "Anil Raj",
      email: "anil@gmail.com",
      phone: "9845671230",
      properties: 3,
      status: "Active",
    },
    {
      id: 3,
      name: "Meena Devi",
      email: "meena@gmail.com",
      phone: "9988776655",
      properties: 4,
      status: "Inactive",
    },
    {
      id: 4,
      name: "Vikram S",
      email: "vikram@gmail.com",
      phone: "9123456789",
      properties: 2,
      status: "Active",
    },
    {
      id: 5,
      name: "Sneha R",
      email: "sneha@gmail.com",
      phone: "9012345678",
      properties: 6,
      status: "Active",
    },
    {
      id: 6,
      name: "Kiran Kumar",
      email: "kiran@gmail.com",
      phone: "9876123456",
      properties: 3,
      status: "Inactive",
    },
  ]);

  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    properties: 0,
  });

  const toggleStatus = (id) => {
    setOwners((current) =>
      current.map((owner) =>
        owner.id === id
          ? {
              ...owner,
              status:
                owner.status === "Active" ? "Inactive" : "Active",
            }
          : owner
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewOwner((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddOwner = (e) => {
    e.preventDefault();

    if (
      !newOwner.name ||
      !newOwner.email ||
      !newOwner.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const owner = {
      id: Date.now(),
      name: newOwner.name,
      email: newOwner.email,
      phone: newOwner.phone,
      properties: Number(newOwner.properties) || 0,
      status: "Active",
    };

    setOwners((current) => [owner, ...current]);

    setNewOwner({
      name: "",
      email: "",
      phone: "",
      properties: 0,
    });

    setShowAddForm(false);
  };

  const filteredOwners = owners.filter((owner) => {
    const value = search.toLowerCase();

    return (
      owner.name.toLowerCase().includes(value) ||
      owner.email.toLowerCase().includes(value) ||
      owner.phone.includes(value)
    );
  });

  const activeOwners = owners.filter(
    (owner) => owner.status === "Active"
  ).length;

  const totalProperties = owners.reduce(
    (total, owner) => total + owner.properties,
    0
  );

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

        <div className="flex items-center gap-4">

          <div className="text-sm text-gray-500">
            {owners.length} Owners
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2
            bg-purple-600 text-white
            px-4 py-2.5 rounded-lg
            hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Owner
          </button>

        </div>
      </div>

      {/* Add Owner Form */}
      {showAddForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Add Owner
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter owner details below
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

          </div>

          <form onSubmit={handleAddOwner}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={newOwner.name}
                  onChange={handleInputChange}
                  placeholder="Enter owner name"
                  className="w-full border border-gray-300
                  rounded-lg px-3 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={newOwner.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full border border-gray-300
                  rounded-lg px-3 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>

                <input
                  type="text"
                  name="phone"
                  value={newOwner.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  maxLength="10"
                  className="w-full border border-gray-300
                  rounded-lg px-3 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Properties
                </label>

                <input
                  type="number"
                  name="properties"
                  value={newOwner.properties}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Enter number of properties"
                  className="w-full border border-gray-300
                  rounded-lg px-3 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-lg
                border border-gray-300
                text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg
                bg-purple-600 text-white
                hover:bg-purple-700"
              >
                Add Owner
              </button>

            </div>

          </form>

        </div>
      )}

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
            Total Properties
          </p>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {totalProperties}
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

      {/* Owner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredOwners.map((owner) => (

          <div
            key={owner.id}
            className="bg-white border rounded-xl
            p-4 hover:shadow-md transition"
          >

            {/* Top */}
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full
                  bg-purple-100 flex items-center justify-center">

                  <UserRound className="w-5 h-5 text-purple-600" />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-900">
                    {owner.name}
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
                📧 {owner.email}
              </p>

              <p className="text-gray-600">
                📞 {owner.phone}
              </p>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                {owner.properties} Properties
              </div>

            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between
              mt-4 pt-4 border-t">

              {owner.status === "Active" ? (

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
                  title="View Owner"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleStatus(owner.id)}
                  className="text-xs px-3 py-2 rounded-lg
                  border border-gray-300 hover:bg-gray-50"
                >
                  {owner.status === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {filteredOwners.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            No owners found.
          </p>
        </div>
      )}

    </div>
  );
}