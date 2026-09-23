import React, { useState } from 'react';

export default function OwnerMessages() {
  // Mock data for chat conversations
  const [conversations, setConversations] = useState([
    { id: 1, name: "Arvind G.", property: "3BHK Villa - Whitefield", lastMessage: "Is the security deposit negotiable?", time: "2 hrs ago", unread: true },
    { id: 2, name: "Priya Sharma", property: "2BHK Apartment - HSR Layout", lastMessage: "Can we schedule a visit this Saturday?", time: "2 hrs ago", unread: false },
    { id: 3, name: "Rahul Verma", property: "Studio - Indiranagar", lastMessage: "Sent you the documentation copies.", time: "Yesterday", unread: false }
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [typedMessage, setTypedMessage] = useState("");
  
  // Detailed chat message histories mapped by conversation ID
  const [messages, setMessages] = useState({
    1: [
      { id: 101, sender: 'client', text: "Hello! I saw your listing for the Whitefield villa.", time: "10:15 AM" },
      { id: 102, sender: 'owner', text: "Hi Arvind, glad you're interested. Let me know if you have questions.", time: "10:30 AM" },
      { id: 103, sender: 'client', text: "Is the security deposit negotiable? The listing says 6 months.", time: "2:14 PM" }
    ],
    2: [
      { id: 201, sender: 'client', text: "Hi, is the HSR layout flat available from next month?", time: "Yesterday" },
      { id: 202, sender: 'owner', text: "Yes it is! Ready to move in by the 1st.", time: "Yesterday" },
      { id: 203, sender: 'client', text: "Perfect. Can we schedule a visit this Saturday?", time: "2:05 PM" }
    ],
    3: [
      { id: 301, sender: 'owner', text: "Please share your ID proof for the rental agreement.", time: "2 days ago" },
      { id: 302, sender: 'client', text: "Sent you the documentation copies.", time: "Yesterday" }
    ]
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'owner',
      text: typedMessage,
      time: "Just Now"
    };

    // Update active chat message history list
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...prev[activeChat], newMsg]
    }));

    // Update snippet text inside the conversation sidebar pane
    setConversations(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, lastMessage: typedMessage, time: "Just Now", unread: false }
        : chat
    ));

    setTypedMessage("");
  };

  const selectedChatInfo = conversations.find(c => c.id === activeChat);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm font-sans flex h-[calc(100vh-10rem)] min-h-[500px] overflow-hidden animate-fadeIn">
      
      {/* 🗣️ LEFT COLUMN: CHAT LIST THREADS */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Owner Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">Chat directly with tenants and buyers.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChat(chat.id);
                setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
              }}
              className={`w-full text-left p-3 rounded-xl transition-all flex flex-col relative ${
                activeChat === chat.id
                  ? 'bg-white shadow-sm border border-gray-100 text-gray-900 ring-1 ring-gray-100'
                  : 'hover:bg-gray-100/50 text-gray-600'
              }`}
            >
              {chat.unread && (
                <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-rose-500 rounded-full"></span>
              )}
              <div className="flex justify-between items-baseline w-full pr-4">
                <span className="font-bold text-sm text-gray-900">{chat.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
              </div>
              <span className="text-xs text-gray-400 font-semibold truncate mt-0.5">{chat.property}</span>
              <p className="text-xs text-gray-500 truncate mt-1.5">{chat.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 💬 RIGHT COLUMN: ACTIVE CONVERSATION PORTAL WINDOW */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChatInfo ? (
          <>
            {/* Header info banner */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedChatInfo.name}</h3>
                <p className="text-xs text-rose-500 font-medium mt-0.5">{selectedChatInfo.property}</p>
              </div>
              <span className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-3 py-1 rounded-lg font-medium">
                Active Inquiry
              </span>
            </div>

            {/* Scrolling speech bubble chat board */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/20">
              {messages[activeChat]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[70%] ${
                    msg.sender === 'owner' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'owner'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Text entry field submission footer panel */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 items-center bg-white">
              <input
                type="text"
                placeholder="Type a message reply..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
              >
                Send
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
