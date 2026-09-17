import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  BedDouble, 
  Bath, 
  Square, 
  Eye, 
  Users, 
  MoreVertical,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react';

export default function OwnerProperties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Realistic listings tailored to your Bangalore real estate environment setup
  const propertiesData = [
    {
      id: 1,
      title: "Luxury 4 BHK Villa with Private Pool",
      locality: "Sarjapur Road, Bangalore",
      price: "₹3.50 Cr",
      views: 521,
      leads: 14,
      status: "Active",
      type: "Sale",
      specs: { beds: 4, baths: 4, area: "2800 sqft" },
      furnishing: "Fully Furnished",
      image: "https://unsplash.com"
    },
    {
      id: 2,
      title: "Spacious 3 BHK Apartment in Whitefield",
      locality: "Whitefield, Bangalore",
      price: "₹1.25 Cr",
      views: 342,
      leads: 9,
      status: "Active",
      type: "Sale",
      specs: { beds: 3, baths: 3, area: "1470 sqft" },
      furnishing: "Semi Furnished",
      image: "https://unsplash.com"
    },
    {
      id: 3,
      title: "3 BHK Independent House - HSR Layout",
      locality: "HSR Layout Sector 2, Bangalore",
      price: "₹1.80 Cr",
      views: 398,
      leads: 6,
      status: "Sold",
      type: "Sale",
      specs: { beds: 3, baths: 3, area: "2000 sqft" },
      furnishing: "Semi Furnished",
      image: "https://unsplash.com"
    },
    {
      id: 4,
      title: "2 BHK Fully Furnished Flat for Rent",
      locality: "Koramangala, Bangalore",
      price: "₹45,000 /mo",
      views: 189,
      leads: 5,
      status: "Rented",
      type: "Rent",
      specs: { beds: 2, baths: 2, area: "1100 sqft" },
      furnishing: "Fully Furnished",
      image: "https://unsplash.com"
    }
  ];

  // Filtering computational handling matrix rules
  const filteredProperties = propertiesData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.locality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Deck section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Registered Listings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Review active structural metrics and buyer tracking counters across your real estate catalogs.</p>
        </div>
        <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add New Property
        </button>
      </div>

      {/* Control Utility Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Field Anchor */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search matching by locality or asset name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Tab Filters Deck Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Active', 'Rented', 'Sold'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status 
                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Real Estate Property Product Catalog Deck Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition">
            
            {/* Asset Display Visual block frame */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                property.type === 'Sale' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                For {property.type}
              </span>
            </div>

            {/* Content Parameter Descriptions */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    property.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                    property.status === 'Rented' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {property.status === 'Active' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {property.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{property.title}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {property.locality}
                </p>
              </div>

              {/* Structural Specification Badges Deck */}
              <div className="flex items-center gap-3 text-gray-500 text-xs border-y border-gray-100 py-2">
                <span className="flex items-center gap-1 font-medium"><BedDouble className="w-3.5 h-3.5 text-gray-400" /> {property.specs.beds} BHK</span>
                <span className="flex items-center gap-1 font-medium"><Bath className="w-3.5 h-3.5 text-gray-400" /> {property.specs.baths} Bath</span>
                <span className="flex items-center gap-1 font-medium"><Square className="w-3.5 h-3.5 text-gray-400" /> {property.specs.area}</span>
              </div>

              {/* Analytical views tracker footers row */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Asset Valuation</p>
                  <p className="text-sm font-extrabold text-slate-900">{property.price}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Eye className="w-3.5 h-3.5 text-gray-400" /> {property.views}</span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Users className="w-3.5 h-3.5 text-gray-400" /> {property.leads}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
