"use client";

import { useState, useEffect } from "react";
import { CheckIcon, CopyIcon } from "@components/Icons";
import { EXPIRY_OPTIONS, DECOYS, generateCode } from "@lib/constants";
import { encryptSecret } from "@lib/crypto";
import { apiStore } from "@lib/api";

export type ShareResult = {
  link: string;
  code: string;
  expiry: number;
  passwordProtected: boolean;
};

function StepCopyLink({ link, onNext }: { link: string; onNext: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); };

  return (
    <div className="fade-in">
      <p className="section-label">Step 1 of 2</p>
      <p className="mb-1" style={{ fontSize: 17, fontWeight: 600 }}>Copy the link</p>
      <p className="mb-6" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
        The link alone cannot decrypt anything — send it through any channel.
      </p>

      <div className="flex items-center gap-3 p-4 mb-6" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)" }}>
          {link}
        </span>
        <button onClick={copy} className={`btn-copy ${copied ? "copied" : ""}`}>
          {copied ? <CheckIcon s={12} /> : <CopyIcon s={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button onClick={onNext} disabled={!copied} className="btn-primary">
        {copied ? "Continue →" : "Copy the link first"}
      </button>
    </div>
  );
}

function StepCopyCode({ result, onDone }: { result: ShareResult; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const fn = () => { if (document.hidden) navigator.clipboard.writeText("").catch(() => {}); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => { navigator.clipboard.writeText("").catch(() => {}); setCleared(true); }, 60000);
  };

  return (
    <div className="fade-in">
      <p className="section-label">Step 2 of 2</p>
      <p className="mb-1" style={{ fontSize: 17, fontWeight: 600 }}>Send the code separately</p>
      <p className="mb-6" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
        Use a different channel than the link. Both are needed to decrypt.
      </p>

      <div className="notice notice-amber mb-5">
        Never send the link and code through the same app or thread.
      </div>

      <div className="text-center py-7 mb-5" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", letterSpacing: "0.18em", marginBottom: 6 }}>
          {result.code}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>recipient enters this to decrypt</div>
      </div>

      <button onClick={copy} className={`btn-copy w-full justify-center py-3 mb-2 ${copied ? "copied" : ""}`} style={{ borderRadius: 10 }}>
        {copied ? <CheckIcon s={13} /> : <CopyIcon s={13} />}
        {copied ? "Code copied" : "Copy code"}
      </button>

      {copied && (
        <p className="text-center mb-5" style={{ fontSize: 12, color: cleared ? "var(--color-green)" : "rgba(255,255,255,0.35)" }}>
          {cleared ? "✓ Clipboard cleared" : "Clipboard clears in 60 seconds"}
        </p>
      )}

      <div className="divider" />
      <button onClick={onDone} disabled={!copied} className="btn-primary">Done →</button>
    </div>
  );
}

export default function ShareView({ onCreated }: { onCreated: (r: ShareResult) => void }) {
  const [secret, setSecret] = useState("");
  const [expiry, setExpiry] = useState(86400);
  const [usePassword, setUsePw] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [pending, setPending] = useState<ShareResult | null>(null);

  const handleCreate = async () => {
    if (!secret.trim()) return;
    setLoading(true); setError("");
    try {
      const code = generateCode();
      const payload = await encryptSecret(secret, code, usePassword && password ? password : null);
      const id = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, "0")).join("");
      const decoy = DECOYS[crypto.getRandomValues(new Uint32Array(1))[0] % DECOYS.length];
      await apiStore({ id, payload, decoy, expiry });
      const link = `${window.location.origin}${window.location.pathname}#reveal/${id}`;
      setPending({ link, code, expiry, passwordProtected: usePassword && !!password });
      setSecret(""); setPassword(""); setStep("copylink");
    } catch (e) { setError((e as Error).message || "Something went wrong."); }
    setLoading(false);
  };

  if (step === "copylink" && pending) return <StepCopyLink link={pending.link} onNext={() => setStep("copycode")} />;
  if (step === "copycode" && pending) return <StepCopyCode result={pending} onDone={() => { setStep("done"); onCreated(pending!); }} />;

  return (
    <div>
      <p className="section-label">Your secret</p>

      <textarea
        placeholder={"Paste your secret here\n\nPasswords, API keys, .env files, private notes..."}
        value={secret}
        onChange={e => setSecret(e.target.value)}
        spellCheck={false} autoComplete="off" data-gramm="false"
      />
      <div className="text-right mt-2 mb-6" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
        {secret.length} chars
      </div>

      {/* Options */}
      <div className="space-y-1 mb-6">
        <div className="row">
          <span className="row-label">Expires after</span>
          <select value={expiry} onChange={e => setExpiry(+e.target.value)}>
            {EXPIRY_OPTIONS.map(o => <option key={o.seconds} value={o.seconds}>{o.label}</option>)}
          </select>
        </div>
        <div className="row">
          <span className="row-label">Password lock</span>
          <div
            className={`toggle-track ${usePassword ? "on" : ""}`}
            onClick={() => setUsePw(v => !v)}
          >
            <div className="toggle-thumb" />
          </div>
        </div>
      </div>

      {usePassword && (
        <div className="mb-6">
          <div className="relative">
            <input
              className="glass-input"
              type={showPw ? "text" : "password"}
              placeholder="Enter a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ paddingRight: 56 }}
            />
            <button
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer border-none bg-transparent"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {showPw ? "hide" : "show"}
            </button>
          </div>
          <p className="mt-2" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Send via a third separate channel — not the same as the link or code.
          </p>
        </div>
      )}

      {error && <div className="notice notice-red mb-5">{error}</div>}

      <div className="divider" />

      <button onClick={handleCreate} disabled={loading || !secret.trim()} className="btn-primary">
        {loading ? <div className="spinner" /> : null}
        {loading ? "Encrypting…" : "Create link"}
      </button>

      <p className="text-center mt-5" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
        AES-256-GCM · encrypted in browser · deleted on first open · no logs
      </p>
    </div>
  );
}
