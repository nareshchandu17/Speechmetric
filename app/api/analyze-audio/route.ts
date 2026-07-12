import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Define the exact schema for structured pronunciation feedback conforming to SavedSession
const PronunciationSchema = {
  type: Type.OBJECT,
  properties: {
    detectedLanguage: { type: Type.STRING, description: "Primary spoken language detected in the audio (e.g. 'English', 'Spanish', 'Hindi', etc.)." },
    overallScore: { type: Type.INTEGER, description: "Overall balanced pronunciation score from 0 to 100." },
    clarity: { type: Type.INTEGER, description: "Accuracy of individual phonemes, vowels, and consonants (0-100)." },
    fluency: { type: Type.INTEGER, description: "Speech flow, smoothness, natural pausing, and absence of excessive hesitation (0-100)." },
    pacing: { type: Type.INTEGER, description: "Tempo, speech rate (110-150 WPM range), and appropriate rhythm (0-100)." },
    stress: { type: Type.INTEGER, description: "Syllable emphasis correctness and natural rhythmic intonation (0-100)." },
    transcript: { type: Type.STRING, description: "The exact sequential word-for-word transcript of the speaker." },
    feedback: {
      type: Type.OBJECT,
      properties: {
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              score: { type: Type.INTEGER, description: "Individual word accuracy score from 0 to 100." },
              phonemes: { type: Type.STRING, description: "IPA phonetic spelling helper (e.g. /wɜːkt/)." },
              errorType: { type: Type.STRING, description: "'mispronounced', 'omitted', 'inserted', or 'none'." },
              explanation: { type: Type.STRING, description: "Brief 1-sentence explanation of the phonetic issue or accuracy." },
              actionableAdvice: { type: Type.STRING, description: "Brief physical mechanics tip (e.g. tongue/lip placement)." },
            },
            required: ["word", "score", "errorType", "explanation"],
          },
        },
        generalAdvice: { type: Type.STRING, description: "Concise overall coaching guidance." },
        intelligibilityExplanation: { type: Type.STRING, description: "Overall speech intelligibility assessment across standard English contexts." },
        keyStrengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of vocal strengths detected."
        },
        focusAreas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of specific phonetic areas to focus on improving."
        },
      },
      required: ["words", "generalAdvice", "intelligibilityExplanation", "keyStrengths", "focusAreas"],
    },
  },
  required: ["detectedLanguage", "overallScore", "clarity", "fluency", "pacing", "stress", "transcript", "feedback"],
};

