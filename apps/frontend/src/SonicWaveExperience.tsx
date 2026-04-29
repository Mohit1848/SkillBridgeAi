import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

const FRAME_COUNT = 240;
const FRAME_PATHS = Array.from({ length: FRAME_COUNT }, (_, index) => {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/sonicwave-frames/ezgif-frame-${frameNumber}.jpg`;
});

const USER_FLOW = [
  "Student / fresher",
  "Resume upload",
  "PDF / manual input",
  "Dashboard UI",
  "React / Flutter",
  "Simulator",
  "What-if tool"
];

const AI_CORE = [
  "NLP parser",
  "Skill extraction",
  "Matching engine",
  "Cosine similarity",
  "Gap analyzer",
  "Missing skills",
  "Roadmap engine",
  "Courses + timeline",
  "Recommender",
  "Content filtering",
  "Score engine",
  "Readiness %"
];

const PLATFORM = [
  "API Gateway",
  "MongoDB",
  "User profiles",
  "Job dataset",
  "Skills + JD index",
  "Firebase",
  "Auth + realtime",
  "Google Cloud",
  "Deploy + APIs"
];

const FEATURE_GROUPS = [
  { title: "User", items: USER_FLOW },
  { title: "Backend / AI", items: AI_CORE },
  { title: "Data / Platform", items: PLATFORM }
];

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReduced;
}

function getNearestLoadedFrame(frames: (HTMLImageElement | null)[], targetIndex: number): HTMLImageElement | null {
  if (frames[targetIndex]) {
    return frames[targetIndex];
  }

  for (let index = targetIndex; index >= 0; index -= 1) {
    if (frames[index]) {
      return frames[index];
    }
  }

  for (let index = targetIndex + 1; index < frames.length; index += 1) {
    if (frames[index]) {
      return frames[index];
    }
  }

  return null;
}

function drawFrameToCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#6a8768";
  context.fillRect(0, 0, width, height);

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function CanvasSequence({ containerRef, reducedMotion }: { containerRef: RefObject<HTMLElement>; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(Array.from({ length: FRAME_COUNT }, () => null));
  const [frame, setFrame] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    let active = true;

    FRAME_PATHS.forEach((path, index) => {
      const image = new Image();
      image.decoding = "async";
      image.src = path;
      image.onload = () => {
        if (!active) {
          return;
        }

        framesRef.current[index] = image;
        setLoadedCount((count) => count + 1);
      };
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const fallbackImage = framesRef.current[0];
      if (fallbackImage) {
        drawFrameToCanvas(canvas, fallbackImage);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [loadedCount]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const adjusted = reducedMotion ? 0.999 : latest;
    const nextFrame = Math.min(FRAME_COUNT - 1, Math.round(adjusted * (FRAME_COUNT - 1)));
    setFrame(nextFrame);

    const canvas = canvasRef.current;
    const activeImage = getNearestLoadedFrame(framesRef.current, nextFrame);
    if (canvas && activeImage) {
      drawFrameToCanvas(canvas, activeImage);
    }
  });

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-8 z-20 flex items-center justify-between px-6 text-[10px] uppercase tracking-[0.45em] text-stone-700/60 md:px-10">
        <span>Frame {String(frame + 1).padStart(2, "0")}</span>
        <span>{loadedCount}/{FRAME_COUNT} frames</span>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="h-screen w-full bg-[#6a8768]"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_44%)]" />
    </div>
  );
}

function StoryOverlay({
  containerRef
}: {
  containerRef: RefObject<HTMLElement>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.12, 0.24], [0, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.24], [80, -40]);
  const midOpacity = useTransform(scrollYProgress, [0.28, 0.46, 0.62], [0, 1, 0]);
  const midY = useTransform(scrollYProgress, [0.24, 0.62], [100, -40]);
  const endOpacity = useTransform(scrollYProgress, [0.68, 0.82, 1], [0, 1, 0]);
  const endY = useTransform(scrollYProgress, [0.68, 1], [90, -50]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="absolute left-0 right-0 top-[16vh] px-6 text-center md:top-[18vh]"
      >
        <p className="mx-auto mb-4 max-w-fit rounded-full border border-emerald-900/10 bg-white/55 px-4 py-2 text-[10px] uppercase tracking-[0.45em] text-stone-700 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur">
          Scroll to Explore
        </p>
        <h2 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight text-stone-900 md:text-7xl">
          Resume Analyzer for students, freshers, and future-ready teams.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-700/80 md:text-base">
          A premium product reveal for SkillBridge AI, using your real 240-frame device sequence and a UI language
          matched to the green-and-stone render palette.
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: midOpacity, y: midY }}
        className="absolute inset-x-0 top-[45vh] px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            ["User Flow", "Resume upload, PDF or manual input, simulator, and dashboard UI for student journeys."],
            ["AI Engine", "NLP parsing, skill extraction, cosine matching, gap analysis, roadmap creation, and scoring."],
            ["Platform", "Node.js backend, MongoDB, Firebase auth, realtime capability, and Google Cloud deployment."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-[28px] border border-black/5 bg-white/68 p-5 shadow-[0_24px_80px_rgba(44,62,48,0.12)] backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.38em] text-emerald-700/70">System Layer</p>
              <h3 className="mt-5 text-xl font-medium tracking-tight text-stone-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-700/80">{body}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: endOpacity, y: endY }}
        className="absolute bottom-[13vh] left-0 right-0 px-6 text-center"
      >
        <p className="text-xs uppercase tracking-[0.45em] text-stone-700/60">Built for career readiness</p>
        <h3 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 md:text-6xl">SkillBridge Resume Analyzer</h3>
      </motion.div>
    </div>
  );
}

function SonicWaveExperience() {
  const scrollytellingRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const footerY = useMemo(() => (reducedMotion ? 0 : 30), [reducedMotion]);

  return (
    <div className="min-h-screen bg-[#d7ddd2] text-stone-900 antialiased">
      <header className="relative overflow-hidden border-b border-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_28%),linear-gradient(135deg,#7a7a7a_0%,#efefec_28%,#7d9c77_62%,#214129_100%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8 md:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-stone-800/55">SkillBridge AI</p>
              <p className="mt-2 text-sm text-stone-800/70">Career readiness platform for students and freshers.</p>
            </div>
            <div className="rounded-full border border-black/5 bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.35em] text-stone-700 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
              Premium Product Story
            </div>
          </div>

          <div className="grid gap-14 pb-16 pt-24 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pb-24">
            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.5em] text-stone-800/55">Animated product reveal</p>
              <h1 className="max-w-5xl text-6xl font-semibold tracking-tighter2 text-stone-950 md:text-[7.5rem] md:leading-[0.88]">
                Turn resume chaos into a guided growth system.
              </h1>
            </div>
            <div className="md:justify-self-end">
              <p className="max-w-md text-base leading-8 text-stone-900/75">
                The UI now follows the actual asset you shared: soft stone light, grounded green surfaces, hardware-like
                detailing, and a scroll-scrubbed canvas sequence that frames the product as a polished AI tool.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-stone-800/75">
                <span className="rounded-full border border-black/5 bg-white/55 px-4 py-2">Resume Upload</span>
                <span className="rounded-full border border-black/5 bg-white/55 px-4 py-2">Skill Matching</span>
                <span className="rounded-full border border-black/5 bg-white/55 px-4 py-2">Roadmap Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 pt-6 text-sm text-stone-800/60">
            <p>Scroll to Explore</p>
            <p>Canvas-rendered sequence • 240 real frames</p>
          </div>
        </div>
      </header>

      <section
        ref={scrollytellingRef}
        className="relative h-[420vh] bg-[linear-gradient(135deg,#818181_0%,#ecece8_28%,#7d9c77_60%,#214129_100%)]"
      >
        <CanvasSequence containerRef={scrollytellingRef} reducedMotion={reducedMotion} />
        <StoryOverlay containerRef={scrollytellingRef} />
      </section>

      <section className="border-t border-black/5 bg-[#d7ddd2]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3 md:px-10">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title} className="rounded-[32px] border border-black/5 bg-white/70 p-6 shadow-[0_24px_80px_rgba(44,62,48,0.1)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-700/70">{group.title}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full border border-emerald-900/10 bg-[#eff5ec] px-3 py-2 text-sm text-stone-800/85">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-black/5 bg-[#cfd7ca]">
        <motion.div
          initial={{ opacity: 0, y: footerY }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1fr_auto] md:items-end md:px-10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-stone-800/55">Launch Ready</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
              Frontend in React. AI backend in Node.js. Data layer built to scale.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-900/70">
              This landing page now combines the uploaded frame-sequence content with your product architecture so the
              visual story and platform story feel like one coherent premium brand.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <button className="rounded-full border border-emerald-900/10 bg-[#1f8f4d] px-8 py-4 text-sm font-medium uppercase tracking-[0.3em] text-white transition hover:scale-[1.02]">
              View Dashboard
            </button>
            <a
              href="?experience=skillbridge"
              className="text-xs uppercase tracking-[0.35em] text-stone-800/50 underline decoration-black/10 underline-offset-8"
            >
              Return to SkillBridge
            </a>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

export default SonicWaveExperience;
