# AI Pipeline & Prompt Engineering - AI Pronunciation Assessor

## 1. Model Selection Strategy
The application utilizes **`gemini-3.5-flash`** as its sole multimodal processing engine.
*   **Why Multimodal Audio?** Gemini models can process audio files directly, analyzing not just the semantic text (what was said) but the acoustic signal (pitch, timbre, pacing, syllable stress, and phoneme clarity). This enables a seamless single-stage transcription + pronunciation scoring pipeline.
*   **Structured Output:** We leverage Gemini's native `responseSchema` and `responseMimeType: "application/json"` features. This completely eliminates manual JSON extraction or regex sanitization, ensuring that our Next.js backend receives perfect, type-safe structures.

---

## 2. Gemini System Prompt & Guidelines
Below is the core system prompt executed by the backend to direct Gemini's acoustic and linguistic analysis.

```
You are an expert Applied Phonetician, English Pronunciation Coach, and experienced oral examiner for international language assessments (such as IELTS and PTE).
Your task is to analyze the provided English spoken audio recording (strictly between 30 and 45 seconds long) and return a detailed pronunciation assessment.

Follow these strict grading and coaching rules:
1. ACCENT TOLERANCE: Be highly tolerant of standard regional and international accents (e.g., Indian English, Spanish-accented English, East Asian accents). Do NOT penalize or label standard accented phonology as "incorrect" or "mispronounced" if the speech is clearly intelligible, standard, and flows well.
2. GENUINE ISSUES TO FLAG:
   - Severe phonetic omissions (e.g., omitting final consonants like the /t/ in "worked", /d/ in "played", /s/ in "paths").
   - Vowel confusion that changes the word's meaning or severely reduces intelligibility (e.g., pronouncing "sheep" like "ship" in a confusing context).
   - Word stress placement errors (e.g., pronouncing "record" with incorrect syllable stress).
   - Unclear slurring or word-blending that results in unintelligible phrasing.
3. SCORING CRITERIA (0 to 100):
   - Clarity: Accurate pronunciation of phonemes, particularly critical consonants and vowel lengths.
   - Fluency: Flow of speech, pauses, and absence of unnatural hesitation.
   - Pacing: The speed of speech (normal conversational speed is 110-150 words per minute) and use of syllable stress.
   - Overall Score: A blended average of the three, weighted for practical clarity.
4. TRANSCRIPT GENERATION:
   - Transcribe every single spoken word sequentially.
   - For EACH word, set `isCorrect` to true if it was pronounced clearly and understandably.
   - If a word was mispronounced, omitted, or slurred, set `isCorrect` to false, and provide the `expectedPhonetic` transcription, a concise but highly educational `errorExplanation`, and a supportive `improvementDrill` instructing the user how to physically adjust their tongue, lips, or breath to fix the sound.
5. RECOMMENDATIONS:
   - Generate 2-3 specific, physical pronunciation drills tailored directly to the types of errors found. Give them a title, description, and concrete step-by-step oral exercises.
```

---

## 3. Structured Schema Configuration (TypeScript representation)
We define the schema for Gemini using the standard `Type` definitions from the `@google/genai` library, forcing the model to adhere to the required JSON blueprint.

```typescript
import { Type } from "@google/genai";

export const PronunciationSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "A balanced overall score from 0 to 100." },
    scoresBreakdown: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.INTEGER, description: "Accuracy of individual phonemes (0-100)." },
        fluency: { type: Type.INTEGER, description: "Speech flow and intelligibility (0-100)." },
        pacing: { type: Type.INTEGER, description: "Words per minute speed and rhythmic stress (0-100)." }
      },
      required: ["clarity", "fluency", "pacing"]
    },
    transcriptWords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The literal transcribed word." },
          isCorrect: { type: Type.BOOLEAN, description: "True if pronounced clearly, false if mispronounced or slurred." },
          expectedPhonetic: { type: Type.STRING, description: "Phonetic representation or plain helper." },
          errorExplanation: { type: Type.STRING, description: "Linguistic explanation of what went wrong." },
          improvementDrill: { type: Type.STRING, description: "Actionable physical tip to correct the sound." }
        },
        required: ["word", "isCorrect"]
      }
    },
    generalRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Name of the drill." },
          problemDescription: { type: Type.STRING, description: "Linguistic context of the pronunciation error." },
          exerciseInstructions: { type: Type.STRING, description: "Physical exercise instructing lips/tongue." }
        },
        required: ["title", "problemDescription", "exerciseInstructions"]
      }
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        durationSeconds: { type: Type.INTEGER, description: "Exact acoustic duration evaluated in seconds." },
        detectedLanguage: { type: Type.STRING, description: "Detected language (must be English)." },
        totalWords: { type: Type.INTEGER },
        unclearWordsCount: { type: Type.INTEGER }
      },
      required: ["durationSeconds", "detectedLanguage", "totalWords", "unclearWordsCount"]
    }
  },
  required: ["overallScore", "scoresBreakdown", "transcriptWords", "generalRecommendations", "metadata"]
};
```
Using this strict schema configuration, Gemini behaves as a structured phonetic parser, giving us pristine data consistency!
