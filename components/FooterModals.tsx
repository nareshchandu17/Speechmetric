"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, BarChart3, Info, X } from "lucide-react";

interface FooterModalsProps {
  activeModal: "privacy" | "scoring" | "about" | null;
  onClose: () => void;
}

export function FooterModals({ activeModal, onClose }: FooterModalsProps) {
  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Sheet container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-10 text-zinc-800"
            id="modal-container"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-150 bg-[#fafaf9]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  {activeModal === "privacy" && <Shield className="h-4 w-4" />}
                  {activeModal === "scoring" && <BarChart3 className="h-4 w-4" />}
                  {activeModal === "about" && <Info className="h-4 w-4" />}
                </div>
                <h3 className="font-bold text-sm text-zinc-900">
                  {activeModal === "privacy" && "Privacy & Data Protection Compliance"}
                  {activeModal === "scoring" && "Speech Scoring & Assessment Criteria"}
                  {activeModal === "about" && "About SpeechMetric Engine"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                id="close-modal-top-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-zinc-600 leading-relaxed">
              {activeModal === "privacy" && (
                <div className="space-y-3.5 text-left" id="privacy-modal-body">
                  <p className="font-medium text-zinc-800">
                    SpeechMetric operates with direct adherence to India&apos;s Digital Personal Data Protection (DPDP) Act, 2023.
                  </p>
                  <div className="space-y-2.5 border-l-2 border-indigo-500 pl-4">
                    <div>
                      <span className="font-bold text-zinc-800 block">1. Explicit Affirmative Consent</span>
                      Before any audio analysis, you must explicitly opt-in. This consent is logged inside browser localStorage and is fully withdrawable at any time.
                    </div>
                    <div>
                      <span className="font-bold text-zinc-800 block">2. Strict Purpose Limitation</span>
                      Audio recordings are processed solely to calculate English pronunciation ratings and generate speech feedback metrics.
                    </div>
                    <div>
                      <span className="font-bold text-zinc-800 block">3. In-Transit Stateless Memory Processing</span>
                      All recording analyses are done transiently. Audio payloads are handled purely in server-side RAM, processed via the Google Gemini API, and immediately destroyed. We do not store any voice files on disk.
                    </div>
                    <div>
                      <span className="font-bold text-zinc-800 block">4. Secure Transit & Processing Safeguards</span>
                      All transmissions use modern TLS/HTTPS encryption. Third-party cloud API partners do not retain audio files or use them for generative training model feedback.
                    </div>
                  </div>
                </div>
              )}

              {activeModal === "scoring" && (
                <div className="space-y-3.5 text-left" id="scoring-modal-body">
                  <p className="font-medium text-zinc-800">
                    Our SpeechMetric system provides an honest, evidence-linked assessment of spoken English across three key pronunciation pillars:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" /> Pronunciation Clarity (40%)
                      </span>
                      <span>Evaluates acoustic resonance and matching accuracy between your spoken vowels, consonants, and standard phonetic transcriptions.</span>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Fluency & Continuity (30%)
                      </span>
                      <span>Measures continuity, syllable flow speed, and checks for hesitation gaps, stuttering pauses, or uncharacteristic silence segment patterns.</span>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> Pacing & Rhythm (30%)
                      </span>
                      <span>Measures standard speech rhythm, verifying natural syllable duration alignments and cadence stability against native-speaker models.</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">
                    Disclaimer: This assessment is an AI coaching guide designed for practice. It is not equivalent to a laboratory-level phonetic acoustics evaluation.
                  </p>
                </div>
              )}

              {activeModal === "about" && (
                <div className="space-y-3.5 text-left" id="about-modal-body">
                  <p>
                    <strong className="text-zinc-800">SpeechMetric</strong> is an interactive English Pronunciation Assessor created as a high-fidelity demonstration applet.
                  </p>
                  <p>
                    Designed with an uncompromising focus on the user experience, this application proves that advanced generative intelligence (the Gemini-3.5-flash model) can be unified with real-time UI/UX state management to assist global speech learners securely.
                  </p>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <span className="font-bold text-indigo-900 block text-xs">Framework & Tech Stack Integration</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-indigo-950">
                      <li><strong>Next.js 15 App Router</strong> — server-side secure endpoints for AI processing.</li>
                      <li><strong>Framer Motion (motion/react)</strong> — spring layout morphing, responsive transitions, and visual feedback waves.</li>
                      <li><strong>Tailwind CSS v4</strong> — utility-first modern Swiss layouts.</li>
                      <li><strong>Lucide React Icons</strong> — crisp vector glyph system.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action button */}
            <div className="px-6 py-4 border-t border-zinc-150 bg-[#fafaf9] flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm hover:shadow-xs transition cursor-pointer"
                id="close-modal-bottom-btn"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
