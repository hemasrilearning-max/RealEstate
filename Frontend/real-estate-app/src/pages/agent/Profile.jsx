import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Star,
  Phone,
  Mail,
  Building2,
  Calendar,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const MAX_SIZE_MB = 2;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function Profile() {
  const { agent, user, updateProfile } = useAuth();
  const profile = agent || user;
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const currentAvatar =
    preview ||
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || "A"
    )}&background=dc2626&color=fff&size=150`;

  const handleFileSelect = (e) => {
    setError("");
    setSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP or GIF).");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.onerror = () => setError("Failed to read image. Try another file.");
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (!preview) return;
    setSaving(true);
    setError("");
    // Small delay so UI shows saving state
    setTimeout(() => {
      updateProfile({ avatar: preview });
      setPreview(null);
      setSuccess("Profile photo updated successfully!");
      setSaving(false);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(""), 3000);
    }, 200);
  };

  const handleRemoveAvatar = () => {
    setError("");
    setSuccess("");
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || "A"
    )}&background=dc2626&color=fff&size=150`;
    updateProfile({ avatar: fallback });
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setSuccess("Profile photo removed.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500">
          Your agent profile details and photo
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Avatar section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative group">
            <img
              src={currentAvatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-red-100 shadow-sm"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="Change photo"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-gray-500">{profile.company || "Agent"}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">
                {profile.rating ?? 0}
              </span>
              <span className="text-xs text-gray-400 ml-1">
                ({profile.totalDeals ?? 0} deals)
              </span>
            </div>

            {/* Upload controls */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                {preview ? "Choose another" : "Upload photo"}
              </button>

              {preview && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save photo"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2"
                  >
                    Cancel
                  </button>
                </>
              )}

              {!preview && profile.avatar && !profile.avatar.includes("ui-avatars.com") && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP or GIF · Max {MAX_SIZE_MB}MB
            </p>

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium truncate">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">
                {profile.phone || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Company</p>
              <p className="text-sm font-medium">
                {profile.company || "Independent Agent"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Joined</p>
              <p className="text-sm font-medium">
                {profile.joinedAt
                  ? new Date(profile.joinedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Your photo is saved in this browser (demo). After you upload, it appears
        in the sidebar and navbar immediately.
      </p>
    </div>
  );
}
