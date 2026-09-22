import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Lede } from "@/components/lede";
import { PageShell } from "@/components/page-shell";
import { Section } from "@/components/section";
import { ProjectCard } from "@/components/project-card";
import { ToolsWall } from "@/components/tools-wall";
import { site } from "@/config/site";

export default function HomePage() {
  const featured = site.projects.slice(0, 4);

  return (
    <PageShell>
      <Lede />

      <Section index="01" zh="关于" en="About">
        <div className="space-y-3.5 text-[15px] leading-[1.85]">
          {site.bio.map((paragraph, i) => (
            <p key={i}>
              {paragraph.map((segment, j) =>
                segment.href ? (
                  <a key={j} href={segment.href} className="u-link">
                    {segment.text}
                  </a>
                ) : (
                  <strong key={j} className="font-medium">
                    {segment.text}
                  </strong>
                ),
              )}
            </p>
          ))}
        </div>
      </Section>

      <Section index="02" zh="精选作品" en="Selected Works">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {featured.map((project, i) => (
            <li key={project.title}>
              {project.link ? (
                <a
                  href={project.link}
                  target={project.link.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group block"
                >
                  <ProjectCard project={project} index={i} />
                </a>
              ) : (
                <Link
                  href={`/works/${project.slug}`}
                  className="group block"
                >
                  <ProjectCard project={project} index={i} />
                </Link>
              )}
            </li>
          ))}
        </ul>
        <Link
          href="/works"
          className="group mt-9 inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-ink"
        >
          <span className="underline-offset-4 group-hover:underline group-hover:decoration-accent">
            查看全部作品
          </span>
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </Section>

      <Section index="03" zh="工具" en="Tools">
        <ToolsWall />
      </Section>
    </PageShell>
  );
}
