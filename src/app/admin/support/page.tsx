"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageSquare, Send, CheckCircle, Circle, Loader2, User, Shield, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SenderType = "CLIENT" | "ADMIN";
type ConvStatus = "OPEN" | "CLOSED";

type Message = {
  id: string;
  content: string;
  senderType: SenderType;
  createdAt: string;
};

type Conversation = {
  id: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  status: ConvStatus;
  updatedAt: string;
  createdAt: string;
  messages: Message[];
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [deleting, setDeleting] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/support/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
    setLoading(false);
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/support/conversations/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setSelected(data);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);
    const interval = setInterval(() => fetchMessages(selected.id), 5000);
    return () => clearInterval(interval);
  }, [selected?.id, fetchMessages]);

  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const res = await fetch(`/api/support/conversations/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply.trim(), senderType: "ADMIN" }),
    });
    if (res.ok) {
      setReply("");
      await fetchMessages(selected.id);
      await fetchConversations();
    }
    setSending(false);
  }

  async function handleDelete() {
    if (!selected || !confirm(`Supprimer la conversation de ${selected.clientName} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    await fetch(`/api/support/conversations/${selected.id}`, { method: "DELETE" });
    setSelected(null);
    setMessages([]);
    await fetchConversations();
    setDeleting(false);
  }

  async function toggleStatus() {
    if (!selected) return;
    const newStatus: ConvStatus = selected.status === "OPEN" ? "CLOSED" : "OPEN";
    await fetch(`/api/support/conversations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchConversations();
    await fetchMessages(selected.id);
  }

  const filtered = conversations.filter((c) =>
    filter === "ALL" ? true : c.status === filter
  );

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Sidebar — liste des conversations */}
      <div className={cn(
        "w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col",
        selected ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-black text-gray-900">Support</h1>
          <p className="text-xs text-gray-400 mt-0.5">{conversations.filter(c => c.status === "OPEN").length} conversation(s) ouverte(s)</p>
          <div className="flex gap-1 mt-3 bg-gray-100 rounded-xl p-1">
            {(["ALL", "OPEN", "CLOSED"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("flex-1 py-1 rounded-lg text-xs font-semibold transition-all",
                  filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                {f === "ALL" ? "Tous" : f === "OPEN" ? "Ouverts" : "Fermés"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-brand-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Aucune conversation</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const lastMsg = conv.messages[0];
              return (
                <button key={conv.id} onClick={() => fetchMessages(conv.id)}
                  className={cn("w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                    selected?.id === conv.id && "bg-brand-50 border-l-2 border-l-brand-500")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.clientName}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.clientEmail}</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">{conv.subject}</p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{lastMsg.content}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{timeAgo(conv.updatedAt)}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                        conv.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                        {conv.status === "OPEN" ? "Ouvert" : "Fermé"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Panneau de droite — thread */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSelected(null)}
                className="md:hidden text-gray-400 hover:text-gray-600 flex-shrink-0">
                ←
              </button>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{selected.clientName}</p>
                <p className="text-xs text-gray-400 truncate">{selected.clientEmail} · {selected.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleStatus}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                  selected.status === "OPEN"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-green-50 text-green-700 hover:bg-green-100")}>
                {selected.status === "OPEN"
                  ? <><CheckCircle size={13} /> Marquer fermé</>
                  : <><Circle size={13} /> Rouvrir</>}
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40">
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Supprimer
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesScrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.senderType === "ADMIN";
              return (
                <div key={msg.id} className={cn("flex gap-3", isAdmin && "flex-row-reverse")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                    isAdmin ? "bg-brand-500" : "bg-gray-200")}>
                    {isAdmin
                      ? <Shield size={13} className="text-white" />
                      : <User size={13} className="text-gray-500" />}
                  </div>
                  <div className={cn("max-w-[70%]", isAdmin && "items-end flex flex-col")}>
                    <div className={cn("px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isAdmin
                        ? "bg-brand-500 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm")}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 px-1">{timeAgo(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Champ de réponse */}
          {selected.status === "OPEN" ? (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Écrire une réponse… (Entrée pour envoyer)"
                  rows={3}
                  className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
                <button onClick={handleSend} disabled={sending || !reply.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors disabled:opacity-40">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
              Cette conversation est fermée.{" "}
              <button onClick={toggleStatus} className="text-brand-500 hover:underline">La rouvrir</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sélectionne une conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
