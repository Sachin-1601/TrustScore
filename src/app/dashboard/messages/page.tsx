"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CollaborationRequest } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialCollabId = searchParams.get("collaborationId") || "";

  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [selectedCollabId, setSelectedCollabId] = useState(initialCollabId);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // 1. Fetch collaborations
  useEffect(() => {
    async function loadCollabs() {
      try {
        const res = await fetch("/api/collaborations");
        if (res.ok) {
          const data = await res.json();
          const list: CollaborationRequest[] = data.collaborations || [];
          setCollaborations(list);
          if (!selectedCollabId && list.length > 0) {
            setSelectedCollabId(list[0].id);
          }
        }
      } catch {
        // Error
      } finally {
        setIsLoading(false);
      }
    }
    loadCollabs();
  }, [selectedCollabId]);

  // 2. Fetch messages for selected thread
  const fetchMessages = useCallback(async (collabId: string) => {
    if (!collabId) return;
    try {
      const res = await fetch(`/api/messages?collaborationId=${collabId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Error
    }
  }, []);

  useEffect(() => {
    if (selectedCollabId) {
      fetchMessages(selectedCollabId);
    }
  }, [selectedCollabId, fetchMessages]);

  const selectedCollab = collaborations.find((c) => c.id === selectedCollabId) || collaborations[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCollabId || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationId: selectedCollabId,
          text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      }
    } catch {
      // Message send error
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Direct Collaboration Messages"
        subtitle="Threaded communications and creative deliverable coordination with creators"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading conversations...</span>
          </div>
        ) : collaborations.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No active collaboration messages</h3>
            <p className="text-xs text-slate-400">Once you initiate or receive a collaboration proposal, your direct communication thread will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
            {/* Left Column: Collaboration Threads List */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col shadow-xs">
              <h4 className="font-bold text-slate-100 text-xs px-2 pt-1 uppercase tracking-wider text-slate-400">
                Active Collaboration Threads ({collaborations.length})
              </h4>

              <div className="space-y-2 overflow-y-auto flex-1">
                {collaborations.map((collab) => {
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

            {/* Right Column: Chat History & Input */}
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
              {/* Thread Header */}
              {selectedCollab && (
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCollab.creatorAvatar}
                      alt={selectedCollab.creatorUsername}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{selectedCollab.creatorUsername}</h4>
                      <p className="text-[11px] text-slate-400">{selectedCollab.campaignName} • ${selectedCollab.budget}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedCollab.status}
                  </span>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 py-6 overflow-y-auto space-y-4 max-h-[420px]">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No messages in this thread yet. Send a message below to start coordinating.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = user?.id ? msg.senderId === user.id : msg.senderId.includes("business");
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
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
                  })
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message or campaign question..."
                  className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
