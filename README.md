<div align="center">
  <h1 style="font-size: 2.5rem; font-weight: 800;">SpeechMetric — AI Pronunciation Assessor</h1>
  <p style="font-size: 1.1rem; color: #64748b;">
    Production-quality, high-reliability English pronunciation assessment engine engineered with Next.js 15, Tailwind CSS, and Google’s multimodal <code>gemini-3.5-flash</code>. Built for the Livo AI SWE Assessment.
  </p>
  <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
    <span style="background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; border: 1px solid #a7f3d0;">✓ DPDP Act 2023 Compliant</span>
    <span style="background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; border: 1px solid #bfdbfe;">⚡ Powered by Gemini 3.5 Flash</span>
    <span style="background: #f8fafc; color: #334155; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; border: 1px solid #e2e8f0;">🔒 Stateless Architecture</span>
  </div>
</div>

---

## 🚀 Overview & Key Features

**SpeechMetric** analyzes spoken English audio recordings directly from raw waveforms, bypassing traditional multi-stage STT/alignment latency. It delivers millisecond-level word evaluation, phonetic error diagnostics (`IPA phonemes`), physical mechanics drills, and multi-dimensional scoring out of 100 (`Clarity`, `Fluency`, `Pacing`, `Stress/Rhythm`).

### Core Highlights
- **🎙️ Dual Audio Ingestion:** Record directly via browser microphone (`MediaRecorder API`) or drag-and-drop file uploads (`WAV`, `MP3`, `M4A`, `AAC`, `WebM`).
- **⏳ Pre-flight Duration Enforcement:** Strictly enforces the **30 to 45 seconds** constraint before network transmission on both client and server (`/api/analyze-audio`).
- **🌍 English Speech Only Verification:** Automatically audits spoken language (`detectedLanguage`) and programmatically rejects non-English inputs with clear user feedback.
- **🔍 Interactive Oral Transcript:** Highlights mispronounced or slurred words (`score < 60` in rose, `60-84` in amber). Clicking any word reveals detailed IPA transcriptions, exact linguistic explanations, and concrete physical adjustments.
- **🛡️ India DPDP Act 2023 Compliance:** Zero permanent server storage (`RAM-Only` evaluation buffer), explicit Section 6 statutory opt-in modal, and one-click Section 12 UI right-to-erasure button inside the Assessment Log (`localStorage.livo_assessments_v1`).

---

## 🏗️ Architecture Overview

The system operates on an event-driven, **stateless serverless architecture**:

```
┌──────────────────────────┐      HTTPS POST /api/analyze-audio      ┌───────────────────────────┐
│                          │ ──────────────────────────────────────────> │                           │
│   Client Web Browser     │  (Base64/FormData + Pre-flight Guard)   │   Next.js 15 Server Proxy │
│  (React / Next.js UI)    │                                         │   (API Key Protection)    │
│                          │ <────────────────────────────────────────── │                           │
└──────────────────────────┘         JSON SavedSession Schema        └─────────────┬─────────────┘
             │                                                                     │
             ▼                                                                     ▼
┌──────────────────────────┐                                         ┌───────────────────────────┐
│   Browser localStorage   │                                         │  Google Gemini API        │
│  (Client-Side History)   │                                         │  (gemini-3.5-flash model) │
└──────────────────────────┘                                         └───────────────────────────┘
```

For complete structural trade-offs, model selection criteria, and scoring formulas, see **[`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)** (1–2 page engineering overview).

---

## 🛠️ Quickstart & Installation

### Prerequisites
- **Node.js** (v18.17.0 or higher)
- **npm** or **yarn** or **pnpm**
- A valid **Google Gemini API Key** (`GEMINI_API_KEY`) from [Google AI Studio](https://aistudio.google.com/).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/Speechmetric.git
cd Speechmetric
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and insert your Gemini API key:
```env
# Required: Server-side Gemini API Key (keep private, never expose to client)
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Build Check

Run strict TypeScript type checking and production build validation:
```bash
# Type check without emitting
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## 🔒 DPDP Act 2023 Compliance Rubric

| Compliance Area | Statutory Section | Implementation Assurance |
| :--- | :--- | :--- |
| **Statutory Consent** | Section 6 | Mandatory `ConsentGate.tsx` checkbox required before microphone access or dropzone activation. |
| **Data Minimization** | Section 8 | Audio binaries exist exclusively in volatile server RAM during active scoring and are destroyed immediately post-computation. |
| **Local-Only Storage** | Section 8 | Zero cloud DB or S3 storage. Assessment logs reside strictly inside the user's private browser `localStorage`. |
| **Right to Erasure** | Section 12 | One-click **"Erase All Local Assessments"** button in `HistoryCard.tsx` immediately purges all local history and state. |
| **Dedicated Privacy Portal**| Chapter II | Accessible directly at `app/privacy/page.tsx` (`/privacy`) or via the top "DPDP Act & Privacy" workspace tab. |

---

## 📁 Repository Structure

```text
Speechmetric/
├── app/
│   ├── api/
│   │   ├── analyze-audio/route.ts   # Core unified stateless AI assessment API endpoint
│   │   └── analyze/route.ts         # Unified alias delegating to analyze-audio
│   ├── privacy/page.tsx             # Dedicated statutory privacy and compliance portal
│   ├── globals.css                  # Modern UI styles, animations, and glassmorphism tokens
│   ├── layout.tsx                   # Root application layout
│   └── page.tsx                     # Main workspace state & multi-tab navigation
├── components/
│   ├── ConsentGate.tsx              # Section 6 statutory opt-in modal gate
│   ├── DiagnosticDashboard.tsx      # Interactive Oral Transcript & physical mechanics drawer
│   ├── DpdpWorkspace.tsx            # DPDP Act 2023 spatial transparency & architectural audit
│   ├── HistoryCard.tsx              # Assessment Log featuring Section 12 one-click erasure
│   ├── IngestCard.tsx               # Mic recording & drag-and-drop duration pre-flight check
│   ├── ScoreTrendChart.tsx          # Multi-session performance trend visualization
│   └── SessionCompare.tsx           # Side-by-side diagnostic comparison view
├── SYSTEM_ARCHITECTURE.md           # Comprehensive 1-2 page engineering & design document
├── package.json                     # Project dependencies and build scripts
└── tsconfig.json                    # Strict TypeScript configuration
```
