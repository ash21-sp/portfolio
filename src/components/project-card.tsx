import { type Project } from "@/config/site";

/** 封面：有封面图用封面图，没有则显示排版式封面（点阵 + 描边序号） */
export function ProjectCover({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  if (project.cover) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.cover}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  return (
    <div className="dot-grid relative aspect-video overflow-hidden rounded-lg border border-line bg-surface">
      <span className="absolute left-4 top-4 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] text-mute">
        {project.category}
      </span>
      <span
        className="absolute -bottom-3 right-2 text-[72px] font-bold leading-none tracking-tight text-transparent opacity-40 [-webkit-text-stroke:2px_var(--ink)]"
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

/** 项目卡：封面 + 标题行 */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <>
      <ProjectCover project={project} index={index} />
      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium underline-offset-4 group-hover:underline group-hover:decoration-accent">
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-mute">
            {project.subtitle}
          </p>
        </div>
        <span className="shrink-0 text-xs text-mute">{project.year}</span>
      </div>
    </>
  );
}
