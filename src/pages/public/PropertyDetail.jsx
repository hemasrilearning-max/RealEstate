import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Heart,
} from "lucide-react";

import { useData } from "../../context/DataContext";
import { formatPrice } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    properties,
    addLead,
    addTourRequest,
    addViewedProperty,
    isFavorite,
    toggleFavorite,
  } = useData();

  const { agent, user, isAuthenticated } = useAuth();

  const property = properties.find(
    (p) => String(p.id) === String(id)
  );

  const [imgIdx, setImgIdx] = useState(0);

  const [showLeadForm, setShowLeadForm] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  /*
   * ============================================================
   * RECORD VIEWED PROPERTY
   * ============================================================
   *
   * Whenever a logged-in buyer opens a property, its ID is
   * stored in DataContext and localStorage.
   *
   * The same property is not duplicated.
   */
  useEffect(() => {
    if (!property || !isAuthenticated) {
      return;
    }

    addViewedProperty(property.id);
  }, [property?.id, isAuthenticated]);

  /*
   * ============================================================
   * LOAD USER INFORMATION INTO CONTACT FORM
   * ============================================================
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    setLeadForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  /*
   * ============================================================
   * PROPERTY NOT FOUND
   * ============================================================
   */
  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Property not found
        </h2>

        <Link
          to="/properties"
          className="text-purple-600 mt-4 inline-block hover:text-purple-700"
        >
          ← Back to listings
        </Link>
      </div>
    );
  }

  const images = property.images || [];

  /*
   * ============================================================
   * IMAGE CONTROLS
   * ============================================================
   */
  const nextImg = () => {
    if (images.length === 0) return;

    setImgIdx(
      (current) => (current + 1) % images.length
    );
  };

  const prevImg = () => {
    if (images.length === 0) return;

    setImgIdx(
      (current) =>
        (current - 1 + images.length) % images.length
    );
  };

  /*
   * ============================================================
   * FAVORITE
   * ============================================================
   */
  const favorite = isFavorite(property.id);

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleFavorite(property.id);
  };

  /*
   * ============================================================
   * LEAD SUBMISSION
   * ============================================================
   */
  const handleLeadSubmit = (e) => {
    e.preventDefault();

    addLead({
      ...leadForm,
      propertyId: property.id,
      agentId: property.agentId || 1,
      source: "Website",
    });

    setSubmitted(true);
    setShowLeadForm(false);
  };

  /*
   * ============================================================
   * TOUR REQUEST
   * ============================================================
   */
  const handleTourRequest = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!leadForm.name) {
      setShowLeadForm(true);
      return;
    }

    addTourRequest({
      propertyId: property.id,
      name: leadForm.name,
      email: leadForm.email,
      phone: leadForm.phone,

      preferredDate: new Date(
        Date.now() + 86400000 * 2
      )
        .toISOString()
        .slice(0, 10),

      preferredTime: "11:00 AM",

      notes: "Requested from property page",

      agentId: property.agentId || 1,
    });

    alert(
      "Tour request submitted! Agent will contact you soon."
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ========================================================
          BACK TO LISTINGS
      ======================================================== */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 mb-4 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ====================================================
              IMAGE GALLERY
          ==================================================== */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">

            <img
              src={
                images[imgIdx] ||
                "https://via.placeholder.com/800x500"
              }
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* FAVORITE BUTTON */}
            <button
              type="button"
              onClick={handleFavorite}
              aria-label={
                favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:bg-white transition"
            >
              <Heart
                className={`w-5 h-5 ${
                  favorite
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600"
                }`}
              />
            </button>

            {/* IMAGE NAVIGATION */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setImgIdx(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`w-2 h-2 rounded-full ${
                        i === imgIdx
                          ? "bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* BUY / RENT BADGE */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  property.listingType === "Rent"
                    ? "bg-blue-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                For {property.listingType}
              </span>
            </div>
          </div>

          {/* ====================================================
              TITLE & PRICE
          ==================================================== */}
          <div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {property.title}
            </h1>

            <div className="flex items-center gap-1 text-gray-500 mt-2">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>

            <div className="mt-3 text-3xl font-bold text-purple-600">
              {formatPrice(
                property.price,
                property.listingType
              )}

              {property.pricePerSqft && (
                <span className="text-base font-normal text-gray-500 ml-3">
                  ₹
                  {property.pricePerSqft.toLocaleString(
                    "en-IN"
                  )}
                  /sqft
                </span>
              )}
            </div>

          </div>

          {/* ====================================================
              KEY SPECIFICATIONS
          ==================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {property.bhk && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Bed className="w-5 h-5 mx-auto text-gray-500 mb-1" />

                <div className="font-semibold">
                  {property.bhk}
                </div>

                <div className="text-xs text-gray-500">
                  Bedrooms
                </div>
              </div>
            )}

            {property.bathrooms && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Bath className="w-5 h-5 mx-auto text-gray-500 mb-1" />

                <div className="font-semibold">
                  {property.bathrooms}
                </div>

                <div className="text-xs text-gray-500">
                  Bathrooms
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Maximize className="w-5 h-5 mx-auto text-gray-500 mb-1" />

              <div className="font-semibold">
                {property.area} {property.areaUnit}
              </div>

              <div className="text-xs text-gray-500">
                Area
              </div>
            </div>

            {property.parking && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Car className="w-5 h-5 mx-auto text-gray-500 mb-1" />

                <div className="font-semibold">
                  {property.parking}
                </div>

                <div className="text-xs text-gray-500">
                  Parking
                </div>
              </div>
            )}

          </div>

          {/* ====================================================
              DESCRIPTION
          ==================================================== */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Description
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* ====================================================
              PROPERTY DETAILS
          ==================================================== */}
          <div>

            <h2 className="text-lg font-semibold mb-3">
              Property Details
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm">

              <div>
                <span className="text-gray-500">
                  Type:
                </span>{" "}
                <span className="font-medium">
                  {property.propertyType}
                </span>
              </div>

              <div>
                <span className="text-gray-500">
                  Status:
                </span>{" "}
                <span className="font-medium">
                  {property.status}
                </span>
              </div>

              {property.furnishing && (
                <div>
                  <span className="text-gray-500">
                    Furnishing:
                  </span>{" "}
                  <span className="font-medium">
                    {property.furnishing}
                  </span>
                </div>
              )}

              {property.floor && (
                <div>
                  <span className="text-gray-500">
                    Floor:
                  </span>{" "}
                  <span className="font-medium">
                    {property.floor} of{" "}
                    {property.totalFloors}
                  </span>
                </div>
              )}

              {property.facing && (
                <div>
                  <span className="text-gray-500">
                    Facing:
                  </span>{" "}
                  <span className="font-medium">
                    {property.facing}
                  </span>
                </div>
              )}

              {property.age && (
                <div>
                  <span className="text-gray-500">
                    Age:
                  </span>{" "}
                  <span className="font-medium">
                    {property.age}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* ====================================================
              AMENITIES
          ==================================================== */}
          {property.amenities?.length > 0 && (
            <div>

              <h2 className="text-lg font-semibold mb-3">
                Amenities
              </h2>

              <div className="flex flex-wrap gap-2">

                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {amenity}
                  </span>
                ))}

              </div>

            </div>
          )}

        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="space-y-4">

          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24 shadow-sm">

            <h3 className="font-semibold text-lg mb-4">
              Contact Agent
            </h3>

            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}
            {submitted ? (

              <div className="text-center py-6">

                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />

                <p className="font-medium text-gray-800">
                  Interest Submitted!
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  The agent will contact you shortly.
                </p>

              </div>

            ) : showLeadForm ? (

              /* ==================================================
                 LEAD FORM
              ================================================== */
              <form
                onSubmit={handleLeadSubmit}
                className="space-y-3"
              >

                <input
                  required
                  placeholder="Your Name"
                  value={leadForm.name}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
                />

                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={leadForm.email}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
                />

                <input
                  required
                  type="tel"
                  placeholder="Phone"
                  value={leadForm.phone}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
                />

                <textarea
                  placeholder="Message (optional)"
                  rows={3}
                  value={leadForm.message}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      message: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Submit Interest
                </button>

                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>

              </form>

            ) : (

              /* ==================================================
                 CONTACT ACTIONS
              ================================================== */
              <div className="space-y-3">

                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }

                    setShowLeadForm(true);
                  }}
                  className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  I'm Interested
                </button>

                <button
                  type="button"
                  onClick={handleTourRequest}
                  className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Request Tour
                </button>

              </div>
            )}

            {/* ==================================================
                SELLER INFORMATION
            ================================================== */}
            {property.sellerName && (
              <div className="mt-5 pt-5 border-t border-gray-100">

                <p className="text-xs text-gray-500 mb-2">
                  Listed by Seller
                </p>

                <p className="font-medium">
                  {property.sellerName}
                </p>

                {agent && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">

                    {property.sellerPhone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {property.sellerPhone}
                      </p>
                    )}

                    {property.sellerEmail && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {property.sellerEmail}
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

