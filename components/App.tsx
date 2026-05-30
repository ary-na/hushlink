"use client";

import { useState, useEffect } from "react";
import { LockIcon } from "@components/Icons";
import ShareView from "@components/ShareView";
import RevealView from "@components/RevealView";
import ResultView from "@components/ResultView";
import AboutView from "@components/AboutView";
import ConsiderView from "@components/ConsiderView";
import ApiKeyView from "@components/ApiKeyView";
import type { ShareResult } from "@components/ShareView";

function parseRevealHash(): { id: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#reveal/")) return null;
  const id = hash.slice(8).split("/")[0];
  return id && /^[a-f0-9]{16}$/.test(id) ? { id } : null;
}

const TABS = [
  { id: "share", label: "Create" },
  { id: "about", label: "How it works" },
  { id: "tips",  label: "Stay safe" },
  { id: "api",   label: "API" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function App() {
  const [revealParams, setRevealParams] = useState<{ id: string } | null>(null);
  const [page, setPage] = useState("share");
  const [result, setResult] = useState<ShareResult | null>(null);
  const [tab, setTab] = useState<Tab>("share");

  useEffect(() => {
    const params = parseRevealHash();
    if (params) {
      setRevealParams(params);
      setPage("reveal");
    }
  }, []);

  const handleCreated = (res: ShareResult) => {
    setResult(res);
    setPage("result");
  };

  const handleReset = () => {
    setResult(null);
    setPage("share");
    setTab("share");
    window.location.hash = "";
  };

  const isReveal = page === "reveal";

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[600px] mx-auto px-5 pb-16">

        {/* Header */}
        <div className="pt-14 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 20px rgba(99,102,241,0.45)",
              }}
            >
              <LockIcon s={16} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
              hushlink
            </span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Zero-knowledge secret sharing · encrypted in your browser
          </p>
        </div>

        {/* Tab nav */}
        {!isReveal && (
          <div className="tab-bar mb-7">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                className={`tab-btn ${tab === id ? "active" : ""}`}
                onClick={() => {
                  setTab(id);
                  if (id === "share" && page === "result") handleReset();
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Main glass card */}
        <div className="glass p-7 mb-6">
          {isReveal && <RevealView id={revealParams!.id} />}
          {!isReveal && tab === "share" && page === "share" && (
            <ShareView onCreated={handleCreated} />
          )}
          {!isReveal && tab === "share" && page === "result" && result && (
            <ResultView result={result} onReset={handleReset} />
          )}
          {!isReveal && tab === "about" && <AboutView />}
          {!isReveal && tab === "tips"  && <ConsiderView />}
          {!isReveal && tab === "api"   && <ApiKeyView />}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <a href="/status" className="hover:text-white transition-colors">Status</a>
          <a href="mailto:security@hushlink.app" className="hover:text-white transition-colors">Security</a>
          <a href="https://arii.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Arian</a>
        </div>
      </div>
    </div>
  );
}
