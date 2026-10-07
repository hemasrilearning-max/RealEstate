import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import brokerService from "../../services/brokerService";
import {
  Send,
  MessageCircle,
  Search,
  Check,
  CheckCheck,
  Building2,
} from "lucide-react";

/**
 * Broker Messages – same behaviour as Owner Messages:
 * - List buyer message requests
 * - Accept / Reject
 * - After accept, shared chat (buyer + owner + broker)
 */
export default function Messages() {
  const { agent, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // conversationId
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  const getBrokerId = () => {
    try {
      const stored = localStorage.getItem("authUser");
      const parsed = stored ? JSON.parse(stored) : null;
      return (
        parsed?.id ||
        parsed?.userId ||
        agent?.id ||
        agent?.userId ||
        user?.id ||
        user?.userId ||
        null
      );
    } catch {
      return agent?.id || agent?.userId || user?.id || null;
    }
  };

  const unwrapList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.content)) return res.content;
    return [];
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    const brokerId = getBrokerId();

    if (!brokerId) {
      setError("Broker login not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const [reqRes, msgRes] = await Promise.all([
        brokerService.brokerConversations(brokerId),
        brokerService.brokerMessages(brokerId).catch(() => ({ data: [] })),
      ]);

      const reqList = unwrapList(reqRes);
      const msgList = unwrapList(msgRes);

      console.log("Broker requests:", reqList);
      console.log("Broker messages:", msgList);

      setRequests(reqList);
      setMessages(msgList);

      if (reqList.length > 0 && selectedId == null) {
        setSelectedId(reqList[0].conversationId);
      }
    } catch (err) {
      console.error("Load broker messages failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load message requests."
      );
      setRequests([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id, agent?.userId, user?.id]);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.buyerName?.toLowerCase().includes(q) ||
        r.propertyTitle?.toLowerCase().includes(q) ||
        r.lastMessage?.toLowerCase().includes(q) ||
        r.sellerName?.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const selected = requests.find(
    (r) => Number(r.conversationId) === Number(selectedId)
  );

  const isPending =
    selected && (selected.status || "PENDING").toUpperCase() === "PENDING";

  const chatMessages = useMemo(() => {
    if (!selectedId) return [];
    return messages
      .filter((m) => Number(m.conversationId) === Number(selectedId))
      .sort(
        (a, b) =>
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
  }, [messages, selectedId]);

  const handleAccept = async () => {
    if (!selected || accepting) return;
    const brokerId = getBrokerId();
    try {
      setAccepting(true);
      setError("");
      await brokerService.acceptBrokerConversation(
        brokerId,
        selected.conversationId
      );
      // Hide Accept immediately
      setRequests((prev) =>
        prev.map((r) =>
          Number(r.conversationId) === Number(selected.conversationId)
            ? { ...r, status: "ACCEPTED" }
            : r
        )
      );
      await loadAll();
      setSelectedId(selected.conversationId);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to accept request."
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!selected || accepting) return;
    const brokerId = getBrokerId();
    try {
      setAccepting(true);
      await brokerService.rejectBrokerConversation(
        brokerId,
        selected.conversationId
      );
      setSelectedId(null);
      await loadAll();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject request."
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!text.trim() || !selected || sending || isPending) return;
    const brokerId = getBrokerId();

    try {
      setSending(true);
      setError("");
      const body = {
        content: text.trim(),
        senderId: Number(brokerId),
        receiverId: Number(selected.buyerId),
        propertyId: Number(selected.propertyId),
        recipientType: "BUYER",
      };
      const res = await brokerService.createBrokerMessage(brokerId, body);
      const created = res?.data || res;
      if (created) {
        setMessages((prev) => [...prev, created]);
      }
      setText("");
      await loadAll();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const brokerId = getBrokerId();

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Loading messages...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">
          Same as owner: buyer requests appear here. First accept wins.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadAll} className="underline">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex h-[620px]">
        {/* LEFT – same style as Owner Messages */}
        <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Broker Messages</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Chat with buyers (shared with owner)
            </p>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No message requests yet.
                <p className="text-xs mt-2 text-gray-400">
                  When a buyer requests chat on your property, it appears here
                  (and for the owner).
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const active =
                  Number(req.conversationId) === Number(selectedId);
                const pending =
                  (req.status || "PENDING").toUpperCase() === "PENDING";

                return (
                  <button
                    key={req.conversationId}
                    type="button"
                    onClick={() => setSelectedId(req.conversationId)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 ${
                      active ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {req.buyerName || `Buyer #${req.buyerId}`}
                      </p>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {formatTime(req.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {req.propertyTitle || `Property #${req.propertyId}`}
                    </p>
                    {pending ? (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        New message request
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {req.lastMessage || "Accepted"}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selected.buyerName || `Buyer #${selected.buyerId}`}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {selected.propertyTitle ||
                      `Property #${selected.propertyId}`}
                  </p>
                </div>
                {isPending ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Message Request
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    Accepted
                  </span>
                )}
              </div>

              {isPending ? (
                <>
                  <div className="m-5 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        New message request
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selected.buyerName || "Buyer"} wants to contact you
                        about this property.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReject(); }}
                        disabled={accepting}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAccept(); }}
                        disabled={accepting}
                        className="px-4 py-2 text-sm rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                      >
                        {accepting ? "Accepting..." : "Accept Request"}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                    Accept the request to start the conversation.
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <input
                      disabled
                      placeholder="Accept request to reply..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/40">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        No messages yet. Say hello to the buyer.
                      </div>
                    ) : (
                      chatMessages.map((m) => {
                        const mine =
                          Number(m.senderId) === Number(brokerId);
                        const label = mine
                          ? "You (Broker)"
                          : m.senderRole === "SELLER"
                          ? `${m.senderName || "Owner"} (Owner)`
                          : `${m.senderName || "Buyer"} (Buyer)`;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[70%]">
                              <p
                                className={`text-[10px] mb-0.5 px-1 ${
                                  mine ? "text-right text-red-500" : "text-gray-400"
                                }`}
                              >
                                {label}
                              </p>
                              <div
                                className={`px-4 py-2.5 text-sm rounded-2xl ${
                                  mine
                                    ? "bg-red-600 text-white rounded-br-md"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                }`}
                              >
                                {m.content}
                              </div>
                              <p
                                className={`text-[10px] text-gray-400 mt-0.5 px-1 ${
                                  mine ? "text-right" : ""
                                }`}
                              >
                                {formatTime(m.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form
                    onSubmit={handleSend}
                    className="p-4 border-t border-gray-200 flex gap-2"
                  >
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim() || sending}
                      className="bg-red-600 text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p>Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
