"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Shield, Truck } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { CartUpsell } from "./CartUpsell";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const freeShippingThreshold = 75;
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] flex flex-col",
          "transition-transform duration-300 ease-smooth shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gray-700" />
            <h2 className="text-base font-bold text-gray-900">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full
                               flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal < freeShippingThreshold && items.length > 0 && (
          <div className="px-5 py-3 bg-brand-50 border-b border-brand-100">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-brand-700">
                <Truck size={13} />
                {freeShippingProgress < 100 ? (
                  <span>
                    Add <span className="font-bold">{formatPrice(freeShippingThreshold - subtotal)}</span> for free shipping
                  </span>
                ) : (
                  <span className="font-bold text-green-600">You qualify for free shipping!</span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">
                Add some running gear to get started!
              </p>
              <Button onClick={closeCart} variant="primary" size="md">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const primaryImage = item.product.images?.find((i) => i.isPrimary) ?? item.product.images?.[0];
                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl group">
                    {/* Image */}
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="flex-shrink-0 w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm"
                    >
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ShoppingBag size={24} className="text-gray-300" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.product.brand && (
                            <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">
                              {item.product.brand.name}
                            </p>
                          )}
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold text-gray-900 hover:text-brand-500
                                       transition-colors line-clamp-2 leading-tight"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{item.variant.size}</span>
                        <span>·</span>
                        <span>{item.variant.color}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100
                                       text-gray-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100
                                       text-gray-600 transition-colors disabled:opacity-50"
                            disabled={item.quantity >= item.variant.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(item.variant.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-400">
                              {formatPrice(item.variant.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <CartUpsell cartItems={items} />
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5 space-y-4">
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={cn("font-medium", subtotal >= freeShippingThreshold ? "text-green-600" : "text-gray-700")}>
                  {subtotal >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}
                </span>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 py-2">
              {[
                { icon: Shield, text: "Secure payment" },
                { icon: Truck, text: "Fast shipping" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Icon size={12} className="text-green-500" />
                  {text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
                  Checkout — {formatPrice(subtotal)}
                </Button>
              </Link>
              <Link href="/cart" onClick={closeCart}>
                <Button variant="ghost" size="md" fullWidth>
                  View Full Cart
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
