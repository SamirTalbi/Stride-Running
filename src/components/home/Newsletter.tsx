"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle, Gift, Zap, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const perks = [
    { icon: Tag, text: "10% off your first order" },
    { icon: Zap, text: "Early access to new drops" },
    { icon: Gift, text: "Exclusive member-only deals" },
  ];

  return (
    <section className="py-20 bg-brand-500 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 lg:px-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <Mail size={28} className="text-white" />
        </div>

        <h2 className="font-display font-black text-white text-display-md mb-4">
          Join the Stride Community
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
          Get training tips, gear drops, and exclusive offers straight to your inbox.
        </p>

        {/* Perks */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {perks.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-white/90">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Icon size={12} className="text-white" />
              </div>
              {text}
            </div>
          ))}
        </div>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full h-12 bg-white text-gray-900 placeholder:text-gray-400 text-sm
                           pl-10 pr-4 rounded-xl border-0 outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={16} />}
              className="bg-dark-DEFAULT hover:bg-dark-100 text-white"
            >
              Subscribe
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 py-4 animate-scale-in">
            <CheckCircle size={24} className="text-white" />
            <div className="text-white text-left">
              <p className="font-bold">You&apos;re in! Check your email.</p>
              <p className="text-sm text-white/80">Your 10% off code is on its way.</p>
            </div>
          </div>
        )}

        <p className="text-white/50 text-xs mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
