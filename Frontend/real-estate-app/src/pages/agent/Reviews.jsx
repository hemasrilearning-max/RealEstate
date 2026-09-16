import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Star } from "lucide-react";

export default function Reviews() {
  const { agent } = useAuth();
  const { reviews } = useData();
  const myReviews = reviews
    .filter((r) => r.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const avg =
    myReviews.length > 0
      ? (
          myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
          <p className="text-sm text-gray-500">{myReviews.length} reviews</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="font-semibold">{avg}</span>
          <span className="text-sm">avg rating</span>
        </div>
      </div>

      <div className="space-y-4">
        {myReviews.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No reviews yet.</p>
        ) : (
          myReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-sm">
                    {r.clientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.clientName}</p>
                    <p className="text-xs text-gray-500">{r.propertyTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{r.comment}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
