import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  Target,
} from "lucide-react";
import {
  PROPERTY_TYPES,
  BHK_OPTIONS,
  STATUS_OPTIONS,
  LISTING_TYPES,
  FURNISHING,
  formatPrice,
} from "../../data/mockData";

const emptyForm = {
  title: "",
  description: "",
  propertyType: "Flat",
  listingType: "Buy",
  bhk: "2 BHK",
  status: "Ready to Move",
  price: "",
  pricePerSqft: "",
  area: "",
  areaUnit: "sqft",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  floor: "",
  totalFloors: "",
  furnishing: "Semi Furnished",
  age: "",
  facing: "",
  parking: "",
  location: "",
  city: "Bangalore",
  locality: "",
  pincode: "",
  amenities: "",
  images: "",
  sellerName: "",
  sellerPhone: "",
  sellerEmail: "",
  isFeatured: false,
};

export default function AgentProperties() {
  const { agent } = useAuth();
  const { properties, addProperty, updateProperty, deleteProperty } = useData();
  const myProps = properties.filter((p) => p.agentId === agent.id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      propertyType: p.propertyType || "Flat",
      listingType: p.listingType || "Buy",
      bhk: p.bhk || "",
      status: p.status || "Ready to Move",
      price: p.price || "",
      pricePerSqft: p.pricePerSqft || "",
      area: p.area || "",
      areaUnit: p.areaUnit || "sqft",
      bedrooms: p.bedrooms || "",
      bathrooms: p.bathrooms || "",
      balconies: p.balconies || "",
      floor: p.floor || "",
      totalFloors: p.totalFloors || "",
      furnishing: p.furnishing || "",
      age: p.age || "",
      facing: p.facing || "",
      parking: p.parking || "",
      location: p.location || "",
      city: p.city || "",
      locality: p.locality || "",
      pincode: p.pincode || "",
      amenities: (p.amenities || []).join(", "),
      images: (p.images || []).join("\n"),
      sellerName: p.sellerName || "",
      sellerPhone: p.sellerPhone || "",
      sellerEmail: p.sellerEmail || "",
      isFeatured: p.isFeatured || false,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      pricePerSqft: form.pricePerSqft ? Number(form.pricePerSqft) : null,
      area: Number(form.area) || 0,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      balconies: form.balconies ? Number(form.balconies) : null,
      parking: form.parking ? Number(form.parking) : null,
      amenities: form.amenities
        ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean)
        : [],
      images: form.images
        ? form.images.split("\n").map((u) => u.trim()).filter(Boolean)
        : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"],
      agentId: agent.id,
    };

    if (editingId) {
      updateProperty(editingId, payload);
    } else {
      addProperty(payload);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this property?")) {
      deleteProperty(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
          <p className="text-sm text-gray-500">{myProps.length} listings</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myProps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No properties yet. Click "Add Property" to list one.
                  </td>
                </tr>
              ) : (
                myProps.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-500">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {p.propertyType}
                      </span>
                      <span className="text-xs ml-1 text-gray-500">
                        {p.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(p.price, p.listingType)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-3.5 h-3.5" /> {p.views}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Target className="w-3.5 h-3.5" /> {p.leads}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingId ? "Edit Property" : "Add New Property"}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={form.listingType}
                    onChange={(e) =>
                      setForm({ ...form, listingType: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {LISTING_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Property Type
                  </label>
                  <select
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm({ ...form, propertyType: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    BHK
                  </label>
                  <select
                    value={form.bhk}
                    onChange={(e) => setForm({ ...form, bhk: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">N/A</option>
                    {BHK_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Area (sqft)
                  </label>
                  <input
                    type="number"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm({ ...form, bedrooms: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm({ ...form, bathrooms: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Furnishing
                  </label>
                  <select
                    value={form.furnishing}
                    onChange={(e) =>
                      setForm({ ...form, furnishing: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">N/A</option>
                    {FURNISHING.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Parking
                  </label>
                  <input
                    type="number"
                    value={form.parking}
                    onChange={(e) =>
                      setForm({ ...form, parking: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Location *
                  </label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="e.g. Whitefield, Bangalore"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Locality
                  </label>
                  <input
                    value={form.locality}
                    onChange={(e) =>
                      setForm({ ...form, locality: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Amenities (comma separated)
                  </label>
                  <input
                    value={form.amenities}
                    onChange={(e) =>
                      setForm({ ...form, amenities: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Gym, Pool, Parking"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Image URLs (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={form.images}
                    onChange={(e) =>
                      setForm({ ...form, images: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Seller Name
                  </label>
                  <input
                    value={form.sellerName}
                    onChange={(e) =>
                      setForm({ ...form, sellerName: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Seller Phone
                  </label>
                  <input
                    value={form.sellerPhone}
                    onChange={(e) =>
                      setForm({ ...form, sellerPhone: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Mark as Featured
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  {editingId ? "Update" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
