const API_BASE_URL = "/api/property-views";

function getHeaders() {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("re_access_token");

  return {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

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
        "Unable to process property view."
    );
  }

  return data;
}

const propertyViewService = {
  // =========================================================
  // RECORD PROPERTY VIEW
  // =========================================================
  async recordView(propertyId) {
    if (!propertyId) {
      throw new Error(
        "Property ID is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/property/${propertyId}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // =========================================================
  // GET CURRENT BUYER'S VIEWED PROPERTIES
  // =========================================================
  async getMyViewedProperties() {
    const response = await fetch(
      `${API_BASE_URL}/my`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // =========================================================
  // GET PROPERTY VIEW COUNT
  // =========================================================
  async getViewCount(propertyId) {
    if (!propertyId) {
      return 0;
    }

    const response = await fetch(
      `${API_BASE_URL}/property/${propertyId}/count`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data =
      await handleResponse(response);

    return Number(data || 0);
  },
};

export default propertyViewService;

