import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="py-28 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-mute">
          404 — Not Found
        </p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          这个抽屉里没有档案<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-sm text-mute">
          你要找的页面不在这里，也许被归档到别处了。
        </p>
        <Link href="/" className="u-link mt-8 inline-block text-sm">
          回到首页
        </Link>
      </div>
    </PageShell>
  );
}
