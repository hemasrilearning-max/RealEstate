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
        "Something went wrong. Please try again."
    );
  }

  return data;
}

const propertyService = {
  // Create a new property
  async createProperty(propertyData) {
    const response = await fetch(
      `${API_BASE_URL}/properties`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(propertyData),
      }
    );

    return handleResponse(response);
  },

  // Get one property
  async getPropertyById(id) {
    const response = await fetch(
      `${API_BASE_URL}/properties/${id}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Get all properties
  async getAllProperties() {
    const response = await fetch(
      `${API_BASE_URL}/properties`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Get properties belonging to an owner/seller
  async getPropertiesBySeller(sellerId) {
    const response = await fetch(
      `${API_BASE_URL}/properties/seller/${sellerId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Update property
  async updateProperty(id, propertyData) {
    const response = await fetch(
      `${API_BASE_URL}/properties/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(propertyData),
      }
    );

    return handleResponse(response);
  },

  // Delete property
  async deleteProperty(id) {
    const response = await fetch(
      `${API_BASE_URL}/properties/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      throw new Error(
        data.message ||
          data.error ||
          "Unable to delete property."
      );
    }

    return true;
  },
};

export default propertyService;