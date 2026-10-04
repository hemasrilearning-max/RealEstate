const API_BASE_URL = "/api";

function getHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function handleResponse(response) {
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
        "Unable to process location."
    );
  }

  return data;
}

const locationService = {
  async createLocation(locationData) {
    const response = await fetch(
      `${API_BASE_URL}/locations`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(locationData),
      }
    );

    return handleResponse(response);
  },

  async getLocationById(id) {
    const response = await fetch(
      `${API_BASE_URL}/locations/${id}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async getAllLocations() {
    const response = await fetch(
      `${API_BASE_URL}/locations`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },
};

export default locationService;