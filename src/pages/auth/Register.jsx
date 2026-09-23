import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "agent",
    label: "Agent",
    desc: "List properties, manage leads & clients",
    active: "border-indigo-500 bg-indigo-50",
  },
  {
    value: "owner",
    label: "Property Owner",
    desc: "List your own property",
    active: "border-emerald-500 bg-emerald-50",
  },
  {
    value: "buyer",
    label: "Buyer",
    desc: "Save properties & contact agents",
    active: "border-orange-500 bg-orange-50",
  },
];

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password
  );

const isValidPhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\s+/g, ""));

export default function Register() {
  const { register, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "agent",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((e) => ({ ...e, [key]: "" }));
    }
  };

  const validateField = (key, value) => {
    if (key === "name") {
      if (!value.trim()) return "Please enter your name";
    }

    if (key === "email") {
      if (!value.trim()) return "Please enter your email";
      if (!isValidEmail(value)) return "Please enter a valid email id";
    }

    if (key === "phone") {
      if (!value.trim()) return "Please enter your phone number";
      if (!isValidPhone(value))
        return "Phone number should contain only digits (10–15)";
    }

    if (key === "password") {
      if (!value.trim()) return "Please enter a password";
      if (!isValidPassword(value))
        return "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character";
    }

    if (key === "confirmPassword") {
      if (!value.trim()) return "Please confirm your password";
      if (value !== form.password) return "Passwords do not match";
    }

    return "";
  };

  const handleBlur = (key) => {
    const message = validateField(key, form[key]);
    setFieldErrors((e) => ({ ...e, [key]: message }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const keys = ["name", "email", "phone", "password", "confirmPassword"];
    const newErrors = {};

    keys.forEach((key) => {
      newErrors[key] = validateField(key, form[key]);
    });

    setFieldErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg)) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });
      setLoading(false);
      if (result.success) {
        navigate(result.redirectTo);
      } else {
        setError(result.error);
      }
    }, 300);
  };

  const inputClass = (key) =>
    `w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition border ${
      fieldErrors[key]
        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50"
        : "border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
    }`;

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-gray-50">
      {/* Background Soft Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/images/login-bg-soft.jpg')",
        }}
      />

      {/* Main Register Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Top Header Banner (same as Login) */}
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
              Create your account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Register as Agent, Owner or Buyer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("role", opt.value)}
                    className={`text-left p-3 rounded-xl border-2 transition ${
                      form.role === opt.value
                        ? opt.active
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Admin accounts are created by system only.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={inputClass("name")}
                placeholder="Your full name"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={inputClass("email")}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  update("phone", onlyNums);
                }}
                onBlur={() => handleBlur("phone")}
                className={inputClass("phone")}
                placeholder="9876543210"
                maxLength={15}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`${inputClass("password")} pr-10`}
                  placeholder="Min 8 chars, upper, lower, number, special"
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className={inputClass("confirmPassword")}
                placeholder="Re-enter password"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <p className="mt-5 text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}