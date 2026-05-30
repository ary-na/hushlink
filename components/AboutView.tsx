const STEPS = [
  { n: "01", t: "Your message is locked before it leaves your device", d: "When you type your secret, it gets scrambled right in your browser using a code only you know. By the time anything reaches our server, we can't read it — it's already locked." },
  { n: "02", t: "You get a link and a separate code", d: "The link alone is useless without the code. You send them through different channels — someone intercepting one channel gets nothing." },
  { n: "03", t: "Opening the link destroys it", d: "The moment the recipient opens the link, the message is permanently deleted from our server. If someone tries the same link later, there's nothing left." },
  { n: "04", t: "Only the right code unlocks it", d: "Without the code you sent separately, the message can't be decrypted — not by us, not by anyone." },
  { n: "05", t: "The secret disappears after 30 seconds", d: "After the message is unlocked, it's visible for 30 seconds only. Then it's wiped from the page entirely." },
  { n: "06", t: "Add a password for extra protection", d: "An optional password adds a third encryption layer. Even with both the link and code, an attacker still can't read anything without it." },
  { n: "07", t: "We don't store anything about you", d: "No accounts, no email addresses, no logs. The only thing we hold briefly is the locked message itself — gone the moment it's opened." },
];

const SPECS: [string, string][] = [
  ["Encryption",    "AES-256-GCM"],
  ["Key derivation","PBKDF2 · 310k iterations"],
  ["Wipe timer",    "30 seconds"],
  ["Clipboard",     "60s auto-clear"],
  ["Delivery",      "Two channels"],
  ["Source code",   "Open source"],
];

export default function AboutView() {
  return (
    <div>
      <p className="section-label">How it works</p>
      <p className="mb-7" style={{ fontSize: 17, fontWeight: 600 }}>Designed so that even we can't read what you send</p>

      <div className="mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.25)", flexShrink: 0, paddingTop: 2 }}>{s.n}</span>
            <div>
              <p className="mb-1" style={{ fontSize: 14, fontWeight: 500 }}>{s.t}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="section-label">Specifications</p>
      <div>
        {SPECS.map(([label, value]) => (
          <div key={label} className="row">
            <span className="row-label">{label}</span>
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
