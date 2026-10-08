import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import messagingService from "../../services/messagingService";

function formatMessageTime(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function getLastMessage(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return [...messages].sort(
    (a, b) =>
      new Date(a.createdAt || 0) -
      new Date(b.createdAt || 0)
  )[messages.length - 1];
}

export default function OwnerMessages() {
  const { owner, user } = useAuth();

  const profile = owner || user;

  const ownerId = profile?.userId || profile?.id;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD OWNER CONVERSATIONS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadConversations() {
      if (!ownerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await messagingService.getSellerConversations(
            ownerId
          );

        if (!mounted) return;

        const conversationList = Array.isArray(response)
          ? response
          : [];

        setConversations(conversationList);

        if (conversationList.length > 0) {
          setActiveChat((current) => {
            if (
              current &&
              conversationList.some(
                (conversation) =>
                  conversation.id === current
              )
            ) {
              return current;
            }

            return conversationList[0].id;
          });
        } else {
          setActiveChat(null);
        }
      } catch (err) {
        console.error(
          "Failed to load owner conversations:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Failed to load conversations."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      mounted = false;
    };
  }, [ownerId]);

  // ============================================================
  // LOAD ACTIVE CHAT MESSAGES
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      if (!activeChat) {
        return;
      }

      setLoadingMessages(true);
      setError("");

      try {
        const response =
          await messagingService.getMessages(
            activeChat
          );

        if (!mounted) return;

        const messageList = Array.isArray(response)
          ? response
          : [];

        setMessages((previous) => ({
          ...previous,
          [activeChat]: messageList,
        }));

        // Mark unread messages received by owner as read.
        const unreadMessages =
          messageList.filter(
            (message) =>
              message.receiverId === ownerId &&
              message.isRead === false
          );

        for (const message of unreadMessages) {
          try {
            await messagingService.markMessageAsRead(
              message.id
            );
          } catch (readError) {
            console.error(
              "Failed to mark message as read:",
              readError
            );
          }
        }

        if (unreadMessages.length > 0 && mounted) {
          setMessages((previous) => ({
            ...previous,
            [activeChat]: (
              previous[activeChat] || []
            ).map((message) =>
              unreadMessages.some(
                (unread) =>
                  unread.id === message.id
              )
                ? {
                    ...message,
                    isRead: true,
                  }
                : message
            ),
          }));
        }
      } catch (err) {
        console.error(
          "Failed to load messages:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Failed to load messages."
          );
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [activeChat, ownerId]);

  // ============================================================
  // PREPARE CHAT LIST
  // ============================================================

  const chatList = useMemo(() => {
    return conversations.map((conversation) => {
      const conversationMessages =
        messages[conversation.id] || [];

      const lastMessage =
        getLastMessage(conversationMessages);

      const unread = conversationMessages.some(
        (message) =>
          message.receiverId === ownerId &&
          message.isRead === false
      );

      // A conversation with no messages is treated
      // as a new message request.
      const isPending =
        conversationMessages.length === 0;

      return {
        ...conversation,

        name:
          conversation.buyerName ||
          "Buyer",

        property:
          conversation.propertyTitle ||
          "Property",

        lastMessage:
          lastMessage?.content ||
          "New message request",

        time:
          formatMessageTime(
            lastMessage?.createdAt
          ) ||
          formatMessageTime(
            conversation.createdAt
          ),

        unread,

        isPending,
      };
    });
  }, [
    conversations,
    messages,
    ownerId,
  ]);

  const selectedChatInfo = chatList.find(
    (chat) => chat.id === activeChat
  );

  const activeMessages =
    messages[activeChat] || [];

  // ============================================================
  // ACCEPT MESSAGE REQUEST
  // ============================================================

  const handleAcceptRequest = async () => {
    if (
      !selectedChatInfo ||
      !selectedChatInfo.buyerId ||
      accepting
    ) {
      return;
    }

    setAccepting(true);
    setError("");

    try {
      /*
       * No backend change is required.
       *
       * Sending the first owner message acts as the
       * approval signal for the buyer.
       */
      const acceptanceMessage =
        await messagingService.sendMessage(
          selectedChatInfo.id,
          selectedChatInfo.buyerId,
          "Hi! Your message request has been accepted. How can I help you?"
        );

      setMessages((previous) => ({
        ...previous,
        [selectedChatInfo.id]: [
          ...(previous[selectedChatInfo.id] || []),
          acceptanceMessage,
        ],
      }));
    } catch (err) {
      console.error(
        "Failed to accept message request:",
        err
      );

      setError(
        err.message ||
          "Failed to accept the message request."
      );
    } finally {
      setAccepting(false);
    }
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const content = typedMessage.trim();

    if (
      !content ||
      !selectedChatInfo ||
      sending
    ) {
      return;
    }

    const receiverId =
      selectedChatInfo.buyerId;

    if (!receiverId) {
      setError(
        "Unable to identify the buyer for this conversation."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const newMessage =
        await messagingService.sendMessage(
          selectedChatInfo.id,
          receiverId,
          content
        );

      setMessages((previous) => ({
        ...previous,
        [selectedChatInfo.id]: [
          ...(previous[selectedChatInfo.id] || []),
          newMessage,
        ],
      }));

      setTypedMessage("");
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      setError(
        err.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // SELECT CHAT
  // ============================================================

  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
    setError("");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm font-sans flex h-[calc(100vh-10rem)] min-h-[500px] overflow-hidden animate-fadeIn">

      {/* LEFT COLUMN */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">

        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            Owner Messages
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            Chat directly with tenants and buyers.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">

          {loading ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading conversations...
            </div>
          ) : chatList.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No conversations yet.
            </div>
          ) : (
            chatList.map((chat) => (
              <button
                key={chat.id}
                onClick={() =>
                  handleSelectChat(chat.id)
                }
                className={`w-full text-left p-3 rounded-xl transition-all flex flex-col relative ${
                  activeChat === chat.id
                    ? "bg-white shadow-sm border border-gray-100 text-gray-900 ring-1 ring-gray-100"
                    : "hover:bg-gray-100/50 text-gray-600"
                }`}
              >
                {chat.unread && (
                  <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-rose-500 rounded-full"></span>
                )}

                <div className="flex justify-between items-baseline w-full pr-4">
                  <span className="font-bold text-sm text-gray-900">
                    {chat.name}
                  </span>

                  <span className="text-[10px] text-gray-400 font-medium">
                    {chat.time}
                  </span>
                </div>

                <span className="text-xs text-gray-400 font-semibold truncate mt-0.5">
                  {chat.property}
                </span>

                <p
                  className={`text-xs truncate mt-1.5 ${
                    chat.isPending
                      ? "text-rose-500 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 flex flex-col bg-white">

        {selectedChatInfo ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">

              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {selectedChatInfo.name}
                </h3>

                <p className="text-xs text-rose-500 font-medium mt-0.5">
                  {selectedChatInfo.property}
                </p>
              </div>

              {selectedChatInfo.isPending ? (
                <span className="text-xs bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1 rounded-lg font-semibold">
                  Message Request
                </span>
              ) : (
                <span className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-3 py-1 rounded-lg font-medium">
                  Active Inquiry
                </span>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div className="px-4 py-2 text-xs text-rose-600 bg-rose-50 border-b border-rose-100">
                {error}
              </div>
            )}

            {/* PENDING REQUEST */}
            {selectedChatInfo.isPending && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    New message request
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedChatInfo.name} wants to contact you about this property.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAcceptRequest}
                  disabled={accepting}
                  className="shrink-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accepting
                    ? "Accepting..."
                    : "Accept Request"}
                </button>
              </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/20">

              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Loading messages...
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  <div className="text-center">
                    <p className="font-medium text-gray-500">
                      No messages yet.
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Accept the request to start the conversation.
                    </p>
                  </div>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwner =
                    Number(msg.senderId) === Number(ownerId);

                  const isBuyer =
                    selectedChatInfo &&
                    Number(msg.senderId) ===
                      Number(selectedChatInfo.buyerId);

                  const senderLabel = isOwner
                    ? "You (Owner)"
                    : isBuyer
                    ? `${msg.senderName || "Buyer"} (Buyer)`
                    : `${msg.senderName || "Agent"} (Broker)`;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${
                        isOwner
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                        {senderLabel}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isOwner
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none"
                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
                        {formatMessageTime(
                          msg.createdAt
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* INPUT */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-100 flex gap-2 items-center bg-white"
            >
              <input
                type="text"
                placeholder={
                  selectedChatInfo.isPending
                    ? "Accept request to reply..."
                    : "Type a message reply..."
                }
                value={typedMessage}
                onChange={(e) =>
                  setTypedMessage(
                    e.target.value
                  )
                }
                disabled={
                  sending ||
                  accepting ||
                  selectedChatInfo.isPending
                }
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />

              <button
                type="submit"
                disabled={
                  !typedMessage.trim() ||
                  sending ||
                  accepting ||
                  selectedChatInfo.isPending
                }
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
            Select a conversation thread from the sidebar panel to view messages.
          </div>
        )}
      </div>
    </div>
  );
}