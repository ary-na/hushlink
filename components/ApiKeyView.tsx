"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@components/Icons";

type GeneratedKey = { keyId: string; key: string; name: string; createdAt: string };

export default function ApiKeyView() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<GeneratedKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() || "unnamed" }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate key.");
      setGenerated(data); setCopied(false); setRevoked(false);
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  };

  const revoke = async () => {
    if (!generated) return;
    setRevoking(true); setError("");
    try {
      const res = await fetch("/api/keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: generated.key }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to revoke.");
      setRevoked(true);
    } catch (e) { setError((e as Error).message); }
    setRevoking(false);
  };

  const reset = () => { setGenerated(null); setCopied(false); setRevoked(false); setError(""); setName(""); };

  if (generated && revoked) return (
    <div className="fade-in text-center py-4">
      <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
      <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Key revoked</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
        Key <code style={{ fontFamily: "var(--font-mono)" }}>{generated.keyId}</code> is now invalid.
      </p>
      <button onClick={reset} className="btn-secondary">Generate new key</button>
    </div>
  );

  if (generated) return (
    <div className="fade-in">
      <p className="section-label">Key generated</p>
      <p className="mb-1" style={{ fontSize: 17, fontWeight: 600 }}>Save this key now</p>
      <p className="mb-6" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>It will never be shown again.</p>

      <div className="notice notice-amber mb-6">This is the only time your key will be visible.</div>

      <div className="mb-6">
        {[["Key ID", generated.keyId], ["Name", generated.name], ["Created", new Date(generated.createdAt).toLocaleString()]].map(([l, v]) => (
          <div key={l} className="row">
            <span className="row-label">{l}</span>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>{v}</span>
          </div>
        ))}
        <div className="row" style={{ alignItems: "center" }}>
          <span className="row-label">Key</span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.65)", maxWidth: 220 }}>{generated.key}</span>
            <button onClick={() => { navigator.clipboard.writeText(generated.key); setCopied(true); }} className={`btn-copy flex-shrink-0 ${copied ? "copied" : ""}`}>
              {copied ? <CheckIcon s={11} /> : <CopyIcon s={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="notice notice-red mb-5">{error}</div>}

      <div className="flex gap-3 mb-5">
        <button onClick={reset} className="btn-secondary flex-1">Generate another</button>
        <button onClick={revoke} disabled={revoking} className="btn-secondary flex-1" style={{ borderColor: "rgba(248,113,113,0.3)", color: "var(--color-red)" }}>
          {revoking ? <div className="spinner" style={{ borderTopColor: "var(--color-red)" }} /> : null}
          {revoking ? "Revoking…" : "Revoke key"}
        </button>
      </div>

      <p className="text-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
        60 creates/min · 120 reads/min · Revoke immediately if leaked
      </p>
    </div>
  );

  return (
    <div>
      <p className="section-label">API access</p>
      <p className="mb-2" style={{ fontSize: 17, fontWeight: 600 }}>Authenticate programmatically</p>
      <p className="mb-8" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
        API keys unlock higher rate limits and let you integrate with your own tools and scripts.
      </p>

      <div className="mb-6">
        <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 10 }}>
          Label (optional)
        </label>
        <input className="glass-input" type="text" placeholder="e.g. cli, production, staging" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} maxLength={64} />
      </div>

      {error && <div className="notice notice-red mb-5">{error}</div>}

      <div className="divider" />
      <button onClick={generate} disabled={loading} className="btn-primary mb-8">
        {loading ? <div className="spinner" /> : null}
        {loading ? "Generating…" : "Generate key"}
      </button>

      <p className="section-label">Usage</p>
      <div className="code-block mb-6">{`curl -X POST https://hushlink.app/api/secret \\
  -H "Authorization: Bearer hl_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"<16-hex>","payload":{...},"expiry":86400}'`}</div>

      <div className="mb-6">
        {[["Anonymous", "10 creates/min · 20 reads/min"], ["API key", "60 creates/min · 120 reads/min"]].map(([l, v]) => (
          <div key={l} className="row">
            <span className="row-label">{l}</span>
            <span className="row-value">{v}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>CLI coming soon — npm install -g hushlink</p>
    </div>
  );
}
