import Link from "next/link";
import {
  Upload,
  Search,
  Palette,
  Scale,
  TrendingUp,
  BarChart3,
  Award,
  Link2,
  ShieldCheck,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { CategoryImages } from "@/components/images/category-images";
import { CATEGORIES } from "@/lib/utils/constants";

const FEATURES = [
  {
    num: "01",
    icon: Palette,
    title: "Any AI Tool Welcome",
    desc: "No matter which tool you use. If AI made it, it belongs here. All styles, all formats welcome.",
  },
  {
    num: "02",
    icon: Scale,
    title: "Zero Copyright Risk",
    desc: "Pure AI-generated images carry no copyright. Share freely, use freely. No legal headaches.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Grow Your Audience",
    desc: "Every download is a potential follower. Link your channels and turn image views into subscribers.",
  },
];

const BENEFITS = [
  { icon: BarChart3, text: "Real-time download count \u2014 see your impact" },
  { icon: Award, text: "Earn recognition as your images get discovered" },
  { icon: Link2, text: "Link your YouTube, Instagram & portfolio" },
  { icon: ShieldCheck, text: "No copyright disputes \u2014 AI images are free to share" },
];

const HOME_CATEGORIES = ["character", "landscape", "sci_fi", "fantasy", "illustration", "nature"];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Soft glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-highlight/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-32 h-[400px] w-[400px] rounded-full bg-highlight/5 blur-[100px]" />

        <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          {/* Left */}
          <div>
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-highlight">
              <Sparkles className="h-3.5 w-3.5" />
              AI Image Sharing Platform
            </div>

            <h1 className="animate-fade-up animate-fade-up-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.08] tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
              AI images<br />
              <span className="text-highlight">deserve</span><br />
              <span className="font-normal text-muted-foreground">to be seen.</span>
            </h1>

            <p className="animate-fade-up animate-fade-up-2 mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              You generate hundreds of images. Only a few get used.
              The rest? Gone forever.
              <br /><br />
              <strong className="text-foreground">Pixelshare</strong> is where AI-generated images find a second life &mdash;
              copyright-free, shared freely, discovered by creators worldwide.
            </p>

            {/* Stats */}
            <div className="animate-fade-up animate-fade-up-3 mt-8 flex gap-8">
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  99<span className="text-highlight">%</span>
                </div>
                <div className="text-xs text-muted-foreground">of AI images are discarded</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  0<span className="text-highlight">$</span>
                </div>
                <div className="text-xs text-muted-foreground">cost to share & download</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  &infin;
                </div>
                <div className="text-xs text-muted-foreground">tools supported</div>
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fade-up animate-fade-up-4 mt-10 flex gap-3">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-highlight px-7 py-3.5 text-sm font-bold text-highlight-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-highlight/25"
              >
                <Upload className="h-4 w-4" />
                Upload Now
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-7 py-3.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4" />
                Explore
              </Link>
            </div>
          </div>

          {/* Right — Upload card */}
          <div className="animate-fade-up animate-fade-up-2">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/50 p-8">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-highlight to-highlight/40" />

              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                Start sharing today
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This platform only grows when creators share.<br />
                Your images are waiting to be discovered.
              </p>

              {/* Dropzone */}
              <Link
                href="/upload"
                className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border-[1.5px] border-dashed border-border p-8 text-center transition-all hover:border-highlight hover:bg-highlight/5"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-3 text-sm text-muted-foreground">
                  Drop your AI images here<br />
                  or <strong className="text-highlight">browse files</strong>
                </span>
              </Link>

              {/* Benefits */}
              <ul className="mt-6 space-y-3">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-highlight/10">
                      <Icon className="h-4 w-4 text-highlight" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-highlight">
          Why Pixelshare
        </div>
        <h2 className="mb-16 text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.1]" style={{ fontFamily: "var(--font-syne)" }}>
          Built for the<br />
          <span className="text-highlight">AI creator era</span>
        </h2>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className="bg-background p-9 transition-colors hover:bg-muted/50"
              >
                <div className="text-5xl font-extrabold text-highlight/10" style={{ fontFamily: "var(--font-syne)" }}>
                  {f.num}
                </div>
                <Icon className="mt-5 h-7 w-7 text-highlight" />
                <h3 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Category Image Sections ── */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
          Explore by <span className="text-highlight">category</span>
        </h2>
        <div className="space-y-16">
          {HOME_CATEGORIES.map((catValue) => {
            const cat = CATEGORIES.find((c) => c.value === catValue);
            if (!cat) return null;
            return (
              <CategoryImages key={cat.value} category={cat.value} label={cat.label} />
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            Browse all images
          </Link>
        </div>
      </section>

      {/* ── Upload CTA ── */}
      <section className="mx-auto mb-24 max-w-[1200px] px-6">
        <div className="relative grid items-center gap-16 overflow-hidden rounded-3xl border border-border bg-muted/50 p-12 md:grid-cols-[1fr_auto] md:p-16">
          <div className="pointer-events-none absolute -bottom-10 -right-5 text-[200px] font-extrabold leading-none text-highlight/[0.06]" style={{ fontFamily: "var(--font-syne)" }}>
            <ArrowUp className="h-48 w-48" />
          </div>
          <div>
            <h2 className="text-[clamp(24px,3vw,40px)] font-extrabold leading-[1.15]" style={{ fontFamily: "var(--font-syne)" }}>
              Without uploads,<br />
              <span className="text-highlight">there&apos;s nothing</span> to discover.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Pixelshare is powered entirely by creators like you.
              Every image you share makes this platform more valuable for everyone &mdash;
              including you.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-highlight px-7 py-3.5 text-sm font-bold text-highlight-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-highlight/25"
            >
              <Upload className="h-4 w-4" />
              Upload Your First Image
            </Link>
          </div>
          <div className="text-center">
            <span className="block text-7xl font-extrabold text-highlight md:text-8xl" style={{ fontFamily: "var(--font-syne)" }}>
              &infin;
            </span>
            <div className="mt-1 text-sm text-muted-foreground">
              images waiting<br />to be shared
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
