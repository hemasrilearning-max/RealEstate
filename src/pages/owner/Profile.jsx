import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

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
} from "lucide-react";

const MAX_SIZE_MB = 2;

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

// ============================================================
// ROLE NORMALIZATION
// Backend roles:
// SUPER_ADMIN, ADMIN, BUYER, SELLER, BROKER
//
// Frontend roles:
// admin, buyer, owner, agent
// ============================================================

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

// ============================================================
// ROLE THEMES
// ============================================================

const ROLE_THEMES = {
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

  admin: {
    title: "Admin Workspace",
    fallbackColor: "bg-gray-700",
    avatarBorder: "border-gray-200",
    textColor: "text-gray-700",
    hoverBg: "hover:bg-gray-50",
  },
};

export default function UniversalProfile() {
  const {
    agent,
    owner,
    buyer,
    user,
    updateProfile,
  } = useAuth();

  // ============================================================
  // IDENTIFY ACTIVE PROFILE
  // ============================================================

  const profile =
    agent ||
    owner ||
    buyer ||
    user;

  // ============================================================
  // NORMALIZE ROLE
  // ============================================================

  const rawRole = normalizeProfileRole(
    profile?.role ||
      profile?.backendRole ||
      "owner"
  );

  const theme =
    ROLE_THEMES[rawRole] ||
    ROLE_THEMES.owner;

  // ============================================================
  // REFS
  // ============================================================

  const fileRef = useRef(null);

  const photoObjectUrlRef =
    useRef(null);

  // ============================================================
  // PROFILE STATE
  // ============================================================

  const [profileData, setProfileData] =
    useState(profile);

  const [originalProfile, setOriginalProfile] =
    useState(profile);

  const [editForm, setEditForm] =
    useState({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });

  const [editing, setEditing] =
    useState(false);

  const [preview, setPreview] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [photoUrl, setPhotoUrl] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // LOAD PROFILE PHOTO USING JWT
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

      if (
        photoObjectUrlRef.current
      ) {
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

      if (
        photoObjectUrlRef.current
      ) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current =
          null;
      }

      setPhotoUrl(null);
    }
  };

  // ============================================================
  // LOAD PROFILE FROM BACKEND
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const userId =
        profile?.userId ||
        profile?.id;

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

        const backendRole =
          normalizeProfileRole(
            data.role
          );

        const updatedProfile = {
          ...profile,

          id: data.id,

          userId: data.id,

          firstName:
            data.firstName,

          lastName:
            data.lastName,

          name:
            fullName ||
            data.username ||
            profile?.name ||
            "User",

          username:
            data.username,

          email:
            data.email,

          phone:
            data.phone,

          role:
            backendRole ||
            normalizeProfileRole(
              profile?.role
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
        } else {
          setPhotoUrl(null);
        }
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );

        if (mounted) {
          setError(
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
    profile?.id,
    profile?.userId,
  ]);

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        photoObjectUrlRef.current
      ) {
        URL.revokeObjectURL(
          photoObjectUrlRef.current
        );

        photoObjectUrlRef.current =
          null;
      }
    };
  }, []);

  // ============================================================
  // HANDLE FORM CHANGE
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
  // START EDITING
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
  // CANCEL PROFILE EDIT
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
  // SAVE PROFILE INFORMATION
  // ============================================================

  const handleSaveProfile = async () => {
    const userId =
      profileData?.userId ||
      profileData?.id;

    if (!userId) {
      setError(
        "User ID is missing. Please log in again."
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

    // ========================================================
    // BASIC VALIDATION
    // ========================================================

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

      // ======================================================
      // UPDATE BACKEND
      //
      // Only fields supported by UpdateUserRequest are sent.
      // Company, role, username and joined date are NOT sent.
      // ======================================================

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

      // ======================================================
      // BUILD UPDATED LOCAL PROFILE
      // ======================================================

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

      const normalizedRole =
        normalizeProfileRole(
          updatedData.role ||
            profileData?.backendRole ||
            profileData?.role
        );

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
          normalizedRole,

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
        "Profile update failed:",
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
  // UPLOAD PHOTO
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

  avatar: null,

  profilePhotoUpdatedAt: Date.now(),
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

  const handleRemoveAvatar =
    async () => {
      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await userService.deleteProfilePhoto();

        if (
          photoObjectUrlRef.current
        ) {
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

  avatar: null,

  profilePhotoUpdatedAt: Date.now(),
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

  const handleCancelPreview =
    () => {
      setPreview(null);

      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
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
      : profileData.joinedDate ||
        "15 January 2023";

  // ============================================================
  // ACCOUNT LABEL
  // ============================================================

  const accountLabel = `${
    rawRole
      .charAt(0)
      .toUpperCase() +
    rawRole.slice(1)
  } Account`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      {/* ========================================================
          MAIN HEADLINE
      ======================================================== */}

      <div>
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block mb-1">
          {theme.title}
        </span>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Profile
        </h2>

        <p className="text-sm text-gray-500 mt-0.5">
          Your personal profile details and photo management.
        </p>
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <p className="text-xs text-gray-400">
          Loading profile...
        </p>
      )}

      {/* ========================================================
          MAIN PROFILE CARD
      ======================================================== */}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
        {/* ======================================================
            TOP SPLIT VIEW
        ====================================================== */}

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          {/* ====================================================
              AVATAR
          ==================================================== */}

          <div
            className="relative group cursor-pointer"
            onClick={() =>
              fileRef.current?.click()
            }
          >
            <img
              src={currentAvatar}
              alt={displayName}
              className={`w-24 h-24 rounded-full object-cover border-4 ${theme.avatarBorder} shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* ====================================================
              PROFILE NAME + PHOTO CONTROLS
          ==================================================== */}

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {displayName}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              {accountLabel}
            </p>

            {/* ==================================================
                PERFORMANCE METRICS
            ================================================== */}

            {(rawRole === "agent" ||
              profileData.rating) && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-1.5 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />

                <span className="font-semibold text-gray-800">
                  {profileData.rating ??
                    "4.8"}
                </span>

                <span className="text-gray-400 text-xs">
                  (
                  {profileData.totalDeals ??
                    "47"}{" "}
                  deals)
                </span>
              </div>
            )}

            {/* ==================================================
                PHOTO CONTROLS
            ================================================== */}

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={
                  handleFileSelect
                }
              />

              {/* UPLOAD */}

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

              {/* PHOTO SAVE */}

              {preview && (
                <>
                  <button
                    type="button"
                    onClick={
                      handleSaveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
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

              {/* REMOVE */}

              {!preview &&
                photoUrl && (
                  <button
                    type="button"
                    onClick={
                      handleRemoveAvatar
                    }
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 ${theme.hoverBg} transition disabled:opacity-50`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />

                    Remove
                  </button>
                )}
            </div>

            {/* ==================================================
                FILE INFORMATION
            ================================================== */}

            <p className="text-[11px] text-gray-400 mt-2.5">
              JPG, PNG, WebP or GIF · Max{" "}
              {MAX_SIZE_MB}MB
            </p>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <p className="text-xs font-medium text-red-600 mt-2">
                {error}
              </p>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />

                {success}
              </p>
            )}
          </div>
        </div>

        {/* ======================================================
            PROFILE INFORMATION
        ====================================================== */}

        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="text-xs text-gray-400 mt-0.5">
                Update your basic account information.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={
                  handleStartEditing
                }
                className={`text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 ${theme.textColor} ${theme.hoverBg} transition`}
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ==================================================
                FIRST NAME
            ================================================== */}

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
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.firstName ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* ==================================================
                LAST NAME
            ================================================== */}

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
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.lastName ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

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
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {profileData.email ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

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
                    className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {profileData.phone ||
                      "—"}
                  </p>
                )}
              </div>
            </div>

            {/* ==================================================
                JOINED DATE - DISPLAY ONLY
            ================================================== */}

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

          {/* ====================================================
              SAVE / CANCEL PROFILE CHANGES
          ==================================================== */}

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
                className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          BACKEND PROFILE MESSAGE
      ======================================================== */}

      <p className="text-xs text-gray-400 max-w-4xl mt-3 pl-1">
        Your profile information and photo are saved to your HomeSpace account.
      </p>
    </div>
  );
}

