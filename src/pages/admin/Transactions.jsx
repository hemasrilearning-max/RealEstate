import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  X,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { useData } from "../../context/DataContext";

function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }

  const number = Number(amount);

  if (Number.isNaN(number)) {
    return String(amount);
  }

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTransactionStatus(transaction) {
  const type = String(transaction?.transactionType || "").toUpperCase();

  if (type === "PROPERTY_PURCHASE") {
    return "Completed";
  }

  if (type === "REFUND") {
    return "Failed";
  }

  return "Pending";
}

function getTransactionTypeLabel(transactionType) {
  if (!transactionType) {
    return "—";
  }

  return String(transactionType)
    .toLowerCase()
    .split("_")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getUserName(user) {
  if (!user) {
    return "Unknown User";
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user.username ||
    user.email ||
    "Unknown User"
  );
}

function getPropertyName(property) {
  if (!property) {
    return "Unknown Property";
  }

  return (
    property.title ||
    property.name ||
    property.propertyName ||
    property.propertyTitle ||
    "Unknown Property"
  );
}

export default function Transactions() {
  const { properties } = useData();

  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionResponse, usersResponse] =
          await Promise.all([
            axiosInstance.get("/api/transactions/admin"),
            axiosInstance.get("/api/users"),
          ]);

        if (!mounted) {
          return;
        }

        const transactionData = Array.isArray(
          transactionResponse.data
        )
          ? transactionResponse.data
          : transactionResponse.data?.content ||
            transactionResponse.data?.data ||
            transactionResponse.data?.transactions ||
            [];

        const userData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data?.content ||
            usersResponse.data?.data ||
            usersResponse.data?.users ||
            [];

        setTransactions(transactionData);
        setUsers(userData);
      } catch (err) {
        console.error(
          "Failed to load admin transactions:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Failed to load transactions."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      mounted = false;
    };
  }, []);

  const getUserById = (userId) => {
    if (userId === null || userId === undefined) {
      return null;
    }

    return (
      users.find(
        (user) =>
          Number(user.id) === Number(userId)
      ) || null
    );
  };

  const getPropertyById = (propertyId) => {
    if (propertyId === null || propertyId === undefined) {
      return null;
    }

    return (
      properties?.find(
        (property) =>
          Number(property.id) === Number(propertyId)
      ) || null
    );
  };

  const getTransactionDisplayData = (transaction) => {
    const buyer = getUserById(transaction.buyerId);
    const broker = getUserById(transaction.brokerId);
    const property = getPropertyById(transaction.propertyId);

    return {
      ...transaction,
      buyer,
      broker,
      property,
      buyerName: getUserName(buyer),
      brokerName: broker
        ? getUserName(broker)
        : "No Broker",
      propertyName: getPropertyName(property),
      status: getTransactionStatus(transaction),
    };
  };

  const displayTransactions = transactions.map(
    getTransactionDisplayData
  );

  const filteredTransactions =
    displayTransactions.filter((transaction) => {
      const value = search.trim().toLowerCase();

      if (!value) {
        return true;
      }

      return (
        String(transaction.id || "")
          .toLowerCase()
          .includes(value) ||
        String(transaction.transactionReference || "")
          .toLowerCase()
          .includes(value) ||
        String(transaction.buyerName || "")
          .toLowerCase()
          .includes(value) ||
        String(transaction.propertyName || "")
          .toLowerCase()
          .includes(value) ||
        String(transaction.brokerName || "")
          .toLowerCase()
          .includes(value) ||
        String(transaction.transactionType || "")
          .toLowerCase()
          .includes(value)
      );
    });

  const completed = displayTransactions.filter(
    (transaction) =>
      transaction.status === "Completed"
  ).length;

  const pending = displayTransactions.filter(
    (transaction) =>
      transaction.status === "Pending"
  ).length;

  const failed = displayTransactions.filter(
    (transaction) =>
      transaction.status === "Failed"
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

      {/* Loading */}
      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            Loading transactions...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">
            Failed to load transactions
          </p>

          <p className="text-sm text-gray-500 mt-2">
            {String(error)}
          </p>
        </div>
      )}

      {/* Transaction Cards */}
      {!loading && !error && (
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
                    {transaction.transactionReference ||
                      `TXN${String(transaction.id).padStart(
                        3,
                        "0"
                      )}`}
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
                    {transaction.buyerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Property
                  </p>

                  <p className="text-sm text-gray-700">
                    {transaction.propertyName}
                  </p>
                </div>

                <div className="flex justify-between">

                  <div>
                    <p className="text-xs text-gray-400">
                      Amount
                    </p>

                    <p className="font-semibold text-purple-600">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Date
                    </p>

                    <p className="text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>

                </div>

              </div>

              {/* Bottom */}
              <div className="mt-4 pt-4 border-t">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTransaction(transaction)
                  }
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
      )}

      {!loading &&
        !error &&
        filteredTransactions.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No transactions found.
            </p>
          </div>
        )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-2xl shadow-xl
            w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between
              px-6 py-4 border-b">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedTransaction.transactionReference ||
                    `TXN${String(
                      selectedTransaction.id
                    ).padStart(3, "0")}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTransaction(null)
                }
                className="p-2 rounded-lg
                  text-gray-400 hover:text-gray-700
                  hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Status */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Transaction Status
                </p>

                {selectedTransaction.status === "Completed" && (
                  <span className="flex items-center gap-1
                    text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}

                {selectedTransaction.status === "Pending" && (
                  <span className="flex items-center gap-1
                    text-sm text-orange-500 font-medium">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                )}

                {selectedTransaction.status === "Failed" && (
                  <span className="flex items-center gap-1
                    text-sm text-red-600 font-medium">
                    <XCircle className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </div>

              {/* Transaction Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Transaction Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Transaction ID
                    </span>

                    <span className="text-sm font-medium text-gray-900 text-right">
                      {selectedTransaction.transactionReference ||
                        `TXN${String(
                          selectedTransaction.id
                        ).padStart(3, "0")}`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Database ID
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.id ?? "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Transaction Type
                    </span>

                    <span className="text-sm text-gray-900 text-right">
                      {getTransactionTypeLabel(
                        selectedTransaction.transactionType
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Amount
                    </span>

                    <span className="text-sm font-semibold text-purple-600">
                      {formatAmount(
                        selectedTransaction.amount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Transaction Date
                    </span>

                    <span className="text-sm text-gray-900 text-right">
                      {formatDateTime(
                        selectedTransaction.createdAt
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Buyer Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Buyer Name
                    </span>

                    <span className="text-sm font-medium text-gray-900 text-right">
                      {selectedTransaction.buyerName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Buyer ID
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.buyerId ?? "—"}
                    </span>
                  </div>

                  {selectedTransaction.buyer?.email && (
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Email
                      </span>

                      <span className="text-sm text-gray-900 text-right">
                        {selectedTransaction.buyer.email}
                      </span>
                    </div>
                  )}

                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Property Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Property
                    </span>

                    <span className="text-sm font-medium text-gray-900 text-right">
                      {selectedTransaction.propertyName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Property ID
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.propertyId ?? "—"}
                    </span>
                  </div>

                </div>
              </div>

              {/* Broker Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Broker Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Broker
                    </span>

                    <span className="text-sm font-medium text-gray-900 text-right">
                      {selectedTransaction.brokerName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Broker ID
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.brokerId ?? "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Commission %
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.brokerCommissionPercentage != null
                        ? `${selectedTransaction.brokerCommissionPercentage}%`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Commission Amount
                    </span>

                    <span className="text-sm font-semibold text-purple-600">
                      {formatAmount(
                        selectedTransaction.brokerCommissionAmount
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Payment Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Payment ID
                    </span>

                    <span className="text-sm text-gray-900">
                      {selectedTransaction.paymentId ?? "—"}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setSelectedTransaction(null)
                }
                className="px-5 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700
                  text-sm font-medium
                  hover:bg-gray-200"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
