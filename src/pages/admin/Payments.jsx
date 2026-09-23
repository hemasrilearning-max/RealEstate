import { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";

export default function Payments() {
  const [search, setSearch] = useState("");

  const [payments] = useState([
    {
      id: "PAY001",
      user: "Rahul Sharma",
      property: "Luxury 3 BHK Apartment",
      amount: "₹85,00,000",
      date: "18 Sep 2026",
      method: "UPI",
      status: "Completed",
    },
    {
      id: "PAY002",
      user: "Priya N",
      property: "2 BHK Flat in Whitefield",
      amount: "₹45,000",
      date: "17 Sep 2026",
      method: "Card",
      status: "Pending",
    },
    {
      id: "PAY003",
      user: "Arjun Kumar",
      property: "4 BHK Villa",
      amount: "₹1,20,00,000",
      date: "16 Sep 2026",
      method: "Bank Transfer",
      status: "Completed",
    },
    {
      id: "PAY004",
      user: "Sneha Rao",
      property: "1 BHK Apartment",
      amount: "₹28,00,000",
      date: "15 Sep 2026",
      method: "UPI",
      status: "Failed",
    },
    {
      id: "PAY005",
      user: "Kiran S",
      property: "3 BHK Independent House",
      amount: "₹72,00,000",
      date: "14 Sep 2026",
      method: "Card",
      status: "Refunded",
    },
    {
      id: "PAY006",
      user: "Ananya R",
      property: "2 BHK Furnished Flat",
      amount: "₹38,000",
      date: "13 Sep 2026",
      method: "UPI",
      status: "Completed",
    },
  ]);

  const filteredPayments = payments.filter((payment) => {
    const value = search.toLowerCase();

    return (
      payment.id.toLowerCase().includes(value) ||
      payment.user.toLowerCase().includes(value) ||
      payment.property.toLowerCase().includes(value) ||
      payment.method.toLowerCase().includes(value)
    );
  });

  const completed = payments.filter(
    (p) => p.status === "Completed"
  ).length;

  const pending = payments.filter(
    (p) => p.status === "Pending"
  ).length;

  const refunded = payments.filter(
    (p) => p.status === "Refunded"
  ).length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payments
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor payments, refunds and invoices
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {payments.length} Payments
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {completed}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="text-2xl font-bold text-orange-500 mt-1">
            {pending}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Refunded
          </p>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {refunded}
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="bg-white border rounded-xl p-4 mb-6">

        <div className="relative">

          <Search
            className="absolute left-3 top-1/2
            -translate-y-1/2 w-5 h-5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search payment, user, property or method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>

      </div>

      {/* Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredPayments.map((payment) => (

          <div
            key={payment.id}
            className="bg-white border rounded-xl
            p-4 hover:shadow-md transition"
          >

            {/* Top */}
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-400">
                  Payment ID
                </p>

                <p className="font-semibold text-gray-900">
                  {payment.id}
                </p>
              </div>

              {payment.status === "Completed" && (
                <span className="flex items-center gap-1
                  text-xs text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}

              {payment.status === "Pending" && (
                <span className="flex items-center gap-1
                  text-xs text-orange-500">
                  <Clock className="w-4 h-4" />
                  Pending
                </span>
              )}

              {payment.status === "Failed" && (
                <span className="flex items-center gap-1
                  text-xs text-red-600">
                  <XCircle className="w-4 h-4" />
                  Failed
                </span>
              )}

              {payment.status === "Refunded" && (
                <span className="flex items-center gap-1
                  text-xs text-purple-600">
                  <RotateCcw className="w-4 h-4" />
                  Refunded
                </span>
              )}

            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">

              <div>
                <p className="text-xs text-gray-400">
                  User
                </p>

                <p className="text-sm font-medium text-gray-800">
                  {payment.user}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Property
                </p>

                <p className="text-sm text-gray-700">
                  {payment.property}
                </p>
              </div>

              <div className="flex justify-between">

                <div>
                  <p className="text-xs text-gray-400">
                    Amount
                  </p>

                  <p className="font-semibold text-purple-600">
                    {payment.amount}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Method
                  </p>

                  <p className="text-sm text-gray-600">
                    {payment.method}
                  </p>
                </div>

              </div>

              <p className="text-xs text-gray-400">
                {payment.date}
              </p>

            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t flex gap-4">

              <button
                className="flex items-center gap-2
                text-sm text-gray-600
                hover:text-purple-600"
              >
                <Eye className="w-4 h-4" />
                View
              </button>

              <button
                className="text-sm text-gray-600
                hover:text-purple-600"
              >
                Invoice
              </button>

              {payment.status === "Completed" && (
                <button
                  className="text-sm text-gray-600
                  hover:text-red-600"
                >
                  Refund
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

      {filteredPayments.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            No payments found.
          </p>
        </div>
      )}

    </div>
  );
}