import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "一些好玩的",
  description: `${site.name}的 vibe coding 实验合集。`,
};

export default function FunPage() {
  return (
    <PageShell>
      <section className="pb-10 pt-2 lg:pt-4">
        <Reveal>
          <h1 className="text-[32px] font-bold tracking-tight md:text-[40px]">
            一些好玩的<span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-4 max-w-[50ch] text-[15px] leading-[1.85] text-mute">
            这里是我和 AI 一起胡搞的 vibe coding 实验——想法来了就动手，写出来好玩比写得好重要。
          </p>
        </Reveal>
      </section>

      <ul>
        {site.funProjects.map((item, i) => {
          const inner = (
            <>
              <span className="shrink-0">
                {item.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.logo}
                    alt={`${item.title} logo`}
                    width={44}
                    height={44}
                    className="size-11 rounded-xl border border-line object-cover"
                  />
                ) : (
                  <span
                    className="dot-grid flex size-11 items-center justify-center rounded-xl border border-line text-xs text-mute"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline group-hover:decoration-accent">
                  {item.title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-mute">
                  {item.description}
                </span>
              </span>
              <span className="hidden shrink-0 gap-1.5 sm:flex">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-2.5 py-1 text-[11px] text-mute"
                  >
                    {tag}
                  </span>
                ))}
              </span>
              {item.url && (
                <ArrowUpRight
                  className="size-4 shrink-0 text-mute transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              )}
            </>
          );

          return (
            <li key={item.title} className="border-b border-line">
              <Reveal>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 py-5"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 py-5">
                    {inner}
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>

      {site.funProjects.length === 0 && (
        <p className="py-12 text-center text-sm text-mute">
          好玩的东西还在路上，先去看看正式的作品吧。
        </p>
      )}
    </PageShell>
  );
}
