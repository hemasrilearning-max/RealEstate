import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "9876543210",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    newUsers: true,
    newProperties: true,
    payments: true,
    disputes: true,
    fraudAlerts: true,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your admin account and system preferences
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="bg-white border rounded-xl p-3 h-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
              activeTab === "profile"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
              activeTab === "security"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Lock className="w-5 h-5" />
            Security
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
              activeTab === "notifications"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
              activeTab === "system"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Shield className="w-5 h-5" />
            System
          </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white border rounded-xl p-6">
          {/* Profile */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Profile
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6">
                Update your administrator account information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>

                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>

              <SaveButton onClick={handleSave} />
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Security
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6">
                Change your password and manage account security.
              </p>

              <div className="space-y-5 max-w-xl">
                <PasswordInput
                  label="Current Password"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />

                <PasswordInput
                  label="New Password"
                  name="newPassword"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />

                <PasswordInput
                  label="Confirm New Password"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <SaveButton onClick={handleSave} />
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6">
                Choose which notifications you want to receive.
              </p>

              <div className="space-y-4">
                <NotificationToggle
                  title="Email Notifications"
                  description="Receive important notifications through email."
                  checked={notifications.email}
                  onChange={() =>
                    handleNotificationChange("email")
                  }
                />

                <NotificationToggle
                  title="New User Registrations"
                  description="Get notified when a new user registers."
                  checked={notifications.newUsers}
                  onChange={() =>
                    handleNotificationChange("newUsers")
                  }
                />

                <NotificationToggle
                  title="New Property Listings"
                  description="Get notified when a property requires approval."
                  checked={notifications.newProperties}
                  onChange={() =>
                    handleNotificationChange("newProperties")
                  }
                />

                <NotificationToggle
                  title="Payment Notifications"
                  description="Receive updates about transactions and payments."
                  checked={notifications.payments}
                  onChange={() =>
                    handleNotificationChange("payments")
                  }
                />

                <NotificationToggle
                  title="Dispute Notifications"
                  description="Receive alerts when a new dispute is raised."
                  checked={notifications.disputes}
                  onChange={() =>
                    handleNotificationChange("disputes")
                  }
                />

                <NotificationToggle
                  title="Fraud Alerts"
                  description="Receive alerts for suspicious activity."
                  checked={notifications.fraudAlerts}
                  onChange={() =>
                    handleNotificationChange("fraudAlerts")
                  }
                />
              </div>

              <SaveButton onClick={handleSave} />
            </div>
          )}

          {/* System */}
          {activeTab === "system" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                System Settings
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6">
                Manage basic platform configuration.
              </p>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      User Registration
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Allow new users to register on the platform.
                    </p>
                  </div>

                  <Toggle defaultChecked />
                </div>

                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Property Approval
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Require admin approval before properties are published.
                    </p>
                  </div>

                  <Toggle defaultChecked />
                </div>

                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Review Moderation
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Review new reviews before publishing them.
                    </p>
                  </div>

                  <Toggle defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Fraud Detection
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Enable automatic suspicious activity monitoring.
                    </p>
                  </div>

                  <Toggle defaultChecked />
                </div>
              </div>

              <SaveButton onClick={handleSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Save Button */
function SaveButton({ onClick }) {
  return (
    <div className="mt-6">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700"
      >
        <Save className="w-4 h-4" />
        Save Changes
      </button>
    </div>
  );
}

/* Password Input */
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 pr-11 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* Notification Toggle */
function NotificationToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h3 className="font-medium text-gray-900">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

/* Toggle */
function Toggle({
  checked,
  onChange,
  defaultChecked = false,
}) {
  const [internalChecked, setInternalChecked] =
    useState(defaultChecked);

  const isChecked =
    checked !== undefined ? checked : internalChecked;

  const handleChange = () => {
    if (onChange) {
      onChange();
    } else {
      setInternalChecked(!internalChecked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleChange}
      className={`relative w-11 h-6 rounded-full transition ${
        isChecked ? "bg-purple-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
          isChecked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}