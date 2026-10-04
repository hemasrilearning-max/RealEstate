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
   * ============================================================
   * RESTORE LOGIN SESSION
   * ============================================================
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
   * ============================================================
   * LOGIN
   * ============================================================
   */

  const login = async (username, password) => {
    try {
      const response =
        await loginService.login(
          username,
          password
        );

      const frontendRole =
        normalizeRole(response.role);

      if (!frontendRole) {
        return {
          success: false,
          error:
            `Unsupported user role: ${response.role}`,
        };
      }

      /*
       * Create the frontend session object.
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
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const logout = () => {
    setUser(null);

    loginService.logout();
  };

  /*
   * ============================================================
   * UPDATE PROFILE
   * ============================================================
   *
   * IMPORTANT:
   *
   * Profile API data must NEVER replace authentication data.
   *
   * We preserve:
   * - id
   * - userId
   * - username
   * - role
   * - backendRole
   *
   * Only profile fields are allowed to change.
   * ============================================================
   */

  const updateProfile = (updates = {}) => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,

      /*
       * Only profile information should be updated here.
       */
      ...updates,

      /*
       * Authentication identity is always preserved.
       */
      id: user.id,
      userId: user.userId,
      username: user.username,

      /*
       * NEVER allow a profile API response to
       * remove or replace the authenticated role.
       */
      role: user.role,
      backendRole: user.backendRole,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "authUser",
      JSON.stringify(updatedUser)
    );
  };

  /*
   * ============================================================
   * ROLE HELPERS
   * ============================================================
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

  /*
   * ============================================================
   * PROVIDER
   * ============================================================
   */

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