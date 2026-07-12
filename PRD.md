# Product Requirements Document (PRD) - AI Pronunciation Assessor

## 1. Overview & Vision
The AI Pronunciation Assessor is an interactive English pronunciation analysis web application designed for language learners. The application provides instant, transparent, and actionable feedback on a user's spoken English based on an audio recording. 

Unlike generic speech tools, this application centers around a structured and highly educational feedback system. It identifies specific mispronunciations, provides linguistic explanations for errors, and recommends targeted exercises, all while strictly adhering to modern privacy guidelines like India’s Digital Personal Data Protection Act (DPDP), 2023.

---

## 2. Target Audience & Core Use Cases
*   **Target Users:** Non-native English speakers, professionals, and students preparing for English proficiency exams (IELTS, TOEFL, PTE) or improving their business communication.
*   **Key User Story:** As an English language learner, I want to upload a short recording of my speech so that I can receive objective, word-level pronunciation analysis, understand my typical phonetic errors, and get actionable coaching tips to speak more clearly.

---

## 3. Scope & Feature Boundaries

### In Scope (Core MVP Requirements)
1.  **Audio Ingestion:** Support for both direct microphone recording and standard audio file uploads (MP3, WAV, M4A, WEBM) via a drag-and-drop boundary.
2.  **Strict Duration Validation:** Rejection of any audio that is under 30 seconds or over 45 seconds (both client-side and server-side).
3.  **End-to-End AI Assessment:** Native transcription and acoustic evaluation using the `gemini-3.5-flash` model.
4.  **Multi-Dimensional Scoring:** Overall pronunciation score alongside sub-scores for Pronunciation Clarity, Fluency, and Pacing.
5.  **Word-Level Mispronunciation Detection:** Highlighting specific words or phrases that were mispronounced or unclear.
6.  **Explainable Linguistic Feedback:** For each mispronounced word, explain *what likely went wrong* in plain, supportive terms (e.g., omitted ending consonants, incorrect vowel length).
7.  **Actionable Improvement Drills:** Custom, context-sensitive exercises targeting the specific mistakes identified.
8.  **Privacy-First Consent Flow:** Transparent, legally aligned consent banner before any audio or personal data is collected or transmitted, explaining data minimization (stateless processing with immediate server deletion).

### High-Value Enhancements (Included)
*   **Audio Playback:** Native browser playback of the uploaded audio with simple waveform visualizer.
*   **Interactive Transcript:** Interactive transcript rendering where clicking on mispronounced words shows detailed phonetic analysis cards.
*   **Word-by-Word Practice Cards:** Short practice suggestions for each identified issue.
*   **Session History:** Explicitly opt-in browser-local history (client-side only, disabled by default, preserves user privacy) so users can see previous scores without a backend database.

### Out of Scope (Strictly Excluded)
*   **User Registration & Cloud Accounts:** To maximize privacy and minimize data collection, no server-side user accounts, email registration, or cloud-hosted user profiles are built.
*   **Paid Subscriptions/Payment Portals:** No payment integrations or gated tiers.
*   **Accent Standardization / Bias:** No penalization of regional accents (e.g., Indian English, Spanish English, etc.) if the speech is highly intelligible. The scoring measures *intelligibility and clarity*, not proximity to Received Pronunciation (RP) or General American (GA) accents.

---

## 4. Requirements Traceability Matrix (RTM) Reference

| Req ID | Requirement Description | Priority | Verification Method |
| :--- | :--- | :--- | :--- |
| **REQ-01** | Upload an English audio recording (drag-and-drop or file selector) | High | UI upload test with MP3, WAV, M4A |
| **REQ-02** | Accept *only* recordings between 30 and 45 seconds | High | Attempt uploads of <30s, exactly 30s, 40s, exactly 45s, and >45s |
| **REQ-03** | Analyze the recording using an appropriate speech/AI pipeline | High | Verify API route calls `@google/genai` server-side |
| **REQ-04** | Generate an overall pronunciation score | High | Schema validation on AI output (range 0-100) |
| **REQ-05** | Identify specific mispronounced words or unclear segments | High | UI verifies highlighted words in the interactive transcript |
| **REQ-06** | Explain what likely went wrong phonetically or structurally | High | UI displays detailed explanations on click/hover of flagged words |
| **REQ-07** | Provide actionable feedback and recommended drills | High | Verify feedback section renders customized improvement cards |
| **REQ-08** | Polished, responsive web experience (Mobile + Desktop) | High | Responsive viewport testing (Tailwind breakpoints) |
| **REQ-09** | Deploy publicly as a reliable, production-quality app | High | Confirm build compiles clean and deploys to Cloud Run |
| **REQ-10** | DPDP-Aligned Architecture for data processing & privacy notice | High | Notice shown, consent checked before recording, stateless backend |

---

## 5. Non-Functional & Quality Requirements
*   **Performance:** AI response and analysis rendered within 8-12 seconds of upload completion.
*   **Privacy:** Complete data minimization. Audio processed in memory/temporary disk, sent securely over HTTPS, and immediately deleted from server resources once the API call concludes.
*   **Accuracy:** Schema parsing of AI response must be 100% reliable with zero JSON formatting failures (using Gemini Structured Outputs).
*   **Accessibility:** Sufficient contrast ratio on all text elements (>4.5:1), keyboard-navigable controls, clear audio control labeling.
