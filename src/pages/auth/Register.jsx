import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Phone,
  Upload,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import authService from "../../services/authService";

/* =========================================================
   CONSTANTS
========================================================= */

const OTP_TIMER_SECONDS = 60;

const ROLE_OPTIONS = [
  {
    value: "BROKER",
    label: "Broker",
    desc: "List properties, manage leads & clients",
    active: "border-indigo-500 bg-indigo-50",
  },
  {
    value: "SELLER",
    label: "Property Owner",
    desc: "List your own property",
    active: "border-emerald-500 bg-emerald-50",
  },
  {
    value: "BUYER",
    label: "Buyer",
    desc: "Save properties & contact agents",
    active: "border-orange-500 bg-orange-50",
  },
];

/* =========================================================
   VALIDATION
========================================================= */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password
  );

const isValidPhone = (phone) =>
  /^\d{10,15}$/.test(phone.replace(/\s+/g, ""));

/* =========================================================
   COMPONENT
========================================================= */

export default function Register() {
  const navigate = useNavigate();

  /* =======================================================
     STEP
     1 = Basic details
     2 = OTP verification
     3 = Password
  ======================================================= */

  const [step, setStep] = useState(1);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    role: "BROKER",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    image: null,
    password: "",
    confirmPassword: "",
  });

  /* =======================================================
     OTP
  ======================================================= */

  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [fieldErrors, setFieldErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================================================
     PASSWORD VISIBILITY
  ======================================================= */

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  /* =========================================================
     OTP COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (otpTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [otpTimer]);

  /* =========================================================
     FORMAT TIMER
  ========================================================= */

  const formatOtpTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (fieldErrors[key]) {
      setFieldErrors((previous) => ({
        ...previous,
        [key]: "",
      }));
    }

    setError("");
  };

  /* =========================================================
     FIELD VALIDATION
  ========================================================= */

  const validateField = (key, value) => {
    if (key === "firstName") {
      if (!value.trim()) {
        return "Please enter your first name";
      }

      if (value.trim().length < 2) {
        return "First name must contain at least 2 characters";
      }
    }

    if (key === "lastName") {
      if (!value.trim()) {
        return "Please enter your last name";
      }

      if (value.trim().length < 2) {
        return "Last name must contain at least 2 characters";
      }
    }

    if (key === "username") {
      if (!value.trim()) {
        return "Please enter your user name";
      }

      if (value.trim().length < 2) {
        return "User name must contain at least 2 characters";
      }
    }

    if (key === "email") {
      if (!value.trim()) {
        return "Please enter your email";
      }

      if (!isValidEmail(value)) {
        return "Please enter a valid email id";
      }
    }

    if (key === "phone") {
      if (!value.trim()) {
        return "Please enter your phone number";
      }

      if (!isValidPhone(value)) {
        return "Phone number should contain only digits (10–15)";
      }
    }

    if (key === "password") {
      if (!value.trim()) {
        return "Please enter a password";
      }

      if (!isValidPassword(value)) {
        return "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character";
      }
    }

    if (key === "confirmPassword") {
      if (!value.trim()) {
        return "Please confirm your password";
      }

      if (value !== form.password) {
        return "Passwords do not match";
      }
    }

    return "";
  };

  /* =========================================================
     BLUR VALIDATION
  ========================================================= */

  const handleBlur = (key) => {
    const message = validateField(key, form[key]);

    setFieldErrors((previous) => ({
      ...previous,
      [key]: message,
    }));
  };

  /* =========================================================
     STEP 1 VALIDATION
  ========================================================= */

  const validateStep1 = () => {
    const errors = {};

    [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
    ].forEach((key) => {
      const message = validateField(key, form[key]);

      if (message) {
        errors[key] = message;
      }
    });

    if (!form.role) {
      errors.role = "Please select a role";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =========================================================
     START OTP TIMER
  ========================================================= */

  const startOtpTimer = () => {
    setOtpTimer(OTP_TIMER_SECONDS);
  };

  /* =========================================================
     SEND OTP
  ========================================================= */

  const sendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setOtpError("");

    /* -------------------------------------------------------
       Step 1 validation
    ------------------------------------------------------- */

    if (step === 1) {
      if (!validateStep1()) {
        return;
      }
    }

    /* -------------------------------------------------------
       Don't allow resend before timer ends
    ------------------------------------------------------- */

    if (step === 2 && otpTimer > 0) {
      return;
    }

    setLoading(true);

    try {
      /*
       * authService.sendOtp should call:
       *
       * POST /api/email/send-otp
       *
       * with:
       * {
       *   recipientEmail,
       *   recipientName,
       *   type
       * }
       */
      const res = await authService.checkEmail(form.email);
      console.log(res);

      await authService.sendOtp(
        form.email.trim(),
        form.firstName.trim()
      );

      /* Clear previous OTP */
      setOtp("");

      /* New OTP is not verified */
      setOtpVerified(false);

      /* OTP has been sent */
      setOtpSent(true);

      /* Start 60 second countdown */
      startOtpTimer();

      setSuccessMessage(
        "OTP has been sent to your email address."
      );

      /* Move to OTP step */
      if (step === 1) {
        setStep(2);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unable to send OTP.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const verifyOtp = async () => {
    setOtpError("");
    setError("");
    setSuccessMessage("");

    /* OTP required */
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    /* OTP must be exactly 6 digits */
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    /* OTP timer expired */
    if (otpTimer <= 0) {
      setOtpError(
        "OTP has expired. Please request a new OTP."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * authService.verifyOtp should call:
       *
       * POST /api/auth/verify-email
       *
       * {
       *   email,
       *   otp
       * }
       */

      const response = await authService.verifyOtp(
        form.email.trim(),
        otp.trim()
      );
      form.email_verified = true;
      /*
       * OTP verification successful
       */
      setOtpVerified(true);

      /* Stop timer */
      setOtpTimer(0);

      setSuccessMessage(
        response?.message ||
          response ||
          "Email verified successfully."
      );

      /* Move to password step */
      setStep(3);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Invalid OTP.";

      setOtpError(message);

      setOtpVerified(false);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD STEP VALIDATION
  ========================================================= */

  const isPasswordStepValid = () => {
    return (
      otpVerified === true &&
      isValidPassword(form.password) &&
      form.confirmPassword.trim().length > 0 &&
      form.password === form.confirmPassword
    );
  };

  /* =========================================================
     REGISTER USER
  ========================================================= */

  const registerUser = async () => {
    setError("");
    setSuccessMessage("");

    const errors = {};

    const passwordError = validateField(
      "password",
      form.password
    );

    const confirmPasswordError = validateField(
      "confirmPassword",
      form.confirmPassword
    );

    if (passwordError) {
      errors.password = passwordError;
    }

    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!otpVerified) {
      setError(
        "Please verify your email before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Current backend /api/auth/register expects JSON.
       *
       * Profile image is therefore not sent here yet.
       * We can add multipart image upload when the backend
       * registration API supports it.
       */

      const registerData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        username: form.username.trim(),
        phone: form.phone.trim(),
        role: form.role,
        //email_verified : form.email_verified.trim(),
      };

      /*
       * IMPORTANT:
       *
       * authService.register() uses Axios.
       *
       * Therefore DO NOT use:
       *
       * response.ok
       *
       * response.json()
       *
       * Those belong to fetch().
       */
      const payload = {
        ...registerData,
        email_verified: true,
      };
      const response = await authService.register(payload);

      setSuccessMessage(
        response?.message ||
          response ||
          "Registration completed successfully."
      );

      /*
       * Navigate to login after successful registration
       */
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email: form.email.trim(),
          },
        });
      }, 10000);
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Registration failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const goBack = () => {
    setError("");
    setSuccessMessage("");
    setOtpError("");

    if (step === 2) {
      setStep(1);
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setOtpTimer(0);
      return;
    }

    if (step === 3) {
      /*
       * Keep OTP verified.
       *
       * User can return to password step without
       * having to verify the OTP again.
       */
      setStep(2);
      return;
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* Maximum 5 MB */
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be less than 5 MB."
      );
      return;
    }

    /* Image only */
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    setError("");
    update("image", file);
  };

  /* =========================================================
     INPUT CLASS
  ========================================================= */

  const inputClass = (key) =>
    `w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition border ${
      fieldErrors[key]
        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50"
        : "border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
    }`;

  /* =========================================================
     STEP INDICATOR
  ========================================================= */

  const StepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-7">

        {/* STEP 1 */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {step > 1 ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            "1"
          )}
        </div>

        {/* LINE */}
        <div
          className={`w-16 h-1 mx-2 rounded ${
            step >= 2
              ? "bg-purple-700"
              : "bg-gray-200"
          }`}
        />

        {/* STEP 2 */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {step > 2 ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            "2"
          )}
        </div>

        {/* LINE */}
        <div
          className={`w-16 h-1 mx-2 rounded ${
            step >= 3
              ? "bg-purple-700"
              : "bg-gray-200"
          }`}
        />

        {/* STEP 3 */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 3
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          3
        </div>
      </div>
    );
  };

  /* =========================================================
     STEP TITLE
  ========================================================= */

  const getStepTitle = () => {
    if (step === 1) {
      return "Basic Details";
    }

    if (step === 2) {
      return "Verify Email";
    }

    return "Create Password";
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-gray-50">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage:
            "url('/images/login-bg-soft.jpg')",
        }}
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header Image */}
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src="../../../images/login_reg.png"
            alt="Real Estate Header"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form */}
        <div className="p-8 pt-6">

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-purple-900 tracking-tight">
              Create your account
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {getStepTitle()}
            </p>
          </div>

          {/* Steps */}
          <StepIndicator />

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4">
              {error}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-100 mb-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />

              <span>{successMessage}</span>
            </div>
          )}

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <div className="space-y-4">

              {/* ROLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to register as *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        update("role", opt.value)
                      }
                      className={`text-left p-3 rounded-xl border-2 transition ${
                        form.role === opt.value
                          ? opt.active
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">
                        {opt.label}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {opt.desc}
                      </p>
                    </button>
                  ))}

                </div>
              </div>

              {/* FIRST NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>

                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    update(
                      "firstName",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleBlur("firstName")
                  }
                  className={inputClass("firstName")}
                  placeholder="Enter your first name"
                />

                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              {/* LAST NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>

                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    update(
                      "lastName",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleBlur("lastName")
                  }
                  className={inputClass("lastName")}
                  placeholder="Enter your last name"
                />

                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>

              {/* USERNAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    update(
                      "username",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleBlur("username")
                  }
                  className={inputClass("username")}
                  placeholder="Enter your username"
                />

                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID *
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update(
                        "email",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur("email")
                    }
                    className={`${inputClass(
                      "email"
                    )} pl-10`}
                    placeholder="you@example.com"
                  />
                </div>

                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => {
                      const onlyNumbers =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );

                      update(
                        "phone",
                        onlyNumbers
                      );
                    }}
                    onBlur={() =>
                      handleBlur("phone")
                    }
                    className={`${inputClass(
                      "phone"
                    )} pl-10`}
                    placeholder="9876543210"
                    maxLength={15}
                  />
                </div>

                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* PROFILE IMAGE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>

                <label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition">

                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-purple-700" />
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-gray-700 truncate">
                      {form.image
                        ? form.image.name
                        : "Upload profile image"}
                    </p>

                    <p className="text-xs text-gray-400">
                      JPG, PNG or WEBP • Max 5 MB
                    </p>

                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                </label>
              </div>

              {/* SEND OTP */}
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* =================================================
              STEP 2 - OTP
          ================================================= */}

          {step === 2 && (
            <div className="space-y-5">

              {/* HEADER */}
              <div className="text-center">

                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-purple-700" />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Verify your email
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  We have sent an OTP to
                </p>

                <p className="text-sm font-semibold text-purple-700 mt-1 break-all">
                  {form.email}
                </p>

              </div>

              {/* OTP INPUT */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setOtp(value);
                    setOtpError("");
                    setError("");
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-semibold text-gray-900 outline-none transition border ${
                    otpError
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50"
                      : "border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  }`}
                  placeholder="••••••"
                />

                {otpError && (
                  <p className="mt-2 text-xs text-red-500 text-center">
                    {otpError}
                  </p>
                )}

              </div>

              {/* TIMER */}
              <div className="text-center">

                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    You can resend OTP in{" "}
                    <span className="font-semibold text-purple-700">
                      {formatOtpTimer()}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Didn't receive the OTP?
                  </p>
                )}

              </div>

              {/* VERIFY OTP */}
              <button
                type="button"
                onClick={verifyOtp}
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  otpTimer <= 0
                }
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify OTP
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* BACK */}
              <button
                type="button"
                onClick={goBack}
                disabled={loading}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* RESEND */}
              <div className="text-center">

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={
                    loading ||
                    otpTimer > 0
                  }
                  className={`text-sm font-semibold transition ${
                    otpTimer > 0 || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-purple-600 hover:underline"
                  }`}
                >
                  {loading
                    ? "Sending OTP..."
                    : otpTimer > 0
                    ? `Resend OTP in ${formatOtpTimer()}`
                    : "Resend OTP"}
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              STEP 3 - PASSWORD
          ================================================= */}

          {step === 3 && (
            <div className="space-y-4">

              {/* VERIFIED EMAIL */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">

                <CheckCircle className="w-5 h-5 text-green-600" />

                <div>

                  <p className="text-xs text-green-600">
                    Email verified
                  </p>

                  <p className="text-sm font-medium text-green-800 break-all">
                    {form.email}
                  </p>

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>

                <div className="relative">

                  <input
                    type={
                      showPass
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(e) =>
                      update(
                        "password",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur("password")
                    }
                    className={`${inputClass(
                      "password"
                    )} pr-10`}
                    placeholder="Enter your password"
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

                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password}
                  </p>
                )}

                {/* PASSWORD RULES */}
                <div className="mt-2 text-xs text-gray-500 space-y-1">

                  <p
                    className={
                      form.password.length >= 8
                        ? "text-green-600"
                        : ""
                    }
                  >
                    ✓ At least 8 characters
                  </p>

                  <p
                    className={
                      /[A-Z]/.test(form.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    ✓ One uppercase letter
                  </p>

                  <p
                    className={
                      /[a-z]/.test(form.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    ✓ One lowercase letter
                  </p>

                  <p
                    className={
                      /\d/.test(form.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    ✓ One number
                  </p>

                  <p
                    className={
                      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                        form.password
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    ✓ One special character
                  </p>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPass
                        ? "text"
                        : "password"
                    }
                    value={form.confirmPassword}
                    onChange={(e) =>
                      update(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur(
                        "confirmPassword"
                      )
                    }
                    className={`${inputClass(
                      "confirmPassword"
                    )} pr-10`}
                    placeholder="Re-enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPass(
                        !showConfirmPass
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>

                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}

                {/* PASSWORD MATCH */}
                {form.confirmPassword &&
                  form.password ===
                    form.confirmPassword &&
                  isValidPassword(form.password) && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}

              </div>

              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}

              <button
                type="button"
                onClick={registerUser}
                disabled={
                  loading ||
                  !isPasswordStepValid()
                }
                className={`w-full py-3 rounded-xl font-semibold text-sm transition shadow-sm mt-3 flex items-center justify-center gap-2 ${
                  isPasswordStepValid() &&
                  !loading
                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >

                <UserPlus className="w-4 h-4" />

                {loading
                  ? "Creating account..."
                  : "Create Account"}

              </button>

              {/* BACK */}
              <button
                type="button"
                onClick={goBack}
                disabled={loading}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

            </div>
          )}

          {/* =================================================
              GOOGLE
          ================================================= */}

          {step === 1 && (
            <>
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
            </>
          )}

          {/* LOGIN */}
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

