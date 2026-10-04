const API_BASE_URL = "/api/messaging";

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

const messagingService = {
  // ============================================================
  // CONVERSATIONS
  // ============================================================

  async createConversation(sellerId, propertyId) {
    const response = await fetch(
      `${API_BASE_URL}/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          sellerId,
          propertyId,
        }),
      }
    );

    return parseResponse(response);
  },

  async getConversation(conversationId) {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async getBuyerConversations(buyerId) {
    if (!buyerId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/conversations/buyer/${buyerId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async getSellerConversations(sellerId) {
    if (!sellerId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/conversations/seller/${sellerId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async getPropertyConversations(propertyId) {
    if (!propertyId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/conversations/property/${propertyId}`,
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
  // MESSAGES
  // ============================================================

  async getMessages(conversationId) {
    if (!conversationId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async sendMessage(
    conversationId,
    receiverId,
    content
  ) {
    if (!conversationId) {
      throw new Error("Conversation ID is required.");
    }

    if (!receiverId) {
      throw new Error("Receiver ID is required.");
    }

    if (!content?.trim()) {
      throw new Error("Message content cannot be empty.");
    }

    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          receiverId,
          content: content.trim(),
        }),
      }
    );

    return parseResponse(response);
  },

  async markMessageAsRead(messageId) {
    if (!messageId) {
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/messages/${messageId}/read`,
      {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async getUnreadMessages(receiverId) {
    if (!receiverId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/messages/unread/${receiverId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async getUnreadMessageCount(receiverId) {
    if (!receiverId) {
      return 0;
    }

    const response = await fetch(
      `${API_BASE_URL}/messages/unread/${receiverId}/count`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  async deleteMessage(messageId) {
    if (!messageId) {
      throw new Error("Message ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },
};

export default messagingService;