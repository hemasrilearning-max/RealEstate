import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BuyerMessages() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Premium Realty Holdings",
      role: "Owner",
      property: "3 BHK Flat - Whitefield",
      lastMsg: "Yes, the parking space is covered.",
      date: "4 hrs ago",
      unread: true,
    },
    {
      id: 2,
      name: "Arvind G.",
      role: "Agent Broker",
      property: "Luxury 4 BHK Villa - Sarjapur",
      lastMsg: "Confirmed your walkthrough slot for tomorrow.",
      date: "Yesterday",
      unread: false,
    },
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [typedMessage, setTypedMessage] = useState("");

  const [msgHistory, setMsgHistory] = useState({
    1: [
      {
        id: 501,
        sender: "buyer",
        text: "Hello! I saw your listing for the Whitefield apartment. Is there covered parking?",
        time: "10:15 AM",
      },
      {
        id: 502,
        sender: "owner",
        text: "Hi Arjun! Yes, the parking space is completely covered and has EV charging ports.",
        time: "11:30 AM",
      },
    ],
    2: [
      {
        id: 601,
        sender: "agent",
        text: "Hi Arjun, I locked in the appointment slot with the developer.",
        time: "Yesterday",
      },
      {
        id: 602,
        sender: "buyer",
        text: "Perfect, thank you! See you tomorrow.",
        time: "Yesterday",
      },
      {
        id: 603,
        sender: "agent",
        text: "Confirmed your walkthrough slot for tomorrow.",
        time: "Yesterday",
      },
    ],
  });

  const handleSend = (e) => {
    e.preventDefault();

    if (!typedMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "buyer",
      text: typedMessage.trim(),
      time: "Just now",
    };

    setMsgHistory((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              lastMsg: typedMessage.trim(),
              date: "Just now",
              unread: false,
            }
          : chat
      )
    );

    setTypedMessage("");
  };

  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, unread: false }
          : chat
      )
    );
  };

  const selectedChat = chats.find(
    (chat) => chat.id === activeChat
  );

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
              Communicate with property owners and agents about your
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
                  {chats.length} chats
                </span>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
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

                  <p className="text-xs text-gray-500 truncate mt-2 font-medium">
                    {chat.lastMsg}
                  </p>
                </button>
              ))}
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

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    {selectedChat.property}
                  </div>
                </div>

                {/* CHAT MESSAGES */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                  {msgHistory[activeChat]?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        msg.sender === "buyer"
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.sender === "buyer"
                            ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* MESSAGE INPUT */}
                <form
                  onSubmit={handleSend}
                  className="p-3 sm:p-4 border-t border-gray-100 flex gap-2 items-center bg-white"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={typedMessage}
                    onChange={(e) =>
                      setTypedMessage(e.target.value)
                    }
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  />

                  <button
                    type="submit"
                    disabled={!typedMessage.trim()}
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
                <p>Select a conversation to view messages.</p>
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
