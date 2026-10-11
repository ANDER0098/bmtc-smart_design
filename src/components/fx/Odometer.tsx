"use client";

/* ============================================================
   PER-DIGIT ROLLING ODOMETER
   Vertical strip digit column with translateY-mod-10 spring
   animation for engineered instrument gauges.
   ============================================================ */

import React from "react";
import { motion } from "framer-motion";

function SingleDigitColumn({ digit, height = 32 }: { digit: string; height?: number }) {
  const isNum = !isNaN(parseInt(digit, 10));

  if (!isNum) {
    return (
      <span className="inline-flex items-center justify-center font-mono" style={{ height }}>
        {digit}
      </span>
    );
  }

  const num = parseInt(digit, 10);

  return (
    <div
      className="relative inline-block overflow-hidden font-mono"
      style={{ height, width: "0.62em" }}
    >
      <motion.div
        className="flex flex-col text-center"
        initial={{ y: 0 }}
        animate={{ y: -num * height }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex items-center justify-center leading-none"
            style={{ height }}
          >
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Odometer({
  value,
  prefix = "",
  suffix = "",
  height = 32,
  className = "",
}: {
  value: string | number;
  prefix?: string;
  suffix?: string;
  height?: number;
  className?: string;
}) {
  const str = String(value);
  const chars = str.split("");

  return (
    <div className={`inline-flex items-center leading-none ${className}`}>
      {prefix && <span>{prefix}</span>}
      {chars.map((ch, idx) => (
        <SingleDigitColumn key={`${idx}-${ch}`} digit={ch} height={height} />
      ))}
      {suffix && <span>{suffix}</span>}
    </div>
  );
}
