import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors
  }
}

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  /*
   * ============================================================
   * SHARED DATA
   * ============================================================
   */

  const [properties, setProperties] = useState(() =>
    load("re_properties", INITIAL_PROPERTIES)
  );

  const [leads, setLeads] = useState(() =>
    load("re_leads", INITIAL_LEADS)
  );

  const [messages, setMessages] = useState(() =>
    load("re_messages", INITIAL_MESSAGES)
  );

  const [tourRequests, setTourRequests] = useState(() =>
    load("re_tours", INITIAL_TOUR_REQUESTS)
  );

  const [transactions, setTransactions] = useState(() =>
    load("re_transactions", INITIAL_TRANSACTIONS)
  );

  const [reviews, setReviews] = useState(() =>
    load("re_reviews", INITIAL_REVIEWS)
  );

  const [clients, setClients] = useState(() =>
    load("re_clients", INITIAL_CLIENTS)
  );

  /*
   * ============================================================
   * BUYER FAVORITES
   * ============================================================
   *
   * Every logged-in buyer has separate favorites.
   *
   * Example:
   * re_favorites_buyer@gmail.com
   */

  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.email) {
      setFavoriteIds([]);
      return;
    }

    const email = user.email.toLowerCase().trim();
    const key = `re_favorites_${email}`;

    const savedFavorites = load(key, []);

    setFavoriteIds(
      Array.isArray(savedFavorites) ? savedFavorites : []
    );
  }, [user?.email, authLoading]);

  useEffect(() => {
    if (authLoading || !user?.email) return;

    const email = user.email.toLowerCase().trim();
    const key = `re_favorites_${email}`;

    save(key, favoriteIds);
  }, [favoriteIds, user?.email, authLoading]);

  const toggleFavorite = (propertyId) => {
    if (!user) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    setFavoriteIds((prev) => {
      const exists = prev.some(
        (id) => String(id) === String(propertyId)
      );

      if (exists) {
        return prev.filter(
          (id) => String(id) !== String(propertyId)
        );
      }

      return [...prev, propertyId];
    });

    return {
      success: true,
    };
  };

  const isFavorite = (propertyId) => {
    return favoriteIds.some(
      (id) => String(id) === String(propertyId)
    );
  };

  const removeFavorite = (propertyId) => {
    setFavoriteIds((prev) =>
      prev.filter(
        (id) => String(id) !== String(propertyId)
      )
    );
  };

  /*
   * ============================================================
   * BUYER SAVED SEARCHES
   * ============================================================
   *
   * Every buyer gets their own saved searches.
   *
   * Example:
   * re_saved_searches_buyer@gmail.com
   */

  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.email) {
      setSavedSearches([]);
      return;
    }

    const email = user.email.toLowerCase().trim();
    const key = `re_saved_searches_${email}`;

    const storedSearches = load(key, []);

    setSavedSearches(
      Array.isArray(storedSearches)
        ? storedSearches
        : []
    );
  }, [user?.email, authLoading]);

  useEffect(() => {
    if (authLoading || !user?.email) return;

    const email = user.email.toLowerCase().trim();
    const key = `re_saved_searches_${email}`;

    save(key, savedSearches);
  }, [savedSearches, user?.email, authLoading]);

  const addSavedSearch = (search) => {
    if (!user?.email) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    const now = new Date().toISOString();

    const newSearch = {
      ...search,
      id: Date.now(),
      alerts:
        typeof search.alerts === "boolean"
          ? search.alerts
          : true,
      createdAt: now,
      updatedAt: now,
    };

    setSavedSearches((prev) => [
      newSearch,
      ...prev,
    ]);

    return {
      success: true,
      search: newSearch,
    };
  };

  const updateSavedSearch = (id, updates) => {
    setSavedSearches((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const deleteSavedSearch = (id) => {
    setSavedSearches((prev) =>
      prev.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  const toggleSavedSearchAlert = (id) => {
    setSavedSearches((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              alerts: !item.alerts,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  /*
   * ============================================================
   * BUYER VIEWED PROPERTIES
   * ============================================================
   *
   * Each logged-in buyer gets their own recently viewed
   * property history.
   *
   * Example:
   * re_viewed_properties_buyer@gmail.com
   *
   * The newest property is always stored first.
   *
   * Maximum:
   * 20 recently viewed properties.
   */

  const [viewedPropertyIds, setViewedPropertyIds] = useState([]);

  /*
   * Load viewed properties when the logged-in buyer changes.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user?.email) {
      setViewedPropertyIds([]);
      return;
    }

    const email = user.email.toLowerCase().trim();
    const key = `re_viewed_properties_${email}`;

    const storedViewed = load(key, []);

    setViewedPropertyIds(
      Array.isArray(storedViewed)
        ? storedViewed
        : []
    );
  }, [user?.email, authLoading]);

  /*
   * Persist viewed properties for the current buyer.
   */
  useEffect(() => {
    if (authLoading || !user?.email) return;

    const email = user.email.toLowerCase().trim();
    const key = `re_viewed_properties_${email}`;

    save(key, viewedPropertyIds);
  }, [
    viewedPropertyIds,
    user?.email,
    authLoading,
  ]);

  /*
   * Add a property to recently viewed.
   *
   * The property is moved to the top if it was already viewed.
   */
  const addViewedProperty = (propertyId) => {
    if (!user?.email) {
      return {
        success: false,
        requiresLogin: true,
      };
    }

    setViewedPropertyIds((prev) => {
      const withoutCurrent = prev.filter(
        (id) => String(id) !== String(propertyId)
      );

      return [
        propertyId,
        ...withoutCurrent,
      ].slice(0, 20);
    });

    return {
      success: true,
    };
  };

  /*
   * Remove one property from viewed history.
   */
  const removeViewedProperty = (propertyId) => {
    setViewedPropertyIds((prev) =>
      prev.filter(
        (id) => String(id) !== String(propertyId)
      )
    );
  };

  /*
   * Clear complete viewed history.
   */
  const clearViewedProperties = () => {
    setViewedPropertyIds([]);
  };

  /*
   * ============================================================
   * PROPERTY CRUD
   * ============================================================
   */

  const addProperty = (prop) => {
    const newProp = {
      ...prop,
      id: Date.now(),
      views: 0,
      leads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProperties((prev) => [
      newProp,
      ...prev,
    ]);

    return newProp;
  };

  const updateProperty = (id, updates) => {
    setProperties((prev) =>
      prev.map((p) =>
        String(p.id) === String(id)
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const deleteProperty = (id) => {
    setProperties((prev) =>
      prev.filter(
        (p) => String(p.id) !== String(id)
      )
    );

    /*
     * Also remove deleted property from buyer favorites
     * and viewed history.
     */
    setFavoriteIds((prev) =>
      prev.filter(
        (propertyId) =>
          String(propertyId) !== String(id)
      )
    );

    setViewedPropertyIds((prev) =>
      prev.filter(
        (propertyId) =>
          String(propertyId) !== String(id)
      )
    );
  };

  /*
   * ============================================================
   * LEADS
   * ============================================================
   */

  const addLead = (lead) => {
    const newLead = {
      ...lead,
      id: Date.now(),
      status: "New",
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [
      newLead,
      ...prev,
    ]);

    setClients((prev) => {
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
          id: Date.now() + 1,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          type: "Buyer",
          status: "Active",
          interestedIn: null,
          budget: null,
          agentId: lead.agentId,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    return newLead;
  };

  const updateLeadStatus = (id, status) => {
    setLeads((prev) =>
      prev.map((l) =>
        String(l.id) === String(id)
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

  const addMessage = (msg) => {
    const newMsg = {
      ...msg,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      read: msg.senderType === "agent",
    };

    setMessages((prev) => [
      ...prev,
      newMsg,
    ]);

    return newMsg;
  };

  const markMessagesRead = (leadId) => {
    setMessages((prev) =>
      prev.map((m) =>
        String(m.leadId) === String(leadId) &&
        m.senderType === "buyer"
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

  const updateTourStatus = (id, status) => {
    setTourRequests((prev) =>
      prev.map((t) =>
        String(t.id) === String(id)
          ? {
              ...t,
              status,
            }
          : t
      )
    );
  };

  const addTourRequest = (tour) => {
    const newTour = {
      ...tour,
      id: Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setTourRequests((prev) => [
      newTour,
      ...prev,
    ]);

    return newTour;
  };

  /*
   * ============================================================
   * PERSIST SHARED DATA
   * ============================================================
   */

  useEffect(() => {
    save("re_properties", properties);
  }, [properties]);

  useEffect(() => {
    save("re_leads", leads);
  }, [leads]);

  useEffect(() => {
    save("re_messages", messages);
  }, [messages]);

  useEffect(() => {
    save("re_tours", tourRequests);
  }, [tourRequests]);

  useEffect(() => {
    save("re_transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    save("re_reviews", reviews);
  }, [reviews]);

  useEffect(() => {
    save("re_clients", clients);
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
  const ctx = useContext(DataContext);

  if (!ctx) {
    throw new Error(
      "useData must be used within DataProvider"
    );
  }

  return ctx;
}

