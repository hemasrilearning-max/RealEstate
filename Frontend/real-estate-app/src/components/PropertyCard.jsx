import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Eye } from "lucide-react";
import { formatPrice } from "../data/mockData";

export default function PropertyCard({ property }) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={property.images?.[0] || "https://via.placeholder.com/400x300"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              property.listingType === "Rent"
                ? "bg-blue-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {property.listingType}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white">
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {property.views}
        </div>
      </div>

      <div className="p-4">
        <div className="text-xl font-bold text-gray-900 mb-1">
          {formatPrice(property.price, property.listingType)}
          {property.pricePerSqft && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ₹{property.pricePerSqft.toLocaleString("en-IN")}/sqft
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-red-600 transition">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          {property.bhk && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bhk}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            {property.area} {property.areaUnit}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {property.propertyType}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {property.status}
          </span>
          {property.furnishing && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {property.furnishing}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
