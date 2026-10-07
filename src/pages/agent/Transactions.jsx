import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../data/mockData";
import brokerService from "../../services/brokerService"; // Adjust import path if necessary

export default function Transactions() {
  const { agent, user } = useAuth();
  const brokerId = agent?.id || user?.id;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!brokerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await brokerService.brokerTransactions(brokerId);
        
        // Unpack API response structure
        const dataList = Array.isArray(res) 
          ? res 
          : res?.data || res?.content || [];

        // Map and normalize backend response fields to component expectation
        const normalized = dataList.map((t) => ({
          id: t.id,
          propertyTitle: t.propertyTitle || t.property?.title || t.propertyName || "N/A",
          buyerName: t.buyerName || t.buyer?.name || t.clientName || "N/A",
          sellerName: t.sellerName || t.seller?.name || t.ownerName || "N/A",
          amount: Number(t.amount || t.price || t.dealAmount || 0),
          commission: Number(t.commission || t.brokerCommission || 0),
          status: t.status || "Pending",
          closingDate: t.closingDate || t.createdAt?.split("T")[0] || t.date || "N/A",
          createdAt: t.createdAt || t.createdDate || new Date().toISOString(),
        }));

        // Sort descending by date
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(normalized);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [brokerId]);

  // Calculate total commission for completed deals
  const totalCommission = transactions
    .filter((t) => String(t.status).toLowerCase() === "completed")
    .reduce((s, t) => s + (t.commission || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Transactions</h2>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? "Loading transactions..." : `${transactions.length} deals total`}
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Total Commission: {formatPrice(totalCommission)}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs font-semibold hover:underline bg-red-100 px-2.5 py-1 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Card Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Property</th>
                <th className="px-5 py-3.5 font-semibold">Buyer</th>
                <th className="px-5 py-3.5 font-semibold">Seller</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold">Commission</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Closing</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="font-medium text-gray-500">No transactions found</p>
                      <p className="text-xs text-gray-400">Your deal records will show up here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isCompleted = String(t.status).toLowerCase() === "completed";
                  const isPending = String(t.status).toLowerCase() === "pending";

                  return (
                    <tr 
                      key={t.id} 
                      className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                      <td className="px-5 py-4 max-w-[220px] truncate font-medium text-gray-900" title={t.propertyTitle}>
                        {t.propertyTitle}
                      </td>

                      <td className="px-5 py-4 text-gray-700 font-normal">{t.buyerName}</td>

                      <td className="px-5 py-4 text-gray-700 font-normal">{t.sellerName}</td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatPrice(t.amount)}
                      </td>

                      <td className="px-5 py-4 text-emerald-700 font-semibold">
                        {formatPrice(t.commission)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border-amber-200/60"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                        {t.closingDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}