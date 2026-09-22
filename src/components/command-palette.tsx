"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/config/site";

interface CommandItem {
  label: string;
  hint: string;
  run: () => void;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<CommandItem[]>(
    () => [
      { label: "前往 首页", hint: "导航", run: () => router.push("/") },
      { label: "前往 作品", hint: "导航", run: () => router.push("/works") },
      { label: "前往 好玩的", hint: "导航", run: () => router.push("/fun") },
      { label: "主题 亮色", hint: "切换", run: () => setTheme("light") },
      { label: "主题 暗色", hint: "切换", run: () => setTheme("dark") },
      { label: "主题 跟随系统", hint: "切换", run: () => setTheme("system") },
      {
        label: `复制邮箱 ${site.email}`,
        hint: "复制",
        run: () => void copyText(site.email),
      },
      {
        label: "写邮件给我",
        hint: "联系",
        run: () => {
          window.location.href = `mailto:${site.email}`;
        },
      },
    ],
    [router, setTheme],
  );

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="命令面板"
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute left-1/2 top-[16vh] w-[min(92vw,460px)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/20">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入命令或搜索…"
          className="w-full border-b border-line bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-mute/70"
        />
        <ul className="max-h-[46vh] overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-mute">
              没有匹配的命令
            </li>
          )}
          {filtered.map((item, i) => (
            <li key={item.label}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  item.run();
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                  i === active
                    ? "bg-accent-soft text-ink"
                    : "text-mute hover:text-ink"
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-3 shrink-0 text-[11px] text-mute">
                  {item.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[11px] text-mute">
          <span>↑↓ 选择</span>
          <span>↵ 确认</span>
          <span>esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
