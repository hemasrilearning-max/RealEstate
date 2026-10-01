const API_BASE_URL = "/api";

const authService = {
  async login(username, password) {
    console.log("Calling backend:", `${API_BASE_URL}/auth/login`);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

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
          "Invalid username or password"
      );
    }

    return data;
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
  },

  getToken() {
    return localStorage.getItem("accessToken");
  },

  getUser() {
    try {
      const stored = localStorage.getItem("authUser");

      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

export default authService;