import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch notifications
  // --------------------------------------------------
  const fetchNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axiosInstance.get(
        "/api/notifications"
      );

      const result = response.data;

      // Supports:
      // [ ... ]
      // OR { data: [ ... ] }
      // OR { content: [ ... ] }
      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.content)
        ? result.content
        : [];

      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setNotifications([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --------------------------------------------------
  // Mark notification as read
  // --------------------------------------------------
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(
        `/api/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to mark notification as read."
      );
    }
  };

  // --------------------------------------------------
  // Mark all notifications as read
  // --------------------------------------------------
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) =>
        !notification.read && !notification.isRead
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setError("");

      await Promise.all(
        unreadNotifications.map((notification) =>
          axiosInstance.patch(
            `/api/notifications/${notification.id}/read`
          )
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to mark all notifications as read."
      );

      fetchNotifications();
    }
  };

  // --------------------------------------------------
  // Delete notification
  // --------------------------------------------------
  const deleteNotification = async (notificationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axiosInstance.delete(
        `/api/notifications/${notificationId}`
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete notification."
      );
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const isNotificationRead = (notification) => {
    return (
      notification.read === true ||
      notification.isRead === true
    );
  };

  const getNotificationTitle = (notification) => {
    return (
      notification.title ||
      notification.subject ||
      notification.notificationTitle ||
      "Notification"
    );
  };

  const getNotificationMessage = (notification) => {
    return (
      notification.message ||
      notification.description ||
      notification.content ||
      notification.notificationMessage ||
      "You have a new notification."
    );
  };

  const getNotificationType = (notification) => {
    return (
      notification.type ||
      notification.notificationType ||
      "INFO"
    );
  };

  const getNotificationDate = (notification) => {
    return (
      notification.createdAt ||
      notification.createdDate ||
      notification.timestamp ||
      notification.date
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type) => {
    const normalizedType = String(type).toUpperCase();

    if (
      normalizedType.includes("SUCCESS") ||
      normalizedType.includes("APPROVED") ||
      normalizedType.includes("COMPLETED")
    ) {
      return <CheckCircle size={20} />;
    }

    if (
      normalizedType.includes("ERROR") ||
      normalizedType.includes("FAILED") ||
      normalizedType.includes("REJECTED")
    ) {
      return <XCircle size={20} />;
    }

    if (
      normalizedType.includes("WARNING") ||
      normalizedType.includes("ALERT")
    ) {
      return <AlertTriangle size={20} />;
    }

    if (normalizedType.includes("INFO")) {
      return <Info size={20} />;
    }

    return <Bell size={20} />;
  };

  const getTypeClass = (type) => {
    const normalizedType = String(type).toUpperCase();

    if (
      normalizedType.includes("SUCCESS") ||
      normalizedType.includes("APPROVED") ||
      normalizedType.includes("COMPLETED")
    ) {
      return "notification-success";
    }

    if (
      normalizedType.includes("ERROR") ||
      normalizedType.includes("FAILED") ||
      normalizedType.includes("REJECTED")
    ) {
      return "notification-error";
    }

    if (
      normalizedType.includes("WARNING") ||
      normalizedType.includes("ALERT")
    ) {
      return "notification-warning";
    }

    return "notification-info";
  };

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------
  const totalNotifications = notifications.length;

  const unreadNotifications = notifications.filter(
    (notification) => !isNotificationRead(notification)
  ).length;

  const readNotifications =
    totalNotifications - unreadNotifications;

  // --------------------------------------------------
  // Search + filter
  // --------------------------------------------------
  const filteredNotifications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const title = getNotificationTitle(
        notification
      ).toLowerCase();

      const message = getNotificationMessage(
        notification
      ).toLowerCase();

      const type = getNotificationType(
        notification
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        message.includes(searchText) ||
        type.includes(searchText);

      const read = isNotificationRead(notification);

      let matchesFilter = true;

      if (filter === "unread") {
        matchesFilter = !read;
      }

      if (filter === "read") {
        matchesFilter = read;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="notifications-page">
      <style>{`
        .notifications-page {
          padding: 28px;
          color: #0f172a;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .notifications-title {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
        }

        .notifications-subtitle {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .notifications-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .notification-button {
          border: 1px solid #cbd5e1;
          background: white;
          color: #0f172a;
          border-radius: 9px;
          padding: 11px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .notification-button:hover {
          background: #f8fafc;
        }

        .notification-button.primary {
          background: #c084fc;
          border-color: #c084fc;
          color: white;
        }

        .notification-button.primary:hover {
          background: #a855f7;
        }

        .notification-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .notification-error-box {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #dc2626;
          border-radius: 8px;
          padding: 13px 16px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notification-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 26px;
        }

        .notification-stat {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.purple {
          background: #f3e8ff;
          color: #9333ea;
        }

        .stat-icon.yellow {
          background: #fef9c3;
          color: #ca8a04;
        }

        .stat-icon.green {
          background: #dcfce7;
          color: #16a34a;
        }

        .notification-toolbar {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          gap: 16px;
          margin-bottom: 26px;
        }

        .notification-search {
          flex: 1;
          position: relative;
        }

        .notification-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .notification-search input {
          width: 100%;
          box-sizing: border-box;
          height: 50px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          padding: 0 16px 0 44px;
          font-size: 15px;
          outline: none;
        }

        .notification-search input:focus {
          border-color: #a855f7;
        }

        .notification-filter {
          width: 185px;
          height: 50px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          padding: 0 12px;
          background: white;
          font-size: 15px;
          outline: none;
        }

        .notification-list {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
        }

        .notification-list-header {
          padding: 22px 26px;
          border-bottom: 1px solid #e2e8f0;
        }

        .notification-list-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .notification-list-count {
          margin-top: 6px;
          color: #64748b;
          font-size: 14px;
        }

        .notification-item {
          display: flex;
          gap: 16px;
          padding: 20px 26px;
          border-bottom: 1px solid #e2e8f0;
          transition: background 0.2s;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background: #faf5ff;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-type-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-info {
          background: #e0f2fe;
          color: #0284c7;
        }

        .notification-success {
          background: #dcfce7;
          color: #16a34a;
        }

        .notification-error {
          background: #fee2e2;
          color: #dc2626;
        }

        .notification-warning {
          background: #fef3c7;
          color: #d97706;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-content-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .notification-item-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .notification-item-message {
          margin: 7px 0;
          color: #64748b;
          line-height: 1.5;
          font-size: 14px;
        }

        .notification-date {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 12px;
        }

        .notification-item-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .icon-button {
          width: 36px;
          height: 36px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
        }

        .icon-button:hover {
          background: #f1f5f9;
        }

        .icon-button.delete:hover {
          color: #dc2626;
          background: #fef2f2;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9333ea;
          display: inline-block;
          margin-left: 7px;
        }

        .empty-state {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 14px;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          font-size: 18px;
        }

        .empty-state p {
          margin: 0;
          color: #94a3b8;
        }

        .loading-state {
          padding: 70px;
          text-align: center;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .notification-stats {
            grid-template-columns: 1fr;
          }

          .notifications-header {
            flex-direction: column;
          }

          .notification-toolbar {
            flex-direction: column;
          }

          .notification-filter {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .notifications-page {
            padding: 16px;
          }

          .notifications-actions {
            width: 100%;
          }

          .notification-button {
            flex: 1;
            justify-content: center;
          }

          .notification-content-top {
            flex-direction: column;
          }

          .notification-item {
            padding: 16px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">
            Notifications
          </h1>

          <p className="notifications-subtitle">
            Stay updated with important platform activities
          </p>
        </div>

        <div className="notifications-actions">
          <button
            className="notification-button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="notification-button primary"
            onClick={markAllAsRead}
            disabled={unreadNotifications === 0}
          >
            <Check size={17} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="notification-error-box">
          <XCircle size={19} />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="notification-stats">
        <div className="notification-stat">
          <div>
            <div className="stat-label">
              Total Notifications
            </div>

            <div className="stat-value">
              {totalNotifications}
            </div>
          </div>

          <div className="stat-icon purple">
            <Bell size={23} />
          </div>
        </div>

        <div className="notification-stat">
          <div>
            <div className="stat-label">Unread</div>

            <div className="stat-value">
              {unreadNotifications}
            </div>
          </div>

          <div className="stat-icon yellow">
            <Clock size={23} />
          </div>
        </div>

        <div className="notification-stat">
          <div>
            <div className="stat-label">Read</div>

            <div className="stat-value">
              {readNotifications}
            </div>
          </div>

          <div className="stat-icon green">
            <CheckCircle size={23} />
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="notification-toolbar">
        <div className="notification-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="notification-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Notification list */}
      <div className="notification-list">
        <div className="notification-list-header">
          <h2 className="notification-list-title">
            Notifications
          </h2>

          <div className="notification-list-count">
            {filteredNotifications.length} notifications shown
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell
              size={55}
              className="empty-icon"
            />

            <h3>No notifications found</h3>

            <p>
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const read =
              isNotificationRead(notification);

            const type =
              getNotificationType(notification);

            return (
              <div
                key={notification.id}
                className={`notification-item ${
                  !read ? "unread" : ""
                }`}
              >
                <div
                  className={`notification-type-icon ${getTypeClass(
                    type
                  )}`}
                >
                  {getTypeIcon(type)}
                </div>

                <div className="notification-content">
                  <div className="notification-content-top">
                    <div>
                      <h3 className="notification-item-title">
                        {getNotificationTitle(
                          notification
                        )}

                        {!read && (
                          <span className="unread-dot" />
                        )}
                      </h3>

                      <p className="notification-item-message">
                        {getNotificationMessage(
                          notification
                        )}
                      </p>
                    </div>

                    <div className="notification-item-actions">
                      {!read && (
                        <button
                          className="icon-button"
                          title="Mark as read"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                        >
                          <Check size={17} />
                        </button>
                      )}

                      <button
                        className="icon-button delete"
                        title="Delete notification"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="notification-date">
                    <Clock size={13} />

                    {formatDate(
                      getNotificationDate(
                        notification
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}