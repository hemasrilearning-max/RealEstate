import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MessageSquare,
  Send,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function BuyerMessages() {
  const navigate = useNavigate();

  const { buyer, user } = useAuth();

  const profile = buyer || user;

  const buyerId = profile?.userId || profile?.id;

  const [chats, setChats] = useState([]);
  const [msgHistory, setMsgHistory] = useState({});

  const [activeChat, setActiveChat] = useState(null);

  const [typedMessage, setTypedMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD BUYER CONVERSATIONS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadConversations() {
      if (!buyerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await messagingService.getBuyerConversations(
            buyerId
          );

        if (!mounted) return;

        const conversationList =
          Array.isArray(response)
            ? response
            : [];

        setChats(conversationList);

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
          "Failed to load buyer conversations:",
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
  }, [buyerId]);

  // ============================================================
  // LOAD ACTIVE CONVERSATION MESSAGES
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

        const messageList =
          Array.isArray(response)
            ? response
            : [];

        setMsgHistory((previous) => ({
          ...previous,
          [activeChat]: messageList,
        }));

        // Mark received unread messages as read.
        const unreadMessages =
          messageList.filter(
            (message) =>
              message.receiverId === buyerId &&
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

        if (
          unreadMessages.length > 0 &&
          mounted
        ) {
          setMsgHistory((previous) => ({
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
  }, [activeChat, buyerId]);

  // ============================================================
  // PREPARE CHAT LIST
  // ============================================================

  const chatList = useMemo(() => {
    return chats.map((chat) => {
      const history =
        msgHistory[chat.id] || [];

      const lastMessage =
        getLastMessage(history);

      const unread = history.some(
        (message) =>
          message.receiverId === buyerId &&
          message.isRead === false
      );

      /*
       * Accepted if owner OR broker has replied (any non-buyer message),
       * or conversation.status is ACCEPTED.
       */
      const nonBuyerMessages = history.filter(
        (message) =>
          Number(message.senderId) !== Number(buyerId)
      );

      const statusAccepted =
        String(chat.status || "").toUpperCase() === "ACCEPTED";

      const isAccepted =
        nonBuyerMessages.length > 0 || statusAccepted;

      const isPending = !isAccepted;

      return {
        ...chat,

        name:
          chat.sellerName ||
          "Property Owner",

        role: "Owner",

        property:
          chat.propertyTitle ||
          "Property",

        lastMsg:
          lastMessage?.content ||
          "Message request sent",

        date:
          formatMessageTime(
            lastMessage?.createdAt
          ) ||
          formatMessageTime(
            chat.createdAt
          ),

        unread,

        isPending,

        isAccepted,
      };
    });
  }, [
    chats,
    msgHistory,
    buyerId,
  ]);

  const selectedChat =
    chatList.find(
      (chat) => chat.id === activeChat
    );

  const activeMessages =
    msgHistory[activeChat] || [];

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async (e) => {
    e.preventDefault();

    const content =
      typedMessage.trim();

    if (
      !content ||
      !selectedChat ||
      sending
    ) {
      return;
    }

    /*
     * Do not allow buyer to send a message while
     * the owner's request is still pending.
     */
    if (!selectedChat.isAccepted) {
      setError(
        "Please wait for the property owner or agent to accept your message request."
      );
      return;
    }

    const receiverId =
      selectedChat.sellerId;

    if (!receiverId) {
      setError(
        "Unable to identify the property owner for this conversation."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const newMessage =
        await messagingService.sendMessage(
          selectedChat.id,
          receiverId,
          content
        );

      setMsgHistory((previous) => ({
        ...previous,
        [selectedChat.id]: [
          ...(previous[
            selectedChat.id
          ] || []),
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
    <div className="bg-gray-50 min-h-[calc(100vh-5rem)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Messages
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Communicate with property owners about your
              property interests.
            </p>
          </div>
        </div>

        {/* MESSAGES CONTAINER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-15rem)] min-h-[500px]">

          {/* LEFT CONVERSATIONS PANEL */}
          <div className="w-full sm:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/40">

            {/* Conversations Header */}
            <div className="p-4 border-b border-gray-100 bg-white">

              <div className="flex items-center justify-between">

                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  Conversations
                </h2>

                <span className="text-xs text-gray-400 font-medium">
                  {chatList.length} chats
                </span>

              </div>
            </div>

            {/* Chat List */}
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
                      handleSelectChat(
                        chat.id
                      )
                    }
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col relative ${
                      activeChat === chat.id
                        ? "bg-white shadow-sm border border-gray-100 ring-1 ring-gray-100"
                        : "hover:bg-gray-100/70 text-gray-500"
                    }`}
                  >

                    {chat.unread && (
                      <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                    )}

                    <div className="flex justify-between items-start gap-2 pr-4">

                      <div className="min-w-0">

                        <span className="font-bold text-xs text-gray-900 block truncate">
                          {chat.name}
                        </span>

                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {chat.role}
                        </span>

                      </div>

                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {chat.date}
                      </span>

                    </div>

                    <span className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1 truncate">

                      <Building2 className="h-3 w-3 shrink-0" />

                      <span className="truncate">
                        {chat.property}
                      </span>

                    </span>

                    <div className="flex items-center justify-between gap-2 mt-2">

                      <p
                        className={`text-xs truncate font-medium ${
                          chat.isPending
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {chat.lastMsg}
                      </p>

                      {chat.isPending && (
                        <span className="shrink-0 text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-semibold">
                          Pending
                        </span>
                      )}

                      {chat.isAccepted && (
                        <span className="shrink-0 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-md font-semibold">
                          Accepted
                        </span>
                      )}

                    </div>

                  </button>
                ))
              )}

            </div>
          </div>

          {/* RIGHT CHAT PANEL */}
          <div className="hidden sm:flex flex-1 flex-col bg-white min-w-0">

            {selectedChat ? (
              <>

                {/* CHAT HEADER */}
                <div className="px-5 py-4 border-b border-gray-100 bg-white">

                  <div className="flex items-center gap-3">

                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {selectedChat.name}
                      </h3>

                      <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">
                        {selectedChat.role}
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium min-w-0">

                      <Building2 className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {selectedChat.property}
                      </span>

                    </div>

                    {selectedChat.isPending ? (
                      <span className="shrink-0 text-[10px] bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-lg font-semibold">
                        Request Pending
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-1 rounded-lg font-semibold">
                        Accepted
                      </span>
                    )}

                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
                    {error}
                  </div>
                )}

                {/* PENDING REQUEST MESSAGE */}
                {selectedChat.isPending && (
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">

                    <p className="text-xs font-semibold text-amber-700">
                      Message request sent
                    </p>

                    <p className="text-[11px] text-amber-600 mt-0.5">
                      The property owner or agent needs to accept your
                      request before you can continue chatting.
                    </p>

                  </div>
                )}

                {/* CHAT MESSAGES */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/30">

                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading messages...
                    </div>
                  ) : activeMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">

                      <div className="text-center">

                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />

                        <p className="text-xs text-gray-400">
                          Your message request has been sent.
                        </p>

                        <p className="text-[11px] text-gray-300 mt-1">
                          Waiting for the owner or agent to accept.
                        </p>

                      </div>

                    </div>
                  ) : (
                    activeMessages.map((msg) => {

                      const isBuyer =
                        Number(msg.senderId) === Number(buyerId);

                      const isOwner =
                        Number(msg.senderId) ===
                        Number(selectedChat?.sellerId);

                      const senderLabel = isBuyer
                        ? "You"
                        : isOwner
                        ? `${msg.senderName || "Owner"} (Owner)`
                        : `${msg.senderName || "Agent"} (Broker)`;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            isBuyer
                              ? "ml-auto items-end"
                              : "mr-auto items-start"
                          }`}
                        >
                          <span className="text-[9px] text-gray-400 mb-0.5 px-1 font-medium">
                            {senderLabel}
                          </span>

                          <div
                            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isBuyer
                                ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                            }`}
                          >
                            {msg.content}
                          </div>

                          <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium px-1">
                            {formatMessageTime(
                              msg.createdAt
                            )}
                          </span>

                        </div>
                      );
                    })
                  )}

                </div>

                {/* MESSAGE INPUT */}
                <form
                  onSubmit={handleSend}
                  className="p-3 sm:p-4 border-t border-gray-100 flex gap-2 items-center bg-white"
                >

                  <input
                    type="text"
                    placeholder={
                      selectedChat.isPending
                        ? "Waiting for owner approval..."
                        : "Type your message..."
                    }
                    value={typedMessage}
                    onChange={(e) =>
                      setTypedMessage(
                        e.target.value
                      )
                    }
                    disabled={
                      sending ||
                      selectedChat.isPending
                    }
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium disabled:bg-gray-50 disabled:text-gray-400"
                  />

                  <button
                    type="submit"
                    disabled={
                      !typedMessage.trim() ||
                      sending ||
                      selectedChat.isPending
                    }
                    className="bg-emerald-600 text-white p-2.5 sm:p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>

                </form>

              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">

                <MessageSquare className="h-10 w-10 mb-3 opacity-40" />

                <p>
                  Select a conversation to view messages.
                </p>

              </div>
            )}

          </div>

          {/* MOBILE EMPTY / CHAT NOTE */}
          <div className="sm:hidden hidden" />

        </div>

        {/* MOBILE CONVERSATION NOTE */}
        <div className="sm:hidden mt-3 text-xs text-gray-400 text-center">
          Select a conversation above to open the chat.
        </div>

      </div>
    </div>
  );
}