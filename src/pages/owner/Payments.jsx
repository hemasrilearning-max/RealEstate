import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function OwnerPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get("/api/payments/my");

        if (!mounted) return;

        const payments = Array.isArray(response.data)
          ? response.data
          : [];

        const mappedTransactions = payments.map((payment) => ({
          id:
            payment.razorpayPaymentId ||
            payment.razorpayOrderId ||
            `PAY-${payment.id}`,

          tenant:
            payment.buyerName ||
            payment.buyerUsername ||
            payment.buyerEmail ||
            `Buyer #${payment.buyerId ?? "-"}`,

          property:
            payment.propertyTitle ||
            `Property #${payment.propertyId ?? "-"}`,

          item: "Property Purchase",

          amount: formatCurrency(payment.amount),

          date: formatDate(payment.createdAt),

          status: formatStatus(payment.status),

          channel:
            payment.paymentMethod ||
            "Razorpay Gateway",
        }));

        setTransactions(mappedTransactions);
      } catch (err) {
        console.error("Failed to load owner payments:", err);

        if (!mounted) return;

        setTransactions([]);
        setError(
          err?.response?.data?.message ||
            "Unable to load payment records."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      mounted = false;
    };
  }, []);

  const statusColors = {
    Successful:
      "bg-green-50 text-green-600 border-green-200",

    Pending:
      "bg-amber-50 text-amber-600 border-amber-200",

    Failed:
      "bg-red-50 text-red-600 border-red-200",
  };

  const grossPayouts = useMemo(() => {
    return transactions
      .filter((txn) => txn.status === "Successful")
      .reduce(
        (total, txn) => total + parseCurrency(txn.amount),
        0
      );
  }, [transactions]);

  const pendingAmount = useMemo(() => {
    return transactions
      .filter((txn) => txn.status === "Pending")
      .reduce(
        (total, txn) => total + parseCurrency(txn.amount),
        0
      );
  }, [transactions]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Module Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Payments & Ledgers
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Audit historical rent statements and transactional billing items.
          </p>
        </div>

        {/* Quick Statement Export Action Link Trigger */}
        <button className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors self-start">
          📥 Export Account Statement
        </button>
      </div>

      {/* Interactive Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Gross Payouts (Month)
          </span>

          <p className="text-2xl font-black text-gray-900 mt-1">
            {formatCurrency(grossPayouts)}
          </p>
        </div>

        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Pending Approvals
          </span>

          <p className="text-2xl font-black text-amber-600 mt-1">
            {formatCurrency(pendingAmount)}
          </p>
        </div>

        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Active Leases Invoiced
          </span>

          <p className="text-2xl font-black text-rose-500 mt-1">
            0 / 0
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Transaction Records Table Column View Grid */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="pb-3 pl-4">
                Transaction ID / Asset
              </th>

              <th className="pb-3">
                Payer Account
              </th>

              <th className="pb-3">
                Description
              </th>

              <th className="pb-3">
                Value
              </th>

              <th className="pb-3">
                Status
              </th>

              <th className="pb-3 pr-4 text-right">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-10 text-center text-sm text-gray-400"
                >
                  Loading payment records...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-10 text-center text-sm text-gray-400"
                >
                  No payment records found.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-gray-50/30 transition-colors"
                >
                  {/* ID Mapping reference */}
                  <td className="py-4 pl-4">
                    <div className="font-bold text-gray-900">
                      {txn.id}
                    </div>

                    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                      {txn.property}
                    </div>
                  </td>

                  {/* Tenant User Name */}
                  <td className="py-4 font-medium text-gray-700">
                    {txn.tenant}
                  </td>

                  {/* Line Item Specific Details */}
                  <td className="py-4 text-gray-500">
                    <div className="text-gray-800 font-medium">
                      {txn.item}
                    </div>

                    <div className="text-[10px] text-gray-400">
                      {txn.channel}
                    </div>
                  </td>

                  {/* Currency Values */}
                  <td className="py-4 font-bold text-gray-900">
                    {txn.amount}
                  </td>

                  {/* Status Badges */}
                  <td className="py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                        statusColors[txn.status] ||
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  {/* Timestamps */}
                  <td className="py-4 pr-4 text-right text-xs text-gray-500 font-medium">
                    {txn.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatStatus(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "SUCCESS":
    case "SUCCESSFUL":
      return "Successful";

    case "CREATED":
    case "PENDING":
      return "Pending";

    case "FAILED":
      return "Failed";

    default:
      return status || "Pending";
  }
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  const number = Number(value) || 0;

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function parseCurrency(value) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number(
    String(value).replace(/[₹,\s]/g, "")
  ) || 0;
}
