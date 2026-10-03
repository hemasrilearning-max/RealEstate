import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

import authService from "../../services/authService";

/* =========================================================
   CONSTANTS
========================================================= */

const OTP_TIMER_SECONDS = 60;

/* =========================================================
   VALIDATION
========================================================= */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password
  );

/* =========================================================
   COMPONENT
========================================================= */

export default function ForgotPassword() {
  const navigate = useNavigate();

  /* =======================================================
     STEP

     1 = Email
     2 = OTP Verification
     3 = New Password
  ======================================================= */

  const [step, setStep] = useState(1);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    email: "",
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

     1000 milliseconds = 1 second
     60 seconds = 1 minute

     Countdown:
     01:00
     00:59
     00:58
     ...
     00:01
     00:00
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
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimer]);

  /* =========================================================
     FORMAT OTP TIMER
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
    if (key === "email") {
      if (!value.trim()) {
        return "Please enter your email";
      }

      if (!isValidEmail(value)) {
        return "Please enter a valid email id";
      }
    }

    if (key === "password") {
      if (!value.trim()) {
        return "Please enter a new password";
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
     EMAIL VALIDATION
  ========================================================= */

  const validateEmail = () => {
    const message = validateField("email", form.email);

    setFieldErrors({
      email: message,
    });

    return !message;
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

  const forgotPassword = async () => {
    setError("");
    setSuccessMessage("");
    setOtpError("");

    /* -------------------------------------------------------
       Validate email
    ------------------------------------------------------- */

    if (!validateEmail()) {
      return;
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
       * The Register page already uses:
       *
       * authService.sendOtp(
       *   form.email.trim(),
       *   form.firstName.trim()
       * );
       *
       * For Forgot Password there is no first name,
       * so "User" is passed as the recipient name.
       */

      await authService.forgotPassword(
        form.email.trim(),
        "User"
      );

      /* Clear previous OTP */

      setOtp("");

      /* OTP is not verified */

      setOtpVerified(false);

      /* OTP sent */

      setOtpSent(true);

      /* Start 60-second timer */

      startOtpTimer();

      setSuccessMessage(
        "OTP has been sent to your email address."
      );

      /* Move to OTP step */

      setStep(2);
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

  const passwordVerifyOtp = async () => {
    setOtpError("");
    setError("");
    setSuccessMessage("");

    /* -------------------------------------------------------
       OTP required
    ------------------------------------------------------- */

    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    /* -------------------------------------------------------
       OTP must be exactly 6 digits
    ------------------------------------------------------- */

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    /* -------------------------------------------------------
       OTP timer expired
    ------------------------------------------------------- */

    if (otpTimer <= 0) {
      setOtpError(
        "OTP has expired. Please request a new OTP."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Same OTP verification service used by
       * your Register page.
       *
       * Expected:
       *
       * POST /api/auth/verify-email
       *
       * {
       *   email,
       *   otp
       * }
       */

      const response = await authService.passwordVerifyOtp(
        form.email.trim(),
        otp.trim()
      );
       alert(form.email);
      /* OTP verified */
      //setEmail()
      setOtpVerified(true);

      /* Stop timer */

      setOtpTimer(0);

      setSuccessMessage(
        response?.message ||
          response ||
          "OTP verified successfully."
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

  const validatePasswordStep = () => {
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
      errors.confirmPassword =
        confirmPasswordError;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =========================================================
     PASSWORD STEP VALID STATE
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
     RESET PASSWORD
  ========================================================= */

  const resetPassword = async () => {
    setError("");
    setSuccessMessage("");
      alert(form.email);
    /* -------------------------------------------------------
       OTP must be verified
    ------------------------------------------------------- */

    if (!otpVerified) {
      setError(
        "Please verify the OTP before resetting your password."
      );
      return;
    }

    /* -------------------------------------------------------
       Validate passwords
    ------------------------------------------------------- */

    if (!validatePasswordStep()) {
      return;
    }

    setLoading(true);

    try {
      /*
       * Reset password API
       *
       * Expected:
       *
       * POST /api/auth/reset-password
       *
       * {
       *   email: "user@example.com",
       *   otp: "123456",
       *   newPassword: "Password@123"
       * }
       */

      const response = await authService.resetPassword(form.email.trim(),form.password);

      setSuccessMessage(
        response?.message ||
          response ||
          "Password reset successfully."
      );

      /* Clear password fields */

      setForm((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));

      /* -----------------------------------------------------
         Navigate to Login
      ----------------------------------------------------- */

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            passwordReset: true,
            email: form.email.trim(),
          },
        });
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unable to reset password.";

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

    /* OTP -> Email */

    if (step === 2) {
      setStep(1);
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setOtpTimer(0);

      return;
    }

    /* Password -> OTP */

    if (step === 3) {
      setStep(2);
      return;
    }
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
      return "Enter your email";
    }

    if (step === 2) {
      return "Verify Email";
    }

    return "Create New Password";
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-gray-50">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage:
            "url('/images/login-bg-soft.jpg')",
        }}
      />

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* =================================================
            HEADER IMAGE
        ================================================= */}

        <div className="relative h-44 w-full overflow-hidden">

          <img
            src="../../../images/login_reg.png"
            alt="Real Estate Header"
            className="w-full h-full object-cover"
          />

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="p-8 pt-6">

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="text-center mb-5">

            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">

              <LockKeyhole className="w-6 h-6 text-purple-700" />

            </div>

            <h1 className="text-2xl font-bold text-purple-900 tracking-tight">
              Forgot Password?
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {getStepTitle()}
            </p>

          </div>

          {/* =================================================
              STEP INDICATOR
          ================================================= */}

          <StepIndicator />

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {successMessage && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-100 mb-4 flex items-start gap-2">

              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />

              <span>
                {successMessage}
              </span>

            </div>
          )}

          {/* =================================================
              STEP 1 - EMAIL
          ================================================= */}

          {step === 1 && (
            <div className="space-y-5">

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
                    autoComplete="email"
                  />

                </div>

                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email}
                  </p>
                )}

              </div>

              {/* INFORMATION */}

              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">

                <p className="text-xs text-purple-700 leading-5">
                  Enter the email address associated
                  with your account. We will send a
                  6-digit OTP to verify your identity.
                </p>

              </div>

              {/* SEND OTP */}

              <button
                type="button"
                onClick={forgotPassword}
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
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

              {/* LOGIN */}

              <p className="text-center text-xs text-gray-600">

                Remember your password?{" "}

                <Link
                  to="/login"
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Login
                </Link>

              </p>

            </div>
          )}

          {/* =================================================
              STEP 2 - OTP
          ================================================= */}

          {step === 2 && (
            <div className="space-y-5">

              {/* OTP HEADER */}

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
                onClick={passwordVerifyOtp}
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

              {/* RESEND OTP */}

              <div className="text-center">

                <button
                  type="button"
                  onClick={forgotPassword}
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
              STEP 3 - NEW PASSWORD
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

              {/* NEW PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
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
                    placeholder="Enter your new password"
                    autoComplete="new-password"
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
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
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

              {/* RESET PASSWORD BUTTON */}

              <button
                type="button"
                onClick={resetPassword}
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

                <LockKeyhole className="w-4 h-4" />

                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}

              </button>

              {/* BACK BUTTON */}

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
              LOGIN LINK
          ================================================= */}

          <p className="mt-5 text-center text-xs text-gray-600">

            New Account?{" "}

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