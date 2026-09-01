import Link from "next/link";

// SCREEN 01: Splash / Demo Start
export default function SplashPage() {
  return (
    <main className="dd-fade-in flex min-h-dvh flex-col items-center justify-center bg-[var(--dd-ink)] px-8 text-center text-white">
      <p className="text-6xl font-extrabold tracking-tight">DD</p>
      <p className="mt-2 text-sm tracking-[0.3em] text-neutral-400">
        DATE × DECORATION
      </p>
      <h1 className="mt-12 text-2xl font-bold leading-relaxed">
        いいデートは、
        <br />
        再現できる。
      </h1>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
        誰かの最高のデートを見つけて、保存して、そのまま使える。
      </p>
      <Link
        href="/home"
        className="mt-12 w-full max-w-xs rounded-full bg-white py-3.5 text-center text-base font-bold text-[var(--dd-ink)] transition-transform active:scale-95"
      >
        DDを体験する
      </Link>
      <p className="mt-10 text-xs text-neutral-500">
        DEMO — 掲載データはすべて架空です（DEMO DATA）
      </p>
    </main>
  );
}
