import React, { useState } from 'react';

export default function AddProperty() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Rent',
    propertyType: 'Apartment',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Property Submitted Data:', formData);
    alert('Property added successfully to your HomeSpace portfolio!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Property</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill out the details below to list your property on the dashboard ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Title / Name</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Luxury 3BHK Apartment"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Intent</label>
              <div className="flex gap-4">
                {['Rent', 'Sale'].map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: intent }))}
                    className={`flex-1 py-2.5 rounded-lg font-medium border text-sm transition-all ${
                      formData.type === intent
                        ? 'bg-pink-50 border-pink-500 text-pink-600 ring-2 ring-pink-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    For {intent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type & Cost Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white transition-all"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa / House</option>
                <option value="Commercial">Commercial Space</option>
                <option value="Plot">Plot / Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (in ₹ or Total)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g., 45000000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carpet Area (sq ft)</label>
              <input
                type="number"
                name="area"
                placeholder="e.g., 1800"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Location & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms (BHK)</label>
              <input
                type="number"
                name="bedrooms"
                placeholder="e.g., 3"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complete Location / Address</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Whitefield, Bangalore, Karnataka"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Text Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Provide a brief summary outlining amenities, vicinity markers, and features..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            ></textarea>
          </div>

          {/* Media / Video Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Upload (Images & Video Walkthroughs)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-pink-400 transition-colors cursor-pointer bg-gray-50/50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h16a4 4 0 004-4V12a4 4 0 00-4-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 26l7-7 7 7M17 14h.01M32 21l-5-5-11 11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative font-semibold text-pink-600 hover:text-pink-500">Upload high-res files</span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, MP4 video up to 50MB</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm shadow-sm hover:opacity-95 transition-all"
            >
              Publish Property
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
