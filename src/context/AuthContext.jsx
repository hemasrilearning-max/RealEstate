import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import loginService from "../services/loginService";

const AuthContext = createContext(null);

/*
 * Backend role -> Frontend role
 *
 * Backend:
 * SUPER_ADMIN
 * ADMIN
 * BUYER
 * SELLER
 * BROKER
 *
 * Frontend:
 * admin
 * buyer
 * owner
 * agent
 */
function normalizeRole(role) {
  const normalized = String(role || "").toUpperCase();

  const roleMap = {
    SUPER_ADMIN: "admin",
    ADMIN: "admin",
    BUYER: "buyer",
    SELLER: "owner",
    BROKER: "agent",
  };

  return roleMap[normalized] || null;
}

/*
 * Decide where the user goes after login.
 */
function getRedirectPath(role) {
  const paths = {
    buyer: "/",
    owner: "/owner/dashboard",
    agent: "/agent/dashboard",
    admin: "/admin/dashboard",
  };

  return paths[role] || "/";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Restore login session when the application starts.
   */
  useEffect(() => {
    const token = loginService.getToken();
    const storedUser = loginService.getUser();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  /*
   * Login using Spring Boot backend.
   */
  const login = async (username, password) => {
    try {
      const response = await loginService.login(
        username,
        password
      );

      /*
       * Convert backend role to the role names
       * already used by the frontend.
       */
      const frontendRole = normalizeRole(response.role);

      if (!frontendRole) {
        return {
          success: false,
          error: `Unsupported user role: ${response.role}`,
        };
      }

      /*
       * Create the frontend session object.
       *
       * We keep both backendRole and role so that
       * existing frontend components continue working.
       */
      const sessionUser = {
        id: response.userId,
        userId: response.userId,

        username: response.username,

        email: response.email,

        firstName: response.firstName,
        lastName: response.lastName,

        name: [
          response.firstName,
          response.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        role: frontendRole,

        backendRole: response.role,
      };

      /*
       * Save JWT.
       */
      localStorage.setItem(
        "accessToken",
        response.accessToken
      );

      /*
       * Save logged-in user.
       */
      localStorage.setItem(
        "authUser",
        JSON.stringify(sessionUser)
      );

      /*
       * Update React state.
       */
      setUser(sessionUser);

      const redirectTo =
        getRedirectPath(frontendRole);

      return {
        success: true,
        user: sessionUser,
        role: frontendRole,
        backendRole: response.role,
        accessToken: response.accessToken,
        redirectTo,
      };
    } catch (error) {
      console.error(
        "Login Network Error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Unable to connect to the backend.",
      };
    }
  };

  /*
   * Logout.
   */
  const logout = () => {
    setUser(null);

    loginService.logout();
  };

  /*
   * Temporary frontend profile update.
   *
   * This keeps existing dashboard/profile pages
   * working until the backend profile API is connected.
   */
  const updateProfile = (updates) => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      ...updates,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "authUser",
      JSON.stringify(updatedUser)
    );
  };

  /*
   * Backward-compatible aliases.
   *
   * Existing pages can continue using:
   *
   * useAuth().agent
   * useAuth().buyer
   * useAuth().owner
   * useAuth().admin
   */
  const agent =
    user?.role === "agent"
      ? user
      : null;

  const buyer =
    user?.role === "buyer"
      ? user
      : null;

  const owner =
    user?.role === "owner"
      ? user
      : null;

  const admin =
    user?.role === "admin"
      ? user
      : null;

  return (
    <AuthContext.Provider
      value={{
        user,

        agent,
        buyer,
        owner,
        admin,

        login,
        logout,
        updateProfile,

        loading,

        isAuthenticated: !!user,

        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}