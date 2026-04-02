"use client";

import { useState } from "react";
import { Save, Loader2, Store, Truck, Globe, Mail, Server, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [store, setStore] = useState({
    name: "Stride Running",
    email: "hello@striderunning.com",
    phone: "+1-800-786-7433",
    currency: "USD",
    language: "en",
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: "75",
    standardRate: "9.99",
    expressRate: "19.99",
    processingDays: "1-2",
  });

  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    password: "",
    fromName: "Stride Running",
    fromEmail: "support@striderunning.com",
    secure: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<"success" | "error" | null>(null);

  const [notifications, setNotifications] = useState({
    orderConfirmation: true,
    orderShipped: true,
    lowStock: true,
    newCustomer: false,
  });

  async function handleTestSmtp() {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/admin/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtp),
      });
      setSmtpTestResult(res.ok ? "success" : "error");
    } catch {
      setSmtpTestResult("error");
    }
    setTestingSmtp(false);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure your store preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Store size={18} className="text-brand-500" />
            <h2 className="font-bold text-gray-900">Store Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                value={store.name}
                onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={store.email}
                onChange={(e) => setStore((s) => ({ ...s, email: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={store.phone}
                onChange={(e) => setStore((s) => ({ ...s, phone: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={store.currency}
                onChange={(e) => setStore((s) => ({ ...s, currency: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CNY">CNY — Chinese Yuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={store.language}
                onChange={(e) => setStore((s) => ({ ...s, language: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Truck size={18} className="text-brand-500" />
            <h2 className="font-bold text-gray-900">Shipping</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                value={shipping.freeShippingThreshold}
                onChange={(e) => setShipping((s) => ({ ...s, freeShippingThreshold: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Rate ($)</label>
              <input
                type="number"
                value={shipping.standardRate}
                onChange={(e) => setShipping((s) => ({ ...s, standardRate: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Express Rate ($)</label>
              <input
                type="number"
                value={shipping.expressRate}
                onChange={(e) => setShipping((s) => ({ ...s, expressRate: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
              <input
                value={shipping.processingDays}
                onChange={(e) => setShipping((s) => ({ ...s, processingDays: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="1-2 days"
              />
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-brand-500" />
              <h2 className="font-bold text-gray-900">Configuration SMTP</h2>
            </div>
            <button
              onClick={handleTestSmtp}
              disabled={testingSmtp || !smtp.host || !smtp.user}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {testingSmtp ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              Tester la connexion
            </button>
          </div>

          {smtpTestResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold mb-4 ${smtpTestResult === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {smtpTestResult === "success"
                ? <><CheckCircle size={13} /> Connexion SMTP réussie — email de test envoyé</>
                : <><Server size={13} /> Échec de connexion — vérifiez vos paramètres</>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Serveur SMTP (host)</label>
              <input
                value={smtp.host}
                onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <select
                value={smtp.port}
                onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="587">587 — STARTTLS</option>
                <option value="465">465 — SSL/TLS</option>
                <option value="25">25 — Non sécurisé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
              <input
                value={smtp.user}
                onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
                placeholder="votre@email.com"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={smtp.password}
                  onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
              <input
                value={smtp.fromName}
                onChange={(e) => setSmtp((s) => ({ ...s, fromName: e.target.value }))}
                placeholder="Stride Running"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email expéditeur</label>
              <input
                type="email"
                value={smtp.fromEmail}
                onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))}
                placeholder="support@striderunning.com"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smtp.secure}
                  onChange={(e) => setSmtp((s) => ({ ...s, secure: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-sm text-gray-700">Connexion SSL/TLS (port 465)</span>
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Pour Gmail : activez l&apos;accès aux applications moins sécurisées ou utilisez un mot de passe d&apos;application.
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={18} className="text-brand-500" />
            <h2 className="font-bold text-gray-900">Email Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "orderConfirmation", label: "Order Confirmation", desc: "Send email when a new order is placed" },
              { key: "orderShipped", label: "Order Shipped", desc: "Send email when order status changes to Shipped" },
              { key: "lowStock", label: "Low Stock Alert", desc: "Notify when a product has less than 5 units" },
              { key: "newCustomer", label: "New Customer", desc: "Notify when a new customer registers" },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => setNotifications((n) => ({ ...n, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500 flex-shrink-0"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-4">
            ⚠️ Email sending requires Resend API key in your .env file
          </p>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-brand-500" />
            <h2 className="font-bold text-gray-900">Integrations</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Clerk Auth", status: true, desc: "Authentication & user management" },
              { name: "Neon PostgreSQL", status: true, desc: "Database" },
              { name: "Cloudinary", status: true, desc: "Image storage & optimization" },
              { name: "Stripe", status: false, desc: "Payment processing — needs API keys" },
              { name: "Resend", status: false, desc: "Transactional emails — needs API key" },
            ].map(({ name, status, desc }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {status ? "Connected" : "Not configured"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
