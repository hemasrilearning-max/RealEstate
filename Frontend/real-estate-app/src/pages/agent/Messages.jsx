import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Send } from "lucide-react";

export default function Messages() {
  const { agent } = useAuth();
  const { messages, leads, properties, addMessage, markMessagesRead } =
    useData();
  const myLeads = leads.filter((l) => l.agentId === agent.id);
  const [selectedLeadId, setSelectedLeadId] = useState(
    myLeads[0]?.id || null
  );
  const [text, setText] = useState("");

  const conversation = messages
    .filter((m) => m.leadId === selectedLeadId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const selectedLead = myLeads.find((l) => l.id === selectedLeadId);

  const handleSelect = (leadId) => {
    setSelectedLeadId(leadId);
    markMessagesRead(leadId);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedLeadId) return;
    addMessage({
      leadId: selectedLeadId,
      propertyId: selectedLead?.propertyId,
      senderType: "agent",
      senderName: agent.name,
      message: text.trim(),
    });
    setText("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">
          Communicate with buyers interested in your listings
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex h-[560px]">
        {/* Lead list */}
        <div className="w-72 border-r border-gray-100 overflow-y-auto shrink-0">
          {myLeads.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
          ) : (
            myLeads.map((lead) => {
              const unread = messages.filter(
                (m) =>
                  m.leadId === lead.id &&
                  m.senderType === "buyer" &&
                  !m.read
              ).length;
              const prop = properties.find((p) => p.id === lead.propertyId);
              return (
                <button
                  key={lead.id}
                  onClick={() => handleSelect(lead.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                    selectedLeadId === lead.id ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{lead.name}</p>
                    {unread > 0 && (
                      <span className="bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {prop?.title || "Property"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {selectedLead ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-sm">{selectedLead.name}</p>
                <p className="text-xs text-gray-500">{selectedLead.phone}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversation.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.senderType === "agent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        m.senderType === "agent"
                          ? "bg-red-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      <p>{m.message}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.senderType === "agent"
                            ? "text-red-200"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-gray-100 flex gap-2"
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
