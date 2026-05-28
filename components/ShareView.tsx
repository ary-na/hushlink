"use client";

import { useState, useEffect } from "react";
import {
  LockIcon,
  FireIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  CheckIcon,
  CopyIcon,
} from "@components/Icons";
import { EXPIRY_OPTIONS, DECOYS, generateCode } from "@lib/constants";
import { encryptSecret } from "@lib/crypto";
import { apiStore } from "@lib/api";

export type ShareResult = {
  link: string;
  code: string;
  expiry: number;
  passwordProtected: boolean;
};

type StepCopyLinkProps = { link: string; onNext: () => void };

function StepCopyLink({ link, onNext }: StepCopyLinkProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
  };
  return (
    <div className="bg-surface-dark border border-border-purple rounded-2xl p-7 mb-4 animate-fade-up">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 bg-[#1a1828] border border-border-mid rounded-[14px] flex items-center justify-center text-purple">
          <span className="text-xl">1</span>
        </div>
        <div className="text-[17px] font-medium text-text-bright mb-1">
          Copy the link first
        </div>
        <div className="text-[13px] text-text-dim leading-[1.6]">
          Send this to your recipient through any channel. The link alone cannot
          decrypt anything.
        </div>
      </div>
      <div className="flex items-center gap-[10px] bg-surface-link border border-border rounded-[10px] px-[14px] py-3 mb-4">
        <span className="flex-1 font-mono text-xs text-purple overflow-hidden text-ellipsis whitespace-nowrap">
          {link}
        </span>
        <button
          onClick={copy}
          className={`rounded-md px-[10px] py-[6px] cursor-pointer flex items-center gap-[5px] text-xs flex-shrink-0 transition-colors border-none ${
            copied
              ? "bg-green-bg text-green"
              : "bg-[#1e1c2a] text-text-muted hover:bg-border-mid hover:text-text-mid"
          }`}
        >
          {copied ? <CheckIcon s={13} /> : <CopyIcon s={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        onClick={onNext}
        disabled={!copied}
        className="w-full py-[14px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 mt-5 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <CheckIcon s={16} />I copied the link, show me the code
      </button>
      {!copied && (
        <div className="text-xs text-text-faint text-center mt-2">
          Copy the link above first
        </div>
      )}
    </div>
  );
}

type StepCopyCodeProps = { result: ShareResult; onDone: () => void };

function StepCopyCode({ result, onDone }: StepCopyCodeProps) {
  const [copied, setCopied] = useState(false);
  const [clipboardCleared, setCleared] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const wipeOnHide = () => {
      if (document.hidden) navigator.clipboard.writeText("").catch(() => {});
    };
    document.addEventListener("visibilitychange", wipeOnHide);
    return () => document.removeEventListener("visibilitychange", wipeOnHide);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {});
      setCleared(true);
    }, 60000);
  };

  return (
    <div className="bg-surface-dark border border-border-purple rounded-2xl p-7 mb-4 animate-fade-up">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 bg-[#1a1828] border border-border-mid rounded-[14px] flex items-center justify-center text-purple">
          <span className="text-xl">2</span>
        </div>
        <div className="text-[17px] font-medium text-text-bright mb-1">
          Now send the code separately
        </div>
        <div className="text-[13px] text-text-dim leading-[1.6]">
          Send this through a{" "}
          <strong className="text-text-mid">different channel</strong> from the
          link. Text message, phone call, different chat app. Both are needed to
          decrypt.
        </div>
      </div>
      <div className="flex items-center gap-2 px-[14px] py-[10px] bg-[#130f1a] border border-[#2a1f3a] rounded-lg text-xs text-[#9070b8] my-3">
        <AlertIcon s={14} />
        Never send the link and code in the same message or app.
      </div>
      <div className="bg-surface-link border-2 border-dashed border-border-mid rounded-xl p-5 text-center mb-4">
        <div className="font-mono text-[22px] font-medium text-purple tracking-[0.12em] mb-[6px]">
          {result.code}
        </div>
        <div className="text-xs text-text-faint">
          Recipient types this to decrypt
        </div>
      </div>
      <button
        onClick={copy}
        className={`w-full justify-center py-[10px] mb-2 rounded-md cursor-pointer flex items-center gap-[5px] text-xs transition-colors border-none ${
          copied
            ? "bg-green-bg text-green"
            : "bg-[#1e1c2a] text-text-muted hover:bg-border-mid hover:text-text-mid"
        }`}
      >
        {copied ? <CheckIcon s={13} /> : <CopyIcon s={13} />}
        {copied ? "Code copied" : "Copy code"}
      </button>
      {copied && (
        <div className="text-[11px] text-text-faint text-center mt-2">
          {clipboardCleared
            ? "✓ Clipboard cleared automatically"
            : "Clipboard auto-clears in 60s"}
        </div>
      )}
      <button
        onClick={onDone}
        disabled={!copied}
        className="w-full py-[14px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 mt-5 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <CheckIcon s={16} />
        Done, view summary
      </button>
    </div>
  );
}

