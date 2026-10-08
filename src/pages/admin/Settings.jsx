import { useEffect, useRef, useState } from "react";
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

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

const MAX_SIZE_MB = 2;

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

const normalizeProfileRole = (role) => {
  const value = String(role || "").toUpperCase();

  const roleMap = {
    SUPER_ADMIN: "admin",
    ADMIN: "admin",
    BUYER: "buyer",
    SELLER: "owner",
    BROKER: "agent",
  };

  return roleMap[value] || value.toLowerCase();
};

const ROLE_THEMES = {
  admin: {
    title: "Admin Workspace",
    fallbackColor: "bg-gray-700",
    avatarBorder: "border-gray-200",
    textColor: "text-gray-700",
    hoverBg: "hover:bg-gray-50",
  },

  agent: {
    title: "Agent Dashboard",
    fallbackColor: "bg-purple-600",
    avatarBorder: "border-purple-100",
    textColor: "text-purple-600",
    hoverBg: "hover:bg-purple-50",
  },

  owner: {
    title: "Owner Workspace",
    fallbackColor: "bg-pink-600",
    avatarBorder: "border-pink-100",
    textColor: "text-pink-600",
    hoverBg: "hover:bg-pink-50",
  },

  buyer: {
    title: "Client Portal",
    fallbackColor: "bg-indigo-600",
    avatarBorder: "border-indigo-100",
    textColor: "text-indigo-600",
    hoverBg: "hover:bg-indigo-50",
  },
};

