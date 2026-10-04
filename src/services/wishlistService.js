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

const wishlistService = {
  async addToWishlist(userId, propertyId) {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        userId,
        propertyId,
      }),
    });

    return handleResponse(response);
  },

  async getWishlistByUser(userId) {
    const response = await fetch(
      `${API_BASE_URL}/wishlist/user/${userId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async isWishlisted(userId, propertyId) {
    const params = new URLSearchParams({
      userId: String(userId),
      propertyId: String(propertyId),
    });

    const response = await fetch(
      `${API_BASE_URL}/wishlist/check?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async removeFromWishlist(userId, propertyId) {
    const params = new URLSearchParams({
      userId: String(userId),
      propertyId: String(propertyId),
    });

    const response = await fetch(
      `${API_BASE_URL}/wishlist?${params.toString()}`,
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
          "Unable to remove property from favorites."
      );
    }

    return true;
  },
};

export default wishlistService;