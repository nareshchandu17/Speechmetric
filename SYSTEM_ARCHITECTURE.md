# System Architecture Document - AI Pronunciation Assessor

This document details the components, AI system design, and regulatory posture of the English Pronunciation Assessor. Developed for the Livo AI SWE Assessment, this application is a production-quality, high-reliability solution engineered with Next.js 15, Tailwind CSS, and Google’s latest multimodal `gemini-3.5-flash` model.

---

## 1. System Architecture & Component Diagram

The application uses an event-driven, single-page full-stack architecture. To maximize privacy, reduce infrastructural cost, and meet Indian DPDP 2023 regulations, the backend is engineered to be **completely stateless**.

### ASCII Component Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT WEB BROWSER                              │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   Audio Capture       │  │ Audio Duration  │  │ User Consent &   │  │
│  │ (Mic / File Upload)   │  │  Verification   │  │  Local History   │  │
│  │   (Touch Target >44px)│  │ (30s - 45s, 5MB)│  │ (Opt-In / Local) │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
└──────────────┼───────────────────────┼────────────────────┼────────────┘
               │                       │                    │
               │ (Secure HTTPS POST)   │                    │ (browser-local localStorage)
               ▼                       ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS EDGE/SERVER (API PROXY)                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/analyze-audio (and unified /api/analyze alias)        │  │
│  │  1. Multipart Form/File or JSON Base64 Stream Parsing            │  │
│  │  2. Pre-flight Checks (30s-45s duration, Consent, Size Limit)    │  │
│  │  3. Convert to Base64 & Construct Multimodal Gemini API Payload  │  │
│  │  4. Post-inference Verification (English speech only check)      │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ (Secure HTTPS, Server Secrets Hidden)
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE GEMINI SERVICES                          │
│                                                                        │
│  Model: gemini-3.5-flash                                               │
│  Inputs: Audio binary data + Applied Phonetics system instruction      │
│  Outputs: Structured JSON parsing (PronunciationSchema -> SavedSession)│
└────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown
1. **Frontend Client (React/Next.js Client Components):**
   - **Audio Capture Module:** Supports direct recording via the browser's MediaRecorder API (capturing in WebM/Ogg/WAV depending on OS compatibility) or file uploads (drag-and-drop or custom selector).
   - **Duration Guard:** Restricts audio capture to strictly between 30 and 45 seconds before transmission (`IngestCard.tsx`).
   - **Interactive Report View:** Displays an interactive word-by-word transcript with color-coded clarity scoring (`DiagnosticDashboard.tsx`), error explanation cards, performance gauges (`ScoreTrendChart.tsx`), and phonetic drill components.
   - **Speech Synthesis:** Uses Web Speech API TTS to let the user "Listen to tips" directly inside the browser.
2. **Backend API Route (`/api/analyze-audio` and unified `/api/analyze` proxy):**
   - Acts as a secure, server-side proxy to keep `GEMINI_API_KEY` safe and enforce statutory pre-flight constraints.
   - Re-validates user consent (`consentGiven`), audio duration (`30s to 45s`), and file sizes before invoking AI models.
   - Directs the base64 audio stream to the Google Gemini API (`gemini-3.5-flash`) with transient exponential backoff retries and verifies that the speech is strictly in English (`detectedLanguage` check).
3. **AI Reasoning Engine (Google Gemini API):**
   - Utilizes `gemini-3.5-flash` to process raw audio waveforms directly, bypassing transcription bottlenecks and dual-model alignment errors, outputting directly to `SavedSession` structure.

---

## 2. Model Selection: Gemini-3.5-Flash vs. Alternatives

The core pipeline evaluates acoustic patterns and returns structured linguistic coaching. The table below outlines the trade-offs of the model selection:

| Model / Pipeline | Advantages | Disadvantages / Trade-offs |
| :--- | :--- | :--- |
| **Whisper STT + GPT-4o** (Traditional Dual-Stage) | High transcript accuracy | High latency (double-hop network), Whisper misses acoustic nuances (intonation, tone, fine stress) which are lost before GPT-4o analyzes it. High API costs. |
| **Traditional Acoustic Aligners** (Kaldi, Wav2Vec2) | Lab-grade millisecond phoneme alignment | Zero conversational coaching context, lacks plain-English physical corrections (e.g., tongue placement), requires extensive custom training and hosting overhead. |
| **Gemini-3.5-Flash** (Selected Multimodal Single-Stage) | **Native audio waveform input**, low latency (8-12 seconds), **Structured Outputs (JSON Schema)**, generates highly detailed linguistic physical drills, extremely cost-effective. | Minor transcription deviation on highly heavy accents, but highly mitigated by standard prompt design. |

### Why Gemini-3.5-Flash is the Optimal Choice
Using a single, natively multimodal model provides:
1. **Waveform Analysis:** Gemini analyzes the voice recording's wave data directly. It hears pacing, pauses, and phoneme omissions (e.g., skipping final unvoiced stops like `/t/` in `"worked"`).
2. **Structured Coaching Delivery:** Returns exact numerical ratings for Clarity, Fluency, Pacing, and Stress, paired with word-level phonetic breakdowns (`phonemes`, `errorType`, `actionableAdvice`).

