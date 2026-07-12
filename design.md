# UI/UX Design Specification - AI Pronunciation Assessor

## 1. Visual Theme: "The Linguistic Lab Slate"
To evoke feelings of scientific precision, trust, and absolute clarity, the application adopts a high-contrast, clinical, and premium **Light Theme**. This mimics a professional speech lab sheet or modern linguistics journal, avoiding the typical flashy neon/gradient "AI slop" in favor of structured architectural elegance.

### Color Palette (Tailwind CSS)
*   **Primary Canvas Background:** `bg-[#fafaf9]` (Warm Stone Gray) or `bg-[#ffffff]` (Pure White)
*   **Primary Borders & Lines:** `border-zinc-200` and `border-zinc-300/80`
*   **Typography Main:** `text-zinc-800` (Deep charcoal, ensuring high contrast)
*   **Typography Muted:** `text-zinc-500` (Soft stone gray for helpers)
*   **Success Indicator:** `text-emerald-700` and `bg-emerald-50` (Warm Sage for correct/fluent sounds)
*   **Issue Indicator:** `text-rose-700` and `bg-rose-50` (Soft Crimson for pronunciation corrections)
*   **Active Accent:** `bg-zinc-900` and `text-white` for primary buttons

---

## 2. Typography & Hierarchy
*   **Display / Headers:** `font-sans font-semibold tracking-tight text-zinc-900`
*   **Acoustic Values & Stats:** `font-mono tracking-wide text-zinc-800` (Provides a telemetry feel for score readouts)
*   **Body & Descriptions:** `font-sans leading-relaxed text-zinc-600`

---

## 3. Component Design & Touch Spacing

### The Privacy Notice Banner
*   **Layout:** Centered block with a thin solid border and a prominent checkbox.
*   **Visual cues:** Low-opacity background (`bg-[#f5f5f4]`) with a clean `rounded-xl` frame to separate it from the work area.

### Audio Ingestion Interface
*   **Recording Zone:** A large, circular ring that pulses smoothly based on voice levels using the Web Audio API or a clean animation.
*   **Duration Banner:** A progress bar showing the exact 30s to 45s boundaries. The "Active Target zone" (30s to 45s) is highlighted in green, while the "Under 30s" zone is highlighted in neutral gray.
*   **Tap Targets:** All control buttons (Stop, Start, Record, Upload) are padded to at least `h-12 px` (48px) to exceed mobile touch safety bounds.

### Interactive Transcript Panel
*   **Display:** Generous line-height (`leading-loose md:leading-[3rem]`) to avoid crowded words on mobile.
*   **Interactability:** Tapping or clicking an active red/orange word highlights the word with a subtle ring outline and expands a detailed card directly underneath or slides it into view in a side-by-side split screen on desktop.

---

## 4. Progressive Animations & Micro-interactions
*   **Fade-Ins:** Toggles between tabs or states use simple, fluid easing (`duration-300 ease-out`).
*   **Audio Level indicator:** Smooth scaling transforms (`scale-105` to `scale-100`) synced to live input levels when recording.
*   **Circular Progress meters:** Animated SVG strokes that trace their percentage value upon loading.
