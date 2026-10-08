import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  RefreshCw,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";

export default function Analytics() {
  const [period, setPeriod] = useState("This Month");

  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [transactionMessage, setTransactionMessage] =
    useState("");

  /*
   * ============================================================
   * LOAD ANALYTICS DATA
   * ============================================================
   */

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");
      setTransactionMessage("");

      /*
       * --------------------------------------------------------
       * 1. GET PROPERTIES
       * --------------------------------------------------------
       *
       * Your backend already has:
       *
       * GET /api/properties
       *
       * and SecurityConfig permits GET properties.
       */

      const propertiesResponse =
        await axiosInstance.get("/api/properties");

      const propertyList = Array.isArray(
        propertiesResponse.data
      )
        ? propertiesResponse.data
        : [];

      setProperties(propertyList);

      /*
       * --------------------------------------------------------
       * 2. GET TRANSACTIONS
       * --------------------------------------------------------
       *
       * Existing backend endpoint:
       *
       * GET /api/transactions/property/{propertyId}
       *
       * We do NOT allow a failure here to break the Analytics
       * page.
       */

      setTransactionLoading(true);

      const transactionResults = await Promise.all(
        propertyList.map(async (property) => {
          try {
            const response =
              await axiosInstance.get(
                `/api/transactions/property/${property.id}`
              );

            if (Array.isArray(response.data)) {
              return response.data;
            }

            return [];
          } catch (transactionError) {
            console.error(
              `Transaction API failed for property ${property.id}:`,
              transactionError
            );

            /*
             * Do not break Analytics if one property transaction
             * request is forbidden/not available.
             */
            return [];
          }
        })
      );

      /*
       * Combine all transaction arrays.
       */
      const combinedTransactions =
        transactionResults.flat();

      /*
       * Remove duplicate transactions using transaction ID.
       */
      const uniqueTransactions = Array.from(
        new Map(
          combinedTransactions
            .filter(
              (transaction) =>
                transaction &&
                transaction.id != null
            )
            .map((transaction) => [
              transaction.id,
              transaction,
            ])
        ).values()
      );

      setTransactions(uniqueTransactions);

      /*
       * If no transaction data was accessible, don't show
       * fake numbers.
       */
      if (
        propertyList.length > 0 &&
        uniqueTransactions.length === 0
      ) {
        setTransactionMessage(
          "Transaction data is not available from the current backend access."
        );
      }
    } catch (err) {
      console.error(
        "Analytics property loading error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view property analytics."
        );
      } else {
        setError(
          "Failed to load analytics data."
        );
      }
    } finally {
      setTransactionLoading(false);
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * PERIOD
   * ============================================================
   */

  const getStartDate = () => {
    const now = new Date();

    if (period === "This Month") {
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    if (period === "Last Month") {
      return new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
    }

    if (period === "Last 3 Months") {
      return new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      );
    }

    if (period === "This Year") {
      return new Date(
        now.getFullYear(),
        0,
        1
      );
    }

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  };

  const getEndDate = () => {
    const now = new Date();

    if (period === "Last Month") {
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
    }

    return now;
  };

  /*
   * ============================================================
   * FILTER TRANSACTIONS BY PERIOD
   * ============================================================
   */

  const filteredTransactions = useMemo(() => {
    const startDate = getStartDate();
    const endDate = getEndDate();

    return transactions.filter(
      (transaction) => {
        if (!transaction?.createdAt) {
          return false;
        }

        const transactionDate =
          new Date(transaction.createdAt);

        return (
          transactionDate >= startDate &&
          transactionDate <= endDate
        );
      }
    );
  }, [transactions, period]);

  /*
   * ============================================================
   * PROPERTY COUNTS
   * ============================================================
   */

  const propertyStatusCounts = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    AVAILABLE: 0,
    SOLD: 0,
    RENTED: 0,
    INACTIVE: 0,
  };

  properties.forEach((property) => {
    const status = String(
      property?.status || ""
    ).toUpperCase();

    if (
      Object.prototype.hasOwnProperty.call(
        propertyStatusCounts,
        status
      )
    ) {
      propertyStatusCounts[status]++;
    }
  });

  /*
   * ============================================================
   * REAL TRANSACTION VALUES
   * ============================================================
   */

  const totalTransactions =
    filteredTransactions.length;

  const totalRevenue =
    filteredTransactions.reduce(
      (total, transaction) => {
        return (
          total +
          Number(transaction?.amount || 0)
        );
      },
      0
    );

  const totalCommission =
    filteredTransactions.reduce(
      (total, transaction) => {
        return (
          total +
          Number(
            transaction?.brokerCommissionAmount ||
              0
          )
        );
      },
      0
    );

  const averageTransaction =
    totalTransactions > 0
      ? totalRevenue / totalTransactions
      : 0;

  /*
   * ============================================================
   * MONTHLY DATA
   * ============================================================
   */

  const monthlyData = useMemo(() => {
    const result = [];
    const now = new Date();

    let monthCount = 6;

    if (period === "This Month") {
      monthCount = 1;
    }

    if (period === "Last Month") {
      monthCount = 1;
    }

    if (period === "Last 3 Months") {
      monthCount = 3;
    }

    if (period === "This Year") {
      monthCount = 12;
    }

    for (
      let i = monthCount - 1;
      i >= 0;
      i--
    ) {
      let date;

      if (period === "Last Month") {
        date = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
      } else {
        date = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );
      }

      const year = date.getFullYear();
      const month = date.getMonth();

      const monthTransactions =
        transactions.filter(
          (transaction) => {
            if (!transaction?.createdAt) {
              return false;
            }

            const transactionDate =
              new Date(
                transaction.createdAt
              );

            return (
              transactionDate.getFullYear() ===
                year &&
              transactionDate.getMonth() ===
                month
            );
          }
        );

      const revenue =
        monthTransactions.reduce(
          (sum, transaction) =>
            sum +
            Number(
              transaction?.amount || 0
            ),
          0
        );

      result.push({
        month: date.toLocaleString(
          "en-IN",
          {
            month: "short",
          }
        ),
        transactions:
          monthTransactions.length,
        revenue,
      });
    }

    return result;
  }, [transactions, period]);

  /*
   * ============================================================
   * TOP PROPERTIES
   * ============================================================
   */

  const topProperties = useMemo(() => {
    return properties
      .map((property) => {
        const propertyTransactions =
          transactions.filter(
            (transaction) =>
              Number(
                transaction?.propertyId
              ) === Number(property.id)
          );

        const revenue =
          propertyTransactions.reduce(
            (sum, transaction) =>
              sum +
              Number(
                transaction?.amount || 0
              ),
            0
          );

        return {
          ...property,
          transactionCount:
            propertyTransactions.length,
          revenue,
        };
      })
      .filter(
        (property) =>
          property.transactionCount > 0
      )
      .sort(
        (a, b) =>
          b.transactionCount -
          a.transactionCount
      )
      .slice(0, 5);
  }, [properties, transactions]);

  /*
   * ============================================================
   * FORMATTERS
   * ============================================================
   */

  const formatNumber = (value) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(value || 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value || 0);
  };

  /*
   * ============================================================
   * EXPORT CSV
   * ============================================================
   */

  const handleExport = () => {
    const rows = [
      ["Analytics Report"],
      [],
      ["Period", period],
      [],
      ["Metric", "Value"],
      [
        "Total Properties",
        properties.length,
      ],
      [
        "Pending Properties",
        propertyStatusCounts.PENDING,
      ],
      [
        "Approved Properties",
        propertyStatusCounts.APPROVED,
      ],
      [
        "Rejected Properties",
        propertyStatusCounts.REJECTED,
      ],
      [
        "Available Properties",
        propertyStatusCounts.AVAILABLE,
      ],
      [
        "Sold Properties",
        propertyStatusCounts.SOLD,
      ],
      [
        "Rented Properties",
        propertyStatusCounts.RENTED,
      ],
      [
        "Inactive Properties",
        propertyStatusCounts.INACTIVE,
      ],
      [],
      [
        "Transactions",
        totalTransactions,
      ],
      [
        "Revenue",
        totalRevenue,
      ],
      [
        "Broker Commission",
        totalCommission,
      ],
      [
        "Average Transaction",
        averageTransaction,
      ],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(
              value ?? ""
            );

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "admin-analytics.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <div className="bg-white border rounded-xl p-12 text-center">

          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-4">
            Loading analytics...
          </p>

        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">

        <div className="bg-white border border-red-200 rounded-xl p-10 text-center">

          <XCircle className="w-10 h-10 text-red-400 mx-auto" />

          <h2 className="font-semibold text-gray-800 mt-3">
            Unable to load analytics
          </h2>

          <p className="text-sm text-red-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchAnalyticsData}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 pt-4 pb-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor platform performance and business insights
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">

            <Calendar className="w-4 h-4 text-gray-500" />

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="bg-transparent outline-none text-sm"
            >
              <option>
                This Month
              </option>

              <option>
                Last Month
              </option>

              <option>
                Last 3 Months
              </option>

              <option>
                This Year
              </option>
            </select>

          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

        </div>

      </div>


      {/* TRANSACTION ACCESS MESSAGE */}

      {transactionMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">

          <div className="flex items-center gap-2">

            <Clock className="w-4 h-4 text-yellow-600" />

            <p className="text-sm text-yellow-700">
              {transactionMessage}
            </p>

          </div>

        </div>
      )}


      {/* MAIN STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* PROPERTIES */}

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Total Properties
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(
                  properties.length
                )}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                Property listings
              </p>

            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">

              <Building2 className="w-5 h-5 text-blue-600" />

            </div>

          </div>

        </div>


        {/* APPROVED */}

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Approved Properties
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(
                  propertyStatusCounts.APPROVED
                )}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                Approved listings
              </p>

            </div>

            <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">

              <CheckCircle className="w-5 h-5 text-green-600" />

            </div>

          </div>

        </div>


        {/* TRANSACTIONS */}

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Transactions
              </p>

              {transactionLoading ? (
                <p className="text-sm text-gray-400 mt-2">
                  Loading...
                </p>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(
                      totalTransactions
                    )}
                  </h2>

                  <p className="text-xs text-gray-500 mt-2">
                    {period}
                  </p>
                </>
              )}

            </div>

            <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">

              <CreditCard className="w-5 h-5 text-purple-600" />

            </div>

          </div>

        </div>


        {/* REVENUE */}

        <div className="bg-white border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Revenue
              </p>

              {transactionLoading ? (
                <p className="text-sm text-gray-400 mt-2">
                  Loading...
                </p>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      totalRevenue
                    )}
                  </h2>

                  <p className="text-xs text-gray-500 mt-2">
                    {period}
                  </p>
                </>
              )}

            </div>

            <div className="w-11 h-11 rounded-lg bg-yellow-100 flex items-center justify-center">

              <IndianRupee className="w-5 h-5 text-yellow-600" />

            </div>

          </div>

        </div>

      </div>


      {/* PROPERTY STATUS */}

      <div className="bg-white border rounded-xl p-6 mb-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-gray-900">
            Property Overview
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Current property listing status
          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">

          <div className="bg-yellow-50 rounded-lg p-4">

            <Clock className="w-5 h-5 text-yellow-600" />

            <p className="text-xs text-gray-500 mt-3">
              Pending
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.PENDING}
            </p>

          </div>


          <div className="bg-green-50 rounded-lg p-4">

            <CheckCircle className="w-5 h-5 text-green-600" />

            <p className="text-xs text-gray-500 mt-3">
              Approved
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.APPROVED}
            </p>

          </div>


          <div className="bg-red-50 rounded-lg p-4">

            <XCircle className="w-5 h-5 text-red-600" />

            <p className="text-xs text-gray-500 mt-3">
              Rejected
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.REJECTED}
            </p>

          </div>


          <div className="bg-blue-50 rounded-lg p-4">

            <Home className="w-5 h-5 text-blue-600" />

            <p className="text-xs text-gray-500 mt-3">
              Available
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.AVAILABLE}
            </p>

          </div>


          <div className="bg-gray-50 rounded-lg p-4">

            <Building2 className="w-5 h-5 text-gray-600" />

            <p className="text-xs text-gray-500 mt-3">
              Sold
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.SOLD}
            </p>

          </div>


          <div className="bg-indigo-50 rounded-lg p-4">

            <Building2 className="w-5 h-5 text-indigo-600" />

            <p className="text-xs text-gray-500 mt-3">
              Rented
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.RENTED}
            </p>

          </div>


          <div className="bg-gray-50 rounded-lg p-4">

            <XCircle className="w-5 h-5 text-gray-500" />

            <p className="text-xs text-gray-500 mt-3">
              Inactive
            </p>

            <p className="text-xl font-bold mt-1">
              {propertyStatusCounts.INACTIVE}
            </p>

          </div>

        </div>

      </div>


      {/* TRANSACTION SUMMARY */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">

              <CreditCard className="w-5 h-5 text-green-600" />

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Transactions
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(
                  totalTransactions
                )}
              </p>

            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            {period}
          </p>

        </div>


        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">

              <IndianRupee className="w-5 h-5 text-purple-600" />

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Revenue
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  totalRevenue
                )}
              </p>

            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            {period}
          </p>

        </div>


        <div className="bg-white border rounded-xl p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">

              <TrendingUp className="w-5 h-5 text-blue-600" />

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Broker Commission
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  totalCommission
                )}
              </p>

            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            {period}
          </p>

        </div>

      </div>


      {/* MONTHLY TRANSACTIONS */}

      <div className="bg-white border rounded-xl p-6 mb-6">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Growth
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Transactions and revenue by month
            </p>

          </div>

          <Activity className="w-5 h-5 text-purple-600" />

        </div>

        {monthlyData.length === 0 ? (

          <div className="py-8 text-center text-sm text-gray-500">
            No transaction data available.
          </div>

        ) : (

          <div className="space-y-5">

            {monthlyData.map((item) => {

              const maximumRevenue =
                Math.max(
                  ...monthlyData.map(
                    (data) =>
                      data.revenue
                  ),
                  1
                );

              const width =
                (item.revenue /
                  maximumRevenue) *
                100;

              return (
                <div
                  key={`${item.month}-${item.revenue}`}
                >

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm mb-2">

                    <span className="font-medium text-gray-700">
                      {item.month}
                    </span>

                    <span className="text-gray-500">
                      {formatNumber(
                        item.transactions
                      )}{" "}
                      transactions
                      {" • "}
                      {formatCurrency(
                        item.revenue
                      )}
                    </span>

                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${width}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>


      {/* TOP PROPERTIES + PLATFORM SUMMARY */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* TOP PROPERTIES */}

        <div className="bg-white border rounded-xl p-6">

          <div className="mb-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Top Properties
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Properties with transaction activity
            </p>

          </div>

          {topProperties.length === 0 ? (

            <div className="py-10 text-center">

              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />

              <p className="text-sm text-gray-500 mt-3">
                No transaction data available.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {topProperties.map(
                (property, index) => (

                  <div
                    key={property.id}
                    className="border rounded-lg p-4"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                          {index + 1}
                        </div>

                        <div>

                          <h3 className="font-medium text-gray-900">
                            {property.title ||
                              "Property"}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {property.transactionCount}{" "}
                            transactions
                          </p>

                        </div>

                      </div>

                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(
                          property.revenue
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* PLATFORM SUMMARY */}

        <div className="bg-white border rounded-xl p-6">

          <div className="mb-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Platform Activity
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current platform statistics
            </p>

          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between border-b pb-4">

              <div>

                <p className="font-medium text-gray-900">
                  Total Properties
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  All property listings
                </p>

              </div>

              <span className="font-semibold text-blue-600">
                {formatNumber(
                  properties.length
                )}
              </span>

            </div>


            <div className="flex items-center justify-between border-b pb-4">

              <div>

                <p className="font-medium text-gray-900">
                  Pending Listings
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Waiting for approval
                </p>

              </div>

              <span className="font-semibold text-yellow-600">
                {formatNumber(
                  propertyStatusCounts.PENDING
                )}
              </span>

            </div>


            <div className="flex items-center justify-between border-b pb-4">

              <div>

                <p className="font-medium text-gray-900">
                  Approved Listings
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Approved properties
                </p>

              </div>

              <span className="font-semibold text-green-600">
                {formatNumber(
                  propertyStatusCounts.APPROVED
                )}
              </span>

            </div>


            <div className="flex items-center justify-between">

              <div>

                <p className="font-medium text-gray-900">
                  Revenue
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {period}
                </p>

              </div>

              <span className="font-semibold text-purple-600">
                {formatCurrency(
                  totalRevenue
                )}
              </span>

            </div>

          </div>


          <div className="mt-6 p-4 bg-purple-50 rounded-lg">

            <div className="flex items-center gap-3">

              <TrendingUp className="w-5 h-5 text-purple-600" />

              <div>

                <p className="font-medium text-gray-900">
                  Analytics
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Property data is loaded from
                  the existing backend. Transaction
                  data is used when the existing
                  transaction endpoint permits access.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}