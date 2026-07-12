import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required on the server.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, fileName, duration } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    // Strip base64 headers if present
    const cleanBase64 = audioBase64.includes(";base64,")
      ? audioBase64.split(";base64,")[1]
      : audioBase64;

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "audio/wav",
            data: cleanBase64,
          },
        },
        "Assess this English pronunciation audio recording. You must transcribe the speaker exactly, score overall phonetic accuracy, clarity, fluency, pacing, and rhythm/stress (all as integers out of 100). Identify specific mispronounced, omitted, or inserted words with phoneme spelling representations, precise explanations, and coaching tips. Follow the required JSON response schema exactly.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            clarity: { type: Type.INTEGER },
            fluency: { type: Type.INTEGER },
            pacing: { type: Type.INTEGER },
            stress: { type: Type.INTEGER },
            transcript: { type: Type.STRING },
            feedback: {
              type: Type.OBJECT,
              properties: {
                words: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      score: { type: Type.INTEGER },
                      phonemes: { type: Type.STRING },
                      errorType: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      actionableAdvice: { type: Type.STRING },
                    },
                    required: ["word", "score", "errorType", "explanation"],
                  },
                },
                generalAdvice: { type: Type.STRING },
                intelligibilityExplanation: { type: Type.STRING },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                focusAreas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["words", "generalAdvice", "intelligibilityExplanation", "keyStrengths", "focusAreas"],
            },
          },
          required: ["overallScore", "clarity", "fluency", "pacing", "stress", "transcript", "feedback"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from speech analysis model");
    }

    const parsedResult = JSON.parse(responseText);

    const session = {
      id: "sess_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      duration,
      fileName,
      overallScore: parsedResult.overallScore,
      clarity: parsedResult.clarity,
      fluency: parsedResult.fluency,
      pacing: parsedResult.pacing,
      stress: parsedResult.stress,
      transcript: parsedResult.transcript,
      feedback: parsedResult.feedback,
    };

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Audio analysis API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process pronunciation audit" },
      { status: 500 }
    );
  }
}
