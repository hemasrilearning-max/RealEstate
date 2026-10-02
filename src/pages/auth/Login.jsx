import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  /*
   * If a user is already authenticated,
   * send them to their appropriate area.
   */
  useEffect(() => {
    if (!isAuthenticated || !role) {
      return;
    }

    const map = {
      agent: "/agent/dashboard",
      admin: "/admin/dashboard",
      owner: "/owner/dashboard",
      buyer: "/",
    };

    navigate(map[role] || "/", {
      replace: true,
    });
  }, [isAuthenticated, role, navigate]);

  const usernameError =
    touched.username && !username.trim();

  const passwordError =
    touched.password && !password.trim();

  /*
   * Login using backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      username: true,
      password: true,
    });

    setError("");

    if (!username.trim() || !password.trim()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(
        username.trim(),
        password
      );

      if (result.success) {
        navigate(result.redirectTo, {
          replace: true,
        });
      } else {
        setError(
          result.error ||
            "Invalid username or password"
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-gray-50">
      {/* Background Soft Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage:
            "url('/images/login-bg-soft.jpg')",
        }}
      />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Top Header Banner */}
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src="../../../images/login_reg.png"
            alt="Real Estate Header"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Container */}
        <div className="p-8 pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-purple-900 tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Sign in as Agent, Admin, Owner or Buyer
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                onBlur={() =>
                  setTouched((t) => ({
                    ...t,
                    username: true,
                  }))
                }
                className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition border ${
                  usernameError
                    ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50"
                    : "border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                }`}
                placeholder="Enter your username"
                autoComplete="username"
              />

              {usernameError && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter your username
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-purple-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={
                    showPass ? "text" : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  onBlur={() =>
                    setTouched((t) => ({
                      ...t,
                      password: true,
                    }))
                  }
                  className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition border pr-10 ${
                    passwordError
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50"
                      : "border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPass(!showPass)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter your password
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-sm mt-2"
            >
              {loading
                ? "Signing in..."
                : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>

            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">
                or
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />

              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />

              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            Continue with Google
          </button>

          {/* Register */}
          <p className="mt-5 text-center text-xs text-gray-600">
            New here?{" "}
            <Link
              to="/register"
              className="text-purple-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}