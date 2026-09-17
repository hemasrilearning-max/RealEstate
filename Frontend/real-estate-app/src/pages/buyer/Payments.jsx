import React, { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BuyerPayments() {
  // Mock billing records for token receipts or security deposit allocations
  const [ledgers] = useState([
    { id: "PAY-1104", type: "Security Deposit", property: "Modern 3 BHK Apartment - Whitefield", amount: "₹1,50,000", method: "NetBanking Transfer", status: "Paid", date: "Sep 05, 2026" },
    { id: "PAY-0982", type: "Token Booking Fee", property: "Luxury 4 BHK Villa - Sarjapur", amount: "₹25,000", method: "UPI AutoPay", status: "Paid", date: "Aug 28, 2026" },
    { id: "PAY-0411", type: "Application Verification Fee", property: "3 BHK House - HSR Layout", amount: "₹1,200", method: "Credit Card", status: "Paid", date: "Aug 15, 2026" }
  ]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" /> Payments & Receipts
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Audit transaction invoices, digital token receipts, and security deposit ledgers.</p>
        </div>
      </div>

      {/* Aggregate Financial Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Capital Transacted</span>
          <p className="text-xl font-black text-gray-900 mt-1">₹1,76,200</p>
        </div>
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending Due Demands</span>
          <p className="text-xl font-black text-gray-400 mt-1">₹0.00</p>
        </div>
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Escrow Bonds</span>
          <p className="text-xl font-black text-emerald-600 mt-1">1 Verified</p>
        </div>
      </div>

      {/* Historical Invoicing Ledger Sheet Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="pb-3 pl-4">Payment Reference</th>
              <th className="pb-3">Line Description</th>
              <th className="pb-3">Gateway Source</th>
              <th className="pb-3">Value Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-4 text-right">Settlement Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
            {ledgers.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                
                {/* ID reference cell */}
                <td className="py-4 Richmond pl-4">
                  <div className="font-bold text-gray-900 font-mono">{item.id}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[160px] mt-0.5">{item.property}</div>
                </td>
                
                {/* Billing Type Classification */}
                <td className="py-4 text-gray-900 font-bold">{item.type}</td>
                
                {/* Channel processing source */}
                <td className="py-4 text-gray-400">{item.method}</td>
                
                {/* Cost value amounts */}
                <td className="py-4 font-black text-gray-900">{item.amount}</td>
                
                {/* Verification Checkmark Badges */}
                <td className="py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                    <CheckCircle2 className="h-3 w-3" /> {item.status}
                  </span>
                </td>
                
                {/* Timestamps */}
                <td className="py-4 pr-4 text-right text-gray-400 font-semibold">{item.date}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
