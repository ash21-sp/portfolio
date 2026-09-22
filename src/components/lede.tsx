import { Briefcase, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { CopyEmail } from "@/components/copy-email";
import { Reveal } from "@/components/reveal";

/** 首页开场：大字问候 + 一句介绍 + meta 行 */
export function Lede() {
  return (
    <section className="pb-2 pt-2 lg:pt-4">
      <Reveal>
        <p className="text-[28px] font-bold leading-snug tracking-tight md:text-[36px]">
          你好，我是 <span className="text-accent">{site.name}</span>。
        </p>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.85] text-mute">
          {site.intro}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-mute">
          <span className="flex items-center gap-2">
            <Briefcase className="size-4 text-mute" aria-hidden />
            {site.role} @ {site.company}
          </span>
          <a
            href={site.locationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-accent"
            title="在地图中查看"
          >
            <MapPin className="size-4" aria-hidden />
            {site.location}
          </a>
          <CopyEmail email={site.email} />
        </div>
      </Reveal>
    </section>
  );
}
