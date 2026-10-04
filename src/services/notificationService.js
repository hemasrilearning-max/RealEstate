
const API_BASE_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function parseResponse(response) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

const notificationService = {
  // ============================================================
  // GET ALL MY NOTIFICATIONS
  // GET /api/notifications
  // ============================================================
  async getMyNotifications() {
    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  // ============================================================
  // GET MY UNREAD NOTIFICATIONS
  // GET /api/notifications/unread
  // ============================================================
  async getUnreadNotifications() {
    const response = await fetch(
      `${API_BASE_URL}/notifications/unread`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  // ============================================================
  // GET UNREAD COUNT
  // GET /api/notifications/unread/count
  // ============================================================
  async getUnreadCount() {
    const response = await fetch(
      `${API_BASE_URL}/notifications/unread/count`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  // ============================================================
  // MARK NOTIFICATION AS READ
  // PATCH /api/notifications/{id}/read
  // ============================================================
  async markAsRead(notificationId) {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message =
        "Failed to mark notification as read.";

      try {
        const data =
          await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Backend returns 204 with no body.
      }

      throw new Error(message);
    }

    return true;
  },

  // ============================================================
  // DELETE NOTIFICATION
  // DELETE /api/notifications/{id}
  // ============================================================
  async deleteNotification(notificationId) {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message =
        "Failed to delete notification.";

      try {
        const data =
          await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Backend may return 204 with no body.
      }

      throw new Error(message);
    }

    return true;
  },
};

export default notificationService;

