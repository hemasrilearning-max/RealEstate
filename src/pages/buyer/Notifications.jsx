import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Tag,
  Calendar,
  MessageSquare,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Home,
  Info,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import notificationService from "../../services/notificationService";

function getNotificationIcon(type) {
  const normalizedType =
    String(type || "").toUpperCase();

  if (
    normalizedType.includes("PRICE") ||
    normalizedType.includes("DROP")
  ) {
    return {
      icon: Tag,
      color:
        "text-amber-500 bg-amber-50 border-amber-100",
    };
  }

  if (
    normalizedType.includes("TOUR") ||
    normalizedType.includes("BOOKING")
  ) {
    return {
      icon: Calendar,
      color:
        "text-emerald-600 bg-emerald-50 border-emerald-100",
    };
  }

  if (
    normalizedType.includes("MESSAGE") ||
    normalizedType.includes("CHAT")
  ) {
    return {
      icon: MessageSquare,
      color:
        "text-blue-500 bg-blue-50 border-blue-100",
    };
  }

  return {
    icon: Bell,
    color:
      "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
}

function formatNotificationTime(createdAt) {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const diffMs =
    now.getTime() -
    date.getTime();

  const diffSeconds =
    Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes =
    Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${
      diffMinutes !== 1 ? "s" : ""
    } ago`;
  }

  const diffHours =
    Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours !== 1 ? "s" : ""
    } ago`;
  }

  const diffDays =
    Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays !== 1 ? "s" : ""
    } ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function normalizeNotification(notification) {
  const visual =
    getNotificationIcon(
      notification.type
    );

  return {
    id: notification.id,

    type:
      notification.type ||
      "GENERAL",

    title:
      notification.title ||
      "Notification",

    desc:
      notification.message ||
      "",

    time:
      formatNotificationTime(
        notification.createdAt
      ),

    isNew:
      notification.isRead === false,

    icon: visual.icon,

    color: visual.color,

    createdAt:
      notification.createdAt,
  };
}

export default function BuyerNotifications() {
  const navigate = useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  /*
   * ============================================================
   * LOAD NOTIFICATIONS
   *
   * initialLoad = true
   *     Shows the loading spinner.
   *
   * initialLoad = false
   *     Silent background refresh.
   * ============================================================
   */

  const loadNotifications = useCallback(
    async (initialLoad = false) => {
      try {
        if (initialLoad) {
          setLoading(true);
        }

        const response =
          await notificationService.getMyNotifications();

        const backendNotifications =
          Array.isArray(response)
            ? response
            : response?.content ||
              response?.data ||
              response?.notifications ||
              [];

        const normalized =
          backendNotifications.map(
            normalizeNotification
          );

        setNotifications(
          normalized
        );

        /*
         * Clear any previous error after
         * a successful request.
         */
        setError("");
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err
        );

        /*
         * Only show an error message during
         * the initial page load.
         *
         * Background polling should stay silent.
         */
        if (initialLoad) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load notifications."
          );
        }
      } finally {
        if (initialLoad) {
          setLoading(false);
        }
      }
    },
    []
  );

  /*
   * ============================================================
   * INITIAL LOAD + REAL-TIME POLLING
   *
   * No WebSocket is required.
   *
   * The frontend checks the backend every 5 seconds.
   *
   * This means a newly-created notification normally
   * appears within 0-5 seconds.
   * ============================================================
   */

  useEffect(() => {
    let isMounted = true;

    /*
     * First request.
     */
    loadNotifications(true);

    /*
     * Background polling.
     */
    const intervalId = setInterval(() => {
      if (!isMounted) {
        return;
      }

      loadNotifications(false);
    }, 5000);

    /*
     * Cleanup when leaving the page.
     */
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [loadNotifications]);

  /*
   * ============================================================
   * DELETE NOTIFICATION
   * ============================================================
   */

  const handleClearAlert =
    async (id) => {
      try {
        setDeletingId(id);
        setError("");

        await notificationService.deleteNotification(
          id
        );

        setNotifications(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !== id
            )
        );
      } catch (err) {
        console.error(
          "Failed to delete notification:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to dismiss notification."
        );
      } finally {
        setDeletingId(null);
      }
    };

  /*
   * ============================================================
   * MARK ALL AS READ
   * ============================================================
   */

  const handleMarkAllRead =
    async () => {
      const unread =
        notifications.filter(
          (item) =>
            item.isNew
        );

      if (!unread.length) {
        return;
      }

      try {
        setMarkingAll(true);
        setError("");

        /*
         * Backend provides mark-one-as-read.
         * Mark each unread notification individually.
         */
        await Promise.all(
          unread.map((item) =>
            notificationService.markAsRead(
              item.id
            )
          )
        );

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                isNew: false,
              })
            )
        );
      } catch (err) {
        console.error(
          "Failed to mark notifications as read:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to mark all notifications as read."
        );

        /*
         * Reload backend state if one of
         * the requests failed.
         */
        await loadNotifications(true);
      } finally {
        setMarkingAll(false);
      }
    };

  const unreadCount =
    notifications.filter(
      (item) =>
        item.isNew
    ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={() =>
              navigate("/")
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            HomeSpace Home
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Bell className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Notifications & Alerts
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Stay updated on price changes, tours, messages, and
                  property activity.
                </p>

                {unreadCount > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full" />

                    {unreadCount} unread notification
                    {unreadCount !== 1
                      ? "s"
                      : ""}
                  </div>
                )}
              </div>
            </div>

            {notifications.some(
              (item) =>
                item.isNew
            ) && (
              <button
                onClick={
                  handleMarkAllRead
                }
                disabled={markingAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors self-start sm:self-center disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" />

                {markingAll
                  ? "Marking..."
                  : "Mark All as Read"}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Notification Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Notifications
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Your latest HomeSpace account and property updates.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-3">

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="h-8 w-8 mx-auto rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />

                <p className="text-sm text-gray-500 mt-3">
                  Loading notifications...
                </p>
              </div>
            )}

            {!loading &&
              notifications.map(
                (item) => {
                  const IconComp =
                    item.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                        item.isNew
                          ? "bg-white border-gray-200 shadow-sm"
                          : "bg-gray-50/50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">

                        {/* Notification Icon */}
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}
                        >
                          <IconComp className="h-4.5 w-4.5" />
                        </div>

                        {/* Notification Content */}
                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`text-sm font-bold ${
                                item.isNew
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {item.title}
                            </h3>

                            {item.isNew && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                NEW
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            {item.desc}
                          </p>

                          <span className="text-xs text-gray-400 font-medium block mt-2">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleClearAlert(
                            item.id
                          )
                        }
                        disabled={
                          deletingId ===
                          item.id
                        }
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                }
              )}

            {/* Empty State */}
            {!loading &&
              notifications.length ===
                0 && (
                <div className="text-center py-16 px-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-gray-400" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-800">
                    No notifications
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    You're all caught up. New property alerts, tour updates,
                    messages, and other account activity will appear here.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        "/properties"
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Browse Properties
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />

            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Stay updated with HomeSpace
              </h3>

              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                Notifications can include price-drop alerts, saved-search
                updates, tour confirmations, messages from property owners
                or agents, payment updates, and other important account
                activity.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

