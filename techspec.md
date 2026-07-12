# Technical Specification - AI Pronunciation Assessor

## 1. System Architecture
The application uses a serverless full-stack architecture built on Next.js 15 (App Router) and deployed via Google Cloud Run. To maximize user privacy and satisfy DPDP 2023 requirements, the system is designed to be **entirely stateless** on the backend. No database is required for user records or audio storage.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT WEB BROWSER                              │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   Audio Capture       │  │ Audio Duration  │  │ User Consent &   │  │
│  │ (Mic / File Upload)   │  │  Verification   │  │  Local History   │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
└──────────────┼───────────────────────┼────────────────────┼────────────┘
               │                       │                    │
               │ (Secure HTTPS POST)   │                    │ (browser-local history)
               ▼                       ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS SERVER (API PROXY)                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/analyze-audio                                         │  │
│  │  1. Multipart Form/File Parsing                                  │  │
│  │  2. Server-side File Size & Header Validation                    │  │
│  │  3. Convert to Base64 & Construct Multimodal Gemini payload       │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ (HTTPS with User-Agent)
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE GEMINI API (SECURE)                       │
│                                                                        │
│  Model: gemini-3.5-flash                                               │
│  Inputs: Audio binary data + Custom linguistic coaching system prompt  │
│  Outputs: Structured JSON parsing (PronunciationAnalysisSchema)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Packages
*   **Framework:** Next.js 15 (App Router, React 19)
*   **Styling:** Tailwind CSS (v4) for responsive utility-first UI
*   **Icons:** `lucide-react` for polished interface symbols
*   **Animations:** `motion` (Framer Motion) for clean visual transitions
*   **AI SDK:** `@google/genai` (v2.4.0) accessed strictly from the server-side Next.js API route
*   **Build Pipeline:** Next standalone output, standard TypeScript configurations

---

## 3. Audio Validation Pipeline (The 30-45s Constraint)
To ensure high-quality and complete recordings for analysis, the application enforces a strict **30 to 45 seconds** constraint.

### Client-Side Validation
1.  **For Microphone Recording:**
    *   The browser UI has a record timer.
    *   Recording is automatically stopped when it reaches exactly 45 seconds.
    *   If the user stops recording *before* 30 seconds, the UI rejects it with a clear, polite error: *"Your recording is too short. Please speak for at least 30 seconds."*
2.  **For File Uploads:**
    *   When a file is dropped or selected, the browser loads the file into an HTML5 `Audio` element temporarily.
    *   The `onloadedmetadata` event triggers, exposing `audioElement.duration`.
    *   If `duration < 30` or `duration > 45`, the file is rejected immediately, and an error is shown.

### Server-Side Validation
*   The Next.js API route (`/api/analyze-audio`) receives the file as a buffer via standard multipart form-data.
*   **Size Constraint:** The file size is verified. For high-quality compressed audio (e.g., MP3 or M4A at 128kbps), 45 seconds is typically under 1MB. We enforce a strict upper limit of 5MB to prevent denial-of-service attempts.
*   **Acoustic & Metadata Parsing:** In addition to structural binary validations, the base64-encoded audio payload is passed to the Gemini API, which inspects the acoustic duration of the stream. If the model determines the speech clip falls outside the 30–45s bounds or is completely silent, the server throws a structured error and rejects the request.

---

## 4. Privacy by Design (DPDP-Aligned Architecture)
Under India's Digital Personal Data Protection Act, 2023, speech recordings constitute personal data. The application achieves alignment through:

1.  **Strict Consent (Section 6):** Users are presented with a clear consent notice *before* accessing the audio input or upload boundaries. Consent must be explicitly affirmed via a checkbox.
2.  **Purpose Limitation (Section 7):** Audio is processed solely for pronunciation scoring. It is never used for training models, advertising, or identification.
3.  **Data Minimization (Section 8):**
    *   The application does not persist any files.
    *   Audio is read as an in-memory buffer on the server, dispatched directly to Gemini, and discarded.
    *   The backend database is non-existent.
4.  **Data Ownership & Opt-In (User Rights):** Previous analysis scores and transcripts are saved inside the user's "browser-local history" using browser Cache/Local Storage only if they explicitly opt-in (disabled by default). Users can turn this off or invoke "Clear Local History" at any time with a single click, which instantly removes locally stored reports from this browser only, satisfying the statutory "Right to Erasure" principles.
5.  **No Transborder Violations:** Data is dispatched securely to the Google Gemini API over encrypted HTTPS channels using server-side proxies, preventing client credentials from being exposed.
