# API & Data Schemas - AI Pronunciation Assessor

## 1. Client-Server API Contract
The client communicates with the server via a single, secure `POST` API route: `/api/analyze-audio`.

### Request Schema (Multipart Form Data)
*   **Body Fields:**
    *   `audio`: File binary (supported formats: MP3, WAV, M4A, WEBM)
    *   `consentGiven`: `"true"` (String, verified on the server)
*   **Headers:**
    *   `Content-Type: multipart/form-data`

---

## 2. Server Response JSON Schema
The `/api/analyze-audio` endpoint returns the following structured JSON response on success (HTTP 200). This aligns directly with the structured output schema passed to the Gemini API.

```typescript
export interface MispronouncedWord {
  word: string;               // The literal word transcribed (e.g., "worked")
  isCorrect: boolean;         // True if clear/fluent, False if mispronounced or unclear
  expectedPhonetic?: string;  // Phonetic assistance, e.g., "/wɜːkt/" or standard spelling
  errorExplanation?: string;  // Direct reason, e.g., "Omitted ending consonant /t/"
  improvementDrill?: string;  // Practical physical tip, e.g., "Briefly release air without voicing."
}

export interface ScoreBreakdown {
  clarity: number;            // Vowel/consonant accuracy (0-100)
  fluency: number;            // Intelligibility and flow (0-100)
  pacing: number;             // Speech speed and syllable stress (0-100)
}

export interface LinguisticCoachingDrill {
  title: string;              // Drill title (e.g., "Ending Consonant Release")
  problemDescription: string; // Linguistic context
  exerciseInstructions: string;// Step-by-step physical tongue/lip drill
}

export interface PronunciationAnalysisResult {
  overallScore: number;       // Scaled aggregated score (0-100)
  scoresBreakdown: ScoreBreakdown;
  transcriptWords: MispronouncedWord[]; // Sequential transcript with annotations
  generalRecommendations: LinguisticCoachingDrill[]; // Curated drills based on mistakes
  metadata: {
    durationSeconds: number;  // Evaluated speech length in seconds
    detectedLanguage: string; // Language check (e.g., "English")
    totalWords: number;
    unclearWordsCount: number;
  };
}
```

---

## 3. Storage Schema (Browser-Local History)
To keep the application entirely stateless on the server, previous analyses are persisted inside browser-local history (using browser Local Storage) only when explicitly enabled by the user.

*   **Key:** `livo_pronunciation_sessions`
*   **Format:** A JSON-serialized array of sessions:

```typescript
export interface SavedSession {
  id: string;                 // Unique UUID generated client-side
  timestamp: string;          // ISO String of the session run
  overallScore: number;
  durationSeconds: number;
  analysis: PronunciationAnalysisResult;
}
```
This local schema is explicitly opt-in and disabled by default. When enabled, it allows immediate offline recall of previous attempts. Users can turn it off or invoke "Clear Local History" (which removes locally stored assessment reports from this browser only) at any time, fulfilling the stateless DPDP statutory "Right to Access" and "Right to Erasure" design guidelines.
