"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight, Lock, Check, CreditCard, Truck, Package, ShoppingBag,
  ArrowLeft, Shield, Tag, X, Loader2
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Step = "information" | "payment" | "confirmation";

const infoSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(5),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  zip: z.string().min(5),
  phone: z.string().optional(),
});

type InfoForm = z.infer<typeof infoSchema>;

const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "information", label: "Informations", icon: Package },
  { key: "payment",     label: "Paiement",     icon: CreditCard },
  { key: "confirmation",label: "Confirmation", icon: Check },
];

// Livraison unique — dropshipping depuis la Chine via hub Europe
const SHIPPING_PRICE = 9.99;
const FREE_SHIPPING_THRESHOLD = 75;

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("information");
  const [orderNumber, setOrderNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ id: string; code: string; type: string; value: number; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.type === "FREE_SHIPPING";
  const shippingCost = isFreeShipping ? 0 : SHIPPING_PRICE;
  const discount = coupon?.discountAmount ?? 0;
  const tax = (subtotal - discount) * 0.20; // TVA 20%
  const total = subtotal - discount + shippingCost + tax;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const json = await res.json();
      if (!res.ok) { setCouponError(json.error); return; }
      setCoupon(json.coupon);
      setCouponCode("");
    } finally {
      setCouponLoading(false);
    }
  }

  const [infoData, setInfoData] = useState<InfoForm | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
  });

  const onInfoSubmit = (data: InfoForm) => {
    setInfoData(data);
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!infoData) return;
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: infoData.email,
          items: items.map((i) => ({
            productId: i.product.id,
            variantId: i.variant.id,
            quantity: i.quantity,
          })),
          shippingAddress: {
            firstName: infoData.firstName,
            lastName: infoData.lastName,
            address1: infoData.address1,
            address2: infoData.address2,
            city: infoData.city,
            state: infoData.state ?? "",
            zip: infoData.zip,
            phone: infoData.phone,
            country: "FR",
          },
          couponCode: coupon?.code,
          // Pas de paymentIntentId — paiement simulé pour les tests
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setPaymentError(json.error ?? "Une erreur est survenue.");
        return;
      }

      setOrderNumber(json.data.orderNumber);
      clearCart();
      setStep("confirmation");
    } catch {
      setPaymentError("Impossible de contacter le serveur.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-6">Ajoutez des articles avant de passer commande</p>
        <Link href="/men">
          <Button variant="primary" size="lg">Continuer mes achats</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="font-display font-black text-xl text-gray-900">
          STRIDE
        </Link>
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <Lock size={12} />
          Paiement sécurisé
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 mb-10 max-w-md">
        {steps.slice(0, 2).map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i < currentStepIndex) setStep(s.key);
              }}
              disabled={i > currentStepIndex}
              className="flex items-center gap-1.5"
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                s.key === step ? "bg-brand-500 text-white" :
                i < currentStepIndex ? "bg-green-500 text-white" :
                "bg-gray-100 text-gray-400"
              )}>
                {i < currentStepIndex ? <Check size={12} /> : i + 1}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:block",
                s.key === step ? "text-gray-900" : "text-gray-400"
              )}>
                {s.label}
              </span>
            </button>
            {i < 1 && (
              <ChevronRight size={14} className="text-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form area */}
        <div className="flex-1">
          {step === "information" && (
            <form onSubmit={handleSubmit(onInfoSubmit)} className="space-y-5">
              <h2 className="text-lg font-black text-gray-900">Informations de contact</h2>
              <Input label="Email" type="email" placeholder="vous@exemple.com" error={errors.email?.message} {...register("email")} />

              <h2 className="text-lg font-black text-gray-900 pt-4">Adresse de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" placeholder="Jean" error={errors.firstName?.message} {...register("firstName")} />
                <Input label="Nom" placeholder="Dupont" error={errors.lastName?.message} {...register("lastName")} />
              </div>
              <Input label="Adresse" placeholder="12 rue de la Paix" error={errors.address1?.message} {...register("address1")} />
              <Input label="Complément d'adresse (optionnel)" placeholder="Appartement, bâtiment…" {...register("address2")} />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input label="Ville" placeholder="Paris" error={errors.city?.message} {...register("city")} />
                </div>
                <Input label="Code postal" placeholder="75001" error={errors.zip?.message} {...register("zip")} />
              </div>
              <Input label="Téléphone (optionnel)" type="tel" placeholder="+33 6 12 34 56 78" {...register("phone")} />

              <div className="flex items-center justify-between pt-4">
                <Link href="/cart" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={14} /> Retour au panier
                </Link>
                <Button type="submit" variant="primary" size="lg" rightIcon={<ChevronRight size={16} />}>
                  Continuer vers la livraison
                </Button>
              </div>
            </form>
          )}


          {step === "payment" && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-900">Paiement</h2>

              {/* Express checkout */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium text-center">Paiement rapide</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Apple Pay", "Google Pay", "PayPal"].map((method) => (
                    <button
                      key={method}
                      className="h-12 bg-black rounded-xl text-white text-sm font-semibold
                                 hover:bg-gray-900 transition-colors"
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ou payer par carte</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>

              {/* Card form */}
              <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Informations de carte</span>
                </div>
                <Input label="Numéro de carte" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date d'expiration" placeholder="MM / AA" />
                  <Input label="CVV" placeholder="123" />
                </div>
                <Input label="Nom sur la carte" placeholder="Jean Dupont" />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield size={12} className="text-green-500" />
                Vos informations de paiement sont chiffrées et sécurisées
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {paymentError}
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setStep("information")}
                  disabled={paymentLoading}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={paymentLoading}
                  variant="primary"
                  size="xl"
                  leftIcon={paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                >
                  {paymentLoading ? "Redirection…" : `Payer ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={36} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Commande confirmée !</h1>
              <p className="text-gray-600 mb-2">
                Merci ! Votre commande <span className="font-bold text-brand-500">{orderNumber}</span> a bien été passée.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Un email de confirmation a été envoyé à votre adresse email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/account">
                  <Button variant="primary" size="lg">Suivre ma commande</Button>
                </Link>
                <Link href="/men">
                  <Button variant="outline" size="lg">Continuer mes achats</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        {step !== "confirmation" && (
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Récapitulatif ({items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""})</h3>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const img = item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-100">
                          {img && (
                            <Image src={img.url} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.variant.size} · {item.variant.color}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.variant.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="mb-5">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2 text-green-700">
                      <Tag size={14} />
                      <span className="text-sm font-bold font-mono">{coupon.code}</span>
                      <span className="text-xs">
                        {coupon.type === "FREE_SHIPPING" ? "Livraison offerte" :
                         coupon.type === "PERCENTAGE" ? `${coupon.value}% de réduction` :
                         `${coupon.value} € de réduction`} appliqué
                      </span>
                    </div>
                    <button onClick={() => setCoupon(null)} className="text-green-600 hover:text-green-800">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder="Code promo"
                        className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-mono
                                   focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 h-10 bg-white border border-gray-200 rounded-lg text-sm font-medium
                                   text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        {couponLoading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Réduction ({coupon?.code})</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                {isFreeShipping && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Livraison offerte ({coupon?.code})</span>
                    <span className="font-medium">Appliquée</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <div>
                    <span className="text-gray-500">Livraison internationale</span>
                    <p className="text-xs text-gray-400">15–25 jours ouvrés · Colissimo</p>
                  </div>
                  <span className={cn("font-medium", shippingCost === 0 && "text-green-600")}>
                    {shippingCost === 0 ? "GRATUIT" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA (estimée)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-gray-200 pt-3 mt-3">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
