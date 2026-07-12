export interface WordFeedback {
  word: string;
  score: number; // 0 to 100
  phonemes?: string;
  errorType?: "mispronounced" | "omitted" | "inserted" | "none";
  explanation?: string;
  actionableAdvice?: string;
}

export interface SessionFeedback {
  words: WordFeedback[];
  generalAdvice: string;
  intelligibilityExplanation: string;
  keyStrengths: string[];
  focusAreas: string[];
}

export interface SavedSession {
  id: string;
  timestamp: string;
  duration: number; // in seconds
  fileName: string;
  overallScore: number;
  clarity: number;
  fluency: number;
  pacing: number;
  stress: number;
  transcript: string;
  feedback: SessionFeedback;
}
