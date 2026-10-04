import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Home as HomeIcon,
  Building2,
  TreePine,
  Key,
} from "lucide-react";

import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/PropertyCard";

export default function Home() {
  const { properties } = useData();
  const { user } = useAuth();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("Sale");

  const featured = properties
  .filter((p) => p.isFeatured)
  .slice(0, 3);

const homepageProperties =
  featured.length > 0
    ? featured
    : properties.slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (listingType) {
      params.set("listingType", listingType);
    }

    if (search) {
      params.set("search", search);
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* =========================
          HERO
      ========================== */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Find Your Dream Home
              <br />
              <span className="text-purple-200">
                With HomeSpace
              </span>
            </h1>

            <p className="text-lg text-purple-100 mb-8">
              Buy, Sell or Rent Properties with ease. Trusted by
              thousands.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              {/* Buy / Rent */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                {[
  { label: "Buy", value: "Sale" },
  { label: "Rent", value: "Rent" },
].map((type) => (
                 <button
  key={type.value}
  type="button"
  onClick={() => setListingType(type.value)}
  className={`px-5 py-3 text-sm font-semibold transition ${
    listingType === type.value
      ? "bg-purple-600 text-white"
      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
  }`}
>
  {type.label}
</button>
                ))}
              </div>

              {/* Search input */}
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search by locality, landmark..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="flex-1 py-3 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================== */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: Building2,
              label: "Flats",
              type: "Flat",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: HomeIcon,
              label: "Villas",
              type: "Villa",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: TreePine,
              label: "Plots",
              type: "Plot",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Key,
              label: "For Rent",
              type: "Rent",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((cat) => (
            <Link
              key={cat.label}
              to={
                cat.type === "Rent"
                  ? "/properties?listingType=Rent"
                  : `/properties?propertyType=${cat.type}`
              }
              className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition group"
            >
              <div
                className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}
              >
                <cat.icon className="w-6 h-6" />
              </div>

              <span className="font-semibold text-gray-800">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================
          FEATURED PROPERTIES
      ========================== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Properties
            </h2>

            <p className="text-gray-500 mt-1">
              Handpicked premium listings
            </p>
          </div>

          <Link
            to="/properties"
            className="text-purple-600 font-medium hover:underline text-sm"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {homepageProperties.map((property) => (
  <PropertyCard
    key={property.id}
    property={property}
  />
))}
        </div>
      </section>

      {/* =========================
          LOGIN / REGISTER CTA
          ONLY FOR LOGGED-OUT USERS
      ========================== */}
      {!user && (
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Join as Agent, Owner or Buyer
            </h2>

            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Register as an agent to list properties and manage
              leads, or as an owner or buyer.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm"
            >
              Login / Register
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}