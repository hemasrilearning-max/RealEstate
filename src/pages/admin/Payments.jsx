import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  X,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { useData } from "../../context/DataContext";

export default function Payments() {
  const { properties = [] } = useData();

  const [search, setSearch] = useState("");

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
    loadUsers();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        "/api/payments/admin"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content ||
          response.data?.data ||
          response.data?.payments ||
          [];

      setPayments(data);
    } catch (err) {
      console.error("Failed to load payments:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/users"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content ||
          response.data?.data ||
          response.data?.users ||
          [];

      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "₹0";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return `₹${amount}`;
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    const value = String(status).toUpperCase();

    switch (value) {
      case "SUCCESS":
        return "Completed";

      case "COMPLETED":
        return "Completed";

      case "PENDING":
        return "Pending";

      case "CREATED":
        return "Pending";

      case "FAILED":
        return "Failed";

      case "REFUNDED":
        return "Refunded";

      default:
        return String(status)
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  const getPaymentMethod = (payment) => {
    if (!payment?.paymentMethod) {
      return "—";
    }

    return String(payment.paymentMethod)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getBuyer = (buyerId) => {
    if (
      buyerId === null ||
      buyerId === undefined
    ) {
      return null;
    }

    return (
      users.find(
        (user) =>
          Number(user.id) === Number(buyerId)
      ) || null
    );
  };

  const getBuyerName = (buyerId) => {
    const buyer = getBuyer(buyerId);

    if (!buyer) {
      return "Buyer";
    }

    const fullName = [
      buyer.firstName,
      buyer.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      buyer.username ||
      buyer.email ||
      `Buyer #${buyerId}`
    );
  };

  const getProperty = (propertyId) => {
    if (
      propertyId === null ||
      propertyId === undefined
    ) {
      return null;
    }

    return (
      properties.find(
        (property) =>
          Number(
            property.id ?? property.propertyId
          ) === Number(propertyId)
      ) || null
    );
  };

  const getPropertyName = (propertyId) => {
    const property = getProperty(propertyId);

    if (!property) {
      return `Property #${propertyId ?? "—"}`;
    }

    return (
      property.title ||
      property.name ||
      property.propertyName ||
      property.propertyTitle ||
      `Property #${propertyId}`
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    const paymentId = String(
      payment.id ?? ""
    ).toLowerCase();

    const buyerId = String(
      payment.buyerId ?? ""
    ).toLowerCase();

    const buyerName = getBuyerName(
      payment.buyerId
    ).toLowerCase();

    const propertyId = String(
      payment.propertyId ?? ""
    ).toLowerCase();

    const propertyName = getPropertyName(
      payment.propertyId
    ).toLowerCase();

    const method = String(
      payment.paymentMethod ?? ""
    ).toLowerCase();

    const status = String(
      payment.status ?? ""
    ).toLowerCase();

    const razorpayOrderId = String(
      payment.razorpayOrderId ?? ""
    ).toLowerCase();

    const razorpayPaymentId = String(
      payment.razorpayPaymentId ?? ""
    ).toLowerCase();

    return (
      paymentId.includes(value) ||
      buyerId.includes(value) ||
      buyerName.includes(value) ||
      propertyId.includes(value) ||
      propertyName.includes(value) ||
      method.includes(value) ||
      status.includes(value) ||
      razorpayOrderId.includes(value) ||
      razorpayPaymentId.includes(value)
    );
  });

  const completed = payments.filter((payment) => {
    const status = String(
      payment.status || ""
    ).toUpperCase();

    return (
      status === "SUCCESS" ||
      status === "COMPLETED"
    );
  }).length;

  const pending = payments.filter((payment) => {
    const status = String(
      payment.status || ""
    ).toUpperCase();

    return (
      status === "PENDING" ||
      status === "CREATED"
    );
  }).length;

  const refunded = payments.filter((payment) => {
    const status = String(
      payment.status || ""
    ).toUpperCase();

    return status === "REFUNDED";
  }).length;

  const getStatusIcon = (status) => {
    const normalizedStatus =
      String(status || "").toUpperCase();

    if (
      normalizedStatus === "SUCCESS" ||
      normalizedStatus === "COMPLETED"
    ) {
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-4 h-4" />
          Completed
        </span>
      );
    }

    if (
      normalizedStatus === "PENDING" ||
      normalizedStatus === "CREATED"
    ) {
      return (
        <span className="flex items-center gap-1 text-xs text-orange-500">
          <Clock className="w-4 h-4" />
          Pending
        </span>
      );
    }

    if (normalizedStatus === "FAILED") {
      return (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <XCircle className="w-4 h-4" />
          Failed
        </span>
      );
    }

    if (normalizedStatus === "REFUNDED") {
      return (
        <span className="flex items-center gap-1 text-xs text-purple-600">
          <RotateCcw className="w-4 h-4" />
          Refunded
        </span>
      );
    }

    return (
      <span className="text-xs text-gray-500">
        {formatStatus(status)}
      </span>
    );
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payments
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor payments and payment activity
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
          <p className="text-sm font-bold text-gray-500">
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

      {/* Loading */}
      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">
            Loading payments...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPayments}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payment Cards */}
      {!loading && !error && (
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
                    PAY
                    {String(payment.id).padStart(3, "0")}
                  </p>
                </div>

                {getStatusIcon(payment.status)}

              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">

                <div>
                  <p className="text-xs text-gray-400">
                    User
                  </p>

                  <p className="text-sm font-medium text-gray-800">
                    {getBuyerName(payment.buyerId)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Property
                  </p>

                  <p className="text-sm text-gray-700">
                    {getPropertyName(payment.propertyId)}
                  </p>
                </div>

                <div className="flex justify-between">

                  <div>
                    <p className="text-xs text-gray-400">
                      Amount
                    </p>

                    <p className="font-semibold text-purple-600">
                      {formatAmount(payment.amount)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Method
                    </p>

                    <p className="text-sm text-gray-600">
                      {getPaymentMethod(payment)}
                    </p>
                  </div>

                </div>

                <p className="text-xs text-gray-400">
                  {formatDate(payment.createdAt)}
                </p>

              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPayment(payment)
                  }
                  className="flex items-center gap-2
                  text-sm text-gray-600
                  hover:text-purple-600"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* No Payments */}
      {!loading &&
        !error &&
        filteredPayments.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No payments found.
            </p>
          </div>
        )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 p-4"
          onClick={() => setSelectedPayment(null)}
        >

          <div
            className="bg-white rounded-2xl shadow-xl
            w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div
              className="flex items-center justify-between
              px-6 py-4 border-b"
            >

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Details
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  PAY
                  {String(selectedPayment.id).padStart(3, "0")}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="p-2 rounded-lg
                text-gray-500 hover:text-gray-800
                hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4">

                <p className="text-xs text-gray-400 mb-2">
                  Payment Status
                </p>

                {getStatusIcon(
                  selectedPayment.status
                )}

              </div>

              {/* Payment Information */}
              <div>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Information
                </h3>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Payment ID
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      PAY
                      {String(selectedPayment.id).padStart(
                        3,
                        "0"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Amount
                    </span>

                    <span className="text-sm font-semibold text-purple-600">
                      {formatAmount(
                        selectedPayment.amount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Payment Method
                    </span>

                    <span className="text-sm text-gray-900">
                      {getPaymentMethod(
                        selectedPayment
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Created At
                    </span>

                    <span className="text-sm text-gray-900 text-right">
                      {formatDateTime(
                        selectedPayment.createdAt
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Updated At
                    </span>

                    <span className="text-sm text-gray-900 text-right">
                      {formatDateTime(
                        selectedPayment.updatedAt
                      )}
                    </span>
                  </div>

                </div>

              </div>

              {/* Purchase Information */}
              <div>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Purchase Information
                </h3>

                <div className="space-y-4">

                  {/* Buyer */}
                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-400">
                      Buyer
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {getBuyerName(
                        selectedPayment.buyerId
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Buyer ID:{" "}
                      <span className="font-medium">
                        {selectedPayment.buyerId ?? "—"}
                      </span>
                    </p>

                  </div>

                  {/* Property */}
                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-400">
                      Property
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {getPropertyName(
                        selectedPayment.propertyId
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Property ID:{" "}
                      <span className="font-medium">
                        {selectedPayment.propertyId ?? "—"}
                      </span>
                    </p>

                  </div>

                </div>

              </div>

              {/* Razorpay Information */}
              <div>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Gateway
                </h3>

                <div className="space-y-3">

                  <div>
                    <p className="text-xs text-gray-400">
                      Razorpay Order ID
                    </p>

                    <p className="text-sm text-gray-800 break-all mt-1">
                      {selectedPayment.razorpayOrderId ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Razorpay Payment ID
                    </p>

                    <p className="text-sm text-gray-800 break-all mt-1">
                      {selectedPayment.razorpayPaymentId ||
                        "—"}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-4 border-t flex justify-end"
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="px-4 py-2 bg-gray-100
                text-gray-700 rounded-lg
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