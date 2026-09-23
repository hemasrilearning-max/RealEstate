// Multi-role users for registration & login
// Roles: agent | admin | owner | buyer

export const ROLES = {
  AGENT: "agent",
  ADMIN: "admin",
  OWNER: "owner",
  BUYER: "buyer",
};

export const ROLE_LABELS = {
  agent: "Agent",
  admin: "Admin",
  owner: "Property Owner",
  buyer: "Buyer",
};

export const ROLE_DASHBOARD = {
  agent: "/agent/dashboard",
  admin: "/admin/dashboard",
  owner: "/owner/dashboard",
  buyer: "/buyer/dashboard",
};

// Default seeded users (passwords plain for demo only)
export const INITIAL_USERS = [
  {
    id: 1,
    name: "Agent",
    email: "agent@realestate.com",
    password: "agent123",
    phone: "+91 98765 43210",
    role: "agent",
    company: "RealEstate Realty",
    avatar: "https://i.pravatar.cc/150?u=rahul",
    rating: 4.8,
    totalDeals: 47,
    joinedAt: "2023-01-15",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@realestate.com",
    password: "admin123",
    phone: "+91 90000 00001",
    role: "admin",
    company: "RealEstate HQ",
    avatar: "https://i.pravatar.cc/150?u=admin",
    joinedAt: "2023-01-01",
  },
  {
    id: 3,
    name: "Priya Mehta",
    email: "owner@gmail.com",
    password: "owner123",
    phone: "+91 99887 66554",
    role: "owner",
    company: null,
    avatar: "https://i.pravatar.cc/150?u=owner",
    joinedAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Arjun Patel",
    email: "buyer@gmail.com",
    password: "buyer123",
    phone: "+91 91234 56789",
    role: "buyer",
    company: null,
    avatar: "https://i.pravatar.cc/150?u=buyer",
    joinedAt: "2025-06-20",
  },
];
