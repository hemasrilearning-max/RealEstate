import React, { useState } from 'react';
import { Bell, Tag, Calendar, MessageSquare, Trash2, CheckCircle } from 'lucide-react';

export default function BuyerNotifications() {
  // Mock data representing operational platform alert logs
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'price', title: 'Price Drop Alert', desc: 'A property on your Favorites shortlist (HSR Layout Flat) just dropped by ₹5,000/mo!', time: '2 hours ago', isNew: true, icon: Tag, color: 'text-amber-500 bg-amber-50 border-amber-100' },
    { id: 2, type: 'tour', title: 'Tour Booking Confirmed', desc: 'Your physical viewing slot for Luxury 4 BHK Villa has been approved for tomorrow at 11:30 AM.', time: '4 hours ago', isNew: true, icon: Calendar, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { id: 3, type: 'chat', title: 'New Message Received', desc: 'Premium Realty Holdings sent a reply: "Yes, the parking space is covered."', time: '1 day ago', isNew: false, icon: MessageSquare, color: 'text-blue-500 bg-blue-50 border-blue-100' }
  ]);

  const handleClearAlert = (id) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isNew: false })));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm font-sans animate-fadeIn">
      {/* Title Block Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" /> Notifications & Alerts
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Stay updated on price fluctuations, viewing changes, and system messages.</p>
        </div>
        
        {notifications.some(n => n.isNew) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-center"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Stack List Feed Stream Layout */}
      <div className="space-y-3 mt-6">
        {notifications.map((item) => {
          const IconComp = item.icon;
          return (
            <div 
              key={item.id} 
              className={`p-4 rounded-xl border transition-all flex justify-between items-start gap-4 ${
                item.isNew ? 'bg-white border-gray-200 shadow-2xs font-medium' : 'bg-gray-50/30 border-gray-100 text-gray-500'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Styled Icon Indicator Frame */}
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                  <IconComp className="h-4 w-4" />
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    {item.isNew && (
                      <span className="h-2 w-2 bg-emerald-500 rounded-full shrink-0" title="New alert" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-2">{item.time}</span>
                </div>
              </div>

              {/* Clear Independent Alert Node Action Button */}
              <button 
                onClick={() => handleClearAlert(item.id)}
                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0 mt-0.5"
                title="Dismiss alert"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            🔔 Your notification feed stream is completely empty.
          </div>
        )}
      </div>
    </div>
  );
}
