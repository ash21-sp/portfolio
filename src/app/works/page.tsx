import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ProjectGrid } from "@/components/project-grid";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "作品",
  description: `${site.name}的作品与项目精选。`,
};

export default function WorksPage() {
  return (
    <PageShell>
      <section className="pb-10 pt-2 lg:pt-4">
        <Reveal>
          <h1 className="text-[32px] font-bold tracking-tight md:text-[40px]">
            作品<span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-4 max-w-[50ch] text-[15px] leading-[1.85] text-mute">
            这里收录了我近期的一些设计项目——界面、品牌，和一些不严肃的实验。
          </p>
        </Reveal>
      </section>
      <ProjectGrid />
    </PageShell>
  );
}
