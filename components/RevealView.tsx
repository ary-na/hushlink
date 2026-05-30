"use client";

import { useState, useEffect, useRef } from "react";
import { CheckIcon, CopyIcon } from "@components/Icons";
import { REVEAL_TIMEOUT } from "@lib/constants";
import { decryptSecret, type EncryptedPayload } from "@lib/crypto";
import { apiFetch } from "@lib/api";

export default function RevealView({ id }: { id: string }) {
  const [state, setState] = useState("confirm");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(REVEAL_TIMEOUT);
  const [blurred, setBlurred] = useState(true);
  const [cachedPayload, setCachedPayload] = useState<EncryptedPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!copied) return;
    const fn = () => { if (document.hidden) navigator.clipboard.writeText("").catch(() => {}); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [copied]);

  useEffect(() => {
    if (state !== "revealed") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setSecret(""); setState("wiped"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [state]);

  const reveal = async (pw?: string) => {
    const resolvedPw = pw !== undefined ? pw : password;
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      let payload: EncryptedPayload;
      if (cachedPayload) {
        payload = cachedPayload;
      } else {
        const res = await apiFetch(id);
        if (!res.found) {
          if (res.decoy) { setSecret(res.decoy); setState("revealed"); }
          else setState("gone");
          setLoading(false);
          history.replaceState(null, "", window.location.pathname);
          return;
        }
        payload = res.payload;
      }
      if (payload.passwordProtected && !resolvedPw) {
        setCachedPayload(payload); setState("needpw");
        history.replaceState(null, "", window.location.pathname);
        setLoading(false); return;
      }
      const decrypted = await decryptSecret(payload, code.trim().toUpperCase(), resolvedPw || null);
      setSecret(decrypted); setState("revealed");
      history.replaceState(null, "", window.location.pathname);
    } catch (e) {
      history.replaceState(null, "", window.location.pathname);
      if ((e as Error).message === "PASSWORD_REQUIRED") setState("needpw");
      else setError("Wrong code or password — check both and try again.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(secret); setCopied(true);
    setTimeout(() => { navigator.clipboard.writeText("").catch(() => {}); setCleared(true); setCopied(false); }, 60000);
  };

  const pct = Math.round((timeLeft / REVEAL_TIMEOUT) * 100);
  const urgent = timeLeft <= 10;

  if (state === "wiped") return (
    <div className="fade-in text-center py-4">
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔥</div>
      <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Secret wiped</p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>The 30-second window passed. Cleared from memory.</p>
    </div>
  );

  if (state === "gone") return (
    <div className="fade-in text-center py-4">
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Nothing here</p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>This secret has already been read or the link has expired.</p>
    </div>
  );

  if (state === "revealed") return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label" style={{ marginBottom: 0 }}>Decrypted</p>
        <span style={{ fontSize: 13, color: urgent ? "var(--color-red)" : "rgba(255,255,255,0.4)" }}>
          {timeLeft}s
        </span>
      </div>

      <div className="mb-5 overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 999 }}>
        <div className="timer-bar h-full" style={{
          width: `${pct}%`,
          borderRadius: 999,
          background: urgent ? "var(--color-red)" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
        }} />
      </div>

      {urgent && <div className="notice notice-red mb-4">Wiping in {timeLeft} seconds — copy now.</div>}

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
        Deleted from server · this is the only copy
      </p>

      <div className={`secret-display mb-2 ${!blurred ? "revealed" : ""}`} onClick={() => setBlurred(false)} onContextMenu={e => e.preventDefault()} title="Click to reveal">
        {blurred ? "Click to reveal" : secret}
      </div>
      {blurred && <p className="text-center mb-5" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Screenshot protection · click to reveal</p>}

      <button onClick={copy} className={copied ? "btn-secondary" : "btn-primary"} style={copied ? { borderColor: "rgba(52,211,153,0.4)", color: "#34d399" } : {}}>
        {copied ? <CheckIcon s={14} /> : <CopyIcon s={14} />}
        {copied ? "Copied to clipboard" : "Copy to clipboard"}
      </button>
      {copied && <p className="text-center mt-2" style={{ fontSize: 12, color: cleared ? "var(--color-green)" : "rgba(255,255,255,0.35)" }}>{cleared ? "✓ Clipboard cleared" : "Clears in 60 seconds"}</p>}
    </div>
  );

  if (state === "needpw") return (
    <div className="fade-in">
      <p className="section-label">Authentication required</p>
      <p className="mb-1" style={{ fontSize: 17, fontWeight: 600 }}>Password required</p>
      <p className="mb-6" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>This secret has a second encryption layer.</p>
      {error && <div className="notice notice-red mb-5">{error}</div>}
      <div className="relative mb-6">
        <input className="glass-input" type={showPw ? "text" : "password"} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && reveal(password)} autoComplete="off" style={{ paddingRight: 56 }} />
        <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs border-none bg-transparent cursor-pointer" style={{ color: "rgba(255,255,255,0.4)" }}>{showPw ? "hide" : "show"}</button>
      </div>
      <button onClick={() => reveal(password)} disabled={loading || !password} className="btn-primary">
        {loading ? <div className="spinner" /> : null}
        {loading ? "Decrypting…" : "Decrypt"}
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <p className="section-label">Incoming secret</p>
      <p className="mb-1" style={{ fontSize: 17, fontWeight: 600 }}>You have a secret</p>
      <p className="mb-6" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
        Enter the code sent to you separately. Opening this permanently deletes it from the server.
      </p>
      <div className="notice notice-amber mb-6">
        The code was sent through a different channel. Check your other messages.
      </div>
      {error && <div className="notice notice-red mb-5">{error}</div>}
      <div className="mb-6">
        <p className="section-label">Your code</p>
        <input
          className="glass-input"
          placeholder="3X7K-MN2P-5HRV-8CTW"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && reveal()}
          autoComplete="off" spellCheck={false}
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        />
      </div>
      <button onClick={() => reveal()} disabled={loading || !code.trim()} className="btn-primary">
        {loading ? <div className="spinner" /> : null}
        {loading ? "Decrypting…" : "Reveal and delete"}
      </button>
    </div>
  );
}
