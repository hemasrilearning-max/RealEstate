const API_BASE_URL = "/api";

/*
 * =========================================================
 * BACKEND HEADERS
 * =========================================================
 */

function getHeaders() {
  const token =
    localStorage.getItem(
      "accessToken"
    );

  return {
    "Content-Type":
      "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/*
 * =========================================================
 * BACKEND RESPONSE HANDLER
 * =========================================================
 */

async function handleResponse(
  response
) {
  let data = {};

  try {
    data =
      await response.json();
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

/*
 * =========================================================
 * LOCATION SERVICE
 * =========================================================
 */

const locationService = {

  /*
   * -------------------------------------------------------
   * CREATE LOCATION
   * -------------------------------------------------------
   */

  async createLocation(
    locationData
  ) {
    const response =
      await fetch(
        `${API_BASE_URL}/locations`,
        {
          method: "POST",

          headers:
            getHeaders(),

          body: JSON.stringify(
            locationData
          ),
        }
      );

    return handleResponse(
      response
    );
  },

  /*
   * -------------------------------------------------------
   * GET LOCATION BY ID
   * -------------------------------------------------------
   */

  async getLocationById(
    id
  ) {
    const response =
      await fetch(
        `${API_BASE_URL}/locations/${id}`,
        {
          method: "GET",

          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response
    );
  },

  /*
   * -------------------------------------------------------
   * GET ALL LOCATIONS
   * -------------------------------------------------------
   */

  async getAllLocations() {
    const response =
      await fetch(
        `${API_BASE_URL}/locations`,
        {
          method: "GET",

          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response
    );
  },

  /*
   * -------------------------------------------------------
   * SEARCH ADDRESS
   * -------------------------------------------------------
   *
   * Converts a normal address into latitude/longitude.
   *
   * Example:
   *
   * "Sarjapur Road, Whitefield, Bangalore, Karnataka, India"
   *
   * becomes:
   *
   * {
   *   latitude: 12.xxxxx,
   *   longitude: 77.xxxxx
   * }
   *
   * Nominatim / OpenStreetMap is being used here so we
   * don't need to add an API key or change the backend.
   */

  async searchAddress(
    address
  ) {
    if (
      !address ||
      !String(address).trim()
    ) {
      throw new Error(
        "Please enter an address."
      );
    }

    const encodedAddress =
      encodeURIComponent(
        String(address).trim()
      );

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=jsonv2` +
      `&q=${encodedAddress}` +
      `&limit=1` +
      `&countrycodes=in`;

    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        "Unable to search the address on the map."
      );
    }

    const results =
      await response.json();

    if (
      !Array.isArray(
        results
      ) ||
      results.length === 0
    ) {
      throw new Error(
        "Location not found. Please enter a more specific address."
      );
    }

    const result =
      results[0];

    const latitude =
      Number(result.lat);

    const longitude =
      Number(result.lon);

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      throw new Error(
        "The map service returned invalid coordinates."
      );
    }

    return {
      latitude:
        Number(
          latitude.toFixed(6)
        ),

      longitude:
        Number(
          longitude.toFixed(6)
        ),

      displayName:
        result.display_name ||
        "",
    };
  },
};

export default locationService;