---

## 3. Scoring Methodology & Highlighting Architecture

The application scores recordings and displays feedback through an interactive interface:

### Multi-Dimensional Scoring Engine
Scoring is structured across three core dimensions (0–100 scale), which are aggregated into a deterministic **Overall Score**:
*   **Clarity (Phonetic Accuracy):** Measured by the percentage of words pronounced correctly, penalizing missed phonemes, omissions, and severe vowel confusion.
*   **Fluency (Speech Flow):** Assesses sentence flow, natural pausing, and the absence of long hesitant pauses.
*   **Pacing (Tempo & Stress):** Audits words per minute (normal range: 110-150 WPM) and syllable stress rhythm.

### Deciding What to Highlight
*   Gemini returns a flat list of `words` conforming to `PronunciationSchema`.
*   Each word has an `score` integer and `errorType`. Words with lower scores represent mispronunciations, omissions, or slurred delivery.
*   **Interactive UI Mapping:** The client-side renders a full text transcript where incorrect words are highlighted in high-contrast underlines (`< 60` rose wavy underline, `60–84` amber solid underline). Clicking on a highlighted word opens a tailored drawer or sidecard showing:
    1.  **Expected Phonetic Representation:** Standard IPA helper (e.g., `/wɜːkt/`).
    2.  **Linguistic Error Explanation:** Explain what went wrong (e.g., *"The ending consonant /t/ was omitted"*).
    3.  **Physical Drill Tip:** Concrete physical mechanics guidance (e.g., *"Practice releasing the final /t/ sound with a sudden burst of air"*).

---

## 4. DPDP Compliance Posture (India's Digital Personal Data Protection Act, 2023)

Since speech audio constitutes sensitive personal voice data, we built the application with **Privacy by Design** under India's DPDP Act, 2023:

1.  **Strict Consent (Section 6 - Consent):** No audio is recorded or accepted until the user views a transparent, plain-language privacy notice and clicks the affirmative consent checkbox. The browser microphone is not accessed, and the file drop zone is locked, until consent is granted.
2.  **Purpose Limitation (Section 7):** Audio is processed solely for pronunciation scoring. It is never used for training models, advertising, user profiling, or administrative logging.
3.  **Data Minimization & Storage Limitation (Section 8 - Data Erasure):**
    *   **Zero Server Storage:** The backend has no database and no Cloud Storage bucket. Audio files are processed purely in-memory, sent over an encrypted HTTPS connection to Gemini, and instantly discarded.
    *   **Local-Only History:** Report history is disabled by default. If a user chooses to opt-in, histories are stored **exclusively in the browser’s `localStorage`**. No user personal data or transcripts reside on the server.
    *   **Instant Erasure:** Users can click the interactive **"Erase All Local Assessments"** button inside `HistoryCard.tsx` or uncheck history opt-in at any time, which instantly purges all transcripts and scores from local storage under Section 12 right to erasure.
4.  **Security Safeguards (Section 8):** Data is transmitted over TLS/HTTPS with strict header configurations. There are no client-side API keys exposed; all AI calls are proxied securely server-side.
5.  **Data Residency & Cross-Border Processing:** The application explicitly notifies users that the secure Google Gemini API is utilized for processing, ensuring complete transparency regarding third-party processors.

---

## 5. Engineering Trade-offs & Future Roadmap

### Intentional Trade-offs Made
1.  **Stateless vs. Cloud DB:** Avoiding a cloud database aligns 100% with DPDP privacy principles and ensures zero-cost database maintenance. However, it means users cannot share a unique, permanent link of their recorded speech file, only a copyable markdown report. We prioritized privacy and speed.
2.  **Multimodal LLM vs. Specialized Speech Models:** We favored Gemini-3.5-Flash because specialized phoneme aligners (e.g., Kaldi) do not generate highly conversational, supportive physical tips (like *"gently bite your lower lip"*). Gemini delivers both transcription and immediate physical coaching in a single API call.
3.  **Client-Side HTML5 vs. Server-Side Audio Decoding:** We perform primary duration checks using browser-native HTML5 audio metadata loads. This stops invalid large audio files from being uploaded, preserving server network bandwidth.

### Future Roadmap (If we had another week)
*   **Visual Waveform Alignment:** Integrate standard Web Audio API canvas visualizers to overlay the user's vocal pitch envelope against a native reference model, allowing the user to visually compare their pitch rise and fall.
*   **Reading Prompt Library:** Provide structured reading paragraphs (scientific, business, narrative) that target specific challenging English phonemes (e.g., th-consonant clusters).
*   **Progress Charts:** Create a multi-session progress tracker that reads from localStorage to plot Clarity, Fluency, and Pacing trends over time.
*   **Accent Adaptability Calibration:** Let the user select their target reference accent (e.g., North American, British, or Neutral Intelligibility) to fine-tune the strictness of the phonetic assessment.
