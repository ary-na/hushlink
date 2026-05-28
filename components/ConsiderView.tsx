import {
  ShieldIcon,
  CopyIcon,
  EyeIcon,
  KeyIcon,
  AlertIcon,
  LockIcon,
  FireIcon,
} from "@components/Icons";

type Section = {
  icon: React.ReactNode;
  title: string;
  accent: string;
  tips: string[];
};

const SECTIONS: Section[] = [
  {
    icon: <ShieldIcon s={16} />,
    title: "Your browser",
    accent: "#7c3aed",
    tips: [
      "Extensions with clipboard or page-read permissions — password managers, Grammarly, translation tools — can silently intercept both what you type and what you copy. Use a private / incognito window, which disables most extensions by default.",
      "Browsers can sync form data and history to the cloud. Private mode prevents this. When done, close the tab entirely rather than just navigating away.",
      "Keep your browser up to date. HushLink relies on the Web Crypto API; unpatched browsers may have cryptographic vulnerabilities that your browser vendor has already fixed.",
      "Avoid browser profiles managed by an employer or institution — IT teams can install extensions or certificate roots that intercept traffic and clipboard content.",
    ],
  },
  {
    icon: <CopyIcon s={16} />,
    title: "Clipboard managers",
    accent: "#0ea5e9",
    tips: [
      "Clipboard manager apps (Clipy, Paste, Alfred on macOS; Ditto, Windows Clipboard History on Windows; Klipper on Linux) capture every copy event and store it indefinitely. HushLink auto-clears your clipboard after 60 seconds, but a clipboard manager may have already saved the entry.",
      "Before copying a code or revealed secret, disable your clipboard manager or clear its history immediately after.",
      "On mobile, third-party keyboards and some accessibility services can also read clipboard contents. Use the device default keyboard when handling secrets.",
      "Windows Clipboard History (Win+V) is on by default for many users. Open it and delete the captured entry after pasting.",
    ],
  },
  {
    icon: <EyeIcon s={16} />,
    title: "Your screen",
    accent: "#f59e0b",
    tips: [
      "Screen recording software, remote desktop sessions (RDP, AnyDesk, TeamViewer), and virtual machine viewers capture everything on screen. End them before revealing a secret.",
      "On video calls, screen sharing exposes the browser address bar, which contains the secret ID. Stop sharing before navigating to a reveal link.",
      "The blur protection on revealed secrets requires an active click to remove. Use it — don't click through just because you feel comfortable. Someone watching your screen sees what you see.",
      "Lock your screen before stepping away from your device after revealing. The secret is wiped from the page in 30 seconds, but the tab itself remains open.",
    ],
  },
  {
    icon: <KeyIcon s={16} />,
    title: "Choosing genuinely separate channels",
    accent: "#10b981",
    tips: [
      '"Different channel" means a different app and ideally a different device or network — not just a different chat thread on the same platform. If both channels live on the same phone, a single device compromise exposes both.',
      "Email + SMS from the same phone is not genuinely separate. A phone call for the code + an encrypted message for the link is a realistic strong combination.",
      "Do not screenshot the code and send it through the same platform as the link. Screenshots are files with metadata and often sync to cloud photo libraries.",
      "If you add a password, it must travel through a third, fully independent channel — ideally in person or by voice call.",
    ],
  },
  {
    icon: <AlertIcon s={16} />,
    title: "The recipient's environment",
    accent: "#f97316",
    tips: [
      "Once the secret is decrypted, it lives in your recipient's browser, clipboard, and potentially clipboard manager. Every risk listed above now applies to their device and you have zero visibility.",
      "Ask recipients to rotate or delete the secret immediately after reading — especially passwords or API keys. A read-once link does not prevent the recipient from storing a copy.",
      "You cannot verify that the recipient's device is clean, their browser has no malicious extensions, or their screen is not being recorded.",
      "If you are sharing credentials they can change (a password, an API key), rotate them after confirming the recipient has received the new value.",
    ],
  },
  {
    icon: <LockIcon s={16} />,
    title: "Using the password option",
    accent: "#a855f7",
    tips: [
      "The optional password wraps the encryption key with a separate PBKDF2 layer. Even if an attacker intercepts both the link and the code, the password stops decryption cold.",
      "Share the password through a third channel that is completely independent from both the link channel and the code channel — ideally by phone call or in person.",
      "Do not send the password and code through the same channel, even if they look like unrelated strings.",
      "A weak password provides weak protection. Use a random phrase or a generated password rather than something guessable.",
    ],
  },
  {
    icon: <FireIcon s={16} />,
    title: "Device fundamentals",
    accent: "#ef4444",
    tips: [
      "Keyloggers capture every keystroke, including the codes and passwords you type. Disk encryption and a screen lock are prerequisites for any secure communication tool, not optional add-ons.",
      "Malware can read browser memory and clipboard before auto-clear fires. Keeping your operating system and apps updated is the best general defence.",
      "Never handle sensitive secrets on a shared, public, or unfamiliar computer — a library machine, a colleague's laptop, a hotel business centre. You cannot know what is installed.",
      "On mobile, avoid using HushLink on a device that has been jailbroken or rooted. These modifications can bypass app isolation and expose clipboard contents to other processes.",
    ],
  },
  {
    icon: <AlertIcon s={16} />,
    title: "What HushLink cannot protect against",
    accent: "#6b7280",
    tips: [
      "A fully compromised device on either end — yours or the recipient's. Client-side encryption cannot help when the device reading the plaintext is controlled by an adversary.",
      "Physical observation: someone watching your screen when you click to reveal, or over-the-shoulder reading of the code.",
      "Social engineering: an attacker who tricks the recipient into sharing the decrypted secret after they have it.",
      "A fake website at a lookalike domain designed to steal your secret before it is encrypted. Always verify the address bar reads exactly hushlink.app before pasting anything sensitive. Bookmark the real address to avoid mistyping.",
      "Certificate-level interception by an employer, ISP, or national infrastructure with the ability to insert a trusted root CA. In that threat model, verify the HTTPS certificate before use.",
      "Anything that happens after the recipient reads the secret — forwarding, storing in plaintext, or inadvertently pasting it somewhere.",
    ],
  },
];

