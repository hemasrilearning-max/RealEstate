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

const tourService = {
  /*
   * Create a new tour
   */
  async createTour(tourData) {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(tourData),
    });

    return parseResponse(response);
  },

  /*
   * Get all tours for a buyer
   */
  async getToursByBuyer(buyerId) {
    if (!buyerId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/buyer/${buyerId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  /*
   * Get all tours for a property
   */
  async getToursByProperty(propertyId) {
    if (!propertyId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/property/${propertyId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  /*
   * Update tour status
   */
  async updateTourStatus(tourId, status) {
    if (!tourId) {
      throw new Error("Tour ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/${tourId}/status?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  /*
   * Update / reschedule tour
   */
  async updateTour(tourId, tourData) {
    if (!tourId) {
      throw new Error("Tour ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/${tourId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(tourData),
      }
    );

    return parseResponse(response);
  },

  /*
   * Get one tour
   */
  async getTourById(tourId) {
    if (!tourId) {
      throw new Error("Tour ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/${tourId}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return parseResponse(response);
  },

  /*
   * Delete tour
   */
  async deleteTour(tourId) {
    if (!tourId) {
      throw new Error("Tour ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/tours/${tourId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message = "Failed to delete tour.";

      try {
        const data = await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {}

      throw new Error(message);
    }

    return true;
  },
};

export default tourService;