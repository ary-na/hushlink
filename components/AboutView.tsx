import { ShieldIcon } from "@components/Icons";

const STEPS = [
  {
    n: "01",
    t: "Your message is locked before it leaves your device",
    d: "When you type your secret, it gets scrambled right in your browser using a code only you know. By the time anything reaches our server, we can't read it — it's already locked.",
  },
  {
    n: "02",
    t: "You get a link and a separate code",
    d: "The link alone is useless without the code. You send them through different channels — for example, the link by email and the code by text message. That way, someone intercepting one channel gets nothing.",
  },
  {
    n: "03",
    t: "Opening the link destroys it",
    d: "The moment the recipient opens the link, the message is permanently deleted from our server. If someone else tries the same link later, there's nothing left to find.",
  },
  {
    n: "04",
    t: "Only the right code unlocks it",
    d: "Without the code you sent separately, the message can't be decrypted — not by us, not by anyone.",
  },
  {
    n: "05",
    t: "The secret disappears from the screen after 30 seconds",
    d: "After the message is unlocked, it's visible for 30 seconds only. Then it's wiped from the page entirely. No scrolling back, no copy left in the browser.",
  },
  {
    n: "06",
    t: "Add a password for extra peace of mind",
    d: "You can add an optional password on top of the code. Even if someone got hold of both the link and the code, they'd still need the password to read anything.",
  },
  {
    n: "07",
    t: "We don't store anything about you",
    d: "No accounts, no email addresses, no logs of who sent what to whom. The only thing we hold — briefly — is the locked message itself, and it's gone the moment it's opened.",
  },
];

const STATS = [
  { label: "Encryption", value: "AES-256-GCM" },
  { label: "Key derivation", value: "PBKDF2 310k" },
  { label: "Wipe timer", value: "30 seconds" },
  { label: "Clipboard", value: "60s auto-clear" },
  { label: "Delivery", value: "Two channels" },
  { label: "Source code", value: "Open source" },
];

export default function AboutView() {
  return (
    <div>
      <div className="bg-surface border border-border rounded-2xl p-7 mb-4">
        <div className="mb-6">
          <div className="inline-flex items-center gap-[6px] px-3 py-[6px] bg-green-surface border border-green-border rounded-full text-[11px] text-green font-medium mb-5">
            <ShieldIcon s={12} />
            Built for privacy by default
          </div>
          <div className="text-xl font-semibold text-text-bright mb-2">
            How HushLink keeps your secret safe
          </div>
          <div className="text-sm text-text-dim leading-[1.7]">
            HushLink is designed so that even we can't read what you send.
            Here's exactly what happens when you share a secret.
          </div>
        </div>
        <div className="flex flex-col">
          {STEPS.map((l, i) => (
            <div
              key={i}
              className={`flex gap-4 py-[14px] ${i > 0 ? "border-t border-[#1a1828]" : ""}`}
            >
              <div className="font-mono text-[11px] text-purple-subtle font-medium flex-shrink-0 pt-[2px]">
                {l.n}
              </div>
              <div>
                <div className="text-sm font-medium text-text-mid mb-1">
                  {l.t}
                </div>
                <div className="text-[13px] text-text-dim leading-[1.7]">
                  {l.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[10px] mb-6">
        {STATS.map((item, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-[10px] px-4 py-[14px] text-center"
          >
            <div className="text-[11px] text-text-faint mb-[6px] uppercase tracking-[0.06em]">
              {item.label}
            </div>
            <div className="text-xs font-medium text-purple font-mono">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
