"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, RefreshCw, Sparkles, X } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import {
  questions,
  findBestOutfit,
  getSlotLabel,
  type OutfitSlot,
  type QuizSelections,
} from "../components/OutfitBuilder/outfitData";

import styles from "./OutfitBuilderPage.module.css";

const TOTAL_STEPS = questions.length;

export default function OutfitBuilderPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<QuizSelections>({
    event: null,
    mood: null,
    fabric: null,
    colors: [],
    size: null,
  });
  const [showResults, setShowResults] = useState(false);
  const [key, setKey] = useState(0);

  const current = questions[step];
  const currentVal = selections[current.id as keyof QuizSelections] as string | string[] | null;

  const isSelected = useCallback(
    (value: string) => {
      if (current.multiple) {
        return (currentVal as string[] || []).includes(value);
      }
      return currentVal === value;
    },
    [current.multiple, currentVal]
  );

  const handleSelect = (value: string) => {
    if (current.multiple) {
      const arr = (selections.colors as string[]) || [];
      const next = arr.includes(value)
        ? arr.filter((c) => c !== value)
        : [...arr, value];
      setSelections((prev) => ({ ...prev, colors: next }));
    } else {
      setSelections((prev) => ({ ...prev, [current.id]: value }));
    }
  };

  const canProceed = () => {
    if (current.multiple) return true;
    return currentVal !== null && currentVal !== "";
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setShowResults(true);
      setKey((k) => k + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleRetake = () => {
    setStep(0);
    setShowResults(false);
    setSelections({ event: null, mood: null, fabric: null, colors: [], size: null });
  };

  const outfit = showResults ? findBestOutfit(selections) : [];
  const slots: OutfitSlot[] = ["top", "bottom", "bag", "shoes", "accessory"];

  return (
    <div className={styles.page}>
      <Navbar compact />

      {/* Simple PageHeader equivalent */}
      <section className="pageHeader" style={{ background: "#111", color: "white", padding: "140px 40px 50px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-logo)", fontSize: "2.6rem", fontWeight: 400, lineHeight: 1.15 }}>
          {showResults ? "Your Curated Outfit" : "Prepare Your Outfit"}
        </h1>
        <p style={{ marginTop: 8, fontSize: ".9rem", fontWeight: 300, opacity: 0.6, letterSpacing: ".04em" }}>
          {showResults
            ? "A complete look crafted just for you"
            : "Answer a few questions and let us style you"}
        </p>
      </section>

      <section className={styles.content}>
        {!showResults ? (
          <>
            {/* PROGRESS BAR */}
            <div className={styles.progress}>
              {questions.map((_, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className={`${styles.progressDot} ${
                      i === step ? styles.progressDotActive : i < step ? styles.progressDotDone : ""
                    }`}
                  />
                  {i < questions.length - 1 && (
                    <span className={`${styles.progressLine} ${i < step ? styles.progressLineActive : ""}`} />
                  )}
                </span>
              ))}
            </div>

            {/* STEP */}
            <div className={styles.step} key={step}>
              <p className={styles.stepLabel}>
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <h2 className={styles.stepQuestion}>{current.question}</h2>

              {current.id === "colors" ? (
                <div className={styles.colorsGrid}>
                  {current.options.map((opt) => {
                    const colorMap: Record<string, string> = {
                      black: "#111",
                      white: "#f5f5f5",
                      beige: "#e8dcc8",
                      blue: "#4a6fa5",
                      red: "#c0392b",
                      green: "#5d8a5d",
                      pink: "#d4a0a0",
                      brown: "#8b6f47",
                    };
                    const bg = colorMap[opt.value] || "#ddd";
                    const selected = isSelected(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`${styles.colorSwatch} ${selected ? styles.colorSwatchSelected : ""}`}
                        style={{ background: bg, borderColor: opt.value === "white" ? "#ddd" : undefined }}
                        title={opt.label}
                        aria-label={opt.label}
                      >
                        {selected && (
                          <Check
                            size={18}
                            strokeWidth={2.5}
                            className={styles.colorSwatchCheck}
                            style={{ color: ["white", "beige"].includes(opt.value) ? "#111" : "white" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : current.id === "size" ? (
                <div className={styles.sizesGrid}>
                  {current.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`${styles.sizeCard} ${isSelected(opt.value) ? styles.sizeCardSelected : ""}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.optionsGrid}>
                  {current.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`${styles.optionCard} ${isSelected(opt.value) ? styles.optionCardSelected : ""}`}
                    >
                      {opt.emoji && <span className={styles.optionEmoji}>{opt.emoji}</span>}
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className={styles.actions}>
              {step > 0 ? (
                <button onClick={handleBack} className={styles.backBtn}>
                  <ArrowLeft size={14} strokeWidth={1.5} />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={styles.nextBtn}
              >
                {step < TOTAL_STEPS - 1 ? (
                  <>
                    Next
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </>
                ) : (
                  <>
                    <Sparkles size={14} strokeWidth={1.5} />
                    Reveal My Outfit
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* ===================== RESULTS ===================== */
          <div className={styles.results} key={key}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsLabel}>Your personalized look</p>
              <h2 className={styles.resultsTitle}>A Complete Ensemble</h2>
              <p className={styles.resultsSubtitle}>
                Every piece selected with care to match your preferences
              </p>
            </div>

            <div className={styles.resultsGrid}>
              {slots.map((slot) => {
                const item = outfit.find((o) => o.slot === slot);
                return (
                  <div key={slot} className={styles.resultCard}>
                    <div className={styles.resultImage}>
                      {item ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ddd",
                            fontSize: 11,
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                          }}
                        >
                          Not included
                        </div>
                      )}
                    </div>
                    <span className={styles.resultSlot}>{getSlotLabel(slot)}</span>
                    {item && (
                      <>
                        <Link
                          href={`/products/${item.product.id}`}
                          className={styles.resultName}
                        >
                          {item.product.name}
                        </Link>
                        <span className={styles.resultPrice}>{item.product.price}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.resultsActions}>
              <button onClick={handleRetake} className={styles.retakeBtn}>
                <RefreshCw size={14} strokeWidth={1.5} />
                Start Over
              </button>
              <Link href="/products" className={styles.shopBtn}>
                <Sparkles size={14} strokeWidth={1.5} />
                Shop This Look
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
