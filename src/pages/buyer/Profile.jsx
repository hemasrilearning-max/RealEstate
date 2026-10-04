import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

import {
  Phone,
  Mail,
  User,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  Pencil,
  X,
  Save,
} from "lucide-react";

const MAX_SIZE_MB = 2;

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

/* ============================================================
   HELPERS
============================================================ */

function getProfileName(profile) {
  if (profile?.name) {
    return profile.name;
  }

  return [
    profile?.firstName,
    profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function mapBackendProfile(profile) {
  const name = getProfileName(profile);

  return {
    ...profile,

    id:
      profile?.id ||
      profile?.userId,

    userId:
      profile?.userId ||
      profile?.id,

    username:
      profile?.username ||
      "",

    firstName:
      profile?.firstName ||
      "",

    lastName:
      profile?.lastName ||
      "",

    name:
      name || "",

    email:
      profile?.email ||
      "",

    phone:
      profile?.phone ||
      profile?.phoneNumber ||
      "",
  };
}

/* ============================================================
   COMPONENT
============================================================ */

export default function BuyerProfile() {
  const {
    buyer,
    user,
    updateProfile,
  } = useAuth();

  const profile = buyer || user;

  const fileRef = useRef(null);

  const [backendProfile, setBackendProfile] =
    useState(profile || null);

  const [preview, setPreview] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [profilePhotoUrl, setProfilePhotoUrl] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const effectiveProfile =
    backendProfile || profile;

  const [form, setForm] = useState({
    username:
      effectiveProfile?.username ||
      "",

    name:
      getProfileName(effectiveProfile) ||
      "",

    email:
      effectiveProfile?.email ||
      "",

    phone:
      effectiveProfile?.phone ||
      effectiveProfile?.phoneNumber ||
      "",
  });

  const userId =
    effectiveProfile?.userId ||
    effectiveProfile?.id;

  /* ============================================================
     LOAD PROFILE FROM BACKEND
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await userService.getUserById(
            userId
          );

        if (cancelled) {
          return;
        }

        const normalized =
          mapBackendProfile(response);

        setBackendProfile(normalized);

        setForm({
          username:
            normalized.username || "",

          name:
            normalized.name || "",

          email:
            normalized.email || "",

          phone:
            normalized.phone || "",
        });
      } catch (err) {
        console.error(
          "Failed to load buyer profile:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load profile details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ============================================================
     LOAD PROFILE PHOTO
  ============================================================ */

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadProfilePhoto = async () => {
      if (!userId) {
        return;
      }

      try {
        const blob =
          await userService.getProfilePhotoBlob(
            userId
          );

        if (cancelled) {
          return;
        }

        objectUrl =
          URL.createObjectURL(blob);

        setProfilePhotoUrl(objectUrl);
      } catch (err) {
        console.debug(
          "No backend profile photo available:",
          err
        );
      }
    };

    loadProfilePhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId]);

  if (!effectiveProfile) {
    return null;
  }

  /* ============================================================
     CURRENT AVATAR
  ============================================================ */

  const currentAvatar =
    preview ||
    profilePhotoUrl ||
    effectiveProfile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      effectiveProfile.name || "User"
    )}&background=10b981&color=fff&size=150`;

  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     EDIT PROFILE
  ============================================================ */

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setForm({
      username:
        effectiveProfile.username || "",

      name:
        getProfileName(effectiveProfile) ||
        "",

      email:
        effectiveProfile.email || "",

      phone:
        effectiveProfile.phone ||
        effectiveProfile.phoneNumber ||
        "",
    });

    setEditing(true);
  };

  /* ============================================================
     CANCEL EDIT
  ============================================================ */

  const handleCancelEdit = () => {
    setEditing(false);
    setError("");

    setForm({
      username:
        effectiveProfile.username || "",

      name:
        getProfileName(effectiveProfile) ||
        "",

      email:
        effectiveProfile.email || "",

      phone:
        effectiveProfile.phone ||
        effectiveProfile.phoneNumber ||
        "",
    });
  };

  /* ============================================================
     SAVE PROFILE DETAILS
  ============================================================ */

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (!userId) {
      setError(
        "Unable to identify your user account."
      );
      return;
    }

    setSaving(true);

    try {
      const nameParts =
        form.name
          .trim()
          .split(/\s+/);

      const firstName =
        nameParts.shift() || "";

      const lastName =
        nameParts.join(" ");

      /* --------------------------------------------------------
         UPDATE BACKEND
      -------------------------------------------------------- */

      const updatedProfile =
        await userService.updateUser(
          userId,
          {
            username:
              form.username.trim(),

            firstName,

            lastName,

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),
          }
        );

      /* --------------------------------------------------------
         NORMALIZE BACKEND RESPONSE
      -------------------------------------------------------- */

      const normalized =
        mapBackendProfile({
          ...effectiveProfile,
          ...updatedProfile,

          username:
            form.username.trim(),

          firstName,

          lastName,

          name:
            form.name.trim(),

          email:
            form.email.trim(),

          phone:
            form.phone.trim(),
        });

      setBackendProfile(normalized);

      setForm({
        username:
          normalized.username ||
          form.username.trim(),

        name:
          normalized.name ||
          form.name.trim(),

        email:
          normalized.email ||
          form.email.trim(),

        phone:
          normalized.phone ||
          form.phone.trim(),
      });

      /* --------------------------------------------------------
         IMPORTANT

         Only update profile information.

         Do NOT spread the complete backend response into
         AuthContext because that can overwrite authentication
         fields such as role.
      -------------------------------------------------------- */

      updateProfile({
        username:
          normalized.username,

        firstName:
          normalized.firstName,

        lastName:
          normalized.lastName,

        name:
          normalized.name,

        email:
          normalized.email,

        phone:
          normalized.phone,
      });

      setEditing(false);

      setSuccess(
        "Profile details updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     SELECT PHOTO
  ============================================================ */

  const handleFileSelect = (e) => {
    setError("");
    setSuccess("");

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file (JPG, PNG, WebP or GIF)."
      );
      return;
    }

    if (
      file.size >
      MAX_SIZE_MB * 1024 * 1024
    ) {
      setError(
        `Image must be smaller than ${MAX_SIZE_MB}MB.`
      );
      return;
    }

    setSelectedFile(file);

    const reader =
      new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.onerror = () => {
      setError(
        "Failed to read image. Try another file."
      );

      setSelectedFile(null);
    };

    reader.readAsDataURL(file);
  };

  /* ============================================================
     SAVE PROFILE PHOTO
  ============================================================ */

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      return;
    }

    if (!userId) {
      setError(
        "Unable to identify your user account."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await userService.uploadProfilePhoto(
        selectedFile
      );

      const blob =
        await userService.getProfilePhotoBlob(
          userId
        );

      const newObjectUrl =
        URL.createObjectURL(blob);

      setProfilePhotoUrl(
        newObjectUrl
      );

      setPreview(null);
      setSelectedFile(null);

      /*
       * Do not save a temporary blob URL into authUser.
       */
      updateProfile({
        avatar: null,
      });

      setSuccess(
        "Profile photo updated successfully."
      );

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to upload profile photo:",
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

  /* ============================================================
     REMOVE PROFILE PHOTO
  ============================================================ */

  const handleRemoveAvatar = async () => {
    setError("");
    setSuccess("");

    if (!userId) {
      setError(
        "Unable to identify your user account."
      );
      return;
    }

    try {
      setSaving(true);

      await userService.deleteProfilePhoto();

      setPreview(null);
      setSelectedFile(null);
      setProfilePhotoUrl(null);

      updateProfile({
        avatar: null,
      });

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
        "Failed to remove profile photo:",
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

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Profile
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Manage your buyer profile details and photo
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-500 shadow-sm">
          Loading your profile...
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">

        {/* Profile Photo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">

          <div
            className="relative group cursor-pointer"
            onClick={() =>
              fileRef.current?.click()
            }
          >
            <img
              src={currentAvatar}
              alt={
                effectiveProfile.name ||
                "Buyer"
              }
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">

            <h3 className="text-xl font-bold text-gray-900 truncate">
              {effectiveProfile.name ||
                "Buyer"}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              @{effectiveProfile.username ||
                "username"}
            </p>

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

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5 text-gray-400" />

                {preview
                  ? "Choose Another"
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save photo"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(
                        null
                      );

                      if (
                        fileRef.current
                      ) {
                        fileRef.current.value =
                          "";
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2"
                  >
                    Cancel
                  </button>
                </>
              )}

              {!preview &&
                (profilePhotoUrl ||
                  effectiveProfile.avatar) && (
                  <button
                    type="button"
                    onClick={
                      handleRemoveAvatar
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition disabled:opacity-60"
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

        {/* EDIT MODE */}
        {editing ? (
          <div className="pt-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 mt-4">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">

              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <X className="w-4 h-4" />

                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">

            {/* Username */}
            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <User className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Username
                </label>

                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                  {effectiveProfile.username ||
                    ""}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <User className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Full Name
                </label>

                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                  {effectiveProfile.name ||
                    ""}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <Mail className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </label>

                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                  {effectiveProfile.email ||
                    ""}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">

              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
                <Phone className="w-4 h-4" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Phone
                </label>

                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {effectiveProfile.phone ||
                    effectiveProfile.phoneNumber ||
                    ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 max-w-4xl mt-3 pl-1">
        Your profile details and photo are saved securely through
        your HomeSpace account.
      </p>
    </div>
  );
}