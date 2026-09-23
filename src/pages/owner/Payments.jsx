import React, { useState } from 'react';

export default function OwnerPayments() {
  // Mock financial transaction ledger history entries
  const [transactions, setTransactions] = useState([
    { id: "TXN-9021", tenant: "Arvind G.", property: "3BHK Villa - Whitefield", item: "Rental Advance Deposit", amount: "₹1,50,000", date: "Sep 14, 2026", status: "Successful", channel: "Bank NetBanking" },
    { id: "TXN-8842", tenant: "Priya Sharma", property: "2BHK Apartment - HSR Layout", item: "Monthly Rent (September)", amount: "₹42,000", date: "Sep 05, 2026", status: "Successful", channel: "UPI Auto-pay" },
    { id: "TXN-8109", tenant: "Rahul Verma", property: "Studio - Indiranagar", item: "Maintenance Charges", amount: "₹4,500", date: "Sep 02, 2026", status: "Successful", channel: "Credit Card" },
    { id: "TXN-7410", tenant: "Sneha Reddy", property: "3BHK Villa - Whitefield", item: "Token Booking Amount", amount: "₹25,000", date: "Aug 28, 2026", status: "Pending", channel: "Razorpay Gateway" }
  ]);

  const statusColors = {
    Successful: 'bg-green-50 text-green-600 border-green-200',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Failed: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payments & Ledgers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Audit historical rent statements and transactional billing items.</p>
        </div>
        
        {/* Quick Statement Export Action Link Trigger */}
        <button className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors self-start">
          📥 Export Account Statement
        </button>
      </div>

      {/* Interactive Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Payouts (Month)</span>
          <p className="text-2xl font-black text-gray-900 mt-1">₹1,96,500</p>
        </div>
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Approvals</span>
          <p className="text-2xl font-black text-amber-600 mt-1">₹25,000</p>
        </div>
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Leases Invoiced</span>
          <p className="text-2xl font-black text-rose-500 mt-1">3 / 5</p>
        </div>
      </div>

      {/* Transaction Records Table Column View Grid */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="pb-3 pl-4">Transaction ID / Asset</th>
              <th className="pb-3">Payer Account</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Value</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50/30 transition-colors">
                {/* ID Mapping reference */}
                <td className="py-4 pl-4">
                  <div className="font-bold text-gray-900">{txn.id}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{txn.property}</div>
                </td>
                
                {/* Tenant User Name */}
                <td className="py-4 font-medium text-gray-700">{txn.tenant}</td>
                
                {/* Line Item Specific Details */}
                <td className="py-4 text-gray-500">
                  <div className="text-gray-800 font-medium">{txn.item}</div>
                  <div className="text-[10px] text-gray-400">{txn.channel}</div>
                </td>
                
                {/* Currency Values */}
                <td className="py-4 font-bold text-gray-900">{txn.amount}</td>
                
                {/* Status Badges */}
                <td className="py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${statusColors[txn.status]}`}>
                    {txn.status}
                  </span>
                </td>
                
                {/* Timestamps */}
                <td className="py-4 pr-4 text-right text-xs text-gray-500 font-medium">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
