import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Define the schema for structured pronunciation feedback
const PronunciationSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "A balanced overall score from 0 to 100 based on pronunciation, fluency, and pacing." },
    scoresBreakdown: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.INTEGER, description: "Accuracy of individual phonemes, vowels, and consonants (0-100)." },
        fluency: { type: Type.INTEGER, description: "Speech flow, smoothness, hesitations, and ease of understanding (0-100)." },
        pacing: { type: Type.INTEGER, description: "Tempo, speech rate, and appropriate word stress (0-100)." }
      },
      required: ["clarity", "fluency", "pacing"]
    },
    transcriptWords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The literal transcribed word in sequence." },
          isCorrect: { type: Type.BOOLEAN, description: "True if pronounced clearly, false if mispronounced, heavily slurred, or unclear." },
          expectedPhonetic: { type: Type.STRING, description: "ONLY include for incorrect words (isCorrect=false). Standard IPA helper (e.g. /wɜːkt/). Leave this field completely out of the object if isCorrect is true." },
          errorExplanation: { type: Type.STRING, description: "ONLY include for incorrect words (isCorrect=false). Extremely brief 1-sentence linguistic explanation. Leave this field completely out of the object if isCorrect is true." },
          improvementDrill: { type: Type.STRING, description: "ONLY include for incorrect words (isCorrect=false). Extremely brief 1-sentence physical adjustment tip. Leave this field completely out of the object if isCorrect is true." }
        },
        required: ["word", "isCorrect"]
      }
    },
    generalRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the targeted drill (e.g., 'Final Consonant Release')." },
          problemDescription: { type: Type.STRING, description: "Very brief description of the core acoustic issue (max 1 sentence)." },
          exerciseInstructions: { type: Type.STRING, description: "Very brief step-by-step instructions to practice (max 2 short sentences)." }
        },
        required: ["title", "problemDescription", "exerciseInstructions"]
      }
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        durationSeconds: { type: Type.INTEGER, description: "Determined duration of the speech stream in seconds." },
        detectedLanguage: { type: Type.STRING, description: "The primary language detected (should be 'English')." },
        totalWords: { type: Type.INTEGER, description: "Count of total words parsed." },
        unclearWordsCount: { type: Type.INTEGER, description: "Count of mispronounced or unclear words." }
      },
      required: ["durationSeconds", "detectedLanguage", "totalWords", "unclearWordsCount"]
    }
  },
  required: ["overallScore", "scoresBreakdown", "transcriptWords", "generalRecommendations", "metadata"]
};

