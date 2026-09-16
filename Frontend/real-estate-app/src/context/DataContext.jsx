import { createContext, useContext, useState, useEffect } from "react";
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
  localStorage.setItem(key, JSON.stringify(value));
}

export function DataProvider({ children }) {
  const [properties, setProperties] = useState(() =>
    load("re_properties", INITIAL_PROPERTIES)
  );
  const [leads, setLeads] = useState(() => load("re_leads", INITIAL_LEADS));
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

  useEffect(() => save("re_properties", properties), [properties]);
  useEffect(() => save("re_leads", leads), [leads]);
  useEffect(() => save("re_messages", messages), [messages]);
  useEffect(() => save("re_tours", tourRequests), [tourRequests]);
  useEffect(() => save("re_transactions", transactions), [transactions]);
  useEffect(() => save("re_reviews", reviews), [reviews]);
  useEffect(() => save("re_clients", clients), [clients]);

  // Properties CRUD
  const addProperty = (prop) => {
    const newProp = {
      ...prop,
      id: Date.now(),
      views: 0,
      leads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProp, ...prev]);
    return newProp;
  };

  const updateProperty = (id, updates) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProperty = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  // Leads
  const addLead = (lead) => {
    const newLead = {
      ...lead,
      id: Date.now(),
      status: "New",
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    // also create client if not exists
    setClients((prev) => {
      if (prev.some((c) => c.email === lead.email)) return prev;
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
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  // Messages
  const addMessage = (msg) => {
    const newMsg = {
      ...msg,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      read: msg.senderType === "agent",
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const markMessagesRead = (leadId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.leadId === leadId && m.senderType === "buyer"
          ? { ...m, read: true }
          : m
      )
    );
  };

  // Tour Requests
  const updateTourStatus = (id, status) => {
    setTourRequests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const addTourRequest = (tour) => {
    const newTour = {
      ...tour,
      id: Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setTourRequests((prev) => [newTour, ...prev]);
    return newTour;
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        leads,
        messages,
        tourRequests,
        transactions,
        reviews,
        clients,
        addProperty,
        updateProperty,
        deleteProperty,
        addLead,
        updateLeadStatus,
        addMessage,
        markMessagesRead,
        updateTourStatus,
        addTourRequest,
        setProperties,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
