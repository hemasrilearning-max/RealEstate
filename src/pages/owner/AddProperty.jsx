import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext"; 
import { Upload, X, Home, Image as ImageIcon } from 'lucide-react';

export default function AddProperty() {
  const navigate = useNavigate();
  
  // 👥 Connects directly to your global auth context handler to append properties
  const { propertiesData, setPropertiesData } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Rent',
    propertyType: 'Apartment',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: ''
  });

  // Local state array to hold real base64 upload preview paths
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🖼️ Processes multiple image files and converts them into instant viewable base64 strings
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert("Each individual file must be less than 5MB!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Safely removes selected photos before hitting submit
  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Setup format structure to perfectly match your database/listing view requirements
    const newProperty = {
      id: Date.now(), // Generate dynamic distinct tracking identifier key
      title: formData.title,
      locality: formData.location,
      price: formData.type === 'Rent' ? `₹${Number(formData.price).toLocaleString('en-IN')} /mo` : `₹${(Number(formData.price) / 10000000).toFixed(2)} Cr`,
      views: 0,
      leads: 0,
      status: "Active",
      type: formData.type,
      specs: { 
        beds: formData.bedrooms || "0", 
        baths: formData.bathrooms || "0", 
        area: formData.area ? `${formData.area} sqft` : "0 sqft" 
      },
      // Assign the first uploaded image as primary thumbnail, fallback to built-in architectural template if blank
      image: images.length > 0 ? images[0] : "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23e2e8f0'/><circle cx='200' cy='150' r='40' fill='%23cbd5e1'/></svg>"
    };

    // Update global state tree context vector seamlessly if connected
    if (setPropertiesData) {
      setPropertiesData(prev => [newProperty, ...prev]);
    } else if (propertiesData) {
      propertiesData.unshift(newProperty); 
    }

    alert('Property added successfully to your portfolio catalogue!');
    
    // 🚀 REDIRECTION ROUTER TARGET: Instantly shifts the view back to the properties checklist portal
    navigate('/owner/properties');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-start font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
        {/* Header Title Deck */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="w-6 h-6 text-rose-600" />
            Add New Property
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill out the details below to list your property on the dashboard ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title / Name</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Intent</label>
              <div className="flex gap-4">
                {['Rent', 'Sale'].map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: intent }))}
                    className={`flex-1 py-2.5 rounded-lg font-bold border text-sm transition-all ${
                      formData.type === intent
                        ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm'
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 bg-white transition-colors text-sm font-medium"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa / House</option>
                <option value="Commercial">Commercial Space</option>
                <option value="Plot">Plot / Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (in ₹ Numeric Value)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g., 35000000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Carpet Area (sq ft)</label>
              <input
                type="number"
                name="area"
                placeholder="e.g., 2800"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Location & Specs Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms (BHK Count)</label>
              <input
                type="number"
                name="bedrooms"
                placeholder="e.g., 4"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Location / Address</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Sarjapur Road, Bangalore, Karnataka"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Text Summary Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Provide a brief summary outlining amenities, vicinity markers, and key details..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-rose-500 transition-colors text-sm font-medium"
            ></textarea>
          </div>

          {/* 🖼️ DYNAMIC MULTI-IMAGE REAL-TIME MEDIA UPLOAD ZONE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Media Upload (Property Photos)</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                            {/* Maps uploaded photos list instantly inside square aspect blocks */}
              {images.map((imgUrl, index) => (
                <div key={index} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group shadow-sm bg-gray-50">
                  <img src={imgUrl} alt="Preview Slot" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Input Activator Box */}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all gap-1 text-center p-2">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold text-rose-600">Upload Photo</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or WebP images · Max 5MB per file</p>
          </div>

          {/* Form Action Controls Row */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/owner/properties')}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
              Publish Listing
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

