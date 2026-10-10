import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Building2,
  CreditCard,
  IndianRupee,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export default function Reports() {
  const [reportType, setReportType] = useState("Overview");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [generated, setGenerated] = useState(false);

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // Convert backend response to array
  // ========================================
  const extractArray = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.transactions)) {
      return data.transactions;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // ========================================
  // Fetch Users
  // ========================================
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/users"
      );

      setUsers(extractArray(response));
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setUsers([]);
    }
  };

  // ========================================
  // Fetch Properties
  // ========================================
  const fetchProperties = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/properties"
      );

      setProperties(extractArray(response));
    } catch (err) {
      console.error(
        "Failed to load properties:",
        err
      );

      setProperties([]);
    }
  };

  // ========================================
  // Fetch Admin Transactions
  // ========================================
  // IMPORTANT:
  // Transactions page already uses this endpoint:
  //
  // GET /api/transactions/admin
  //
  // So Reports must use the same working endpoint.
  // ========================================
  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/transactions/admin"
      );

      const data = extractArray(response);

      setTransactions(data);
    } catch (err) {
      console.error(
        "Failed to load admin transactions:",
        err
      );

      setTransactions([]);
    }
  };

  // ========================================
  // Payments
  // ========================================
  // Payment GET endpoint is not available.
  // Revenue is calculated from completed
  // PROPERTY_PURCHASE transactions instead.
  // ========================================
  const fetchPayments = async () => {
    setPayments([]);
  };

  // ========================================
  // Fetch all report data
  // ========================================
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchUsers(),
        fetchProperties(),
        fetchTransactions(),
        fetchPayments(),
      ]);
    } catch (err) {
      console.error(
        "Error fetching report data:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view report data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // ========================================
  // Safely convert amount to number
  // ========================================
  const getAmount = (value) => {
    const amount = Number(value);

    return Number.isFinite(amount)
      ? amount
      : 0;
  };

  // ========================================
  // Get transaction date
  // ========================================
  const getItemDate = (item) => {
    return (
      item?.createdAt ||
      item?.transactionDate ||
      item?.date ||
      item?.updatedAt ||
      null
    );
  };

  // ========================================
  // Check selected date range
  // ========================================
  const isWithinDateRange = (item) => {
    const itemDate = getItemDate(item);

    if (!itemDate) {
      return true;
    }

    const date = new Date(itemDate);

    if (Number.isNaN(date.getTime())) {
      return true;
    }

    if (fromDate) {
      const startDate = new Date(
        `${fromDate}T00:00:00`
      );

      if (date < startDate) {
        return false;
      }
    }

    if (toDate) {
      const endDate = new Date(
        `${toDate}T23:59:59`
      );

      if (date > endDate) {
        return false;
      }
    }

    return true;
  };

  // ========================================
  // Filter transactions by date
  // ========================================
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      isWithinDateRange
    );
  }, [
    transactions,
    fromDate,
    toDate,
  ]);

  // ========================================
  // Completed / Sold transactions
  // ========================================
  const completedTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (transaction) =>
        String(
          transaction?.transactionType || ""
        ).toUpperCase() === "PROPERTY_PURCHASE"
    );
  }, [filteredTransactions]);

  // ========================================
  // Failed transactions
  // ========================================
  const failedTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (transaction) =>
        String(
          transaction?.transactionType || ""
        ).toUpperCase() === "REFUND"
    );
  }, [filteredTransactions]);

  // ========================================
  // Pending transactions
  // ========================================
  const pendingTransactions = useMemo(() => {
    return filteredTransactions.filter((transaction) => {
      const type = String(
        transaction?.transactionType || ""
      ).toUpperCase();

      return (
        type !== "PROPERTY_PURCHASE" &&
        type !== "REFUND"
      );
    });
  }, [filteredTransactions]);

  // ========================================
  // Statistics
  // ========================================
  const totalUsers = users.length;

  const totalProperties =
    properties.length;

  const totalTransactions =
    filteredTransactions.length;

  // ========================================
  // Sold properties / completed purchases
  // ========================================
  const totalSold =
    completedTransactions.length;

  // ========================================
  // Transaction revenue
  // ========================================
  const transactionRevenue =
    completedTransactions.reduce(
      (total, transaction) =>
        total +
        getAmount(
          transaction?.amount
        ),
      0
    );

  // ========================================
  // Payment revenue
  // ========================================
  const paymentRevenue =
    payments.reduce(
      (total, payment) =>
        total +
        getAmount(
          payment?.amount
        ),
      0
    );

  // ========================================
  // Total revenue
  // ========================================
  // Since /api/payments does not support GET,
  // use completed PROPERTY_PURCHASE transactions.
  // ========================================
  const totalRevenue =
    transactionRevenue > 0
      ? transactionRevenue
      : paymentRevenue;

  // ========================================
  // Format Indian currency
  // ========================================
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  // ========================================
  // Export data
  // ========================================
  const reportData = [
    ["Report", "Value"],
    ["Report Type", reportType],
    [
      "From Date",
      fromDate || "All",
    ],
    [
      "To Date",
      toDate || "All",
    ],
    [
      "Total Users",
      totalUsers,
    ],
    [
      "Total Properties",
      totalProperties,
    ],
    [
      "Total Transactions",
      totalTransactions,
    ],
    [
      "Sold Properties",
      totalSold,
    ],
    [
      "Completed Transactions",
      completedTransactions.length,
    ],
    [
      "Pending Transactions",
      pendingTransactions.length,
    ],
    [
      "Failed Transactions",
      failedTransactions.length,
    ],
    [
      "Revenue",
      totalRevenue,
    ],
  ];

  // ========================================
  // Generate report
  // ========================================
  const handleGenerateReport = () => {
    if (
      fromDate &&
      toDate &&
      new Date(fromDate) >
        new Date(toDate)
    ) {
      alert(
        "From Date cannot be later than To Date."
      );

      return;
    }

    setGenerated(true);
  };

  // ========================================
  // Export CSV
  // ========================================
  const handleExport = () => {
    if (loading || error) {
      return;
    }

    const csvContent =
      reportData
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `admin-${reportType
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        )}-report.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );
  };

  // ========================================
  // Retry
  // ========================================
  const handleRetry = () => {
    fetchReportData();
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div
        className="flex flex-col md:flex-row
        md:items-center md:justify-between
        gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Generate and download system reports
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center
            justify-center gap-2
            px-4 py-2.5 rounded-lg
            border border-gray-300
            text-gray-700
            hover:bg-gray-50
            disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={
              loading || !!error
            }
            className="flex items-center
            justify-center gap-2
            px-4 py-2.5 rounded-lg
            border border-gray-300
            text-gray-700
            hover:bg-gray-50
            disabled:opacity-50"
          >
            <Download className="w-4 h-4" />

            Export Report
          </button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 border
          border-red-200 rounded-xl
          p-4 mb-6 flex items-center
          justify-between gap-4"
        >
          <div className="flex items-center gap-3">

            <AlertCircle
              className="w-5 h-5 text-red-600"
            />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>

          <button
            onClick={handleRetry}
            className="px-3 py-2
            bg-red-600 text-white
            rounded-lg text-sm
            hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          className="bg-white border
          rounded-xl p-12 text-center"
        >
          <div
            className="w-9 h-9 border-4
            border-purple-200
            border-t-purple-600
            rounded-full animate-spin mx-auto"
          />

          <p className="text-sm text-gray-500 mt-4">
            Loading report data from backend...
          </p>
        </div>
      ) : (
        <>
          {/* Report Statistics */}
          <div
            className="grid grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4 gap-4 mb-6"
          >

            {/* Users */}
            <div
              className="bg-white
              border rounded-xl p-5"
            >
              <div
                className="flex items-center
                justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    Total Users
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {totalUsers.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div
                  className="w-10 h-10
                  rounded-lg bg-blue-100
                  flex items-center
                  justify-center"
                >
                  <Users
                    className="w-5 h-5 text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Properties */}
            <div
              className="bg-white
              border rounded-xl p-5"
            >
              <div
                className="flex items-center
                justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    Properties
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {totalProperties.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div
                  className="w-10 h-10
                  rounded-lg bg-purple-100
                  flex items-center
                  justify-center"
                >
                  <Building2
                    className="w-5 h-5 text-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div
              className="bg-white
              border rounded-xl p-5"
            >
              <div
                className="flex items-center
                justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    Transactions
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {totalTransactions.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    {totalSold} Sold
                  </p>
                </div>

                <div
                  className="w-10 h-10
                  rounded-lg bg-green-100
                  flex items-center
                  justify-center"
                >
                  <CreditCard
                    className="w-5 h-5 text-green-600"
                  />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div
              className="bg-white
              border rounded-xl p-5"
            >
              <div
                className="flex items-center
                justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    Revenue
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(
                      totalRevenue
                    )}
                  </p>
                </div>

                <div
                  className="w-10 h-10
                  rounded-lg bg-amber-100
                  flex items-center
                  justify-center"
                >
                  <IndianRupee
                    className="w-5 h-5 text-amber-600"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Generate Report */}
          <div
            className="bg-white
            border rounded-xl p-6 mb-6"
          >
            <div
              className="flex items-center
              gap-3 mb-5"
            >
              <div
                className="w-10 h-10
                rounded-lg bg-purple-100
                flex items-center
                justify-center"
              >
                <BarChart3
                  className="w-5 h-5
                  text-purple-600"
                />
              </div>

              <div>
                <h2
                  className="text-lg
                  font-semibold text-gray-900"
                >
                  Generate Report
                </h2>

                <p className="text-sm text-gray-500">
                  Select report type and date range
                </p>
              </div>
            </div>

            <div
              className="grid grid-cols-1
              md:grid-cols-3 gap-4"
            >

              {/* Report Type */}
              <div>
                <label
                  className="block text-sm
                  font-medium text-gray-700 mb-1"
                >
                  Report Type
                </label>

                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(
                      e.target.value
                    );

                    setGenerated(false);
                  }}
                  className="w-full border
                  border-gray-300 rounded-lg
                  px-3 py-2.5
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-500"
                >
                  <option value="Overview">
                    Overview
                  </option>

                  <option value="Users">
                    Users
                  </option>

                  <option value="Properties">
                    Properties
                  </option>

                  <option value="Transactions">
                    Transactions
                  </option>

                  <option value="Payments">
                    Payments
                  </option>

                  <option value="Reviews">
                    Reviews
                  </option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label
                  className="block text-sm
                  font-medium text-gray-700 mb-1"
                >
                  From Date
                </label>

                <div className="relative">
                  <Calendar
                    className="absolute
                    left-3 top-1/2
                    -translate-y-1/2
                    w-4 h-4 text-gray-400"
                  />

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(
                        e.target.value
                      );

                      setGenerated(false);
                    }}
                    className="w-full border
                    border-gray-300
                    rounded-lg pl-10 pr-3
                    py-2.5
                    focus:outline-none
                    focus:ring-2
                    focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <label
                  className="block text-sm
                  font-medium text-gray-700 mb-1"
                >
                  To Date
                </label>

                <div className="relative">
                  <Calendar
                    className="absolute
                    left-3 top-1/2
                    -translate-y-1/2
                    w-4 h-4 text-gray-400"
                  />

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(
                        e.target.value
                      );

                      setGenerated(false);
                    }}
                    className="w-full border
                    border-gray-300
                    rounded-lg pl-10 pr-3
                    py-2.5
                    focus:outline-none
                    focus:ring-2
                    focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end mt-5">
              <button
                onClick={
                  handleGenerateReport
                }
                className="flex items-center
                gap-2 bg-purple-600
                text-white px-5 py-2.5
                rounded-lg
                hover:bg-purple-700"
              >
                <FileText className="w-4 h-4" />

                Generate Report
              </button>
            </div>

            {/* Generated Message */}
            {generated && (
              <div
                className="mt-4 p-4 rounded-lg
                bg-green-50
                border border-green-200
                text-green-700 text-sm"
              >
                <p className="font-medium">
                  {reportType} report generated successfully.
                </p>

                <p className="mt-1">
                  Users: {totalUsers} | Properties:{" "}
                  {totalProperties} | Transactions:{" "}
                  {totalTransactions} | Sold:{" "}
                  {totalSold} | Revenue:{" "}
                  {formatCurrency(
                    totalRevenue
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Report Summary */}
          <div
            className="bg-white border
            rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">

              <div
                className="w-10 h-10
                rounded-lg bg-gray-100
                flex items-center
                justify-center"
              >
                <FileText
                  className="w-5 h-5
                  text-gray-600"
                />
              </div>

              <div>
                <h2
                  className="text-lg
                  font-semibold text-gray-900"
                >
                  Current Report Data
                </h2>

                <p className="text-sm text-gray-500">
                  Data retrieved directly from the backend
                </p>
              </div>
            </div>

            <div
              className="grid grid-cols-1
              md:grid-cols-2
              lg:grid-cols-4 gap-4"
            >

              <div
                className="border rounded-lg
                p-4"
              >
                <p className="text-xs text-gray-500">
                  Users
                </p>

                <p className="text-lg font-semibold mt-1">
                  {totalUsers}
                </p>
              </div>

              <div
                className="border rounded-lg
                p-4"
              >
                <p className="text-xs text-gray-500">
                  Properties
                </p>

                <p className="text-lg font-semibold mt-1">
                  {totalProperties}
                </p>
              </div>

              <div
                className="border rounded-lg
                p-4"
              >
                <p className="text-xs text-gray-500">
                  Sold
                </p>

                <p className="text-lg font-semibold mt-1 text-green-600">
                  {totalSold}
                </p>
              </div>

              <div
                className="border rounded-lg
                p-4"
              >
                <p className="text-xs text-gray-500">
                  Revenue
                </p>

                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(
                    totalRevenue
                  )}
                </p>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
