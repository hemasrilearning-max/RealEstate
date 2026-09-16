import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../data/mockData";

export default function Transactions() {
  const { agent } = useAuth();
  const { transactions } = useData();
  const myTx = transactions
    .filter((t) => t.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalCommission = myTx
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + t.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500">{myTx.length} deals</p>
        </div>
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
          Total Commission: {formatPrice(totalCommission)}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                myTx.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-[200px] truncate font-medium">
                      {t.propertyTitle}
                    </td>
                    <td className="px-4 py-3">{t.buyerName}</td>
                    <td className="px-4 py-3">{t.sellerName}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {formatPrice(t.commission)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.status === "Completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.closingDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
