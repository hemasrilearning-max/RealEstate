import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Upload,
  X,
  Home,
} from "lucide-react";

import locationService from "../../services/locationService";
import propertyService from "../../services/propertyService";
import mediaService from "../../services/mediaService";
import axiosInstance from "../../utils/axiosInstance";

const EMPTY_FORM = {
  title: "",
  type: "Rent",
  propertyType: "Apartment",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  description: "",

  country: "India",
  state: "",
  city: "",
  locality: "",
  pincode: "",
  address: "",

  furnishingStatus: "FURNISHED",
  ownershipType: "FREEHOLD",
};

export default function AddProperty({
  propertyId = null,
  onCancel,
  onSaved,
}) {
  const navigate = useNavigate();

  const id = propertyId;

  const isEditMode = Boolean(
    propertyId
  );

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  /*
   * =========================================================
   * BROKER SELECTION
   * =========================================================
   */

  const [
    needsBroker,
    setNeedsBroker,
  ] = useState(false);

  const [
    brokers,
    setBrokers,
  ] = useState([]);

  const [
    selectedBrokerId,
    setSelectedBrokerId,
  ] = useState("");

  const [
    loadingBrokers,
    setLoadingBrokers,
  ] = useState(false);

  /*
   * New files selected by the user.
   */
  const [images, setImages] =
    useState([]);

  /*
   * Images already stored in backend.
   */
  const [
    existingImages,
    setExistingImages,
  ] = useState([]);

  /*
   * New image previews.
   */
  const [
    newImagePreviews,
    setNewImagePreviews,
  ] = useState([]);

  /*
   * Media IDs removed by user while editing.
   */
  const [
    removedMediaIds,
    setRemovedMediaIds,
  ] = useState([]);

  const [
    loadingProperty,
    setLoadingProperty,
  ] = useState(isEditMode);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /*
   * =========================================================
   * LOAD BROKERS
   * =========================================================
   *
   * Uses the existing GET /api/users endpoint.
   *
   * No backend changes are required.
   */

  useEffect(() => {
    let mounted = true;

    const loadBrokers = async () => {
      try {
        setLoadingBrokers(true);

        const response =
          await axiosInstance.get(
            "/api/users"
          );

        if (!mounted) {
          return;
        }

        const users =
          Array.isArray(response?.data)
            ? response.data
            : Array.isArray(
                response?.data?.content
              )
            ? response.data.content
            : [];

        const brokerUsers =
          users.filter((user) => {
            const role =
              user?.role ||
              user?.roleName ||
              user?.roleType;

            /*
             * Handles possible response formats:
             *
             * role: "BROKER"
             * role: { name: "BROKER" }
             * roleName: "BROKER"
             * roleType: "BROKER"
             */

            const normalizedRole =
              typeof role === "object"
                ? role?.name
                : role;

            return (
              String(
                normalizedRole || ""
              ).toUpperCase() ===
              "BROKER"
            );
          });

        setBrokers(
          brokerUsers
        );
      } catch (err) {
        console.error(
          "Load Brokers Error:",
          err
        );

        if (mounted) {
          setBrokers([]);
        }
      } finally {
        if (mounted) {
          setLoadingBrokers(false);
        }
      }
    };

    loadBrokers();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * LOAD PROPERTY WHEN EDITING
   * =========================================================
   */

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let mounted = true;

    const loadProperty = async () => {
      try {
        setLoadingProperty(true);
        setError("");

        const property =
          await propertyService.getPropertyById(
            id
          );

        if (!mounted) {
          return;
        }

        if (!property?.id) {
          throw new Error(
            "Property could not be found."
          );
        }

        const location =
          property.location || {};

        const backendPropertyType =
          String(
            property.propertyType || ""
          ).toUpperCase();

        let frontendPropertyType =
          "Apartment";

        if (
          backendPropertyType ===
          "VILLA"
        ) {
          frontendPropertyType =
            "Villa";
        } else if (
          backendPropertyType ===
            "OFFICE" ||
          backendPropertyType ===
            "COMMERCIAL"
        ) {
          frontendPropertyType =
            "Commercial";
        } else if (
          backendPropertyType ===
          "PLOT"
        ) {
          frontendPropertyType =
            "Plot";
        }

        const listingType =
          String(
            property.listingType || ""
          ).toUpperCase();

        setFormData({
          title:
            property.title || "",

          type:
            listingType === "SALE"
              ? "Sale"
              : "Rent",

          propertyType:
            frontendPropertyType,

          price:
            property.price ?? "",

          area:
            property.area ?? "",

          bedrooms:
            property.bedrooms ?? "",

          bathrooms:
            property.bathrooms ?? "",

          description:
            property.description || "",

          country:
            location.country ||
            "India",

          state:
            location.state || "",

          city:
            location.city || "",

          locality:
            location.area ||
            location.locality ||
            "",

          pincode:
            location.pincode || "",

          address:
            location.address ||
            property.address ||
            "",

          furnishingStatus:
            property.furnishingStatus ||
            "FURNISHED",

          ownershipType:
            property.ownershipType ||
            "FREEHOLD",
        });

        /*
         * -----------------------------------------------------
         * EXISTING BROKER
         * -----------------------------------------------------
         *
         * This only reads broker information if the existing
         * property response already contains it.
         *
         * It does not require a backend change.
         */

        const existingBroker =
          property.broker;

        const existingBrokerId =
          existingBroker?.id ||
          property.brokerId ||
          property.broker_id;

        if (
          existingBrokerId
        ) {
          setNeedsBroker(true);
          setSelectedBrokerId(
            String(
              existingBrokerId
            )
          );
        } else {
          setNeedsBroker(false);
          setSelectedBrokerId("");
        }

        /*
         * -----------------------------------------------------
         * LOAD BACKEND MEDIA
         * -----------------------------------------------------
         */

        const mediaResponse =
          await mediaService.getMediaByProperty(
            id
          );

        if (!mounted) {
          return;
        }

        const mediaList =
          Array.isArray(
            mediaResponse
          )
            ? mediaResponse
            : Array.isArray(
                mediaResponse?.content
              )
            ? mediaResponse.content
            : Array.isArray(
                mediaResponse?.data
              )
            ? mediaResponse.data
            : [];

        const backendImages =
          mediaList
            .filter((media) => {
              const mediaType =
                String(
                  media?.mediaType ||
                    ""
                ).toUpperCase();

              return (
                mediaType.includes(
                  "IMAGE"
                ) ||
                mediaType === "PHOTO"
              );
            })
            .sort((a, b) => {
              const primaryA =
                Boolean(
                  a?.primary ??
                    a?.isPrimary ??
                    a?.is_primary
                );

              const primaryB =
                Boolean(
                  b?.primary ??
                    b?.isPrimary ??
                    b?.is_primary
                );

              return (
                Number(primaryB) -
                Number(primaryA)
              );
            })
            .map((media) => ({
              id: media.id,

              fileUrl:
                media.fileUrl ||
                media.file_url ||
                "",

              url:
                mediaService.resolveMediaUrl(
                  media.fileUrl ||
                    media.file_url ||
                    ""
                ),

              primary:
                Boolean(
                  media.primary ??
                    media.isPrimary ??
                    media.is_primary
                ),
            }))
            .filter(
              (media) =>
                media.url
            );

        setExistingImages(
          backendImages
        );
      } catch (err) {
        console.error(
          "Load Property Error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load property details."
          );
        }
      } finally {
        if (mounted) {
          setLoadingProperty(false);
        }
      }
    };

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [
    id,
    isEditMode,
  ]);

  /*
   * =========================================================
   * FORM CHANGE
   * =========================================================
   */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * =========================================================
   * BROKER CHANGE
   * =========================================================
   */

  const handleBrokerOptionChange = (
    value
  ) => {
    const shouldNeedBroker =
      value === "yes";

    setNeedsBroker(
      shouldNeedBroker
    );

    if (!shouldNeedBroker) {
      setSelectedBrokerId("");
    }
  };

  /*
   * =========================================================
   * IMAGE PREVIEW
   * =========================================================
   */

  const handleImageChange = (
    e
  ) => {
    const files =
      Array.from(
        e.target.files || []
      );

    if (files.length === 0) {
      return;
    }

    const validFiles = [];

    files.forEach((file) => {
      if (
        !file.type?.startsWith(
          "image/"
        )
      ) {
        alert(
          `${file.name} is not a valid image file.`
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          `${file.name} must be less than 5MB.`
        );

        return;
      }

      validFiles.push(file);
    });

    if (
      validFiles.length === 0
    ) {
      e.target.value = "";
      return;
    }

    setImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    validFiles.forEach(
      (file) => {
        const reader =
          new FileReader();

        reader.onloadend = () => {
          setNewImagePreviews(
            (prev) => [
              ...prev,
              reader.result,
            ]
          );
        };

        reader.readAsDataURL(file);
      }
    );

    e.target.value = "";
  };

  /*
   * =========================================================
   * REMOVE IMAGE
   * =========================================================
   */

  const removeImage = (
    type,
    index
  ) => {
    if (
      type === "existing"
    ) {
      const image =
        existingImages[index];

      if (image?.id) {
        setRemovedMediaIds(
          (prev) => {
            if (
              prev.includes(
                image.id
              )
            ) {
              return prev;
            }

            return [
              ...prev,
              image.id,
            ];
          }
        );
      }

      setExistingImages(
        (prev) =>
          prev.filter(
            (_, imageIndex) =>
              imageIndex !==
              index
          )
      );

      return;
    }

    setImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setNewImagePreviews(
      (prev) =>
        prev.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );
  };

  /*
   * =========================================================
   * PROPERTY TYPE MAPPING
   * =========================================================
   */

  const getBackendPropertyType =
    () => {
      const propertyTypeMap = {
        Apartment:
          "APARTMENT",

        Villa:
          "VILLA",

        Commercial:
          "OFFICE",

        Plot:
          "PLOT",
      };

      return (
        propertyTypeMap[
          formData.propertyType
        ] ||
        "APARTMENT"
      );
    };

  /*
   * =========================================================
   * UPLOAD ALL NEW IMAGES
   * =========================================================
   */

  const uploadNewImages = async (
    propertyId
  ) => {
    if (
      !propertyId ||
      images.length === 0
    ) {
      return [];
    }

    const uploadedMedia = [];

    for (
      let index = 0;
      index < images.length;
      index += 1
    ) {
      const file = images[index];

      const primary =
        !isEditMode &&
        index === 0;

      const response =
        await mediaService.uploadMedia(
          propertyId,
          file,
          "IMAGE",
          primary
        );

      uploadedMedia.push(
        response
      );
    }

    return uploadedMedia;
  };

  /*
   * =========================================================
   * DELETE REMOVED BACKEND IMAGES
   * =========================================================
   */

  const deleteRemovedImages =
    async () => {
      if (
        removedMediaIds.length ===
        0
      ) {
        return;
      }

      for (
        const mediaId of removedMediaIds
      ) {
        try {
          await mediaService.deleteMedia(
            mediaId
          );
        } catch (deleteError) {
          console.error(
            `Unable to delete media ${mediaId}:`,
            deleteError
          );
        }
      }
    };

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSubmitting(true);

      try {
        /*
         * -----------------------------------------------------
         * STEP 1: CREATE LOCATION
         * -----------------------------------------------------
         */

        const locationPayload = {
          country:
            formData.country.trim(),

          state:
            formData.state.trim(),

          city:
            formData.city.trim(),

          area:
            formData.locality.trim(),

          pincode:
            formData.pincode.trim(),

          address:
            formData.address.trim(),
        };

        const locationResponse =
          await locationService.createLocation(
            locationPayload
          );

        if (
          !locationResponse?.id
        ) {
          throw new Error(
            "Location was created but no location ID was returned."
          );
        }

        /*
         * -----------------------------------------------------
         * STEP 2: PROPERTY PAYLOAD
         * -----------------------------------------------------
         *
         * Broker is intentionally NOT sent here because
         * backend changes were not requested.
         *
         * The selected broker remains available in
         * selectedBrokerId for the UI.
         */

const propertyPayload = {
  title: formData.title.trim(),
  description: formData.description.trim() || null,
  price: Number(formData.price),
  bedrooms: Number(formData.bedrooms),
  bathrooms: Number(formData.bathrooms),
  area: Number(formData.area),
  propertyType: getBackendPropertyType(),
  listingType: formData.type === "Rent" ? "RENT" : "SALE",
  furnishingStatus: formData.furnishingStatus || null,
  ownershipType: formData.ownershipType || null,
  locationId: locationResponse.id,

  // Send broker only when owner selected Yes
  brokerId:
    needsBroker && selectedBrokerId
      ? Number(selectedBrokerId)
      : null,
};

        console.log(
          isEditMode
            ? "Updating property:"
            : "Creating property:",
          propertyPayload
        );

        console.log(
          "Selected broker:",
          needsBroker
            ? selectedBrokerId
            : "No broker"
        );

        /*
         * -----------------------------------------------------
         * STEP 3: CREATE OR UPDATE PROPERTY
         * -----------------------------------------------------
         */

        let propertyResponse;

        if (isEditMode) {
          propertyResponse =
            await propertyService.updateProperty(
              id,
              propertyPayload
            );
        } else {
          propertyResponse =
            await propertyService.createProperty(
              propertyPayload
            );
        }

        console.log(
          isEditMode
            ? "Property updated successfully:"
            : "Property created successfully:",
          propertyResponse
        );

        /*
         * -----------------------------------------------------
         * STEP 4: PROPERTY ID
         * -----------------------------------------------------
         */

        const propertyId =
          isEditMode
            ? id
            : propertyResponse?.id;

        if (!propertyId) {
          throw new Error(
            "Property was saved but no property ID was returned."
          );
        }

        /*
         * -----------------------------------------------------
         * STEP 5: UPLOAD ALL NEW IMAGES
         * -----------------------------------------------------
         */

        let uploadedImages = [];

        if (
          images.length > 0
        ) {
          uploadedImages =
            await uploadNewImages(
              propertyId
            );

          console.log(
            "Uploaded property images:",
            uploadedImages
          );
        }

        /*
         * -----------------------------------------------------
         * STEP 6: DELETE REMOVED EXISTING IMAGES
         * -----------------------------------------------------
         */

        if (
          isEditMode &&
          removedMediaIds.length > 0
        ) {
          await deleteRemovedImages();
        }

        /*
         * -----------------------------------------------------
         * STEP 7: SUCCESS
         * -----------------------------------------------------
         */

        alert(
          isEditMode
            ? "Property updated successfully!"
            : "Property added successfully to your portfolio catalogue!"
        );

        if (
          isEditMode &&
          onSaved
        ) {
          await onSaved();
        } else {
          navigate(
            "/owner/properties"
          );
        }
      } catch (err) {
        console.error(
          isEditMode
            ? "Edit Property Error:"
            : "Add Property Error:",
          err
        );

        setError(
          err.message ||
            (isEditMode
              ? "Unable to update property. Please try again."
              : "Unable to publish property. Please try again.")
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
   * =========================================================
   * LOADING EDIT PROPERTY
   * =========================================================
   */

  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-start font-sans">

        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          <div className="w-8 h-8 mx-auto border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading property details...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Fetching your registered property.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-start font-sans">

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

        {/* Header */}

        <div className="border-b border-gray-100 pb-5 mb-6">

          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">

            <Home className="w-6 h-6 text-rose-600" />

            {isEditMode
              ? "Edit Property"
              : "Add New Property"}

          </h1>

          <p className="text-gray-500 text-sm mt-1">

            {isEditMode
              ? "Update the details of your registered property."
              : "Fill out the details below to list your property on the dashboard ecosystem."}

          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFO */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Title / Name
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g., Luxury 4 BHK Villa with Private Pool"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors text-sm font-medium"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Listing Intent
              </label>

              <div className="flex gap-4">

                {[
                  "Rent",
                  "Sale",
                ].map(
                  (intent) => (

                    <button
                      key={intent}
                      type="button"
                      onClick={() =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            type: intent,
                          })
                        )
                      }
                      className={`flex-1 py-2.5 rounded-lg font-bold border text-sm transition-all ${
                        formData.type ===
                        intent
                          ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      For {intent}
                    </button>

                  )
                )}

              </div>

            </div>

          </div>

          {/* PROPERTY TYPE / PRICE / AREA */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Type
              </label>

              <select
                name="propertyType"
                value={
                  formData.propertyType
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 bg-white transition-colors text-sm font-medium"
              >

                <option value="Apartment">
                  Apartment
                </option>

                <option value="Villa">
                  Villa / House
                </option>

                <option value="Commercial">
                  Commercial Space
                </option>

                <option value="Plot">
                  Plot / Land
                </option>

              </select>

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (in ₹ Numeric Value)
              </label>

              <input
                type="number"
                name="price"
                placeholder="e.g., 35000000"
                min="1"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Carpet Area (sq ft)
              </label>

              <input
                type="number"
                name="area"
                placeholder="e.g., 2800"
                min="1"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />

            </div>

          </div>

          {/* BEDROOMS / BATHROOMS / FURNISHING */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bedrooms (BHK Count)
              </label>

              <input
                type="number"
                name="bedrooms"
                placeholder="e.g., 4"
                min="0"
                value={
                  formData.bedrooms
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bathrooms
              </label>

              <input
                type="number"
                name="bathrooms"
                placeholder="e.g., 3"
                min="0"
                value={
                  formData.bathrooms
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Furnishing Status
              </label>

              <select
                name="furnishingStatus"
                value={
                  formData.furnishingStatus
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 bg-white transition-colors text-sm font-medium"
              >

                <option value="FURNISHED">
                  Furnished
                </option>

                <option value="SEMI_FURNISHED">
                  Semi Furnished
                </option>

                <option value="UNFURNISHED">
                  Unfurnished
                </option>

              </select>

            </div>

          </div>

          {/* OWNERSHIP */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ownership Type
              </label>

              <select
                name="ownershipType"
                value={
                  formData.ownershipType
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 bg-white transition-colors text-sm font-medium"
              >

                <option value="FREEHOLD">
                  Freehold
                </option>

                <option value="LEASEHOLD">
                  Leasehold
                </option>

                <option value="POWER_OF_ATTORNEY">
                  Power of Attorney
                </option>

              </select>

            </div>

          </div>

          {/* =====================================================
              BROKER
          ===================================================== */}

          <div className="border-t border-gray-100 pt-6">

            <div className="mb-5">

              <h2 className="text-base font-bold text-gray-800">
                Broker Assistance
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Choose whether you need a broker to manage this property.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Need a broker?
                </label>

                <div className="flex gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      handleBrokerOptionChange(
                        "yes"
                      )
                    }
                    className={`flex-1 py-2.5 rounded-lg font-bold border text-sm transition-all ${
                      needsBroker
                        ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleBrokerOptionChange(
                        "no"
                      )
                    }
                    className={`flex-1 py-2.5 rounded-lg font-bold border text-sm transition-all ${
                      !needsBroker
                        ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    No
                  </button>

                </div>

              </div>

              {needsBroker && (
                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Broker
                  </label>

                  <select
                    value={
                      selectedBrokerId
                    }
                    onChange={(e) =>
                      setSelectedBrokerId(
                        e.target.value
                      )
                    }
                    disabled={
                      loadingBrokers
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 bg-white transition-colors text-sm font-medium disabled:bg-gray-50 disabled:text-gray-400"
                  >

                    <option value="">
                      {loadingBrokers
                        ? "Loading brokers..."
                        : brokers.length ===
                          0
                        ? "No brokers available"
                        : "Select a broker"}
                    </option>

                    {brokers.map(
                      (broker) => {
                        const brokerId =
                          broker.id ||
                          broker.userId;

                        const firstName =
                          broker.firstName ||
                          "";

                        const lastName =
                          broker.lastName ||
                          "";

                        const fullName =
                          `${firstName} ${lastName}`.trim();

                        const displayName =
                          fullName ||
                          broker.username ||
                          broker.email ||
                          `Broker ${brokerId}`;

                        return (
                          <option
                            key={
                              brokerId
                            }
                            value={
                              brokerId
                            }
                          >
                            {displayName}
                            {broker.email
                              ? ` - ${broker.email}`
                              : ""}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>
              )}

            </div>

            {needsBroker &&
              brokers.length ===
                0 &&
              !loadingBrokers && (
                <p className="mt-2 text-xs text-amber-600">
                  No broker accounts are currently available.
                </p>
              )}

            {needsBroker &&
              selectedBrokerId && (
                <p className="mt-2 text-xs text-gray-400">
                  Selected broker ID:{" "}
                  {selectedBrokerId}
                </p>
              )}

          </div>

          {/* LOCATION */}

          <div className="border-t border-gray-100 pt-6">

            <div className="mb-5">

              <h2 className="text-base font-bold text-gray-800">
                Property Location
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Enter the location details used to register this property.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  placeholder="e.g., India"
                  value={
                    formData.country
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                  required
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  placeholder="e.g., Karnataka"
                  value={
                    formData.state
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                  required
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="e.g., Bangalore"
                  value={
                    formData.city
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                  required
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area / Locality
                </label>

                <input
                  type="text"
                  name="locality"
                  placeholder="e.g., Whitefield"
                  value={
                    formData.locality
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  placeholder="e.g., 560066"
                  value={
                    formData.pincode
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                />

              </div>

              <div className="md:col-span-3">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complete Location / Address
                </label>

                <input
                  type="text"
                  name="address"
                  placeholder="e.g., Sarjapur Road, Whitefield, Bangalore, Karnataka"
                  value={
                    formData.address
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                  required
                />

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              maxLength="2000"
              placeholder="Provide a brief summary outlining amenities, vicinity markers, and key details..."
              value={
                formData.description
              }
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
            />

          </div>

          {/* IMAGE UPLOAD */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Media Upload (Property Photos)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">

              {existingImages.map(
                (image, index) => (

                  <div
                    key={`existing-${image.id}`}
                    className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group shadow-sm bg-gray-50"
                  >

                    <img
                      src={image.url}
                      alt="Property"
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          "existing",
                          index
                        )
                      }
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                  </div>
                )
              )}

              {newImagePreviews.map(
                (imgUrl, index) => (

                  <div
                    key={`new-${index}`}
                    className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group shadow-sm bg-gray-50"
                  >

                    <img
                      src={imgUrl}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          "new",
                          index
                        )
                      }
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                  </div>
                )
              )}

              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all gap-1 text-center p-2">

                <Upload className="w-5 h-5 text-gray-400" />

                <span className="text-xs font-bold text-rose-600">
                  Upload Photo
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>

            </div>

            <p className="text-[10px] text-gray-400 font-medium">
              PNG, JPG or WebP images · Max 5MB per file
            </p>

            <p className="text-[10px] text-gray-400 mt-1">
              Property photos are securely stored with the property.
            </p>

          </div>

          {/* ACTIONS */}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() => {
                if (
                  isEditMode &&
                  onCancel
                ) {
                  onCancel();
                  return;
                }

                navigate(
                  "/owner/properties"
                );
              }}
              disabled={submitting}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingProperty
              }
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Publishing..."
                : isEditMode
                ? "Update Property"
                : "Publish Listing"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
