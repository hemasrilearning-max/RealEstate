import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, send to correct dashboard
  if (isAuthenticated && role) {
    const map = {
      agent: "/agent/dashboard",
      admin: "/admin/dashboard",
      owner: "/owner/dashboard",
      buyer: "/buyer/dashboard",
    };
    navigate(map[role] || "/", { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        navigate(result.redirectTo);
      } else {
        setError(result.error);
      }
    }, 300);
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              Real<span className="text-red-600">Estate</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-500 mt-1">
            Sign in as Agent, Admin, Owner or Buyer
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-red-600 font-medium hover:underline">
              Register
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
            <p className="font-medium text-gray-700">Demo accounts (click to fill):</p>
            <button
              type="button"
              onClick={() => fillDemo("agent@realestate.com", "agent123")}
              className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1"
            >
              <span className="font-medium text-red-600">Agent</span> — agent@realestate.com / agent123
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@realestate.com", "admin123")}
              className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1"
            >
              <span className="font-medium text-purple-600">Admin</span> — admin@realestate.com / admin123
            </button>
            <button
              type="button"
              onClick={() => fillDemo("owner@gmail.com", "owner123")}
              className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1"
            >
              <span className="font-medium text-emerald-600">Owner</span> — owner@gmail.com / owner123
            </button>
            <button
              type="button"
              onClick={() => fillDemo("buyer@gmail.com", "buyer123")}
              className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1"
            >
              <span className="font-medium text-blue-600">Buyer</span> — buyer@gmail.com / buyer123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