// System Prompt for Speech Coaching
const SYSTEM_INSTRUCTION = `You are an expert Applied Phonetician, English Pronunciation Coach, and experienced oral examiner for international language assessments (such as IELTS and PTE).
Your task is to analyze the provided English spoken audio recording and return a detailed, professional pronunciation assessment.

You must follow these strict grading and coaching rules:
1. ACCENT TOLERANCE: Be highly tolerant of standard regional and international accents (such as Indian English, Spanish-accented English, East Asian accents, French English, etc.). Do NOT penalize or label standard accented phonology as "incorrect" or "mispronounced" if the spoken speech is clearly intelligible, grammatically aligned, and flows reasonably. Only flag actual mistakes that hinder intelligibility.
2. GENUINE PHONETIC ISSUES TO FLAG:
   - Severe phonetic omissions (e.g., omitting final consonants like the /t/ in "worked", /d/ in "played", /s/ in "paths").
   - Vowel confusion that changes the word's semantic meaning or severely reduces clarity (e.g., pronouncing "sheep" like "ship" in a confusing context).
   - Word stress placement errors (e.g., placing stress on the wrong syllable of "record" or "determine").
   - Unclear slurring or speech-blending that results in unintelligible phrasing.
3. SCORING CRITERIA (0 to 100):
   - Clarity: Accuracy of individual phonemes (0-100).
   - Fluency: Smoothness, natural pausing, and absence of excessive hesitation (0-100).
   - Pacing: The tempo of speech (normal is 110-150 WPM) and appropriate rhythmic stress (0-100).
   - Overall Score: A calculated average of the three, weighted for practical clarity.
4. TRANSCRIPT GENERATION AND LATENCY OPTIMIZATION:
   - Transcribe every single spoken word sequentially.
   - For EACH word, set 'isCorrect' to true if it was spoken clearly and understandably.
   - IMPORTANT LATENCY LIMIT: To prevent server timeouts, you MUST completely omit 'expectedPhonetic', 'errorExplanation', and 'improvementDrill' fields for any correct words (where isCorrect is true). Do NOT include these fields with empty strings, null, or placeholder values—leave them completely undefined and out of the word's object.
   - If a word was mispronounced, omitted, or slurred, set 'isCorrect' to false, and provide 'expectedPhonetic' (e.g. "/wɜːkt/"), an extremely concise 'errorExplanation' (max 10 words), and a highly direct physical 'improvementDrill' (max 10 words).
5. EXERCISES & RECOMMENDATIONS:
   - Generate exactly 2-3 specific, physical pronunciation drills tailored directly to the types of errors found. Keep titles, problem descriptions, and instructions extremely brief and concise (at most 1 sentence each) to minimize response latency.`;

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
      
      // Classify error as transient if it is a 503, 429, or specifically mentions high demand/temporary spikes
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

      // Exponential backoff with random jitter (+/- 20%)
      const delay = initialDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
      console.warn(`Gemini API returned transient error (Attempt ${attempt}/${maxTries}): ${errMsg}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;
    const consent = formData.get("consentGiven") as string | null;

    if (consent !== "true") {
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

    // Server-side validation of size to prevent DOS (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "The selected file exceeds the maximum allowed size of 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer and base64 for inlineData
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");
    
    // Determine the proper MIME type and strip parameters (e.g. "audio/webm;codecs=opus" -> "audio/webm")
    let mimeType = file.type || "audio/webm";
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

    // Initialize client and run content generation with robust transient retries
    const ai = getAiClient();

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType,
          }
        },
        {
          text: "Analyze this spoken English recording. Transcribe the spoken text, evaluate the pronunciation of each word sequentially, and rate clarity, fluency, and pacing according to the structured instructions."
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PronunciationSchema,
        temperature: 0.2, // Lower temperature for more factual phonetic feedback
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "Failed to generate assessment. The AI response was empty." },
        { status: 500 }
      );
    }

    // Clean markdown code blocks if the model wrapped the JSON output
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, "");
      cleanedText = cleanedText.replace(/\n?```$/, "");
      cleanedText = cleanedText.trim();
    }

    const rawData = JSON.parse(cleanedText);

    // Validate and robustly fall back on any missing schema properties
    const detectedDuration = typeof rawData.metadata?.durationSeconds === "number" ? rawData.metadata.durationSeconds : 35;
    const validatedData = {
      overallScore: typeof rawData.overallScore === "number" ? rawData.overallScore : 75,
      scoresBreakdown: {
        clarity: typeof rawData.scoresBreakdown?.clarity === "number" ? rawData.scoresBreakdown.clarity : 75,
        fluency: typeof rawData.scoresBreakdown?.fluency === "number" ? rawData.scoresBreakdown.fluency : 75,
        pacing: typeof rawData.scoresBreakdown?.pacing === "number" ? rawData.scoresBreakdown.pacing : 75,
      },
      transcriptWords: Array.isArray(rawData.transcriptWords)
        ? rawData.transcriptWords.map((w: any) => ({
            word: typeof w?.word === "string" ? w.word : "",
            isCorrect: typeof w?.isCorrect === "boolean" ? w.isCorrect : true,
            expectedPhonetic: typeof w?.expectedPhonetic === "string" ? w.expectedPhonetic : undefined,
            errorExplanation: typeof w?.errorExplanation === "string" ? w.errorExplanation : undefined,
            improvementDrill: typeof w?.improvementDrill === "string" ? w.improvementDrill : undefined,
          }))
        : [],
      generalRecommendations: Array.isArray(rawData.generalRecommendations)
        ? rawData.generalRecommendations.map((r: any) => ({
            title: typeof r?.title === "string" ? r.title : "Practice General Phonetics",
            problemDescription: typeof r?.problemDescription === "string" ? r.problemDescription : "Minor acoustic deviations detected.",
            exerciseInstructions: typeof r?.exerciseInstructions === "string" ? r.exerciseInstructions : "Practice pronouncing word endings and maintaining a steady rhythm.",
          }))
        : [],
      metadata: {
        durationSeconds: detectedDuration,
        detectedLanguage: typeof rawData.metadata?.detectedLanguage === "string" ? rawData.metadata.detectedLanguage : "English",
        totalWords: typeof rawData.metadata?.totalWords === "number" ? rawData.metadata.totalWords : 0,
        unclearWordsCount: typeof rawData.metadata?.unclearWordsCount === "number" ? rawData.metadata.unclearWordsCount : 0,
      }
    };

    // Server-side validation of duration on the resulting AI parsed payload (30s to 45s constraint)
    if (detectedDuration < 30 || detectedDuration > 45) {
      return NextResponse.json(
        {
          error: "Upload an audio file between 30 and 45 seconds.",
          durationSeconds: detectedDuration
        },
        { status: 400 }
      );
    }

    // Check if the detected language is English
    const detectedLang = validatedData.metadata.detectedLanguage.toLowerCase();
    if (detectedLang && !detectedLang.includes("eng")) {
      return NextResponse.json(
        { error: "Only English speech is currently supported." },
        { status: 400 }
      );
    }

    return NextResponse.json(validatedData);

  } catch (error: any) {
    console.error("Audio analysis API error:", error);
    
    // Check if it's an API Key configuration error
    if (error?.message && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "The server's Gemini API Key is not configured. Please set the GEMINI_API_KEY environment variable in the Settings menu." },
        { status: 501 }
      );
    }

    // Produce safe, helpful, standardized errors with clear underlying diagnostics
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

    // Append underlying error message for clear engineering diagnosis
    const finalError = `${userFriendlyError} (Details: ${errMsg})`;

    return NextResponse.json(
      { error: finalError },
      { status: 500 }
    );
  }
}
