import Link from "next/link";
import { CategoryImages } from "@/components/images/category-images";
import { CATEGORIES } from "@/lib/utils/constants";

const AI_TOOLS = [
  "Midjourney", "Stable Diffusion", "DALL-E", "Adobe Firefly",
  "Ideogram", "Leonardo.AI", "Flux", "Any AI Tool",
];

const FEATURES = [
  {
    num: "01",
    icon: "\u{1F3A8}",
    title: "Any AI Tool Welcome",
    desc: "Midjourney, Stable Diffusion, DALL-E, Firefly \u2014 doesn\u2019t matter. If AI made it, it belongs here.",
  },
  {
    num: "02",
    icon: "\u2696\uFE0F",
    title: "Zero Copyright Risk",
    desc: "Pure AI-generated images carry no copyright. Share freely, use freely. No legal headaches.",
  },
  {
    num: "03",
    icon: "\u{1F4C8}",
    title: "Grow Your Audience",
    desc: "Every download is a potential follower. Link your channels and turn image views into subscribers.",
  },
];

// Show 6 popular categories on homepage
const HOME_CATEGORIES = ["character", "landscape", "sci_fi", "fantasy", "illustration", "nature"];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] overflow-hidden bg-[#0a0a0a] text-[#f5f5f0]">
        {/* Grid bg */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full bg-[rgba(200,255,0,0.08)] blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 left-48 h-[500px] w-[500px] rounded-full bg-[rgba(255,107,53,0.06)] blur-[120px]" />

        <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:py-0 lg:min-h-[85vh]">
          {/* Left */}
          <div>
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.1)] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-neon">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-neon" />
              AI Image Sharing Platform
            </div>

            <h1 className="animate-fade-up animate-fade-up-1 font-[var(--font-syne)] text-[clamp(42px,5vw,72px)] font-extrabold leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
              AI images<br />
              <span className="text-neon">deserve</span><br />
              <span className="font-normal text-[#888]">to be seen.</span>
            </h1>

            <p className="animate-fade-up animate-fade-up-2 mt-6 max-w-md text-base leading-relaxed text-[#aaa]">
              You generate hundreds of images. Only a few get used.
              The rest? Gone forever.
              <br /><br />
              <strong className="text-[#ddd]">Pixelshare</strong> is where AI-generated images find a second life &mdash;
              copyright-free, shared freely, discovered by creators worldwide.
            </p>

            {/* Stats */}
            <div className="animate-fade-up animate-fade-up-3 mt-8 flex gap-8">
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  99<span className="text-neon">%</span>
                </div>
                <div className="text-xs text-[#888]">of AI images are discarded</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  0<span className="text-neon">&curren;</span>
                </div>
                <div className="text-xs text-[#888]">cost to share & download</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-syne)" }}>
                  &infin;
                </div>
                <div className="text-xs text-[#888]">tools supported</div>
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fade-up animate-fade-up-4 mt-10 flex gap-3">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-neon px-7 py-3.5 text-sm font-bold text-[#0a0a0a] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,255,0,0.3)]"
              >
                &uarr; Upload Now
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-7 py-3.5 text-sm font-medium text-[#f5f5f0] transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
              >
                Explore &rarr;
              </Link>
            </div>
          </div>

          {/* Right — Upload card */}
          <div className="animate-fade-up animate-fade-up-2">
            <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-neon to-orange" />

              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                Start sharing today
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#888]">
                This platform only grows when creators share.<br />
                Your images are waiting to be discovered.
              </p>

              {/* Dropzone */}
              <Link
                href="/upload"
                className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border-[1.5px] border-dashed border-[#444] p-8 text-center transition-all hover:border-neon hover:bg-[rgba(200,255,0,0.04)]"
              >
                <span className="text-3xl">{"\u{1F5BC}\uFE0F"}</span>
                <span className="mt-2 text-sm text-[#888]">
                  Drop your AI images here<br />
                  or <strong className="text-neon">browse files</strong>
                </span>
              </Link>

              {/* Benefits */}
              <ul className="mt-6 space-y-3">
                {[
                  ["\u{1F4CA}", "Real-time download count \u2014 see your impact"],
                  ["\u{1F3C5}", "Earn recognition as your images get discovered"],
                  ["\u{1F517}", "Link your YouTube, Instagram & portfolio"],
                  ["\u2705", "No copyright disputes \u2014 AI images are free to share"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-[#ccc]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(200,255,0,0.1)] text-base">
                      {icon}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee Band ── */}
      <div className="overflow-hidden whitespace-nowrap bg-neon py-3">
        <div className="animate-marquee inline-flex gap-12 text-sm font-bold uppercase tracking-wider text-[#0a0a0a]" style={{ fontFamily: "var(--font-syne)" }}>
          {[...AI_TOOLS, ...AI_TOOLS].map((tool, i) => (
            <span key={i} className="flex items-center gap-3">
              {tool} <span className="text-[6px]">{"\u25CF"}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-neon">
          Why Pixelshare
        </div>
        <h2 className="mb-16 text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1]" style={{ fontFamily: "var(--font-syne)" }}>
          Built for the<br />
          <span className="text-neon">AI creator era</span>
        </h2>

        <div className="grid gap-0.5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`bg-muted p-9 transition-colors hover:bg-accent ${
                i === 0 ? "rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" :
                i === FEATURES.length - 1 ? "rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none" : ""
              }`}
            >
              <div className="text-5xl font-extrabold text-neon/15" style={{ fontFamily: "var(--font-syne)" }}>
                {f.num}
              </div>
              <div className="mt-5 text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Image Sections ── */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
          Explore by <span className="text-neon">category</span>
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
            className="inline-flex rounded-lg border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse all images
          </Link>
        </div>
      </section>

      {/* ── Upload CTA ── */}
      <section className="mx-auto mb-24 max-w-[1200px] px-6">
        <div className="relative grid items-center gap-16 overflow-hidden rounded-3xl bg-muted p-12 md:grid-cols-[1fr_auto] md:p-16">
          <div className="pointer-events-none absolute -bottom-10 -right-5 text-[250px] font-extrabold leading-none text-neon/[0.04]" style={{ fontFamily: "var(--font-syne)" }}>
            &uarr;
          </div>
          <div>
            <h2 className="text-[clamp(28px,3vw,44px)] font-extrabold leading-[1.15]" style={{ fontFamily: "var(--font-syne)" }}>
              Without uploads,<br />
              <span className="text-neon">there&apos;s nothing</span> to discover.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Pixelshare is powered entirely by creators like you.
              Every image you share makes this platform more valuable for everyone &mdash;
              including you. The more you give, the more you get back.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-neon px-7 py-3.5 text-sm font-bold text-[#0a0a0a] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,255,0,0.3)]"
            >
              &uarr; Upload Your First Image
            </Link>
          </div>
          <div className="text-center">
            <span className="block text-7xl font-extrabold text-neon md:text-8xl" style={{ fontFamily: "var(--font-syne)" }}>
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
