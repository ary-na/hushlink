const SECTIONS = [
  { title: "Your browser", tips: ["Extensions with clipboard or page-read permissions can silently intercept what you type and copy. Use a private/incognito window, which disables most extensions by default.", "Browsers can sync form data and history to the cloud. Private mode prevents this. Close the tab entirely when done.", "Keep your browser up to date — HushLink relies on the Web Crypto API and unpatched browsers may have vulnerabilities.", "Avoid browser profiles managed by an employer — IT can install extensions or certificate roots that intercept traffic."] },
  { title: "Clipboard managers", tips: ["Apps like Clipy, Alfred, Ditto, and Windows Clipboard History store every copy indefinitely. HushLink auto-clears after 60s, but a clipboard manager may already have saved it.", "Disable your clipboard manager or clear its history immediately after copying a code or revealed secret.", "On mobile, third-party keyboards and accessibility services can read clipboard contents. Use the default keyboard.", "Windows Clipboard History (Win+V) is on by default. Open it and delete the entry after pasting."] },
  { title: "Your screen", tips: ["Screen recording, remote desktop sessions, and VM viewers capture everything. End them before revealing a secret.", "On video calls, screen sharing exposes the address bar, which contains the secret ID. Stop sharing first.", "The blur protection requires a click to remove. Someone watching your screen sees exactly what you see.", "Lock your screen before stepping away. The secret wipes from the page in 30 seconds but the tab stays open."] },
  { title: "Separate channels", tips: ['"Different channel" means a different app and ideally a different device — not just a different thread on the same platform.', "Email + SMS from the same phone is not genuinely separate. A phone call for the code is a stronger combination.", "Do not screenshot the code and send via the same platform as the link. Screenshots sync to cloud libraries.", "A password must travel through a third fully independent channel — ideally in person or by voice call."] },
  { title: "What HushLink cannot protect against", tips: ["A fully compromised device on either end. Client-side encryption cannot help when the adversary controls the device reading the plaintext.", "Physical observation — someone watching your screen, or over-the-shoulder reading of the code.", "Social engineering — an attacker tricking the recipient into sharing the decrypted secret after they have it.", "A lookalike domain designed to steal your secret. Always verify the address bar reads exactly hushlink.app.", "Anything that happens after the recipient reads the secret — forwarding, storing in plaintext, or re-pasting it."] },
];

export default function ConsiderView() {
  return (
    <div>
      <p className="section-label">Security considerations</p>
      <p className="mb-2" style={{ fontSize: 17, fontWeight: 600 }}>Security is a system, not a feature</p>
      <p className="mb-8" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
        HushLink handles encryption, one-time retrieval, and two-channel delivery. The factors below are outside its control.
      </p>

      <div>
        {SECTIONS.map((s, i) => (
          <div key={i} className="py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="mb-4" style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</p>
            <ul className="space-y-3">
              {s.tips.map((tip, j) => (
                <li key={j} className="flex gap-3 items-start">
                  <span style={{ color: "rgba(99,102,241,0.7)", flexShrink: 0, marginTop: 2, fontSize: 14 }}>·</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center mt-7" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
        No tool eliminates risk entirely. The goal is to raise the cost of an attack high enough that your threat model is not feasible.
      </p>
    </div>
  );
}
