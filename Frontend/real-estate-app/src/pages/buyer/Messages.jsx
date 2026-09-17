import React, { useState } from 'react';
import { MessageSquare, Send, User, Building2 } from 'lucide-react';

export default function BuyerMessages() {
  // Mock data representing the active chat channels with owners/agents
  const [chats, setChats] = useState([
    { id: 1, name: "Premium Realty Holdings (Owner)", property: "3 BHK Flat - Whitefield", lastMsg: "Yes, the parking space is covered.", date: "4 hrs ago", unread: true },
    { id: 2, name: "Arvind G. (Agent Broker)", property: "Luxury 4 BHK Villa - Sarjapur", lastMsg: "Confirmed your walkthrough slot for tomorrow.", date: "Yesterday", unread: false }
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [typedMessage, setTypedMessage] = useState("");

  // Detailed speech bubble message histories mapped by chat ID
  const [msgHistory, setMsgHistory] = useState({
    1: [
      { id: 501, sender: 'buyer', text: "Hello! I saw your listing for the Whitefield apartment. Is there covered parking?", time: "10:15 AM" },
      { id: 502, sender: 'owner', text: "Hi Arjun! Yes, the parking space is completely covered and has EV charging ports.", time: "11:30 AM" }
    ],
    2: [
      { id: 601, sender: 'agent', text: "Hi Arjun, I locked in the appointment slot with the developer.", time: "Yesterday" },
      { id: 602, sender: 'buyer', text: "Perfect, thank you! See you tomorrow.", time: "Yesterday" },
      { id: 603, sender: 'agent', text: "Confirmed your walkthrough slot for tomorrow.", time: "Yesterday" }
    ]
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'buyer',
      text: typedMessage,
      time: "Just Now"
    };

    // Push into active conversation feed array stack
    setMsgHistory(prev => ({
      ...prev,
      [activeChat]: [...prev[activeChat], newMsg]
    }));

    // Update text previews on sidebar blocks
    setChats(prev => prev.map(c => 
      c.id === activeChat ? { ...c, lastMsg: typedMessage, date: "Just Now", unread: false } : c
    ));

    setTypedMessage("");
  };

  const selectedChat = chats.find(c => c.id === activeChat);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm font-sans flex h-[calc(100vh-12rem)] min-h-[480px] overflow-hidden animate-fadeIn">
      
      {/* 🗣️ LEFT PANEL: CHAT LIST CONVERSATIONS */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/40">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" /> Conversations
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChat(chat.id);
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
              }}
              className={`w-full text-left p-3 rounded-xl transition-all flex flex-col relative ${
                activeChat === chat.id
                  ? 'bg-white shadow-xs border border-gray-100 text-gray-900 ring-1 ring-gray-100'
                  : 'hover:bg-gray-100/50 text-gray-500'
              }`}
            >
              {chat.unread && (
                <span className="absolute top-4 right-4 h-2 w-2 bg-emerald-500 rounded-full" />
              )}
              <div className="flex justify-between items-baseline pr-4 w-full">
                <span className="font-bold text-xs text-gray-900 truncate max-w-[140px]">{chat.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{chat.date}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {chat.property}
              </span>
              <p className="text-xs text-gray-500 truncate mt-2 font-medium">{chat.lastMsg}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 💬 RIGHT PANEL: ACTIVE CHAT SCREEN */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Active Header strip */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-gray-900 text-sm">{selectedChat.name}</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Topic: {selectedChat.property}</p>
            </div>

            {/* Chat board content feed area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/10">
              {msgHistory[activeChat]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${
                    msg.sender === 'buyer' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'buyer'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 font-medium px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input message form tray */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 items-center bg-white">
              <input
                type="text"
                placeholder="Type your message text reply..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs">
            Select a dialogue thread channel from the sidebar list to view message data logs.
          </div>
        )}
      </div>

    </div>
  );
}
