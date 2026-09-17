import React, { useState } from 'react';

export default function Leads() {
  // Mock data matching the dashboard summary metrics (24 total leads)
  const [leads, setLeads] = useState([
    { id: 1, name: "Arvind G.", email: "arvind@example.com", phone: "+91 98765 43210", property: "3BHK Luxury Villa - Whitefield", status: "New", timeframe: "2 hrs ago" },
    { id: 2, name: "Priya Sharma", email: "priya.s@example.com", phone: "+91 91234 56789", property: "2BHK Apartment - HSR Layout", status: "New", timeframe: "2 hrs ago" },
    { id: 3, name: "Rahul Verma", email: "rahul.v@example.com", phone: "+91 99887 76655", property: "Penthouse Studio - Indiranagar", status: "Contacted", timeframe: "5 hrs ago" },
    { id: 4, name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 94400 11223", property: "3BHK Luxury Villa - Whitefield", status: "Qualified", timeframe: "1 day ago" },
    { id: 5, name: "Amit Patel", email: "amit.p@example.com", phone: "+91 93322 11004", property: "Commercial Space - Koramangala", status: "Lost", timeframe: "3 days ago" },
  ]);

  const [filter, setFilter] = useState('All');

  const statusColors = {
    New: 'bg-blue-50 text-blue-600 border-blue-200',
    Contacted: 'bg-amber-50 text-amber-600 border-amber-200',
    Qualified: 'bg-green-50 text-green-600 border-green-200',
    Lost: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  const filteredLeads = filter === 'All' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and convert tenant inquiries for your active listings.</p>
        </div>
        
        {/* Status filtering switches */}
        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200/60 self-start">
          {['All', 'New', 'Contacted', 'Qualified'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === status 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="pb-3 pl-4">Lead Contact</th>
              <th className="pb-3">Target Property</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Received</th>
              <th className="pb-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Contact Profile columns */}
                <td className="py-4 pl-4">
                  <div className="font-bold text-gray-900">{lead.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{lead.email} · {lead.phone}</div>
                </td>
                {/* Property context mapping */}
                <td className="py-4 font-medium text-gray-700">{lead.property}</td>
                {/* Badge tags */}
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 text-gray-500 text-xs font-medium">{lead.timeframe}</td>
                {/* Interaction operational links */}
                <td className="py-4 pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                      Message
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-sm">
                      Qualify
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No inquiries match this status filter module right now.
          </div>
        )}
      </div>
    </div>
  );
}