export default function ConsiderView() {
  return (
    <div>
      <div className="bg-surface border border-border-mid rounded-2xl p-7 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-[#1a1828] border border-border-mid rounded-[10px] flex items-center justify-center text-purple-mid">
            <ShieldIcon s={18} />
          </div>
          <div>
            <div className="text-base font-semibold text-text-bright mb-[6px]">
              Security is a system, not a feature
            </div>
            <div className="text-[13px] text-text-dim leading-[1.75]">
              HushLink handles encryption, one-time retrieval, and two-channel
              key delivery. The factors below are outside its control — but they
              determine whether the end-to-end exchange is actually safe.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        {SECTIONS.map((section, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-[10px] px-4 py-[14px] pb-[10px] border-b border-[#1a1828]">
              <span style={{ color: section.accent }}>{section.icon}</span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: section.accent }}
              >
                {section.title}
              </span>
            </div>
            <div className="flex flex-col">
              {section.tips.map((tip, j) => (
                <div
                  key={j}
                  className={`flex gap-[10px] px-4 py-[10px] items-start ${j > 0 ? "border-t border-[#18171f]" : ""}`}
                >
                  <span
                    className="flex-shrink-0 mt-[3px] w-[5px] h-[5px] rounded-full opacity-50"
                    style={{ background: section.accent }}
                  />
                  <span className="text-[13px] text-text-dim leading-[1.7]">
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 px-4 py-[14px] bg-surface border border-border rounded-xl text-xs text-text-faint leading-[1.7] text-center">
        No tool eliminates risk entirely. The goal is to raise the cost of an
        attack high enough that your specific threat model is not feasible.
      </div>
    </div>
  );
}
