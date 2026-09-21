import { useState } from "react";
import {
  Bell,
  Send,
  Users,
  UserRound,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";

export default function Notifications() {
  const [showForm, setShowForm] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Property Approval Required",
      message: "A new property listing is waiting for admin approval.",
      recipient: "Owners",
      date: "Sep 18, 2026",
      status: "Sent",
    },
    {
      id: 2,
      title: "Payment Confirmation",
      message: "Payment transaction has been successfully completed.",
      recipient: "Buyers",
      date: "Sep 17, 2026",
      status: "Sent",
    },
    {
      id: 3,
      title: "New Dispute Raised",
      message: "A new dispute requires admin attention.",
      recipient: "Admin",
      date: "Sep 16, 2026",
      status: "Sent",
    },
    {
      id: 4,
      title: "System Maintenance",
      message: "Scheduled system maintenance notification.",
      recipient: "All Users",
      date: "Sep 15, 2026",
      status: "Scheduled",
    },
  ]);

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    recipient: "All Users",
  });

  const [search, setSearch] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNotification = (e) => {
    e.preventDefault();

    if (!newNotification.title || !newNotification.message) {
      alert("Please enter notification title and message.");
      return;
    }

    const notification = {
      id: Date.now(),
      title: newNotification.title,
      message: newNotification.message,
      recipient: newNotification.recipient,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Sent",
    };

    setNotifications((prev) => [notification, ...prev]);

    setNewNotification({
      title: "",
      message: "",
      recipient: "All Users",
    });

    setShowForm(false);
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      notification.message
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      notification.recipient
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const sentCount = notifications.filter(
    (item) => item.status === "Sent"
  ).length;

  const scheduledCount = notifications.filter(
    (item) => item.status === "Scheduled"
  ).length;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Send and manage notifications for users
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Notifications
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {notifications.length}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Sent
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {sentCount}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Scheduled
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {scheduledCount}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create Notification
              </h2>

              <p className="text-sm text-gray-500">
                Send a notification to selected users
              </p>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSendNotification}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={newNotification.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>

                <select
                  name="recipient"
                  value={newNotification.recipient}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>All Users</option>
                  <option>Buyers</option>
                  <option>Renters</option>
                  <option>Owners</option>
                  <option>Agents</option>
                  <option>Admin</option>
                </select>
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  name="message"
                  value={newNotification.message}
                  onChange={handleInputChange}
                  placeholder="Enter notification message"
                  rows="4"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
                Send Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white border rounded-xl p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        notification.status === "Sent"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {notification.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {notification.recipient}
                    </span>

                    <span>
                      {notification.date}
                    </span>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                <UserRound className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}