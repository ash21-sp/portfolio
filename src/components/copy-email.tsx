"use client";

import { useRef, useState } from "react";
import { Mail } from "lucide-react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="点击复制邮箱"
      className="group/copy flex items-center gap-2 text-left text-[13px]"
    >
      <Mail className="size-4 shrink-0 text-mute" aria-hidden />
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate">{email}</span>
        <span
          className={`shrink-0 text-[11px] transition-colors ${
            copied ? "text-accent" : "text-mute/70 group-hover/copy:text-mute"
          }`}
          aria-live="polite"
        >
          {copied ? "已复制 ✓" : "点击复制"}
        </span>
      </span>
    </button>
  );
}
