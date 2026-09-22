import { Reveal } from "@/components/reveal";

/**
 * 内容区章节：mono 小引（编号·英文）+ 中文大标题，靠留白与细线分节。
 */
export function Section({
  index,
  zh,
  en,
  children,
}: {
  index: string;
  zh: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="border-t border-line py-12 lg:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight lg:text-2xl">{zh}</h2>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-mute">
            {index} · {en}
          </span>
        </div>
        <div className="mt-8">{children}</div>
      </section>
    </Reveal>
  );
}
