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

export default function Agents() {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya@gmail.com",
      phone: "9876543210",
      properties: 18,
      status: "Active",
    },
    {
      id: 2,
      name: "Arjun Mehta",
      email: "arjun@gmail.com",
      phone: "9845671230",
      properties: 12,
      status: "Active",
    },
    {
      id: 3,
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      phone: "9988776655",
      properties: 8,
      status: "Inactive",
    },
    {
      id: 4,
      name: "Sneha Rao",
      email: "sneha@gmail.com",
      phone: "9123456789",
      properties: 15,
      status: "Active",
    },
    {
      id: 5,
      name: "Kiran Kumar",
      email: "kiran@gmail.com",
      phone: "9012345678",
      properties: 6,
      status: "Inactive",
    },
    {
      id: 6,
      name: "Ananya Singh",
      email: "ananya@gmail.com",
      phone: "9876123456",
      properties: 21,
      status: "Active",
    },
  ]);

  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    properties: 0,
  });

  const toggleStatus = (id) => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status:
                agent.status === "Active" ? "Inactive" : "Active",
            }
          : agent
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewAgent((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddAgent = (e) => {
    e.preventDefault();

    if (
      !newAgent.name ||
      !newAgent.email ||
      !newAgent.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newId =
      agents.length > 0
        ? Math.max(...agents.map((agent) => agent.id)) + 1
        : 1;

    const agentToAdd = {
      id: newId,
      name: newAgent.name,
      email: newAgent.email,
      phone: newAgent.phone,
      properties: Number(newAgent.properties) || 0,
      status: "Active",
    };

    setAgents((current) => [agentToAdd, ...current]);

    setNewAgent({
      name: "",
      email: "",
      phone: "",
      properties: 0,
    });

    setShowAddForm(false);
  };

  const filteredAgents = agents.filter((agent) => {
    const value = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(value) ||
      agent.email.toLowerCase().includes(value) ||
      agent.phone.includes(value)
    );
  });

  const activeAgents = agents.filter(
    (agent) => agent.status === "Active"
  ).length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agents
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage registered real estate agents
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="text-sm text-gray-500">
            {agents.length} Agents
          </div>

          {/* Add Agent Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5
            bg-purple-600 text-white rounded-lg
            text-sm font-medium hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>

        </div>

      </div>

      {/* Add Agent Form */}
      {showAddForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">

          {/* Form Header */}
          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add Agent
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter the details of the new real estate agent
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

          </div>

          {/* Form */}
          <form onSubmit={handleAddAgent}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  placeholder="Enter agent name"
                  className="w-full border border-gray-300
                  rounded-lg px-4 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={newAgent.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full border border-gray-300
                  rounded-lg px-4 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={newAgent.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300
                  rounded-lg px-4 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

              {/* Properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Properties
                </label>

                <input
                  type="number"
                  min="0"
                  name="properties"
                  value={newAgent.properties}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full border border-gray-300
                  rounded-lg px-4 py-2.5
                  focus:outline-none focus:ring-2
                  focus:ring-purple-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t">

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 border border-gray-300
                text-gray-700 rounded-lg text-sm
                font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2
                px-5 py-2.5 bg-purple-600
                text-white rounded-lg text-sm
                font-medium hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Agent
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Total Agents
          </p>

          <p className="text-2xl font-bold mt-1">
            {agents.length}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active Agents
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeAgents}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Total Listings
          </p>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {agents.reduce(
              (total, agent) => total + agent.properties,
              0
            )}
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
            placeholder="Search agent by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>

      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredAgents.map((agent) => (

          <div
            key={agent.id}
            className="bg-white border rounded-xl
            p-4 hover:shadow-md transition"
          >

            {/* Top */}
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full
                  bg-purple-100 flex items-center
                  justify-center">

                  <UserRound className="w-5 h-5 text-purple-600" />

                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {agent.name}
                  </h2>

                  <p className="text-xs text-gray-500">
                    Real Estate Agent
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
                📧 {agent.email}
              </p>

              <p className="text-gray-600">
                📞 {agent.phone}
              </p>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                {agent.properties} Properties
              </div>

            </div>

            {/* Status */}
            <div className="flex items-center justify-between
              mt-4 pt-4 border-t">

              {agent.status === "Active" ? (
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
                  title="View Agent"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleStatus(agent.id)}
                  className="text-xs px-3 py-2 rounded-lg
                  border border-gray-300
                  hover:bg-gray-50"
                >
                  {agent.status === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {filteredAgents.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            No agents found.
          </p>
        </div>
      )}

    </div>
  );
}