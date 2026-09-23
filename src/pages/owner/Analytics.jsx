import React from 'react';

export default function OwnerAnalytics() {
  // Mock performance metric values
  const conversionMetrics = [
    { title: "View-to-Lead Rate", value: "0.70%", change: "+1.2%", trend: "up" },
    { title: "Lead-to-Tour Rate", value: "16.6%", change: "+3.4%", trend: "up" },
    { title: "Tour-to-Close Rate", value: "33.3%", change: "-0.5%", trend: "down" },
  ];

  // Mock property breakdown listing values 
  const assetPerformance = [
    { name: "3BHK Villa - Whitefield", views: 1840, leads: 14, performance: 85 },
    { name: "2BHK Apartment - HSR Layout", views: 1210, leads: 8, performance: 65 },
    { name: "Studio Flat - Indiranagar", views: 362, leads: 2, performance: 40 },
  ];

  return (
    <div className="space-y-6 font-sans animate-fadeIn">
      {/* Module Title Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Audit traffic conversions, exposure maps, and asset pipeline metrics.</p>
      </div>

      {/* Conversion funnel tracking columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {conversionMetrics.map((metric, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{metric.title}</span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-black text-gray-900">{metric.value}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                metric.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid distribution splits for analytics layout indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Property Breakdown Pipeline */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Traffic Breakdown by Asset</h3>
          <div className="space-y-4">
            {assetPerformance.map((asset, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">{asset.name}</span>
                  <span className="text-gray-400 font-medium">{asset.views} views · {asset.leads} leads</span>
                </div>
                {/* Horizontal custom fill tracking indicator container */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${asset.performance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Simple visual leads capture channel map */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">Lead Sources</h3>
            <p className="text-xs text-gray-400 mb-4">Distribution channel breakdown map metrics.</p>
            
            <div className="space-y-2.5">
              {[
                { channel: "Direct Platform Views", share: "70%", color: "bg-rose-500" },
                { channel: "Shared Link Campaigns", share: "20%", color: "bg-indigo-500" },
                { channel: "External Referral Enquiries", share: "10%", color: "bg-amber-400" }
              ].map((src, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${src.color}`}></span>
                    <span className="text-gray-600 font-medium">{src.channel}</span>
                  </div>
                  <span className="font-bold text-gray-900">{src.share}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
