const API_BASE_URL = "/api";

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

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

const userService = {
  // ============================================================
  // GET USER PROFILE
  // GET /api/users/{id}
  // ============================================================
  async getUserById(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}`,
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
  // UPDATE USER PROFILE
  // PUT /api/users/{id}
  // ============================================================
  async updateUser(userId, profileData) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      }
    );

    return parseResponse(response);
  },

  // ============================================================
  // UPLOAD PROFILE PHOTO
  // POST /api/users/me/profile-photo
  // ============================================================
  async uploadProfilePhoto(file) {
    if (!file) {
      throw new Error("Please select an image.");
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/users/me/profile-photo`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      }
    );

    return parseResponse(response);
  },

  // ============================================================
  // DELETE PROFILE PHOTO
  // DELETE /api/users/me/profile-photo
  // ============================================================
  async deleteProfilePhoto() {
    const response = await fetch(
      `${API_BASE_URL}/users/me/profile-photo`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      let message =
        "Failed to remove profile photo.";

      try {
        const data =
          await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Backend may return 204 with no response body.
      }

      throw new Error(message);
    }

    return true;
  },

  // ============================================================
  // GET PROFILE PHOTO URL
  // ============================================================
  getProfilePhotoUrl(userId) {
    if (!userId) {
      return null;
    }

    return `${API_BASE_URL}/users/${userId}/profile-photo`;
  },

  // ============================================================
  // GET PROFILE PHOTO WITH JWT
  // GET /api/users/{id}/profile-photo
  //
  // IMPORTANT:
  // <img src=""> cannot automatically send our JWT.
  // So we fetch the image as a Blob with Authorization header.
  // ============================================================
  async getProfilePhotoBlob(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/profile-photo`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load profile photo (${response.status})`
      );
    }

    return response.blob();
  },

  // ============================================================
  // CHANGE PASSWORD
  // PUT /api/users/me/change-password
  // ============================================================
  async changePassword(
    currentPassword,
    newPassword
  ) {
    const response = await fetch(
      `${API_BASE_URL}/users/me/change-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    if (!response.ok) {
      let message =
        "Failed to change password.";

      try {
        const data =
          await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch {
        // Ignore empty response.
      }

      throw new Error(message);
    }

    return true;
  },
};

export default userService;