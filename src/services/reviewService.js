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

const reviewService = {
  async getReviewsByProperty(propertyId) {
    const response = await fetch(
      `${API_BASE_URL}/reviews/property/${propertyId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async getMyReviews() {
    const response = await fetch(
      `${API_BASE_URL}/reviews/my`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async getReviewById(reviewId) {
    const response = await fetch(
      `${API_BASE_URL}/reviews/${reviewId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  async createReview(reviewData) {
    const response = await fetch(
      `${API_BASE_URL}/reviews`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(reviewData),
      }
    );

    return handleResponse(response);
  },

  async updateReview(reviewId, reviewData) {
    const response = await fetch(
      `${API_BASE_URL}/reviews/${reviewId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(reviewData),
      }
    );

    return handleResponse(response);
  },

  async deleteReview(reviewId) {
    const response = await fetch(
      `${API_BASE_URL}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },
};

export default reviewService;