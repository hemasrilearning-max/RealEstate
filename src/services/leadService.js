const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("re_access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

const leadService = {
  /*
   * ============================================================
   * CREATE LEAD
   * POST /api/leads
   * ============================================================
   */
  async createLead({
    propertyId,
    name,
    email,
    phone,
    message,
  }) {
    const response = await fetch(
      `${API_BASE_URL}/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          propertyId,
          name,
          email,
          phone,
          message: message || "",
        }),
      }
    );

    if (!response.ok) {
      let message = "Failed to submit your interest.";

      try {
        const data = await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Ignore invalid response body
      }

      throw new Error(message);
    }

    return response.json();
  },

  /*
   * ============================================================
   * GET LEADS BY SELLER
   * GET /api/leads/seller/{sellerId}
   * ============================================================
   */
  async getLeadsBySeller(sellerId) {
    if (!sellerId) {
      throw new Error("Seller ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/leads/seller/${sellerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message = "Failed to load leads.";

      try {
        const data = await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Ignore invalid response body
      }

      throw new Error(message);
    }

    return response.json();
  },

  /*
   * ============================================================
   * UPDATE LEAD STATUS
   * PATCH /api/leads/{leadId}/status
   * ============================================================
   */
  async updateLeadStatus(leadId, status) {
    const response = await fetch(
      `${API_BASE_URL}/leads/${leadId}/status?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message = "Failed to update lead status.";

      try {
        const data = await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Ignore invalid response body
      }

      throw new Error(message);
    }

    return response.json();
  },

  /*
   * ============================================================
   * GET SINGLE LEAD
   * ============================================================
   */
  async getLeadById(leadId) {
    const response = await fetch(
      `${API_BASE_URL}/leads/${leadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load lead.");
    }

    return response.json();
  },

  /*
   * ============================================================
   * DELETE LEAD
   * ============================================================
   */
  async deleteLead(leadId) {
    const response = await fetch(
      `${API_BASE_URL}/leads/${leadId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete lead.");
    }

    return true;
  },
};

export default leadService;