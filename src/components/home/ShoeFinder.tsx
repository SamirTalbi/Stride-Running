"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoeFinderAnswers } from "@/types";

const steps = [
  {
    key: "surface" as const,
    question: "Where do you run most?",
    options: [
      { value: "road", label: "Road / Pavement", icon: "🏙️", desc: "Sidewalks, streets, treadmill" },
      { value: "trail", label: "Trail / Off-road", icon: "🌲", desc: "Dirt, rocks, uneven terrain" },
      { value: "treadmill", label: "Treadmill", icon: "⚡", desc: "Indoor running" },
      { value: "track", label: "Track", icon: "🏟️", desc: "Running track, speed work" },
    ],
  },
  {
    key: "distance" as const,
    question: "What's your typical run distance?",
    options: [
      { value: "short", label: "Short Runs", icon: "🏃", desc: "Under 5K" },
      { value: "medium", label: "Medium Runs", icon: "🏃‍♂️", desc: "5K – 15K" },
      { value: "long", label: "Long Runs", icon: "🏅", desc: "Half marathon+" },
      { value: "ultra", label: "Ultra Distance", icon: "🦅", desc: "Marathon & beyond" },
    ],
  },
  {
    key: "experience" as const,
    question: "How would you describe your experience?",
    options: [
      { value: "beginner", label: "Beginner", icon: "🌱", desc: "Just starting out" },
      { value: "intermediate", label: "Intermediate", icon: "💪", desc: "Running 1+ years" },
      { value: "advanced", label: "Advanced", icon: "🚀", desc: "Competitive runner" },
    ],
  },
  {
    key: "cushion" as const,
    question: "What cushion level do you prefer?",
    options: [
      { value: "minimal", label: "Minimal", icon: "🪶", desc: "Close-to-ground feel" },
      { value: "moderate", label: "Moderate", icon: "⚖️", desc: "Balanced cushioning" },
      { value: "plush", label: "Max Cushion", icon: "☁️", desc: "Maximum comfort" },
    ],
  },
];

const recommendations = [
  {
    name: "Nike Air Zoom Pegasus 40",
    price: 130,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    href: "/products/nike-air-zoom-pegasus-40",
    match: 98,
    tag: "Best Match",
  },
  {
    name: "Brooks Ghost 15",
    price: 140,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop",
    href: "/products/brooks-ghost-15",
    match: 95,
    tag: "Great Choice",
  },
  {
    name: "HOKA Clifton 9",
    price: 145,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=200&h=200&fit=crop",
    href: "/products/hoka-clifton-9",
    match: 91,
    tag: "Worth Considering",
  },
];

export function ShoeFinder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ShoeFinderAnswers>({});
  const [showResults, setShowResults] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep) / steps.length) * 100;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [step.key]: value };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <section className="py-20 bg-dark-DEFAULT overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3">
            Personalized Recommendations
          </p>
          <h2 className="font-display font-black text-display-md text-white mb-4">
            Find Your Perfect Shoe
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Answer 4 quick questions and we&apos;ll match you with the ideal running shoe.
          </p>
        </div>

        <div className="bg-dark-100 rounded-3xl border border-dark-200 overflow-hidden">
          {!showResults ? (
            <>
              {/* Progress bar */}
              <div className="px-8 pt-8 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <span className="text-xs text-brand-400 font-semibold">
                    {Math.round(progress)}% complete
                  </span>
                </div>
                <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
                  {step.question}
                </h3>

                <div className={cn(
                  "grid gap-3",
                  step.options.length === 4 ? "grid-cols-2" : "grid-cols-3"
                )}>
                  {step.options.map((option) => {
                    const isSelected = answers[step.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left",
                          "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                          isSelected
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-dark-200 bg-dark-200/50 hover:border-brand-400/50"
                        )}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="text-sm font-bold text-white">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        i === currentStep ? "w-6 h-2 bg-brand-500" :
                        i < currentStep ? "w-2 h-2 bg-brand-500/50" :
                        "w-2 h-2 bg-dark-200"
                      )}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Results */
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Your Perfect Matches</h3>
                <p className="text-gray-400">Based on your running profile</p>
              </div>

              <div className="space-y-3 mb-8">
                {recommendations.map((rec, i) => (
                  <Link
                    key={rec.href}
                    href={rec.href}
                    className="flex items-center gap-4 p-4 bg-dark-200 rounded-2xl hover:bg-dark-300
                               transition-colors group border border-transparent hover:border-brand-500/30"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-dark-300 rounded-xl overflow-hidden">
                        <Image
                          src={rec.image}
                          alt={rec.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {i === 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 rounded-full
                                        flex items-center justify-center text-[9px] font-black text-white">
                          #1
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          i === 0 ? "bg-brand-500/20 text-brand-400" : "bg-dark-300 text-gray-500"
                        )}>
                          {rec.tag}
                        </span>
                        <span className="text-[10px] text-gray-500">{rec.match}% match</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{rec.name}</p>
                      <p className="text-sm text-brand-400 font-semibold">${rec.price}</p>
                    </div>

                    <ChevronRight size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/find-my-shoe" className="flex-1">
                  <button className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl
                                     hover:bg-brand-600 transition-colors flex items-center justify-center gap-2">
                    See All Recommendations <ArrowRight size={16} />
                  </button>
                </Link>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 border border-dark-200
                             text-gray-400 hover:text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <RotateCcw size={14} /> Retake
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
