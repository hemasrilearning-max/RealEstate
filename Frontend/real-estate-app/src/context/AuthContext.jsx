import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_USERS, ROLE_DASHBOARD } from "../data/users";

const AuthContext = createContext(null);

const USERS_KEY = "re_users";
const SESSION_KEY = "re_session";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // seed defaults
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  return [...INITIAL_USERS];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => loadUsers());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Keep agent alias for existing agent pages that use useAuth().agent
  const agent = user?.role === "agent" ? user : null;

  const login = (email, password) => {
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!found) {
      return { success: false, error: "Invalid email or password" };
    }
    const session = { ...found };
    delete session.password;
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const redirectTo = ROLE_DASHBOARD[found.role] || "/";
    return { success: true, role: found.role, redirectTo };
  };

  const register = ({ name, email, password, phone, role }) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "Email already registered. Please login." };
    }
    if (!["agent", "owner", "buyer"].includes(role)) {
      return { success: false, error: "Invalid role selected." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || "",
      role,
      company: role === "agent" ? "Independent Agent" : null,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(normalizedEmail)}`,
      rating: role === "agent" ? 0 : undefined,
      totalDeals: role === "agent" ? 0 : undefined,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);

    // Auto-login after registration
    const session = { ...newUser };
    delete session.password;
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const redirectTo = ROLE_DASHBOARD[role] || "/";
    return { success: true, role, redirectTo };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setUsers((prev) => {
      const next = prev.map((u) =>
        u.id === user.id ? { ...u, ...updates, password: u.password } : u
      );
      saveUsers(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agent, // backward compat for agent pages
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
