"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Mail, Phone, MessageCircle, Package, RotateCcw, Truck,
  HelpCircle, CreditCard, Send, Loader2, CheckCircle, MessageSquare, LogIn,
} from "lucide-react";

const topics = [
  { icon: Package, title: "Problèmes de commande", desc: "Suivre, modifier ou annuler votre commande", href: "/faq#orders" },
  { icon: RotateCcw, title: "Retours", desc: "Initier un retour ou un échange", href: "/shipping-returns#returns" },
  { icon: Truck, title: "Livraison", desc: "Délais de livraison et suivi", href: "/shipping-returns" },
  { icon: CreditCard, title: "Paiement", desc: "Questions de facturation et paiement", href: "/faq#payment" },
  { icon: HelpCircle, title: "Aide produit", desc: "Pointures, conseils et recommandations", href: "/find-my-shoe" },
  { icon: MessageCircle, title: "FAQ générale", desc: "Parcourir toutes les questions fréquentes", href: "/faq" },
];

function ChatCard() {
  return (
    <div className="flex flex-col p-5 bg-white border-2 border-brand-200 rounded-2xl group">
      <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-3">
        <MessageCircle size={18} />
      </div>
      <p className="font-bold text-gray-900 mb-0.5">Chat en direct</p>
      <p className="text-sm text-brand-500 font-medium">Discuter avec un expert</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Disponible aux heures ouvrées</p>
      <button
        onClick={() => {
          // Ouvre le widget flottant
          const btn = document.querySelector<HTMLButtonElement>("[aria-label='Support']");
          btn?.click();
        }}
        className="mt-auto text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors text-left"
      >
        Démarrer le chat →
      </button>
    </div>
  );
}

function LoginCard() {
  return (
    <div className="flex flex-col p-5 bg-gray-50 border border-gray-200 rounded-2xl">
      <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mb-3">
        <MessageCircle size={18} />
      </div>
      <p className="font-bold text-gray-900 mb-0.5">Chat en direct</p>
      <p className="text-sm text-gray-400 font-medium">Réservé aux membres</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Connectez-vous pour accéder au chat</p>
      <Link
        href="/sign-in"
        className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
      >
        <LogIn size={14} /> Se connecter →
      </Link>
    </div>
  );
}

function EmailForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", orderNumber: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.email || !form.message) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    const res = await fetch("/api/support/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSent(true);
    } else {
      setError("Une erreur est survenue. Réessaie ou contacte-nous par email.");
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div className="bg-green-50 rounded-3xl p-8 text-center">
        <CheckCircle size={36} className="mx-auto text-green-500 mb-3" />
        <h2 className="font-display font-black text-xl text-gray-900 mb-2">Message envoyé !</h2>
        <p className="text-sm text-gray-500">Notre équipe vous répondra dans les meilleurs délais à l&apos;adresse <strong>{form.email}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl p-8">
      <h2 className="font-display font-black text-xl text-gray-900 mb-2">Envoyez-nous un message</h2>
      <p className="text-sm text-gray-400 mb-5">Pas de compte ? Remplissez ce formulaire, on vous répond par email.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de commande (optionnel)</label>
          <input
            value={form.orderNumber}
            onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
            placeholder="STR-XXXXXX"
            className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={5}
            placeholder="Décrivez votre problème ou votre question..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Envoyer le message
        </button>
      </form>
    </div>
  );
}

export function SupportContent() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={24} className="text-brand-500" />
        </div>
        <h1 className="font-display font-black text-display-md text-gray-900 mb-3">
          Comment pouvons-nous vous aider ?
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Notre équipe de passionnés de running est là pour vous. Temps de réponse moyen : moins de 2 heures.
        </p>
        {isLoaded && isSignedIn && (
          <p className="mt-3 text-sm text-brand-500 font-semibold">
            Bonjour {user?.firstName ?? user?.username} 👋
          </p>
        )}
      </div>

      {/* Moyens de contact */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <a href="mailto:support@stride.run"
          className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-card hover:border-brand-100 transition-all group">
          <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center mb-3">
            <Mail size={18} />
          </div>
          <p className="font-bold text-gray-900 mb-0.5">Email</p>
          <p className="text-sm text-brand-500 font-medium">support@stride.run</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Réponse sous 2 heures</p>
          <span className="mt-auto text-sm font-semibold text-brand-500 group-hover:text-brand-600 transition-colors">
            Envoyer un email →
          </span>
        </a>

        <a href="tel:+33123456789"
          className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-card hover:border-brand-100 transition-all group">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
            <Phone size={18} />
          </div>
          <p className="font-bold text-gray-900 mb-0.5">Téléphone</p>
          <p className="text-sm text-brand-500 font-medium">+33 1 23 45 67 89</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Lun–Ven, 9h–18h</p>
          <span className="mt-auto text-sm font-semibold text-brand-500 group-hover:text-brand-600 transition-colors">
            Appeler →
          </span>
        </a>

        {/* Chat — conditionnel selon auth */}
        {!isLoaded ? (
          <div className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl animate-pulse">
            <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
            <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        ) : isSignedIn ? (
          <ChatCard />
        ) : (
          <LoginCard />
        )}
      </div>

      {/* Bannière chat si connecté */}
      {isLoaded && isSignedIn && (
        <div className="flex items-center justify-between gap-4 bg-brand-500 text-white rounded-2xl px-6 py-4 mb-12">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Chat en direct disponible</p>
              <p className="text-xs text-white/70">Utilisez la bulle en bas à droite pour accéder à vos conversations</p>
            </div>
          </div>
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>("[aria-label='Support']");
              btn?.click();
            }}
            className="flex-shrink-0 px-4 py-2 bg-white text-brand-500 text-xs font-bold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Ouvrir le chat
          </button>
        </div>
      )}

      {/* Sujets fréquents */}
      <h2 className="font-display font-black text-xl text-gray-900 mb-4">Sujets fréquents</h2>
      <div className="grid md:grid-cols-2 gap-3 mb-12">
        {topics.map(({ icon: Icon, title, desc, href }) => (
          <Link key={title} href={href}
            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand-200 hover:shadow-card transition-all group">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
              <Icon size={17} className="text-gray-500 group-hover:text-brand-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Formulaire email — uniquement si non connecté */}
      {isLoaded && !isSignedIn && <EmailForm />}

      {/* Si connecté : pas de formulaire email, le chat suffit */}
      {isLoaded && isSignedIn && (
        <div className="text-center py-6 text-sm text-gray-400">
          Besoin d&apos;aide supplémentaire ?{" "}
          <a href="mailto:support@stride.run" className="text-brand-500 hover:underline font-semibold">
            Écrivez-nous par email
          </a>
        </div>
      )}
    </div>
  );
}
