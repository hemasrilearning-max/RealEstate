import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_USERS, ROLE_DASHBOARD } from "../data/users";

const AuthContext = createContext(null);

const USERS_KEY = "re_users";
const SESSION_KEY = "re_session";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    /* ignore invalid localStorage data */
  }

  // Seed default users
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));

  return [...INITIAL_USERS];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/*
 * Decide where a user should go after login/registration.
 *
 * Buyer:
 *   -> HomeSpace homepage
 *
 * Agent:
 *   -> Agent dashboard
 *
 * Owner:
 *   -> Owner dashboard
 *
 * Admin:
 *   -> Admin dashboard
 */
function getRedirectPath(role) {
  if (role === "buyer") {
    return "/";
  }

  return ROLE_DASHBOARD[role] || "/";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => loadUsers());
  const [loading, setLoading] = useState(true);

  /*
   * Restore the logged-in session when the application starts.
   */
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);

    if (stored) {
      try {
        const session = JSON.parse(stored);
        setUser(session);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    setLoading(false);
  }, []);

  /*
   * Keep the agent alias for existing Agent pages
   * that use useAuth().agent.
   */
  const agent = user?.role === "agent" ? user : null;

  /*
   * Login
   */
  const login = (email, password) => {
    const normalizedEmail = email?.toLowerCase().trim();

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.password === password
    );

    if (!found) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    /*
     * Do not store the password inside the active session.
     */
    const session = { ...found };
    delete session.password;

    setUser(session);

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    /*
     * Buyer -> HomeSpace homepage
     * Other roles -> their dashboards
     */
    const redirectTo = getRedirectPath(found.role);

    return {
      success: true,
      role: found.role,
      redirectTo,
    };
  };

  /*
   * Registration
   */
  const register = ({
    name,
    email,
    password,
    phone,
    role,
  }) => {
    const normalizedEmail = email?.toLowerCase().trim();

    /*
     * Check whether the email already exists.
     */
    if (
      users.some(
        (u) => u.email.toLowerCase() === normalizedEmail
      )
    ) {
      return {
        success: false,
        error: "Email already registered. Please login.",
      };
    }

    /*
     * Only these roles can be registered from the public
     * registration page.
     */
    if (!["agent", "owner", "buyer"].includes(role)) {
      return {
        success: false,
        error: "Invalid role selected.",
      };
    }

    /*
     * Password validation.
     */
    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters.",
      };
    }

    /*
     * Create the new user.
     */
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || "",
      role,

      company:
        role === "agent"
          ? "Independent Agent"
          : null,

      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        normalizedEmail
      )}`,

      rating:
        role === "agent"
          ? 0
          : undefined,

      totalDeals:
        role === "agent"
          ? 0
          : undefined,

      joinedAt: new Date()
        .toISOString()
        .slice(0, 10),
    };

    /*
     * Save the new user.
     */
    const updatedUsers = [...users, newUser];

    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    /*
     * Automatically login after registration.
     *
     * Password is removed from the session.
     */
    const session = { ...newUser };
    delete session.password;

    setUser(session);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(session)
    );

    /*
     * Buyer registration -> HomeSpace homepage
     * Agent/Owner registration -> respective dashboard
     */
    const redirectTo = getRedirectPath(role);

    return {
      success: true,
      role,
      redirectTo,
    };
  };

  /*
   * Logout
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  /*
   * Update the currently logged-in user's profile.
   */
  const updateProfile = (updates) => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      ...updates,
    };

    /*
     * Update active session.
     */
    setUser(updatedUser);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(updatedUser)
    );

    /*
     * Update the user inside the users collection.
     */
    setUsers((previousUsers) => {
      const nextUsers = previousUsers.map((u) =>
        u.id === user.id
          ? {
              ...u,
              ...updates,
              password: u.password,
            }
          : u
      );

      saveUsers(nextUsers);

      return nextUsers;
    });
  };

  /*
   * Context value
   */
  return (
    <AuthContext.Provider
      value={{
        user,

        // Backward compatibility for Agent pages
        agent,

        users,

        login,

        register,

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

/*
 * Custom Auth hook
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}

