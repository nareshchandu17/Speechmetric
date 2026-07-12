# Application Flow - AI Pronunciation Assessor

## 1. Primary States & View Layout
The application is structured as a premium **single-view, single-screen layout** that transitions dynamically between states. This avoids the clutter of persistent navigation bars and adheres strictly to the single-view boundaries for simple utilities.

```
┌────────────────────────────────────────────────────────┐
│                   MAIN WINDOW VIEW                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  State A: Privacy Consent & Greeting                   │
│  [Notice of DPDP-Aligned Architecture]                 │
│  [Accept Consent Check]                                │
│                                                        │
│                           ▼                            │
│                                                        │
│  State B: Audio Ingest Selection                       │
│  [Tab: Mic Record]  OR  [Tab: File Drop]               │
│  - Enforces 30-45s limit live.                         │
│                                                        │
│                           ▼                            │
│                                                        │
│  State C: Live Stage Progression Loading               │
│  "Uploading securely" -> "Acoustically evaluating"     │
│                                                        │
│                           ▼                            │
│                                                        │
│  State D: Interactive Results Dashboard                 │
│  - Multi-score circles (0-100)                         │
│  - Interactive Transcript (Click words for tips)        │
│  - General Linguistic coaching exercises               │
│  - Saved Sessions (Explicitly Opt-In Local History)    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Navigation Flow

### Step 1: Greeting & Privacy Affirmation
*   **Default State:** The user arrives at a minimal, high-contrast dashboard with a greeting.
*   **Privacy Guard:** The interactive record and drop zones are disabled. A notice reads: *"Under India's Digital Personal Data Protection Act (DPDP), 2023, we require your explicit consent to process your voice recording. We process audio transiently in-memory and store nothing permanently."*
*   **Action:** The user checks `[x] I consent to transiently process my voice recording for pronunciation analysis.` This enables the audio controls immediately.

### Step 2: Audio Ingestion & Live Validation
*   **Option A: Microphore Record**
    1.  User clicks **Start Recording**. Browser requests mic permissions (requires `microphone` permission in frame).
    2.  An active recording ring appears. A live audio level visualizer pulses, and an elapsed timer starts counting.
    3.  If the user clicks **Stop** under 30 seconds: The UI pauses and displays: *"Too short (X seconds). Please speak for at least 30 seconds."* The recording is reset.
    4.  If the counter hits exactly 45 seconds: Recording stops automatically, and the validation completes successfully.
*   **Option B: File Upload**
    1.  User drops an audio file or clicks to select.
    2.  An off-screen HTML5 Audio node loads the file. If metadata yields a duration under 30s or over 45s, the dropzone turns amber with a descriptive warning banner.

### Step 3: Progressive Processing Stage
*   To make the 8-12 second AI analysis window feel responsive and premium, the screen displays a sleek stage-based indicator:
    *   **0-2s:** *"Verifying audio duration & format..."*
    *   **2-5s:** *"Transcribing speech contents..."*
    *   **5-8s:** *"Evaluating phonetic and clear sound segments..."*
    *   **8-11s:** *"Structuring feedback, scores, and drills..."*
*   This removes any perception of a frozen screen and keeps the user informed of exactly what stage of the pipeline is running.

### Step 4: The Interactive Results View
Once the backend responds with structured JSON:
*   **The Scores:** Circular dials displaying overall pronunciation quality alongside sub-scores for clarity, fluency, and pacing.
*   **The Transcript:** The transcribed words are displayed.
    *   Green words denote clear pronunciation.
    *   Amber/Red words denote mispronounced or unclear segments.
    *   **Interaction:** Clicking any highlighted red word pops open a focus card below the line or in a panel, displaying:
        *   *Word:* "worked"
        *   *Phonetic Help:* "/wɜːkt/"
        *   *What Went Wrong:* *"The final /t/ sound was omitted or sounded like a /d/."*
        *   *Drill Tip:* *"Lightly touch your tongue tip behind your upper front teeth and release air quickly without vibrating your vocal cords."*
*   **Linguistic Drill Cards:** Under the transcript, a panel displays 2-3 customized general exercises based on overall weaknesses (e.g., Pacing Drill, ending consonant clarity).
*   **Session History (Explicitly Opt-In):** A scrollable list of previous attempts with timestamp, file duration, and overall score is displayed only if the user explicitly opts in (disabled by default). Choosing "Clear Local History" completely removes these locally stored reports from this browser only. Selecting a saved history item loads its interactive results instantly.
