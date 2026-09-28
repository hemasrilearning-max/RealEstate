import React, { useState } from "react";
import {
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Wallet,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BuyerPayments() {
  const navigate = useNavigate();

  const [ledgers] = useState([
    {
      id: "PAY-1104",
      type: "Security Deposit",
      property: "Modern 3 BHK Apartment - Whitefield",
      amount: "₹1,50,000",
      numericAmount: 150000,
      method: "NetBanking Transfer",
      status: "Paid",
      date: "Sep 05, 2026",
    },
    {
      id: "PAY-0982",
      type: "Token Booking Fee",
      property: "Luxury 4 BHK Villa - Sarjapur",
      amount: "₹25,000",
      numericAmount: 25000,
      method: "UPI AutoPay",
      status: "Paid",
      date: "Aug 28, 2026",
    },
    {
      id: "PAY-0411",
      type: "Application Verification Fee",
      property: "3 BHK House - HSR Layout",
      amount: "₹1,200",
      numericAmount: 1200,
      method: "Credit Card",
      status: "Paid",
      date: "Aug 15, 2026",
    },
  ]);

  const totalPaid = ledgers.reduce(
    (total, item) => total + item.numericAmount,
    0
  );

  const pendingAmount = 0;

  const verifiedPayments = ledgers.filter(
    (item) => item.status === "Paid"
  ).length;

  const handleReceipt = (paymentId) => {
    window.alert(
      `Receipt ${paymentId} will be available once payment documents are connected to the backend.`
    );
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-5rem)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-emerald-600" />
                Payments & Receipts
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                View your property payments, transaction history, and
                digital receipts.
              </p>
            </div>

            <button
              onClick={() => navigate("/properties")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4" />
              Browse Properties
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total Paid
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{totalPaid.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              Across {ledgers.length} recorded transactions
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Pending Dues
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{pendingAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              No outstanding payment demands
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Verified Payments
                </p>

                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {verifiedPayments}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              Successfully recorded transactions
            </p>
          </div>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Payment History
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Your property-related payment transactions and receipts.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Secure Transactions
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-4 pl-6">
                    Payment Reference
                  </th>

                  <th className="py-4">
                    Description
                  </th>

                  <th className="py-4">
                    Payment Method
                  </th>

                  <th className="py-4">
                    Amount
                  </th>

                  <th className="py-4">
                    Status
                  </th>

                  <th className="py-4">
                    Date
                  </th>

                  <th className="py-4 pr-6 text-right">
                    Receipt
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                {ledgers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 pl-6">
                      <div className="font-bold text-gray-900 font-mono">
                        {item.id}
                      </div>

                      <div className="text-[10px] text-gray-400 truncate max-w-[190px] mt-1">
                        {item.property}
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="font-semibold text-gray-900">
                        {item.type}
                      </span>
                    </td>

                    <td className="py-4 text-gray-500">
                      {item.method}
                    </td>

                    <td className="py-4 font-bold text-gray-900">
                      {item.amount}
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 text-gray-500">
                      {item.date}
                    </td>

                    <td className="py-4 pr-6 text-right">
                      <button
                        onClick={() => handleReceipt(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Receipt
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="lg:hidden p-4 space-y-4">
            {ledgers.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 font-mono text-sm">
                      {item.id}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-1">
                      {item.date}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-900">
                    {item.type}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.property}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Amount
                    </p>

                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {item.amount}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Method
                    </p>

                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      {item.method}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReceipt(item.id)}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  View Receipt
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {ledgers.length === 0 && (
            <div className="py-16 text-center">
              <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />

              <h3 className="font-semibold text-gray-900">
                No payments found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Your property payment history will appear here.
              </p>
            </div>
          )}
        </div>

        {/* SECURITY INFORMATION */}
        <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />

            <div>
              <p className="text-xs font-semibold text-emerald-800">
                Payment security
              </p>

              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Payment information and transaction records are
                intended to be securely handled through the HomeSpace
                payment system. Actual gateway processing and receipt
                downloads will be connected to the backend payment
                service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
