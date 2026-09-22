import { site } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line py-6 pl-5 pr-20 md:pl-8 md:pr-24">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs text-mute">
        <p>
          © {year} {site.name}
          <span className="ml-1.5 inline-block size-1.5 rounded-[2px] bg-accent align-middle" />
        </p>
        <p>{site.footerNote}</p>
      </div>
      {site.icp && (
        <p className="mt-2 text-[11px] text-mute/80">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink"
          >
            {site.icp}
          </a>
        </p>
      )}
    </footer>
  );
}