export default function Settings() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const fileRef = useRef(null);
  const photoObjectUrlRef = useRef(null);

  const [profileData, setProfileData] =
    useState(user);

  const [originalProfile, setOriginalProfile] =
    useState(user);

  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // PHOTO
  // ============================================================

  const [preview, setPreview] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [photoUrl, setPhotoUrl] =
    useState(null);

  // ============================================================
  // PASSWORD
  // ============================================================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [passwordForm, setPasswordForm] =
    useState({
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
  // PROFILE ROLE
  // ============================================================

  const rawRole = normalizeProfileRole(
    profileData?.backendRole ||
      profileData?.role ||
      "admin"
  );

  const theme =
    ROLE_THEMES[rawRole] ||
    ROLE_THEMES.admin;

  // ============================================================
  // LOAD PROFILE PHOTO
  // ============================================================

  const loadProfilePhoto = async (userId) => {
    if (!userId) {
      return;
    }

    try {
      const blob =
        await userService.getProfilePhotoBlob(
          userId
        );

      if (!blob) {
        setPhotoUrl(null);
        return;
      }

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
        "No profile photo available:",
        err.message
      );

      setPhotoUrl(null);
    }
  };

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const userId =
        user?.userId ||
        user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await userService.getUserById(
            userId
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
          ...user,

          id: data.id,

          userId: data.id,

          firstName:
            data.firstName || "",

          lastName:
            data.lastName || "",

          name:
            fullName ||
            data.username ||
            user?.name ||
            "User",

          username:
            data.username,

          email:
            data.email || "",

          phone:
            data.phone || "",

          role:
            normalizeProfileRole(
              data.role
            ),

          backendRole:
            data.role,

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

        if (data.profilePhotoUrl) {
          await loadProfilePhoto(
            data.id
          );
        }
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load profile."
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
  }, [
    user?.id,
    user?.userId,
  ]);

  // ============================================================
  // CLEANUP PHOTO URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );
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
  // ============================================================

  const handleSaveProfile = async () => {
    const userId =
      profileData?.userId ||
      profileData?.id;

    if (!userId) {
      setError(
        "User ID is missing. Please login again."
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
      setError("First name is required.");
      return;
    }

    if (!lastName) {
      setError("Last name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

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
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedData =
        await userService.updateUser(
          userId,
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
          profileData.id,

        userId:
          updatedData.id ||
          profileData.userId,

        firstName:
          updatedData.firstName ||
          firstName,

        lastName:
          updatedData.lastName ||
          lastName,

        name:
          fullName ||
          profileData.name,

        username:
          updatedData.username ||
          profileData.username,

        email:
          updatedData.email ||
          email,

        phone:
          updatedData.phone ||
          phone,

        role:
          normalizeProfileRole(
            updatedData.role ||
              profileData.backendRole ||
              profileData.role
          ),

        backendRole:
          updatedData.role ||
          profileData.backendRole,

        status:
          updatedData.status ||
          profileData.status,

        accountType:
          updatedData.accountType ||
          profileData.accountType,

        profilePhotoUrl:
          updatedData.profilePhotoUrl ??
          profileData.profilePhotoUrl,

        createdAt:
          updatedData.createdAt ||
          profileData.createdAt,

        updatedAt:
          updatedData.updatedAt ||
          profileData.updatedAt,
      };

      setProfileData(
        updatedProfile
      );

      setOriginalProfile(
        updatedProfile
      );

      setEditForm({
        firstName:
          updatedProfile.firstName || "",

        lastName:
          updatedProfile.lastName || "",

        email:
          updatedProfile.email || "",

        phone:
          updatedProfile.phone || "",
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
        "Profile update failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // OPEN CHANGE PASSWORD
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
  // CLOSE CHANGE PASSWORD
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
  };

  // ============================================================
  // PASSWORD CHANGE
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

      await userService.changePassword(
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
        err.response?.data?.message ||
          err.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
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
        "Please select a JPG, PNG, WebP or GIF image."
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
        "Failed to read image."
      );
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // SAVE PHOTO
  // ============================================================

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await userService.uploadProfilePhoto(
        selectedFile
      );

      const userId =
        profileData?.userId ||
        profileData?.id;

      await loadProfilePhoto(
        userId
      );

      const updatedProfile = {
        ...profileData,
        profilePhotoUrl: true,
        profilePhotoUpdatedAt:
          Date.now(),
      };

      setProfileData(
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
        "Profile photo upload failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // REMOVE PHOTO
  // ============================================================

  const handleRemoveAvatar = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await userService.deleteProfilePhoto();

      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current =
          null;
      }

      setPhotoUrl(null);
      setPreview(null);
      setSelectedFile(null);

      const updatedProfile = {
        ...profileData,
        profilePhotoUrl: null,
        profilePhotoUpdatedAt:
          Date.now(),
      };

      setProfileData(
        updatedProfile
      );

      updateProfile(
        updatedProfile
      );

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setSuccess(
        "Profile photo removed."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Profile photo removal failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove profile photo."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL PHOTO
  // ============================================================

  const handleCancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // ============================================================
  // NO USER
  // ============================================================

  if (!profileData) {
    return (
      <div className="p-6 text-gray-500">
        User profile not available.
      </div>
    );
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
    "User";

  // ============================================================
  // FALLBACK AVATAR
  // ============================================================

  const avatarBackground =
    theme.fallbackColor.replace(
      "bg-",
      ""
    );

  const fallbackAvatar =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=${avatarBackground}&color=fff&size=150`;

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

  const accountLabel = `${
    rawRole.charAt(0).toUpperCase() +
    rawRole.slice(1)
  } Account`;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">

      {/* HEADER */}

      <div>
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block mb-1">
          {theme.title}
        </span>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Profile
        </h2>

        <p className="text-sm text-gray-500 mt-0.5">
          Manage your administrator profile, photo and password.
        </p>
      </div>

      {/* LOADING */}

      {loading && (
        <p className="text-xs text-gray-400">
          Loading profile...
        </p>
      )}

      {/* PROFILE CARD */}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">

        {/* TOP */}

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">

          {/* AVATAR */}

          <div
            className="relative group cursor-pointer"
            onClick={() =>
              fileRef.current?.click()
            }
          >
            <img
              src={currentAvatar}
              alt={displayName}
              className={`w-24 h-24 rounded-full object-cover border-4 ${theme.avatarBorder} shadow-sm`}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* PROFILE INFO */}

          <div className="flex-1 text-center sm:text-left min-w-0">

            <h3 className="text-xl font-bold text-gray-900 truncate">
              {displayName}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              {accountLabel}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">

              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5 text-gray-400" />

                {preview
                  ? "Change Choice"
                  : "Upload photo"}
              </button>

              {preview && (
                <>
                  <button
                    type="button"
                    onClick={
                      handleSaveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
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
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2"
                  >
                    Cancel
                  </button>
                </>
              )}

              {!preview &&
                photoUrl && (
                  <button
                    type="button"
                    onClick={
                      handleRemoveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />

                    Remove
                  </button>
                )}
            </div>

            <p className="text-[11px] text-gray-400 mt-2.5">
              JPG, PNG, WebP or GIF · Max{" "}
              {MAX_SIZE_MB}MB
            </p>

            {error && (
              <p className="text-xs font-medium text-red-600 mt-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {success}
              </p>
            )}
          </div>
        </div>

        {/* PERSONAL INFORMATION */}

        <div className="pt-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="text-xs text-gray-400 mt-0.5">
                Update your administrator account information.
              </p>
            </div>

            {!editing && (
              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={
                    handleStartEditing
                  }
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={
                    handleOpenChangePassword
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  <LockKeyhole className="w-3.5 h-3.5" />

                  Change Password
                </button>

              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* FIRST NAME */}

            <ProfileField
              icon={
                <User className="w-4 h-4" />
              }
              label="First Name"
              editing={editing}
              input={
                <input
                  type="text"
                  name="firstName"
                  value={
                    editForm.firstName
                  }
                  onChange={
                    handleFormChange
                  }
                  className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              }
              value={
                profileData.firstName ||
                "—"
              }
            />

            {/* LAST NAME */}

            <ProfileField
              icon={
                <User className="w-4 h-4" />
              }
              label="Last Name"
              editing={editing}
              input={
                <input
                  type="text"
                  name="lastName"
                  value={
                    editForm.lastName
                  }
                  onChange={
                    handleFormChange
                  }
                  className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              }
              value={
                profileData.lastName ||
                "—"
              }
            />

            {/* EMAIL */}

            <ProfileField
              icon={
                <Mail className="w-4 h-4" />
              }
              label="Email"
              editing={editing}
              input={
                <input
                  type="email"
                  name="email"
                  value={
                    editForm.email
                  }
                  onChange={
                    handleFormChange
                  }
                  className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              }
              value={
                profileData.email ||
                "—"
              }
            />

            {/* PHONE */}

            <ProfileField
              icon={
                <Phone className="w-4 h-4" />
              }
              label="Phone"
              editing={editing}
              input={
                <input
                  type="tel"
                  name="phone"
                  value={
                    editForm.phone
                  }
                  onChange={
                    handleFormChange
                  }
                  className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              }
              value={
                profileData.phone ||
                "—"
              }
            />

            {/* USERNAME */}

            <ProfileField
              icon={
                <User className="w-4 h-4" />
              }
              label="Username"
              value={
                profileData.username ||
                "—"
              }
            />

            {/* ROLE */}

            <ProfileField
              icon={
                <LockKeyhole className="w-4 h-4" />
              }
              label="Role"
              value={
                profileData.backendRole ||
                profileData.role ||
                "ADMIN"
              }
            />

            {/* JOINED */}

            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl sm:col-span-2">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm">
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

          {/* SAVE/CANCEL */}

          {editing && (
            <div className="flex items-center justify-end gap-3 mt-5 pt-5 border-t border-gray-100">

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}

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
                  Update your account password securely.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseChangePassword
                }
                disabled={changingPassword}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-4">

              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordFormChange
                }
                showPassword={
                  showCurrentPassword
                }
                setShowPassword={
                  setShowCurrentPassword
                }
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordFormChange
                }
                showPassword={
                  showNewPassword
                }
                setShowPassword={
                  setShowNewPassword
                }
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  handlePasswordFormChange
                }
                showPassword={
                  showConfirmPassword
                }
                setShowPassword={
                  setShowConfirmPassword
                }
              />

              {passwordError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-red-600">
                    {passwordError}
                  </p>
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {passwordSuccess}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-gray-400">
                Password must be between 6 and 100 characters.
              </p>

            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">

              <button
                type="button"
                onClick={
                  handleCloseChangePassword
                }
                disabled={changingPassword}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
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

// ============================================================
// PROFILE FIELD
// ============================================================

function ProfileField({
  icon,
  label,
  value,
  editing = false,
  input = null,
}) {
  return (
    <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

      <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>

        {editing && input ? (
          input
        ) : (
          <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
            {value}
          </p>
        )}

      </div>
    </div>
  );
}

// ============================================================
// PASSWORD INPUT
// ============================================================

function PasswordInput({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
      </label>

      <div className="relative">

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (value) => !value
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

      </div>
    </div>
  );
}