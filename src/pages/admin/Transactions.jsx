import { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export default function Transactions() {
  const [search, setSearch] = useState("");

  const [transactions] = useState([
    {
      id: "TXN001",
      buyer: "Rahul Sharma",
      property: "Luxury 3 BHK Apartment",
      amount: "₹85,00,000",
      date: "18 Sep 2026",
      status: "Completed",
    },
    {
      id: "TXN002",
      buyer: "Priya N",
      property: "2 BHK Flat in Whitefield",
      amount: "₹45,000",
      date: "17 Sep 2026",
      status: "Pending",
    },
    {
      id: "TXN003",
      buyer: "Arjun Kumar",
      property: "4 BHK Villa",
      amount: "₹1,20,00,000",
      date: "16 Sep 2026",
      status: "Completed",
    },
    {
      id: "TXN004",
      buyer: "Sneha Rao",
      property: "1 BHK Apartment",
      amount: "₹28,00,000",
      date: "15 Sep 2026",
      status: "Failed",
    },
    {
      id: "TXN005",
      buyer: "Kiran S",
      property: "3 BHK Independent House",
      amount: "₹72,00,000",
      date: "14 Sep 2026",
      status: "Completed",
    },
    {
      id: "TXN006",
      buyer: "Ananya R",
      property: "2 BHK Furnished Flat",
      amount: "₹38,000",
      date: "13 Sep 2026",
      status: "Pending",
    },
  ]);

  const filteredTransactions = transactions.filter((transaction) => {
    const value = search.toLowerCase();

    return (
      transaction.id.toLowerCase().includes(value) ||
      transaction.buyer.toLowerCase().includes(value) ||
      transaction.property.toLowerCase().includes(value)
    );
  });

  const completed = transactions.filter(
    (t) => t.status === "Completed"
  ).length;

  const pending = transactions.filter(
    (t) => t.status === "Pending"
  ).length;

  const failed = transactions.filter(
    (t) => t.status === "Failed"
  ).length;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transactions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor property transactions and their status
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {transactions.length} Transactions
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
            Failed
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {failed}
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
            placeholder="Search transaction, buyer or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300
            rounded-lg pl-10 pr-4 py-3
            focus:outline-none focus:ring-2
            focus:ring-purple-500"
          />

        </div>

      </div>

      {/* Transaction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {filteredTransactions.map((transaction) => (

          <div
            key={transaction.id}
            className="bg-white border rounded-xl
            p-4 hover:shadow-md transition"
          >

            {/* Top */}
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-400">
                  Transaction ID
                </p>

                <p className="font-semibold text-gray-900">
                  {transaction.id}
                </p>
              </div>

              {transaction.status === "Completed" && (
                <span className="flex items-center gap-1
                  text-xs text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}

              {transaction.status === "Pending" && (
                <span className="flex items-center gap-1
                  text-xs text-orange-500">
                  <Clock className="w-4 h-4" />
                  Pending
                </span>
              )}

              {transaction.status === "Failed" && (
                <span className="flex items-center gap-1
                  text-xs text-red-600">
                  <XCircle className="w-4 h-4" />
                  Failed
                </span>
              )}

            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">

              <div>
                <p className="text-xs text-gray-400">
                  Buyer
                </p>

                <p className="text-sm font-medium text-gray-800">
                  {transaction.buyer}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Property
                </p>

                <p className="text-sm text-gray-700">
                  {transaction.property}
                </p>
              </div>

              <div className="flex justify-between">

                <div>
                  <p className="text-xs text-gray-400">
                    Amount
                  </p>

                  <p className="font-semibold text-purple-600">
                    {transaction.amount}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Date
                  </p>

                  <p className="text-sm text-gray-600">
                    {transaction.date}
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom */}
            <div className="mt-4 pt-4 border-t">

              <button
                className="flex items-center gap-2
                text-sm text-gray-600
                hover:text-purple-600"
              >
                <Eye className="w-4 h-4" />
                View Transaction
              </button>

            </div>

          </div>

        ))}

      </div>

      {filteredTransactions.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            No transactions found.
          </p>
        </div>
      )}

    </div>
  );
}