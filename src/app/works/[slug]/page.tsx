import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ProjectCover } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = site.projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.subtitle };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = site.projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = site.projects[index];
  const count = site.projects.length;
  const prev = site.projects[(index + count - 1) % count];
  const next = site.projects[(index + 1) % count];

  return (
    <PageShell>
      <article>
        <section className="pb-8 pt-2 lg:pt-4">
          <Link
            href="/works"
            className="group inline-flex items-center gap-2 text-[13px] text-mute transition-colors hover:text-ink"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            返回作品
          </Link>

          <h1 className="mt-8 text-[32px] font-bold tracking-tight md:text-[40px]">
            {project.title}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-mute">
            {project.subtitle}
          </p>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-[13px]">
            <div className="flex gap-2">
              <dt className="text-mute/70">分类</dt>
              <dd>{project.category}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-mute/70">年份</dt>
              <dd>{project.year}</dd>
            </div>
            {project.role && (
              <div className="flex gap-2">
                <dt className="text-mute/70">角色</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            {project.link && (
              <div className="flex gap-2">
                <dt className="text-mute/70">链接</dt>
                <dd>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link"
                  >
                    访问项目 ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {project.showCoverInDetail !== false && (
          <Reveal>
            <div className="group block">
              <ProjectCover project={project} index={index} />
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-12 space-y-4 text-[15px] leading-[1.85]">
            {project.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Reveal>

        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-12 space-y-6">
            {project.gallery.map((img) => (
              <Reveal key={img}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${project.title} 配图`}
                  className="w-full rounded-lg border border-line"
                />
              </Reveal>
            ))}
          </div>
        )}

        <nav
          className="mt-16 flex items-start justify-between gap-4 border-t border-line pt-8 text-[13px]"
          aria-label="上一篇下一篇"
        >
          <Link
            href={`/works/${prev.slug}`}
            className="group min-w-0 text-mute transition-colors hover:text-ink"
          >
            <span className="block text-[11px] text-mute/70">上一个</span>
            <span className="mt-1 flex items-center gap-1.5">
              <ArrowLeft
                className="size-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              <span className="truncate">{prev.title}</span>
            </span>
          </Link>
          <Link
            href={`/works/${next.slug}`}
            className="group min-w-0 text-right text-mute transition-colors hover:text-ink"
          >
            <span className="block text-[11px] text-mute/70">下一个</span>
            <span className="mt-1 flex items-center justify-end gap-1.5">
              <span className="truncate">{next.title}</span>
              <ArrowRight
                className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        </nav>
      </article>
    </PageShell>
  );
}
