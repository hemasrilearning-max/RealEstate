const API_BASE_URL = "/api";

function getHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
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
        "Unable to process property media."
    );
  }

  return data;
}

const mediaService = {
  /*
   * ==========================================================
   * RESOLVE MEDIA URL
   * ==========================================================
   */
  resolveMediaUrl(fileUrl) {
    if (!fileUrl) {
      return "";
    }

    const url = String(fileUrl).trim();

    if (!url) {
      return "";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return url;
    }

    const normalizedUrl = url.startsWith("/")
      ? url
      : `/${url}`;

    return `http://localhost:8080${normalizedUrl}`;
  },

  /*
   * ==========================================================
   * UPLOAD ONE MEDIA FILE
   * ==========================================================
   */
  async uploadMedia(
    propertyId,
    file,
    mediaType = "IMAGE",
    primary = false
  ) {
    if (!propertyId) {
      throw new Error(
        "Property ID is required to upload media."
      );
    }

    if (!file) {
      throw new Error(
        "Image file is required."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "mediaType",
      mediaType
    );
    formData.append(
      "primary",
      String(Boolean(primary))
    );

    const response = await fetch(
      `${API_BASE_URL}/media/property/${propertyId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: formData,
      }
    );

    return handleResponse(response);
  },

  /*
   * ==========================================================
   * GET MEDIA BY PROPERTY
   * ==========================================================
   */
  async getMediaByProperty(propertyId) {
    if (!propertyId) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/media/property/${propertyId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  /*
   * ==========================================================
   * GET PROPERTY IMAGES
   * ==========================================================
   */
  async getPropertyImages(propertyId) {
    const response =
      await this.getMediaByProperty(
        propertyId
      );

    let mediaList = [];

    if (Array.isArray(response)) {
      mediaList = response;
    } else if (
      Array.isArray(response?.content)
    ) {
      mediaList = response.content;
    } else if (
      Array.isArray(response?.data)
    ) {
      mediaList = response.data;
    } else if (
      Array.isArray(response?.media)
    ) {
      mediaList = response.media;
    }

    return mediaList
      .filter((media) => {
        const mediaType =
          String(
            media?.mediaType || ""
          ).toUpperCase();

        return (
          !mediaType ||
          mediaType.includes("IMAGE") ||
          mediaType === "PHOTO"
        );
      })
      .sort((a, b) => {
        const primaryA =
          Boolean(
            a?.primary ??
              a?.isPrimary ??
              a?.is_primary
          );

        const primaryB =
          Boolean(
            b?.primary ??
              b?.isPrimary ??
              b?.is_primary
          );

        return (
          Number(primaryB) -
          Number(primaryA)
        );
      })
      .map((media) =>
        this.resolveMediaUrl(
          media?.fileUrl ||
            media?.file_url
        )
      )
      .filter(Boolean);
  },

  /*
   * ==========================================================
   * DELETE MEDIA
   * ==========================================================
   */
  async deleteMedia(mediaId) {
    if (!mediaId) {
      throw new Error(
        "Media ID is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/media/${mediaId}`,
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
          "Unable to delete property media."
      );
    }

    return true;
  },
};

export default mediaService;