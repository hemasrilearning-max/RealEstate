import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { useAuth } from "./AuthContext";

import propertyService from "../services/propertyService";
import mediaService from "../services/mediaService";

import {
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_MESSAGES,
  INITIAL_TOUR_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVIEWS,
  INITIAL_CLIENTS,
} from "../data/mockData";

const DataContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Ignore localStorage errors
  }
}

/*
 * ============================================================
 * PROPERTY IMAGE HELPERS
 * ============================================================
 *
 * Local/browser images are still supported as fallback.
 *
 * Backend images are loaded separately from:
 *
 * GET /api/media/property/{propertyId}
 */

function readPropertyImages() {
  return load("re_property_images", {});
}

function savePropertyImages(images) {
  save("re_property_images", images);
}

/*
 * Convert an uploaded File into a browser-storable Data URL.
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(
        new Error("No image selected.")
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read the selected image."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

export function DataProvider({ children }) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  /*
   * ============================================================
   * SHARED DATA
   * ============================================================
   */

  const [properties, setProperties] =
    useState(() =>
      load(
        "re_properties",
        INITIAL_PROPERTIES
      )
    );

  const [leads, setLeads] = useState(() =>
    load("re_leads", INITIAL_LEADS)
  );

  const [messages, setMessages] =
    useState(() =>
      load(
        "re_messages",
        INITIAL_MESSAGES
      )
    );

  const [tourRequests, setTourRequests] =
    useState(() =>
      load(
        "re_tours",
        INITIAL_TOUR_REQUESTS
      )
    );

  const [transactions, setTransactions] =
    useState(() =>
      load(
        "re_transactions",
        INITIAL_TRANSACTIONS
      )
    );

  const [reviews, setReviews] =
    useState(() =>
      load(
        "re_reviews",
        INITIAL_REVIEWS
      )
    );

  const [clients, setClients] =
    useState(() =>
      load(
        "re_clients",
        INITIAL_CLIENTS
      )
    );

  /*
   * ============================================================
   * LOCAL PROPERTY IMAGES
   * ============================================================
   */

  const [propertyImages, setPropertyImages] =
    useState(() =>
      readPropertyImages()
    );

  /*
   * ============================================================
   * BACKEND PROPERTY IMAGES
   * ============================================================
   *
   * Example:
   *
   * {
   *   "28": [
   *     "http://localhost:8080/uploads/house1.jpg",
   *     "http://localhost:8080/uploads/house2.jpg"
   *   ]
   * }
   */

  const [
    backendPropertyImages,
    setBackendPropertyImages,
  ] = useState({});

  /*
   * Save local property images whenever
   * they change.
   */
  useEffect(() => {
    savePropertyImages(
      propertyImages
    );
  }, [propertyImages]);

  /*
   * ============================================================
   * LOAD PROPERTIES FROM BACKEND
   * ============================================================
   *
   * Properties are loaded first.
   *
   * Then media belonging to every property
   * is loaded from the backend.
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadBackendProperties =
      async () => {
        try {
          /*
           * ----------------------------------------------------
           * GET PROPERTIES
           * ----------------------------------------------------
           */

          const response =
            await propertyService.getAllProperties();

          const backendProperties =
            Array.isArray(response)
              ? response
              : response?.content ||
                response?.data ||
                response?.properties ||
                [];

          if (
            !Array.isArray(
              backendProperties
            )
          ) {
            console.warn(
              "Unexpected properties response:",
              response
            );

            return;
          }

          /*
           * ----------------------------------------------------
           * NORMALIZE PROPERTIES
           * ----------------------------------------------------
           */

          const normalizedProperties =
            backendProperties.map(
              (property) => {
                const location =
                  property.location || {};

                const listingType =
                  String(
                    property.listingType ||
                      ""
                  ).toUpperCase() ===
                  "SALE"
                    ? "Sale"
                    : String(
                        property.listingType ||
                          ""
                      ).toUpperCase() ===
                      "RENT"
                    ? "Rent"
                    : property.listingType ||
                      "";

                const propertyType =
                  String(
                    property.propertyType ||
                      ""
                  ).toUpperCase();

                let frontendPropertyType =
                  property.propertyType ||
                  "";

                if (
                  propertyType ===
                  "APARTMENT"
                ) {
                  frontendPropertyType =
                    "Apartment";
                } else if (
                  propertyType === "VILLA"
                ) {
                  frontendPropertyType =
                    "Villa";
                } else if (
                  propertyType === "PLOT"
                ) {
                  frontendPropertyType =
                    "Plot";
                } else if (
                  propertyType ===
                    "OFFICE" ||
                  propertyType ===
                    "COMMERCIAL"
                ) {
                  frontendPropertyType =
                    "Commercial";
                }

                const locationText = [
                  location.locality,
                  location.area,
                  location.city,
                  location.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                const bedrooms =
                  property.bedrooms ??
                  property.bhk ??
                  null;

                const bathrooms =
                  property.bathrooms ??
                  null;

                const area =
                  property.area ??
                  null;

                /*
                 * Some backend responses may already
                 * contain images.
                 */
                const images =
                  Array.isArray(
                    property.images
                  )
                    ? property.images
                    : [];

                return {
                  ...property,

                  id: property.id,

                  title:
                    property.title ||
                    "Untitled Property",

                  description:
                    property.description ||
                    "",

                  price:
                    property.price ?? 0,

                  bedrooms,

                  bathrooms,

                  bhk:
                    property.bhk ||
                    (bedrooms
                      ? `${bedrooms} BHK`
                      : ""),

                  area,

                  areaUnit:
                    property.areaUnit ||
                    "sq.ft",

                  propertyType:
                    frontendPropertyType,

                  listingType,

                  status:
                    property.status ||
                    "AVAILABLE",

                  furnishing:
                    property.furnishing ||
                    property.furnishingStatus ||
                    "",

                  furnishingStatus:
                    property.furnishingStatus ||
                    property.furnishing ||
                    "",

                  location:
                    locationText ||
                    property.locationName ||
                    property.address ||
                    "",

                  locality:
                    location.locality ||
                    location.area ||
                    "",

                  city:
                    location.city ||
                    property.city ||
                    "",

                  state:
                    location.state ||
                    property.state ||
                    "",

                  pincode:
                    location.pincode ||
                    "",

                  address:
                    location.address ||
                    property.address ||
                    "",

                  images,

                  isFeatured:
                    Boolean(
                      property.isFeatured
                    ),

                  views:
                    property.views || 0,

                  leads:
                    property.leads || 0,

                  sellerId:
                    property.sellerId ||
                    property.ownerId ||
                    property.seller?.id ||
                    property.owner?.id ||
                    null,

                  sellerName:
                    property.sellerName ||
                    property.ownerName ||
                    property.seller?.name ||
                    property.owner?.name ||
                    "",

                  agentId:
                    property.agentId ||
                    property.agent?.id ||
                    null,
                };
              }
            );

          /*
           * ----------------------------------------------------
           * LOAD MEDIA FOR ALL PROPERTIES
           * ----------------------------------------------------
           */

          const imageMap = {};

          const propertiesWithMedia =
            await Promise.all(
              normalizedProperties.map(
                async (property) => {
                  try {
                    const backendImages =
                      await mediaService.getPropertyImages(
                        property.id
                      );

                    /*
                     * Backend media exists.
                     */
                    if (
                      backendImages.length >
                      0
                    ) {
                      imageMap[
                        String(
                          property.id
                        )
                      ] =
                        backendImages;

                      return {
                        ...property,
                        images:
                          backendImages,
                      };
                    }

                    /*
                     * If backend has no media,
                     * use existing local images.
                     */
                    const localImages =
                      Array.isArray(
                        propertyImages[
                          String(
                            property.id
                          )
                        ]
                      )
                        ? propertyImages[
                            String(
                              property.id
                            )
                          ]
                        : [];

                    if (
                      localImages.length >
                      0
                    ) {
                      return {
                        ...property,
                        images:
                          localImages,
                      };
                    }

                    /*
                     * No images anywhere.
                     */
                    return property;
                  } catch (mediaError) {
                    /*
                     * A media API failure should
                     * never prevent properties from
                     * loading.
                     */

                    console.warn(
                      `Unable to load media for property ${property.id}:`,
                      mediaError
                    );

                    const localImages =
                      Array.isArray(
                        propertyImages[
                          String(
                            property.id
                          )
                        ]
                      )
                        ? propertyImages[
                            String(
                              property.id
                            )
                          ]
                        : [];

                    return {
                      ...property,

                      images:
                        localImages.length >
                        0
                          ? localImages
                          : property.images ||
                            [],
                    };
                  }
                }
              )
            );

          /*
           * Store backend image map.
           */
          setBackendPropertyImages(
            imageMap
          );

          /*
           * Backend is the source of truth
           * for properties + media.
           */
          setProperties(
            propertiesWithMedia
          );

          /*
           * Keep latest properties available
           * after refresh.
           */
          save(
            "re_properties",
            propertiesWithMedia
          );
        } catch (error) {
          console.error(
            "Unable to load properties from backend:",
            error
          );

          /*
           * Existing local/mock properties
           * remain available if backend is
           * unavailable.
           */
        }
      };

    loadBackendProperties();
  }, [authLoading]);

  /*
   * ============================================================
   * PROPERTY IMAGE FUNCTIONS
   * ============================================================
   */

  /*
   * Get all images belonging to a property.
   *
   * Priority:
   *
   * 1. Backend media
   * 2. Local browser images
   */

  const getPropertyImages = (
    propertyId
  ) => {
    if (!propertyId) {
      return [];
    }

    const backendImages =
      backendPropertyImages[
        String(propertyId)
      ];

    if (
      Array.isArray(
        backendImages
      ) &&
      backendImages.length > 0
    ) {
      return backendImages;
    }

    const localImages =
      propertyImages[
        String(propertyId)
      ];

    return Array.isArray(localImages)
      ? localImages
      : [];
  };

  /*
   * Get the first image belonging to a property.
   *
   * Used by:
   * - PropertyCard
   * - Owner Properties
   * - Home
   * - Properties
   * - other property lists
   */

  const getPropertyImage = (
    propertyId,
    fallback = ""
  ) => {
    const images =
      getPropertyImages(propertyId);

    return images.length > 0
      ? images[0]
      : fallback;
  };

  /*
   * Add one or more uploaded images
   * to local browser storage.
   *
   * Backend upload will be connected
   * separately.
   */

  const addPropertyImages = async (
    propertyId,
    files
  ) => {
    if (!propertyId || !files) {
      return {
        success: false,
        error:
          "Property ID and images are required.",
      };
    }

    const selectedFiles =
      Array.from(files).filter(
        (file) =>
          file &&
          file.type?.startsWith(
            "image/"
          )
      );

    if (
      selectedFiles.length === 0
    ) {
      return {
        success: false,
        error:
          "Please select valid image files.",
      };
    }

    try {
      const imageData =
        await Promise.all(
          selectedFiles.map(
            (file) =>
              fileToDataUrl(file)
          )
        );

      setPropertyImages(
        (prev) => {
          const currentImages =
            Array.isArray(
              prev[
                String(
                  propertyId
                )
              ]
            )
              ? prev[
                  String(
                    propertyId
                  )
                ]
              : [];

          return {
            ...prev,

            [String(propertyId)]:
              [
                ...currentImages,
                ...imageData,
              ],
          };
        }
      );

      return {
        success: true,
        images: imageData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.message ||
          "Unable to save property images.",
      };
    }
  };

  /*
   * Replace all images for a property.
   */

  const setPropertyImagesForProperty =
    async (
      propertyId,
      files
    ) => {
      if (!propertyId || !files) {
        return {
          success: false,
          error:
            "Property ID and images are required.",
        };
      }

      const selectedFiles =
        Array.from(files).filter(
          (file) =>
            file &&
            file.type?.startsWith(
              "image/"
            )
        );

      try {
        const imageData =
          await Promise.all(
            selectedFiles.map(
              (file) =>
                fileToDataUrl(file)
            )
          );

        setPropertyImages(
          (prev) => ({
            ...prev,

            [String(propertyId)]:
              imageData,
          })
        );

        return {
          success: true,
          images: imageData,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error.message ||
            "Unable to save property images.",
        };
      }
    };

  /*
   * Remove one image from a property.
   */

  const removePropertyImage = (
    propertyId,
    imageIndex
  ) => {
    if (!propertyId) {
      return;
    }

    setPropertyImages(
      (prev) => {
        const key =
          String(propertyId);

        const currentImages =
          Array.isArray(prev[key])
            ? prev[key]
            : [];

        return {
          ...prev,

          [key]:
            currentImages.filter(
              (_, index) =>
                index !== imageIndex
            ),
        };
      }
    );
  };

  /*
   * Remove all local images for a property.
   */

  const deletePropertyImages = (
    propertyId
  ) => {
    if (!propertyId) {
      return;
    }

    setPropertyImages(
      (prev) => {
        const updated = {
          ...prev,
        };

        delete updated[
          String(propertyId)
        ];

        return updated;
      }
    );

    /*
     * Also remove backend image cache
     * from frontend state.
     */
    setBackendPropertyImages(
      (prev) => {
        const updated = {
          ...prev,
        };

        delete updated[
          String(propertyId)
        ];

        return updated;
      }
    );
  };

  /*
   * ============================================================
   * BUYER FAVORITES
   * ============================================================
   */

  const [favoriteIds, setFavoriteIds] =
    useState([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.email) {
      setFavoriteIds([]);
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_favorites_${email}`;

    const savedFavorites =
      load(key, []);

    setFavoriteIds(
      Array.isArray(
        savedFavorites
      )
        ? savedFavorites
        : []
    );
  }, [
    user?.email,
    authLoading,
  ]);

  useEffect(() => {
    if (
      authLoading ||
      !user?.email
    ) {
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_favorites_${email}`;

    save(
      key,
      favoriteIds
    );
  }, [
    favoriteIds,
    user?.email,
    authLoading,
  ]);

  const toggleFavorite = (
    propertyId
  ) => {
    if (!user) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    setFavoriteIds(
      (prev) => {
        const exists =
          prev.some(
            (id) =>
              String(id) ===
              String(propertyId)
          );

        if (exists) {
          return prev.filter(
            (id) =>
              String(id) !==
              String(propertyId)
          );
        }

        return [
          ...prev,
          propertyId,
        ];
      }
    );

    return {
      success: true,
    };
  };

  const isFavorite = (
    propertyId
  ) => {
    return favoriteIds.some(
      (id) =>
        String(id) ===
        String(propertyId)
    );
  };

  const removeFavorite = (
    propertyId
  ) => {
    setFavoriteIds(
      (prev) =>
        prev.filter(
          (id) =>
            String(id) !==
            String(propertyId)
        )
    );
  };

  /*
   * ============================================================
   * BUYER SAVED SEARCHES
   * ============================================================
   */

  const [savedSearches, setSavedSearches] =
    useState([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.email) {
      setSavedSearches([]);
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_saved_searches_${email}`;

    const storedSearches =
      load(key, []);

    setSavedSearches(
      Array.isArray(
        storedSearches
      )
        ? storedSearches
        : []
    );
  }, [
    user?.email,
    authLoading,
  ]);

  useEffect(() => {
    if (
      authLoading ||
      !user?.email
    ) {
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_saved_searches_${email}`;

    save(
      key,
      savedSearches
    );
  }, [
    savedSearches,
    user?.email,
    authLoading,
  ]);

  const addSavedSearch = (
    search
  ) => {
    if (!user?.email) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    const now =
      new Date().toISOString();

    const newSearch = {
      ...search,

      id: Date.now(),

      alerts:
        typeof search.alerts ===
        "boolean"
          ? search.alerts
          : true,

      createdAt: now,

      updatedAt: now,
    };

    setSavedSearches(
      (prev) => [
        newSearch,
        ...prev,
      ]
    );

    return {
      success: true,
      search: newSearch,
    };
  };

  const updateSavedSearch = (
    id,
    updates
  ) => {
    setSavedSearches(
      (prev) =>
        prev.map(
          (item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,
                  ...updates,
                  updatedAt:
                    new Date().toISOString(),
                }
              : item
        )
    );
  };

  const deleteSavedSearch = (
    id
  ) => {
    setSavedSearches(
      (prev) =>
        prev.filter(
          (item) =>
            String(item.id) !==
            String(id)
        )
    );
  };

  const toggleSavedSearchAlert = (
    id
  ) => {
    setSavedSearches(
      (prev) =>
        prev.map(
          (item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,
                  alerts:
                    !item.alerts,
                  updatedAt:
                    new Date().toISOString(),
                }
              : item
        )
    );
  };

  /*
   * ============================================================
   * BUYER VIEWED PROPERTIES
   * ============================================================
   */

  const [
    viewedPropertyIds,
    setViewedPropertyIds,
  ] = useState([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.email) {
      setViewedPropertyIds([]);
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_viewed_properties_${email}`;

    const storedViewed =
      load(key, []);

    setViewedPropertyIds(
      Array.isArray(
        storedViewed
      )
        ? storedViewed
        : []
    );
  }, [
    user?.email,
    authLoading,
  ]);

  useEffect(() => {
    if (
      authLoading ||
      !user?.email
    ) {
      return;
    }

    const email =
      user.email
        .toLowerCase()
        .trim();

    const key =
      `re_viewed_properties_${email}`;

    save(
      key,
      viewedPropertyIds
    );
  }, [
    viewedPropertyIds,
    user?.email,
    authLoading,
  ]);

  const addViewedProperty = (
    propertyId
  ) => {
    if (!user?.email) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    setViewedPropertyIds(
      (prev) => {
        const withoutCurrent =
          prev.filter(
            (id) =>
              String(id) !==
              String(propertyId)
          );

        return [
          propertyId,
          ...withoutCurrent,
        ].slice(0, 20);
      }
    );

    return {
      success: true,
    };
  };

  const removeViewedProperty = (
    propertyId
  ) => {
    setViewedPropertyIds(
      (prev) =>
        prev.filter(
          (id) =>
            String(id) !==
            String(propertyId)
        )
    );
  };

  const clearViewedProperties =
    () => {
      setViewedPropertyIds([]);
    };

  /*
   * ============================================================
   * PROPERTY CRUD
   * ============================================================
   */

  const addProperty = (
    prop
  ) => {
    const newProp = {
      ...prop,

      id: Date.now(),

      views: 0,

      leads: 0,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    setProperties(
      (prev) => [
        newProp,
        ...prev,
      ]
    );

    return newProp;
  };

  const updateProperty = (
    id,
    updates
  ) => {
    setProperties(
      (prev) =>
        prev.map(
          (p) =>
            String(p.id) ===
            String(id)
              ? {
                  ...p,
                  ...updates,
                  updatedAt:
                    new Date().toISOString(),
                }
              : p
        )
    );
  };

  const deleteProperty = (
    id
  ) => {
    setProperties(
      (prev) =>
        prev.filter(
          (p) =>
            String(p.id) !==
            String(id)
        )
    );

    /*
     * Remove property images.
     */
    deletePropertyImages(id);

    /*
     * Also remove deleted property
     * from buyer favorites.
     */
    setFavoriteIds(
      (prev) =>
        prev.filter(
          (propertyId) =>
            String(propertyId) !==
            String(id)
        )
    );

    /*
     * Also remove deleted property
     * from viewed history.
     */
    setViewedPropertyIds(
      (prev) =>
        prev.filter(
          (propertyId) =>
            String(propertyId) !==
            String(id)
        )
    );
  };

  /*
   * ============================================================
   * LEADS
   * ============================================================
   */

  const addLead = (
    lead
  ) => {
    const newLead = {
      ...lead,

      id: Date.now(),

      status: "New",

      createdAt:
        new Date().toISOString(),
    };

    setLeads(
      (prev) => [
        newLead,
        ...prev,
      ]
    );

    setClients(
      (prev) => {
        if (
          prev.some(
            (c) =>
              c.email?.toLowerCase() ===
              lead.email?.toLowerCase()
          )
        ) {
          return prev;
        }

        return [
          {
            id:
              Date.now() + 1,

            name:
              lead.name,

            email:
              lead.email,

            phone:
              lead.phone,

            type: "Buyer",

            status: "Active",

            interestedIn:
              null,

            budget:
              null,

            agentId:
              lead.agentId,

            createdAt:
              new Date().toISOString(),
          },

          ...prev,
        ];
      }
    );

    return newLead;
  };

  const updateLeadStatus = (
    id,
    status
  ) => {
    setLeads(
      (prev) =>
        prev.map(
          (l) =>
            String(l.id) ===
            String(id)
              ? {
                  ...l,
                  status,
                }
              : l
        )
    );
  };

  /*
   * ============================================================
   * MESSAGES
   * ============================================================
   */

  const addMessage = (
    msg
  ) => {
    const newMsg = {
      ...msg,

      id: Date.now(),

      createdAt:
        new Date().toISOString(),

      read:
        msg.senderType ===
        "agent",
    };

    setMessages(
      (prev) => [
        ...prev,
        newMsg,
      ]
    );

    return newMsg;
  };

  const markMessagesRead = (
    leadId
  ) => {
    setMessages(
      (prev) =>
        prev.map(
          (m) =>
            String(m.leadId) ===
              String(leadId) &&
            m.senderType ===
              "buyer"
              ? {
                  ...m,
                  read: true,
                }
              : m
        )
    );
  };

  /*
   * ============================================================
   * TOUR REQUESTS
   * ============================================================
   */

  const updateTourStatus = (
    id,
    status
  ) => {
    setTourRequests(
      (prev) =>
        prev.map(
          (t) =>
            String(t.id) ===
            String(id)
              ? {
                  ...t,
                  status,
                }
              : t
        )
    );
  };

  const addTourRequest = (
    tour
  ) => {
    const newTour = {
      ...tour,

      id: Date.now(),

      status: "Pending",

      createdAt:
        new Date().toISOString(),
    };

    setTourRequests(
      (prev) => [
        newTour,
        ...prev,
      ]
    );

    return newTour;
  };

  /*
   * ============================================================
   * PERSIST SHARED DATA
   * ============================================================
   */

  useEffect(() => {
    save(
      "re_properties",
      properties
    );
  }, [properties]);

  useEffect(() => {
    save(
      "re_leads",
      leads
    );
  }, [leads]);

  useEffect(() => {
    save(
      "re_messages",
      messages
    );
  }, [messages]);

  useEffect(() => {
    save(
      "re_tours",
      tourRequests
    );
  }, [tourRequests]);

  useEffect(() => {
    save(
      "re_transactions",
      transactions
    );
  }, [transactions]);

  useEffect(() => {
    save(
      "re_reviews",
      reviews
    );
  }, [reviews]);

  useEffect(() => {
    save(
      "re_clients",
      clients
    );
  }, [clients]);

  /*
   * ============================================================
   * PROVIDER
   * ============================================================
   */

  return (
    <DataContext.Provider
      value={{
        /*
         * Shared data
         */
        properties,

        leads,

        messages,

        tourRequests,

        transactions,

        reviews,

        clients,

        /*
         * Property Images
         */
        propertyImages,

        backendPropertyImages,

        addPropertyImages,

        setPropertyImagesForProperty,

        getPropertyImages,

        getPropertyImage,

        removePropertyImage,

        deletePropertyImages,

        /*
         * Favorites
         */
        favoriteIds,

        toggleFavorite,

        isFavorite,

        removeFavorite,

        /*
         * Saved Searches
         */
        savedSearches,

        addSavedSearch,

        updateSavedSearch,

        deleteSavedSearch,

        toggleSavedSearchAlert,

        /*
         * Viewed Properties
         */
        viewedPropertyIds,

        addViewedProperty,

        removeViewedProperty,

        clearViewedProperties,

        /*
         * Property functions
         */
        addProperty,

        updateProperty,

        deleteProperty,

        /*
         * Lead functions
         */
        addLead,

        updateLeadStatus,

        /*
         * Message functions
         */
        addMessage,

        markMessagesRead,

        /*
         * Tour functions
         */
        updateTourStatus,

        addTourRequest,

        /*
         * Direct property setter
         */
        setProperties,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx =
    useContext(DataContext);

  if (!ctx) {
    throw new Error(
      "useData must be used within DataProvider"
    );
  }

  return ctx;
}