type Props = { onCreated: (result: ShareResult) => void };

export default function ShareView({ onCreated }: Props) {
  const [secret, setSecret] = useState("");
  const [expiry, setExpiry] = useState(86400);
  const [usePassword, setUsePw] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [pendingResult, setPending] = useState<ShareResult | null>(null);

  const handleCreate = async () => {
    if (!secret.trim()) return;
    setLoading(true);
    setError("");
    try {
      const code = generateCode();
      const payload = await encryptSecret(
        secret,
        code,
        usePassword && password ? password : null,
      );
      const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const decoy =
        DECOYS[crypto.getRandomValues(new Uint32Array(1))[0] % DECOYS.length];
      await apiStore({ id, payload, decoy, expiry });
      const link = `${window.location.origin}${window.location.pathname}#reveal/${id}`;
      setPending({
        link,
        code,
        expiry,
        passwordProtected: usePassword && !!password,
      });
      setSecret("");
      setPassword("");
      setStep("copylink");
    } catch (e) {
      setError(
        (e as Error).message ||
          "Something went wrong. Check your API configuration.",
      );
    }
    setLoading(false);
  };

  if (step === "copylink" && pendingResult)
    return (
      <StepCopyLink
        link={pendingResult.link}
        onNext={() => setStep("copycode")}
      />
    );
  if (step === "copycode" && pendingResult)
    return (
      <StepCopyCode
        result={pendingResult}
        onDone={() => {
          setStep("done");
          onCreated(pendingResult);
        }}
      />
    );

  return (
    <div>
      <div className="bg-surface border border-border rounded-2xl p-7 mb-4">
        <div className="text-[13px] font-medium text-text-dim uppercase tracking-[0.08em] mb-4 flex items-center gap-2">
          <LockIcon s={14} />
          Your secret
        </div>
        <textarea
          placeholder={
            "Paste anything sensitive here...\n\nPasswords, API keys, .env files,\nprivate notes, credentials..."
          }
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          data-gramm="false"
          data-gramm_editor="false"
        />
        <div className="text-xs text-text-ghost text-right mt-[6px] font-mono">
          {secret.length} chars
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-text-dim mb-2 font-medium">
              Expires after
            </label>
            <select value={expiry} onChange={(e) => setExpiry(+e.target.value)}>
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.seconds} value={o.seconds}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-dim mb-2 font-medium">
              Password lock
            </label>
            <div
              className="flex items-center gap-[10px] py-[10px] cursor-pointer"
              onClick={() => setUsePw((v) => !v)}
            >
              <div className={`toggle ${usePassword ? "on" : ""}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="text-[13px] text-text-muted">
                {usePassword ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {usePassword && (
          <div>
            <div className="pw-wrap relative mt-[10px]">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter a password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none text-text-faint cursor-pointer p-1 flex items-center hover:text-purple transition-colors"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className="text-xs text-[#4a4460] mt-2">
              Share this password through a third separate channel.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-[10px] px-4 py-3 bg-red-bg border border-red-border rounded-[10px] text-[13px] text-red mt-4">
            <AlertIcon s={14} />
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !secret.trim()}
          className="w-full py-[14px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-2 mt-5 border-none transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <div className="spinner" /> : <LockIcon s={16} />}
          {loading ? "Encrypting..." : "Create hush link"}
        </button>
      </div>

      <div className="flex flex-col gap-2 px-1">
        {(
          [
            [
              <LockIcon s={14} />,
              "AES-256-GCM encrypted in your browser. Server sees only gibberish.",
            ],
            [
              <FireIcon s={14} />,
              "Deleted the moment the page is opened. One read only.",
            ],
            [
              <KeyIcon s={14} />,
              "Key sent as a separate code, never in the URL. Two channel delivery.",
            ],
          ] as [React.ReactNode, string][]
        ).map(([icon, text], i) => (
          <div
            key={i}
            className="flex items-center gap-[10px] text-xs text-text-faint"
          >
            <span className="text-purple-subtle">{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
