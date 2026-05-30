import { EXPIRY_OPTIONS } from "@lib/constants";
import type { ShareResult } from "@components/ShareView";

export default function ResultView({ result, onReset }: { result: ShareResult; onReset: () => void }) {
  const expiryLabel = EXPIRY_OPTIONS.find(o => o.seconds === result.expiry)?.label ?? "";
  const rows: [string, string][] = [
    ["Encryption",     "AES-256-GCM"],
    ["Key derivation", "PBKDF2 · 310k iterations"],
    ["Delivery",       "Two-channel"],
    ["Expires",        expiryLabel],
    ["Access",         "Single read"],
    ["Password",       result.passwordProtected ? "Yes" : "No"],
  ];

  return (
    <div className="fade-in">
      <div className="text-center mb-7">
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Secret is live</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Link and code delivered separately.</p>
      </div>

      <div className="mb-7">
        {rows.map(([label, value]) => (
          <div key={label} className="row">
            <span className="row-label">{label}</span>
            <span className="row-value">{value}</span>
          </div>
        ))}
      </div>

      <button onClick={onReset} className="btn-secondary">Create another</button>
    </div>
  );
}
