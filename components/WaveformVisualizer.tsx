"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  mediaStream: MediaStream | null;
  isRecording: boolean;
}

export function WaveformVisualizer({ mediaStream, isRecording }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isRecording || !mediaStream || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      cleanupAudio();
      drawSilent();
      return;
    }

    try {
      // Initialize Audio Context and Analyser
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      let phase = 0;

      const draw = () => {
        if (!isRecording) return;
        
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const amplitude = Math.max(2, (average / 128) * (canvas.height / 3));

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background subtle grid lines
        ctx.strokeStyle = "rgba(226, 232, 240, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw dynamic wave
        phase += 0.15;
        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        // Wave 1 - Primary
        ctx.beginPath();
        ctx.strokeStyle = "rgba(15, 23, 42, 0.85)"; // slate-900
        ctx.lineWidth = 2.5;
        
        for (let x = 0; x < width; x++) {
          const angle = (x / width) * Math.PI * 3 + phase;
          // Apply a bell-curve envelope to pin the wave ends to 0
          const envelope = Math.sin((x / width) * Math.PI);
          const y = midY + Math.sin(angle) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Wave 2 - Secondary (offset and smaller)
        ctx.beginPath();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)"; // emerald-500 alpha
        ctx.lineWidth = 1.5;
        
        for (let x = 0; x < width; x++) {
          const angle = (x / width) * Math.PI * 4.5 - phase * 1.2;
          const envelope = Math.sin((x / width) * Math.PI);
          const y = midY + Math.sin(angle) * (amplitude * 0.5) * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      draw();
    } catch (e) {
      console.error("Failed to initialize waveform visualizer:", e);
      drawSilent();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      cleanupAudio();
    };
  }, [mediaStream, isRecording]);

  const cleanupAudio = () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  const drawSilent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw horizontal center line
    ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-1 text-xs text-slate-500 font-mono">
        <span>AUDIO INPUT LEVEL</span>
        {isRecording ? (
          <span className="text-emerald-600 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ACTIVE
          </span>
        ) : (
          <span>STANDBY</span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-16 rounded-lg bg-white"
      />
    </div>
  );
}
