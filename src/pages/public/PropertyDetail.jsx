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
  X,
  Star,
  MessageSquare,
} from "lucide-react";

import { useData } from "../../context/DataContext";
import { formatPrice } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import reviewService from "../../services/reviewService";
import messagingService from "../../services/messagingService";
import leadService from "../../services/leadService";
import mediaService from "../../services/mediaService";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    properties,
    addTourRequest,
    addViewedProperty,
    isFavorite,
    toggleFavorite,
  } = useData();

  const { agent, user, isAuthenticated } = useAuth();

  const property = properties.find(
    (p) => String(p.id) === String(id)
  );

  /*
   * ============================================================
   * IMAGE STATE
   * ============================================================
   */
  const [propertyImages, setPropertyImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
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
   * LEADS
   * ============================================================
   */
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");

  /*
   * ============================================================
   * MESSAGE OWNER
   * ============================================================
   */
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");
  const [messageError, setMessageError] = useState("");

  /*
   * ============================================================
   * REVIEWS
   * ============================================================
   */
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  /*
   * ============================================================
   * LOAD PROPERTY IMAGES FROM BACKEND
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadPropertyImages = async () => {
      if (!property?.id) {
        setPropertyImages([]);
        setImagesLoading(false);
        return;
      }

      try {
        setImagesLoading(true);

        /*
         * Get all media records belonging to this property.
         */
        const response =
          await mediaService.getMediaByProperty(property.id);

        if (cancelled) {
          return;
        }

        let mediaList = [];

        if (Array.isArray(response)) {
          mediaList = response;
        } else if (Array.isArray(response?.content)) {
          mediaList = response.content;
        } else if (Array.isArray(response?.data)) {
          mediaList = response.data;
        } else if (Array.isArray(response?.media)) {
          mediaList = response.media;
        }

        /*
         * Keep only images.
         */
        const imageMedia = mediaList.filter((media) => {
          const mediaType = String(
            media?.mediaType ||
              media?.media_type ||
              ""
          ).toUpperCase();

          return (
            !mediaType ||
            mediaType === "IMAGE" ||
            mediaType === "PHOTO"
          );
        });

        /*
         * Primary image first.
         */
        imageMedia.sort((a, b) => {
          const primaryA = Boolean(
            a?.primary ??
              a?.isPrimary ??
              a?.is_primary
          );

          const primaryB = Boolean(
            b?.primary ??
              b?.isPrimary ??
              b?.is_primary
          );

          return Number(primaryB) - Number(primaryA);
        });

        /*
         * Convert backend file URLs into browser URLs.
         */
        const urls = imageMedia
          .map((media) => {
            const fileUrl =
              media?.fileUrl ||
              media?.file_url ||
              "";

            return mediaService.resolveMediaUrl(
              fileUrl
            );
          })
          .filter(Boolean);

        /*
         * Fallback to old property.images if backend
         * does not have media.
         */
        if (urls.length === 0) {
          const fallbackImages =
            Array.isArray(property.images)
              ? property.images
              : [];

          setPropertyImages(fallbackImages);
        } else {
          setPropertyImages(urls);
        }

        setImgIdx(0);
      } catch (error) {
        console.error(
          "Failed to load property images:",
          error
        );

        /*
         * Fallback to existing property.images.
         */
        const fallbackImages =
          Array.isArray(property.images)
            ? property.images
            : [];

        setPropertyImages(fallbackImages);
        setImgIdx(0);
      } finally {
        if (!cancelled) {
          setImagesLoading(false);
        }
      }
    };

    loadPropertyImages();

    return () => {
      cancelled = true;
    };
  }, [property?.id]);

  /*
   * ============================================================
   * RECORD VIEWED PROPERTY
   * ============================================================
   */
  useEffect(() => {
    if (!property || !isAuthenticated) {
      return;
    }

    addViewedProperty(property.id);
  }, [property?.id, isAuthenticated]);

  /*
   * ============================================================
   * LOAD USER INFORMATION INTO FORM
   * ============================================================
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    setLeadForm((prev) => ({
      ...prev,
      name: user.name || prev.name || "",
      email: user.email || prev.email || "",
      phone: user.phone || prev.phone || "",
    }));
  }, [user]);

  /*
   * ============================================================
   * LOAD PROPERTY REVIEWS
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      if (!property?.id) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response =
          await reviewService.getReviewsByProperty(
            property.id
          );

        if (cancelled) {
          return;
        }

        setReviews(
          Array.isArray(response)
            ? response
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load property reviews:",
          error
        );

        if (!cancelled) {
          setReviewsError(
            error.message ||
              "Failed to load reviews."
          );
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [property?.id]);

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

  /*
   * ============================================================
   * USE BACKEND IMAGES
   * ============================================================
   */
  const images =
    propertyImages.length > 0
      ? propertyImages
      : Array.isArray(property.images)
      ? property.images
      : [];

  /*
   * ============================================================
   * FIND SELLER ID
   * ============================================================
   */
  const sellerId =
    property.sellerId ||
    property.ownerId ||
    property.seller?.id ||
    property.seller?.userId ||
    property.owner?.id ||
    property.owner?.userId ||
    null;

  /*
   * ============================================================
   * IMAGE CONTROLS
   * ============================================================
   */
  const nextImg = () => {
    if (images.length === 0) {
      return;
    }

    setImgIdx(
      (current) =>
        (current + 1) % images.length
    );
  };

  const prevImg = () => {
    if (images.length === 0) {
      return;
    }

    setImgIdx(
      (current) =>
        (current - 1 + images.length) %
        images.length
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
   * MESSAGE OWNER
   * ============================================================
   */
  const handleMessageOwner = async () => {
    setMessageSuccess("");
    setMessageError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!sellerId) {
      setMessageError(
        "Owner information is not available for this property."
      );
      return;
    }

    if (
      user?.id &&
      String(user.id) === String(sellerId)
    ) {
      setMessageError(
        "You cannot send a message request to yourself."
      );
      return;
    }

    try {
      setMessageLoading(true);

      const conversation =
        await messagingService.createConversation(
          sellerId,
          property.id
        );

      if (conversation?.id) {
        setMessageSuccess(
          "Message request sent to the property owner."
        );
      } else {
        setMessageSuccess(
          "Message request sent successfully."
        );
      }
    } catch (error) {
      console.error(
        "Failed to send message request:",
        error
      );

      setMessageError(
        error.message ||
          "Failed to send message request."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  /*
   * ============================================================
   * OPEN INTEREST FORM
   * ============================================================
   */
  const handleInterested = () => {
    setLeadError("");
    setSubmitted(false);

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "buyer") {
      setLeadError(
        "Only buyers can submit property enquiries."
      );
      return;
    }

    setLeadForm((prev) => ({
      ...prev,
      name: user?.name || prev.name || "",
      email: user?.email || prev.email || "",
      phone: user?.phone || prev.phone || "",
    }));

    setShowLeadForm(true);
  };

  /*
   * ============================================================
   * LEAD SUBMISSION
   * ============================================================
   */
  const handleLeadSubmit = async (e) => {
    e.preventDefault();

    setLeadError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "buyer") {
      setLeadError(
        "Only buyers can submit property enquiries."
      );
      return;
    }

    const name = leadForm.name.trim();
    const email = leadForm.email.trim();
    const phone = leadForm.phone.trim();
    const message = leadForm.message.trim();

    if (!name) {
      setLeadError("Please enter your name.");
      return;
    }

    if (!email) {
      setLeadError("Please enter your email.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setLeadError(
        "Please enter a valid email address."
      );
      return;
    }

    const normalizedPhone = phone.replace(
      /\D/g,
      ""
    );

    const finalPhone =
      normalizedPhone.length > 10
        ? normalizedPhone.slice(-10)
        : normalizedPhone;

    if (!/^[0-9]{10}$/.test(finalPhone)) {
      setLeadError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    try {
      setLeadSubmitting(true);

      const createdLead =
        await leadService.createLead({
          propertyId: property.id,
          name,
          email,
          phone: finalPhone,
          message,
        });

      console.log(
        "Lead created successfully:",
        createdLead
      );

      setSubmitted(true);
      setShowLeadForm(false);

      setLeadForm((prev) => ({
        ...prev,
        phone: finalPhone,
        message: "",
      }));
    } catch (error) {
      console.error(
        "Failed to submit property enquiry:",
        error
      );

      setLeadError(
        error.message ||
          "Failed to submit your enquiry. Please try again."
      );
    } finally {
      setLeadSubmitting(false);
    }
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

  /*
   * ============================================================
   * REVIEW SUBMISSION
   * ============================================================
   */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    setReviewSuccess("");
    setReviewsError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!reviewRating) {
      setReviewsError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    if (!reviewComment.trim()) {
      setReviewsError(
        "Please enter your review."
      );
      return;
    }

    try {
      setReviewSubmitting(true);

      const createdReview =
        await reviewService.createReview({
          propertyId: property.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });

      if (createdReview) {
        setReviews((prev) => [
          createdReview,
          ...prev,
        ]);
      }

      setReviewRating(0);
      setReviewComment("");

      setReviewSuccess(
        "Your review was submitted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setReviewsError(
        error.message ||
          "Failed to submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  /*
   * ============================================================
   * REVIEW DATE
   * ============================================================
   */
  const formatReviewDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * ============================================================
   * REVIEW AVERAGE
   * ============================================================
   */
  const averageReviewRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

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
          <div>

            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">

              {imagesLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-sm text-gray-500">
                    Loading images...
                  </div>
                </div>
              ) : (
                <img
                  src={
                    images[imgIdx] ||
                    "https://via.placeholder.com/800x500"
                  }
                  alt={`${property.title} ${
                    imgIdx + 1
                  }`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x500";
                  }}
                />
              )}

              {/* FAVORITE */}
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
                        onClick={() =>
                          setImgIdx(i)
                        }
                        aria-label={`View image ${
                          i + 1
                        }`}
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
              <div className="absolute top-3 left-3">
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

            {/* ==================================================
                IMAGE THUMBNAILS
            ================================================== */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() =>
                      setImgIdx(index)
                    }
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      index === imgIdx
                        ? "border-purple-600"
                        : "border-transparent"
                    }`}
                    aria-label={`Select image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${
                        index + 1
                      }`}
                      className="w-20 h-14 sm:w-24 sm:h-16 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/100x70";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ====================================================
              TITLE & PRICE
          ==================================================== */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {property.title}
            </h1>

            <div className="flex items-center gap-1 text-gray-500 mt-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{property.location}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-purple-600">
                {formatPrice(
                  property.price,
                  property.listingType
                )}
              </span>

              {property.pricePerSqft && (
                <span className="text-base font-normal text-gray-500">
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

          {/* ====================================================
              REVIEWS
          ==================================================== */}
          <div className="border-t border-gray-200 pt-6">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Reviews
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  See what users have shared about this property.
                </p>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />

                  <span className="font-semibold text-gray-900">
                    {averageReviewRating}
                  </span>

                  <span className="text-sm text-gray-500">
                    ({reviews.length}{" "}
                    {reviews.length === 1
                      ? "review"
                      : "reviews"})
                  </span>
                </div>
              )}
            </div>

            {reviewsError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
                {reviewsError}
              </div>
            )}

            {reviewSuccess && (
              <div className="mb-4 bg-green-50 border border-green-100 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {reviewSuccess}
              </div>
            )}

            {isAuthenticated ? (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-6"
              >
                <h3 className="font-semibold text-gray-900">
                  Write a Review
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Share your experience with this property.
                </p>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </p>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: 5 },
                      (_, index) => {
                        const ratingValue =
                          index + 1;

                        return (
                          <button
                            key={ratingValue}
                            type="button"
                            onClick={() =>
                              setReviewRating(
                                ratingValue
                              )
                            }
                            aria-label={`${ratingValue} star${
                              ratingValue > 1
                                ? "s"
                                : ""
                            }`}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-6 h-6 transition ${
                                ratingValue <=
                                reviewRating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        );
                      }
                    )}

                    {reviewRating > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        {reviewRating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="review-comment"
                    className="text-sm font-medium text-gray-700 block mb-2"
                  >
                    Your Review
                  </label>

                  <textarea
                    id="review-comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) =>
                      setReviewComment(
                        e.target.value
                      )
                    }
                    placeholder="Write your experience about this property..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="mt-4 inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Star className="w-4 h-4" />

                  {reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                <p className="text-sm text-gray-600">
                  Please log in to write a review for this property.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Login to Review
                </button>
              </div>
            )}

            {reviewsLoading ? (
              <div className="text-center py-8">
                <Star className="w-7 h-7 text-gray-300 mx-auto mb-2" />

                <p className="text-sm text-gray-500">
                  Loading reviews...
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 border border-gray-100 rounded-xl">
                <MessageSquare className="w-7 h-7 text-gray-300 mx-auto mb-2" />

                <p className="font-medium text-gray-700">
                  No reviews yet
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Be the first person to review this property.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.userName ||
                            "HomeSpace User"}
                        </p>

                        <div className="flex items-center gap-1 mt-1">
                          {Array.from(
                            { length: 5 },
                            (_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index <
                                  Number(
                                    review.rating || 0
                                  )
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            )
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-gray-400">
                        {formatReviewDate(
                          review.createdAt
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mt-4">
                      {review.comment ||
                        "No comment provided."}
                    </p>

                    {review.status && (
                      <div className="mt-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            String(
                              review.status
                            ).toUpperCase() ===
                            "APPROVED"
                              ? "bg-green-50 text-green-700"
                              : String(
                                  review.status
                                ).toUpperCase() ===
                                "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {String(
                            review.status
                          ).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="space-y-4">

          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24 shadow-sm">

            <h3 className="font-semibold text-lg mb-4">
              Contact Agent/Seller
            </h3>

            {messageSuccess && (
              <div className="mb-4 bg-green-50 border border-green-100 text-green-700 rounded-lg px-3 py-3 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />

                <div>
                  <p className="font-medium">
                    Request Sent
                  </p>

                  <p className="text-xs mt-0.5">
                    {messageSuccess}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/messages")
                    }
                    className="mt-2 text-xs font-semibold text-green-700 hover:text-green-800 underline"
                  >
                    View Messages
                  </button>
                </div>
              </div>
            )}

            {messageError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-3 text-sm">
                {messageError}
              </div>
            )}

            {leadError && !showLeadForm && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-3 text-sm">
                {leadError}
              </div>
            )}

            {submitted ? (
              <div className="text-center py-6">

                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />

                <p className="font-medium text-gray-800">
                  Interest Submitted!
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  The agent will contact you shortly.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setLeadError("");

                    setLeadForm({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      message: "",
                    });
                  }}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Submit another enquiry
                </button>

              </div>
            ) : showLeadForm ? (

              <form
                onSubmit={handleLeadSubmit}
                className="space-y-3"
              >

                {leadError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2.5 text-sm">
                    {leadError}
                  </div>
                )}

                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      I'm Interested
                    </h4>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Share your details with the seller.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowLeadForm(false);
                      setLeadError("");
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                    aria-label="Close interest form"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leadSubmitting
                    ? "Submitting..."
                    : "Submit Interest"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLeadForm(false);
                    setLeadError("");
                  }}
                  disabled={leadSubmitting}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 disabled:opacity-50"
                >
                  Cancel
                </button>

              </form>

            ) : (

              <div className="space-y-3">

                <button
                  type="button"
                  onClick={handleInterested}
                  className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  I'm Interested
                </button>

                <button
                  type="button"
                  onClick={handleMessageOwner}
                  disabled={messageLoading}
                  className="w-full border border-purple-600 text-purple-600 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-4 h-4" />

                  {messageLoading
                    ? "Sending Request..."
                    : "Message Request"}
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