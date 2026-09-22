"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Search } from "lucide-react";
import { site } from "@/config/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { RotatingTagline } from "@/components/rotating-tagline";
import { CopyEmail } from "@/components/copy-email";
import { SocialRail, SocialChips } from "@/components/social-rail";

const NAV_LINKS = [
  { href: "/", label: "主页" },
  { href: "/works", label: "作品" },
  { href: "/fun", label: "好玩的" },
];

export function SiteChrome() {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ---- 桌面端：左侧固定身份栏 ---- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[320px] flex-col border-r border-line bg-paper px-8 py-10 lg:flex">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-tight"
          aria-label="回到首页"
        >
          {site.logo}
          <span className="text-accent">.</span>
        </Link>

        <div className="mt-12 flex items-center gap-4">
          {/* ← 替换头像：public/avatar.jpg，路径在 src/config/site.ts */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.avatar}
            alt={`${site.name}的头像`}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-full border border-line object-cover"
          />
          <div className="min-w-0">
            <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <span className="truncate">{site.name}</span>
              <BadgeCheck
                className="size-4 shrink-0 fill-accent text-paper"
                aria-label="认证"
              />
            </h1>
            <RotatingTagline
              phrases={site.taglines}
              className="mt-1 truncate text-[13px] text-mute"
            />
          </div>
        </div>

        <nav className="mt-12 flex flex-col gap-1" aria-label="主导航">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive(link.href)
                  ? "text-ink"
                  : "text-mute hover:text-ink"
              }`}
            >
              <span
                className={`inline-block size-1.5 rounded-full ${
                  isActive(link.href) ? "bg-accent" : "bg-transparent"
                }`}
                aria-hidden
              />
              {link.label}
            </Link>
          ))}
        </nav>

        <SocialRail />

        <div className="mt-auto border-t border-line pt-6">
          <CopyEmail email={site.email} />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-mute/70">{site.location}</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                aria-label="打开命令面板"
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] text-mute transition-colors hover:text-ink"
              >
                <Search className="size-3" aria-hidden />
                <kbd className="tracking-wide">⌘K</kbd>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ---- 移动端：顶部导航栏 ---- */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-6">
          <Link
            href="/"
            className="text-[15px] font-bold tracking-tight"
            aria-label="回到首页"
          >
            {site.logo}
            <span className="text-accent">.</span>
          </Link>
          <nav className="flex items-center gap-0.5 text-[13px]" aria-label="主导航">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors ${
                  isActive(link.href) ? "text-ink" : "text-mute hover:text-ink"
                }`}
              >
                {isActive(link.href) && (
                  <span className="text-accent" aria-hidden>
                    •
                  </span>
                )}
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <button
              type="button"
              aria-label="打开命令面板"
              onClick={() => setPaletteOpen(true)}
              className="flex size-8 items-center justify-center rounded-md text-mute transition-colors hover:text-ink"
            >
              <Search className="size-4" aria-hidden />
            </button>
          </nav>
        </div>
      </header>

      {/* ---- 移动端：身份块（桌面端此信息在左侧栏） ---- */}
      <div className="px-6 pt-8 lg:hidden">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.avatar}
            alt={`${site.name}的头像`}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-full border border-line object-cover"
          />
          <div className="min-w-0">
            <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <span className="truncate">{site.name}</span>
              <BadgeCheck
                className="size-4 shrink-0 fill-accent text-paper"
                aria-label="认证"
              />
            </h1>
            <RotatingTagline
              phrases={site.taglines}
              className="mt-1 truncate text-[13px] text-mute"
            />
          </div>
        </div>
        <SocialChips />
      </div>

      {/* 放在最外层：避免被任何带 backdrop-blur 的祖先劫持 fixed 定位 */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
