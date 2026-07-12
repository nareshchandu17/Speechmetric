# Strict Engineering Rules - AI Pronunciation Assessor

## 1. Type Safety & Code Quality Rules
*   **No Implicit or Explicit Any:** All parameters, returns, variables, and API responses must have strict, explicit TypeScript interfaces or primitives. Using `any` is strictly prohibited.
*   **Import Placement:** All imports must be placed at the very top of the files. Named imports must be used; object destructuring from default imports is prohibited where named options exist.
*   **Enums:** Standard `enum` declarations must be used (do not use `const enum`).
*   **Strict Webpack & Next Configs:** Build errors must be treated as blockers. We do not disable TypeScript build errors.

---

## 2. Audio Processing & Validation Rules
*   **Double-Gaurded Validation:** Any audio data sent to the server MUST be validated on both the client (for fast UX feedback) and the server (to prevent API abuse and file-type spoofing).
*   **Duration Boundaries:**
    *   Files under 30.0 seconds: REJECT.
    *   Files over 45.0 seconds: REJECT.
    *   Files without valid audio headers (spoofed text files, images): REJECT.
*   **Size Limit:** Max file size is strictly capped at 5MB. Files exceeding this must be blocked immediately.

---

## 3. DPDP-Aligned Architecture Rules
*   **Consent First Policy:** Tapping "Record" or dropping a file before checking the explicit consent box is technically blocked. No cookies, session tokens, or files are generated prior to active affirmative consent.
*   **No Permanent Server Disk Retention:** Audio data is loaded into server memory (or in `/tmp` as a short-lived stream), transferred via encrypted channels to Gemini, and discarded. Writing recordings to database storage or public buckets is strictly forbidden.
*   **Right to Erasure & Explicit Opt-In:** Storing previous analysis scores in browser-local history must be explicitly opt-in and disabled by default. Disabling the toggle or invoking "Clear Local History" must remove the `livo_pronunciation_sessions` local storage key completely, clear the in-memory states instantly, and clearly state that this removes reports from this browser only.

---

## 4. UI/UX Rules
*   **Theme Continuity:** Only the highly polished "Linguistic Lab Slate" Light Theme is allowed. Dark mode or theme-switching elements are unrequested and are therefore strictly forbidden to prevent feature bloat.
*   **No Fake Progress:** Loading indicators must use factual stage labels (e.g., "Uploading...", "Transcribing...") rather than animated random percentages.
*   **Touch Bounds:** Maintain a minimum 44px x 44px active touch surface on all interactive nodes to assure cross-device convenience.
