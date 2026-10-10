import { useEffect, useRef, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Eye,
  Edit,
  X,
  UserX,
  UserCheck,
  Trash2,
  Plus,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";

export default function Users() {
  const [admins, setAdmins] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const messageRef = useRef(null);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // =========================
  // ADD ADMIN FORM
  // =========================

  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    phone: "",
    role: "ADMIN",
  });

  // =========================
  // EDIT ADMIN FORM
  // =========================

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "ADMIN",
  });

  // =========================
  // MESSAGE SCROLL
  // =========================

  useEffect(() => {
    if (message || error) {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [message, error]);

  // =========================
  // GET ADMIN NAME
  // =========================

  const getAdminName = (admin) => {
    if (!admin) return "Unknown Admin";

    const firstName =
      admin.firstName ??
      admin.first_name ??
      "";

    const lastName =
      admin.lastName ??
      admin.last_name ??
      "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || admin.username || "Unknown Admin";
  };

  // =========================
  // GET STATUS
  // =========================

  const getStatus = (admin) => {
    return admin?.status ?? "Unknown";
  };

  // =========================
  // NORMALIZE ADMIN
  // =========================

  const normalizeAdmin = (admin) => {
    if (!admin) return {};

    return {
      ...admin,

      firstName:
        admin.firstName ??
        admin.first_name ??
        "",

      lastName:
        admin.lastName ??
        admin.last_name ??
        "",

      email: admin.email ?? "",

      phone: admin.phone ?? "",

      username: admin.username ?? "",

      role:
        admin.role ??
        admin.userRole ??
        "",

      accountType:
        admin.accountType ??
        admin.account_type ??
        "",

      status: admin.status ?? "",
    };
  };

  // =========================
  // FETCH ADMINS
  // =========================

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/users");

      const data = response.data;

      const userList = Array.isArray(data)
        ? data
        : data?.users ||
          data?.content ||
          data?.data ||
          [];

      // IMPORTANT:
      // Only ADMIN users are shown.
      // BUYER, SELLER, BROKER, SUPER_ADMIN are excluded.

      const adminList = userList
        .filter(
          (user) =>
            String(
              user?.role ??
              user?.userRole ??
              ""
            ).toUpperCase() === "ADMIN"
        )
        .map(normalizeAdmin);

      setAdmins(adminList);
    } catch (err) {
      console.error("Error fetching admins:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load admins."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchAdmins();
  }, []);

  // =========================
  // SEARCH + STATUS FILTER
  // =========================

  const filteredAdmins = admins.filter((admin) => {
    const name = getAdminName(admin).toLowerCase();

    const email = String(
      admin.email || ""
    ).toLowerCase();

    const phone = String(
      admin.phone || ""
    ).toLowerCase();

    const searchText = search.toLowerCase();

    const matchesSearch =
      name.includes(searchText) ||
      email.includes(searchText) ||
      phone.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      String(getStatus(admin)).toUpperCase() ===
        statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // =========================
  // ADD ADMIN MODAL
  // =========================

  const openAddModal = () => {
    setAddForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      username: "",
      phone: "",
      role: "ADMIN",
    });

    setError("");
    setMessage("");

    setShowAddModal(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;

    setAddForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD ADMIN
  // =========================

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const requestData = {
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        email: addForm.email,
        password: addForm.password,
        username: addForm.username,
        phone: addForm.phone,
        role: "ADMIN",
      };

      await axiosInstance.post(
        "/api/users",
        requestData
      );

      setShowAddModal(false);

      setMessage(
        "Admin created successfully."
      );

      await fetchAdmins();
    } catch (err) {
      console.error(
        "Error creating admin:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to create admin."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // VIEW ADMIN
  // =========================

  const handleViewAdmin = async (admin) => {
    try {
      setError("");

      const response =
        await axiosInstance.get(
          `/api/users/${admin.id}`
        );

      const user = normalizeAdmin(
        response.data
      );

      // Safety check
      if (
        String(user.role).toUpperCase() !==
        "ADMIN"
      ) {
        setError(
          "Only ADMIN accounts can be viewed here."
        );
        return;
      }

      setSelectedAdmin(user);
      setShowViewModal(true);
    } catch (err) {
      console.error(
        "Error fetching admin:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load admin details."
      );
    }
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setEditForm({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: "ADMIN",
    });

    setError("");
    setMessage("");

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // EDIT ADMIN
  // =========================

  const handleEditAdmin = async (e) => {
    e.preventDefault();

    if (!editingAdmin) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const requestData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        role: "ADMIN",
      };

      await axiosInstance.put(
        `/api/users/${editingAdmin.id}`,
        requestData
      );

      setShowEditModal(false);
      setEditingAdmin(null);

      setMessage(
        "Admin updated successfully."
      );

      await fetchAdmins();
    } catch (err) {
      console.error(
        "Error updating admin:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update admin."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ACTIVATE / DEACTIVATE
  // =========================

  const toggleStatus = async (admin) => {
    const currentStatus = String(
      getStatus(admin)
    ).toUpperCase();

    const newStatus =
      currentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const action =
      newStatus === "ACTIVE"
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${getAdminName(
        admin
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await axiosInstance.patch(
        `/api/users/${admin.id}/status`,
        {
          status: newStatus,
        }
      );

      setMessage(
        `Admin ${
          action === "activate"
            ? "activated"
            : "deactivated"
        } successfully.`
      );

      await fetchAdmins();
    } catch (err) {
      console.error(
        "Error changing admin status:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to change admin status."
      );
    }
  };

  // =========================
  // DELETE ADMIN
  // =========================

  const handleDeleteAdmin = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${getAdminName(
        admin
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await axiosInstance.delete(
        `/api/users/${admin.id}`
      );

      setMessage(
        "Admin deleted successfully."
      );

      await fetchAdmins();
    } catch (err) {
      console.error(
        "Error deleting admin:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete admin."
      );
    }
  };

  // =========================
  // COUNTS
  // =========================

  const totalAdmins = admins.length;

  const activeAdmins = admins.filter(
    (admin) =>
      String(
        getStatus(admin)
      ).toUpperCase() === "ACTIVE"
  ).length;

  const inactiveAdmins = admins.filter(
    (admin) =>
      String(
        getStatus(admin)
      ).toUpperCase() !== "ACTIVE"
  ).length;

  // =========================
  // CLOSE MODALS
  // =========================

  const closeViewModal = () => {
    setSelectedAdmin(null);
    setShowViewModal(false);
  };

  const closeEditModal = () => {
    if (!saving) {
      setEditingAdmin(null);
      setShowEditModal(false);
    }
  };

  const closeAddModal = () => {
    if (!saving) {
      setShowAddModal(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="w-full bg-gray-50 px-6 pt-2">
      {/* HEADER */}

      <div className="px-6 pt-2 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage admin accounts
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} />

          Add Admin
        </button>
      </div>

      <main className="p-8">
        {/* MESSAGE */}

        <div ref={messageRef}>
          {message && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Total Admins
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalAdmins}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Active Admins
            </p>

            <h2 className="text-2xl font-bold text-green-600 mt-2">
              {activeAdmins}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Inactive Admins
            </p>

            <h2 className="text-2xl font-bold text-red-600 mt-2">
              {inactiveAdmins}
            </h2>
          </div>
        </div>

        {/* SEARCH */}

        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search admin by name, email or phone..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5"
            >
              <option value="All">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="BLOCKED">
                Blocked
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </select>
          </div>
        </div>

        {/* ADMIN TABLE */}

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-900">
              All Admins
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {filteredAdmins.length} admins found
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading admins...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Admin
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
                  {filteredAdmins.map((admin) => {
                    const status = String(
                      getStatus(admin)
                    ).toUpperCase();

                    const isActive =
                      status === "ACTIVE";

                    return (
                      <tr
                        key={admin.id}
                        className="hover:bg-gray-50"
                      >
                        {/* ADMIN */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                              {getAdminName(
                                admin
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {getAdminName(
                                  admin
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* PHONE */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {admin.phone || "-"}
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                            ADMIN
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {getStatus(admin)}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* VIEW */}

                            <button
                              title="View Admin"
                              onClick={() =>
                                handleViewAdmin(
                                  admin
                                )
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye size={17} />
                            </button>

                            {/* EDIT */}

                            <button
                              title="Edit Admin"
                              onClick={() =>
                                openEditModal(
                                  admin
                                )
                              }
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            >
                              <Edit size={17} />
                            </button>

                            {/* ACTIVATE / DEACTIVATE */}

                            <button
                              title={
                                isActive
                                  ? "Deactivate Admin"
                                  : "Activate Admin"
                              }
                              onClick={() =>
                                toggleStatus(
                                  admin
                                )
                              }
                              className={`p-2 rounded-lg ${
                                isActive
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isActive ? (
                                <UserX
                                  size={17}
                                />
                              ) : (
                                <UserCheck
                                  size={17}
                                />
                              )}
                            </button>

                            {/* DELETE */}

                            <button
                              title="Delete Admin"
                              onClick={() =>
                                handleDeleteAdmin(
                                  admin
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* NO ADMINS */}

          {!loading &&
            filteredAdmins.length === 0 && (
              <div className="p-10 text-center">
                <UsersIcon
                  className="mx-auto text-gray-300"
                  size={40}
                />

                <p className="text-gray-500 mt-3">
                  No admin accounts found
                </p>
              </div>
            )}
        </div>
      </main>

      {/* =========================
          ADD ADMIN MODAL
      ========================= */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Admin
              </h2>

              <button
                onClick={closeAddModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddAdmin}
              className="p-6 space-y-4"
            >
              {/* FIRST NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={addForm.firstName}
                  onChange={handleAddChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* LAST NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={addForm.lastName}
                  onChange={handleAddChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={addForm.email}
                  onChange={handleAddChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* USERNAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={addForm.username}
                  onChange={handleAddChange}
                  required
                  minLength={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={addForm.password}
                  onChange={handleAddChange}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={addForm.phone}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>

                <input
                  type="text"
                  value="ADMIN"
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-100"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          EDIT ADMIN MODAL
      ========================= */}

      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Admin
              </h2>

              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditAdmin}
              className="p-6 space-y-4"
            >
              {/* FIRST NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* LAST NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>

                <input
                  type="text"
                  value="ADMIN"
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-100"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Update Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          VIEW ADMIN MODAL
      ========================= */}

      {showViewModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Details
              </h2>

              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* NAME */}

              <div>
                <p className="text-xs text-gray-500">
                  Name
                </p>

                <p className="font-medium">
                  {getAdminName(
                    selectedAdmin
                  )}
                </p>
              </div>

              {/* USERNAME */}

              <div>
                <p className="text-xs text-gray-500">
                  Username
                </p>

                <p className="font-medium">
                  {selectedAdmin.username ||
                    "-"}
                </p>
              </div>

              {/* EMAIL */}

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="font-medium">
                  {selectedAdmin.email ||
                    "-"}
                </p>
              </div>

              {/* PHONE */}

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>

                <p className="font-medium">
                  {selectedAdmin.phone ||
                    "-"}
                </p>
              </div>

              {/* ROLE */}

              <div>
                <p className="text-xs text-gray-500">
                  Role
                </p>

                <p className="font-medium">
                  ADMIN
                </p>
              </div>

              {/* ACCOUNT TYPE */}

              <div>
                <p className="text-xs text-gray-500">
                  Account Type
                </p>

                <p className="font-medium">
                  {selectedAdmin.accountType ||
                    "-"}
                </p>
              </div>

              {/* STATUS */}

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="font-medium">
                  {getStatus(
                    selectedAdmin
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}