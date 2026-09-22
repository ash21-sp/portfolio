"use client";

import { useEffect, useState } from "react";

export function RotatingTagline({
  phrases,
  className,
}: {
  phrases: readonly string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <p className={className}>
      <span key={index} className="tag-fade inline-block">
        {phrases[index]}
      </span>
      <span className="cursor-blink ml-0.5 inline-block text-accent" aria-hidden>
        ▌
      </span>
    </p>
  );
}
