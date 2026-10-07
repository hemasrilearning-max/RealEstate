
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";

import {
  Star,
  Phone,
  Mail,
  Calendar,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const MAX_SIZE_MB = 2;

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

// ============================================================
// BROKER PROFILE
// ============================================================

export default function BrokerProfile() {
  const {
    agent,
    user,
    updateProfile,
  } = useAuth();

  // ============================================================
  // BROKER PROFILE
  // ============================================================

  const brokerProfile = agent || user;

  // ============================================================
  // BROKER ID
  // ============================================================

  const brokerId =
    brokerProfile?.userId ||
    brokerProfile?.id;

  // ============================================================
  // REFS
  // ============================================================

  const fileRef = useRef(null);

  const photoObjectUrlRef = useRef(null);

  // ============================================================
  // PROFILE STATE
  // ============================================================

  const [profileData, setProfileData] =
    useState(brokerProfile);

  const [originalProfile, setOriginalProfile] =
    useState(brokerProfile);

  const [editForm, setEditForm] = useState({
    firstName:
      brokerProfile?.firstName || "",
    lastName:
      brokerProfile?.lastName || "",
    email:
      brokerProfile?.email || "",
    phone:
      brokerProfile?.phone || "",
  });

  const [editing, setEditing] =
    useState(false);

  // ============================================================
  // PHOTO STATE
  // ============================================================

  const [preview, setPreview] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [photoUrl, setPhotoUrl] =
    useState(null);

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // LOAD BROKER PROFILE PHOTO
  //
  // GET:
  // /api/users/{brokerId}/profile-photo
  // ============================================================

  const loadProfilePhoto = async (userId) => {
    if (!userId) {
      return;
    }

    try {
      const blob =
        await brokerService.getBrokerProfilePhoto(
          userId
        );

      if (!blob) {
        setPhotoUrl(null);
        return;
      }

      // Revoke old object URL
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );
      }

      const objectUrl =
        URL.createObjectURL(blob);

      photoObjectUrlRef.current =
        objectUrl;

      setPhotoUrl(objectUrl);
    } catch (err) {
      console.log(
        "No broker profile photo available:",
        err.message
      );

      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current = null;
      }

      setPhotoUrl(null);
    }
  };

  // ============================================================
  // LOAD BROKER PROFILE
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!brokerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await brokerService.getBrokerProfile(
            brokerId
          );

        if (!mounted) {
          return;
        }

        const fullName =
          [
            data.firstName,
            data.lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim();

        const updatedProfile = {
          ...brokerProfile,

          id:
            data.id ||
            brokerId,

          userId:
            data.id ||
            brokerId,

          firstName:
            data.firstName || "",

          lastName:
            data.lastName || "",

          name:
            fullName ||
            data.username ||
            brokerProfile?.name ||
            "Broker",

          username:
            data.username,

          email:
            data.email,

          phone:
            data.phone,

          role:
            data.role ||
            "BROKER",

          backendRole:
            data.role ||
            "BROKER",

          status:
            data.status,

          accountType:
            data.accountType,

          profilePhotoUrl:
            data.profilePhotoUrl,

          createdAt:
            data.createdAt,

          updatedAt:
            data.updatedAt,

          rating:
            data.rating ??
            brokerProfile?.rating,

          totalDeals:
            data.totalDeals ??
            brokerProfile?.totalDeals,
        };

        setProfileData(
          updatedProfile
        );

        setOriginalProfile(
          updatedProfile
        );

        setEditForm({
          firstName:
            data.firstName || "",

          lastName:
            data.lastName || "",

          email:
            data.email || "",

          phone:
            data.phone || "",
        });

        updateProfile(
          updatedProfile
        );

        // Load image directly from:
        // /api/users/{brokerId}/profile-photo

        await loadProfilePhoto(
          data.id || brokerId
        );
      } catch (err) {
        console.error(
          "Failed to load broker profile:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Failed to load broker profile."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [brokerId]);

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleFormChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // START EDIT
  // ============================================================

  const handleStartEditing = () => {
    setEditForm({
      firstName:
        profileData?.firstName || "",

      lastName:
        profileData?.lastName || "",

      email:
        profileData?.email || "",

      phone:
        profileData?.phone || "",
    });

    setEditing(true);
    setError("");
    setSuccess("");
  };

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  const handleCancelEdit = () => {
    setEditForm({
      firstName:
        originalProfile?.firstName || "",

      lastName:
        originalProfile?.lastName || "",

      email:
        originalProfile?.email || "",

      phone:
        originalProfile?.phone || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // ============================================================
  // SAVE PROFILE
  //
  // PUT:
  // /api/users/{brokerId}
  // ============================================================

  const handleSaveProfile = async () => {
    if (!brokerId) {
      setError(
        "Broker ID is missing. Please log in again."
      );
      return;
    }

    const firstName =
      editForm.firstName.trim();

    const lastName =
      editForm.lastName.trim();

    const email =
      editForm.email.trim();

    const phone =
      editForm.phone.trim();

    if (!firstName) {
      setError(
        "First name is required."
      );
      return;
    }

    if (!lastName) {
      setError(
        "Last name is required."
      );
      return;
    }

    if (!email) {
      setError(
        "Email is required."
      );
      return;
    }

    // Correct email regex
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!phone) {
      setError(
        "Phone number is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedData =
        await brokerService.updateBrokerProfile(
          brokerId,
          {
            firstName,
            lastName,
            email,
            phone,
          }
        );

      const fullName =
        [
          updatedData.firstName ||
            firstName,

          updatedData.lastName ||
            lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      const updatedProfile = {
        ...profileData,

        id:
          updatedData.id ||
          brokerId,

        userId:
          updatedData.id ||
          brokerId,

        firstName:
          updatedData.firstName ||
          firstName,

        lastName:
          updatedData.lastName ||
          lastName,

        name:
          fullName ||
          profileData?.name ||
          "Broker",

        username:
          updatedData.username ||
          profileData?.username,

        email:
          updatedData.email ||
          email,

        phone:
          updatedData.phone ||
          phone,

        role:
          updatedData.role ||
          profileData?.role ||
          "BROKER",

        backendRole:
          updatedData.role ||
          profileData?.backendRole ||
          "BROKER",

        status:
          updatedData.status ||
          profileData?.status,

        accountType:
          updatedData.accountType ||
          profileData?.accountType,

        profilePhotoUrl:
          updatedData.profilePhotoUrl ??
          profileData?.profilePhotoUrl,

        createdAt:
          updatedData.createdAt ||
          profileData?.createdAt,

        updatedAt:
          updatedData.updatedAt ||
          profileData?.updatedAt,
      };

      setProfileData(
        updatedProfile
      );

      setOriginalProfile(
        updatedProfile
      );

      setEditForm({
        firstName:
          updatedProfile.firstName ||
          "",

        lastName:
          updatedProfile.lastName ||
          "",

        email:
          updatedProfile.email ||
          "",

        phone:
          updatedProfile.phone ||
          "",
      });

      updateProfile(
        updatedProfile
      );

      setEditing(false);

      setSuccess(
        "Profile updated successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Broker profile update failed:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileSelect = (e) => {
    setError("");
    setSuccess("");

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select an image file (JPG, PNG, WebP or GIF)."
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      MAX_SIZE_MB * 1024 * 1024
    ) {
      setError(
        `Image must be smaller than ${MAX_SIZE_MB}MB.`
      );

      e.target.value = "";

      return;
    }

    setSelectedFile(file);

    const reader =
      new FileReader();

    reader.onload = () => {
      setPreview(
        reader.result
      );
    };

    reader.onerror = () => {
      setError(
        "Failed to read image. Try another file."
      );
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // SAVE PROFILE PHOTO
  //
  // IMPORTANT:
  //
  // Existing backend API:
  //
  // POST /api/users/me/profile-photo
  //
  // The backend gets the authenticated broker automatically.
  //
  // DO NOT send brokerId here.
  // ============================================================

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      return;
    }

    if (!brokerId) {
      setError(
        "Broker ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // IMPORTANT:
      // Upload through the existing authenticated-user
      // profile-photo API.
      //
      // OLD:
      // updateBrokerProfilePhoto(brokerId, selectedFile)
      //
      // NEW:
      // updateBrokerProfilePhoto(selectedFile)

      await brokerService.updateBrokerProfilePhoto(
        selectedFile
      );

      // Reload photo from backend
      await loadProfilePhoto(
        brokerId
      );

      // Update local profile state
      const updatedProfile = {
        ...profileData,

        profilePhotoUrl:
          `/api/users/${brokerId}/profile-photo`,

        profilePhotoUpdatedAt:
          Date.now(),
      };

      setProfileData(
        updatedProfile
      );

      setOriginalProfile(
        updatedProfile
      );

      updateProfile(
        updatedProfile
      );

      setPreview(null);
      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setSuccess(
        "Profile photo updated successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Broker profile photo upload failed:",
        err
      );

      setError(
        err.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // REMOVE PHOTO
  //
  // Existing backend API:
  //
  // DELETE /api/users/me/profile-photo
  //
  // This works for the authenticated broker as well.
  // ============================================================

  const handleRemoveAvatar = async () => {
    if (!photoUrl) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await brokerService.deleteBrokerProfilePhoto();

      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current = null;
      }

      setPhotoUrl(null);
      setPreview(null);
      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      const updatedProfile = {
        ...profileData,
        profilePhotoUrl: null,
        profilePhotoUpdatedAt:
          Date.now(),
      };

      setProfileData(
        updatedProfile
      );

      setOriginalProfile(
        updatedProfile
      );

      updateProfile(
        updatedProfile
      );

      setSuccess(
        "Profile photo removed successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Broker profile photo removal failed:",
        err
      );

      setError(
        err.message ||
          "Failed to remove profile photo."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL PHOTO PREVIEW
  // ============================================================

  const handleCancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setError("");
  };

  // ============================================================
  // PASSWORD - OPEN
  // ============================================================

  const handleOpenChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowChangePassword(true);
  };

  // ============================================================
  // PASSWORD - CLOSE
  // ============================================================

  const handleCloseChangePassword = () => {
    if (changingPassword) {
      return;
    }

    setShowChangePassword(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // ============================================================
  // PASSWORD - FORM CHANGE
  // ============================================================

  const handlePasswordFormChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  // ============================================================
  // PASSWORD - SUBMIT
  // ============================================================

  const handleChangePassword = async () => {
    const currentPassword =
      passwordForm.currentPassword.trim();

    const newPassword =
      passwordForm.newPassword.trim();

    const confirmPassword =
      passwordForm.confirmPassword.trim();

    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword.length > 100) {
      setPasswordError(
        "New password cannot exceed 100 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      await brokerService.changeBrokerPassword(
        currentPassword,
        newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess(
        "Password changed successfully!"
      );
    } catch (err) {
      console.error(
        "Password change failed:",
        err
      );

      setPasswordError(
        err.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================================
  // NO PROFILE
  // ============================================================

  if (!profileData) {
    return null;
  }

  // ============================================================
  // DISPLAY NAME
  // ============================================================

  const displayName =
    [
      profileData.firstName,
      profileData.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    profileData.name ||
    profileData.username ||
    "Broker";

  // ============================================================
  // FALLBACK AVATAR
  // ============================================================

  const fallbackAvatar =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=6F01B9&color=fff&size=150`;

  // ============================================================
  // CURRENT AVATAR
  // ============================================================

  const currentAvatar =
    preview ||
    photoUrl ||
    fallbackAvatar;

  // ============================================================
  // JOINED DATE
  // ============================================================

  const joinedDate =
    profileData.createdAt
      ? new Date(
          profileData.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )
      : "—";

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <span className="text-xs font-bold text-purple-600 tracking-wider uppercase block mb-1">
          Agent Dashboard
        </span>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Broker Profile
        </h2>

        <p className="text-sm text-gray-500 mt-0.5">
          Manage your broker profile details and profile photo.
        </p>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <p className="text-xs text-gray-400">
          Loading broker profile...
        </p>
      )}

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">

        {/* ====================================================
            TOP PROFILE SECTION
        ==================================================== */}

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">

          {/* ==================================================
              AVATAR
          ================================================== */}

          <div
            className="relative group cursor-pointer"
            onClick={() =>
              fileRef.current?.click()
            }
          >
            <img
              src={currentAvatar}
              alt={displayName}
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* ==================================================
              PROFILE DETAILS
          ================================================== */}

          <div className="flex-1 text-center sm:text-left min-w-0">

            <h3 className="text-xl font-bold text-gray-900 truncate">
              {displayName}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              Broker / Agent Account
            </p>

            {/* ==================================================
                RATING
            ================================================== */}

            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-sm text-gray-500">

              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />

              <span className="font-semibold text-gray-800">
                {profileData.rating ?? "4.8"}
              </span>

              <span className="text-gray-400 text-xs">
                (
                {profileData.totalDeals ?? "47"}{" "}
                deals)
              </span>
            </div>

            {/* ==================================================
                PHOTO CONTROLS
            ================================================== */}

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">

              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* UPLOAD */}

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                disabled={saving}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-gray-400" />

                {preview
                  ? "Change Choice"
                  : "Upload photo"}
              </button>

              {/* SAVE PHOTO */}

              {preview && (
                <>
                  <button
                    type="button"
                    onClick={
                      handleSaveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Now"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCancelPreview
                    }
                    disabled={saving}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* REMOVE */}

              {!preview &&
                photoUrl && (
                  <button
                    type="button"
                    onClick={
                      handleRemoveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
            </div>

            {/* FILE INFO */}

            <p className="text-[11px] text-gray-400 mt-2.5">
              JPG, PNG, WebP or GIF · Max{" "}
              {MAX_SIZE_MB}MB
            </p>

            {/* ERROR */}

            {error && (
              <p className="text-xs font-medium text-red-600 mt-2">
                {error}
              </p>
            )}

            {/* SUCCESS */}

            {success && (
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {success}
              </p>
            )}
          </div>
        </div>

        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <div className="pt-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="text-xs text-gray-400 mt-0.5">
                Update your broker account information.
              </p>
            </div>

            {!editing && (
              <div className="flex items-center gap-2">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={
                    handleStartEditing
                  }
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-purple-600 hover:bg-purple-50 transition"
                >
                  Edit Profile
                </button>

                {/* PASSWORD */}

                <button
                  type="button"
                  onClick={
                    handleOpenChangePassword
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-purple-600 hover:bg-purple-50 transition"
                >
                  <LockKeyhole className="w-3.5 h-3.5" />
                  Change Password
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* FIRST NAME */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <User className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">

                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  First Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={
                      editForm.firstName
                    }
                    onChange={
                      handleFormChange
                    }
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.firstName ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* LAST NAME */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <User className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">

                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Last Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={
                      editForm.lastName
                    }
                    onChange={
                      handleFormChange
                    }
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.lastName ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <Mail className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">

                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </label>

                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={
                      editForm.email
                    }
                    onChange={
                      handleFormChange
                    }
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.email ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* PHONE */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <Phone className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">

                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Phone
                </label>

                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={
                      editForm.phone
                    }
                    onChange={
                      handleFormChange
                    }
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {profileData.phone ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* JOINED */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl sm:col-span-2">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <Calendar className="w-4 h-4" />
              </div>

              <div>

                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </label>

                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              SAVE / CANCEL
          ================================================== */}

          {editing && (
            <div className="flex flex-wrap items-center justify-end gap-3 mt-5 pt-5 border-t border-gray-100">

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          FOOTER MESSAGE
      ====================================================== */}

      <p className="text-xs text-gray-400 max-w-4xl mt-3 pl-1">
        Your broker profile information and photo are saved to your HomeSpace account.
      </p>

      {/* ======================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  Change Password
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  Update your broker account password securely.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseChangePassword
                }
                disabled={
                  changingPassword
                }
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-4">

              {/* CURRENT PASSWORD */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Current Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={
                      handlePasswordFormChange
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    value={
                      passwordForm.newPassword
                    }
                    onChange={
                      handlePasswordFormChange
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-1.5">
                  Password must be between 6 and 100 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={
                      handlePasswordFormChange
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {passwordError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">

                  <p className="text-xs font-medium text-red-600">
                    {passwordError}
                  </p>
                </div>
              )}

              {/* SUCCESS */}

              {passwordSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2.5">

                  <p className="text-xs font-medium text-green-600 flex items-center gap-1.5">

                    <CheckCircle2 className="w-4 h-4" />

                    {passwordSuccess}
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">

              <button
                type="button"
                onClick={
                  handleCloseChangePassword
                }
                disabled={
                  changingPassword
                }
                className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleChangePassword
                }
                disabled={
                  changingPassword
                }
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-60"
              >
                <LockKeyhole className="w-4 h-4" />

                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

