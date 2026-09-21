import { useState } from "react";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Eye,
  Users,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X,
} from "lucide-react";

export default function Properties() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Luxury 4 BHK Villa with Private Pool",
      location: "Sajapur Road, Bangalore",
      type: "4 BHK Villa",
      purpose: "FOR SALE",
      status: "Active",
      price: "₹3.50 Cr",
      bedrooms: 4,
      bathrooms: 4,
      area: "2800 sqft",
      views: 521,
      inquiries: 14,
      owner: "Rahul Kumar",
      agent: "Priya Sharma",
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    },
    {
      id: 2,
      title: "Spacious 3 BHK Apartment in Whitefield",
      location: "Whitefield, Bangalore",
      type: "3 BHK Apartment",
      purpose: "FOR SALE",
      status: "Pending",
      price: "₹1.25 Cr",
      bedrooms: 3,
      bathrooms: 3,
      area: "1470 sqft",
      views: 342,
      inquiries: 9,
      owner: "Anil Raj",
      agent: "Arjun Mehta",
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    },
    {
      id: 3,
      title: "3 BHK Independent House - HSR Layout",
      location: "HSR Layout Sector 2, Bangalore",
      type: "3 BHK Independent House",
      purpose: "FOR SALE",
      status: "Sold",
      price: "₹1.80 Cr",
      bedrooms: 3,
      bathrooms: 3,
      area: "2000 sqft",
      views: 398,
      inquiries: 6,
      owner: "Vikram S",
      agent: "Priya Sharma",
      image:
        "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
    },
    {
      id: 4,
      title: "2 BHK Fully Furnished Flat for Rent",
      location: "Koramangala, Bangalore",
      type: "2 BHK Apartment",
      purpose: "FOR RENT",
      status: "Rented",
      price: "₹45,000 /mo",
      bedrooms: 2,
      bathrooms: 2,
      area: "1100 sqft",
      views: 189,
      inquiries: 5,
      owner: "Meena Devi",
      agent: "Arjun Mehta",
      image:
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
    },
    {
      id: 5,
      title: "Modern 2 BHK Apartment",
      location: "Electronic City, Bangalore",
      type: "2 BHK Apartment",
      purpose: "FOR SALE",
      status: "Pending",
      price: "₹58,00,000",
      bedrooms: 2,
      bathrooms: 2,
      area: "1250 sqft",
      views: 274,
      inquiries: 11,
      owner: "Sneha R",
      agent: "Priya Sharma",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    },
    {
      id: 6,
      title: "Premium 3 BHK Family Home",
      location: "JP Nagar, Bangalore",
      type: "3 BHK House",
      purpose: "FOR SALE",
      status: "Active",
      price: "₹1.10 Cr",
      bedrooms: 3,
      bathrooms: 3,
      area: "1850 sqft",
      views: 416,
      inquiries: 12,
      owner: "Kiran Kumar",
      agent: "Arjun Mehta",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
  ]);

  const [newProperty, setNewProperty] = useState({
    title: "",
    location: "",
    propertyType: "Apartment",
    purpose: "FOR SALE",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    owner: "",
    agent: "",
    image: "",
  });

  const updateStatus = (id, status) => {
    setProperties((current) =>
      current.map((property) =>
        property.id === id ? { ...property, status } : property
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewProperty((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddProperty = (e) => {
    e.preventDefault();

    if (
      !newProperty.title ||
      !newProperty.location ||
      !newProperty.price ||
      !newProperty.bedrooms ||
      !newProperty.bathrooms ||
      !newProperty.area ||
      !newProperty.owner ||
      !newProperty.agent
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newId =
      properties.length > 0
        ? Math.max(...properties.map((property) => property.id)) + 1
        : 1;

    const propertyToAdd = {
      id: newId,
      title: newProperty.title,
      location: newProperty.location,
      type: `${newProperty.bedrooms} BHK ${newProperty.propertyType}`,
      purpose: newProperty.purpose,
      status: "Pending",
      price:
        newProperty.purpose === "FOR RENT"
          ? `₹${newProperty.price} /mo`
          : `₹${newProperty.price}`,
      bedrooms: Number(newProperty.bedrooms),
      bathrooms: Number(newProperty.bathrooms),
      area: `${newProperty.area} sqft`,
      views: 0,
      inquiries: 0,
      owner: newProperty.owner,
      agent: newProperty.agent,
      image:
        newProperty.image ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    };

    setProperties((current) => [propertyToAdd, ...current]);

    setNewProperty({
      title: "",
      location: "",
      propertyType: "Apartment",
      purpose: "FOR SALE",
      price: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      owner: "",
      agent: "",
      image: "",
    });

    setShowAddForm(false);
  };

  const filteredProperties = properties.filter((property) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      property.title.toLowerCase().includes(searchValue) ||
      property.location.toLowerCase().includes(searchValue) ||
      property.owner.toLowerCase().includes(searchValue) ||
      property.agent.toLowerCase().includes(searchValue);

    const matchesFilter =
      filter === "All" || property.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Sold":
        return "text-gray-600";
      case "Rented":
        return "text-blue-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Properties
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Review, approve and manage property listings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {filteredProperties.length} Properties
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Add Property Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add Property
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter property details to create a new listing
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleAddProperty}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={newProperty.title}
                  onChange={handleInputChange}
                  placeholder="Example: Luxury 3 BHK Apartment"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>

                <input
                  type="text"
                  name="location"
                  value={newProperty.location}
                  onChange={handleInputChange}
                  placeholder="Example: Whitefield, Bangalore"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>

                <select
                  name="propertyType"
                  value={newProperty.propertyType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Independent House">
                    Independent House
                  </option>
                  <option value="Plot">Plot</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>

                <select
                  name="purpose"
                  value={newProperty.purpose}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="FOR SALE">For Sale</option>
                  <option value="FOR RENT">For Rent</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>

                <input
                  type="text"
                  name="price"
                  value={newProperty.price}
                  onChange={handleInputChange}
                  placeholder="Example: 1.25 Cr"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>

                <input
                  type="number"
                  min="0"
                  name="bedrooms"
                  value={newProperty.bedrooms}
                  onChange={handleInputChange}
                  placeholder="Example: 3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>

                <input
                  type="number"
                  min="0"
                  name="bathrooms"
                  value={newProperty.bathrooms}
                  onChange={handleInputChange}
                  placeholder="Example: 2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sqft) *
                </label>

                <input
                  type="number"
                  min="0"
                  name="area"
                  value={newProperty.area}
                  onChange={handleInputChange}
                  placeholder="Example: 1500"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner *
                </label>

                <input
                  type="text"
                  name="owner"
                  value={newProperty.owner}
                  onChange={handleInputChange}
                  placeholder="Owner name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Agent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent *
                </label>

                <input
                  type="text"
                  name="agent"
                  value={newProperty.agent}
                  onChange={handleInputChange}
                  placeholder="Agent name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Image URL
                </label>

                <input
                  type="text"
                  name="image"
                  value={newProperty.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/property-image.jpg"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t">

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search by property, location, owner or agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">

            {[
              "All",
              "Active",
              "Pending",
              "Rented",
              "Sold",
              "Rejected",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition ${
                  filter === item
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredProperties.map((property) => (

          <div
            key={property.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
          >

            {/* Image */}
            <div className="relative h-52 bg-gray-100">

              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              {/* Sale / Rent */}
              <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">
                {property.purpose}
              </span>

              {/* Menu */}
              <button className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white">
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>

            </div>

            {/* Content */}
            <div className="p-5">

              {/* Status */}
              <div
                className={`flex items-center gap-1 text-sm font-medium mb-2 ${getStatusStyle(
                  property.status
                )}`}
              >
                {property.status === "Pending" ? (
                  <Clock className="w-4 h-4" />
                ) : property.status === "Rejected" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}

                {property.status}
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900">
                {property.title}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {property.location}
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-600">

                <div className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4" />
                  {property.bedrooms} BHK
                </div>

                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.bathrooms} Bath
                </div>

                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  {property.area}
                </div>

              </div>

              {/* Owner / Agent */}
              <div className="mt-4 pt-4 border-t">

                <div className="flex justify-between text-xs text-gray-500">

                  <span>
                    Owner:{" "}
                    <strong className="text-gray-700">
                      {property.owner}
                    </strong>
                  </span>

                  <span>
                    Agent:{" "}
                    <strong className="text-gray-700">
                      {property.agent}
                    </strong>
                  </span>

                </div>

              </div>

              {/* Bottom */}
              <div className="flex items-end justify-between mt-5">

                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Property Valuation
                  </p>

                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {property.price}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">

                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {property.views}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {property.inquiries}
                  </span>

                </div>

              </div>

              {/* Admin Actions */}
              {property.status === "Pending" && (
                <div className="flex gap-3 mt-5 pt-4 border-t">

                  <button
                    onClick={() =>
                      updateStatus(property.id, "Active")
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(property.id, "Rejected")
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>

                </div>
              )}

            </div>
          </div>

        ))}

      </div>

      {/* No Results */}
      {filteredProperties.length === 0 && (
        <div className="bg-white border rounded-xl p-12 text-center">

          <Search className="w-10 h-10 text-gray-300 mx-auto" />

          <h3 className="font-semibold text-gray-700 mt-3">
            No properties found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Try changing your search or filter.
          </p>

        </div>
      )}

    </div>
  );
}