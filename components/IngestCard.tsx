"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, UploadCloud, AlertCircle, RefreshCw, AudioLines, FileCheck } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface IngestCardProps {
  onAnalysisStart: (stage: string) => void;
  onAnalysisProgress: (stage: string) => void;
  onAnalysisSuccess: (result: any) => void;
  onAnalysisError: (error: string) => void;
}

export function IngestCard({
  onAnalysisStart,
  onAnalysisProgress,
  onAnalysisSuccess,
  onAnalysisError,
}: IngestCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState("");

  const [activeTab, setActiveTab] = useState<"microphone" | "upload">("microphone");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setValidationError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);

        // Validate duration
        if (recordDuration < 30 || recordDuration > 45) {
          setValidationError(`Recording duration must be between 30 and 45 seconds. (Your recording: ${recordDuration}s)`);
          setSelectedFile(null);
          setFileDuration(null);
        } else {
          setSelectedFile(file);
          setFileDuration(recordDuration);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 45) {
            // Auto stop at max limit
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error("Error accessing microphone:", e);
      setValidationError("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    setSelectedFile(null);
    setFileDuration(null);

    if (!file.type.startsWith("audio/")) {
      setValidationError("Please select a valid English audio file (e.g., WAV, MP3, M4A, WEBM).");
      return;
    }

    // Check size limit (32MB)
    if (file.size > 32 * 1024 * 1024) {
      setValidationError("Audio file size must be smaller than 32MB.");
      return;
    }

    // Inspect audio duration using Audio element
    const audioUrl = URL.createObjectURL(file);
    const audioObj = new Audio(audioUrl);
    
    audioObj.addEventListener("loadedmetadata", () => {
      const duration = Math.round(audioObj.duration);
      if (duration < 30 || duration > 45) {
        setValidationError(`Audio file duration must be between 30 and 45 seconds. (Selected file: ${duration}s)`);
        URL.revokeObjectURL(audioUrl);
      } else {
        setSelectedFile(file);
        setFileDuration(duration);
        URL.revokeObjectURL(audioUrl);
      }
    });

    audioObj.addEventListener("error", () => {
      setValidationError("Could not decode audio file metadata. Please ensure the file is not corrupted.");
      URL.revokeObjectURL(audioUrl);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Run server analysis
  const runAnalysis = async () => {
    if (!selectedFile || fileDuration === null) return;

    setAnalyzing(true);
    onAnalysisStart("Initializing secure upload...");

    // Stage-based transition simulated for better product feedback
    const stages = [
      "Validating audio signature",
      "Uploading vocal sample securely",
      "De-noising & transcribing speech",
      "Analyzing pronunciation clarity",
      "Benchmarking phonetic variance",
      "Generating structural feedback",
    ];

    let currentStageIndex = 0;
    setCurrentStage(stages[0]);
    onAnalysisProgress(stages[0]);

    const stageTimer = setInterval(() => {
      if (currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        setCurrentStage(stages[currentStageIndex]);
        onAnalysisProgress(stages[currentStageIndex]);
      }
    }, 2500);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const response = await fetch("/api/analyze-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioBase64: base64Data,
            fileName: selectedFile.name,
            duration: fileDuration,
          }),
        });

        clearInterval(stageTimer);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Analysis failed");
        }

        const data = await response.json();
        onAnalysisSuccess(data.session);
        setAnalyzing(false);
      };
    } catch (e: any) {
      clearInterval(stageTimer);
      onAnalysisError(e.message || "An unexpected error occurred during phonetic analysis.");
      setAnalyzing(false);
    }
  };

  // Circle progress calculation
  const currentDuration = isRecording ? recordDuration : (fileDuration || 0);
  const strokeDasharray = 314.15; // 2 * pi * r (where r = 50)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(currentDuration, 45)) / 45;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col space-y-6" id="ingest-card">
      
      {/* Tab Selectors */}
      <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => {
            if (!isRecording && !analyzing) {
              setActiveTab("microphone");
              setValidationError(null);
            }
          }}
          disabled={isRecording || analyzing}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus:outline-none ${
            activeTab === "microphone"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mic className="w-3.5 h-3.5 shrink-0" />
          Microphone
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isRecording && !analyzing) {
              setActiveTab("upload");
              setValidationError(null);
            }
          }}
          disabled={isRecording || analyzing}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus:outline-none ${
            activeTab === "upload"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 shrink-0" />
          Upload Audio
        </button>
      </div>

      {/* Recording Waveform Overlay when recording */}
      {isRecording && (
        <div className="h-16 bg-slate-50/60 rounded-xl overflow-hidden border border-slate-200/60">
          <WaveformVisualizer mediaStream={mediaStream} isRecording={isRecording} />
        </div>
      )}

      {/* Tab Content 1: Microphone */}
      {activeTab === "microphone" && (
        <div className="flex flex-col items-center justify-center space-y-6">
          
          {/* Circular Recording Indicator */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background Track Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="6"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="none"
                stroke={isRecording ? "#ef4444" : "#2563eb"}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Central Microphone Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={analyzing}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-150 shadow-sm border cursor-pointer z-10 relative focus:outline-none ${
                isRecording
                  ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse hover:bg-rose-100/80"
                  : selectedFile
                  ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100/80"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Mic className={`w-8 h-8 transition-transform duration-150 ${isRecording ? "scale-110" : ""}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 font-mono">
                {isRecording ? "Tap Stop" : selectedFile ? "Retake" : "Tap Rec"}
              </span>
            </button>
          </div>

          {/* Record Duration Timer */}
          <div className="text-center space-y-1">
            <p className="text-[11px] font-mono tracking-wider text-slate-400 font-semibold uppercase">vocal recording</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
              0:{currentDuration < 10 ? `0${currentDuration}` : currentDuration} <span className="text-sm font-medium text-slate-400">/ 0:45</span>
            </p>
          </div>

          {/* Target Duration Range Progress Bar */}
          <div className="w-full space-y-2 px-1">
            <div className="relative h-2 bg-slate-100 rounded-full overflow-visible">
              {/* Highlight valid range [30s, 45s] */}
              <div className="absolute left-[66%] right-0 h-full bg-emerald-100 rounded-r-full"></div>
              
              {/* Actual filled progress */}
              <div
                style={{ width: `${Math.min((currentDuration / 45) * 100, 100)}%` }}
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                  currentDuration >= 30 && currentDuration <= 45
                    ? "bg-emerald-500"
                    : isRecording
                    ? "bg-rose-500"
                    : "bg-blue-500"
                }`}
              ></div>

              {/* Min Marker (30s at 66% width) */}
              <div className="absolute left-[66%] top-1/2 -translate-y-1/2 w-1.5 h-3 bg-emerald-500 rounded-sm" title="Minimum 30 seconds threshold"></div>
            </div>

            {/* Scale Ticks Labels */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono">
              <span>0s</span>
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Min 30s
              </span>
              <span>Max 45s</span>
            </div>
          </div>

          {/* Success Check Banner */}
          {selectedFile && !isRecording && (
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center gap-2.5 text-emerald-800 font-semibold text-xs shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0">✓</span>
              <span>Voice sample recorded successfully!</span>
            </div>
          )}

        </div>
      )}

      {/* Tab Content 2: Upload File */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] transition-all duration-150 active:scale-[0.99] ${
                dragActive
                  ? "border-blue-500 bg-blue-50/30"
                  : "border-slate-200/80 hover:border-slate-400 bg-slate-50/60"
              }`}
            >
              <input
                id="file-input"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="w-10 h-10 text-blue-600 mb-3 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-800">
                Drag &amp; drop audio here, or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-1">
                WAV, MP3, M4A or WEBM up to 32MB (30s – 45s)
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Duration: <strong className="text-slate-700">{fileDuration}s</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFileDuration(null);
                  setValidationError(null);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-all duration-150 cursor-pointer active:scale-95 px-2.5 py-1.5 hover:bg-rose-50 rounded-lg focus:outline-none shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Success Check Banner */}
          {selectedFile && (
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center gap-2.5 text-emerald-800 font-semibold text-xs shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0">✓</span>
              <span>Audio uploaded successfully!</span>
            </div>
          )}
        </div>
      )}

      {/* Validation or backend error banner */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2.5 text-rose-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
          <span className="text-xs font-semibold leading-normal">{validationError}</span>
        </div>
      )}

      {/* Upload & Analyze Trigger */}
      {selectedFile && !analyzing && (
        <button
          onClick={runAnalysis}
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm tracking-tight flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          Analyze Pronunciation
        </button>
      )}

      {/* Live progress indicator */}
      {analyzing && (
        <div className="p-4 bg-blue-50/50 border border-blue-200/60 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-700 font-semibold uppercase tracking-wider">
              AI Speech Engine
            </span>
            <span className="text-xs text-blue-700 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              Processing
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-800">
              {currentStage}
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-[loading_15s_ease-in-out_infinite]"></div>
            </div>
          </div>
          <style jsx>{`
            @keyframes loading {
              0% { width: 5%; }
              15% { width: 25%; }
              40% { width: 55%; }
              70% { width: 85%; }
              90% { width: 95%; }
              100% { width: 99%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
