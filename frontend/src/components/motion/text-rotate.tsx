"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Cycles through words, letter by letter, in place. */
export function TextRotate({
  words,
  interval = 2600,
  className,
}: {
  words: readonly string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduce]);

  const word = words[index];

  return (
    <span className={`relative inline-flex ${className ?? ""}`} aria-live="polite">
      <span className="sr-only">{word}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={word} aria-hidden className="inline-flex whitespace-pre">
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: "0.5em", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-0.4em", opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.35, delay: i * 0.025, ease: "easeOut" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
