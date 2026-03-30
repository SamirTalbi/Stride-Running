"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, Shield, Minimize2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
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

export function ChatWidget() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/support/conversations/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => {
        const newAdminCount = data.messages.filter((m: Message) => m.senderType === "ADMIN").length;
        const oldAdminCount = prev.filter((m) => m.senderType === "ADMIN").length;
        if (!open && newAdminCount > oldAdminCount) {
          setUnread((u) => u + (newAdminCount - oldAdminCount));
        }
        return data.messages;
      });
      setConv(data);
    }
  }, [open]);

  // Reprendre conversation existante depuis le localStorage
  useEffect(() => {
    if (!isSignedIn) return;
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
  }, [isSignedIn]);

  // Polling toutes les 5 secondes
  useEffect(() => {
    if (!conv) return;
    const interval = setInterval(() => fetchMessages(conv.id), 5000);
    return () => clearInterval(interval);
  }, [conv?.id, fetchMessages]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstMessage.trim()) {
      setError("Merci d'écrire un message.");
      return;
    }
    setStarting(true);

    const clientName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.username || "Client";
    const clientEmail = user?.primaryEmailAddress?.emailAddress ?? "";

    const res = await fetch("/api/support/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientEmail,
        subject: subject.trim() || "Demande de support",
        content: firstMessage.trim(),
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
      setTimeout(scrollToBottom, 50);
    }
    setSending(false);
  }

  function handleNewConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setConv(null);
    setMessages([]);
    setSubject("");
    setFirstMessage("");
    setStep("form");
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[360px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="bg-brand-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Support Stride</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                  <p className="text-[11px] text-white/70">En ligne</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {step === "chat" && (
                <button onClick={handleNewConversation}
                  className="px-2 py-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[11px] font-semibold">
                  Nouveau
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Contenu */}
          {!isSignedIn ? (
            /* Non connecté */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <LogIn size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Connexion requise</p>
              <p className="text-xs text-gray-400 mb-5">
                Connectez-vous pour accéder au support et retrouver vos conversations.
              </p>
              <Link href="/sign-in"
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors">
                Se connecter
              </Link>
            </div>

          ) : step === "form" ? (
            /* Formulaire de démarrage */
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-500 font-bold text-sm flex-shrink-0">
                  {(user?.firstName?.[0] ?? user?.username?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.username}
                  </p>
                  <p className="text-[10px] text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">Comment pouvons-nous vous aider ?</p>

              <form onSubmit={handleStart} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sujet</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Problème avec ma commande"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Message *</label>
                  <textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="Décrivez votre problème…"
                    rows={4}
                    className="w-full resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" disabled={starting}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {starting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Démarrer la conversation
                </button>
              </form>
            </div>

          ) : (
            /* Thread de messages */
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg) => {
                  const isAdminMsg = msg.senderType === "ADMIN";
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isAdminMsg ? "flex-row" : "flex-row-reverse")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold",
                        isAdminMsg ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-600")}>
                        {isAdminMsg
                          ? <Shield size={11} className="text-white" />
                          : (user?.firstName?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div className={cn("max-w-[78%]", !isAdminMsg && "items-end flex flex-col")}>
                        <div className={cn("px-3 py-2 rounded-2xl text-sm leading-relaxed",
                          isAdminMsg
                            ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                            : "bg-brand-500 text-white rounded-tr-sm")}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 px-1">{timeAgo(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {conv?.status === "OPEN" ? (
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
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
                      placeholder="Écrire un message…"
                      rows={2}
                      className="flex-1 resize-none border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                    <button onClick={handleSend} disabled={sending || !reply.trim()}
                      className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0">
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-gray-100 text-center text-xs text-gray-400 flex-shrink-0">
                  Conversation clôturée.{" "}
                  <button onClick={handleNewConversation} className="text-brand-500 hover:underline">
                    Nouveau message
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          open ? "bg-gray-700 hover:bg-gray-800" : "bg-brand-500 hover:bg-brand-600"
        )}
        aria-label="Support"
      >
        {open ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
