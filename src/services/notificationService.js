import axiosInstance from "../utils/axiosInstance";

const notificationService = {
  // ============================================================
  // GET ALL MY NOTIFICATIONS
  // GET /api/notifications
  // ============================================================
  async getMyNotifications() {
    const response = await axiosInstance.get(
      "/api/notifications"
    );

    return response.data;
  },

  // ============================================================
  // GET MY UNREAD NOTIFICATIONS
  // GET /api/notifications/unread
  // ============================================================
  async getUnreadNotifications() {
    const response = await axiosInstance.get(
      "/api/notifications/unread"
    );

    return response.data;
  },

  // ============================================================
  // GET UNREAD COUNT
  // GET /api/notifications/unread/count
  // ============================================================
  async getUnreadCount() {
    const response = await axiosInstance.get(
      "/api/notifications/unread/count"
    );

    return response.data;
  },

  // ============================================================
  // MARK NOTIFICATION AS READ
  // PATCH /api/notifications/{id}/read
  // ============================================================
  async markAsRead(notificationId) {
    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    await axiosInstance.patch(
      `/api/notifications/${notificationId}/read`
    );

    return true;
  },

  // ============================================================
  // DELETE NOTIFICATION
  // DELETE /api/notifications/{id}
  // ============================================================
  async deleteNotification(notificationId) {
    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    await axiosInstance.delete(
      `/api/notifications/${notificationId}`
    );

    return true;
  },
};

export default notificationService;