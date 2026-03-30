"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageSquare, ArrowLeft, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SenderType = "CLIENT" | "ADMIN";

type Message = {
  id: string;
  content: string;
  senderType: SenderType;
  createdAt: string;
};

type Conversation = {
  id: string;
  clientName: string;
  subject: string;
  status: string;
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

const STORAGE_KEY = "stride_support_conv";

export default function SupportChatPage() {
  const [step, setStep] = useState<"form" | "chat">("form");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reprendre une conversation existante depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { id } = JSON.parse(saved);
      fetch(`/api/support/conversations/${id}/messages`)
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            setConv(data);
            setMessages(data.messages);
            setStep("chat");
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/support/conversations/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setConv(data);
    }
  }, []);

  // Polling toutes les 5 secondes pour recevoir les réponses admin
  useEffect(() => {
    if (!conv) return;
    const interval = setInterval(() => fetchMessages(conv.id), 5000);
    return () => clearInterval(interval);
  }, [conv?.id, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setStarting(true);
    const res = await fetch("/api/support/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.name,
        clientEmail: form.email,
        subject: form.subject || "Demande de support",
        content: form.message,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setConv(data);
      setMessages(data.messages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: data.id }));
      setStep("chat");
    } else {
      setError("Une erreur est survenue. Réessaie.");
    }
    setStarting(false);
  }

  async function handleSend() {
    if (!reply.trim() || !conv) return;
    setSending(true);
    const res = await fetch(`/api/support/conversations/${conv.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply.trim(), senderType: "CLIENT" }),
    });
    if (res.ok) {
      setReply("");
      await fetchMessages(conv.id);
    }
    setSending(false);
  }

  function handleNewConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setConv(null);
    setMessages([]);
    setForm({ name: "", email: "", subject: "", message: "" });
    setStep("form");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ArrowLeft size={14} /> Retour au support
        </Link>

        {step === "form" ? (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center">
                <MessageSquare size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Contacter le support</h1>
                <p className="text-xs text-gray-400">Réponse dans les meilleurs délais</p>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jean@mail.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Sujet</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Problème avec ma commande"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre problème en détail…"
                  rows={4}
                  className="w-full resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={starting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {starting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Envoyer le message
              </button>
            </form>
          </div>

        ) : (
          <div className="bg-white rounded-3xl shadow-lg flex flex-col" style={{ height: "560px" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                  <MessageSquare size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Support Stride Running</p>
                  <p className="text-xs text-gray-400">
                    {conv?.status === "OPEN"
                      ? "Répond généralement en quelques heures"
                      : "Conversation fermée"}
                  </p>
                </div>
              </div>
              <button onClick={handleNewConversation}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                <ArrowLeft size={12} /> Nouveau
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((msg) => {
                const isAdminMsg = msg.senderType === "ADMIN";
                return (
                  <div key={msg.id} className={cn("flex gap-2.5", isAdminMsg ? "flex-row" : "flex-row-reverse")}>
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                      isAdminMsg ? "bg-brand-500" : "bg-gray-200")}>
                      {isAdminMsg
                        ? <Shield size={12} className="text-white" />
                        : <User size={12} className="text-gray-500" />}
                    </div>
                    <div className={cn("max-w-[75%]", !isAdminMsg && "items-end flex flex-col")}>
                      <div className={cn("px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isAdminMsg
                          ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                          : "bg-brand-500 text-white rounded-tr-sm")}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 px-1">{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Champ de réponse */}
            {conv?.status === "OPEN" ? (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrire un message… (Entrée pour envoyer)"
                    rows={2}
                    className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                  <button onClick={handleSend} disabled={sending || !reply.trim()}
                    className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0">
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400 rounded-b-3xl">
                Cette conversation a été clôturée par le support.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
