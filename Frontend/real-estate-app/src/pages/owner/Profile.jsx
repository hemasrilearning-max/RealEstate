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

// 🎨 Dynamic theme mapper based on user role
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
};

export default function UniversalProfile() {
  // Pull current user context (fallback automatically to user if agent role isn't distinct)
  const { agent, owner, buyer, user, updateProfile } = useAuth();
  
  // 1. Identify active profile & deduce their workspace role
  const profile = agent || owner || buyer || user;
  const rawRole = profile?.role?.toLowerCase() || "agent"; // Fallback to 'agent' as matching the screenshot layout
  const theme = ROLE_THEMES[rawRole] || ROLE_THEMES.agent;

  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  // Generate background letter avatar based on their theme color
  const currentAvatar =
    preview ||
    profile.avatar ||
    `https://ui-avatars.com{encodeURIComponent(
      profile.name || "U"
    )}&background=${theme.fallbackColor.replace("bg-", "")}&color=fff&size=150`;

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
    reader.onload = () => setPreview(reader.result);
    reader.onerror = () => setError("Failed to read image. Try another file.");
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (!preview) return;
    setSaving(true);
    setError("");
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
    updateProfile({ avatar: null });
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setSuccess("Profile photo removed.");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      {/* Dynamic Main Headline */}
      <div>
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block mb-1">
          {theme.title}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Your personal profile details and photo management.
        </p>
      </div>

      {/* Main Base Info Box Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
        
        {/* Top Split View: Avatar Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <img
              src={currentAvatar}
              alt={profile.name}
              className={`w-24 h-24 rounded-full object-cover border-4 ${theme.avatarBorder} shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">{profile.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.company || `${rawRole.charAt(0).toUpperCase() + rawRole.slice(1)} Account`}
            </p>

            {/* Performance Metrics line - Only shows stars for Agents or Owners with ratings */}
            {(rawRole === "agent" || profile.rating) && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-1.5 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-800">{profile.rating ?? "4.8"}</span>
                <span className="text-gray-400 text-xs">({profile.totalDeals ?? "47"} deals)</span>
              </div>
            )}

            {/* Picture Manipulation Controls */}
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
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5 text-gray-400" />
                {preview ? "Change Choice" : "Upload photo"}
              </button>

              {preview && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2"
                  >
                    Cancel
                  </button>
                </>
              )}

              {!preview && profile.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 ${theme.hoverBg} transition`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400 mt-2.5">
              JPG, PNG, WebP or GIF · Max {MAX_SIZE_MB}MB
            </p>

            {error && <p className="text-xs font-medium text-red-600 mt-2">{error}</p>}
            {success && (
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {success}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section Layout: 4-Segment Grid Info Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          
          {/* Box item 1: Email */}
          <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">Email</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{profile.email}</p>
            </div>
          </div>

          {/* Box item 2: Phone */}
          <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">Phone</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile.phone || "—"}</p>
            </div>
          </div>

          {/* Box item 3: Company */}
          <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
                       <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">Company</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {profile.company || (rawRole === "buyer" ? "Individual Client" : "Private Portfolio")}
              </p>
            </div>
          </div>

          {/* Box item 4: Joined Date */}
          <div className="flex items-start gap-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 shadow-sm shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">Joined</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile.joinedDate || "15 January 2023"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Demo helper alert snippet from the bottom of your image */}
      <p className="text-xs text-gray-400 max-w-4xl mt-3 pl-1">
        Your photo is saved in this browser (demo). After you upload, it appears in the sidebar and navbar immediately.
      </p>
    </div>
  );
}

