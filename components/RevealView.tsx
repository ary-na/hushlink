"use client";

import { useState, useEffect, useRef } from "react";
import {
  LockIcon,
  FireIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  AlertIcon,
  CheckIcon,
  CopyIcon,
  TimerIcon,
} from "@components/Icons";
import { REVEAL_TIMEOUT } from "@lib/constants";
import { decryptSecret, type EncryptedPayload } from "@lib/crypto";
import { apiFetch } from "@lib/api";

type Props = { id: string };

export default function RevealView({ id }: Props) {
  const [state, setState] = useState("confirm");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clipboardCleared, setCleared] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(REVEAL_TIMEOUT);
  const [blurred, setBlurred] = useState(true);
  const [cachedPayload, setCachedPayload] = useState<EncryptedPayload | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!copied) return;
    const wipeOnHide = () => {
      if (document.hidden) navigator.clipboard.writeText("").catch(() => {});
    };
    document.addEventListener("visibilitychange", wipeOnHide);
    return () => document.removeEventListener("visibilitychange", wipeOnHide);
  }, [copied]);

  useEffect(() => {
    if (state !== "revealed") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setSecret("");
          setState("wiped");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [state]);

  const reveal = async (pw?: string) => {
    const resolvedPw = pw !== undefined ? pw : password;
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      let payload: EncryptedPayload;

      if (cachedPayload) {
        // Password retry — secret already deleted, use cached payload
        payload = cachedPayload;
      } else {
        const res = await apiFetch(id);
        if (!res.found) {
          if (res.decoy) {
            setSecret(res.decoy);
            setState("revealed");
          } else setState("gone");
          setLoading(false);
          history.replaceState(null, "", window.location.pathname);
          return;
        }
        payload = res.payload;
      }

      if (payload.passwordProtected && !resolvedPw) {
        setCachedPayload(payload);
        setState("needpw");
        history.replaceState(null, "", window.location.pathname);
        setLoading(false);
        return;
      }

      const decrypted = await decryptSecret(
        payload,
        code.trim().toUpperCase(),
        resolvedPw || null,
      );
      setSecret(decrypted);
      setState("revealed");
      history.replaceState(null, "", window.location.pathname);
    } catch (e) {
      history.replaceState(null, "", window.location.pathname);
      if ((e as Error).message === "PASSWORD_REQUIRED") setState("needpw");
      else setError("Wrong code or password. Please check and try again.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {});
      setCleared(true);
      setCopied(false);
    }, 60000);
  };

  const timerPct = Math.round((timeLeft / REVEAL_TIMEOUT) * 100);
  const urgent = timeLeft <= 10;

  if (state === "wiped")
    return (
      <div className="bg-surface-dark border border-border rounded-2xl p-7 mb-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-bg border border-red-border rounded-2xl flex items-center justify-center text-red">
          <FireIcon s={28} />
        </div>
        <div className="text-[18px] font-medium text-text-bright mb-[6px]">
          Secret wiped
        </div>
        <div className="text-[13px] text-text-dim leading-[1.6]">
          The 30-second window has passed. Secret cleared from memory and DOM.
        </div>
      </div>
    );

  if (state === "gone")
    return (
      <div className="bg-surface-dark border border-border rounded-2xl p-7 mb-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-bg border border-red-border rounded-2xl flex items-center justify-center text-red">
          <FireIcon s={28} />
        </div>
        <div className="text-[18px] font-medium text-text-bright mb-[6px]">
          Nothing here
        </div>
        <div className="text-[13px] text-text-dim leading-[1.6]">
          This secret has already been read or the link has expired.
        </div>
      </div>
    );

  if (state === "revealed")
    return (
      <div>
        <div
          className={`text-xs mb-[10px] flex items-center gap-[6px] ${urgent ? "text-red" : "text-text-dim"}`}
        >
          <TimerIcon s={14} />
          {urgent
            ? `Wiping in ${timeLeft}s — copy now`
            : `Auto-wipes in ${timeLeft}s`}
        </div>
        <div className="h-[3px] bg-border rounded-sm mb-3 overflow-hidden">
          <div
            className="timer-bar h-full rounded-sm"
            style={{
              width: `${timerPct}%`,
              background: urgent
                ? "#e8716a"
                : "linear-gradient(90deg,#7c3aed,#a855f7)",
            }}
          />
        </div>
        <div className="flex items-center gap-[10px] px-4 py-3 bg-red-bg border border-red-border rounded-[10px] text-xs text-red mb-4">
          <FireIcon s={14} />
          Secret deleted from server. This is the only copy. Save it now.
        </div>
        <div className="bg-surface border border-border rounded-2xl p-7 mb-4">
          <div className="text-[13px] font-medium text-text-dim uppercase tracking-[0.08em] mb-4 flex items-center gap-2">
            <LockIcon s={14} />
            Decrypted secret
          </div>
          <div
            className={`secret-display ${!blurred ? "unblurred" : ""}`}
            onClick={() => setBlurred(false)}
            onContextMenu={(e) => e.preventDefault()}
            title="Click to reveal"
          >
            {blurred ? "Click to reveal" : secret}
          </div>
          {blurred && (
            <div className="text-xs text-text-faint mb-[14px] text-center">
              Screenshot protection active · click to reveal
            </div>
          )}
          <button
            onClick={copy}
            className={`w-full py-[14px] rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 mt-5 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] ${
              copied
                ? "bg-gradient-to-br from-green-bg to-green-bg2"
                : "bg-gradient-to-br from-purple-mid to-purple-deep"
            }`}
          >
            {copied ? <CheckIcon s={16} /> : <CopyIcon s={16} />}
            {copied ? "Copied" : "Copy to clipboard"}
          </button>
          {copied && (
            <div className="text-[11px] text-text-faint text-center mt-2">
              {clipboardCleared
                ? "✓ Clipboard cleared automatically"
                : "Clipboard auto-clears in 60 seconds"}
            </div>
          )}
        </div>
      </div>
    );

  if (state === "needpw")
    return (
      <div className="bg-surface-dark border border-border rounded-2xl p-7 mb-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[linear-gradient(135deg,#1e1028,#160e24)] border border-border-purple rounded-2xl flex items-center justify-center text-purple">
          <LockIcon s={28} />
        </div>
        <div className="text-[18px] font-medium text-text-bright mb-[6px]">
          Password required
        </div>
        <div className="text-[13px] text-text-dim mb-6 leading-[1.6]">
          This secret has a second encryption layer. Enter the password to
          continue.
        </div>
        {error && (
          <div className="flex items-center gap-[10px] px-4 py-3 bg-red-bg border border-red-border rounded-[10px] text-[13px] text-red mb-4">
            <AlertIcon s={14} />
            {error}
          </div>
        )}
        <div className="pw-wrap relative mb-4 text-left">
          <input
            type={showPw ? "text" : "password"}
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && reveal(password)}
            autoComplete="off"
          />
          <button
            className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none text-text-faint cursor-pointer p-1 flex items-center hover:text-purple transition-colors"
            onClick={() => setShowPw((v) => !v)}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <button
          onClick={() => reveal(password)}
          disabled={loading || !password}
          className="w-full py-[14px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <div className="spinner" /> : <LockIcon s={16} />} Decrypt
          secret
        </button>
      </div>
    );

  return (
    <div className="bg-surface-dark border border-border rounded-2xl p-7 mb-4 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-[linear-gradient(135deg,#1e1028,#160e24)] border border-border-purple rounded-2xl flex items-center justify-center text-purple">
        <ShieldIcon s={28} />
      </div>
      <div className="text-[18px] font-medium text-text-bright mb-[6px]">
        You have a secret
      </div>
      <div className="text-[13px] text-text-dim mb-6 leading-[1.6]">
        Enter the code sent to you separately to decrypt it.
        <br />
        <strong>Opening this deletes it from the server permanently.</strong>
      </div>
      <div className="flex items-start gap-[10px] px-4 py-3 bg-teal-bg border border-teal-border rounded-[10px] text-xs text-teal mb-4 leading-[1.6]">
        <KeyIcon s={14} />
        <span>
          The code was sent through a separate channel from this link. Check
          your other messages.
        </span>
      </div>
      {error && (
        <div className="flex items-center gap-[10px] px-4 py-3 bg-red-bg border border-red-border rounded-[10px] text-[13px] text-red mb-4">
          <AlertIcon s={14} />
          {error}
        </div>
      )}
      <div className="text-left mb-4">
        <div className="text-xs text-text-dim mb-2 font-medium">
          Enter your code
        </div>
        <input
          className="code-input"
          placeholder="3X7K-MN2P-5HRV-8CTW"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && reveal()}
          autoComplete="off"
          spellCheck={false}
          data-gramm="false"
          data-gramm_editor="false"
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            letterSpacing: "0.08em",
            padding: "12px 16px",
          }}
        />
      </div>
      <button
        onClick={() => reveal()}
        disabled={loading || !code.trim()}
        className="w-full py-[14px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <div className="spinner" /> : <EyeIcon s={16} />}
        {loading ? "Decrypting..." : "Reveal & delete"}
      </button>
    </div>
  );
}
