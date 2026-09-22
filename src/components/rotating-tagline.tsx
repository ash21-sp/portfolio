"use client";

import { useEffect, useState } from "react";

// 模块级状态：在整个网站会话期间共享（切页不会清零）。
// 身份栏随页面切换会重新挂载，把轮换序号放在这里，
// 切换主页/作品/好玩的后，标语从上一次显示的位置接着轮换。
let lastIndex = 0;

export function RotatingTagline({
  phrases,
  className,
}: {
  phrases: readonly string[];
  className?: string;
}) {
  const [index, setIndex] = useState(() =>
    lastIndex < phrases.length ? lastIndex : 0,
  );

  // 记住当前序号，供下次挂载（切页）时续接
  useEffect(() => {
    lastIndex = index;
  }, [index]);

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
