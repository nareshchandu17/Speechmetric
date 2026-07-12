# Implementation Plan - AI Pronunciation Assessor

## 1. Milestones and Deliverables

### Milestone 1: Initial Setup, Layout Framework & Project Documents
*   **Deliverable 1.1:** Verification of project specification files (PRD, Techspec, ApplicationFlow, Design, Schema, AI Design, Rules, Tracker).
*   **Deliverable 1.2:** Verification of `metadata.json` updates and basic Next.js page shell.
*   **Deliverable 1.3:** Setup `.env.example` configurations.

### Milestone 2: Consent Gate & Client-Side Audio Engine
*   **Deliverable 2.1:** Interactive consent screen preventing interaction until ticked.
*   **Deliverable 2.2:** Web Audio API mic recording harness (capturing chunks, 45s auto-stop).
*   **Deliverable 2.3:** Drag-and-drop / file-selector boundary.
*   **Deliverable 2.4:** Client-side audio duration parser using browser HTML5 Audio nodes. Shows immediate duration validation errors (<30s or >45s).

### Milestone 3: Server-Side API Handler with Gemini Integration
*   **Deliverable 3.1:** API route at `/api/analyze-audio` implementing file boundary checks (size < 5MB).
*   **Deliverable 3.2:** Integration of `@google/genai` (v2.4.0) with server-side SDK initialization.
*   **Deliverable 3.3:** Multimodal prompt structure passing audio buffer as inline base64 data.
*   **Deliverable 3.4:** Gemini Structured Outputs schema parsing to enforce strict JSON structure.

### Milestone 4: Interactive Analysis Dashboard
*   **Deliverable 4.1:** Circular gauges/charts for multi-dimensional scores (Clarity, Fluency, Pacing).
*   **Deliverable 4.2:** Word-by-word highlighted transcript rendering (green for fluent, red/orange for corrections).
*   **Deliverable 4.3:** Interactive drill-down cards opening detailed phonetic and anatomical guides when a correction word is clicked.
*   **Deliverable 4.4:** Actionable general physical coaching drill card panel.

### Milestone 5: Session History & Clear Local History Controls
*   **Deliverable 5.1:** Persisting analysis runs to browser-local history via an explicit opt-in (disabled by default).
*   **Deliverable 5.2:** History sidebar or footer displaying scrollable list of past sessions when opted in.
*   **Deliverable 5.3:** "Clear Local History" button allowing the user to wipe local history from this browser only.

### Milestone 6: Verification, Testing, & Final Deployment
*   **Deliverable 6.1:** Build verification using `compile_applet` and linting with `lint_applet`.
*   **Deliverable 6.2:** Strict duration threshold boundary tests.
*   **Deliverable 6.3:** Validation of DPDP privacy alignment and clean production standalone build checks.

---

## 2. Rigorous Boundary Testing Plan
To guarantee production-level reliability, we will execute the following explicit audio tests:
1.  **Lower Bound Violation:** Upload/Record a 25-second audio clip.
    *   *Expected behavior:* The client blocks the submission, showing a helpful warning banner.
2.  **Lower Bound Edge:** Upload/Record exactly 30.0 seconds of audio.
    *   *Expected behavior:* The client passes, and the server processes it successfully.
3.  **Upper Bound Edge:** Upload/Record exactly 45.0 seconds of audio.
    *   *Expected behavior:* The client passes, and the server processes it successfully.
4.  **Upper Bound Violation:** Upload a 48-second audio clip.
    *   *Expected behavior:* The client blocks submission with a clear boundary warning.
5.  **Spoofed File Type:** Rename a `.png` or `.txt` file to `.mp3` and attempt upload.
    *   *Expected behavior:* The browser element fails to decode duration, or the server throws a validation/decoding error, preventing API waste.