// System Prompt for Speech Coaching
const SYSTEM_INSTRUCTION = `You are an expert Applied Phonetician, English Pronunciation Coach, and oral examiner for international language assessments (such as IELTS/PTE).
Your task is to analyze the provided speech recording directly from the waveform and return a detailed pronunciation assessment conforming strictly to the JSON response schema.

Strict Grading and Coaching Rules:
1. DETECT LANGUAGE: First identify the primary language spoken in the audio ('detectedLanguage'). If the audio is not spoken in English, clearly state the detected language (e.g. 'Spanish', 'Hindi', 'French') in 'detectedLanguage'.
2. ACCENT TOLERANCE: Be highly tolerant of standard regional and international accents (such as Indian English, Spanish-accented English, East Asian accents, etc.). Do NOT penalize standard accented phonology if the speech is clearly intelligible and grammatically aligned. Only flag genuine acoustic deviations that hinder clarity.
3. SCORING CRITERIA (0 to 100):
   - clarity: Accuracy of individual phonemes (0-100).
   - fluency: Smoothness, continuity, and absence of long hesitations (0-100).
   - pacing: Cadence and tempo (ideal is 110-150 WPM) (0-100).
   - stress: Word stress placement and intonation (0-100).
   - overallScore: Balanced weighted score out of 100.
4. TRANSCRIPT & WORD BREAKDOWN:
   - Transcribe every spoken word sequentially in 'transcript'.
   - For EACH word in 'feedback.words', rate its individual 'score' (0-100).
   - If a word was mispronounced, omitted, or slurred (<85 score), provide its IPA 'phonemes' (e.g. "/wɜːkt/"), set 'errorType' ("mispronounced", "omitted", or "inserted"), a concise 1-sentence 'explanation', and direct physical 'actionableAdvice' (e.g., "Press tongue tip against roof of mouth for /t/").
   - For correct words (score >= 85), set 'errorType' to "none", and keep explanation/actionableAdvice brief or optional.
5. SUMMARY ADVICE: Provide insightful 'generalAdvice', 'intelligibilityExplanation', 2-3 'keyStrengths', and 2-3 'focusAreas'.`;

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your secrets or .env file.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Robust retry utility with exponential backoff and jitter for transient errors (e.g., 503, 429)
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any[];
    config?: any;
  },
  maxTries = 3,
  initialDelayMs = 1500
): Promise<any> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      console.log(`Calling Gemini API (Attempt ${attempt}/${maxTries}) using model: ${params.model}...`);
      const response = await ai.models.generateContent(params);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      
      const isTransient = 
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("temporary") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("overloaded") ||
        err?.status === 503 ||
        err?.status === 429;

      if (!isTransient || attempt === maxTries) {
        console.error(`Gemini API call failed permanently or reached maximum retry limit. Error: ${errMsg}`);
        throw err;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
      console.warn(`Gemini API returned transient error (Attempt ${attempt}/${maxTries}): ${errMsg}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    let audioBase64 = "";
    let fileName = "recording.wav";
    let duration: number | undefined;
    let mimeType = "audio/wav";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      audioBase64 = body.audioBase64 || "";
      fileName = body.fileName || "recording.wav";
      duration = typeof body.duration === "number" ? body.duration : (body.duration ? Number(body.duration) : undefined);
    } else {
      const formData = await req.formData();
      const file = formData.get("audio") as File | null;
      const consent = formData.get("consentGiven") as string | null;

      if (consent === "false") {
        return NextResponse.json(
          { error: "Consent required. Under India's Digital Personal Data Protection Act (DPDP), 2023, you must explicitly consent before processing your voice recording." },
          { status: 400 }
        );
      }

      if (!file) {
        return NextResponse.json(
          { error: "No audio recording file was provided." },
          { status: 400 }
        );
      }

      if (file.size > 32 * 1024 * 1024) {
        return NextResponse.json(
          { error: "The selected file exceeds the maximum allowed size of 32MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      audioBase64 = Buffer.from(arrayBuffer).toString("base64");
      fileName = file.name || "recording.wav";
      const durParam = formData.get("duration");
      duration = durParam ? Number(durParam) : undefined;
      mimeType = file.type || "audio/webm";
    }

    if (!audioBase64) {
      return NextResponse.json({ error: "No audio data provided." }, { status: 400 });
    }

    // 1. Pre-flight server-side duration verification (30s to 45s constraint)
    if (typeof duration === "number" && !isNaN(duration)) {
      if (duration < 30 || duration > 45) {
        return NextResponse.json(
          {
            error: `Audio duration must be between 30 and 45 seconds. (Provided: ${duration}s)`,
            durationSeconds: duration
          },
          { status: 400 }
        );
      }
    }

    // Strip base64 headers if present
    let cleanBase64 = audioBase64;
    if (audioBase64.includes(";base64,")) {
      const parts = audioBase64.split(";base64,");
      const mimePart = parts[0].replace("data:", "").trim();
      if (mimePart) {
        mimeType = mimePart;
      }
      cleanBase64 = parts[1];
    }
    if (mimeType.includes(";")) {
      mimeType = mimeType.split(";")[0].trim();
    }

    // Normalize common MIME types for Gemini API compatibility
    if (mimeType === "audio/x-m4a" || mimeType === "audio/m4a" || mimeType === "audio/x-mp4") {
      mimeType = "audio/aac";
    } else if (mimeType === "audio/wave" || mimeType === "audio/x-wav") {
      mimeType = "audio/wav";
    } else if (mimeType === "audio/mpeg") {
      mimeType = "audio/mp3";
    }

    // Initialize client and run content generation with transient retries
    const ai = getAiClient();

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          }
        },
        {
          text: "Analyze this spoken recording. Transcribe exactly, score overall phonetic accuracy, clarity, fluency, pacing, and stress (0-100), and evaluate each word sequentially with diagnostic feedback."
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PronunciationSchema,
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "Failed to generate assessment. The AI response was empty." },
        { status: 500 }
      );
    }

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, "");
      cleanedText = cleanedText.replace(/\n?```$/, "");
      cleanedText = cleanedText.trim();
    }

    const parsedResult = JSON.parse(cleanedText);

    // 2. Server-side verification: English speech only constraint
    const detectedLang = (parsedResult.detectedLanguage || "").toLowerCase();
    if (detectedLang && !detectedLang.includes("eng") && !detectedLang.includes("en-")) {
      return NextResponse.json(
        { error: `Only English speech is currently supported. (Detected language: ${parsedResult.detectedLanguage || "Non-English"})` },
        { status: 400 }
      );
    }

    const session = {
      id: "sess_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      duration: typeof duration === "number" && !isNaN(duration) ? duration : 35,
      fileName,
      overallScore: typeof parsedResult.overallScore === "number" ? parsedResult.overallScore : 75,
      clarity: typeof parsedResult.clarity === "number" ? parsedResult.clarity : 75,
      fluency: typeof parsedResult.fluency === "number" ? parsedResult.fluency : 75,
      pacing: typeof parsedResult.pacing === "number" ? parsedResult.pacing : 75,
      stress: typeof parsedResult.stress === "number" ? parsedResult.stress : 75,
      transcript: parsedResult.transcript || "",
      feedback: {
        words: Array.isArray(parsedResult.feedback?.words)
          ? parsedResult.feedback.words.map((w: any) => ({
              word: typeof w?.word === "string" ? w.word : "",
              score: typeof w?.score === "number" ? w.score : 85,
              phonemes: typeof w?.phonemes === "string" ? w.phonemes : undefined,
              errorType: typeof w?.errorType === "string" ? w.errorType : "none",
              explanation: typeof w?.explanation === "string" ? w.explanation : undefined,
              actionableAdvice: typeof w?.actionableAdvice === "string" ? w.actionableAdvice : undefined,
            }))
          : [],
        generalAdvice: parsedResult.feedback?.generalAdvice || "Clear speech with minor areas for articulation polish.",
        intelligibilityExplanation: parsedResult.feedback?.intelligibilityExplanation || "Speech is understandable across standard conversational contexts.",
        keyStrengths: Array.isArray(parsedResult.feedback?.keyStrengths) && parsedResult.feedback.keyStrengths.length > 0
          ? parsedResult.feedback.keyStrengths
          : ["Good baseline intelligibility and natural cadence."],
        focusAreas: Array.isArray(parsedResult.feedback?.focusAreas) && parsedResult.feedback.focusAreas.length > 0
          ? parsedResult.feedback.focusAreas
          : ["Focus on clear consonant releases and steady rhythm."],
      },
    };

    return NextResponse.json({ session, ...session });

  } catch (error: any) {
    console.error("Audio analysis API error:", error);
    
    if (error?.message && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "The server's Gemini API Key is not configured. Please set the GEMINI_API_KEY environment variable." },
        { status: 501 }
      );
    }

    let userFriendlyError = "The audio could not be processed. Try another recording.";
    const errMsg = error?.message || "";
    
    if (errMsg.includes("safety") || errMsg.includes("blocked") || errMsg.includes("candidate")) {
      userFriendlyError = "The audio content was flagged by safety filters. Please record a clear, standard English speech sample.";
    } else if (errMsg.includes("MIME") || errMsg.includes("format") || errMsg.includes("mime") || errMsg.includes("type")) {
      userFriendlyError = "The audio format is not fully supported by the assessment engine. Please try another browser or upload a standard WAV/MP3 file.";
    } else if (errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("resource") || errMsg.includes("busy") || errMsg.includes("exhausted")) {
      userFriendlyError = "The speech assessment engine is temporarily busy. Please try again in a few seconds.";
    } else if (errMsg.includes("empty") || errMsg.includes("transcript") || errMsg.includes("no speech") || errMsg.includes("speech not detected")) {
      userFriendlyError = "No clear English speech was detected in the recording. Please speak clearly into your microphone.";
    } else if (error instanceof SyntaxError) {
      userFriendlyError = "The pronunciation analysis response could not be parsed. Please try recording again with clear speech.";
    }

    const finalError = `${userFriendlyError} (Details: ${errMsg})`;

    return NextResponse.json(
      { error: finalError },
      { status: 500 }
    );
  }
}

