"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";
import { Send, CheckCircle2, MessageSquare, Clock, User } from "lucide-react";

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export default function DashboardMessagesPage() {
  const [selectedCollabId, setSelectedCollabId] = useState("collab-101");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-1",
      senderId: "user-sarah-business",
      senderName: "Sarah Jenkins",
      text: "Hi Alex! We've dispatched the GymFuel Hydrate samples to your Melbourne address. Let us know when tracking arrives.",
      createdAt: "2026-08-27T11:00:00Z",
    },
    {
      id: "msg-2",
      senderId: "user-alex-creator",
      senderName: "Alex Rivera",
      text: "Thanks Sarah! Received the parcel today. Testing out the citrus electrolyte blend during tomorrow morning's deadlift session.",
      createdAt: "2026-08-28T09:30:00Z",
    },
    {
      id: "msg-3",
      senderId: "user-sarah-business",
      senderName: "Sarah Jenkins",
      text: "Awesome! Excited to see the first draft Reel. Remember to highlight the zero-sugar isotonic ratio.",
      createdAt: "2026-08-28T10:15:00Z",
    },
  ]);

  const selectedCollab = MOCK_COLLABORATION_REQUESTS.find((c) => c.id === selectedCollabId) || MOCK_COLLABORATION_REQUESTS[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderId: "user-sarah-business",
      senderName: "Sarah Jenkins",
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Direct Collaboration Messages"
        subtitle="Threaded communications and creative deliverable coordination with creators"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
          {/* Left Column: Collaboration Threads List */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col shadow-sm">
            <h4 className="font-bold text-slate-100 text-xs px-2 pt-1 uppercase tracking-wider text-slate-400">
              Active Collaboration Threads ({MOCK_COLLABORATION_REQUESTS.length})
            </h4>

            <div className="space-y-2 overflow-y-auto flex-1">
              {MOCK_COLLABORATION_REQUESTS.map((collab) => {
                const isSelected = collab.id === selectedCollabId;
                return (
                  <button
                    key={collab.id}
                    type="button"
                    onClick={() => setSelectedCollabId(collab.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer border ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/40 text-slate-100"
                        : "bg-slate-950/60 border-slate-800/60 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <img
                      src={collab.creatorAvatar}
                      alt={collab.creatorUsername}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{collab.creatorUsername}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">${collab.budget}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{collab.campaignName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Box */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCollab.creatorAvatar}
                  alt={selectedCollab.creatorUsername}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{selectedCollab.creatorUsername}</h4>
                  <p className="text-xs text-slate-400">Campaign: {selectedCollab.campaignName}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedCollab.status}
              </span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === "user-sarah-business";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to creator..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/25"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
