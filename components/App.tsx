"use client";

import { useState, useEffect } from "react";
import { LockIcon } from "@components/Icons";
import ShareView from "@components/ShareView";
import RevealView from "@components/RevealView";
import ResultView from "@components/ResultView";
import AboutView from "@components/AboutView";
import ConsiderView from "@components/ConsiderView";
import type { ShareResult } from "@components/ShareView";

function parseRevealHash(): { id: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#reveal/")) return null;
  const id = hash.slice(8).split("/")[0];
  return id && /^[a-f0-9]{16}$/.test(id) ? { id } : null;
}

export default function App() {
  const [revealParams, setRevealParams] = useState<{ id: string } | null>(null);
  const [page, setPage] = useState("share");
  const [result, setResult] = useState<ShareResult | null>(null);
  const [tab, setTab] = useState("share");

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
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="max-w-[640px] mx-auto px-6 relative z-10">
        <div className="pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-[10px] mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-mid to-purple-dark rounded-[10px] flex items-center justify-center text-white">
              <LockIcon s={18} />
            </div>
            <div className="text-[22px] font-semibold tracking-[-0.5px] text-text-bright">
              hush<span className="text-purple">link</span>
            </div>
          </div>
          <div className="text-sm text-text-dim">
            Zero-knowledge secret sharing. One link. One read. Gone forever.
          </div>
        </div>

        {!isReveal && (
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6">
            {(["share", "about", "tips"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-[9px] rounded-lg text-[13px] cursor-pointer border-none transition-all duration-150 ${
                  tab === t
                    ? "bg-[#1e1c2a] text-text font-medium"
                    : "bg-transparent text-text-faint font-normal"
                }`}
              >
                {t === "share"
                  ? "Create link"
                  : t === "about"
                    ? "How it works"
                    : "Stay safe"}
              </button>
            ))}
          </div>
        )}

        {isReveal && <RevealView id={revealParams!.id} />}
        {!isReveal && tab === "share" && page === "share" && (
          <ShareView onCreated={handleCreated} />
        )}
        {!isReveal && tab === "share" && page === "result" && result && (
          <ResultView result={result} onReset={handleReset} />
        )}
        {!isReveal && tab === "about" && <AboutView />}
        {!isReveal && tab === "tips" && <ConsiderView />}

        <div className="text-center py-8 pb-12 text-xs text-text-ghost space-y-2">
          <div>
            Encrypted in your browser · Credentials never exposed · No accounts
            · No logs
          </div>
          <div className="flex items-center justify-center gap-3">
            <a href="/privacy" className="text-text-ghost hover:text-text-faint transition-colors">Privacy</a>
            <span>·</span>
            <a href="/terms" className="text-text-ghost hover:text-text-faint transition-colors">Terms</a>
            <span>·</span>
            <a href="/status" className="text-text-ghost hover:text-text-faint transition-colors">Status</a>
            <span>·</span>
            <a href="mailto:security@hushlink.app" className="text-text-ghost hover:text-text-faint transition-colors">Security</a>
            <span>·</span>
            <span>
              Made by{" "}
              <a
                href="https://arii.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-faint hover:text-purple transition-colors"
              >
                Arian Najafi Yamchelo
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
